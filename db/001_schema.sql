-- db/001_schema.sql
-- LUMINA CIA Unified Schema (Cloudflare D1 / SQLite)

PRAGMA foreign_keys = ON;

-- =========================
-- users
-- =========================
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  nickname      TEXT NOT NULL,
  age_band      TEXT,
  income_band   TEXT,
  savings_band  TEXT,
  debt_band     TEXT,
  main_goal     TEXT,
  created_at    TEXT NOT NULL,     -- ISO8601 (app)
  created_at_ts INTEGER,           -- UTC epoch seconds (optional)
  day_jst       TEXT,              -- 'YYYY-MM-DD' (app computed)
  ym_jst        TEXT               -- 'YYYY-MM' (app computed)
);

CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_created_ts ON users(created_at_ts);
CREATE INDEX IF NOT EXISTS idx_users_day_jst     ON users(day_jst);
CREATE INDEX IF NOT EXISTS idx_users_ym_jst      ON users(ym_jst);

-- =========================
-- heiankyo_events (Raw events: single source of truth)
-- =========================
CREATE TABLE IF NOT EXISTS heiankyo_events (
  event_id      TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  type          TEXT NOT NULL,      -- SPEND/TRANSFER/KYC/RISK/NOTE (運用で縛る)
  ts            INTEGER NOT NULL,   -- UTC epoch seconds
  data_json     TEXT NOT NULL,      -- raw payload (JSON string)
  proof_id      TEXT,               -- linked proof (optional)
  prev_hash_b64u TEXT,              -- chain prev hash (optional)
  hash_b64u     TEXT NOT NULL,      -- chain hash
  ip_hash_b64u  TEXT,
  ua_hash_b64u  TEXT,
  hash_version  TEXT NOT NULL DEFAULT 'v1',
  day_jst       TEXT,               -- 'YYYY-MM-DD' (app computed)
  ym_jst        TEXT,               -- 'YYYY-MM' (app computed)
  label         TEXT,               -- SAFE/WARNING/DANGER (運用で縛る)
  reason_code   TEXT,               -- lower_snake (NULL OK)

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_heiankyo_user_hash ON heiankyo_events(user_id, hash_b64u);
CREATE INDEX IF NOT EXISTS idx_heiankyo_user_ts    ON heiankyo_events(user_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_heiankyo_user_day   ON heiankyo_events(user_id, day_jst);
CREATE INDEX IF NOT EXISTS idx_heiankyo_user_ym    ON heiankyo_events(user_id, ym_jst);
CREATE INDEX IF NOT EXISTS idx_heiankyo_user_ym_label ON heiankyo_events(user_id, ym_jst, label);
CREATE INDEX IF NOT EXISTS idx_heiankyo_reason_ym  ON heiankyo_events(reason_code, ym_jst);
CREATE INDEX IF NOT EXISTS idx_heiankyo_proof      ON heiankyo_events(proof_id, ts DESC);

-- =========================
-- proofs (Signed proof meta)
-- =========================
CREATE TABLE IF NOT EXISTS proofs (
  proof_id          TEXT PRIMARY KEY,
  user_id           TEXT NOT NULL,
  created_at_ts     INTEGER NOT NULL, -- UTC epoch seconds
  range_from        TEXT NOT NULL,    -- 'YYYY-MM-DD' (JST)
  range_to          TEXT NOT NULL,    -- 'YYYY-MM-DD' (JST)

  safe_count        INTEGER NOT NULL,
  warning_count     INTEGER NOT NULL,
  danger_count      INTEGER NOT NULL,
  total_count       INTEGER NOT NULL,

  ruleset_version   TEXT NOT NULL,
  payload_hash_b64u TEXT NOT NULL,
  payload_b64u      TEXT,             -- optional (store if you want full payload)
  sig_b64u          TEXT NOT NULL,
  kid               TEXT NOT NULL,
  alg               TEXT NOT NULL,
  sig_ts            INTEGER NOT NULL, -- UTC epoch seconds

  pdf_hash_b64u     TEXT,             -- optional (pdf integrity)
  status            TEXT NOT NULL DEFAULT 'ACTIVE',

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_proofs_payload_hash ON proofs(payload_hash_b64u);
CREATE INDEX IF NOT EXISTS idx_proofs_user_time ON proofs(user_id, created_at_ts);
CREATE INDEX IF NOT EXISTS idx_proofs_range     ON proofs(range_from, range_to);

-- =========================
-- proof_revocations
-- =========================
CREATE TABLE IF NOT EXISTS proof_revocations (
  revocation_id TEXT PRIMARY KEY,
  proof_id      TEXT NOT NULL,
  user_id       TEXT NOT NULL,
  reason_code   TEXT NOT NULL,
  note          TEXT,
  created_at_ts INTEGER NOT NULL,

  FOREIGN KEY (proof_id) REFERENCES proofs(proof_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_revocations_proof ON proof_revocations(proof_id, created_at_ts DESC);

-- =========================
-- keys (Public keys for verification)
-- =========================
CREATE TABLE IF NOT EXISTS keys (
  kid           TEXT PRIMARY KEY,
  alg           TEXT NOT NULL,
  public_jwk    TEXT NOT NULL,       -- JSON string
  not_before_ts INTEGER,
  not_after_ts  INTEGER,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at_ts INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_keys_active ON keys(is_active, created_at_ts);
CREATE INDEX IF NOT EXISTS idx_keys_alg    ON keys(alg);
CREATE INDEX IF NOT EXISTS idx_keys_status ON keys(status);

-- =========================
-- verification_logs (audit trail for verify endpoint)
-- =========================
CREATE TABLE IF NOT EXISTS verification_logs (
  verify_id         TEXT PRIMARY KEY,
  proof_id          TEXT,
  payload_hash_b64u TEXT NOT NULL,
  kid               TEXT,
  alg               TEXT,
  ts                INTEGER NOT NULL, -- verify executed at (UTC epoch seconds)
  result            TEXT NOT NULL,    -- OK/NG/REVOKED/UNKNOWN
  reason_code       TEXT,
  method            TEXT NOT NULL,    -- e.g. 'url'/'api'
  ip_hash_b64u      TEXT,
  ua_hash_b64u      TEXT,
  detail_json       TEXT,
  created_at_ts     INTEGER NOT NULL,

  FOREIGN KEY (proof_id) REFERENCES proofs(proof_id)
);

CREATE INDEX IF NOT EXISTS idx_verify_hash_ts   ON verification_logs(payload_hash_b64u, ts DESC);
CREATE INDEX IF NOT EXISTS idx_verify_proof_ts  ON verification_logs(proof_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_verify_result_ts ON verification_logs(result, ts DESC);

-- =========================
-- unsigned_notes (user-facing memo, optional)
-- =========================
CREATE TABLE IF NOT EXISTS unsigned_notes (
  note_id       TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  created_at_ts INTEGER NOT NULL,
  scope         TEXT NOT NULL,   -- e.g. 'daily'/'monthly'/'general'
  proof_id      TEXT,
  content       TEXT NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (proof_id) REFERENCES proofs(proof_id)
);

CREATE INDEX IF NOT EXISTS idx_notes_user_time ON unsigned_notes(user_id, created_at_ts DESC);

-- =========================
-- daily_rollups (JST day aggregation)
-- =========================
CREATE TABLE IF NOT EXISTS daily_rollups (
  user_id        TEXT NOT NULL,
  day_jst        TEXT NOT NULL,  -- 'YYYY-MM-DD'
  safe_count     INTEGER NOT NULL DEFAULT 0,
  warning_count  INTEGER NOT NULL DEFAULT 0,
  danger_count   INTEGER NOT NULL DEFAULT 0,
  total_count    INTEGER NOT NULL DEFAULT 0,
  spend_count    INTEGER NOT NULL DEFAULT 0,
  transfer_count INTEGER NOT NULL DEFAULT 0,
  risk_count     INTEGER NOT NULL DEFAULT 0,
  last_event_ts  INTEGER,
  last_proof_id  TEXT,
  PRIMARY KEY (user_id, day_jst),

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (last_proof_id) REFERENCES proofs(proof_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_user_day ON daily_rollups(user_id, day_jst);

-- =========================
-- monthly_rollups (JST month aggregation)
-- =========================
CREATE TABLE IF NOT EXISTS monthly_rollups (
  user_id        TEXT NOT NULL,
  ym_jst         TEXT NOT NULL,  -- 'YYYY-MM'
  safe_count     INTEGER NOT NULL DEFAULT 0,
  warning_count  INTEGER NOT NULL DEFAULT 0,
  danger_count   INTEGER NOT NULL DEFAULT 0,
  total_count    INTEGER NOT NULL DEFAULT 0,
  spend_count    INTEGER NOT NULL DEFAULT 0,
  transfer_count INTEGER NOT NULL DEFAULT 0,
  risk_count     INTEGER NOT NULL DEFAULT 0,
  last_event_ts  INTEGER,
  last_proof_id  TEXT,
  PRIMARY KEY (user_id, ym_jst),

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (last_proof_id) REFERENCES proofs(proof_id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_user_ym ON monthly_rollups(user_id, ym_jst);

-- =========================
-- reason_catalog (reason_code dictionary)
-- =========================
CREATE TABLE IF NOT EXISTS reason_catalog (
  reason_code   TEXT PRIMARY KEY,
  bucket        TEXT NOT NULL,   -- 'SPEND'/'TRANSFER'/'KYC'/'RISK'/'OTHER'
  title_ja      TEXT NOT NULL,
  title_en      TEXT,
  severity      TEXT,            -- SAFE/WARNING/DANGER (optional override)
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at_ts INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reason_bucket ON reason_catalog(bucket);
