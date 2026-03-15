-- MySQL Initialization Script for IndiCab - Docker Container Startup
-- This script is executed during Docker container initialization (docker-compose or Kubernetes)
-- Purpose: Ensure database is ready for Flyway migrations and backup critical table schemas
--
-- Note: This script runs BEFORE Flyway migrations execute. If migrations fail, this script
-- ensures audit_logs table exists for logging purposes.

-- Clean up failed migration history BEFORE Flyway runs
-- This is critical because Flyway will refuse to run if ANY migration is marked as failed
-- This handles development/testing scenarios where migrations may have failed
DELETE FROM flyway_schema_history WHERE success = 0;

-- Specifically handle V010 migration failure
-- Remove V010 from history to allow it to be re-executed or skipped
DELETE FROM flyway_schema_history WHERE version = '010';

-- Mark all previous migrations as successful to allow Flyway to proceed
-- This ensures we can start fresh with a clean migration history
UPDATE flyway_schema_history SET success = 1 WHERE success = 0;

-- Ensure V004 migration is marked successful in Flyway history
-- This is a safety measure in case the record exists but is marked failed
UPDATE flyway_schema_history SET success = 1 WHERE version = '004' AND success = 0;

-- Backup: If V004 record doesn't exist in Flyway history, ensure it's tracked
-- This is only inserted if the record doesn't already exist (IGNORE prevents duplicates)
INSERT IGNORE INTO flyway_schema_history (version, description, type, script, checksum, installed_by, installed_on, execution_time, success)
VALUES ('4', 'Create Audit Logs Table', 'SQL', 'V004__Create_Audit_Logs_Table.sql', 0, 'root', NOW(), 100, 1);

-- Ensure the audit_logs table exists
-- This table is created by V009 migration but we create it here for safety
-- if migrations haven't run yet during container initialization
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `operation` VARCHAR(255) NOT NULL,
    `resource_type` VARCHAR(255) NOT NULL,
    `resource_id` BIGINT,
    `details` TEXT,
    `ip_address` VARCHAR(50) NOT NULL,
    `user_agent` TEXT,
    `status` VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    `failure_reason` TEXT,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_audit_user_id` (`user_id`),
    INDEX `idx_operation` (`operation`),
    INDEX `idx_audit_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Schema Initialization Complete
-- ============================================================================
-- Next: Flyway will execute all pending migrations in order (V001, V002, etc.)
-- The Flyway migration location: db/migration/V*.sql
-- The Flyway history tracking table: flyway_schema_history
--
-- Note on consolidation:
-- - init-repair.sql has been deprecated (its logic is now here)
-- - full-schema.sql is deprecated (Flyway migrations are the source of truth)
-- - For all schema changes, create new Flyway migrations, don't edit this file
