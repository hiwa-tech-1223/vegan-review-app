-- =============================================
-- admin_roles: 管理者ロールマスタテーブル
-- =============================================
CREATE TABLE admin_roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    name_ja VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE admin_roles IS '管理者ロールマスタ';
COMMENT ON COLUMN admin_roles.name IS 'ロール名（英語）';
COMMENT ON COLUMN admin_roles.name_ja IS 'ロール名（日本語）';
COMMENT ON COLUMN admin_roles.description IS 'ロールの説明';

-- 初期データ投入
INSERT INTO admin_roles (name, name_ja, description) VALUES
    ('super_admin', 'スーパー管理者', '全権限を持つ管理者'),
    ('admin', '管理者', '商品・レビュー管理が可能'),
    ('moderator', 'モデレーター', 'レビュー管理のみ可能');

-- =============================================
-- admins テーブルに role_id カラムを追加
-- =============================================

-- 1. role_id カラムを追加（NULL許可で一時的に）
ALTER TABLE admins ADD COLUMN role_id BIGINT;

-- 2. 既存データをマイグレーション（role文字列 → role_id）
UPDATE admins SET role_id = (
    SELECT id FROM admin_roles WHERE admin_roles.name = admins.role
);

-- 3. role_id を NOT NULL に変更し、外部キー制約を追加
ALTER TABLE admins
    ALTER COLUMN role_id SET NOT NULL,
    ADD CONSTRAINT fk_admins_role_id FOREIGN KEY (role_id) REFERENCES admin_roles(id);

-- 4. 旧 role カラムを削除
ALTER TABLE admins DROP COLUMN role;

-- インデックス追加
CREATE INDEX idx_admins_role_id ON admins(role_id);
