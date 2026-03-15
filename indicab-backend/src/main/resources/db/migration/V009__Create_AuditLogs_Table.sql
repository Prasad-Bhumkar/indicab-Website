-- V009: Create Audit Logs Table
-- Stores all administrative operations and changes for compliance and debugging

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    operation VARCHAR(255) NOT NULL,
    resource_type VARCHAR(255) NOT NULL,
    resource_id BIGINT,
    details TEXT,
    ip_address VARCHAR(50) NOT NULL,
    user_agent TEXT,
    status VARCHAR(50) NOT NULL,
    failure_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_user_id (user_id),
    INDEX idx_operation (operation),
    INDEX idx_audit_created_at (created_at)
);
