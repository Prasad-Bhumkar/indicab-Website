# IndiCab on Hostinger VPS - Complete Deployment Guide

**Last Updated:** February 23, 2026
**Target Environment:** Hostinger VPS
**Status:** Production Ready

---

## Table of Contents

1. [Hostinger VPS Selection & Setup](#hostinger-vps-selection--setup)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Application Properties for Hostinger](#application-properties-for-hostinger)
4. [Security Configuration](#security-configuration)
5. [Performance Optimization](#performance-optimization)
6. [Monitoring & Logging](#monitoring--logging)
7. [Backup Strategy](#backup-strategy)
8. [Troubleshooting Common Issues](#troubleshooting-common-issues)

---

## Hostinger VPS Selection & Setup

### 1. Choosing the Right Hostinger Plan

**Recommended for IndiCab:**
- **Plan:** Business VPS or higher
- **RAM:** 8 GB minimum (allows comfortable operation)
- **CPU:** 4 cores (handles concurrent requests efficiently)
- **Storage:** 160 GB SSD (MySQL data + backups + logs)
- **Bandwidth:** Unlimited (most Hostinger plans include this)

**Why these specs:**
- 8GB RAM: Spring Boot (`-Xmx512m`) + MySQL buffer pool (2GB) + Redis (256MB) + OS overhead
- 4 cores: Handles typical traffic without bottlenecks
- 160GB SSD: Database growth + Docker images + application logs

**Cost-Saving Note:** Hostinger's VPS plans are priced competitively. Monitor actual usage after 2 weeks and downgrade if needed.

### 2. Initial VPS Setup via Hostinger Control Panel

**Step 1: Select OS**
- Choose **Ubuntu 22.04 LTS** (latest stable, well-supported)
- Avoid Ubuntu 20.04 (nearing end of support)

**Step 2: Configure Root Password**
- Set a strong password (30+ characters with mixed case, numbers, symbols)
- Store in a password manager (1Password, Bitwarden, etc.)

**Step 3: Access VPS**
```bash
# SSH into your Hostinger VPS
ssh root@your-hostinger-ip

# Update system immediately
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git vim htop net-tools
```

**Step 4: Create Non-Root User (Recommended)**
```bash
# Create a deploy user
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG sudo deploy

# Add SSH key for passwordless login (optional but recommended)
sudo su - deploy
mkdir -p ~/.ssh
echo "your-public-ssh-key" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

---

## Pre-Deployment Checklist

**Before running Docker Compose on Hostinger:**

- [ ] VPS is running Ubuntu 22.04 LTS
- [ ] System is updated: `sudo apt update && sudo apt upgrade -y`
- [ ] Docker is installed: `docker --version` should show v20.10+
- [ ] Docker Compose is installed: `docker-compose --version` should show v2.0+
- [ ] Port 80 and 443 are open in Hostinger firewall (check Control Panel)
- [ ] Domain is pointing to VPS IP (check DNS A record)
- [ ] `.env.production` file is created with all required secrets
- [ ] MySQL data directory has proper permissions
- [ ] Backup script is ready (see Backup Strategy section)

---

## Application Properties for Hostinger

### Key Differences from Local Development

Your `application.properties` has been updated with VPS-specific settings:

**1. Logging for Hostinger Production**
```properties
logging.level.root=INFO
logging.level.org.springframework.web=INFO
logging.file.name=logs/indicab-backend.log
logging.file.max-size=10MB
logging.file.max-history=30
```

**Why this matters on Hostinger:**
- Limited disk space: Logs rotate every 10MB, keeping only 30 days
- Debugging: If something breaks, you have logs to check
- Performance: File logging has minimal overhead on Hostinger SSD

**2. Database Connection Pooling**
```properties
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.max-lifetime=1200000
```

**Current settings explained:**
- `maximum-pool-size=10`: Conservative for Hostinger (prevents connection exhaustion)
- `max-lifetime=1200000ms (20 min)`: Hostinger sometimes closes idle connections; 20 min avoids stale connections
- If you see "Connection reset" errors, reduce to `maximum-pool-size=8` and increase `idle-timeout` to 600000ms

**3. JWT Expiration (CONFIRMED)**
```properties
jwt.expiration=900
```

**Verified in JwtUtil.java:** Expiration is multiplied by 1000, so **900 seconds = 15 minutes**. This is correct for short-lived access tokens.

**4. File Upload Limits**
```properties
spring.servlet.multipart.max-file-size=2MB
spring.servlet.multipart.max-request-size=2MB
```

**Hostinger Consideration:** 2MB is safe for Hostinger's disk. If users upload profile pictures frequently, monitor disk usage monthly.

**5. Redis Configuration**
```properties
spring.redis.host=${SPRING_REDIS_HOST:redis}
spring.redis.jedis.pool.max-active=8
```

**For Hostinger:** These settings are fine. Redis uses minimal memory (256MB) for caching and rate limiting.

---

## Security Configuration

### 1. Environment Variables (.env.production)

**Never commit `.env.production` to Git.** Hostinger Control Panel has a "Deployment" section where you can set environment variables securely.

**Minimum required variables:**
```bash
# Database
DB_ROOT_PASSWORD=your-secure-root-password-32-chars-min-CHANGE-THIS
DB_USERNAME=indicab_user
DB_PASSWORD=your-secure-db-password-32-chars-min-CHANGE-THIS
DB_NAME=indicab_website
DB_PORT=3307

# JWT
JWT_SECRET=your-very-secure-jwt-secret-key-min-32-chars-CHANGE-THIS

# Redis
SPRING_REDIS_HOST=redis
SPRING_REDIS_PORT=6379
REDIS_ENABLED=true

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Server
SERVER_PORT=8000
BACKEND_PORT=8000
FRONTEND_PORT=80

# Flyway
FLYWAY_ENABLED=true
JPA_HIBERNATE_DDL=validate
```

**Best Practices:**
- Passwords: Use `openssl rand -base64 32` to generate random strings
- JWT_SECRET: Minimum 32 characters; consider 64 characters for production
- Never use the example passwords above
- Rotate secrets every 6 months in production

### 2. SSL/TLS Certificate (Let's Encrypt)

**Option A: Hostinger Automatic SSL (Easiest)**
- If your domain is managed by Hostinger DNS, auto-renewal is automatic
- Check: Hostinger Control Panel → SSL Certificates → Status should be "Active"

**Option B: Manual Let's Encrypt with Certbot (If needed)**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
# Certificate stored at: /etc/letsencrypt/live/yourdomain.com/

# Auto-renew (should be automatic, but verify)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 3. Firewall Configuration (Hostinger)

**In Hostinger Control Panel:**
1. Navigate to: **Security** → **Firewall**
2. Allow:
   - Port 22 (SSH) - restricted to your IP
   - Port 80 (HTTP) - allow all
   - Port 443 (HTTPS) - allow all
   - Port 3306 (MySQL) - internal only (deny all, used by Docker)
   - Port 6379 (Redis) - internal only (deny all, used by Docker)

**Don't open unusual ports unnecessarily.**

---

## Performance Optimization

### 1. Docker Resources on Hostinger

Modify `docker-compose.yml` to limit resource usage:

```yaml
version: '3.8'

services:
  backend:
    # ... existing config ...
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1024M
        reservations:
          cpus: '1'
          memory: 512M

  mysql:
    # ... existing config ...
    deploy:
      resources:
        limits:
          cpus: '1.5'
          memory: 2048M
        reservations:
          cpus: '1'
          memory: 1024M

  redis:
    # ... existing config ...
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M
```

**Why:** Prevents one service from consuming all Hostinger resources and impacting others.

### 2. MySQL Optimization for Hostinger

Create `.env.production` with MySQL-specific settings:

```bash
# MySQL Performance Tuning for 8GB RAM Hostinger VPS
MYSQL_MAX_CONNECTIONS=150
MYSQL_INNODB_BUFFER_POOL_SIZE=2G
MYSQL_QUERY_CACHE_SIZE=0
MYSQL_SLOW_QUERY_LOG=1
```

Add to `docker-compose.yml` MySQL service:
```yaml
mysql:
  environment:
    MYSQL_MAX_CONNECTIONS: ${MYSQL_MAX_CONNECTIONS:-150}
    MYSQL_INNODB_BUFFER_POOL_SIZE: ${MYSQL_INNODB_BUFFER_POOL_SIZE:-2G}
  command:
    - --max-connections=150
    - --innodb-buffer-pool-size=2G
    - --slow-query-log=1
    - --long-query-time=2
```

### 3. Caching Strategy

**On Hostinger, Redis is essential for:**
- Rate limiting (Bucket4j)
- Session caching
- Booking cache (to avoid repeated DB queries)

Monitor Redis usage:
```bash
# Check Redis memory
docker-compose exec redis redis-cli INFO memory

# Expected: Used memory < 100MB (out of 256MB allocated)
```

### 4. Java Heap Size Tuning

In `docker-compose.yml`, Spring Boot environment:
```yaml
environment:
  JAVA_OPTS: "-Xmx512m -Xms256m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
```

**Explanation:**
- `-Xmx512m`: Max heap (conservative for Hostinger, can increase to 768m if needed)
- `-Xms256m`: Initial heap (faster startup)
- `-XX:+UseG1GC`: Garbage collector optimized for low latency

---

## Monitoring & Logging

### 1. Access Application Logs

```bash
# View backend logs in real-time
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail=100 backend

# View logs from the last hour
docker-compose logs --since=60m backend

# Save logs to file for analysis
docker-compose logs backend > backend-logs.txt
```

### 2. Spring Actuator Health Check

Test health from your local machine:
```bash
curl -u admin:password https://yourdomain.com:8000/actuator/health

# Expected response:
# {"status":"UP","components":{"db":{"status":"UP"},"redis":{"status":"UP"}}}
```

### 3. Monitor Hostinger Resources

```bash
# Check CPU, RAM, disk usage
htop

# Monitor disk space specifically
df -h

# If approaching limits:
# - Delete old Docker images: docker image prune -a
# - Clear Docker cache: docker system prune
# - Archive old logs
```

### 4. Setup Email Alerts (Optional)

Configure Spring Boot to email errors:
```properties
# Add to application.properties
spring.mail.host=${MAIL_HOST:smtp.gmail.com}
spring.mail.port=${MAIL_PORT:587}
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

---

## Backup Strategy

### 1. Automated Daily Backup

Create backup script at `/home/deploy/backup-indicab.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backup/indicab"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/indicab-mysql-$DATE.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup MySQL database
docker-compose -f /home/deploy/indicab-Website/docker-compose.yml exec -T mysql \
  mysqldump -u root -p${DB_ROOT_PASSWORD} --all-databases | gzip > $BACKUP_FILE

# Backup environment file
cp /home/deploy/indicab-Website/.env.production "$BACKUP_DIR/.env.production-$DATE"

# Keep only last 30 days of backups
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete

# Log backup
echo "Backup completed: $BACKUP_FILE" >> /var/log/indicab-backup.log

# Optional: Upload to AWS S3 or cloud storage
# aws s3 cp $BACKUP_FILE s3://your-backup-bucket/indicab/
```

**Make it executable:**
```bash
chmod +x /home/deploy/backup-indicab.sh
```

**Add to crontab (runs daily at 2 AM):**
```bash
crontab -e
# Add this line:
0 2 * * * /home/deploy/backup-indicab.sh
```

### 2. Manual Restore from Backup

```bash
# Decompress backup
gunzip indicab-mysql-2026-02-23_02-00-00.sql.gz

# Restore to database
cat indicab-mysql-2026-02-23_02-00-00.sql | docker-compose exec -T mysql mysql -u root -p${DB_ROOT_PASSWORD}
```

### 3. Cloud Backup (Optional but Recommended)

Upload backups to AWS S3 or Google Drive:
```bash
# Install AWS CLI
pip install awscli

# Configure credentials
aws configure

# Upload backup
aws s3 cp /backup/indicab/indicab-mysql-*.sql.gz s3://your-backup-bucket/indicab/

# Or use rclone for Google Drive
rclone copy /backup/indicab gdrive:/indicab-backups/
```

---

## Troubleshooting Common Issues

### Issue 1: "Port Already in Use" (Port 80 or 443)

**Cause:** Another service using the port

**Solution:**
```bash
# Check what's using port 80
sudo lsof -i :80

# If Nginx is running, stop it
sudo systemctl stop nginx
sudo systemctl disable nginx

# Restart Docker Compose
docker-compose restart
```

### Issue 2: "MySQL Container Keeps Restarting"

**Symptoms:** `docker-compose logs mysql` shows repeated connection attempts

**Solution:**
```bash
# Check MySQL logs
docker-compose logs mysql

# If permission error, fix volume ownership
sudo chown -R 999:999 /var/lib/docker/volumes/indicab-mysql-data

# Restart MySQL
docker-compose restart mysql
```

### Issue 3: "High Memory Usage on Hostinger"

**Check memory:**
```bash
docker stats

# If backend uses 1GB+, reduce heap:
# Edit docker-compose.yml and change:
# JAVA_OPTS: "-Xmx256m -Xms128m"
```

### Issue 4: "Redis Connection Timeout"

**Solution:**
```bash
# Test Redis connection
docker-compose exec redis redis-cli ping

# If timeout:
1. Check Redis is running: docker-compose ps redis
2. Check Redis logs: docker-compose logs redis
3. Increase timeout in application.properties:
   spring.redis.timeout=5000  # Increase from 2000
```

### Issue 5: "SSL Certificate Not Renewing"

**Solution:**
```bash
# Check certbot status
sudo systemctl status certbot.timer

# Manually renew
sudo certbot renew --dry-run  # Test renewal
sudo certbot renew             # Actual renewal

# Check certificate expiry
sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/yourdomain.com/cert.pem
```

### Issue 6: "Database Connection Pool Exhausted"

**Error:** `Unable to acquire a new connection from the pool`

**Solution:**
```bash
# Check active connections
docker-compose exec mysql mysql -u root -p${DB_ROOT_PASSWORD} -e "SHOW STATUS WHERE variable_name = 'Threads_connected';"

# Adjust pool size in application.properties
spring.datasource.hikari.maximum-pool-size=15  # Increase from 10
```

---

## Maintenance Checklist

**Weekly:**
- [ ] Check disk usage: `df -h`
- [ ] Monitor memory: `free -h`
- [ ] Review error logs: `docker-compose logs backend | grep ERROR`

**Monthly:**
- [ ] Test backup restoration (restore to staging environment)
- [ ] Update Docker images: `docker-compose pull && docker-compose up -d`
- [ ] Check for MySQL slow queries: `docker-compose logs mysql | grep slow`
- [ ] Verify SSL certificate renewal (expires in < 30 days)

**Quarterly:**
- [ ] Review application performance metrics
- [ ] Rotate JWT_SECRET and database passwords
- [ ] Test disaster recovery plan

---

## Contact & Support

If you encounter issues on Hostinger:
1. Check Hostinger status page: https://status.hostinger.com
2. Review application logs (see Monitoring section)
3. Check system resources (CPU, RAM, disk)
4. Consult DEPLOYMENT_GUIDE.md for general Docker deployment help

---

**Last Updated:** February 23, 2026
**Version:** 1.0
