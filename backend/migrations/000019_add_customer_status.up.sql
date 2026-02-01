-- customers テーブルに status 系カラムを追加
ALTER TABLE customers ADD COLUMN status SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE customers ADD COLUMN status_reason TEXT;
ALTER TABLE customers ADD COLUMN suspended_until TIMESTAMP;
