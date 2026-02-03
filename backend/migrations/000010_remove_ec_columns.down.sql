-- =============================================
-- EC拡張用カラムを復元
-- =============================================

-- productsテーブルにEC用カラムを復元
ALTER TABLE products ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);

-- usersテーブルにEC用カラムを復元
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

COMMENT ON COLUMN products.price IS 'EC拡張用: 販売価格（円）';
COMMENT ON COLUMN products.stock_quantity IS 'EC拡張用: 在庫数';
COMMENT ON COLUMN products.is_available IS 'EC拡張用: 販売中フラグ';
COMMENT ON COLUMN users.phone IS 'EC拡張用: 配送時の連絡先';
