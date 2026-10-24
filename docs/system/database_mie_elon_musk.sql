-- ============================================================================
-- DATABASE DUMP & SCHEMA: MIE ELON MUSK ROS (RESTAURANT OPERATING SYSTEM)
-- Engine: MySQL 8.0+ / MariaDB (phpMyAdmin Compatible)
-- Charset: utf8mb4 / Collation: utf8mb4_unicode_ci
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `mie_elon_musk` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mie_elon_musk`;

-- ----------------------------------------------------------------------------
-- 1. Table: `tables` (Denah Meja Restoran)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `inventory_stock`;
DROP TABLE IF EXISTS `menu_items`;
DROP TABLE IF EXISTS `tables`;

CREATE TABLE `tables` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `table_number` VARCHAR(10) NOT NULL UNIQUE,
  `status` ENUM('AVAILABLE', 'OCCUPIED', 'CLEANING') NOT NULL DEFAULT 'AVAILABLE',
  `active_ticket` VARCHAR(30) NULL,
  `occupied_duration` VARCHAR(20) NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tables` (`id`, `table_number`, `status`, `active_ticket`, `occupied_duration`) VALUES
(1, '01', 'OCCUPIED', 'D-01-02', '18 mnt'),
(2, '02', 'OCCUPIED', 'C-042', '1 mnt'),
(3, '03', 'AVAILABLE', NULL, NULL),
(4, '04', 'CLEANING', NULL, NULL),
(5, '05', 'AVAILABLE', NULL, NULL),
(6, '06', 'AVAILABLE', NULL, NULL),
(7, '07', 'OCCUPIED', 'D-07-01', '3 mnt'),
(8, '08', 'AVAILABLE', NULL, NULL),
(9, '09', 'AVAILABLE', NULL, NULL),
(10, '10', 'CLEANING', NULL, NULL),
(11, '11', 'AVAILABLE', NULL, NULL),
(12, '12', 'OCCUPIED', 'K-015', '14 mnt');

-- ----------------------------------------------------------------------------
-- 2. Table: `menu_items` (Katalog Menu Restoran)
-- ----------------------------------------------------------------------------
CREATE TABLE `menu_items` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `base_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `station` ENUM('WOK', 'DIMSUM', 'BAR', 'PACKING') NOT NULL DEFAULT 'WOK',
  `can_custom_spicy` BOOLEAN NOT NULL DEFAULT FALSE,
  `image_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `menu_items` (`id`, `name`, `category`, `base_price`, `station`, `can_custom_spicy`, `image_url`) VALUES
('mie-gacoan', 'Mie Elon Musk', 'Mie', 15000.00, 'WOK', TRUE, '/images/card-gacoan-nobg.png'),
('mie-hompimpa', 'Mie Hompimpa', 'Mie', 15000.00, 'WOK', TRUE, '/images/card-hompimpa-nobg.png'),
('mie-suit', 'Mie Suit', 'Mie', 15000.00, 'WOK', FALSE, '/images/gacoan-hero.png'),
('udang-keju', 'Udang Keju Goreng', 'Dimsum', 15000.00, 'DIMSUM', FALSE, '/images/card-udang-keju-nobg.png'),
('udang-rambutan', 'Udang Rambutan', 'Dimsum', 15000.00, 'DIMSUM', FALSE, '/images/udang-rambutan-nobg.png'),
('pangsit-goreng', 'Pangsit Goreng Crispy', 'Dimsum', 15000.00, 'DIMSUM', FALSE, '/images/pangsit-goreng-nobg.png'),
('siomay', 'Siomay Ayam', 'Dimsum', 15000.00, 'DIMSUM', FALSE, '/images/siomay-nobg.png'),
('lemon-tea', 'Es Lemon Tea', 'Minuman', 7000.00, 'BAR', FALSE, '/images/lemon-tea-nobg.png'),
('es-gobak-sodor', 'Es Gobak Sodor', 'Minuman', 10000.00, 'BAR', FALSE, '/images/es-gobak-sodor-nobg.png'),
('air-mineral', 'Air Mineral Prima', 'Minuman', 5000.00, 'BAR', FALSE, '/images/takeaway/air-mineral.png');

