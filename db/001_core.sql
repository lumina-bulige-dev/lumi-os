PRAGMA foreign_keys = ON;

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

CREATE TABLE IF NOT EXISTS proofs (
  proof_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at_ts INTEGER NOT NULL,
  range_from TEXT NOT NULL,
  range_to TEXT NOT NULL,
  safe_count INTEGER NOT NULL,
  warning_count INTEGER NOT NULL,
  danger_count INTEGER NOT NULL,
  total_count INTEGER NOT NULL,
  ruleset_version TEXT NOT NULL,
  payload_hash_b64u TEXT NOT NULL,
  payload_b64u TEXT,
  sig_b64u TEXT NOT NULL,
  kid TEXT NOT NULL,
  alg TEXT NOT NULL,
  sig_ts INTEGER NOT NULL,
  pdf_hash_b64u TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_proofs_payload_hash ON proofs(payload_hash_b64u);
CREATE INDEX IF NOT EXISTS idx_proofs_range ON proofs(range_from, range_to);
CREATE INDEX IF NOT EXISTS idx_proofs_user_time ON proofs(user_id, created_at_ts);

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
