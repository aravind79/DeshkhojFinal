-- DeshKhoj Production Schema Fix (MySQL)
-- Run this on Hostinger phpMyAdmin to fix admin login and business visibility

-- 1. Fix user_list table
ALTER TABLE `user_list` 
  ADD COLUMN IF NOT EXISTS `username` VARCHAR(255) AFTER `agent_id`,
  ADD COLUMN IF NOT EXISTS `password` VARCHAR(255) AFTER `username`,
  ADD COLUMN IF NOT EXISTS `email` VARCHAR(255) AFTER `password`,
  ADD COLUMN IF NOT EXISTS `role` VARCHAR(20) DEFAULT 'user' AFTER `email`,
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(20) DEFAULT 'active' AFTER `role`;

-- 2. Fix dukaan_list table
ALTER TABLE `dukaan_list` 
  ADD COLUMN IF NOT EXISTS `whatsapp` VARCHAR(20) AFTER `contact_no`,
  ADD COLUMN IF NOT EXISTS `pincode` VARCHAR(10) AFTER `whatsapp`,
  ADD COLUMN IF NOT EXISTS `category_1` VARCHAR(255) AFTER `shop_categories`,
  ADD COLUMN IF NOT EXISTS `category_2` VARCHAR(255) AFTER `category_1`,
  ADD COLUMN IF NOT EXISTS `category_3` VARCHAR(255) AFTER `category_2`,
  ADD COLUMN IF NOT EXISTS `business_type` VARCHAR(100) AFTER `category_3`,
  ADD COLUMN IF NOT EXISTS `gst_no` VARCHAR(50) AFTER `business_type`,
  ADD COLUMN IF NOT EXISTS `payment_modes` TEXT AFTER `gst_no`,
  ADD COLUMN IF NOT EXISTS `main_photo` VARCHAR(255) AFTER `payment_modes`,
  ADD COLUMN IF NOT EXISTS `gallery` TEXT AFTER `main_photo`,
  ADD COLUMN IF NOT EXISTS `years_established` INT DEFAULT 0 AFTER `gallery`,
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(20) DEFAULT 'active' AFTER `paid`,
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `status`;

-- 3. Set all existing businesses to active so they show up
UPDATE `dukaan_list` SET `status` = 'active' WHERE `status` IS NULL OR `status` = '' OR `status` = 'pending';

-- 4. Set all existing users to active
UPDATE `user_list` SET `status` = 'active' WHERE `status` IS NULL OR `status` = '';

-- 5. Create/Reset Admin User (password: admin123)
-- Delete any existing admin with same username/id to prevent conflicts
DELETE FROM `user_list` WHERE `username` = 'admin' OR `id` = 999999;

INSERT INTO `user_list` (`id`, `name`, `mobile`, `username`, `password`, `role`, `status`) 
VALUES (999999, 'Administrator', '0000000000', 'admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbw6d7Bqm', 'admin', 'active');

-- 6. Create missing reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS `dukaan_reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `shop_id` INT NOT NULL,
  `user_name` VARCHAR(255),
  `rating` INT NOT NULL,
  `comment` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Add missing slug column to product_category
ALTER TABLE `product_category` ADD COLUMN IF NOT EXISTS `slug` VARCHAR(255) AFTER `photo_name`;
UPDATE `product_category` SET `slug` = LOWER(REPLACE(category_name, ' ', '-')) WHERE `slug` IS NULL OR `slug` = '';

-- 8. Add missing slug columns to location tables
ALTER TABLE `states` ADD COLUMN IF NOT EXISTS `slug` VARCHAR(255) AFTER `loc_state_name`;
ALTER TABLE `districts` ADD COLUMN IF NOT EXISTS `slug` VARCHAR(255) AFTER `loc_district_name`;
ALTER TABLE `blocks` ADD COLUMN IF NOT EXISTS `slug` VARCHAR(255) AFTER `loc_block_name`;
ALTER TABLE `villages` ADD COLUMN IF NOT EXISTS `slug` VARCHAR(255) AFTER `loc_village_name`;
