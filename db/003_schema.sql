/* =========================
   003: Views (base)
========================= */

CREATE VIEW IF NOT EXISTS v_events AS
SELECT
  event_id, user_id, type, label, reason_code,
  ts, day_jst, ym_jst,
  data_json, proof_id, prev_hash_b64u, hash_b64u
FROM heiankyo_events;


/* monthly KPI: 99.9999 cap 方式（固定小数点 x1e4） */
CREATE VIEW IF NOT EXISTS v_monthly_kpis AS
SELECT
  m.user_id,
  m.ym_jst,

  m.total_count,
  m.safe_count,
  m.warning_count,
  m.danger_count,
  m.risk_count,

  /* raw_x1e4 = SAFE率(%) * 10000, 100.0000% => 1000000 */
  CASE
    WHEN m.total_count > 0 THEN (m.safe_count * 1000000 / m.total_count)
    ELSE 0
  END AS raw_x1e4,

  /* cap_x1e4: 最大 99.9999% (= 999999) */
  CASE
    WHEN m.total_count > 0 AND (m.safe_count * 1000000 / m.total_count) > 999999 THEN 999999
    WHEN m.total_count > 0 THEN (m.safe_count * 1000000 / m.total_count)
    ELSE 0
  END AS cap_x1e4,

  /* 表示用（REAL） */
  (CASE
    WHEN m.total_count > 0 AND (m.safe_count * 1000000 / m.total_count) > 999999 THEN 999999
    WHEN m.total_count > 0 THEN (m.safe_count * 1000000 / m.total_count)
    ELSE 0
  END) / 10000.0 AS safe_rate_pct,

  m.spend_count,
  m.transfer_count,
  m.last_event_ts,
  m.last_proof_id

FROM monthly_rollups m;
