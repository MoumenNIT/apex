-- ApexSys E-Commerce Database Schema
-- This schema defines the complete database structure for the electronics store

-- ===================================================================
-- 1. USERS TABLE (extends Supabase auth)
-- ===================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- ===================================================================
-- 2. PRODUCTS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  tagline TEXT,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  stock_quantity INTEGER DEFAULT 0,
  rating DECIMAL(2, 1) DEFAULT 4.5,
  review_count INTEGER DEFAULT 0,
  badge TEXT,
  image_url TEXT,
  emoji TEXT DEFAULT '🖥️',
  color TEXT DEFAULT '#e63946',
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active);

-- ===================================================================
-- 3. PRODUCT SPECIFICATIONS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS product_specs (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  spec_key TEXT NOT NULL,
  spec_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_specs_product_id ON product_specs(product_id);

-- ===================================================================
-- 4. PRODUCT HIGHLIGHTS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS product_highlights (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  highlight_text TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_highlights_product_id ON product_highlights(product_id);

-- ===================================================================
-- 5. ORDERS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT DEFAULT 'US',
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ===================================================================
-- 6. ORDER ITEMS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  line_total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ===================================================================
-- 7. REVIEWS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE UNIQUE INDEX idx_reviews_unique_product_user ON reviews(product_id, user_id);

-- ===================================================================
-- 8. WISHLIST TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS wishlist_items (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wishlist_user_id ON wishlist_items(user_id);
CREATE INDEX idx_wishlist_product_id ON wishlist_items(product_id);
CREATE UNIQUE INDEX idx_wishlist_unique_user_product ON wishlist_items(user_id, product_id);

-- ===================================================================
-- 9. CART TABLE (persistent carts)
-- ===================================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cart_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_product_id ON cart_items(product_id);
CREATE UNIQUE INDEX idx_cart_unique_user_product ON cart_items(user_id, product_id);

-- ===================================================================
-- 10. CATEGORIES TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- ===================================================================
-- 11. BRANDS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS brands (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brands_slug ON brands(slug);

-- ===================================================================
-- 12. PROMOTIONS/COUPONS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS coupons (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase_amount DECIMAL(10, 2),
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  expiry_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);

-- ===================================================================
-- 13. ANALYTICS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS analytics (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  product_id BIGINT REFERENCES products(id),
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);

-- ===================================================================
-- SAMPLE DATA - DELETE BEFORE PRODUCTION
-- ===================================================================

-- Insert Categories
INSERT INTO categories (name, slug, description, icon) VALUES
('Gaming PC', 'gaming-pc', 'High-performance gaming computers', '🎮'),
('Workstation', 'workstation', 'Professional workstations for creators', '🎨'),
('Mini PC', 'mini-pc', 'Compact but powerful computers', '📦'),
('Office PC', 'office-pc', 'Productivity machines for business', '💼');

-- Insert Brands
INSERT INTO brands (name, slug, description, logo_url) VALUES
('Apex', 'apex', 'Premium high-performance systems', NULL),
('Volt', 'volt', 'Power-packed workstations', NULL),
('Stealth', 'stealth', 'Compact computing solutions', NULL),
('Titan', 'titan', 'Enterprise-grade systems', NULL),
('Nova', 'nova', 'Budget-friendly gaming', NULL);

-- Insert Products
INSERT INTO products (name, slug, description, tagline, category, brand, price, original_price, stock_quantity, rating, review_count, badge, emoji, color, is_featured, is_active)
VALUES
('Apex Predator X', 'apex-predator-x', 'Uncompromising 4K gaming dominance with latest gen hardware', 'Uncompromising 4K gaming dominance', 'Gaming PC', 'Apex', 3499.99, 3899.99, 15, 4.9, 214, 'Best Seller', '🔴', '#e63946', TRUE, TRUE),
('Volt Pro Creator', 'volt-pro-creator', 'Professional 8K render-ready workstation', '8K render-ready workstation for pros', 'Workstation', 'Volt', 4199.99, NULL, 8, 4.8, 97, 'New', '🟣', '#8e44ad', TRUE, TRUE),
('Stealth Mini G', 'stealth-mini-g', 'Full power in a compact 6L chassis', 'Full power, impossibly compact', 'Mini PC', 'Stealth', 1299.99, 1499.99, 22, 4.7, 341, 'Popular', '🟢', '#27ae60', TRUE, TRUE),
('Titan Office Pro', 'titan-office-pro', 'Enterprise-grade productivity PC', 'Productivity powerhouse for enterprise', 'Office PC', 'Titan', 849.99, NULL, 30, 4.6, 528, NULL, '🔵', '#2980b9', FALSE, TRUE),
('Nova Budget Gamer', 'nova-budget-gamer', '1080p gaming at unbeatable price point', '1080p esports ready at an unbeatable price', 'Gaming PC', 'Nova', 699.99, 799.99, 25, 4.5, 892, 'Best Value', '🟡', '#f39c12', TRUE, TRUE),
('Apex Streamer S1', 'apex-streamer-s1', 'Optimized for streaming and gaming', 'Built to broadcast, built to dominate', 'Gaming PC', 'Apex', 2199.99, 2499.99, 12, 4.8, 163, 'Streamer Pick', '🔴', '#e74c3c', TRUE, TRUE);

-- Insert Product Specs for Apex Predator X (id=1)
INSERT INTO product_specs (product_id, spec_key, spec_value) VALUES
(1, 'CPU', 'Intel Core i9-14900KS'),
(1, 'GPU', 'NVIDIA RTX 4090 24GB'),
(1, 'RAM', '64GB DDR5-6000'),
(1, 'Storage', '4TB NVMe Gen5 RAID'),
(1, 'Cooling', '360mm AIO Liquid'),
(1, 'PSU', '1000W 80+ Platinum'),
(1, 'OS', 'Windows 11 Pro');

-- Insert Product Highlights for Apex Predator X
INSERT INTO product_highlights (product_id, highlight_text, display_order) VALUES
(1, '4K Ultra at 144fps+', 1),
(1, 'PCIe 5.0 storage', 2),
(1, 'Wi-Fi 7 & BT 5.4', 3),
(1, '3-yr warranty', 4);

-- Insert Product Specs for Volt Pro Creator (id=2)
INSERT INTO product_specs (product_id, spec_key, spec_value) VALUES
(2, 'CPU', 'AMD Threadripper PRO 7975WX'),
(2, 'GPU', 'NVIDIA RTX 4080 Super 16GB'),
(2, 'RAM', '128GB DDR5-5600 ECC'),
(2, 'Storage', '8TB NVMe + 16TB HDD'),
(2, 'Cooling', 'Custom Dual-360mm Loop'),
(2, 'PSU', '1200W 80+ Titanium'),
(2, 'OS', 'Windows 11 Pro for Workstations');

INSERT INTO product_highlights (product_id, highlight_text, display_order) VALUES
(2, 'ECC memory for stability', 1),
(2, 'Thunderbolt 4 x4', 2),
(2, '10GbE networking', 3),
(2, '5-yr on-site warranty', 4);

-- Insert Product Specs for Stealth Mini G (id=3)
INSERT INTO product_specs (product_id, spec_key, spec_value) VALUES
(3, 'CPU', 'AMD Ryzen 9 7950X'),
(3, 'GPU', 'AMD Radeon RX 7900 GRE 16GB'),
(3, 'RAM', '32GB DDR5-5200'),
(3, 'Storage', '2TB NVMe Gen4'),
(3, 'Cooling', 'Custom Low-Profile 120mm AIO'),
(3, 'PSU', '850W SFX 80+ Gold'),
(3, 'OS', 'Windows 11 Home');

INSERT INTO product_highlights (product_id, highlight_text, display_order) VALUES
(3, 'ITX form factor 6L', 1),
(3, 'PCIe 4.0 x4 NVMe', 2),
(3, 'USB4 40Gbps', 3),
(3, 'Silent fan curve', 4);

-- Insert Product Specs for Titan Office Pro (id=4)
INSERT INTO product_specs (product_id, spec_key, spec_value) VALUES
(4, 'CPU', 'Intel Core i7-13700'),
(4, 'GPU', 'Intel Arc A380 6GB'),
(4, 'RAM', '32GB DDR4-3200'),
(4, 'Storage', '1TB NVMe + 2TB HDD'),
(4, 'Cooling', 'Tower Air Cooler'),
(4, 'PSU', '650W 80+ Gold'),
(4, 'OS', 'Windows 11 Pro');

INSERT INTO product_highlights (product_id, highlight_text, display_order) VALUES
(4, 'vPro remote management', 1),
(4, 'Dual 4K display support', 2),
(4, 'TPM 2.0 security', 3),
(4, '5yr business warranty', 4);

-- Insert Product Specs for Nova Budget Gamer (id=5)
INSERT INTO product_specs (product_id, spec_key, spec_value) VALUES
(5, 'CPU', 'AMD Ryzen 5 7600'),
(5, 'GPU', 'NVIDIA RTX 4060 8GB'),
(5, 'RAM', '16GB DDR5-4800'),
(5, 'Storage', '1TB NVMe Gen4'),
(5, 'Cooling', '120mm AIO'),
(5, 'PSU', '550W 80+ Bronze'),
(5, 'OS', 'Windows 11 Home');

INSERT INTO product_highlights (product_id, highlight_text, display_order) VALUES
(5, '1440p capable', 1),
(5, 'DLSS 3 Frame Gen', 2),
(5, 'RGB lighting', 3),
(5, 'Upgradeable platform', 4);

-- Insert Product Specs for Apex Streamer S1 (id=6)
INSERT INTO product_specs (product_id, spec_key, spec_value) VALUES
(6, 'CPU', 'Intel Core i7-14700K'),
(6, 'GPU', 'NVIDIA RTX 4070 Ti Super 16GB'),
(6, 'RAM', '32GB DDR5-6000'),
(6, 'Storage', '2TB NVMe + 4TB HDD'),
(6, 'Cooling', '280mm AIO'),
(6, 'PSU', '850W 80+ Gold'),
(6, 'OS', 'Windows 11 Home');

INSERT INTO product_highlights (product_id, highlight_text, display_order) VALUES
(6, 'Dual-PC in one chassis', 1),
(6, 'AV1 encode/decode', 2),
(6, 'Capture card ready', 3),
(6, 'OBS-optimised BIOS', 4);

-- ===================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Everyone can view active products
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = TRUE);

-- Users can only see their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can see order items for their orders
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- Users can manage their own wishlist
CREATE POLICY "Users can manage own wishlist" ON wishlist_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to wishlist" ON wishlist_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from wishlist" ON wishlist_items
  FOR DELETE USING (auth.uid() = user_id);

-- Users can manage their own cart
CREATE POLICY "Users can manage own cart" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to cart" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update cart" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can remove from cart" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Users can view reviews
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can manage own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- ===================================================================
-- END OF SCHEMA
-- ===================================================================
