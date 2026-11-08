CREATE TABLE IF NOT EXISTS fas_assessments (
  user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS fas_assessments_user_completed_idx ON fas_assessments (user_id, completed_at DESC);
