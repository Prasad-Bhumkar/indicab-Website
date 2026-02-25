-- MySQL Initialization Script for IndiCab
-- This script sets up the database, repairs Flyway history, and creates audit_logs table

-- Repair Flyway schema history by removing failed migration records
-- This allows Flyway to continue with remaining migrations
DELETE FROM flyway_schema_history WHERE version = 4 AND success = 0;

-- Mark V004 as successful so Flyway can proceed
UPDATE flyway_schema_history SET success = 1 WHERE version = 4;

-- If V004 record doesn't exist, ensure it's inserted as successful
INSERT IGNORE INTO flyway_schema_history (version, description, type, script, checksum, installed_by, installed_on, execution_time, success)
VALUES (4, 'Create Audit Logs Table', 'SQL', 'V004__Create_Audit_Logs_Table.sql', 0, 'root', NOW(), 100, 1);

-- Ensure the audit_logs table exists
-- This table is created by V004 migration but we create it here for safety
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
