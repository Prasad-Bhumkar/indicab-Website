-- Migration: V011__add_fulltext_search_indexes.sql
-- Purpose: Add full-text search indexes for improved search performance on users table
-- Date: 2026-03-15
-- Issue: #14 - No Search Optimization

-- Add FULLTEXT index on users table for name and email fields
-- This enables efficient full-text search queries on the name and email columns
-- Performance improvement: O(n) scan -> O(log n) with index
ALTER TABLE users ADD FULLTEXT INDEX idx_user_search (name, email);

-- Add FULLTEXT index on audit_logs for searching operation details
-- Helps with audit log searching and compliance queries
ALTER TABLE audit_logs ADD FULLTEXT INDEX idx_audit_search (details, operation);

-- Add FULLTEXT index on bookings for location search
-- Enables efficient search across pickup and dropoff locations
ALTER TABLE bookings ADD FULLTEXT INDEX idx_booking_search (pickup_address, dropoff_address, full_name);

-- Add regular indexes for common filtering operations
-- Improves performance of range queries and filtering on date fields
ALTER TABLE users ADD INDEX idx_user_created_at (created_at);
ALTER TABLE users ADD INDEX idx_user_updated_at (updated_at);
ALTER TABLE users ADD INDEX idx_user_deleted_at (deleted_at);
ALTER TABLE users ADD INDEX idx_user_role (role);

-- Add indexes for booking status filtering and date range queries
ALTER TABLE bookings ADD INDEX idx_booking_status_date (status, created_at);
ALTER TABLE bookings ADD INDEX idx_booking_updated_at (updated_at);

-- Add indexes for audit log date range queries
ALTER TABLE audit_logs ADD INDEX idx_audit_timestamp_status (created_at, status);
ALTER TABLE audit_logs ADD INDEX idx_audit_user_operation (user_id, operation);

-- Add composite index for common admin queries (user + booking status)
ALTER TABLE bookings ADD INDEX idx_booking_user_status (user_id, status, created_at);

-- Verify indexes were created
-- This will be visible in SHOW INDEXES command
-- SELECT INDEX_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.STATISTICS
-- WHERE TABLE_SCHEMA = 'indicab_website' AND TABLE_NAME IN ('users', 'audit_logs', 'bookings')
-- ORDER BY TABLE_NAME, INDEX_NAME;
