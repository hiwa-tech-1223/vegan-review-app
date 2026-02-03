-- =============================================
-- admins テーブルを元に戻す
-- =============================================

-- 1. role カラムを追加
ALTER TABLE admins ADD COLUMN role VARCHAR(50);

-- 2. role_id から role 文字列に戻す
UPDATE admins SET role = (
    SELECT name FROM admin_roles WHERE admin_roles.id = admins.role_id
);

-- 3. role カラムを NOT NULL に設定しデフォルト値を追加
ALTER TABLE admins
    ALTER COLUMN role SET NOT NULL,
    ALTER COLUMN role SET DEFAULT 'admin';

-- 4. 外部キー制約とインデックスを削除
ALTER TABLE admins DROP CONSTRAINT fk_admins_role_id;
DROP INDEX IF EXISTS idx_admins_role_id;

-- 5. role_id カラムを削除
ALTER TABLE admins DROP COLUMN role_id;

-- =============================================
-- admin_roles テーブルを削除
-- =============================================
DROP TABLE admin_roles;
