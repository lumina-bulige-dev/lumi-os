/* =========================
   002: Rollups
========================= */

CREATE TABLE IF NOT EXISTS daily_rollups (
  user_id TEXT NOT NULL,
  day_jst TEXT NOT NULL,

  safe_count INTEGER NOT NULL DEFAULT 0,
  warning_count INTEGER NOT NULL DEFAULT 0,
  danger_count INTEGER NOT NULL DEFAULT 0,
  total_count INTEGER NOT NULL DEFAULT 0,

  spend_count INTEGER NOT NULL DEFAULT 0,
  transfer_count INTEGER NOT NULL DEFAULT 0,

  risk_count INTEGER NOT NULL DEFAULT 0,

  last_event_ts INTEGER,
  last_proof_id TEXT,

  PRIMARY KEY (user_id, day_jst)
);

CREATE INDEX IF NOT EXISTS idx_daily_user_day ON daily_rollups(user_id, day_jst);


CREATE TABLE IF NOT EXISTS monthly_rollups (
  user_id TEXT NOT NULL,
  ym_jst TEXT NOT NULL,

  safe_count INTEGER NOT NULL DEFAULT 0,
  warning_count INTEGER NOT NULL DEFAULT 0,
  danger_count INTEGER NOT NULL DEFAULT 0,
  total_count INTEGER NOT NULL DEFAULT 0,

  spend_count INTEGER NOT NULL DEFAULT 0,
  transfer_count INTEGER NOT NULL DEFAULT 0,

  risk_count INTEGER NOT NULL DEFAULT 0,

  last_event_ts INTEGER,
  last_proof_id TEXT,

  PRIMARY KEY (user_id, ym_jst)
);

CREATE INDEX IF NOT EXISTS idx_monthly_user_ym ON monthly_rollups(user_id, ym_jst);


/* 月×bucket の集計（SPEND/TRANSFER/KYC/RISK/NOTEなど） */
CREATE TABLE IF NOT EXISTS monthly_bucket_rollups (
  user_id TEXT NOT NULL,
  ym_jst TEXT NOT NULL,
  bucket TEXT NOT NULL,
  cnt INTEGER NOT NULL DEFAULT 0,
  danger_cnt INTEGER NOT NULL DEFAULT 0,
  risk_cnt INTEGER NOT NULL DEFAULT 0,
  last_event_ts INTEGER,
  last_proof_id TEXT,
  PRIMARY KEY (user_id, ym_jst, bucket)
);

CREATE INDEX IF NOT EXISTS idx_mbr_user_ym ON monthly_bucket_rollups(user_id, ym_jst);
CREATE INDEX IF NOT EXISTS idx_mbr_bucket ON monthly_bucket_rollups(bucket);


/* 月×reason_code の集計（トップ要因抽出用） */
CREATE TABLE IF NOT EXISTS monthly_reason_rollups (
  user_id TEXT NOT NULL,
  ym_jst TEXT NOT NULL,
  reason_code TEXT NOT NULL,
  bucket TEXT NOT NULL DEFAULT 'OTHER',
  cnt INTEGER NOT NULL DEFAULT 0,
  danger_cnt INTEGER NOT NULL DEFAULT 0,
  risk_cnt INTEGER NOT NULL DEFAULT 0,
  last_event_ts INTEGER,
  last_proof_id TEXT,
  PRIMARY KEY (user_id, ym_jst, reason_code)
);

CREATE INDEX IF NOT EXISTS idx_mrr_user_ym ON monthly_reason_rollups(user_id, ym_jst);
CREATE INDEX IF NOT EXISTS idx_mrr_bucket ON monthly_reason_rollups(bucket);
