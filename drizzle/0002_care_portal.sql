CREATE TABLE IF NOT EXISTS local_accounts (
 user_id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
 role TEXT NOT NULL DEFAULT 'student', active INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS local_sessions (
 token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES local_accounts(user_id) ON DELETE CASCADE,
 expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS care_consent (
 user_id TEXT PRIMARY KEY, enabled INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS care_messages (
 id TEXT PRIMARY KEY, student_id TEXT NOT NULL, clinician_id TEXT NOT NULL,
 kind TEXT NOT NULL, message TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS care_audit (
 id TEXT PRIMARY KEY, actor_id TEXT NOT NULL, action TEXT NOT NULL,
 target_id TEXT NOT NULL, created_at TEXT NOT NULL
);
