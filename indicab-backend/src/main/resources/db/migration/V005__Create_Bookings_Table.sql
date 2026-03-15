-- V005: Create Bookings Table
-- Stores all ride bookings made by users

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    from_location VARCHAR(255) NOT NULL,
    to_location VARCHAR(255) NOT NULL,
    date VARCHAR(50) NOT NULL,
    vehicle VARCHAR(255) NOT NULL,
    amount DOUBLE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    license VARCHAR(255),
    pickup_address TEXT NOT NULL,
    dropoff_address TEXT NOT NULL,
    passenger_count INT NOT NULL DEFAULT 1,
    special_requirements TEXT,
    contact_preference VARCHAR(50) NOT NULL DEFAULT 'call',
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_user_status (user_id, status)
);
