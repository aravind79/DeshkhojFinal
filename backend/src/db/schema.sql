-- ============================================================
-- DeshKhoj PostgreSQL Migration Script
-- Run this on a fresh PostgreSQL database to set up the schema
-- that matches the existing MariaDB structure.
-- ============================================================

-- States
CREATE TABLE IF NOT EXISTS states (
  id SERIAL PRIMARY KEY,
  state_name TEXT NOT NULL,
  loc_state_name TEXT,
  slug TEXT NOT NULL
);

-- Districts
CREATE TABLE IF NOT EXISTS districts (
  id SERIAL PRIMARY KEY,
  district_name TEXT NOT NULL,
  loc_district_name TEXT,
  slug TEXT NOT NULL,
  state_id INTEGER REFERENCES states(id)
);

-- Blocks
CREATE TABLE IF NOT EXISTS blocks (
  id SERIAL PRIMARY KEY,
  block_name TEXT NOT NULL,
  loc_block_name TEXT,
  slug TEXT NOT NULL,
  district_id INTEGER REFERENCES districts(id)
);

-- Villages
CREATE TABLE IF NOT EXISTS villages (
  id SERIAL PRIMARY KEY,
  village_name TEXT NOT NULL,
  loc_village_name TEXT,
  slug TEXT NOT NULL,
  block_id INTEGER REFERENCES blocks(id)
);

-- Product Categories
CREATE TABLE IF NOT EXISTS product_category (
  id SERIAL PRIMARY KEY,
  cat_name TEXT NOT NULL,
  loc_cat_name TEXT,
  cat_desc TEXT,
  slug TEXT
);

-- Measure Units
CREATE TABLE IF NOT EXISTS measure_unit (
  id SERIAL PRIMARY KEY,
  unit_name TEXT NOT NULL,
  unit_short TEXT
);

-- User List (shopkeepers, agents, admins)
CREATE TABLE IF NOT EXISTS user_list (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE,
  password TEXT,
  name TEXT,
  mobile TEXT,
  email TEXT,
  state_id INTEGER,
  district_id INTEGER,
  block_id INTEGER,
  village_id INTEGER,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dukaan (Business) Listings
CREATE TABLE IF NOT EXISTS dukaan_list (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES user_list(id),
  dukaan_name TEXT NOT NULL,
  dukaan_addr TEXT,
  dukaandar_name TEXT,
  contact_no TEXT,
  dukaan_desc TEXT,
  email TEXT,
  video_name TEXT DEFAULT '',
  audio_name TEXT DEFAULT '',
  dukaan_img_id INTEGER DEFAULT 1,
  shop_categories TEXT,
  paid INTEGER DEFAULT 0
);

-- Dukaan Photos
CREATE TABLE IF NOT EXISTS dukaan_photos (
  id SERIAL PRIMARY KEY,
  photo_name TEXT NOT NULL,
  prod_id INTEGER
);

-- Dukaan Products
CREATE TABLE IF NOT EXISTS dukaan_products (
  id SERIAL PRIMARY KEY,
  prod_name TEXT NOT NULL,
  prod_desc TEXT,
  prod_detailed_desc TEXT,
  prod_amt TEXT,
  shop_id INTEGER REFERENCES dukaan_list(id),
  cat_id INTEGER REFERENCES product_category(id),
  quantity FLOAT,
  unit TEXT,
  is_del INTEGER DEFAULT 0
);

-- New Registration Form (submissions)
CREATE TABLE IF NOT EXISTS new_reg_form_list (
  id SERIAL PRIMARY KEY,
  name TEXT,
  mobile TEXT,
  email TEXT,
  business_name TEXT,
  address TEXT,
  categories TEXT,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- New Registration Job CVs
CREATE TABLE IF NOT EXISTS new_reg_job_cv (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  cv_file TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- New Registration Products
CREATE TABLE IF NOT EXISTS new_reg_prod_list (
  id SERIAL PRIMARY KEY,
  reg_id INTEGER REFERENCES new_reg_form_list(id),
  prod_name TEXT,
  prod_desc TEXT,
  prod_amt TEXT
);

-- ============================================================
-- Full-Text Search Index for business name and description
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_dukaan_name ON dukaan_list USING GIN(to_tsvector('simple', dukaan_name));
CREATE INDEX IF NOT EXISTS idx_dukaan_categories ON dukaan_list (shop_categories);
CREATE INDEX IF NOT EXISTS idx_dukaan_user ON dukaan_list (user_id);
CREATE INDEX IF NOT EXISTS idx_user_mobile ON user_list (mobile);
CREATE INDEX IF NOT EXISTS idx_user_username ON user_list (username);
CREATE INDEX IF NOT EXISTS idx_villages_block ON villages (block_id);
CREATE INDEX IF NOT EXISTS idx_blocks_district ON blocks (district_id);
CREATE INDEX IF NOT EXISTS idx_districts_state ON districts (state_id);

-- ============================================================
-- Default Admin User (change password immediately after setup)
-- Password: admin123 (bcrypt hash - CHANGE IN PRODUCTION)
-- ============================================================
INSERT INTO user_list (username, password, name, mobile, role, status)
VALUES (
  'admin',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbw6d7Bqm',
  'Administrator',
  '0000000000',
  'admin',
  'active'
) ON CONFLICT (username) DO NOTHING;
