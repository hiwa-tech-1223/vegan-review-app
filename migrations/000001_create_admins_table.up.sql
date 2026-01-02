-- =============================================
-- admins: 管理者テーブル（usersとは完全分離）
-- =============================================
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',  -- 'super_admin', 'admin', 'moderator'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role ON admins(role);

COMMENT ON TABLE admins IS '管理者テーブル - 一般ユーザーとは完全分離';
COMMENT ON COLUMN admins.role IS 'super_admin: 全権限, admin: 商品・レビュー管理, moderator: レビュー管理のみ';
