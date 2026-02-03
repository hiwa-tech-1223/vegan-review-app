-- =============================================
-- productsテーブルからアフィリエイトURL削除
-- =============================================

ALTER TABLE products DROP COLUMN IF EXISTS affiliate_url;
