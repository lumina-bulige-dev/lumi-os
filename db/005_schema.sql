/* =========================
   005: Rollup refresh SQL (run by Worker / cron / manual)
========================= */

/* daily_rollups refresh (全量) */
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
  SUM(CASE WHEN e.reason_code IS NOT NULL AND e.reason_code<>'' THEN 1 ELSE 0 END),
  MAX(e.ts),
  MAX(e.proof_id)
FROM v_events_reasoned e
WHERE e.day_jst IS NOT NULL AND e.day_jst <> ''
GROUP BY e.user_id, e.day_jst;


/* monthly_rollups refresh (全量) */
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
  SUM(CASE WHEN e.label='SAFE' THEN 1 ELSE 0 END),
  SUM(CASE WHEN e.label='WARNING' THEN 1 ELSE 0 END),
  SUM(CASE WHEN e.label='DANGER' THEN 1 ELSE 0 END),
  COUNT(*),
  SUM(CASE WHEN e.type IN ('SPEND','EXPENSE','PAYMENT') THEN 1 ELSE 0 END),
  SUM(CASE WHEN e.type IN ('TRANSFER','SEND') THEN 1 ELSE 0 END),
  SUM(CASE WHEN e.reason_code IS NOT NULL AND e.reason_code<>'' THEN 1 ELSE 0 END),
  MAX(e.ts),
  MAX(e.proof_id)
FROM v_events_reasoned e
WHERE e.ym_jst IS NOT NULL AND e.ym_jst <> ''
GROUP BY e.user_id, e.ym_jst;


/* monthly_bucket_rollups refresh (全量) */
DELETE FROM monthly_bucket_rollups;

INSERT INTO monthly_bucket_rollups (
  user_id, ym_jst, bucket,
  cnt, danger_cnt, risk_cnt,
  last_event_ts, last_proof_id
)
SELECT
  e.user_id,
  e.ym_jst,
  e.bucket,
  COUNT(*) AS cnt,
  SUM(CASE WHEN e.label='DANGER' THEN 1 ELSE 0 END) AS danger_cnt,
  SUM(CASE WHEN e.reason_code IS NOT NULL AND e.reason_code<>'' THEN 1 ELSE 0 END) AS risk_cnt,
  MAX(e.ts) AS last_event_ts,
  MAX(e.proof_id) AS last_proof_id
FROM v_events_reasoned e
WHERE e.ym_jst IS NOT NULL AND e.ym_jst <> ''
GROUP BY e.user_id, e.ym_jst, e.bucket;


/* monthly_reason_rollups refresh (全量) */
DELETE FROM monthly_reason_rollups;

INSERT INTO monthly_reason_rollups (
  user_id, ym_jst, reason_code, bucket,
  cnt, danger_cnt, risk_cnt,
  last_event_ts, last_proof_id
)
SELECT
  e.user_id,
  e.ym_jst,
  e.reason_code,
  e.bucket,
  COUNT(*) AS cnt,
  SUM(CASE WHEN e.label='DANGER' THEN 1 ELSE 0 END) AS danger_cnt,
  SUM(CASE WHEN e.reason_code IS NOT NULL AND e.reason_code<>'' THEN 1 ELSE 0 END) AS risk_cnt,
  MAX(e.ts) AS last_event_ts,
  MAX(e.proof_id) AS last_proof_id
FROM v_events_reasoned e
WHERE e.ym_jst IS NOT NULL AND e.ym_jst <> ''
  AND e.reason_code IS NOT NULL AND e.reason_code <> ''
GROUP BY e.user_id, e.ym_jst, e.reason_code, e.bucket;
