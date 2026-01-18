-- db/007_azr_decisions.sql

-- 1) Decisions ledger (台帳)
CREATE TABLE IF NOT EXISTS decisions (
  decision_id TEXT PRIMARY KEY,
  schema TEXT NOT NULL,
  issued_at TEXT NOT NULL,          -- ISO8601
  env TEXT NOT NULL CHECK (env IN ('prod','stage')),

  targets_json TEXT NOT NULL,       -- JSON string: ["app","verify",...]
  manifest_json TEXT NOT NULL,      -- full manifest JSON (string)

  approved_at TEXT NOT NULL,        -- ISO8601
  approver TEXT NOT NULL,           -- non-PII preferred (role or hashed id later)

  -- future: JWS署名を格納（今はNULLでOK）
  jws TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_decisions_env_issued_at
  ON decisions (env, issued_at);

-- 2) Latest pointer per (env,target)
CREATE TABLE IF NOT EXISTS decision_latest (
  env TEXT NOT NULL CHECK (env IN ('prod','stage')),
  target TEXT NOT NULL CHECK (target IN ('app','verify','api','info')),
  decision_id TEXT NOT NULL,

  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (env, target),

  FOREIGN KEY (decision_id) REFERENCES decisions(decision_id)
);

-- 3) Fleet reports (施行監査)
CREATE TABLE IF NOT EXISTS fleet_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  env TEXT NOT NULL CHECK (env IN ('prod','stage')),
  target TEXT NOT NULL CHECK (target IN ('app','verify','api','info')),

  decision_id TEXT NOT NULL,
  applied_at TEXT NOT NULL,         -- serviceが適用した時刻
  status TEXT NOT NULL CHECK (status IN ('OK','FAIL')),

  note TEXT,                        -- non-PII only
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_fleet_reports_env_target_created
  ON fleet_reports (env, target, created_at);
