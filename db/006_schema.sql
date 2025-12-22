/* db/006_schema.sql */
/* Reason catalog + bucket rollups + CIA(Customer)文章を“理由ベース”で強化 */

PRAGMA foreign_keys = ON;

/* =========================================================
   1) reason_catalog（無ければ作る）
========================================================= */
CREATE TABLE IF NOT EXISTS reason_catalog (
  reason_code   TEXT PRIMARY KEY,
  bucket        TEXT NOT NULL,          /* 'SPEND'/'TRANSFER'/'KYC'/'RISK'/'OTHER' */
  title_ja      TEXT NOT NULL,          /* UI表示名 */
  title_en      TEXT,
  severity      TEXT,                   /* 'SAFE'/'WARNING'/'DANGER' (任意: 上書き用) */
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at_ts INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reason_bucket ON reason_catalog(bucket);
CREATE INDEX IF NOT EXISTS idx_reason_active ON reason_catalog(is_active);

/* =========================================================
   2) （任意）初期カタログ：あなたの例を最小で登録
   - 既に登録済みなら IGNORE で無害
========================================================= */
INSERT OR IGNORE INTO reason_catalog (reason_code, bucket, title_ja, title_en, severity, is_active, created_at_ts) VALUES
('nomoney_s', 'SPEND',    '支出（ノーマネー）', 'Spend (no money)',        'WARNING', 1, strftime('%s','now')),
('comeback_m','TRANSFER', '送金（カムバック）', 'Transfer (comeback)',     'WARNING', 1, strftime('%s','now')),
('yakuza_s',  'RISK',     '反社疑義',          'Anti-social concern',     'DANGER',  1, strftime('%s','now')),
('name_not',  'KYC',      '名寄せ不一致',      'Name mismatch',           'WARNING', 1, strftime('%s','now'));

/* =========================================================
   3) monthly_reason_rollups（月×理由コード）
   - 企業監査用: “何が何回起きたか”
========================================================= */
CREATE TABLE IF NOT EXISTS monthly_reason_rollups (
  user_id     TEXT NOT NULL,
  ym_jst      TEXT NOT NULL,    /* 'YYYY-MM' */
  reason_code TEXT NOT NULL,
  bucket      TEXT NOT NULL,    /* reason_catalog.bucket をコピーしておくと高速 */
  severity    TEXT,             /* reason_catalog.severity（任意） */
  cnt         INTEGER NOT NULL DEFAULT 0,
  last_event_ts INTEGER,
  last_proof_id TEXT,
  PRIMARY KEY (user_id, ym_jst, reason_code)
);

CREATE INDEX IF NOT EXISTS idx_mrr_user_ym ON monthly_reason_rollups(user_id, ym_jst);
CREATE INDEX IF NOT EXISTS idx_mrr_bucket ON monthly_reason_rollups(bucket, ym_jst);
CREATE INDEX IF NOT EXISTS idx_mrr_reason ON monthly_reason_rollups(reason_code, ym_jst);

/* =========================================================
   4) monthly_bucket_rollups（月×bucket）
   - ユーザー向け要約の核: “何系が増えたか”
========================================================= */
CREATE TABLE IF NOT EXISTS monthly_bucket_rollups (
  user_id TEXT NOT NULL,
  ym_jst  TEXT NOT NULL,
  bucket  TEXT NOT NULL,
  cnt     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, ym_jst, bucket)
);

CREATE INDEX IF NOT EXISTS idx_mbr_user_ym ON monthly_bucket_rollups(user_id, ym_jst);

/* =========================================================
   5) rollup生成VIEW（イベント×カタログをJOINして “正” を作る）
   - reason_code が catalogに無い場合は bucket='OTHER'
========================================================= */
DROP VIEW IF EXISTS v_events_reasoned;

CREATE VIEW v_events_reasoned AS
SELECT
  e.event_id,
  e.user_id,
  e.ts,
  e.day_jst,
  e.ym_jst,
  e.type,
  e.label,
  e.reason_code,
  COALESCE(rc.bucket, 'OTHER')     AS bucket,
  rc.title_ja                      AS reason_title_ja,
  rc.severity                      AS reason_severity,
  e.proof_id
FROM heiankyo_events e
LEFT JOIN reason_catalog rc
  ON rc.reason_code = e.reason_code
 AND rc.is_active = 1;

/* =========================================================
   6) rollup再計算（INSERT…SELECT）
   - D1/SQLite コンソールで「1発流す」前提
   - NOTE: 実運用は Worker で “月単位だけ差分更新” が理想
========================================================= */

/* 6-1) monthly_reason_rollups を全再生成（必要なら） */
-- DELETE FROM monthly_reason_rollups;

INSERT INTO monthly_reason_rollups (
  user_id, ym_jst, reason_code, bucket, severity, cnt, last_event_ts, last_proof_id
)
SELECT
  r.user_id,
  r.ym_jst,
  r.reason_code,
  r.bucket,
  r.reason_severity,
  COUNT(*)                          AS cnt,
  MAX(r.ts)                          AS last_event_ts,
  MAX(r.proof_id)                    AS last_proof_id
FROM v_events_reasoned r
WHERE r.ym_jst IS NOT NULL AND r.ym_jst <> ''
  AND r.reason_code IS NOT NULL AND r.reason_code <> ''
GROUP BY r.user_id, r.ym_jst, r.reason_code, r.bucket, r.reason_severity
ON CONFLICT(user_id, ym_jst, reason_code) DO UPDATE SET
  bucket        = excluded.bucket,
  severity      = excluded.severity,
  cnt           = excluded.cnt,
  last_event_ts = excluded.last_event_ts,
  last_proof_id = excluded.last_proof_id;

