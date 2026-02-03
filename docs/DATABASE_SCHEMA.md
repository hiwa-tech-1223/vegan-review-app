# VeganBite Database Schema

## 現在のテーブル構成

```
admins              - 管理者
users               - 一般ユーザー
categories          - カテゴリ
products            - 商品
product_categories  - 商品-カテゴリ中間テーブル（多対多）
reviews             - レビュー
favorites           - お気に入り
```

> **Note:** 現在のDBはレビューサイトとしての機能のみを持ち、EC用のカラム（price, stock_quantity等）は含まれていません。EC機能は必要になった時点で追加します（YAGNI原則）。

---

## 将来追加予定（EC拡張）

### Phase 2: EC機能

追加予定時期: 2025年2月〜3月

#### addresses（配送先住所）

```sql
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    postal_code VARCHAR(10) NOT NULL,        -- 郵便番号
    prefecture VARCHAR(50) NOT NULL,         -- 都道府県
    city VARCHAR(100) NOT NULL,              -- 市区町村
    address_line TEXT NOT NULL,              -- 番地・建物名
    is_default BOOLEAN DEFAULT FALSE,        -- デフォルト住所
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
```

#### carts（カート）

```sql
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- 1ユーザー1カート
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### cart_items（カート内商品）

```sql
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cart_id, product_id)
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
```

#### orders（注文）

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    address_id UUID NOT NULL REFERENCES addresses(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',  -- pending, paid, shipped, delivered, cancelled
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    ordered_at TIMESTAMP,                           -- 注文確定日時
    shipped_at TIMESTAMP,                           -- 発送日時
    delivered_at TIMESTAMP,                         -- 配達完了日時
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_ordered_at ON orders(ordered_at DESC);
```

#### order_items（注文商品明細）

```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL,            -- 購入時価格（スナップショット）
    product_name VARCHAR(255) NOT NULL,      -- 購入時商品名（スナップショット）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

---

### Phase 3: 決済・配送

追加予定時期: 2025年4月以降

#### payments（決済情報）

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    stripe_payment_id VARCHAR(255),          -- Stripe決済ID
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'JPY',
    status VARCHAR(50) NOT NULL,             -- pending, succeeded, failed, refunded
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_stripe_id ON payments(stripe_payment_id);
```

#### shipping_methods（配送方法）

```sql
CREATE TABLE shipping_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,              -- 'Standard', 'Express'
    name_ja VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    estimated_days INTEGER,                  -- 配送予定日数
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### Phase 4: マーケットプレイス（オプション）

追加予定時期: 未定

#### vendors（出品者）

```sql
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_name_ja VARCHAR(255),
    description TEXT,
    logo_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',    -- pending, approved, suspended
    commission_rate DECIMAL(4,2) DEFAULT 10.00,  -- 手数料率（%）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- products テーブルに追加するカラム
-- vendor_id UUID REFERENCES vendors(id)
```

---

### Phase 5: 監査ログ（オプション）

追加予定時期: 必要になった時

#### audit_logs（監査ログ）

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admins(id),
    action VARCHAR(50) NOT NULL,             -- create, update, delete
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

---

## ER図（将来の完成形）

```
                        admins ◄──────────────────────────────────┐
                           │                                      │
              ┌────────────┼────────────┐                         │
              │            │            │                         │
              ▼            ▼            ▼                         │
         categories ◄── products ──► audit_logs                   │
                           │                                      │
          ┌────────────────┼────────────────┐                     │
          │                │                │                     │
          ▼                ▼                ▼                     │
       reviews         favorites         vendors                  │
          │                │                                      │
          └────────┬───────┘                                      │
                   │                                              │
                   ▼                                              │
                 users                                            │
                   │                                              │
     ┌─────────────┼─────────────┐                                │
     │             │             │                                │
     ▼             ▼             ▼                                │
 addresses      carts         orders ──────► payments             │
                   │             │                                │
                   ▼             ▼                                │
             cart_items    order_items                            │
```

---

## マイグレーション命名規則

```
000001_create_admins_table
000002_create_users_table
...
000100_create_addresses_table      ← EC Phase 2
000101_create_carts_table
000102_create_cart_items_table
000103_create_orders_table
000104_create_order_items_table
000200_create_payments_table       ← Phase 3
000201_create_shipping_methods_table
000300_create_vendors_table        ← Phase 4
000400_create_audit_logs_table     ← Phase 5
```

---

## チェックリスト

### EC機能追加時に必要な作業

- [ ] products テーブルに price, stock_quantity, is_available カラムを追加
- [ ] users テーブルに phone カラムを追加
- [ ] addresses テーブル作成
- [ ] carts テーブル作成
- [ ] cart_items テーブル作成
- [ ] orders テーブル作成
- [ ] order_items テーブル作成
- [ ] バックエンドにモデル追加
- [ ] API エンドポイント追加
- [ ] フロントエンドにカート/注文画面追加

### 決済機能追加時に必要な作業

- [ ] payments テーブル作成
- [ ] shipping_methods テーブル作成
- [ ] Stripe アカウント設定
- [ ] Webhook 実装
- [ ] 注文確認メール実装
