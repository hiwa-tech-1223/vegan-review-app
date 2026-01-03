-- =============================================
-- 複数カテゴリーの例を追加
-- =============================================

-- Beyond Burgerに「スナック」カテゴリーも追加（代替肉 + スナック）
INSERT INTO product_categories (product_id, category_id)
SELECT 'c0000000-0000-0000-0000-000000000001', id FROM categories WHERE slug = 'snacks'
ON CONFLICT DO NOTHING;

-- Protein Energy Barsに「代替肉」カテゴリーも追加（スナック + 代替肉）
INSERT INTO product_categories (product_id, category_id)
SELECT 'c0000000-0000-0000-0000-000000000008', id FROM categories WHERE slug = 'meat-alternatives'
ON CONFLICT DO NOTHING;

-- Oat Milkに「飲料」カテゴリーも追加（乳製品代替 + 飲料）
INSERT INTO product_categories (product_id, category_id)
SELECT 'c0000000-0000-0000-0000-000000000002', id FROM categories WHERE slug = 'beverages'
ON CONFLICT DO NOTHING;
