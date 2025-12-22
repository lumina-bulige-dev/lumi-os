/* db/003_schema.sql */
/* Reason catalog + Enriched views + Monthly reason analytics + CIA appendix join */

PRAGMA foreign_keys = ON;

/* =========================================
   1) Reason Catalog（コード→表示名・分類）
========================================= */
CREATE TABLE IF NOT EXISTS reason_catalog (
  reason_code   TEXT PRIMARY KEY,
  bucket        TEXT NOT NULL,          /* 'SPEND'/'TRANSFER'/'KYC'/'RISK'/'OTHER' */
  title_ja      TEXT NOT NULL,
  title_en      TEXT,
  severity      TEXT,                   /* 'SAFE'/'WARNING'/'DANGER' (override用・NULL可) */
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at_ts INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reason_bucket ON reason_catalog(bucket);
CREATE INDEX IF NOT EXISTS idx_reason_active ON reason_catalog(is_active);

/* =========================================
   2) Event Enriched View（bucket/title/severity上書き）
   - label は基本そのまま
   - reason_catalog.severity があれば label を上書きして “判定統一”
========================================= */
DROP VIEW IF EXISTS v_events_enriched;

CREATE VIEW v_events_enriched AS
SELECT
  e.event_id,
  e.user_id,
  e.type,
  e.label,
  e.reason_code,
  COALESCE(rc.bucket, 'OTHER') AS bucket,
  COALESCE(rc.title_ja, e.reason_code, 'unknown') AS reason_title_ja,
  COALESCE(rc.title_en, e.reason_code, 'unknown') AS reason_title_en,
  COALESCE(rc.severity, e.label) AS label_effective,
  e.ts,
  e.day_jst,
  e.ym_jst,
  e.data_json,
  e.proof_id,
  e.prev_hash_b64u,
  e.hash_b64u
FROM heiankyo_events e
LEFT JOIN reason_catalog rc
  ON rc.reason_code = e.reason_code
 AND rc.is_active = 1;

/* =========================================
   3) Monthly: bucket別・severity別の集計（InstitutionalにもCustomerにも使う）
========================================= */
DROP VIEW IF EXISTS v_monthly_bucket_stats;

CREATE VIEW v_monthly_bucket_stats AS
SELECT
  user_id,
  ym_jst,
  bucket,
  SUM(CASE WHEN label_effective='SAFE'    THEN 1 ELSE 0 END) AS safe_count,
  SUM(CASE WHEN label_effective='WARNING' THEN 1 ELSE 0 END) AS warning_count,
  SUM(CASE WHEN label_effective='DANGER'  THEN 1 ELSE 0 END) AS danger_count,
  COUNT(*) AS total_count,
  SUM(CASE WHEN reason_code IS NOT NULL AND reason_code<>'' THEN 1 ELSE 0 END) AS reason_count,
  MAX(ts) AS last_event_ts
FROM v_events_enriched
WHERE ym_jst IS NOT NULL AND ym_jst <> ''
GROUP BY user_id, ym_jst, bucket;

/* =========================================
   4) Monthly: reason_code別ランキング（Top N はUI側で LIMIT）
========================================= */
DROP VIEW IF EXISTS v_monthly_reason_rank;

CREATE VIEW v_monthly_reason_rank AS
SELECT
  user_id,
  ym_jst,
  bucket,
  reason_code,
  reason_title_ja,
  label_effective,
  COUNT(*) AS n,
  MAX(ts) AS last_ts
FROM v_events_enriched
WHERE ym_jst IS NOT NULL AND ym_jst <> ''
  AND reason_code IS NOT NULL AND reason_code <> ''
GROUP BY user_id, ym_jst, bucket, reason_code, reason_title_ja, label_effective;

/* =========================================
   5) CIA Appendix（企業監査用）：月次の last_proof_id から proofs を引く
   - B運用: monthly_rollups.last_proof_id を Worker が埋める想定
========================================= */
DROP VIEW IF EXISTS v_cia_appendix;

CREATE VIEW v_cia_appendix AS
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

  p.proof_id,
  p.created_at_ts,
  p.range_from,
  p.range_to,
  p.ruleset_version,
  p.payload_hash_b64u,
  p.kid,
  p.alg,
  p.sig_ts,
  p.status,

  /* 署名本体は“企業だけ”見たいならここに残す */
  p.sig_b64u

FROM v_cia_institutional i
LEFT JOIN proofs p
  ON p.proof_id = i.last_proof_id;

/* =========================================
   6) CIA Customer “読み物”補助（要点だけ）
   - UIはこのテキストをそのままカード表示できる
========================================= */
DROP VIEW IF EXISTS v_cia_customer_story;

CREATE VIEW v_cia_customer_story AS
SELECT
  c.user_id,
  c.ym_jst,
  c.safe_rate_pct,
  c.trust_flag,
  c.strength_score,
  c.institutional_score,
  c.total_count,
  c.danger_count,
  c.risk_count,
  c.last_proof_id,

  CASE
    WHEN c.trust_flag = 1 THEN
      '改ざん検証済み・高信頼。SAFE率 ' || printf('%.4f', c.safe_rate_pct) || '%'
    WHEN c.danger_count > 0 THEN
      '要注意：DANGER が ' || c.danger_count || ' 件あります。'
    WHEN c.risk_count > 0 THEN
      '要確認：疑義イベントが ' || c.risk_count || ' 件あります。'
    ELSE
      '安定傾向。SAFE率 ' || printf('%.4f', c.safe_rate_pct) || '%'
  END AS headline_ja

FROM v_cia_institutional c;

/* =========================================
   7) おすすめ初期データ（任意）
   - 必要ならここをコピって INSERT
========================================= */
/*
INSERT OR IGNORE INTO reason_catalog(reason_code,bucket,title_ja,title_en,severity,is_active,created_at_ts) VALUES
('nomoney_s_spend','SPEND','支出（残高/予算に対して過多）','Spend: budget over','WARNING',1, strftime('%s','now')),
('comeback_m_transfer','TRANSFER','送金（高頻度/高額の兆候）','Transfer: suspicious pattern','WARNING',1, strftime('%s','now')),
('yakuza__s_risk','RISK','反社疑義','Potential sanctions/PEP hit','DANGER',1, strftime('%s','now')),
('name_not_kyc','KYC','名寄せ不一致','Name mismatch','WARNING',1, strftime('%s','now'));
*/
