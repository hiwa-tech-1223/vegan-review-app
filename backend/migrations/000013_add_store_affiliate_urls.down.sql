-- =============================================
-- 各ストアのアフィリエイトURLカラムを削除
-- =============================================

ALTER TABLE products DROP COLUMN IF EXISTS amazon_url;
ALTER TABLE products DROP COLUMN IF EXISTS rakuten_url;
ALTER TABLE products DROP COLUMN IF EXISTS yahoo_url;
