-- ============================================================================
-- Ahnajak Topup — Cloudflare D1 (SQLite) Schema
-- ============================================================================

-- ----------------------------------------------------------------------------
-- users
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name  TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS profiles (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL UNIQUE,
  email          TEXT,
  display_name   TEXT,
  wallet_balance REAL NOT NULL DEFAULT 0.0,
  reward_points  INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- user_roles
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_roles (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, role),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- site_settings (key-value store with JSON values)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS site_settings (
  id         TEXT PRIMARY KEY,
  key        TEXT NOT NULL UNIQUE,
  value      TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------------------
-- games
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS games (
  id                   TEXT PRIMARY KEY,
  name                 TEXT NOT NULL,
  image                TEXT,
  description          TEXT,
  sort_order           INTEGER DEFAULT 0,
  slug                 TEXT UNIQUE,
  g2bulk_category_id   TEXT,
  default_package_icon TEXT,
  cover_image          TEXT,
  tags                 TEXT,
  created_at           TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at           TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------------------
-- packages
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS packages (
  id                   TEXT PRIMARY KEY,
  game_id              TEXT NOT NULL,
  name                 TEXT NOT NULL,
  amount               TEXT NOT NULL,
  price                REAL NOT NULL,
  icon                 TEXT,
  sort_order           INTEGER DEFAULT 0,
  label                TEXT,
  label_bg_color       TEXT DEFAULT '#dc2626',
  label_text_color     TEXT DEFAULT '#ffffff',
  label_icon           TEXT,
  g2bulk_product_id    TEXT,
  g2bulk_type_id       TEXT,
  quantity             INTEGER,
  points               INTEGER DEFAULT 0,
  price_markup_percent REAL,
  created_at           TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at           TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_packages_game ON packages (game_id);

-- ----------------------------------------------------------------------------
-- special_packages
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS special_packages (
  id                   TEXT PRIMARY KEY,
  game_id              TEXT NOT NULL,
  name                 TEXT NOT NULL,
  amount               TEXT NOT NULL,
  price                REAL NOT NULL,
  icon                 TEXT,
  sort_order           INTEGER DEFAULT 0,
  label                TEXT,
  label_bg_color       TEXT DEFAULT '#dc2626',
  label_text_color     TEXT DEFAULT '#ffffff',
  label_icon           TEXT,
  g2bulk_product_id    TEXT,
  g2bulk_type_id       TEXT,
  quantity             INTEGER,
  points               INTEGER DEFAULT 0,
  price_markup_percent REAL,
  created_at           TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at           TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_special_packages_game ON special_packages (game_id);

-- ----------------------------------------------------------------------------
-- preorder_packages
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS preorder_packages (
  id                    TEXT PRIMARY KEY,
  game_id               TEXT NOT NULL,
  name                  TEXT NOT NULL,
  amount                TEXT NOT NULL,
  price                 REAL NOT NULL,
  icon                  TEXT,
  sort_order            INTEGER DEFAULT 0,
  label                 TEXT,
  label_bg_color        TEXT DEFAULT '#dc2626',
  label_text_color      TEXT DEFAULT '#ffffff',
  label_icon            TEXT,
  g2bulk_product_id     TEXT,
  g2bulk_type_id        TEXT,
  quantity              INTEGER,
  scheduled_fulfill_at  TEXT,
  points                INTEGER DEFAULT 0,
  price_markup_percent  REAL,
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_preorder_packages_game ON preorder_packages (game_id);

-- ----------------------------------------------------------------------------
-- preorder_games
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS preorder_games (
  id         TEXT PRIMARY KEY,
  game_id    TEXT NOT NULL UNIQUE,
  is_active  INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- topup_orders
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS topup_orders (
  id                TEXT PRIMARY KEY,
  user_id           TEXT,
  game_name         TEXT NOT NULL,
  package_name      TEXT NOT NULL,
  player_id         TEXT NOT NULL,
  server_id         TEXT,
  player_name       TEXT,
  amount            REAL NOT NULL,
  currency          TEXT DEFAULT 'USD',
  payment_method    TEXT,
  g2bulk_order_id   TEXT,
  g2bulk_product_id TEXT,
  card_codes        TEXT,
  status            TEXT DEFAULT 'pending',
  status_message    TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_topup_orders_user ON topup_orders (user_id);
CREATE INDEX IF NOT EXISTS idx_topup_orders_status ON topup_orders (status);
CREATE INDEX IF NOT EXISTS idx_topup_orders_created ON topup_orders (created_at);

-- ----------------------------------------------------------------------------
-- preorder_orders
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS preorder_orders (
  id                   TEXT PRIMARY KEY,
  user_id              TEXT,
  game_name            TEXT NOT NULL,
  package_name         TEXT NOT NULL,
  player_id            TEXT NOT NULL,
  server_id            TEXT,
  player_name          TEXT,
  amount               REAL NOT NULL,
  currency             TEXT DEFAULT 'USD',
  payment_method       TEXT,
  g2bulk_order_id      TEXT,
  g2bulk_product_id    TEXT,
  card_codes           TEXT,
  status               TEXT NOT NULL DEFAULT 'notpaid',
  status_message       TEXT,
  scheduled_fulfill_at TEXT,
  created_at           TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at           TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_preorder_orders_user ON preorder_orders (user_id);
CREATE INDEX IF NOT EXISTS idx_preorder_orders_status ON preorder_orders (status);

-- ----------------------------------------------------------------------------
-- payment_gateways
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS payment_gateways (
  id         TEXT PRIMARY KEY,
  slug       TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  enabled    INTEGER DEFAULT 1,
  config     TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------------------
-- payment_qr_settings
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS payment_qr_settings (
  id             TEXT PRIMARY KEY,
  payment_method TEXT NOT NULL,
  qr_code_image  TEXT,
  bank_name       TEXT,
  account_name    TEXT,
  account_number  TEXT,
  instructions    TEXT,
  is_enabled     INTEGER DEFAULT 0,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------------------
-- api_configurations
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS api_configurations (
  id          TEXT PRIMARY KEY,
  api_name    TEXT NOT NULL UNIQUE,
  api_uid     TEXT,
  api_secret  TEXT,
  is_enabled  INTEGER DEFAULT 0,
  use_sandbox INTEGER DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------------------
-- game_verification_configs
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS game_verification_configs (
  id            TEXT PRIMARY KEY,
  game_name     TEXT NOT NULL,
  api_code      TEXT NOT NULL,
  api_provider  TEXT DEFAULT 'g2bulk',
  requires_zone INTEGER NOT NULL DEFAULT 0,
  zone_label    TEXT,
  zone_options  TEXT,
  is_enabled    INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------------------
-- event_banners
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS event_banners (
  id         TEXT PRIMARY KEY,
  title      TEXT,
  image      TEXT NOT NULL,
  link       TEXT,
  is_active  INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------------------
-- coupons
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS coupons (
  id              TEXT PRIMARY KEY,
  code            TEXT NOT NULL UNIQUE,
  discount_type   TEXT NOT NULL,
  discount_value  REAL NOT NULL,
  min_order_amount REAL DEFAULT 0,
  max_discount    REAL,
  start_date      TEXT,
  end_date        TEXT,
  usage_limit     INTEGER,
  times_used      INTEGER NOT NULL DEFAULT 0,
  is_active       INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------------------
-- point_transactions
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS point_transactions (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL,
  amount       INTEGER NOT NULL,
  type         TEXT NOT NULL,
  description  TEXT,
  reference_id TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_point_tx_user ON point_transactions (user_id);

-- ----------------------------------------------------------------------------
-- point_exchange_configs
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS point_exchange_configs (
  id              TEXT PRIMARY KEY,
  points_required INTEGER NOT NULL,
  discount_type   TEXT NOT NULL,
  discount_value  REAL NOT NULL,
  min_spend       REAL DEFAULT 0,
  max_discount    REAL,
  is_active       INTEGER NOT NULL DEFAULT 1,
  sort_order      INTEGER DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------------------
-- wallet_transactions
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL,
  type           TEXT NOT NULL,
  amount         REAL NOT NULL,
  balance_before REAL NOT NULL,
  balance_after  REAL NOT NULL,
  description    TEXT,
  reference_id   TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON wallet_transactions (user_id);

-- ----------------------------------------------------------------------------
-- events
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS events (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  image       TEXT,
  link        TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER DEFAULT 0,
  start_date  TEXT,
  end_date    TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------------------
-- g2bulk_products
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS g2bulk_products (
  id                TEXT PRIMARY KEY,
  g2bulk_type_id    TEXT NOT NULL,
  g2bulk_product_id TEXT NOT NULL UNIQUE,
  game_name         TEXT NOT NULL,
  product_name      TEXT NOT NULL,
  denomination      TEXT,
  price             REAL NOT NULL,
  currency          TEXT DEFAULT 'USD',
  fields            TEXT,
  is_active         INTEGER DEFAULT 1,
  product_type      TEXT DEFAULT 'recharge',
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_g2bulk_game ON g2bulk_products (game_name);
CREATE INDEX IF NOT EXISTS idx_g2bulk_active ON g2bulk_products (is_active);
CREATE INDEX IF NOT EXISTS idx_g2bulk_type ON g2bulk_products (product_type);

-- ============================================================
-- SAAS CONTROL PLANE & MULTI-TENANT PROVISIONING TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS saas_customers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS saas_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS saas_product_versions (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  version TEXT NOT NULL,
  docker_image_tag TEXT NOT NULL,
  is_latest INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES saas_products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS saas_sites (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  product_id TEXT,
  version_id TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  database_name TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  internal_port INTEGER,
  admin_email TEXT,
  admin_initial_password TEXT,
  topup_api_key TEXT,
  topup_api_secret TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES saas_customers(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_saas_sites_slug ON saas_sites(slug);
CREATE INDEX IF NOT EXISTS idx_saas_sites_customer ON saas_sites(customer_id);
CREATE INDEX IF NOT EXISTS idx_saas_sites_status ON saas_sites(status);

CREATE TABLE IF NOT EXISTS saas_site_domains (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  is_primary INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (site_id) REFERENCES saas_sites(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS saas_orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  product_id TEXT,
  site_id TEXT,
  amount REAL NOT NULL DEFAULT 0.0,
  status TEXT NOT NULL DEFAULT 'PAID',
  payment_method TEXT NOT NULL DEFAULT 'FREE_TIER',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES saas_customers(id) ON DELETE CASCADE,
  FOREIGN KEY (site_id) REFERENCES saas_sites(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_saas_orders_customer ON saas_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_saas_orders_site ON saas_orders(site_id);

CREATE TABLE IF NOT EXISTS saas_provision_jobs (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  order_id TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  current_step TEXT NOT NULL DEFAULT 'STEP_VALIDATE',
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (site_id) REFERENCES saas_sites(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES saas_orders(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_saas_jobs_site ON saas_provision_jobs(site_id);
CREATE INDEX IF NOT EXISTS idx_saas_jobs_order ON saas_provision_jobs(order_id);

CREATE TABLE IF NOT EXISTS saas_provision_logs (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  step TEXT NOT NULL,
  message TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'INFO',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (job_id) REFERENCES saas_provision_jobs(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_saas_logs_job ON saas_provision_logs(job_id);


