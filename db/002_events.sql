CREATE TABLE IF NOT EXISTS heiankyo_events (
  event_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,

  type TEXT NOT NULL,
  label TEXT NOT NULL,

  reason_code TEXT,

  ts INTEGER NOT NULL,

  day_jst TEXT NOT NULL,
  ym_jst TEXT NOT NULL,

  data_json TEXT NOT NULL,

  proof_id TEXT,

  prev_hash_b64u TEXT,
  hash_b64u TEXT NOT NULL,

  ip_hash_b64u TEXT,
  ua_hash_b64u TEXT,

  hash_version TEXT NOT NULL DEFAULT 'v1',

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_heiankyo_proof ON heiankyo_events(proof_id, ts DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_heiankyo_user_hash ON heiankyo_events(user_id, hash_b64u);
CREATE INDEX IF NOT EXISTS idx_heiankyo_user_ts ON heiankyo_events(user_id, ts DESC);

CREATE INDEX IF NOT EXISTS idx_heiankyo_user_day ON heiankyo_events(user_id, day_jst);
CREATE INDEX IF NOT EXISTS idx_heiankyo_user_ym  ON heiankyo_events(user_id, ym_jst);
CREATE INDEX IF NOT EXISTS idx_heiankyo_user_ym_label ON heiankyo_events(user_id, ym_jst, label);
CREATE INDEX IF NOT EXISTS idx_heiankyo_reason_ym ON heiankyo_events(reason_code, ym_jst);

CREATE VIEW IF NOT EXISTS v_events AS
SELECT
  event_id, user_id, type, label, reason_code, ts, day_jst, ym_jst,
  data_json, proof_id, prev_hash_b64u, hash_b64u
FROM heiankyo_events;
