ALTER TABLE shopping_items ADD COLUMN status TEXT NOT NULL DEFAULT 'needed';

ALTER TABLE shopping_items ADD COLUMN buy_once INTEGER NOT NULL DEFAULT 0;

UPDATE shopping_items SET status = 'bought' WHERE done = 1;

ALTER TABLE shopping_items DROP COLUMN done;
