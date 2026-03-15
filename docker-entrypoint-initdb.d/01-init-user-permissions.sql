-- Add wildcard host permissions for indicab_user (already created by MYSQL_USER env var)
-- The MYSQL_USER env var creates the user, but only for localhost
-- We need to add '%' (all hosts) for Docker container connectivity

-- Create the wildcard host user if it doesn't exist
CREATE USER IF NOT EXISTS 'indicab_user'@'%' IDENTIFIED BY 'root';

-- Grant ALL privileges explicitly (to be absolutely sure)
GRANT ALL PRIVILEGES ON indicab_website.* TO 'indicab_user'@'%';
GRANT ALL PRIVILEGES ON indicab_website.* TO 'indicab_user'@'localhost';

-- Also grant on mysql database for management tasks
GRANT SELECT ON mysql.* TO 'indicab_user'@'%';
GRANT SELECT ON mysql.* TO 'indicab_user'@'localhost';

-- Flush privileges to apply changes immediately
FLUSH PRIVILEGES;

-- Verify users exist
SELECT User, Host, authentication_string FROM mysql.user WHERE User='indicab_user';
