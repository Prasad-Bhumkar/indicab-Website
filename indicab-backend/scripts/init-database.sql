-- IndiCab Database Initialization Script for VPS Deployment
-- This script creates the database and sets up necessary permissions
-- Run this script before starting the application

-- Create the main database if it doesn't exist
CREATE DATABASE IF NOT EXISTS indicab_website 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Create a dedicated application user (if not exists)
-- IMPORTANT: Change 'appuser' and 'secure_password' in production
CREATE USER IF NOT EXISTS 'appuser'@'localhost' IDENTIFIED BY 'secure_password';
CREATE USER IF NOT EXISTS 'appuser'@'%' IDENTIFIED BY 'secure_password';

-- Grant all necessary permissions to the application user
GRANT ALL PRIVILEGES ON indicab_website.* TO 'appuser'@'localhost';
GRANT ALL PRIVILEGES ON indicab_website.* TO 'appuser'@'%';

-- Grant specific permissions to the application user
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, LOCK TABLES 
  ON indicab_website.* TO 'appuser'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, LOCK TABLES 
  ON indicab_website.* TO 'appuser'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Select the database
USE indicab_website;

-- Enable binary logging for replication support (optional, for VPS backups)
-- SET GLOBAL binlog_format = 'ROW';

-- Set default charset for the database session
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Create Flyway migrations history table (Flyway will do this automatically, but we can initialize it manually)
CREATE TABLE IF NOT EXISTS flyway_schema_history (
    installed_rank INT NOT NULL,
    version VARCHAR(50),
    description VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    script VARCHAR(1000) NOT NULL,
    checksum INT,
    installed_by VARCHAR(100) NOT NULL,
    installed_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    execution_time INT NOT NULL,
    success BOOLEAN NOT NULL,
    PRIMARY KEY (installed_rank),
    KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create necessary indexes for performance optimization
CREATE INDEX idx_app_version ON flyway_schema_history(version);
CREATE INDEX idx_installed_on ON flyway_schema_history(installed_on);

-- Display database information
SELECT CONCAT('Database: ', DATABASE()) as DatabaseInfo;
SELECT CONCAT('User: ', CURRENT_USER()) as UserInfo;
SELECT COUNT(*) as TableCount FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE();

-- Print completion message
SELECT 'IndiCab Database initialization completed successfully!' as Status;
