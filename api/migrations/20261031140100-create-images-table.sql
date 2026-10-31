CREATE TABLE images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data BLOB NOT NULL,
    thumbnail BLOB NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

ALTER TABLE shopping_items ADD COLUMN image_id INTEGER REFERENCES images (id) ON DELETE SET NULL;

ALTER TABLE recipes ADD COLUMN image_id INTEGER REFERENCES images (id) ON DELETE SET NULL;
