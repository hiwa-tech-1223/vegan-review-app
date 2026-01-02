-- =============================================
-- users: 一般ユーザーテーブル
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    member_since DATE DEFAULT CURRENT_DATE,
    phone VARCHAR(20),  -- EC拡張用
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

COMMENT ON TABLE users IS '一般ユーザーテーブル - レビュー投稿、お気に入り、購入（EC）';
COMMENT ON COLUMN users.phone IS 'EC拡張用: 配送時の連絡先';
