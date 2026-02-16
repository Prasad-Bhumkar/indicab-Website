# IndiCab Database Scripts

This directory contains database initialization, seeding, and backup/restore scripts for VPS deployment.

## Scripts Overview

### 1. `init-database.sql`
Initial database setup script for VPS deployment.

**Purpose:**
- Creates the `indicab_website` database
- Creates application user with appropriate permissions
- Sets up character set and collation
- Initializes Flyway schema history table

**Usage:**
```bash
# Login to MySQL
mysql -u root -p

# Run the initialization script
source /path/to/init-database.sql;
```

**or via command line:**
```bash
mysql -u root -p < init-database.sql
```

**Important Notes:**
- Change the default user credentials (`appuser` / `secure_password`) in production
- Ensure you have root access to MySQL before running
- This script is idempotent (safe to run multiple times)

### 2. `seed-data.sql`
Optional sample data insertion script for testing and demonstration.

**Purpose:**
- Inserts sample blogs, packages, and vehicles
- Provides test data for development and staging environments
- Should NOT be used in production with real data

**Usage:**
```bash
mysql -u appuser -p indicab_website < seed-data.sql
```

**Sample Data Includes:**
- 3 sample blog posts (2 published, 1 draft)
- 5 travel packages (hourly, regional, national, corporate)
- 6 sample vehicles (economy, premium, luxury classes)

**To Skip:**
Simply don't run this script in production environments. Flyway migrations handle schema creation automatically.

### 3. `backup-restore.sh`
Comprehensive backup and restore script for database management.

**Features:**
- Automated mysqldump with compression
- Backup rotation (keeps last 7 backups)
- Interactive restore with confirmation
- Detailed logging
- Color-coded output

**Usage:**

#### Backup:
```bash
chmod +x backup-restore.sh
./backup-restore.sh backup indicab_website appuser secure_password
```

#### Restore:
```bash
./backup-restore.sh restore indicab_website appuser secure_password ./backups/indicab_website_backup_20240215_120000.sql.gz
```

**Output:**
- Backups stored in `./backups/` directory
- Compressed with gzip for space efficiency
- Detailed logs in `./backups/backup_restore_<timestamp>.log`

**Scheduling Automated Backups (crontab):**

```bash
# Add to crontab (every day at 2 AM)
crontab -e

# Add the following line:
0 2 * * * /path/to/indicab-backend/scripts/backup-restore.sh backup indicab_website appuser secure_password >> /var/log/indicab_backup.log 2>&1
```

## VPS Deployment Steps

### 1. Initial Setup

```bash
# 1. Login to MySQL and run initialization
mysql -u root -p < init-database.sql

# 2. Verify database creation
mysql -u appuser -p -e "SHOW DATABASES; USE indicab_website; SHOW TABLES;"

# 3. (Optional) Insert sample data for testing
mysql -u appuser -p indicab_website < seed-data.sql
```

### 2. Application Setup

The application uses Flyway for automatic schema migration. When you start the Spring Boot application:

1. Flyway automatically discovers migration scripts in `src/main/resources/db/migration/`
2. Migrations are executed in version order (V001, V002, V003, etc.)
3. The `flyway_schema_history` table tracks applied migrations
4. Failed migrations prevent application startup

**Migration Files:**
- `V001__create_blog_table.sql` - Creates blogs table
- `V002__create_package_table.sql` - Creates packages table  
- `V003__create_vehicle_table.sql` - Creates vehicles table

### 3. Configuration

Update your `.env.production` or environment variables:

```bash
# Database
DATABASE_URL=jdbc:mysql://localhost:3306/indicab_website
DATABASE_USERNAME=appuser
DATABASE_PASSWORD=secure_password

# Flyway
FLYWAY_ENABLED=true

# JPA
JPA_HIBERNATE_DDL=validate
```

## Security Recommendations

### 1. Change Default Credentials
```bash
# In init-database.sql, replace:
CREATE USER IF NOT EXISTS 'appuser'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
```

### 2. Restrict User Permissions
```sql
-- Be more restrictive in production:
GRANT SELECT, INSERT, UPDATE, DELETE ON indicab_website.* TO 'appuser'@'localhost';
-- Exclude ALTER, CREATE for security
```

### 3. Secure Backup Files
```bash
# Set restrictive permissions on backup directory
chmod 700 ./backups
chmod 600 ./backups/*.sql.gz
```

### 4. Monitor Backups
```bash
# Monitor backup directory size
du -sh ./backups/

# Check recent backups
ls -lh ./backups/ | head -10
```

## Troubleshooting

### Issue: "Access Denied" Error
```bash
# Verify credentials
mysql -u appuser -p

# Check user permissions
mysql -u root -p -e "SELECT user, host, select_priv FROM mysql.user WHERE user='appuser';"
```

### Issue: Flyway Migration Failed
```bash
# Check Flyway schema history
mysql -u appuser -p indicab_website -e "SELECT * FROM flyway_schema_history;"

# Check application logs
docker logs indicab-backend

# Or if running locally
tail -f ./logs/application.log
```

### Issue: Backup File Not Found
```bash
# List available backups
ls -lh ./backups/

# Check backup log
cat ./backups/backup_restore_*.log
```

### Issue: Restore Failed
```bash
# Verify backup file integrity
gunzip -t ./backups/indicab_website_backup_*.sql.gz

# Check if database exists
mysql -u root -p -e "SHOW DATABASES;"
```

## Environment Variables Reference

```properties
# Database Connection
DATABASE_URL=jdbc:mysql://[host]:3306/indicab_website
DATABASE_USERNAME=appuser
DATABASE_PASSWORD=secure_password

# Connection Pool
DB_POOL_SIZE=10          # Maximum connections
DB_MIN_IDLE=5            # Minimum idle connections

# Flyway
FLYWAY_ENABLED=true      # Enable/disable migrations

# JPA Hibernate
JPA_HIBERNATE_DDL=validate  # Options: validate, update, create, create-drop

# Actuator (Health Checks)
ACTUATOR_ENDPOINTS=health,metrics,info
```

## Performance Tuning

### For High-Traffic Deployments

```sql
-- Increase buffer pool size in MySQL my.cnf
[mysqld]
innodb_buffer_pool_size = 4G
innodb_log_file_size = 512M

-- Optimize connection pooling
DB_POOL_SIZE=20
DB_MIN_IDLE=10
```

### Index Optimization

The migration scripts automatically create indexes for common queries:
- `idx_status` on blogs.status
- `idx_published_at` on blogs.published_at
- `idx_package_type` on packages.package_type
- `idx_package_active` on packages.is_active
- `idx_vehicle_type` on vehicles.type
- `idx_is_active` on vehicles.is_active

## Contact & Support

For issues or questions about database setup, refer to:
- VPS_DEPLOYMENT_GUIDE.md (main deployment documentation)
- Application logs at `/var/log/indicab/` on VPS
- Backup logs at `./backups/backup_restore_*.log`
