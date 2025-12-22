/* db/005_schema.sql */
/* CIA Views: Customer Insight / Institutional Audit を DB 側で固定化 */

PRAGMA foreign_keys = ON;

/* =========================================================
   0) Utility
   - 日次 / 月次が無い月も UI が壊れないように v_events / rollups を前提
   - v_monthly_kpis が既にある前提（あなたの現状に合わせた）
========================================================= */

/* =========================================================
   1) Monthly KPIs (もし v_monthly_kpis が無い環境向け保険)
   - 既にあるならこのブロックは "IF NOT EXISTS" で無害
========================================================= */
CREATE VIEW IF NOT EXISTS v_monthly_kpis AS
SELECT
  user_id,
  ym_jst,
  total_count,
  safe_count,
  warning_count,
  danger_count,
  risk_count,
  /* 0-100 の普通の%（表示用） */
  CASE
    WHEN total_count > 0 THEN (100.0 * safe_count / total_count)
    ELSE 0
  END AS safe_rate_raw,
  CASE
    WHEN total_count > 0 THEN (100.0 * danger_count / total_count)
    ELSE 0
  END AS danger_rate_raw,
  spend_count,
  transfer_count,
  last_event_ts,
  last_proof_id
FROM monthly_rollups;

/* =========================================================
   2) Safe rate cap (銀行が好きな 99.9999)
   - raw_x1e4: 100% を 1,000,000 (=100.0000*1e4) で扱う
   - cap_x1e4: 上限 999,999 (=99.9999%)
   - safe_rate_pct: 99.9999 を返す（文字列じゃなく数値）
========================================================= */
DROP VIEW IF EXISTS v_monthly_kpis_capped;

CREATE VIEW v_monthly_kpis_capped AS
SELECT
  mk.user_id,
  mk.ym_jst,
  mk.total_count,
  mk.safe_count,
  mk.warning_count,
  mk.danger_count,
  mk.risk_count,
  mk.spend_count,
  mk.transfer_count,
  mk.last_event_ts,
  mk.last_proof_id,

  /* 100% を 1,000,000 (=100.0000*1e4) にする */
  CAST(
    CASE
      WHEN mk.total_count > 0 THEN (1000000.0 * mk.safe_count / mk.total_count)
      ELSE 0
    END
    AS INTEGER
  ) AS raw_x1e4,

  /* 上限を 999,999 (=99.9999) にキャップ */
  CASE
    WHEN
      CAST(
        CASE
          WHEN mk.total_count > 0 THEN (1000000.0 * mk.safe_count / mk.total_count)
          ELSE 0
        END
        AS INTEGER
      ) > 999999
    THEN 999999
    ELSE CAST(
      CASE
        WHEN mk.total_count > 0 THEN (1000000.0 * mk.safe_count / mk.total_count)
        ELSE 0
      END
      AS INTEGER
    )
  END AS cap_x1e4,

  /* cap_x1e4 を 99.9999 に戻す */
  (CASE
    WHEN
      CAST(
        CASE
          WHEN mk.total_count > 0 THEN (1000000.0 * mk.safe_count / mk.total_count)
          ELSE 0
        END
        AS INTEGER
      ) > 999999
    THEN 999999
    ELSE CAST(
      CASE
        WHEN mk.total_count > 0 THEN (1000000.0 * mk.safe_count / mk.total_count)
        ELSE 0
      END
      AS INTEGER
    )
  END) / 10000.0 AS safe_rate_pct

FROM v_monthly_kpis mk;

/* =========================================================
   3) CIA Institutional (企業向け)
   - A=月別を主軸: safe_rate_pct
   - B=補助: danger_count / risk_count
   - (a && b) + c: trust_flag + strength_score
========================================================= */
DROP VIEW IF EXISTS v_cia_institutional;

CREATE VIEW v_cia_institutional AS
SELECT
  k.user_id,
  k.ym_jst,

  /* A（主軸） */
  k.safe_rate_pct,

  /* B（補助） */
  k.total_count,
  k.danger_count,
  k.risk_count,
  k.spend_count,
  k.transfer_count,
  k.last_event_ts,
  k.last_proof_id,

  /* a && b: 「高信頼」の機械判定 */
  CASE
    WHEN k.safe_rate_pct >= 98.0 AND k.danger_count = 0 AND k.risk_count = 0 THEN 1
    ELSE 0
  END AS trust_flag,

  /* c: 強度（ログ母数×継続月数）
     - 月数: total_count>0 の月数
     - 母数: total_count を軽く効かせる（log相当が無い環境でも動く形）
     - ここは後で差し替え前提で OK（まず “壊れずに動く” を優先）
  */
  (
    10 * (
      SELECT COUNT(*)
      FROM monthly_rollups m2
      WHERE m2.user_id = k.user_id
        AND m2.total_count > 0
    )
    +
    CASE
      WHEN k.total_count >= 1000 THEN 30
      WHEN k.total_count >= 300  THEN 20
      WHEN k.total_count >= 100  THEN 15
      WHEN k.total_count >= 30   THEN 10
      WHEN k.total_count >= 10   THEN 6
      WHEN k.total_count >= 3    THEN 3
      WHEN k.total_count >= 1    THEN 1
      ELSE 0
    END
  ) AS strength_score,

  /* institutional_score: trust_flag をベースに “(a && b)+c” を数値化 */
  (
    (CASE
      WHEN k.safe_rate_pct >= 98.0 AND k.danger_count = 0 AND k.risk_count = 0 THEN 100
      ELSE 0
     END)
    +
    (
      10 * (
        SELECT COUNT(*)
        FROM monthly_rollups m3
        WHERE m3.user_id = k.user_id
          AND m3.total_count > 0
      )
    )
  ) AS institutional_score

FROM v_monthly_kpis_capped k;

/* =========================================================
   4) CIA Customer (ユーザー向け文章化)
   - UI はこの VIEW をそのまま表示すれば良い
   - "生データの羅列" を避けるための翻訳レイヤ
========================================================= */
DROP VIEW IF EXISTS v_cia_customer;

CREATE VIEW v_cia_customer AS
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

  /* 見出し用（短文） */
  CASE
    WHEN i.trust_flag = 1 THEN '改ざん検証済み・高信頼'
    WHEN i.danger_count > 0 THEN '危険イベントあり（要確認）'
    WHEN i.risk_count > 0 THEN 'リスク疑義あり（要確認）'
    ELSE '通常'
  END AS headline_ja,

  /* 説明文（Customer版） */
  CASE
    WHEN i.trust_flag = 1 THEN
      'この月の記録は検証され、重大な危険や疑義が見当たりません。継続すると信用の積み上げになります。'
    WHEN i.danger_count > 0 THEN
      '危険イベントが検出されています。内容を確認し、再発防止の行動ログを残すと改善が見えます。'
    WHEN i.risk_count > 0 THEN
      '反社疑義・名寄せ不一致などの疑義が含まれています。必要なら根拠を添えて訂正/再検証してください。'
    ELSE
      '今月の記録は通常範囲です。継続して記録を積み上げると評価が安定します。'
  END AS body_ja

FROM v_cia_institutional i;

/* =========================================================
   5) 便利: 最新月だけサッと取れる VIEW（UI用）
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
