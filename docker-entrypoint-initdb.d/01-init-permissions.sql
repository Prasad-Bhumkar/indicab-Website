-- Initialize user permissions for Docker containers
-- This script ensures proper database access for the backend service

-- Grant all privileges to root from any host (%)
-- This is required for Docker container-to-container networking
UPDATE mysql.user SET Host='%' WHERE User='root' AND Host='localhost';
DELETE FROM mysql.user WHERE User='root' AND Host!='%';

-- Create/Grant privileges for indicab_user from any host
DELETE FROM mysql.user WHERE User='indicab_user';
CREATE USER IF NOT EXISTS 'indicab_user'@'%' IDENTIFIED BY 'indicab_password';
GRANT ALL PRIVILEGES ON indicab_website.* TO 'indicab_user'@'%';

-- Apply all changes immediately
FLUSH PRIVILEGES;
