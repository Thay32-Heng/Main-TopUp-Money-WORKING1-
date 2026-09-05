-- ============================================================================
-- Ahnajak Topup — Seed Data for Cloudflare D1 (SQLite)
-- Default admin: admin@ahnajak.com / admin123
-- ============================================================================

INSERT OR IGNORE INTO users (id, email, password_hash, display_name)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@ahnajak.com',
  '$2a$10$CbAjJHOQSPxxgPwlLOdwIOW284QnZYIEbLgzouzs5j.RuzxvwxUPe',
  'Admin'
);

INSERT OR IGNORE INTO profiles (id, user_id, email, display_name, wallet_balance, reward_points)
VALUES (
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000001',
  'admin@ahnajak.com',
  'Admin',
  0,
  0
);

INSERT OR IGNORE INTO user_roles (id, user_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000021',
  '00000000-0000-0000-0000-000000000001',
  'admin'
);

INSERT OR IGNORE INTO payment_gateways (id, slug, name, enabled, config)
VALUES
  ('gw-ikhode', 'ikhode-bakong', 'IKhode Bakong KHQR', 0, '{"node_api_url":"","websocket_url":"","webhook_secret":"","custom_webhook_url":""}'),
  ('gw-khqrcc', 'khqrcc', 'KHQRcc (ABA Pay)', 0, '{"profile_id":"","secret_key":"","checkout_url":"https://khqr.cc/api/payment/requestv2"}');

INSERT OR IGNORE INTO site_settings (id, key, value) VALUES
  ('s-1', 'siteName', '"Ahnajak Topup"'),
  ('s-2', 'logoUrl', '""'),
  ('s-3', 'logoSize', '64'),
  ('s-4', 'heroText', '"ជ្រើសរើសទំនិញ"'),
  ('s-5', 'primaryColor', '"#0ea5e9"'),
  ('s-6', 'accentColor', '"#0284c7"'),
  ('s-7', 'backgroundColor', '"#FFFFFF"'),
  ('s-8', 'browserTitle', '"Ahnajak Topup - Game Topup Cambodia"'),
  ('s-9', 'bannerHeight', '256');

INSERT OR IGNORE INTO games (id, name, image, description, sort_order, slug, default_package_icon)
VALUES
  ('game-mlbb', 'Mobile Legends: Bang Bang', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60', 'Top up MLBB diamonds instantly with KHQR', 1, 'mobile-legends', '💎'),
  ('game-pubg', 'PUBG Mobile', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=60', 'Top up PUBG Mobile UC fast & cheap', 2, 'pubg-mobile', '🪙'),
  ('game-ff', 'Free Fire', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=60', 'Free Fire Diamonds instant top up', 3, 'free-fire', '💎');

INSERT OR IGNORE INTO packages (id, game_id, name, amount, price, icon, sort_order)
VALUES
  ('pkg-ml-1', 'game-mlbb', '86 Diamonds', '86', 1.00, '💎', 1),
  ('pkg-ml-2', 'game-mlbb', '172 Diamonds', '172', 2.00, '💎', 2),
  ('pkg-ml-3', 'game-mlbb', '257 Diamonds', '257', 3.00, '💎', 3),
  ('pkg-ml-4', 'game-mlbb', '706 Diamonds', '706', 8.00, '💎', 4),
  ('pkg-ml-5', 'game-mlbb', '2194 Diamonds', '2194', 24.00, '💎', 5),
  ('pkg-pubg-1', 'game-pubg', '60 UC', '60', 0.99, '🪙', 1),
  ('pkg-pubg-2', 'game-pubg', '325 UC', '325', 4.99, '🪙', 2),
  ('pkg-pubg-3', 'game-pubg', '660 UC', '660', 9.99, '🪙', 3),
  ('pkg-ff-1', 'game-ff', '100 Diamonds', '100', 0.99, '💎', 1),
  ('pkg-ff-2', 'game-ff', '310 Diamonds', '310', 2.99, '💎', 2),
  ('pkg-ff-3', 'game-ff', '520 Diamonds', '520', 4.99, '💎', 3);
