-- =============================================
-- products: 商品テーブル
-- =============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    -- 基本情報（バイリンガル）
    name VARCHAR(255) NOT NULL,
    name_ja VARCHAR(255) NOT NULL,
    description TEXT,
    description_ja TEXT,
    image_url TEXT,
    
    -- EC拡張用（NULL許可）
    price DECIMAL(10,2),
    stock_quantity INTEGER,
    is_available BOOLEAN DEFAULT TRUE,
    
    -- レビュー集計（トリガーで更新）
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    -- 監査用
    created_by_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    updated_by_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_rating ON products(rating DESC);
CREATE INDEX idx_products_is_available ON products(is_available);

COMMENT ON TABLE products IS '商品テーブル - 管理者のみ作成・編集可能';
COMMENT ON COLUMN products.price IS 'EC拡張用: 販売価格（円）';
COMMENT ON COLUMN products.stock_quantity IS 'EC拡張用: 在庫数';
COMMENT ON COLUMN products.is_available IS 'EC拡張用: 販売中フラグ';
