PRAGMA foreign_keys = ON;

/* =========================
   001: Core tables (LUMINA)
========================= */

/* Users (最低限) */
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  age_band TEXT,
  income_band TEXT,
  savings_band TEXT,
  debt_band TEXT,
  main_goal TEXT,
  created_at TEXT NOT NULL,
  created_at_ts INTEGER,
  day_jst TEXT,
  ym_jst TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_created_ts ON users(created_at_ts);
CREATE INDEX IF NOT EXISTS idx_users_day_jst ON users(day_jst);
CREATE INDEX IF NOT EXISTS idx_users_ym_jst ON users(ym_jst);

/* Key registry (verify側が参照) */
CREATE TABLE IF NOT EXISTS keys (
  kid TEXT PRIMARY KEY,
  alg TEXT NOT NULL,
  public_jwk TEXT NOT NULL,
  not_before_ts INTEGER,
  not_after_ts INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at_ts INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_keys_active ON keys(is_active, created_at_ts);
CREATE INDEX IF NOT EXISTS idx_keys_alg ON keys(alg);
CREATE INDEX IF NOT EXISTS idx_keys_status ON keys(status);

/* Proofs (30日などの検証単位) */
CREATE TABLE IF NOT EXISTS proofs (
  proof_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,

  created_at_ts INTEGER NOT NULL,

  range_from TEXT NOT NULL,
  range_to   TEXT NOT NULL,

  safe_count    INTEGER NOT NULL,
  warning_count INTEGER NOT NULL,
  danger_count  INTEGER NOT NULL,
  total_count   INTEGER NOT NULL,

  ruleset_version TEXT NOT NULL,

  payload_hash_b64u TEXT NOT NULL,
  payload_b64u      TEXT,
  sig_b64u          TEXT NOT NULL,
  kid TEXT NOT NULL,
  alg TEXT NOT NULL,
  sig_ts INTEGER NOT NULL,

  pdf_hash_b64u TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_proofs_payload_hash ON proofs(payload_hash_b64u);
CREATE INDEX IF NOT EXISTS idx_proofs_user_time ON proofs(user_id, created_at_ts);
CREATE INDEX IF NOT EXISTS idx_proofs_range ON proofs(range_from, range_to);

/* Proof revocations */
CREATE TABLE IF NOT EXISTS proof_revocations (
  revocation_id TEXT PRIMARY KEY,
  proof_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  reason_code TEXT NOT NULL,
  note TEXT,
  created_at_ts INTEGER NOT NULL,
  FOREIGN KEY (proof_id) REFERENCES proofs(proof_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_revocations_proof ON proof_revocations(proof_id, created_at_ts DESC);

/* Verification logs (誰かがverifyした痕跡) */
CREATE TABLE IF NOT EXISTS verification_logs (
  verify_id TEXT PRIMARY KEY,
  proof_id TEXT,
  payload_hash_b64u TEXT NOT NULL,
  kid TEXT,
  alg TEXT,
  ts INTEGER NOT NULL,
  result TEXT NOT NULL,
  reason_code TEXT,
  method TEXT NOT NULL,
  ip_hash_b64u TEXT,
  ua_hash_b64u TEXT,
  detail_json TEXT,
  created_at_ts INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verify_hash_ts ON verification_logs(payload_hash_b64u, ts DESC);
CREATE INDEX IF NOT EXISTS idx_verify_proof_ts ON verification_logs(proof_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_verify_result_ts ON verification_logs(result, ts DESC);

/* Unsigned notes (ユーザーのメモ・補足) */
CREATE TABLE IF NOT EXISTS unsigned_notes (
  note_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at_ts INTEGER NOT NULL,
  scope TEXT NOT NULL,
  proof_id TEXT,
  content TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_notes_user_time ON unsigned_notes(user_id, created_at_ts DESC);

/* Heiankyo events (Rawログの中心) */
CREATE TABLE IF NOT EXISTS heiankyo_events (
  event_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,

  type TEXT NOT NULL CHECK (type IN ('SPEND','TRANSFER','KYC','RISK','NOTE')),
  label TEXT NOT NULL CHECK (label IN ('SAFE','WARNING','DANGER')),
  reason_code TEXT,

  ts INTEGER NOT NULL,

  day_jst TEXT NOT NULL,
  ym_jst  TEXT NOT NULL,

  data_json TEXT NOT NULL,

  proof_id TEXT,

  prev_hash_b64u TEXT,
  hash_b64u TEXT NOT NULL,

  ip_hash_b64u TEXT,
  ua_hash_b64u TEXT,
  hash_version TEXT NOT NULL DEFAULT 'v1',

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_heiankyo_user_ts ON heiankyo_events(user_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_heiankyo_user_day ON heiankyo_events(user_id, day_jst);
CREATE INDEX IF NOT EXISTS idx_heiankyo_user_ym ON heiankyo_events(user_id, ym_jst);
CREATE INDEX IF NOT EXISTS idx_heiankyo_user_ym_label ON heiankyo_events(user_id, ym_jst, label);
CREATE INDEX IF NOT EXISTS idx_heiankyo_reason_ym ON heiankyo_events(reason_code, ym_jst);

/* Chain uniqueness */
CREATE UNIQUE INDEX IF NOT EXISTS idx_heiankyo_user_hash ON heiankyo_events(user_id, hash_b64u);
CREATE INDEX IF NOT EXISTS idx_heiankyo_proof ON heiankyo_events(proof_id, ts DESC);
