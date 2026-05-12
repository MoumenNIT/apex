-- Insert placeholder products into the database
-- Run this in your Supabase SQL editor

-- Insert Products
INSERT INTO products (name, slug, tagline, category, brand, price, original_price, rating, review_count, badge, is_active, is_featured) VALUES
('Apex Predator X', 'apex-predator-x', 'Uncompromising 4K gaming dominance', 'Gaming PC', 'Apex', 3499, 3899, 4.9, 214, 'Best Seller', true, true),
('Volt Pro Creator', 'volt-pro-creator', '8K render-ready workstation for pros', 'Workstation', 'Volt', 4199, NULL, 4.8, 97, 'New', true, true),
('Stealth Mini G', 'stealth-mini-g', 'Full power, impossibly compact', 'Mini PC', 'Stealth', 1299, 1499, 4.7, 341, 'Popular', true, true),
('Titan Office Pro', 'titan-office-pro', 'Productivity powerhouse for enterprise', 'Office PC', 'Titan', 849, NULL, 4.6, 528, NULL, true, false),
('Nova Budget Gamer', 'nova-budget-gamer', '1080p esports ready at an unbeatable price', 'Gaming PC', 'Nova', 699, 799, 4.5, 892, 'Best Value', true, true),
('Apex Streamer S1', 'apex-streamer-s1', 'Built to broadcast, built to dominate', 'Gaming PC', 'Apex', 2199, 2499, 4.8, 163, 'Streamer Pick', true, true);

-- Insert Product Specs
-- For Apex Predator X
INSERT INTO product_specs (product_id, spec_key, spec_value) 
SELECT id, 'CPU', 'Intel Core i9-14900KS' FROM products WHERE slug = 'apex-predator-x'
UNION ALL
SELECT id, 'GPU', 'NVIDIA RTX 4090 24GB' FROM products WHERE slug = 'apex-predator-x'
UNION ALL
SELECT id, 'RAM', '64GB DDR5-6000' FROM products WHERE slug = 'apex-predator-x'
UNION ALL
SELECT id, 'Storage', '4TB NVMe Gen5 RAID' FROM products WHERE slug = 'apex-predator-x'
UNION ALL
SELECT id, 'Cooling', '360mm AIO Liquid' FROM products WHERE slug = 'apex-predator-x'
UNION ALL
SELECT id, 'Power Supply', '1000W 80+ Platinum' FROM products WHERE slug = 'apex-predator-x'
UNION ALL
SELECT id, 'OS', 'Windows 11 Pro' FROM products WHERE slug = 'apex-predator-x'
-- For Volt Pro Creator
UNION ALL
SELECT id, 'CPU', 'AMD Threadripper PRO 7975WX' FROM products WHERE slug = 'volt-pro-creator'
UNION ALL
SELECT id, 'GPU', 'NVIDIA RTX 4080 Super 16GB' FROM products WHERE slug = 'volt-pro-creator'
UNION ALL
SELECT id, 'RAM', '128GB DDR5-5600 ECC' FROM products WHERE slug = 'volt-pro-creator'
UNION ALL
SELECT id, 'Storage', '8TB NVMe + 16TB HDD' FROM products WHERE slug = 'volt-pro-creator'
UNION ALL
SELECT id, 'Cooling', 'Custom Dual-360mm Loop' FROM products WHERE slug = 'volt-pro-creator'
UNION ALL
SELECT id, 'Power Supply', '1200W 80+ Titanium' FROM products WHERE slug = 'volt-pro-creator'
UNION ALL
SELECT id, 'OS', 'Windows 11 Pro for Workstations' FROM products WHERE slug = 'volt-pro-creator'
-- For Stealth Mini G
UNION ALL
SELECT id, 'CPU', 'AMD Ryzen 9 7950X' FROM products WHERE slug = 'stealth-mini-g'
UNION ALL
SELECT id, 'GPU', 'AMD Radeon RX 7900 GRE 16GB' FROM products WHERE slug = 'stealth-mini-g'
UNION ALL
SELECT id, 'RAM', '32GB DDR5-5200' FROM products WHERE slug = 'stealth-mini-g'
UNION ALL
SELECT id, 'Storage', '2TB NVMe Gen4' FROM products WHERE slug = 'stealth-mini-g'
UNION ALL
SELECT id, 'Cooling', 'Custom Low-Profile 120mm AIO' FROM products WHERE slug = 'stealth-mini-g'
UNION ALL
SELECT id, 'Power Supply', '850W SFX 80+ Gold' FROM products WHERE slug = 'stealth-mini-g'
UNION ALL
SELECT id, 'OS', 'Windows 11 Home' FROM products WHERE slug = 'stealth-mini-g'
-- For Titan Office Pro
UNION ALL
SELECT id, 'CPU', 'Intel Core i7-13700' FROM products WHERE slug = 'titan-office-pro'
UNION ALL
SELECT id, 'GPU', 'Intel Arc A380 6GB' FROM products WHERE slug = 'titan-office-pro'
UNION ALL
SELECT id, 'RAM', '32GB DDR4-3200' FROM products WHERE slug = 'titan-office-pro'
UNION ALL
SELECT id, 'Storage', '1TB NVMe + 2TB HDD' FROM products WHERE slug = 'titan-office-pro'
UNION ALL
SELECT id, 'Cooling', 'Tower Air Cooler' FROM products WHERE slug = 'titan-office-pro'
UNION ALL
SELECT id, 'Power Supply', '650W 80+ Gold' FROM products WHERE slug = 'titan-office-pro'
UNION ALL
SELECT id, 'OS', 'Windows 11 Pro' FROM products WHERE slug = 'titan-office-pro'
-- For Nova Budget Gamer
UNION ALL
SELECT id, 'CPU', 'AMD Ryzen 5 7600' FROM products WHERE slug = 'nova-budget-gamer'
UNION ALL
SELECT id, 'GPU', 'NVIDIA RTX 4060 8GB' FROM products WHERE slug = 'nova-budget-gamer'
UNION ALL
SELECT id, 'RAM', '16GB DDR5-4800' FROM products WHERE slug = 'nova-budget-gamer'
UNION ALL
SELECT id, 'Storage', '1TB NVMe Gen4' FROM products WHERE slug = 'nova-budget-gamer'
UNION ALL
SELECT id, 'Cooling', '120mm AIO' FROM products WHERE slug = 'nova-budget-gamer'
UNION ALL
SELECT id, 'Power Supply', '550W 80+ Bronze' FROM products WHERE slug = 'nova-budget-gamer'
UNION ALL
SELECT id, 'OS', 'Windows 11 Home' FROM products WHERE slug = 'nova-budget-gamer'
-- For Apex Streamer S1
UNION ALL
SELECT id, 'CPU', 'Intel Core i7-14700K' FROM products WHERE slug = 'apex-streamer-s1'
UNION ALL
SELECT id, 'GPU', 'NVIDIA RTX 4070 Ti Super 16GB' FROM products WHERE slug = 'apex-streamer-s1'
UNION ALL
SELECT id, 'RAM', '32GB DDR5-6000' FROM products WHERE slug = 'apex-streamer-s1'
UNION ALL
SELECT id, 'Storage', '2TB NVMe + 4TB HDD' FROM products WHERE slug = 'apex-streamer-s1'
UNION ALL
SELECT id, 'Cooling', '280mm AIO' FROM products WHERE slug = 'apex-streamer-s1'
UNION ALL
SELECT id, 'Power Supply', '850W 80+ Gold' FROM products WHERE slug = 'apex-streamer-s1'
UNION ALL
SELECT id, 'OS', 'Windows 11 Home' FROM products WHERE slug = 'apex-streamer-s1';

