ALTER TABLE users RENAME TO customers;
ALTER TABLE reviews RENAME COLUMN user_id TO customer_id;
ALTER TABLE favorites RENAME COLUMN user_id TO customer_id;
ALTER INDEX idx_users_email RENAME TO idx_customers_email;
ALTER INDEX idx_users_google_id RENAME TO idx_customers_google_id;
ALTER INDEX idx_reviews_user_id RENAME TO idx_reviews_customer_id;
ALTER INDEX idx_reviews_user_product RENAME TO idx_reviews_customer_product;
ALTER INDEX idx_favorites_user_id RENAME TO idx_favorites_customer_id;
