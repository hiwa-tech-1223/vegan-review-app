-- テストデータ削除（外部キー制約の順序で削除）
DELETE FROM favorites WHERE user_id LIKE 'b0000000-%';
DELETE FROM reviews WHERE user_id LIKE 'b0000000-%';
DELETE FROM products WHERE id LIKE 'c0000000-%';
DELETE FROM users WHERE id LIKE 'b0000000-%';
DELETE FROM admins WHERE id LIKE 'a0000000-%';
