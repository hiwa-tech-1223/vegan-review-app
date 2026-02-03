-- =============================================
-- admins テーブルのカラム順序を変更
-- role_id を avatar の後に配置
-- =============================================

-- 1. 一時テーブルを作成（新しいカラム順序で）
CREATE TABLE admins_new (
    id BIGSERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    role_id BIGINT NOT NULL REFERENCES admin_roles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. データをコピー
INSERT INTO admins_new (id, google_id, email, name, avatar, role_id, created_at, updated_at)
SELECT id, google_id, email, name, avatar, role_id, created_at, updated_at
FROM admins;

-- 3. シーケンスを更新
SELECT setval('admins_new_id_seq', (SELECT MAX(id) FROM admins_new));

-- 4. 外部キー制約を持つテーブルの制約を一時的に削除
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_created_by_admin_id_fkey;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_updated_by_admin_id_fkey;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_created_by_admin_id_fkey;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_updated_by_admin_id_fkey;

-- 5. 旧テーブルを削除
DROP TABLE admins;

-- 6. 新テーブルをリネーム
ALTER TABLE admins_new RENAME TO admins;

-- 7. シーケンスをリネーム
ALTER SEQUENCE admins_new_id_seq RENAME TO admins_id_seq;

-- 8. インデックスを再作成
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role_id ON admins(role_id);

-- 9. 外部キー制約を再作成
ALTER TABLE categories
    ADD CONSTRAINT categories_created_by_admin_id_fkey
    FOREIGN KEY (created_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL;
ALTER TABLE categories
    ADD CONSTRAINT categories_updated_by_admin_id_fkey
    FOREIGN KEY (updated_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL;
ALTER TABLE products
    ADD CONSTRAINT products_created_by_admin_id_fkey
    FOREIGN KEY (created_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL;
ALTER TABLE products
    ADD CONSTRAINT products_updated_by_admin_id_fkey
    FOREIGN KEY (updated_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL;
