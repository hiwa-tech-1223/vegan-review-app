-- =============================================
-- UUID → BIGSERIAL への変更
-- 開発環境用: テーブルを再作成し、データを再投入
-- =============================================

-- トリガーを一時的に無効化（存在する場合）
DROP TRIGGER IF EXISTS update_product_rating ON reviews;
DROP FUNCTION IF EXISTS update_product_rating_on_review();

-- 依存テーブルを削除（外部キー制約の関係で順序が重要）
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- =============================================
-- admins テーブル再作成
-- =============================================
CREATE TABLE admins (
    id BIGSERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role ON admins(role);

COMMENT ON TABLE admins IS '管理者テーブル - 一般ユーザーとは完全分離';
COMMENT ON COLUMN admins.role IS 'super_admin: 全権限, admin: 商品・レビュー管理, moderator: レビュー管理のみ';

-- =============================================
-- users テーブル再作成
-- =============================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    member_since DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

COMMENT ON TABLE users IS '一般ユーザーテーブル - レビュー投稿、お気に入り';

-- =============================================
-- categories テーブル再作成
-- =============================================
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_ja VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_by_admin_id BIGINT REFERENCES admins(id) ON DELETE SET NULL,
    updated_by_admin_id BIGINT REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);

COMMENT ON TABLE categories IS '商品カテゴリ - 管理者のみ作成・編集可能';

-- =============================================
-- products テーブル再作成
-- =============================================
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ja VARCHAR(255) NOT NULL,
    description TEXT,
    description_ja TEXT,
    image_url TEXT,
    affiliate_url TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_by_admin_id BIGINT REFERENCES admins(id) ON DELETE SET NULL,
    updated_by_admin_id BIGINT REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_rating ON products(rating DESC);

COMMENT ON TABLE products IS '商品テーブル - 管理者のみ作成・編集可能';
COMMENT ON COLUMN products.affiliate_url IS 'アフィリエイトリンクURL（ASP経由の購入リンク）';

-- =============================================
-- product_categories 中間テーブル再作成
-- =============================================
CREATE TABLE product_categories (
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, category_id)
);

CREATE INDEX idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX idx_product_categories_category_id ON product_categories(category_id);

COMMENT ON TABLE product_categories IS '商品とカテゴリーの多対多リレーション';

