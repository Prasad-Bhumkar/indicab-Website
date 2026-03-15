-- V006: Create Blogs Table
-- Stores blog posts with drafts and published content

CREATE TABLE IF NOT EXISTS blogs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT,
    author VARCHAR(255) NOT NULL,
    image_url TEXT,
    status VARCHAR(50) NOT NULL,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_published_at (published_at)
);
