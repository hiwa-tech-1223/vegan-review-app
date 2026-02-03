-- Restore slug column to categories table
ALTER TABLE categories ADD COLUMN slug VARCHAR(100);

-- Generate slugs from name (lowercase, replace spaces with hyphens)
UPDATE categories SET slug = LOWER(REPLACE(name, ' ', '-'));

-- Add unique constraint and index
ALTER TABLE categories ADD CONSTRAINT categories_slug_unique UNIQUE (slug);
CREATE INDEX idx_categories_slug ON categories(slug);
