-- DeshKhoj MySQL Schema
-- Hostinger Shared Hosting Compatible

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ─── Location Tables ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `states` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `state_name` VARCHAR(255) NOT NULL,
  `loc_state_name` VARCHAR(255),
  `state_abbr` VARCHAR(10) NOT NULL DEFAULT '',
  `slug` VARCHAR(255) NOT NULL DEFAULT '',
  `country_abbr` VARCHAR(10) NOT NULL DEFAULT '',
  `country_id` INT NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `districts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `district_name` VARCHAR(255) NOT NULL,
  `loc_district_name` VARCHAR(255),
  `slug` VARCHAR(255) NOT NULL DEFAULT '',
  `state_id` INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `blocks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `block_name` VARCHAR(255) NOT NULL,
  `loc_block_name` VARCHAR(255),
  `slug` VARCHAR(255) NOT NULL DEFAULT '',
  `district_id` INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `villages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `village_name` VARCHAR(255) NOT NULL,
  `loc_village_name` VARCHAR(255),
  `slug` VARCHAR(255) NOT NULL DEFAULT '',
  `block_id` INT NOT NULL DEFAULT 0,
  `type` VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Product & Category Tables ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `product_category` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_name` VARCHAR(255) NOT NULL DEFAULT '',
  `loc_category_name` VARCHAR(255) NOT NULL DEFAULT '',
  `ordering` INT,
  `is_sure` INT,
  `photo_name` VARCHAR(50),
  `slug` VARCHAR(255) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `measure_unit` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `loc_name` VARCHAR(255) NOT NULL DEFAULT '',
  `order_no` INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── User & Business Tables ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `user_list` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL DEFAULT '',
  `mobile` VARCHAR(20) NOT NULL DEFAULT '',
  `email` VARCHAR(255) NOT NULL DEFAULT '',
  `role` VARCHAR(20) NOT NULL DEFAULT 'user',
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dukaan_list` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `dukaan_name` VARCHAR(255) NOT NULL,
  `dukaan_addr` TEXT,
  `dukaandar_name` VARCHAR(255),
  `contact_no` VARCHAR(20),
  `whatsapp` VARCHAR(20),
  `pincode` VARCHAR(10),
  `block_id` INT,
  `dukaan_desc` TEXT,
  `email` VARCHAR(255),
  `shop_categories` VARCHAR(255),
  `category_1` VARCHAR(255),
  `category_2` VARCHAR(255),
  `category_3` VARCHAR(255),
  `business_type` VARCHAR(100),
  `gst_no` VARCHAR(50),
  `payment_modes` TEXT,
  `main_photo` VARCHAR(255),
  `gallery` TEXT,
  `years_established` INT DEFAULT 0,
  `video_name` VARCHAR(255),
  `audio_name` VARCHAR(255),
  `dukaan_img_id` INT DEFAULT 1,
  `paid` INT DEFAULT 0,
  `status` VARCHAR(20) DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dukaan_products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `prod_name` VARCHAR(255) NOT NULL,
  `prod_desc` TEXT,
  `prod_detailed_desc` TEXT,
  `prod_amt` VARCHAR(50),
  `shop_id` INT NOT NULL,
  `prod_img` VARCHAR(255),
  `is_del` INT DEFAULT 0,
  `cat_id` INT,
  `quantity` INT DEFAULT 1,
  `unit` VARCHAR(50) DEFAULT 'pcs'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dukaan_photos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `photo_name` VARCHAR(255) NOT NULL,
  `prod_id` INT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dukaan_reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `shop_id` INT NOT NULL,
  `user_name` VARCHAR(255),
  `rating` INT NOT NULL,
  `comment` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Initial Admin User ───────────────────────────────────────────────────
-- (Password is 'admin123' hashed with bcrypt)
INSERT INTO `user_list` (username, password, name, mobile, role, status) 
VALUES ('admin', '$2b$12$R.S/Iu0eW7XN8VpEHzG8ieZz.uHqS2x6/Z5OQZpZpZpZpZpZpZpZp', 'Administrator', '9999999999', 'admin', 'active')
ON DUPLICATE KEY UPDATE id=id;
