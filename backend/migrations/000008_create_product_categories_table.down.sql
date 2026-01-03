-- ロールバック: category_idカラムを復元し、中間テーブルを削除

-- productsテーブルにcategory_idカラムを追加
ALTER TABLE products ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- 中間テーブルから最初のカテゴリーを復元（複数ある場合は最初の1つのみ）
UPDATE products p
SET category_id = (
    SELECT category_id FROM product_categories pc
    WHERE pc.product_id = p.id
    ORDER BY pc.created_at
    LIMIT 1
);

-- インデックス作成
CREATE INDEX idx_products_category_id ON products(category_id);

-- 中間テーブル削除
DROP TABLE IF EXISTS product_categories;
