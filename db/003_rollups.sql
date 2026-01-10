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

CREATE VIEW IF NOT EXISTS v_monthly_kpis AS
SELECT
  user_id,
  ym_jst,
  total_count,
  safe_count,
  warning_count,
  danger_count,
  risk_count,
  spend_count,
  transfer_count,
  last_event_ts,
  last_proof_id,

  /* safe_rate_raw_x1e4: 100.0000% => 1000000 */
  CASE
    WHEN total_count > 0 THEN (safe_count * 1000000) / total_count
    ELSE 0
  END AS safe_rate_raw_x1e4,

  /* cap at 99.9999 => 999999 */
  CASE
    WHEN total_count > 0 AND ((safe_count * 1000000) / total_count) > 999999 THEN 999999
    WHEN total_count > 0 THEN (safe_count * 1000000) / total_count
    ELSE 0
  END AS safe_rate_cap_x1e4,

  /* printable pct (float). If your UI wants integer only, ignore this and format in app. */
  (CASE
    WHEN total_count > 0 AND ((safe_count * 1000000) / total_count) > 999999 THEN 999999
    WHEN total_count > 0 THEN (safe_count * 1000000) / total_count
    ELSE 0
  END) / 10000.0 AS safe_rate_pct

FROM monthly_rollups;
