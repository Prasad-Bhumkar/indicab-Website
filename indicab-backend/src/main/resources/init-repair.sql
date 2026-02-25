-- Repair Flyway schema history for failed migrations
-- This script deletes failed migration records to allow them to be retried

-- Wait for database to be created
SELECT 1;

-- Delete failed migration from Flyway schema history
DELETE FROM flyway_schema_history WHERE version = 4 AND success = FALSE;

-- Verify audit_logs table exists
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `operation` VARCHAR(50) NOT NULL,
    `resource_type` VARCHAR(100) NOT NULL,
    `resource_id` BIGINT,
    `details` TEXT,
    `ip_address` VARCHAR(50) NOT NULL,
    `user_agent` TEXT,
    `status` VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    `failure_reason` TEXT,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_user_id` (`user_id`),
    KEY `idx_operation` (`operation`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
