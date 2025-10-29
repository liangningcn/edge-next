-- 初始数据库架构迁移
-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8))) || '-' || lower(hex(randomblob(4))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    locale TEXT DEFAULT 'en',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建产品表
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8))) || '-' || lower(hex(randomblob(4))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))),
    sku TEXT UNIQUE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    inventory INTEGER DEFAULT 0,
    category TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建产品翻译表
CREATE TABLE IF NOT EXISTS product_translations (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8))) || '-' || lower(hex(randomblob(4))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))),
    product_id TEXT NOT NULL,
    locale TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    features TEXT, -- JSON格式存储
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, locale),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 创建订单表
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8))) || '-' || lower(hex(randomblob(4))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))),
    user_id TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address TEXT, -- JSON格式存储
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建订单项表
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8))) || '-' || lower(hex(randomblob(4))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))),
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 创建咨询表
CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8))) || '-' || lower(hex(randomblob(4))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))),
    user_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    locale TEXT DEFAULT 'en',
    status TEXT DEFAULT 'NEW' CHECK(status IN ('NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

CREATE INDEX IF NOT EXISTS idx_product_translations_locale ON product_translations(locale);
CREATE INDEX IF NOT EXISTS idx_product_translations_created_at ON product_translations(created_at);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);

-- 插入示例数据
-- 示例产品
INSERT OR IGNORE INTO products (id, sku, price, inventory, category) VALUES 
('prod_001', 'FINE-001', 299.00, 50, 'fine_lines'),
('prod_002', 'DERM-001', 399.00, 30, 'dermal_fillers'),
('prod_003', 'DEEP-001', 499.00, 20, 'deep_wrinkles'),
('prod_004', 'ULTRA-001', 599.00, 15, 'ultra_deep'),
('prod_005', 'VOL-001', 699.00, 25, 'volume_enhancement'),
('prod_006', 'CAHA-001', 799.00, 10, 'special_formulations'),
('prod_007', 'PLLA-001', 899.00, 8, 'special_formulations'),
('prod_008', 'COMBO-001', 1299.00, 5, 'special_formulations');

-- 英语产品翻译
INSERT OR IGNORE INTO product_translations (product_id, locale, name, description, features) VALUES 
('prod_001', 'en', 'Fine Lines Filler', 'Advanced formula for fine lines and subtle enhancements', '{"duration": "6-9 months", "application": "Subtle enhancement", "results": "Natural-looking refinement"}'),
('prod_002', 'en', 'Dermal Enhancement', 'Professional dermal filler for natural-looking results', '{"duration": "9-12 months", "application": "Mid-depth injection", "results": "Volume restoration"}'),
('prod_003', 'en', 'Deep Wrinkle Solution', 'Powerful solution for deep wrinkles and volume loss', '{"duration": "12-18 months", "application": "Deep tissue injection", "results": "Significant improvement"}'),
('prod_004', 'en', 'Ultra Deep Filler', 'Ultra-deep formulation for significant volume restoration', '{"duration": "18-24 months", "application": "Ultra-deep injection", "results": "Maximum volume enhancement"}'),
('prod_005', 'en', 'Volume Booster 10ml', 'High-volume formulation for comprehensive enhancement', '{"duration": "12-15 months", "application": "Volume enhancement", "results": "Full facial rejuvenation"}'),
('prod_006', 'en', 'CAHA Complex', 'Advanced calcium hydroxylapatite formulation', '{"duration": "18-24 months", "application": "Collagen stimulation", "results": "Long-term improvement"}'),
('prod_007', 'en', 'PLLA Stimulator', 'Poly-L-lactic acid for collagen stimulation', '{"duration": "24+ months", "application": "Biostimulation", "results": "Progressive improvement"}'),
('prod_008', 'en', 'Premium Combo Pack', 'Complete professional treatment package', '{"duration": "Customizable", "application": "Comprehensive treatment", "results": "Optimal outcomes"}');

-- 德语产品翻译
INSERT OR IGNORE INTO product_translations (product_id, locale, name, description, features) VALUES 
('prod_001', 'de', 'Feine Linien Füller', 'Fortgeschrittene Formel für feine Linien und subtile Verbesserungen', '{"duration": "6-9 Monate", "application": "Subtile Verbesserung", "results": "Natürlich aussehende Verfeinerung"}'),
('prod_002', 'de', 'Dermale Verbesserung', 'Professioneller Dermalfüller für natürlich aussehende Ergebnisse', '{"duration": "9-12 Monate", "application": "Mitteltiefe Injektion", "results": "Volumenwiederherstellung"}'),
('prod_003', 'de', 'Tiefe Falten Lösung', 'Leistungsstarke Lösung für tiefe Falten und Volumenverlust', '{"duration": "12-18 Monate", "application": "Tiefgewebe-Injektion", "results": "Signifikante Verbesserung"}'),
('prod_004', 'de', 'Ultra Tief Füller', 'Ultra-tiefe Formulierung für signifikante Volumenwiederherstellung', '{"duration": "18-24 Monate", "application": "Ultra-tiefe Injektion", "results": "Maximale Volumenverbesserung"}');