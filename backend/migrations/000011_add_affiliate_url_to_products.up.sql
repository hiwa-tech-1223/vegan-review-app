-- =============================================
-- productsテーブルにアフィリエイトURL追加
-- =============================================

ALTER TABLE products ADD COLUMN affiliate_url TEXT;

COMMENT ON COLUMN products.affiliate_url IS 'アフィリエイトリンクURL（ASP経由の購入リンク）';
