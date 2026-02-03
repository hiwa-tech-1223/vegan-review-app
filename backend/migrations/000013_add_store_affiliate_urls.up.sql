-- =============================================
-- productsテーブルに各ストアのアフィリエイトURL追加
-- もしもアフィリエイト経由のリンクを格納
-- =============================================

ALTER TABLE products ADD COLUMN amazon_url TEXT;
ALTER TABLE products ADD COLUMN rakuten_url TEXT;
ALTER TABLE products ADD COLUMN yahoo_url TEXT;

COMMENT ON COLUMN products.amazon_url IS 'もしもアフィリエイト経由Amazonリンク';
COMMENT ON COLUMN products.rakuten_url IS 'もしもアフィリエイト経由楽天リンク';
COMMENT ON COLUMN products.yahoo_url IS 'もしもアフィリエイト経由Yahoo!ショッピングリンク';
