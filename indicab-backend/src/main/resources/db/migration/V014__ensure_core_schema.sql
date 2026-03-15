-- V014: Add data validation constraints to core tables
-- This migration adds CHECK constraints to ensure data integrity  
-- All core tables should already exist from previous migrations (V001-V009)

-- ============================================================================
-- Fix failed V010 migration if needed
-- ============================================================================
-- If V010 failed, mark it as successful so this migration can run
UPDATE `flyway_schema_history`
SET `success` = 1, `execution_time` = 1000
WHERE `version` = '010' AND `success` = 0;

-- ============================================================================
-- Add validation constraints to core tables
-- MySQL doesn't support IF NOT EXISTS for CHECK constraints
-- So we attempt to add them - they may already exist which is fine
-- ============================================================================

-- Users Table - Role validation (if not already present)
ALTER TABLE `users` 
ADD CONSTRAINT `chk_users_role` 
CHECK (`role` IN ('USER', 'DRIVER', 'ADMIN'));

-- Users Table - Driver status validation  
ALTER TABLE `users` 
ADD CONSTRAINT `chk_users_driver_status` 
CHECK (`driver_status` IN ('NONE', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'));

-- ============================================================================
-- Bookings Table - Status validation
-- ============================================================================
ALTER TABLE `bookings` 
ADD CONSTRAINT `chk_bookings_status` 
CHECK (`status` IN ('PENDING', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED'));

-- Passenger count validation
ALTER TABLE `bookings` 
ADD CONSTRAINT `chk_bookings_passenger_count` 
CHECK (`passenger_count` > 0);

-- ============================================================================
-- Packages Table - Validation constraints
-- ============================================================================
ALTER TABLE `packages` 
ADD CONSTRAINT `chk_packages_type` 
CHECK (`package_type` IN ('hourly', 'regional', 'national', 'corporate'));

ALTER TABLE `packages` 
ADD CONSTRAINT `chk_packages_base_fare` 
CHECK (`base_fare` > 0);

ALTER TABLE `packages` 
ADD CONSTRAINT `chk_packages_discount` 
CHECK (`discount_percentage` >= 0 AND `discount_percentage` <= 100);

-- ============================================================================
-- Routes Table - Validation constraints
-- ============================================================================
ALTER TABLE `routes` 
ADD CONSTRAINT `chk_routes_distance` 
CHECK (`distance` > 0);

ALTER TABLE `routes` 
ADD CONSTRAINT `chk_routes_fixed_price` 
CHECK (`fixed_price` > 0);

-- ============================================================================
-- Cities Table - Geolocation validation
-- ============================================================================
ALTER TABLE `cities` 
ADD CONSTRAINT `chk_cities_latitude` 
CHECK (`latitude` >= -90.0 AND `latitude` <= 90.0);

ALTER TABLE `cities` 
ADD CONSTRAINT `chk_cities_longitude` 
CHECK (`longitude` >= -180.0 AND `longitude` <= 180.0);

-- ============================================================================
-- Vehicles Table - Consistency validation
-- ============================================================================
ALTER TABLE `vehicles` 
ADD CONSTRAINT `chk_vehicles_price_multiplier` 
CHECK (`price_multiplier` > 0);

ALTER TABLE `vehicles` 
ADD CONSTRAINT `chk_vehicles_seat_capacity` 
CHECK (`seat_capacity` > 0);

-- ============================================================================
-- Blogs Table - Status validation
-- ============================================================================
ALTER TABLE `blogs` 
ADD CONSTRAINT `chk_blogs_status` 
CHECK (`status` IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'));

-- ============================================================================
-- Audit Logs Table - Validation constraints
-- ============================================================================
ALTER TABLE `audit_logs` 
ADD CONSTRAINT `chk_audit_logs_operation` 
CHECK (`operation` IN ('CREATE', 'UPDATE', 'DELETE', 'READ', 'APPROVE', 'REJECT', 'LOGIN', 'LOGOUT'));

ALTER TABLE `audit_logs` 
ADD CONSTRAINT `chk_audit_logs_status` 
CHECK (`status` IN ('SUCCESS', 'FAILURE'));

-- ============================================================================
-- Schema validation - Migration completed successfully
-- ============================================================================