-- =============================================
-- reviews テーブル再作成
-- =============================================
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_reviews_user_product ON reviews(user_id, product_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

COMMENT ON TABLE reviews IS 'レビューテーブル - ユーザーが商品に対して投稿';
COMMENT ON COLUMN reviews.rating IS '評価: 1-5の整数';

-- =============================================
-- favorites テーブル再作成
-- =============================================
CREATE TABLE favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_product_id ON favorites(product_id);

COMMENT ON TABLE favorites IS 'お気に入りテーブル - ユーザーごとの商品お気に入り';

-- =============================================
-- テストデータ再投入（IDは自動採番）
-- =============================================

-- Admins
INSERT INTO admins (google_id, email, name, avatar, role) VALUES
  ('google_admin_super', 'super@veganbite.com', 'Super Admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', 'super_admin'),
  ('google_admin_1', 'admin@veganbite.com', 'Admin User', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', 'admin'),
  ('google_moderator_1', 'mod@veganbite.com', 'Moderator', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', 'moderator');

-- Users
INSERT INTO users (google_id, email, name, avatar, member_since) VALUES
  ('google_user_1', 'yuki@example.com', 'Yuki Tanaka', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', '2024-06-15'),
  ('google_user_2', 'mike@example.com', 'Mike Johnson', 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop', '2024-08-20'),
  ('google_user_3', 'sakura@example.com', 'Sakura Yamamoto', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', '2024-10-01');

-- Categories
INSERT INTO categories (name, name_ja, slug) VALUES
  ('Meat Alternatives', '代替肉', 'meat-alternatives'),
  ('Dairy', '乳製品代替', 'dairy'),
  ('Snacks', 'スナック', 'snacks'),
  ('Beverages', '飲料', 'beverages'),
  ('Seasonings', '調味料', 'seasonings');

-- Products
INSERT INTO products (name, name_ja, description, description_ja, image_url, rating, review_count, created_by_admin_id) VALUES
  ('Beyond Burger', 'ビヨンドバーガー',
   'Plant-based burger patty that looks, cooks, and tastes like beef. Made from pea protein, this revolutionary product is perfect for grilling.',
   '牛肉のような見た目、調理感、味わいの植物ベースバーガーパティ。えんどう豆由来のタンパク質で作られた革新的な製品で、グリル料理に最適です。',
   'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop',
   4.7, 3, 2),
  ('Oat Milk', 'オーツミルク',
   'Creamy oat milk made from whole grain oats. Perfect for coffee, smoothies, and cereal. Naturally sweet with no added sugars.',
   '全粒オーツ麦から作られたクリーミーなオーツミルク。コーヒー、スムージー、シリアルに最適。砂糖不使用で自然な甘さ。',
   'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
   5.0, 2, 2),
  ('Vegan Cheese Slices', 'ヴィーガンチーズスライス',
   'Meltable vegan cheese slices made from cashews and coconut oil. Great for sandwiches and burgers.',
   'カシューナッツとココナッツオイルから作られた溶けるヴィーガンチーズスライス。サンドイッチやバーガーに最適。',
   'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&h=300&fit=crop',
   4.0, 1, 2),
  ('Chickpea Chips', 'ひよこ豆チップス',
   'Crunchy chips made from chickpeas and sea salt. High in protein and fiber, perfect for guilt-free snacking.',
   'ひよこ豆と海塩で作られたサクサクチップス。タンパク質と食物繊維が豊富で、罪悪感のないスナックに最適。',
   'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400&h=300&fit=crop',
   4.5, 2, 2),
  ('Kombucha Green Tea', '緑茶コンブチャ',
   'Organic fermented tea beverage with probiotics. Refreshing green tea flavor with a subtle fizz.',
   'プロバイオティクスを含むオーガニック発酵茶飲料。爽やかな緑茶の風味と微炭酸。',
   'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
   4.0, 1, 1),
  ('Nutritional Yeast', 'ニュートリショナルイースト',
   'Deactivated yeast with a cheesy, nutty flavor. Rich in B vitamins and adds umami to any dish.',
   'チーズのようなナッツ風味の不活性酵母。ビタミンB群が豊富で、どんな料理にもうま味を加えます。',
   'https://images.unsplash.com/photo-1505935428862-770b6f24f629?w=400&h=300&fit=crop',
   5.0, 2, 1),
  ('Vegan Mayo', 'ヴィーガンマヨネーズ',
   'Egg-free mayonnaise made from soy milk. Creamy texture perfect for sandwiches and salads.',
   '豆乳から作られた卵不使用マヨネーズ。サンドイッチやサラダに最適なクリーミーな食感。',
   'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400&h=300&fit=crop',
   4.0, 1, 2),
  ('Protein Energy Bars', 'プロテインエナジーバー',
   'Peanut butter and chocolate protein bars with 12g plant protein. Perfect post-workout snack.',
   'ピーナッツバターとチョコレートのプロテインバー、植物性タンパク質12g含有。運動後のスナックに最適。',
   'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=300&fit=crop',
   5.0, 1, 2),
  ('Tempeh Original', 'オリジナルテンペ',
   'Traditional Indonesian fermented soybean cake. High in protein and probiotics, versatile for any recipe.',
   'インドネシア伝統の発酵大豆ケーキ。タンパク質とプロバイオティクスが豊富で、どんなレシピにも使えます。',
   'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
   5.0, 1, 1);

-- Product Categories
INSERT INTO product_categories (product_id, category_id) VALUES
  (1, 1),  -- Beyond Burger → Meat Alternatives
  (2, 2),  -- Oat Milk → Dairy
  (3, 2),  -- Vegan Cheese → Dairy
  (4, 3),  -- Chickpea Chips → Snacks
  (5, 4),  -- Kombucha → Beverages
  (6, 5),  -- Nutritional Yeast → Seasonings
  (7, 5),  -- Vegan Mayo → Seasonings
  (8, 3),  -- Protein Bars → Snacks
  (9, 1);  -- Tempeh → Meat Alternatives

-- Reviews
INSERT INTO reviews (product_id, user_id, rating, comment, created_at) VALUES
  (1, 1, 5, 'Amazing taste! Very close to real beef. 本物の牛肉に近い味わいで驚きました。', '2025-12-15 10:30:00'),
  (1, 2, 4, 'Great texture, though a bit pricey. Perfect for BBQ parties.', '2025-12-10 14:20:00'),
  (1, 3, 5, '家族全員が気に入りました！リピート確定です。', '2025-12-20 09:15:00'),
  (2, 3, 5, 'コーヒーに入れるのに最適です！クリーミーで美味しい。Perfect for my morning coffee!', '2025-12-20 08:00:00'),
  (2, 1, 5, 'Best oat milk I have tried. No weird aftertaste.', '2025-12-18 16:45:00'),
  (3, 2, 4, 'Melts nicely on pizza. Good flavor!', '2025-12-12 19:30:00'),
  (4, 1, 5, 'サクサクで止まらない！ヘルシーなのも嬉しい。', '2025-12-14 15:00:00'),
  (4, 3, 4, 'Great healthy snack option. Kids love them too!', '2025-12-16 11:20:00'),
  (5, 2, 4, 'Refreshing and not too sweet. 爽やかで飲みやすい。', '2025-12-11 13:10:00'),
  (6, 1, 5, 'Essential for vegan cooking! チーズの代わりに最高。', '2025-12-13 12:00:00'),
  (6, 3, 5, 'Love the cheesy flavor. Use it on everything!', '2025-12-19 18:30:00'),
  (7, 2, 4, 'Tastes just like regular mayo. Great for sandwiches.', '2025-12-17 10:00:00'),
  (8, 1, 5, 'Perfect post-gym snack! 運動後にぴったり。', '2025-12-15 17:30:00'),
  (9, 3, 5, 'Great protein source. Love the nutty flavor!', '2025-12-21 14:00:00');

-- Favorites
INSERT INTO favorites (user_id, product_id) VALUES
  (1, 1), (1, 2), (1, 6),  -- Yuki's favorites
  (2, 4), (2, 5),          -- Mike's favorites
  (3, 1), (3, 2), (3, 9);  -- Sakura's favorites
