-- V002: Create Package table with indexes
CREATE TABLE IF NOT EXISTS `packages` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `package_type` VARCHAR(50) NOT NULL,
    `base_fare` DECIMAL(10, 2) NOT NULL,
    `duration` VARCHAR(255),
    `validity` VARCHAR(255),
    `discount_percentage` DECIMAL(5, 2) DEFAULT 0.00,
    `features` TEXT,
    `image_url` TEXT,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY `idx_package_type` (`package_type`),
    KEY `idx_package_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
