CREATE TABLE users_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL,
    is_admin INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT INTO users_new (id, name, password_hash, is_admin, created_at, updated_at)
SELECT
    u.id,
    u.name,
    u.password_hash,
    u.id = (SELECT MIN(first_user.id) FROM users first_user),
    u.created_at,
    u.updated_at
FROM
    users u;

DROP TABLE users;

ALTER TABLE users_new RENAME TO users;