-- ----------------------------------------------------------------------------
-- 3. Table: `inventory_stock` (Saklar Darurat Menu Habis / Supervisor Hub)
-- ----------------------------------------------------------------------------
CREATE TABLE `inventory_stock` (
  `id` VARCHAR(20) PRIMARY KEY,
  `menu_item_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `is_available` BOOLEAN NOT NULL DEFAULT TRUE,
  `last_toggled_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `inventory_stock` (`id`, `menu_item_id`, `name`, `category`, `is_available`) VALUES
('s-1', 'udang-keju', 'Udang Keju', 'Dimsum', TRUE),
('s-2', 'mie-gacoan', 'Mie Elon Musk', 'Mie', TRUE),
('s-3', 'mie-hompimpa', 'Mie Hompimpa', 'Mie', TRUE),
('s-4', 'udang-rambutan', 'Udang Rambutan', 'Dimsum', TRUE),
('s-5', 'pangsit-goreng', 'Pangsit Goreng', 'Dimsum', TRUE),
('s-6', 'siomay', 'Siomay Ayam', 'Dimsum', TRUE),
('s-7', 'lemon-tea', 'Es Lemon Tea', 'Minuman', TRUE),
('s-8', 'es-gobak-sodor', 'Es Teh Manis / Gobak Sodor', 'Minuman', TRUE);

-- ----------------------------------------------------------------------------
-- 4. Table: `orders` (Transaksi Pesanan Omnichannel)
-- ----------------------------------------------------------------------------
CREATE TABLE `orders` (
  `id` VARCHAR(36) PRIMARY KEY,
  `ticket_number` VARCHAR(30) NOT NULL UNIQUE,
  `source` ENUM('Dine-In', 'Takeaway', 'Kios Lobby', 'Kasir POS') NOT NULL DEFAULT 'Dine-In',
  `table_number` VARCHAR(10) NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_phone_masked` VARCHAR(30) DEFAULT '',
  `status` ENUM('PENDING', 'COOKING', 'READY', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'COOKING',
  `payment_method` ENUM('QRIS', 'CASH', 'EDC_CARD') NOT NULL DEFAULT 'QRIS',
  `payment_status` ENUM('UNPAID', 'PAID', 'REFUNDED') NOT NULL DEFAULT 'PAID',
  `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `completed_at` TIMESTAMP NULL,
  INDEX idx_orders_status_created (`status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `orders` (`id`, `ticket_number`, `source`, `table_number`, `customer_name`, `customer_phone_masked`, `status`, `payment_method`, `payment_status`, `total_amount`, `created_at`) VALUES
('ORD-1001', 'D-07-01', 'Dine-In', '07', 'Tamu Meja 07', '', 'COOKING', 'QRIS', 'PAID', 55000.00, NOW() - INTERVAL 3 MINUTE),
('ORD-1002', 'T-028', 'Takeaway', NULL, 'Budi Santoso', '', 'COOKING', 'QRIS', 'PAID', 44000.00, NOW() - INTERVAL 8 MINUTE),
('ORD-1003', 'K-015', 'Kios Lobby', '12', 'Tamu Kios 01', '', 'COOKING', 'QRIS', 'PAID', 69000.00, NOW() - INTERVAL 14 MINUTE);

-- ----------------------------------------------------------------------------
-- 5. Table: `order_items` (Rincian Item Masakan per Stasiun KDS)
-- ----------------------------------------------------------------------------
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `qty` INT NOT NULL DEFAULT 1,
  `price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `station` ENUM('WOK', 'DIMSUM', 'BAR', 'PACKING') NOT NULL DEFAULT 'WOK',
  `is_ready` BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `order_items` (`order_id`, `name`, `qty`, `price`, `station`, `is_ready`) VALUES
('ORD-1001', '2x Mie Elon Musk Lv 1', 2, 15000.00, 'WOK', FALSE),
('ORD-1001', '1x Udang Keju Goreng', 1, 12000.00, 'DIMSUM', FALSE),
('ORD-1001', '2x Es Lemon Tea Dingin', 2, 7000.00, 'BAR', TRUE),
('ORD-1002', '1x Mie Hompimpa Lv 3', 1, 15000.00, 'WOK', FALSE),
('ORD-1002', '1x Pangsit Goreng', 1, 11000.00, 'DIMSUM', TRUE),
('ORD-1002', '1x Es Teh Manis', 1, 5000.00, 'BAR', TRUE),
('ORD-1003', '3x Mie Elon Musk Lv 8', 3, 15000.00, 'WOK', FALSE),
('ORD-1003', '2x Udang Rambutan', 2, 12000.00, 'DIMSUM', FALSE);
