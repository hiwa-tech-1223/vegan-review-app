-- =============================================
-- 複数カテゴリーの例を削除（元の1カテゴリーに戻す）
-- =============================================

-- Beyond Burgerから「スナック」カテゴリーを削除
DELETE FROM product_categories
WHERE product_id = 'c0000000-0000-0000-0000-000000000001'
AND category_id = (SELECT id FROM categories WHERE slug = 'snacks');

-- Protein Energy Barsから「代替肉」カテゴリーを削除
DELETE FROM product_categories
WHERE product_id = 'c0000000-0000-0000-0000-000000000008'
AND category_id = (SELECT id FROM categories WHERE slug = 'meat-alternatives');

-- Oat Milkから「飲料」カテゴリーを削除
DELETE FROM product_categories
WHERE product_id = 'c0000000-0000-0000-0000-000000000002'
AND category_id = (SELECT id FROM categories WHERE slug = 'beverages');
