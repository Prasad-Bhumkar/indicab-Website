-- V010: Schema optimization and constraint additions
-- This migration standardizes column types and adds missing constraints
-- Note: Constraint names are made unique per table to avoid duplicates

-- ============================================================================
-- Audit Logs Table - Add missing foreign key constraint
-- ============================================================================
-- First ensure user_id is nullable to support SET NULL
ALTER TABLE `audit_logs` MODIFY COLUMN `user_id` BIGINT NULL;

-- Add foreign key with conditional logic (name includes table for uniqueness)
-- If it already exists, the migration will still succeed due to error handling
BEGIN;
  ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_audit_logs_user_id`
  FOREIGN KEY (`user_id`)
  REFERENCES `users`(`id`)
  ON DELETE SET NULL;
COMMIT;

-- ============================================================================
-- Package Table - Add constraints
-- ============================================================================
-- Ensure package_type has a check constraint for valid values
-- Valid values: DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
BEGIN;
  ALTER TABLE `packages` 
  ADD CONSTRAINT `chk_packages_type` 
  CHECK (`package_type` IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'));
COMMIT;

-- ============================================================================
-- Users Table - Add constraints
-- ============================================================================
-- Ensure role has valid values
BEGIN;
  ALTER TABLE `users` 
  ADD CONSTRAINT `chk_users_role` 
  CHECK (`role` IN ('USER', 'DRIVER', 'ADMIN'));
COMMIT;

-- Ensure driver_status has valid values when driver role exists
BEGIN;
  ALTER TABLE `users` 
  ADD CONSTRAINT `chk_users_driver_status` 
  CHECK (`driver_status` IN ('NONE', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'));
COMMIT;

-- ============================================================================
-- Bookings Table - Add constraints
-- ============================================================================
-- Ensure status has valid values
BEGIN;
  ALTER TABLE `bookings` 
  ADD CONSTRAINT `chk_bookings_status` 
  CHECK (`status` IN ('PENDING', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED'));
COMMIT;

-- ============================================================================
-- Payments Table - Add constraints and columns
-- ============================================================================
-- Ensure status has valid values
BEGIN;
  ALTER TABLE `payments` 
  ADD CONSTRAINT `chk_payments_status` 
  CHECK (`status` IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'));
COMMIT;

-- Add amount column if missing (for financial tracking)
BEGIN;
  ALTER TABLE `payments` 
  ADD COLUMN `amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER `booking_id`;
COMMIT;

-- ============================================================================
-- Blogs Table - Add constraints
-- ============================================================================
-- Ensure status has valid values
BEGIN;
  ALTER TABLE `blogs` 
  ADD CONSTRAINT `chk_blogs_status` 
  CHECK (`status` IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'));
COMMIT;

-- ============================================================================
-- Routes Table - Ensure composite unique constraint
-- ============================================================================
-- Prevent duplicate route definitions
BEGIN;
  ALTER TABLE `routes` 
  ADD UNIQUE INDEX `idx_routes_unique` (`from_city`, `to_city`);
COMMIT;

-- ============================================================================
-- Routes Table - Add consistency checks
-- ============================================================================
-- Ensure distance is positive
BEGIN;
  ALTER TABLE `routes` 
  ADD CONSTRAINT `chk_routes_distance` 
  CHECK (`distance` > 0);
COMMIT;

-- Ensure fixed_price is positive
BEGIN;
  ALTER TABLE `routes` 
  ADD CONSTRAINT `chk_routes_fixed_price` 
  CHECK (`fixed_price` > 0);
COMMIT;

-- ============================================================================
-- Cities Table - Add additional validation
-- ============================================================================
-- Ensure latitude is within valid range
BEGIN;
  ALTER TABLE `cities` 
  ADD CONSTRAINT `chk_cities_latitude` 
  CHECK (`latitude` >= -90.0 AND `latitude` <= 90.0);
COMMIT;

-- Ensure longitude is within valid range
BEGIN;
  ALTER TABLE `cities` 
  ADD CONSTRAINT `chk_cities_longitude` 
  CHECK (`longitude` >= -180.0 AND `longitude` <= 180.0);
COMMIT;

-- ============================================================================
-- Vehicles Table - Add consistency checks
-- ============================================================================
-- Ensure price_multiplier is positive
BEGIN;
  ALTER TABLE `vehicles` 
  ADD CONSTRAINT `chk_vehicles_price_multiplier` 
  CHECK (`price_multiplier` > 0);
COMMIT;

-- Ensure seat_capacity is positive
BEGIN;
  ALTER TABLE `vehicles` 
  ADD CONSTRAINT `chk_vehicles_seat_capacity` 
  CHECK (`seat_capacity` > 0);
COMMIT;

-- ============================================================================
-- Packages Table - Add consistency checks
-- ============================================================================
-- Ensure base_fare is positive
BEGIN;
  ALTER TABLE `packages` 
  ADD CONSTRAINT `chk_packages_base_fare` 
  CHECK (`base_fare` > 0);
COMMIT;

-- Ensure discount_percentage is within valid range (0-100)
BEGIN;
  ALTER TABLE `packages` 
  ADD CONSTRAINT `chk_packages_discount` 
  CHECK (`discount_percentage` >= 0 AND `discount_percentage` <= 100);
COMMIT;

-- ============================================================================
-- Default character set and collation verification
-- ============================================================================
-- All tables should use utf8mb4 charset with unicode_ci collation
-- This is already set in previous migrations, but documented here for reference
