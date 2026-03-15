-- V008: Create Recommendation Table
-- Stores recommended locations/destinations for users

CREATE TABLE IF NOT EXISTS recommendation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    location VARCHAR(255),
    price VARCHAR(255),
    rating VARCHAR(50),
    reviews VARCHAR(255),
    image TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
