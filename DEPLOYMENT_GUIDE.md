# IndiCab Deployment Guide

**Last Updated:** February 15, 2026
**Status:** Production Ready

---

## Table of Contents
1. [Local Development with Docker Desktop](#local-development-with-docker-desktop)
2. [VPS Production Deployment](#vps-production-deployment)
3. [Prerequisites](#prerequisites)
2. [VPS Setup](#vps-setup)
3. [Docker Compose Deployment](#docker-compose-deployment)
4. [SSL/TLS Configuration](#ssltls-configuration)
5. [Production Environment Variables](#production-environment-variables)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Backup & Recovery](#backup--recovery)

---

## Local Development with Docker Desktop

### Quick Start (Development Machine)

#### Prerequisites
- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Git installed
- 4GB RAM minimum available for Docker

#### Steps

**Step 1: Clone Repository**
```bash
git clone https://github.com/your-username/indicab-Website.git
cd indicab-Website
```

**Step 2: Create Environment File**
```bash
# Copy example env file
cp .env.example .env

# Default values work for local development:
# - Database: localhost:3306 (user: indicab_user / pass: indicab_password)
# - Backend: http://localhost:8000
# - Frontend: http://localhost
# - API: http://localhost:8000/api/v1
```

**Step 3: Start Services**
```bash
# Start all services (MySQL, Backend, Frontend)
docker-compose up -d

# Watch logs
docker-compose logs -f
```

**Step 4: Verify Services**
```bash
# Check all services are healthy
docker-compose ps

# Test backend
curl http://localhost:8000/actuator/health

# Open frontend in browser
# http://localhost
```

**Step 5: Common Development Commands**
```bash
# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Stop and remove data (fresh database)
docker-compose down -v

# Rebuild images
docker-compose build

# Execute commands in containers
docker-compose exec backend /bin/sh
docker-compose exec mysql mysql -u indicab_user -pindicab_password

# Restart specific service
docker-compose restart backend
```

### Access Points (Development)
| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/api/v1/swagger-ui.html |
| MySQL | localhost:3306 |

---

## VPS Production Deployment

### Overview
Complete guide for deploying IndiCab (frontend + backend + database) on a single VPS using Docker Compose with SSL/TLS encryption.

---

## Prerequisites

### Minimum VPS Requirements
- **OS:** Ubuntu 20.04 LTS or higher / Debian 11+
- **CPU:** 2 cores minimum (4 cores recommended)
- **RAM:** 4 GB minimum (8 GB recommended for production)
- **Storage:** 50 GB minimum (100 GB recommended)
- **Network:** Public IP address with open ports 80 and 443

### Required Software
- Docker 20.10+ 
- Docker Compose 2.0+
- Git (for cloning repository)
- OpenSSL (for SSL certificates)

### Domain Requirements
- Domain name pointing to your VPS IP address (for SSL certificate)
- Email account for Let's Encrypt notifications

---

## VPS Setup

### Step 1: Connect to VPS
```bash
# SSH into your VPS
ssh root@your-vps-ip-address
# Or with specific port
ssh -p 22 root@your-vps-ip-address
```

### Step 2: Update System Packages
```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git vim
```

### Step 3: Install Docker

#### Ubuntu 20.04 / 22.04:
```bash
# Install dependencies
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up stable repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

#### Debian 11:
```bash
# Install dependencies
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up stable repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### Step 4: Configure Docker
```bash
# Add current user to docker group (optional - allows running docker without sudo)
sudo usermod -aG docker $USER
newgrp docker

# Enable Docker service to start on boot
sudo systemctl enable docker
sudo systemctl enable containerd

# Verify Docker is running
sudo systemctl status docker
```

### Step 5: Install Docker Compose (Standalone)
```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

---

## Docker Compose Deployment

### Step 1: Clone Repository
```bash
# Choose a directory for your application (e.g., /opt, /home/username)
cd /opt
sudo git clone https://github.com/your-username/indicab-Website.git
cd indicab-Website

# Set proper permissions
sudo chown -R $USER:$USER .
```

### Step 2: Create Production Environment File
```bash
# Copy the example environment file
cp .env.docker.example .env

# Edit environment variables for production
nano .env
```

### Update these variables in `.env`:
```bash
# Database (change passwords!)
DB_ROOT_PASSWORD=your-very-secure-root-password-min-16-chars
DB_NAME=indicab_website
DB_USERNAME=indicab_user
DB_PASSWORD=your-very-secure-db-password-min-16-chars
DB_PORT=3306

# Backend
BACKEND_PORT=8000
SPRING_PROFILE=production
JPA_DDL_AUTO=validate  # Use 'validate' in production (not 'update')

# JWT (generate new secure keys)
JWT_SECRET=your-new-super-secure-jwt-secret-min-32-chars-generated-for-production
JWT_EXPIRATION=900
JWT_REFRESH_EXPIRATION=604800

# CORS (update with your domain)
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Frontend
FRONTEND_PORT=80
VITE_API_URL=https://your-domain.com/api/v1

# Email (Gmail example)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-specific-password
ADMIN_EMAIL=admin@your-domain.com
MAIL_FROM=noreply@your-domain.com

# Payment Gateway (optional)
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

### Step 3: Build and Start Services
```bash
# Build Docker images
docker-compose build

# Start services in detached mode
docker-compose up -d

# Verify services are running
docker-compose ps
docker-compose logs -f
```

### Step 4: Verify Deployment
```bash
# Check if all services are healthy
docker-compose ps

# Test backend API
curl http://localhost:8000/api/v1/health

# Test frontend
curl http://localhost

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql
```

---

## SSL/TLS Configuration

### Option A: Let's Encrypt with Certbot (Recommended for Production)

#### Step 1: Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

#### Step 2: Stop Nginx Container (Port 80 must be available for validation)
```bash
# Temporarily stop frontend service
docker-compose stop frontend

# Verify port 80 is free
sudo ss -tulpn | grep :80
```

#### Step 3: Generate SSL Certificate
```bash
# Request certificate for your domain
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Choose email for Let's Encrypt notifications
# Accept terms of service
# Choose renewal option (2 = recommended)

# Certificates will be stored at:
# /etc/letsencrypt/live/your-domain.com/
```

#### Step 4: Configure Nginx with SSL Certificates
```bash
# Copy certificates to Docker volume
sudo mkdir -p /opt/indicab-Website/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/indicab-Website/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/indicab-Website/ssl/
sudo chown -R 1000:1000 /opt/indicab-Website/ssl

# Update docker-compose.yml to mount SSL certificates
```

#### Step 5: Update docker-compose.yml
Add volume mount to frontend service:
```yaml
frontend:
  volumes:
    - ./ssl:/etc/nginx/ssl:ro  # Mount SSL certificates as read-only
```

#### Step 6: Restart Services
```bash
# Restart frontend with SSL
docker-compose up -d frontend

# Verify Nginx is running
docker-compose logs frontend

# Test HTTPS
curl https://your-domain.com
```

#### Step 7: Setup Auto-Renewal
```bash
# Test renewal process
sudo certbot renew --dry-run

# Setup cron job for auto-renewal
sudo crontab -e

# Add this line (renews at 2 AM daily):
# 0 2 * * * certbot renew --quiet && cp /etc/letsencrypt/live/your-domain.com/*.pem /opt/indicab-Website/ssl/ && docker-compose -f /opt/indicab-Website/docker-compose.yml exec -T frontend nginx -s reload
```

### Option B: Self-Signed Certificate (Development/Testing Only)

```bash
# Generate self-signed certificate valid for 365 days
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./ssl/privkey.pem \
  -out ./ssl/fullchain.pem \
  -subj "/C=IN/ST=State/L=City/O=Indicab/CN=your-domain.com"

# Set permissions
chmod 644 ./ssl/fullchain.pem
chmod 600 ./ssl/privkey.pem
```

### Option C: Using docker-compose with Certbot Container

Add to `docker-compose.yml`:
```yaml
certbot:
  image: certbot/certbot
  volumes:
    - ./ssl:/etc/letsencrypt
    - ./certbot:/var/www/certbot
  entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
  depends_on:
    - frontend
```

---

## Production Environment Variables

### Complete Production .env Template

```bash
# ===================================
# DATABASE
# ===================================
DB_ROOT_PASSWORD=your-secure-root-password-32-chars-min
DB_NAME=indicab_website
DB_USERNAME=indicab_user
DB_PASSWORD=your-secure-db-password-32-chars-min
DB_PORT=3306

# ===================================
# BACKEND SPRING BOOT
# ===================================
BACKEND_PORT=8000
SPRING_PROFILE=production
JPA_DDL_AUTO=validate
JPA_SHOW_SQL=false

# ===================================
# SECURITY - JWT
# ===================================
JWT_SECRET=your-new-secure-jwt-key-change-this-for-production-min-32-chars
JWT_EXPIRATION=900
JWT_REFRESH_EXPIRATION=604800

# ===================================
# CORS - Update for your domain
# ===================================
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# ===================================
# FRONTEND
# ===================================
FRONTEND_PORT=80
VITE_API_URL=https://your-domain.com/api/v1
VITE_APP_NAME=Indicab
VITE_APP_VERSION=1.0.0

# ===================================
# EMAIL NOTIFICATIONS
# ===================================
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=your-app-specific-password
ADMIN_EMAIL=admin@your-domain.com
MAIL_FROM=noreply@your-domain.com

# ===================================
# PAYMENT GATEWAYS
# ===================================
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

STRIPE_API_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ===================================
# ERROR TRACKING
# ===================================
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# ===================================
# LOGGING
# ===================================
VITE_LOG_LEVEL=warn

# ===================================
# FEATURES
# ===================================
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PAYMENT=true
VITE_ENABLE_DRIVER_MODE=true
VITE_ENABLE_ADMIN_PANEL=true
VITE_DEBUG_MODE=false
```

### Security Best Practices
- ✅ Never commit `.env` file to git
- ✅ Use strong passwords (minimum 32 characters for secrets)
- ✅ Regenerate JWT_SECRET for production
- ✅ Use application-specific passwords for email (Gmail)
- ✅ Enable 2FA on all external service accounts
- ✅ Rotate credentials regularly

---

## Monitoring & Maintenance

### View Application Logs
```bash
# All services
docker-compose logs -f

# Specific service (last 100 lines)
docker-compose logs --tail=100 backend
docker-compose logs --tail=100 frontend
docker-compose logs --tail=100 mysql

# Real-time logs
docker-compose logs -f --timestamps

# Logs from last hour
docker-compose logs --since 1h backend
```

### Monitor Resource Usage
```bash
# View container stats (CPU, memory, network)
docker stats

# Specific container
docker stats indicab-backend

# View logs with timestamps
docker-compose logs --timestamps -f
```

### Database Backups

#### Manual Backup
```bash
# Create backup directory
mkdir -p ./backups

# Backup MySQL database
docker-compose exec -T mysql mysqldump -u indicab_user -p"${DB_PASSWORD}" indicab_website > ./backups/indicab_website_$(date +%Y%m%d_%H%M%S).sql

# Compress backup
gzip ./backups/indicab_website_*.sql

# List backups
ls -lh ./backups/
```

#### Automated Backup (Cron Job)
```bash
# Edit crontab
sudo crontab -e

# Add this line (backup daily at 3 AM):
0 3 * * * cd /opt/indicab-Website && docker-compose exec -T mysql mysqldump -u indicab_user -p"${DB_PASSWORD}" indicab_website | gzip > backups/indicab_website_$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz
```

### Restore from Backup
```bash
# First, ensure services are running
docker-compose up -d mysql

# Wait for MySQL to start
sleep 10

# Restore database
gunzip < ./backups/indicab_website_YYYYMMDD_HHMMSS.sql.gz | docker-compose exec -T mysql mysql -u indicab_user -p"${DB_PASSWORD}" indicab_website
```

### Health Checks
```bash
# Check service health
docker-compose ps

# Check backend health
curl http://localhost:8000/api/v1/health

# Check frontend
curl -I http://localhost

# Check database connection
docker-compose exec mysql mysql -u indicab_user -p"${DB_PASSWORD}" -e "SELECT 1"
```

### Update Services
```bash
# Pull latest code
git pull origin main

# Rebuild images
docker-compose build

# Restart services with zero downtime
docker-compose up -d

# Verify all services are running
docker-compose ps
```

---

## Troubleshooting

### Container Fails to Start
```bash
# Check logs
docker-compose logs <service-name>

# Check resource availability
docker stats

# Restart service
docker-compose restart <service-name>

# Rebuild and restart
docker-compose build <service-name>
docker-compose up -d <service-name>
```

### Port Already in Use
```bash
# Find process using port
sudo lsof -i :<port-number>

# Kill process
sudo kill -9 <PID>

# Or change port in docker-compose.yml
```

### Database Connection Issues
```bash
# Test MySQL connection
docker-compose exec mysql mysql -u indicab_user -p"${DB_PASSWORD}" -e "SELECT 1"

# Check MySQL logs
docker-compose logs mysql

# Reset database (WARNING: DELETES DATA)
docker-compose down -v  # Remove volumes
docker-compose up -d    # Recreate with fresh database
```

### Frontend Not Loading
```bash
# Check Nginx is running
docker-compose exec frontend nginx -t

# Reload Nginx
docker-compose exec frontend nginx -s reload

# Check frontend logs
docker-compose logs frontend
```

### SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in ./ssl/fullchain.pem -text -noout

# Check certificate expiration
openssl x509 -in ./ssl/fullchain.pem -noout -dates

# Verify certificate matches key
openssl x509 -noout -modulus -in ./ssl/fullchain.pem | openssl md5
openssl rsa -noout -modulus -in ./ssl/privkey.pem | openssl md5
# Both should output the same hash
```

---

## Backup & Recovery

### System Backup Strategy
```bash
# Backup everything (code + databases + volumes)
docker-compose down

# Backup application directory
sudo tar -czf /backup/indicab-app-$(date +%Y%m%d).tar.gz /opt/indicab-Website

# Backup Docker volumes
sudo tar -czf /backup/indicab-volumes-$(date +%Y%m%d).tar.gz /var/lib/docker/volumes

# Restart services
docker-compose up -d

# Verify backup
tar -tzf /backup/indicab-app-*.tar.gz | head
```

### Disaster Recovery
```bash
# 1. Restore application code
sudo tar -xzf /backup/indicab-app-YYYYMMDD.tar.gz -C /

# 2. Restore volumes
sudo tar -xzf /backup/indicab-volumes-YYYYMMDD.tar.gz -C /

# 3. Fix permissions
sudo chown -R $USER:$USER /opt/indicab-Website

# 4. Restart services
docker-compose up -d

# 5. Verify services
docker-compose ps
curl http://localhost
```

---

## Production Security Checklist

### Secrets Management

#### Environment Variables (Critical - Never Commit to Git)
```bash
# Create a secure .env file with production values
cp .env.example .env

# Set restrictive permissions (only owner can read)
chmod 600 .env

# Ensure .env is in .gitignore
echo ".env" >> .gitignore
```

#### Required Secret Keys (Generate New for Production)

1. **JWT_SECRET** (32+ characters minimum, 64+ recommended)
   ```bash
   # Generate secure JWT secret
   openssl rand -base64 32
   # Example output: AbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnO=
   ```

2. **Database Root Password** (32+ characters, strong entropy)
   ```bash
   # Generate secure database password
   openssl rand -base64 24
   ```

3. **Database User Password** (32+ characters, strong entropy)
   ```bash
   # Generate secure user password
   openssl rand -base64 24
   ```

4. **Redis Password** (32+ characters, optional but recommended)
   ```bash
   # Generate Redis password if using authentication
   openssl rand -base64 24
   ```

#### Secrets Storage Best Practices
- ✅ Use environment variable management tools:
  - AWS Secrets Manager
  - HashiCorp Vault
  - Azure Key Vault
  - GitLab CI/CD Secrets
  - GitHub Secrets (for CI/CD only)
- ✅ Never log sensitive information
- ✅ Rotate credentials every 90 days
- ✅ Use different secrets for dev/staging/production
- ✅ Audit access to secrets regularly
- ✅ Use strong authentication for secret managers

#### Production .env Template (Secrets Section)
```bash
# ===================================
# CRITICAL SECURITY VARIABLES
# ===================================

# JWT Secret (64+ chars, high entropy, unique per environment)
JWT_SECRET=<GENERATE_NEW_SECURE_VALUE_MIN_64_CHARS>

# Database Credentials (strong, unique per environment)
DB_ROOT_PASSWORD=<GENERATE_NEW_SECURE_VALUE_MIN_32_CHARS>
DB_PASSWORD=<GENERATE_NEW_SECURE_VALUE_MIN_32_CHARS>

# Redis Password (optional, recommended for production)
REDIS_PASSWORD=<GENERATE_NEW_SECURE_VALUE_MIN_32_CHARS>

# Email Credentials (use app-specific passwords, not main account)
MAIL_PASSWORD=<APP_SPECIFIC_PASSWORD>

# Payment Gateway Keys (never hardcode, use secrets manager)
RAZORPAY_KEY_SECRET=<RAZORPAY_LIVE_SECRET_KEY>
STRIPE_API_KEY=<STRIPE_LIVE_API_KEY>
STRIPE_WEBHOOK_SECRET=<STRIPE_WEBHOOK_SECRET>

# ===================================
# NON-SECRET VARIABLES (Safe to commit to config)
# ===================================

# Application Configuration
SPRING_PROFILE=production
JPA_DDL_AUTO=validate
BACKEND_PORT=8000

# CORS Configuration (update with your domain)
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Redis Configuration (if using)
REDIS_ENABLED=true
REDIS_HOST=redis
REDIS_PORT=6379

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
ADMIN_EMAIL=admin@your-domain.com
MAIL_FROM=noreply@your-domain.com

# Frontend Configuration
FRONTEND_PORT=80
VITE_API_URL=https://your-domain.com/api/v1

# Logging
VITE_LOG_LEVEL=warn
```

### Security Hardening

#### 1. Firewall Configuration
```bash
# Allow SSH (port 22), HTTP (80), HTTPS (443)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Check firewall rules
sudo ufw status
```

#### 2. SSH Hardening
```bash
# Disable password authentication (use key-based only)
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# Change default SSH port (optional)
# sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config

# Restart SSH
sudo systemctl restart sshd
```

#### 3. System Updates
```bash
# Keep system patched for security
sudo apt update && sudo apt upgrade -y

# Enable automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

#### 4. Docker Security
```bash
# Run Docker daemon in rootless mode (optional, advanced)
dockerd-rootless-setuptool.sh install

# Restrict Docker socket permissions
sudo chmod 660 /var/run/docker.sock
```

#### 5. Monitor Sensitive Logs
```bash
# Monitor JWT errors
docker-compose logs backend | grep "JWT"

# Monitor rate limit hits
docker-compose logs backend | grep "Rate limit"

# Monitor authentication failures
docker-compose logs backend | grep -i "unauthorized\|forbidden"
```

---

## Deployment Checklist

### Pre-Deployment Security Review
- [ ] JWT_SECRET generated (64+ chars, not default value)
- [ ] Database passwords generated (32+ chars each)
- [ ] Redis password set if REDIS_ENABLED=true
- [ ] All secrets stored in secure vault/manager
- [ ] .env file has restrictive permissions (600)
- [ ] .env file is in .gitignore
- [ ] CORS_ALLOWED_ORIGINS updated with your domain
- [ ] SSL certificates obtained and configured
- [ ] Firewall rules configured (22, 80, 443)
- [ ] SSH key-based authentication enabled

### Pre-Deployment Infrastructure
- [ ] VPS provisioned with 4GB+ RAM, 2+ CPU cores
- [ ] Docker and Docker Compose installed and verified
- [ ] Repository cloned to `/opt/indicab-Website`
- [ ] System packages updated and patched
- [ ] Swap space configured (if needed)
- [ ] DNS records pointing to VPS IP
- [ ] SSH access verified

### Build & Testing
- [ ] Repository updated to latest code
- [ ] `.env` file created with production values
- [ ] `docker-compose build` completes successfully
- [ ] `docker-compose up -d` starts all services without errors
- [ ] Run integration tests: `docker-compose exec backend mvn test`
- [ ] All services show "healthy" in `docker-compose ps`

### Health & Verification
- [ ] Backend API responds to health check (GET /actuator/health)
- [ ] Frontend loads successfully via HTTPS
- [ ] Database connection verified
- [ ] Redis connection verified (if enabled)
- [ ] API endpoints responding correctly
- [ ] Authentication flow tested (login, register, token refresh)
- [ ] Rate limiting working (test /api/auth/login multiple times)
- [ ] Error handling verified (test with invalid requests)

### Data & Backups
- [ ] Database backup script configured
- [ ] Auto-backup cron job set up
- [ ] Backup storage location secured
- [ ] Disaster recovery procedure documented
- [ ] Test restore from backup (on staging first!)

### Monitoring & Logging
- [ ] Application logs configured
- [ ] Log retention policy set
- [ ] Error tracking (Sentry, etc.) configured
- [ ] Email notifications tested
- [ ] Admin alerts configured for critical errors
- [ ] Performance baselines established

### Operations
- [ ] SSL certificate auto-renewal configured
- [ ] Certificate expiration monitoring set up
- [ ] Security updates scheduled
- [ ] Database maintenance scheduled
- [ ] Backup retention policy documented
- [ ] Incident response plan documented
- [ ] On-call rotation configured

### Post-Deployment
- [ ] 24-hour monitoring period passed without issues
- [ ] User acceptance testing completed
- [ ] Performance metrics within acceptable range
- [ ] Security scanning completed (Trivy, OWASP)
- [ ] Backup restoration tested
- [ ] Documentation updated with production details
- [ ] Team trained on operational procedures

---

## Support & Documentation

- **API Documentation:** `https://your-domain.com/api/v1/swagger-ui.html`
- **Backend Logs:** `docker-compose logs backend`
- **Frontend Logs:** `docker-compose logs frontend`
- **Database Logs:** `docker-compose logs mysql`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Feb 15, 2026 | Initial deployment guide with Docker Compose and SSL/TLS |

---

*Last Updated: February 15, 2026*  
*Maintained by: IndiCab Development Team*
