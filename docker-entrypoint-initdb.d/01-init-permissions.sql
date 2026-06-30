-- ============================================================================
-- IndiCab Database Initialization & User Permissions
-- ============================================================================
-- This script ensures proper database user permissions for Docker networking
-- The MYSQL_USER/MYSQL_PASSWORD env vars create user@localhost
-- This script adds user@% (any host) for container-to-container communication
-- ============================================================================

-- Ensure indicab_user can connect from any host (required for Docker networking)
-- MYSQL_USER env var creates user@localhost, but containers need user@%
CREATE USER IF NOT EXISTS 'indicab_user'@'%' IDENTIFIED BY 'indicab_password';

-- NOTE: Docker MySQL auto-creates and grants privileges to MYSQL_USER, so explicit GRANTs
-- are not required and can fail in some init environments. Leave Redis/DB access to default grants.

-- (Optional) Update authentication plugin for the user if needed
-- ALTER USER 'indicab_user'@'%' IDENTIFIED WITH mysql_native_password BY 'indicab_password';

-- (Optional) Ensure root can connect from any host (development only)
-- CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'root';
-- GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- Apply all changes immediately
FLUSH PRIVILEGES;

-- Verify setup
SELECT User, Host FROM mysql.user WHERE User IN ('root', 'indicab_user') ORDER BY User, Host;
