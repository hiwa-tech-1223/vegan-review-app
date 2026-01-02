-- =============================================
-- テストデータ（開発・デモ用）
-- =============================================

-- ======================
-- Test Admins（管理者）
-- ======================
INSERT INTO admins (id, google_id, email, name, avatar, role) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'google_admin_super', 'super@veganbite.com', 'Super Admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', 'super_admin'),
  ('a0000000-0000-0000-0000-000000000002', 'google_admin_1', 'admin@veganbite.com', 'Admin User', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', 'admin'),
  ('a0000000-0000-0000-0000-000000000003', 'google_moderator_1', 'mod@veganbite.com', 'Moderator', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', 'moderator');

-- ======================
-- Test Users（一般ユーザー）
-- ======================
INSERT INTO users (id, google_id, email, name, avatar, member_since) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'google_user_1', 'yuki@example.com', 'Yuki Tanaka', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', '2024-06-15'),
  ('b0000000-0000-0000-0000-000000000002', 'google_user_2', 'mike@example.com', 'Mike Johnson', 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop', '2024-08-20'),
  ('b0000000-0000-0000-0000-000000000003', 'google_user_3', 'sakura@example.com', 'Sakura Yamamoto', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', '2024-10-01');

-- ======================
-- Test Products（商品）
-- ======================
INSERT INTO products (id, category_id, name, name_ja, description, description_ja, image_url, rating, review_count, created_by_admin_id) VALUES
  ('c0000000-0000-0000-0000-000000000001', 
   (SELECT id FROM categories WHERE slug = 'meat-alternatives'),
   'Beyond Burger', 'ビヨンドバーガー',
   'Plant-based burger patty that looks, cooks, and tastes like beef. Made from pea protein, this revolutionary product is perfect for grilling.',
   '牛肉のような見た目、調理感、味わいの植物ベースバーガーパティ。えんどう豆由来のタンパク質で作られた革新的な製品で、グリル料理に最適です。',
   'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop',
   4.7, 3, 'a0000000-0000-0000-0000-000000000002'),

  ('c0000000-0000-0000-0000-000000000002',
   (SELECT id FROM categories WHERE slug = 'dairy'),
   'Oat Milk', 'オーツミルク',
   'Creamy oat milk made from whole grain oats. Perfect for coffee, smoothies, and cereal. Naturally sweet with no added sugars.',
   '全粒オーツ麦から作られたクリーミーなオーツミルク。コーヒー、スムージー、シリアルに最適。砂糖不使用で自然な甘さ。',
   'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
   5.0, 2, 'a0000000-0000-0000-0000-000000000002'),

  ('c0000000-0000-0000-0000-000000000003',
   (SELECT id FROM categories WHERE slug = 'dairy'),
   'Vegan Cheese Slices', 'ヴィーガンチーズスライス',
   'Meltable vegan cheese slices made from cashews and coconut oil. Great for sandwiches and burgers.',
   'カシューナッツとココナッツオイルから作られた溶けるヴィーガンチーズスライス。サンドイッチやバーガーに最適。',
   'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&h=300&fit=crop',
   4.0, 1, 'a0000000-0000-0000-0000-000000000002'),

  ('c0000000-0000-0000-0000-000000000004',
   (SELECT id FROM categories WHERE slug = 'snacks'),
   'Chickpea Chips', 'ひよこ豆チップス',
   'Crunchy chips made from chickpeas and sea salt. High in protein and fiber, perfect for guilt-free snacking.',
   'ひよこ豆と海塩で作られたサクサクチップス。タンパク質と食物繊維が豊富で、罪悪感のないスナックに最適。',
   'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400&h=300&fit=crop',
   4.5, 2, 'a0000000-0000-0000-0000-000000000002'),

  ('c0000000-0000-0000-0000-000000000005',
   (SELECT id FROM categories WHERE slug = 'beverages'),
   'Kombucha Green Tea', '緑茶コンブチャ',
   'Organic fermented tea beverage with probiotics. Refreshing green tea flavor with a subtle fizz.',
   'プロバイオティクスを含むオーガニック発酵茶飲料。爽やかな緑茶の風味と微炭酸。',
   'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
   4.0, 1, 'a0000000-0000-0000-0000-000000000001'),

  ('c0000000-0000-0000-0000-000000000006',
   (SELECT id FROM categories WHERE slug = 'seasonings'),
   'Nutritional Yeast', 'ニュートリショナルイースト',
   'Deactivated yeast with a cheesy, nutty flavor. Rich in B vitamins and adds umami to any dish.',
   'チーズのようなナッツ風味の不活性酵母。ビタミンB群が豊富で、どんな料理にもうま味を加えます。',
   'https://images.unsplash.com/photo-1505935428862-770b6f24f629?w=400&h=300&fit=crop',
   5.0, 2, 'a0000000-0000-0000-0000-000000000001'),

  ('c0000000-0000-0000-0000-000000000007',
   (SELECT id FROM categories WHERE slug = 'seasonings'),
   'Vegan Mayo', 'ヴィーガンマヨネーズ',
   'Egg-free mayonnaise made from soy milk. Creamy texture perfect for sandwiches and salads.',
   '豆乳から作られた卵不使用マヨネーズ。サンドイッチやサラダに最適なクリーミーな食感。',
   'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400&h=300&fit=crop',
   4.0, 1, 'a0000000-0000-0000-0000-000000000002'),

  ('c0000000-0000-0000-0000-000000000008',
   (SELECT id FROM categories WHERE slug = 'snacks'),
   'Protein Energy Bars', 'プロテインエナジーバー',
   'Peanut butter and chocolate protein bars with 12g plant protein. Perfect post-workout snack.',
   'ピーナッツバターとチョコレートのプロテインバー、植物性タンパク質12g含有。運動後のスナックに最適。',
   'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=300&fit=crop',
   5.0, 1, 'a0000000-0000-0000-0000-000000000002'),

  ('c0000000-0000-0000-0000-000000000009',
   (SELECT id FROM categories WHERE slug = 'meat-alternatives'),
   'Tempeh Original', 'オリジナルテンペ',
   'Traditional Indonesian fermented soybean cake. High in protein and probiotics, versatile for any recipe.',
   'インドネシア伝統の発酵大豆ケーキ。タンパク質とプロバイオティクスが豊富で、どんなレシピにも使えます。',
   'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
   5.0, 1, 'a0000000-0000-0000-0000-000000000001');

-- ======================
-- Test Reviews（レビュー）
-- ======================
INSERT INTO reviews (product_id, user_id, rating, comment, created_at) VALUES
  -- Beyond Burger (3 reviews, avg 4.7)
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 5, 
   'Amazing taste! Very close to real beef. 本物の牛肉に近い味わいで驚きました。', '2025-12-15 10:30:00'),
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 4, 
   'Great texture, though a bit pricey. Perfect for BBQ parties.', '2025-12-10 14:20:00'),
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 5, 
   '家族全員が気に入りました！リピート確定です。', '2025-12-20 09:15:00'),

  -- Oat Milk (2 reviews, avg 5.0)
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 5, 
   'コーヒーに入れるのに最適です！クリーミーで美味しい。Perfect for my morning coffee!', '2025-12-20 08:00:00'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 5, 
   'Best oat milk I have tried. No weird aftertaste.', '2025-12-18 16:45:00'),

  -- Vegan Cheese (1 review, avg 4.0)
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 4, 
   'Melts nicely on pizza. Good flavor!', '2025-12-12 19:30:00'),

  -- Chickpea Chips (2 reviews, avg 4.5)
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 5, 
   'サクサクで止まらない！ヘルシーなのも嬉しい。', '2025-12-14 15:00:00'),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 4, 
   'Great healthy snack option. Kids love them too!', '2025-12-16 11:20:00'),

  -- Kombucha (1 review, avg 4.0)
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 4, 
   'Refreshing and not too sweet. 爽やかで飲みやすい。', '2025-12-11 13:10:00'),

  -- Nutritional Yeast (2 reviews, avg 5.0)
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 5, 
   'Essential for vegan cooking! チーズの代わりに最高。', '2025-12-13 12:00:00'),
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 5, 
   'Love the cheesy flavor. Use it on everything!', '2025-12-19 18:30:00'),

  -- Vegan Mayo (1 review, avg 4.0)
  ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000002', 4, 
   'Tastes just like regular mayo. Great for sandwiches.', '2025-12-17 10:00:00'),

  -- Protein Bars (1 review, avg 5.0)
  ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000001', 5, 
   'Perfect post-gym snack! 運動後にぴったり。', '2025-12-15 17:30:00'),

  -- Tempeh (1 review, avg 5.0)
  ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000003', 5, 
   'Great protein source. Love the nutty flavor!', '2025-12-21 14:00:00');

-- ======================
-- Test Favorites（お気に入り）
-- ======================
INSERT INTO favorites (user_id, product_id) VALUES
  -- Yuki's favorites
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006'),
  -- Mike's favorites
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005'),
  -- Sakura's favorites
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000009');
