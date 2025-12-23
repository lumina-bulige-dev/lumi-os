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
CREATE INDEX IF NOT EXISTS idx_users_ym_jst  ON users(ym_jst);

CREATE TABLE IF NOT EXISTS challenges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  reward_budget INTEGER NOT NULL,
  reward_unit INTEGER NOT NULL,
  max_winners INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  weekly_amount INTEGER NOT NULL,
  joined_at TEXT NOT NULL,
  is_completed INTEGER NOT NULL DEFAULT 0,
  weekly_target INTEGER,
  notes TEXT,
  public_rank INTEGER,
  score_behavior INTEGER,
  score_finance INTEGER,
  rank_tier TEXT,
  streak_days INTEGER,
  improvement_rate REAL,
  report_hash TEXT,
  last_update TEXT,
  credit_flag INTEGER,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_participants_challenge ON participants(challenge_id);

CREATE TABLE IF NOT EXISTS weekly_logs (
  id TEXT PRIMARY KEY,
  participant_id TEXT NOT NULL,
  week_index INTEGER NOT NULL,
  planned_amount INTEGER NOT NULL,
  actual_saved INTEGER NOT NULL,
  card_discretionary INTEGER,
  over_budget INTEGER,
  max_single_spend INTEGER,
  self_control INTEGER,
  risk_event INTEGER,
  good_move TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (participant_id) REFERENCES participants(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_logs_unique
ON weekly_logs(participant_id, week_index);

CREATE INDEX IF NOT EXISTS idx_weekly_logs_participant
ON weekly_logs(participant_id, week_index);

CREATE TABLE IF NOT EXISTS weekly_reports (
  participant_id TEXT,
  week INTEGER,
  spent INTEGER,
  saved INTEGER,
  notes TEXT,
  created_at TEXT,
  PRIMARY KEY (participant_id, week)
);

CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  decided_at TEXT NOT NULL,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id),
  FOREIGN KEY (participant_id) REFERENCES participants(id)
);

CREATE INDEX IF NOT EXISTS idx_rewards_challenge ON rewards(challenge_id);

CREATE TABLE IF NOT EXISTS scores (
  participant_id TEXT PRIMARY KEY,
  weeks_completed INTEGER NOT NULL,
  avg_saving_rate REAL NOT NULL,
  streak_weeks_ok INTEGER NOT NULL,
  risk_event_count INTEGER NOT NULL,
  bulige_rank_pred TEXT,
  bulige_rank_actual TEXT,
  improvement_score REAL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (participant_id) REFERENCES participants(id)
);

CREATE TABLE IF NOT EXISTS unsigned_notes (
  note_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at_ts INTEGER NOT NULL,
  scope TEXT NOT NULL,
  proof_id TEXT,
  content TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notes_user_time
ON unsigned_notes(user_id, created_at_ts DESC);