-- Insert Product Highlights
-- For Apex Predator X
INSERT INTO product_highlights (product_id, highlight_text) 
SELECT id, '4K Ultra at 144fps+' FROM products WHERE slug = 'apex-predator-x'
UNION ALL
SELECT id, 'PCIe 5.0 storage' FROM products WHERE slug = 'apex-predator-x'
UNION ALL
SELECT id, 'Wi-Fi 7 & BT 5.4' FROM products WHERE slug = 'apex-predator-x'
UNION ALL
SELECT id, '3-yr warranty' FROM products WHERE slug = 'apex-predator-x'
-- For Volt Pro Creator
UNION ALL
SELECT id, 'ECC memory for stability' FROM products WHERE slug = 'volt-pro-creator'
UNION ALL
SELECT id, 'Thunderbolt 4 x4' FROM products WHERE slug = 'volt-pro-creator'
UNION ALL
SELECT id, '10GbE networking' FROM products WHERE slug = 'volt-pro-creator'
UNION ALL
SELECT id, '5-yr on-site warranty' FROM products WHERE slug = 'volt-pro-creator'
-- For Stealth Mini G
UNION ALL
SELECT id, 'ITX form factor 6L' FROM products WHERE slug = 'stealth-mini-g'
UNION ALL
SELECT id, 'PCIe 4.0 x4 NVMe' FROM products WHERE slug = 'stealth-mini-g'
UNION ALL
SELECT id, 'USB4 40Gbps' FROM products WHERE slug = 'stealth-mini-g'
UNION ALL
SELECT id, 'Silent fan curve' FROM products WHERE slug = 'stealth-mini-g'
-- For Titan Office Pro
UNION ALL
SELECT id, 'vPro remote management' FROM products WHERE slug = 'titan-office-pro'
UNION ALL
SELECT id, 'Dual 4K display support' FROM products WHERE slug = 'titan-office-pro'
UNION ALL
SELECT id, 'TPM 2.0 security' FROM products WHERE slug = 'titan-office-pro'
UNION ALL
SELECT id, '5yr business warranty' FROM products WHERE slug = 'titan-office-pro'
-- For Nova Budget Gamer
UNION ALL
SELECT id, '1080p esports ready' FROM products WHERE slug = 'nova-budget-gamer'
UNION ALL
SELECT id, 'PCIe 4.0 support' FROM products WHERE slug = 'nova-budget-gamer'
UNION ALL
SELECT id, 'RGB lighting' FROM products WHERE slug = 'nova-budget-gamer'
UNION ALL
SELECT id, '3yr warranty' FROM products WHERE slug = 'nova-budget-gamer'
-- For Apex Streamer S1
UNION ALL
SELECT id, 'Dual-PC in one chassis' FROM products WHERE slug = 'apex-streamer-s1'
UNION ALL
SELECT id, 'AV1 encode/decode' FROM products WHERE slug = 'apex-streamer-s1'
UNION ALL
SELECT id, 'Capture card ready' FROM products WHERE slug = 'apex-streamer-s1'
UNION ALL
SELECT id, 'OBS-optimised BIOS' FROM products WHERE slug = 'apex-streamer-s1';

-- Verify the data was inserted
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_specs FROM product_specs;
SELECT COUNT(*) as total_highlights FROM product_highlights;
