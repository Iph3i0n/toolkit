CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent INTEGER,

    CONSTRAINT fk_parent
      FOREIGN KEY (parent)
      REFERENCES categories (id)
);

CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent INTEGER,

    CONSTRAINT fk_parent
      FOREIGN KEY (parent)
      REFERENCES tags (id)
);

CREATE TABLE entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    url TEXT,
    img TEXT,
    container INTEGER,
    category INTEGER,
    comment TEXT,

    CONSTRAINT fk_container
      FOREIGN KEY (container)
      REFERENCES entities (id),
    CONSTRAINT fk_category
      FOREIGN KEY (category)
      REFERENCES categories (id)
);

CREATE TABLE entity_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity INTEGER NOT NULL,
    tag INTEGER NOT NULL,

    CONSTRAINT fk_entity
      FOREIGN KEY (entity)
      REFERENCES entities (id),
    CONSTRAINT fk_tag
      FOREIGN KEY (tag)
      REFERENCES tags (id)
);