CREATE TABLE images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    disk_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    original_url TEXT NOT NULL
);

ALTER TABLE entities ADD COLUMN img_id INTEGER REFERENCES images(id);

ALTER TABLE entities DROP COLUMN img;