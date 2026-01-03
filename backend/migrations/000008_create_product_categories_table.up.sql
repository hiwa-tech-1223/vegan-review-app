-- =============================================
-- product_categories: 商品-カテゴリー中間テーブル（多対多）
-- =============================================

-- 中間テーブル作成
CREATE TABLE product_categories (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, category_id)
);

CREATE INDEX idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX idx_product_categories_category_id ON product_categories(category_id);

COMMENT ON TABLE product_categories IS '商品とカテゴリーの多対多リレーション';

-- 既存データを中間テーブルに移行
INSERT INTO product_categories (product_id, category_id)
SELECT id, category_id FROM products WHERE category_id IS NOT NULL;

-- productsテーブルからcategory_idカラムを削除
ALTER TABLE products DROP COLUMN category_id;
