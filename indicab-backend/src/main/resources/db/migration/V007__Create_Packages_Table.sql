-- V007: Create Packages Table
-- Stores travel packages (hourly, regional, national, corporate)

CREATE TABLE IF NOT EXISTS packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    package_type VARCHAR(100) NOT NULL,
    base_fare DECIMAL(10, 2) NOT NULL,
    duration VARCHAR(100),
    validity VARCHAR(100),
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    features TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_package_type (package_type),
    INDEX idx_package_active (is_active)
);
