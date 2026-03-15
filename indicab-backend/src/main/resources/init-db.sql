-- MySQL Initialization Script for IndiCab - Docker Container Startup
-- This script is executed during Docker container initialization (docker-compose or Kubernetes)
-- Purpose: Create application user with proper database permissions

-- ============================================================================
-- Create Application User for Database Access
-- ============================================================================
-- Create indicab_user with database access permissions
-- This user is used by the Spring Boot application for all database operations
CREATE USER IF NOT EXISTS 'indicab_user'@'%' IDENTIFIED BY 'root';
CREATE USER IF NOT EXISTS 'indicab_user'@'localhost' IDENTIFIED BY 'root';
GRANT ALL PRIVILEGES ON indicab_website.* TO 'indicab_user'@'%';
GRANT ALL PRIVILEGES ON indicab_website.* TO 'indicab_user'@'localhost';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';
FLUSH PRIVILEGES;
