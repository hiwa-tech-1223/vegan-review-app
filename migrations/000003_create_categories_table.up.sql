-- =============================================
-- categories: 商品カテゴリテーブル
-- =============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_ja VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_by_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    updated_by_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);

COMMENT ON TABLE categories IS '商品カテゴリ - 管理者のみ作成・編集可能';

-- 初期カテゴリデータ（created_by_admin_idはNULL = システム作成）
INSERT INTO categories (name, name_ja, slug) VALUES
    ('Meat Alternatives', '代替肉', 'meat-alternatives'),
    ('Dairy', '乳製品代替', 'dairy'),
    ('Snacks', 'スナック', 'snacks'),
    ('Beverages', '飲料', 'beverages'),
    ('Seasonings', '調味料', 'seasonings');
