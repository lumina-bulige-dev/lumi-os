-- db/002_schema.sql
-- LUMINA CIA Rollups / Views / “銀行が好きな99.9999”固定化セット
-- 前提: 001_schema.sql 済み（heiankyo_events / daily_rollups / monthly_rollups / proofs など存在）

PRAGMA foreign_keys = ON;

-- =========================
-- 0) Safety: 列追加（既にあるなら無視してOK）
-- D1/SQLiteは IF NOT EXISTS が ADD COLUMN に効かないので、必要時だけ流す想定。
-- =========================
-- ALTER TABLE daily_rollups   ADD COLUMN risk_count INTEGER NOT NULL DEFAULT 0;
-- ALTER TABLE monthly_rollups ADD COLUMN risk_count INTEGER NOT NULL DEFAULT 0;

-- =========================
-- 1) Rawイベント正規化 View（アプリ側の type/label 揺れ吸収）
-- =========================
DROP VIEW IF EXISTS v_events;

CREATE VIEW v_events AS
SELECT
  event_id,
  user_id,
  -- type の揺れを寄せる（必要に応じて増やす）
  CASE
    WHEN type IN ('EXPENSE','PAYMENT') THEN 'SPEND'
    WHEN type IN ('SEND')              THEN 'TRANSFER'
    ELSE type
  END AS type,
  label,
  reason_code,
  ts,
  day_jst,
  ym_jst,
  data_json,
  proof_id,
  prev_hash_b64u,
  hash_b64u
FROM heiankyo_events;

-- =========================
-- 2) Rollup再計算（B運用: last_proof_id は別途UPDATEで良い）
-- =========================
-- 2-1) Daily
DELETE FROM daily_rollups;

INSERT INTO daily_rollups (
  user_id, day_jst,
  safe_count, warning_count, danger_count, total_count,
  spend_count, transfer_count, risk_count,
  last_event_ts, last_proof_id
)
SELECT
  e.user_id,
  e.day_jst,
  SUM(CASE WHEN e.label='SAFE'    THEN 1 ELSE 0 END) AS safe_count,
  SUM(CASE WHEN e.label='WARNING' THEN 1 ELSE 0 END) AS warning_count,
  SUM(CASE WHEN e.label='DANGER'  THEN 1 ELSE 0 END) AS danger_count,
  COUNT(*) AS total_count,
  SUM(CASE WHEN e.type='SPEND'    THEN 1 ELSE 0 END) AS spend_count,
  SUM(CASE WHEN e.type='TRANSFER' THEN 1 ELSE 0 END) AS transfer_count,
  SUM(CASE WHEN e.reason_code IS NOT NULL AND e.reason_code<>'' THEN 1 ELSE 0 END) AS risk_count,
  MAX(e.ts) AS last_event_ts,
  MAX(e.proof_id) AS last_proof_id
FROM v_events e
WHERE e.day_jst IS NOT NULL AND e.day_jst <> ''
GROUP BY e.user_id, e.day_jst;

-- 2-2) Monthly
DELETE FROM monthly_rollups;

INSERT INTO monthly_rollups (
  user_id, ym_jst,
  safe_count, warning_count, danger_count, total_count,
  spend_count, transfer_count, risk_count,
  last_event_ts, last_proof_id
)
SELECT
  e.user_id,
  e.ym_jst,
  SUM(CASE WHEN e.label='SAFE'    THEN 1 ELSE 0 END) AS safe_count,
  SUM(CASE WHEN e.label='WARNING' THEN 1 ELSE 0 END) AS warning_count,
  SUM(CASE WHEN e.label='DANGER'  THEN 1 ELSE 0 END) AS danger_count,
  COUNT(*) AS total_count,
  SUM(CASE WHEN e.type='SPEND'    THEN 1 ELSE 0 END) AS spend_count,
  SUM(CASE WHEN e.type='TRANSFER' THEN 1 ELSE 0 END) AS transfer_count,
  SUM(CASE WHEN e.reason_code IS NOT NULL AND e.reason_code<>'' THEN 1 ELSE 0 END) AS risk_count,
  MAX(e.ts) AS last_event_ts,
  MAX(e.proof_id) AS last_proof_id
FROM v_events e
WHERE e.ym_jst IS NOT NULL AND e.ym_jst <> ''
GROUP BY e.user_id, e.ym_jst;

-- =========================
-- 3) KPI View（月次）: safe_rate を “raw_x1e4 / cap_x1e4 / pct” で出す
--   - raw_x1e4: 100.0000% => 1,000,000（= 100*10,000）
--   - cap_x1e4: 上限 999,999（= 99.9999%）
--   - safe_rate_pct: 小数4桁のパーセント文字列を数値で返す（例 99.9999）
-- =========================
DROP VIEW IF EXISTS v_monthly_kpis;

