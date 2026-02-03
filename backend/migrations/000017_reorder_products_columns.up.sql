-- =============================================
-- products テーブルのカラム順序を変更
-- amazon_url, rakuten_url, yahoo_url を review_count と created_by_admin_id の間に配置
-- =============================================

-- 1. 一時テーブルを作成（新しいカラム順序で）
CREATE TABLE products_new (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ja VARCHAR(255) NOT NULL,
    description TEXT,
    description_ja TEXT,
    image_url TEXT,
    affiliate_url TEXT,
    rating NUMERIC(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    amazon_url TEXT,
    rakuten_url TEXT,
    yahoo_url TEXT,
    created_by_admin_id BIGINT REFERENCES admins(id) ON DELETE SET NULL,
    updated_by_admin_id BIGINT REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. データをコピー
INSERT INTO products_new (id, name, name_ja, description, description_ja, image_url, affiliate_url, rating, review_count, amazon_url, rakuten_url, yahoo_url, created_by_admin_id, updated_by_admin_id, created_at, updated_at)
SELECT id, name, name_ja, description, description_ja, image_url, affiliate_url, rating, review_count, amazon_url, rakuten_url, yahoo_url, created_by_admin_id, updated_by_admin_id, created_at, updated_at
FROM products;

-- 3. シーケンスを更新
SELECT setval('products_new_id_seq', (SELECT MAX(id) FROM products_new));

-- 4. 外部キー制約を持つテーブルの制約を一時的に削除
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_product_id_fkey;
ALTER TABLE product_categories DROP CONSTRAINT IF EXISTS product_categories_product_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_product_id_fkey;

-- 5. 旧テーブルを削除
DROP TABLE products;

-- 6. 新テーブルをリネーム
ALTER TABLE products_new RENAME TO products;

-- 7. シーケンスをリネーム
ALTER SEQUENCE products_new_id_seq RENAME TO products_id_seq;

-- 8. インデックスを再作成
CREATE INDEX idx_products_rating ON products(rating DESC);

-- 9. 外部キー制約を再作成
ALTER TABLE favorites
    ADD CONSTRAINT favorites_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE product_categories
    ADD CONSTRAINT product_categories_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE reviews
    ADD CONSTRAINT reviews_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
