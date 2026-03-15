-- V001: Create Users Table
-- This is the foundational table for all users in the system

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    license_number VARCHAR(255),
    vehicle_type VARCHAR(255),
    driver_status VARCHAR(50) DEFAULT 'NONE',
    driver_applied_at TIMESTAMP NULL,
    driver_approved_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_driver_status (driver_status),
    INDEX idx_created_at (created_at)
);
