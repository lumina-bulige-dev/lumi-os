/* =========================
   004: Reason catalog + reasoned view
========================= */

/* reason_code の辞書（UI文言の固定化） */
CREATE TABLE IF NOT EXISTS reason_catalog (
  reason_code TEXT PRIMARY KEY,
  bucket TEXT NOT NULL,
  title_ja TEXT NOT NULL,
  title_en TEXT,
  severity TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at_ts INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reason_bucket ON reason_catalog(bucket);


/* event に bucket を付与（catalog未登録は OTHER） */
CREATE VIEW IF NOT EXISTS v_events_reasoned AS
SELECT
  e.*,
  COALESCE(rc.bucket, 'OTHER') AS bucket,
  COALESCE(rc.title_ja, e.reason_code) AS reason_title_ja,
  COALESCE(rc.title_en, e.reason_code) AS reason_title_en
FROM v_events e
LEFT JOIN reason_catalog rc
  ON rc.reason_code = e.reason_code
 AND rc.is_active = 1;
