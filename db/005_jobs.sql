/* ===== daily_rollups rebuild ===== */
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
  SUM(CASE WHEN e.label='SAFE' THEN 1 ELSE 0 END),
  SUM(CASE WHEN e.label='WARNING' THEN 1 ELSE 0 END),
  SUM(CASE WHEN e.label='DANGER' THEN 1 ELSE 0 END),
  COUNT(*),
  SUM(CASE WHEN e.type IN ('SPEND','EXPENSE','PAYMENT') THEN 1 ELSE 0 END),
  SUM(CASE WHEN e.type IN ('TRANSFER','SEND') THEN 1 ELSE 0 END),
  SUM(CASE WHEN e.reason_code IS NOT NULL AND e.reason_code <> '' THEN 1 ELSE 0 END),
  MAX(e.ts),
  MAX(e.proof_id)
FROM v_events e
WHERE e.day_jst IS NOT NULL AND e.day_jst <> ''
GROUP BY e.user_id, e.day_jst;

/* ===== monthly_rollups upsert ===== */
INSERT INTO monthly_rollups (
  user_id, ym_jst,
  safe_count, warning_count, danger_count, total_count,
  spend_count, transfer_count, risk_count,
  last_event_ts, last_proof_id
)
SELECT
  e.user_id,
  e.ym_jst,
  SUM(CASE WHEN e.label='SAFE' THEN 1 ELSE 0 END),
  SUM(CASE WHEN e.label='WARNING' THEN 1 ELSE 0 END),
  SUM(CASE WHEN e.label='DANGER' THEN 1 ELSE 0 END),
  COUNT(*),
  SUM(CASE WHEN e.type IN ('SPEND','EXPENSE','PAYMENT') THEN 1 ELSE 0 END),
  SUM(CASE WHEN e.type IN ('TRANSFER','SEND') THEN 1 ELSE 0 END),
  SUM(CASE WHEN e.reason_code IS NOT NULL AND e.reason_code <> '' THEN 1 ELSE 0 END),
  MAX(e.ts),
  MAX(e.proof_id)
FROM v_events e
WHERE e.ym_jst IS NOT NULL AND e.ym_jst <> ''
GROUP BY e.user_id, e.ym_jst
ON CONFLICT(user_id, ym_jst) DO UPDATE SET
  safe_count=excluded.safe_count,
  warning_count=excluded.warning_count,
  danger_count=excluded.danger_count,
  total_count=excluded.total_count,
  spend_count=excluded.spend_count,
  transfer_count=excluded.transfer_count,
  risk_count=excluded.risk_count,
  last_event_ts=excluded.last_event_ts,
  last_proof_id=excluded.last_proof_id;
