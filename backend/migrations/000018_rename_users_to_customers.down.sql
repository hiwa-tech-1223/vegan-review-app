ALTER TABLE customers RENAME TO users;
ALTER TABLE reviews RENAME COLUMN customer_id TO user_id;
ALTER TABLE favorites RENAME COLUMN customer_id TO user_id;
ALTER INDEX idx_customers_email RENAME TO idx_users_email;
ALTER INDEX idx_customers_google_id RENAME TO idx_users_google_id;
ALTER INDEX idx_reviews_customer_id RENAME TO idx_reviews_user_id;
ALTER INDEX idx_reviews_customer_product RENAME TO idx_reviews_user_product;
ALTER INDEX idx_favorites_customer_id RENAME TO idx_favorites_user_id;