CREATE VIEW v_monthly_kpis AS
SELECT
  m.user_id,
  m.ym_jst,
  m.total_count,
  m.safe_count,
  m.warning_count,
  m.danger_count,
  m.risk_count,
  m.spend_count,
  m.transfer_count,
  m.last_event_ts,
  m.last_proof_id,

  -- raw_x1e4: 100.0000% => 1,000,000
  CASE
    WHEN m.total_count > 0 THEN CAST( (1000000 * m.safe_count) / m.total_count AS INTEGER )
    ELSE 0
  END AS safe_rate_raw_x1e4,

  -- cap_x1e4: 99.9999% 上限
  CASE
    WHEN m.total_count > 0 THEN
      CASE
        WHEN CAST( (1000000 * m.safe_count) / m.total_count AS INTEGER ) > 999999 THEN 999999
        ELSE CAST( (1000000 * m.safe_count) / m.total_count AS INTEGER )
      END
    ELSE 0
  END AS safe_rate_cap_x1e4,

  -- safe_rate_pct: cap_x1e4 / 10000（= 小数4桁%）
  CASE
    WHEN m.total_count > 0 THEN
      (
        CASE
          WHEN CAST( (1000000 * m.safe_count) / m.total_count AS INTEGER ) > 999999 THEN 999999
          ELSE CAST( (1000000 * m.safe_count) / m.total_count AS INTEGER )
        END
      ) / 10000.0
    ELSE 0.0
  END AS safe_rate_pct,

  -- danger_rate_pct（参考。小数1桁で十分ならUI側で丸め）
  CASE
    WHEN m.total_count > 0 THEN (100.0 * m.danger_count) / m.total_count
    ELSE 0.0
  END AS danger_rate_pct

FROM monthly_rollups m;

-- =========================
-- 4) Institutional View（企業/機械向け）
--   A=月別主軸（safe_rate 等）
--   B=補助（danger/risk など）
--   (a && b) + c
--     a && b: trust_flag（例: 98%以上 + danger=0 + risk=0）
--     c: strength_score（継続月数 + 母数log）
-- =========================
DROP VIEW IF EXISTS v_cia_institutional;

CREATE VIEW v_cia_institutional AS
SELECT
  k.user_id,
  k.ym_jst,

  -- A: KPI（主軸）
  k.safe_rate_pct,
  k.safe_rate_raw_x1e4,
  k.safe_rate_cap_x1e4,

  -- B: 補助（監査的に必要）
  k.total_count,
  k.danger_count,
  k.risk_count,
  k.warning_count,
  k.spend_count,
  k.transfer_count,
  k.last_event_ts,
  k.last_proof_id,

  -- (a && b): trust_flag
  CASE
    WHEN k.safe_rate_pct >= 98.0 AND k.danger_count = 0 AND k.risk_count = 0 THEN 1
    ELSE 0
  END AS trust_flag,

  -- c: strength_score
  (
    10 * (
      SELECT COUNT(*)
      FROM monthly_rollups m2
      WHERE m2.user_id = k.user_id AND m2.total_count > 0
    )
    + CAST(
        10 * (
          CASE
            WHEN k.total_count > 0 THEN log(k.total_count + 1)
            ELSE 0
          END
        ) AS INTEGER
      )
  ) AS strength_score,

  -- institutional_score = trust_flag * 100 + strength_score（超単純で強い）
  (CASE WHEN (k.safe_rate_pct >= 98.0 AND k.danger_count=0 AND k.risk_count=0) THEN 100 ELSE 0 END)
  + (
    10 * (
      SELECT COUNT(*)
      FROM monthly_rollups m3
      WHERE m3.user_id = k.user_id AND m3.total_count > 0
    )
    + CAST(
        10 * (
          CASE
            WHEN k.total_count > 0 THEN log(k.total_count + 1)
            ELSE 0
          END
        ) AS INTEGER
      )
  ) AS institutional_score

FROM v_monthly_kpis k;

-- =========================
-- 5) Customer View（ユーザー向け文章化テンプレ：UIは表示するだけ）
-- =========================
DROP VIEW IF EXISTS v_cia_customer_text;

CREATE VIEW v_cia_customer_text AS
SELECT
  i.user_id,
  i.ym_jst,
  i.safe_rate_pct,
  i.trust_flag,
  i.strength_score,
  i.institutional_score,
  i.total_count,
  i.danger_count,
  i.risk_count,
  i.last_proof_id,

  CASE
    WHEN i.trust_flag = 1 THEN
      '改ざん検証済み・高信頼（SAFE率 ' || printf('%.4f', i.safe_rate_pct) || '%）'
    WHEN i.danger_count > 0 THEN
      '注意：危険イベントあり（DANGER ' || i.danger_count || '件）'
    WHEN i.risk_count > 0 THEN
      '要確認：疑義イベントあり（' || i.risk_count || '件）'
    ELSE
      '安定傾向（SAFE率 ' || printf('%.4f', i.safe_rate_pct) || '%）'
  END AS summary_ja,

  -- 銀行が好きな99.9999ネタ（出したいなら）
  CASE
    WHEN i.safe_rate_cap_x1e4 = 999999 THEN
      '銀行が好きな 99.9999% です。残り 0.0001% は「融資不実行」の言い訳枠。'
    ELSE
      '安全性スコアは ' || printf('%.4f', i.safe_rate_pct) || '% です。'
  END AS banker_caption_ja

FROM v_cia_institutional i;

-- =========================
-- 6) Rollup更新用メモ（B運用）
-- proofs 作成後に、Worker側で「range_from/range_to を取得して」対象月の last_proof_id を UPDATE
-- ※ SQLファイルでは bind できないので、手動 or Worker実装で使う。
-- =========================
-- UPDATE monthly_rollups
-- SET last_proof_id = :proofId
-- WHERE user_id = :userId
--   AND ym_jst >= substr(:rangeFrom, 1, 7)
--   AND ym_jst <= substr(:rangeTo,   1, 7);
