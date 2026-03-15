-- V010: Create audit_logs table for compliance and audit trail
-- CRITICAL FIX: Use LONGTEXT instead of TEXT for details column to support large audit entries

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    operation VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id BIGINT,
    details LONGTEXT,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    failure_reason VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_operation (operation),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
