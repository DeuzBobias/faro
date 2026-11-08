CREATE TABLE push_subscriptions (
 endpoint TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES local_accounts(user_id) ON DELETE CASCADE,
 subscription TEXT NOT NULL,
 created_at TEXT NOT NULL
);