/* 6-2) monthly_bucket_rollups を生成 */
-- DELETE FROM monthly_bucket_rollups;

INSERT INTO monthly_bucket_rollups (user_id, ym_jst, bucket, cnt)
SELECT
  r.user_id,
  r.ym_jst,
  r.bucket,
  COUNT(*) AS cnt
FROM v_events_reasoned r
WHERE r.ym_jst IS NOT NULL AND r.ym_jst <> ''
  AND r.reason_code IS NOT NULL AND r.reason_code <> ''
GROUP BY r.user_id, r.ym_jst, r.bucket
ON CONFLICT(user_id, ym_jst, bucket) DO UPDATE SET
  cnt = excluded.cnt;

/* =========================================================
   7) CIA Customer を “bucket” で強化
   - 既存 v_cia_customer を置き換え（006でアップグレード）
   - 目的: 数字の羅列 → 「今月は何が起きたか」を短文で出す
========================================================= */
DROP VIEW IF EXISTS v_cia_customer;

CREATE VIEW v_cia_customer AS
WITH bucket AS (
  SELECT
    user_id,
    ym_jst,
    SUM(CASE WHEN bucket='SPEND'    THEN cnt ELSE 0 END) AS spend_flags,
    SUM(CASE WHEN bucket='TRANSFER' THEN cnt ELSE 0 END) AS transfer_flags,
    SUM(CASE WHEN bucket='KYC'      THEN cnt ELSE 0 END) AS kyc_flags,
    SUM(CASE WHEN bucket='RISK'     THEN cnt ELSE 0 END) AS risk_flags,
    SUM(CASE WHEN bucket='OTHER'    THEN cnt ELSE 0 END) AS other_flags
  FROM monthly_bucket_rollups
  GROUP BY user_id, ym_jst
),
top_reason AS (
  /* “今月いちばん多い疑義reason” を1つだけ拾う（説明の核） */
  SELECT
    m.user_id,
    m.ym_jst,
    (SELECT rr.reason_code
     FROM monthly_reason_rollups rr
     WHERE rr.user_id = m.user_id AND rr.ym_jst = m.ym_jst
     ORDER BY rr.cnt DESC, rr.reason_code ASC
     LIMIT 1) AS top_reason_code
  FROM monthly_rollups m
)
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

  COALESCE(b.spend_flags,0)    AS spend_flags,
  COALESCE(b.transfer_flags,0) AS transfer_flags,
  COALESCE(b.kyc_flags,0)      AS kyc_flags,
  COALESCE(b.risk_flags,0)     AS risk_flags,

  tr.top_reason_code,
  rc.title_ja AS top_reason_title_ja,

  /* 見出し（短い） */
  CASE
    WHEN i.trust_flag = 1 THEN '改ざん検証済み・高信頼'
    WHEN i.danger_count > 0 OR COALESCE(b.risk_flags,0) > 0 THEN '重要な注意（リスク系）'
    WHEN COALESCE(b.kyc_flags,0) > 0 THEN '本人確認の注意（名寄せ等）'
    WHEN COALESCE(b.transfer_flags,0) > 0 THEN '送金の注意（要確認）'
    WHEN COALESCE(b.spend_flags,0) > 0 THEN '支出の注意（要確認）'
    ELSE '通常'
  END AS headline_ja,

  /* 本文（ユーザーが読みたくなる文章） */
  CASE
    WHEN i.trust_flag = 1 THEN
      '今月の記録は検証され、重大な危険や疑義が見当たりません。継続するほど評価は安定します。'
    WHEN i.danger_count > 0 OR COALESCE(b.risk_flags,0) > 0 THEN
      'リスク系の注意が含まれます。必要なら根拠を添えて訂正/再検証してください。'
    WHEN COALESCE(b.kyc_flags,0) > 0 THEN
      '本人確認（名寄せなど）に注意点があります。手続きの再確認が推奨です。'
    WHEN COALESCE(b.transfer_flags,0) > 0 THEN
      '送金に関する注意点があります。相手先・金額・手数料の整合を確認してください。'
    WHEN COALESCE(b.spend_flags,0) > 0 THEN
      '支出に関する注意点があります。生活費/裁量費の見直しで改善が見えます。'
    ELSE
      '今月の記録は通常範囲です。継続して積み上げると評価が安定します。'
  END AS body_ja,

  /* 追加の一言（トップ理由がある場合だけ） */
  CASE
    WHEN tr.top_reason_code IS NOT NULL AND tr.top_reason_code <> '' THEN
      ('今月の主な注意: ' || COALESCE(rc.title_ja, tr.top_reason_code))
    ELSE NULL
  END AS highlight_ja

FROM v_cia_institutional i
LEFT JOIN bucket b
  ON b.user_id = i.user_id AND b.ym_jst = i.ym_jst
LEFT JOIN top_reason tr
  ON tr.user_id = i.user_id AND tr.ym_jst = i.ym_jst
LEFT JOIN reason_catalog rc
  ON rc.reason_code = tr.top_reason_code;

/* =========================================================
   8) 最新月ビュー（UI用）
========================================================= */
DROP VIEW IF EXISTS v_cia_customer_latest;

CREATE VIEW v_cia_customer_latest AS
SELECT c.*
FROM v_cia_customer c
JOIN (
  SELECT user_id, MAX(ym_jst) AS max_ym
  FROM v_cia_customer
  GROUP BY user_id
) x
ON x.user_id = c.user_id AND x.max_ym = c.ym_jst;
