CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_logs (
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (user_id, date)
);

CREATE INDEX IF NOT EXISTS daily_logs_user_date_idx ON daily_logs (user_id, date DESC);
