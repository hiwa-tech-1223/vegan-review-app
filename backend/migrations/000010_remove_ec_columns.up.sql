-- =============================================
-- EC拡張用カラムを削除（YAGNI原則に基づく）
-- =============================================

-- productsテーブルからEC用カラムを削除
DROP INDEX IF EXISTS idx_products_is_available;
ALTER TABLE products DROP COLUMN IF EXISTS price;
ALTER TABLE products DROP COLUMN IF EXISTS stock_quantity;
ALTER TABLE products DROP COLUMN IF EXISTS is_available;

-- usersテーブルからEC用カラムを削除
ALTER TABLE users DROP COLUMN IF EXISTS phone;
