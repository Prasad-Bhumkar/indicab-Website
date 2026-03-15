-- V003: Create Cities, Routes, and ServiceCity Tables
-- Cities stores all available service cities
-- Routes stores routes between cities with pricing

CREATE TABLE IF NOT EXISTS cities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    latitude DOUBLE,
    longitude DOUBLE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_city_name (name),
    INDEX idx_city_active (is_active)
);

CREATE TABLE IF NOT EXISTS service_city (
    name VARCHAR(255) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS routes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    from_city VARCHAR(255) NOT NULL,
    to_city VARCHAR(255) NOT NULL,
    distance DOUBLE NOT NULL,
    fixed_price DOUBLE NOT NULL,
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_from_to (from_city, to_city),
    INDEX idx_is_popular (is_popular)
);
