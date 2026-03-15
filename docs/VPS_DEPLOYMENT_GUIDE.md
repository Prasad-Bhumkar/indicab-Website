# IndiCab VPS Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the entire IndiCab application stack on a single VPS using Docker Compose. The setup includes:
- **Frontend**: React application (Vite)
- **Backend**: Spring Boot 3.5.3
- **Database**: MySQL 8.0
- **Cache**: Redis 7.0
- **Reverse Proxy**: Nginx with SSL/TLS

## Prerequisites

### VPS Requirements
- **OS**: Ubuntu 20.04 LTS or Debian 11+
- **Minimum Resources**:
  - CPU: 2 cores (4 cores recommended)
  - RAM: 4GB (8GB+ recommended)
  - Storage: 50GB+ (SSD preferred)
  - Bandwidth: Unmetered or 500GB+ monthly
- **Network**: Static IP address, port 80 & 443 open

### Tools Installation
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version

# Install curl and git (if not already present)
sudo apt install -y curl git
```

## Step 1: Clone Repository and Prepare Directories

```bash
# Clone the repository
git clone https://github.com/yourusername/indicab-Website.git
cd indicab-Website

# Create necessary directories
mkdir -p db-init ssl html logs

# Set proper permissions
chmod 755 db-init ssl html logs
```

## Step 2: Build Docker Images

### Build Backend Image
```bash
cd indicab-backend

# Ensure Maven is built
./mvnw clean package -DskipTests

# Build Docker image
docker build -t indicab-backend:latest .

cd ..
```

### Build Frontend Image
```bash
cd indicab-frontend

# Build the Vite application
npm install
npm run build

# Create Dockerfile for frontend
cat > Dockerfile << 'EOF'
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
EOF

# Build Docker image
docker build -t indicab-frontend:latest .

cd ..
```

## Step 3: Configure Environment Variables

```bash
# Copy the production environment file
cp .env.production .env.prod

# Edit the environment file with your values
nano .env.prod
```

### Critical Environment Variables to Update
```bash
# Replace these values:
MYSQL_ROOT_PASSWORD=YourSecurePassword123!
MYSQL_USER=indicab_user
MYSQL_PASSWORD=YourDatabasePassword456!
REDIS_PASSWORD=YourRedisPassword789!
JWT_SECRET=YourBase64EncodedJWTSecret
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
VITE_API_BASE_URL=https://yourdomain.com/api
DOMAIN_NAME=yourdomain.com
LETSENCRYPT_EMAIL=admin@yourdomain.com
```

### Generate Secure Passwords
```bash
# Generate random passwords
openssl rand -base64 32  # For MySQL
openssl rand -base64 32  # For Redis
openssl rand -base64 256 # For JWT Secret
```

## Step 4: Setup SSL/TLS Certificates

### Option A: Using Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates to ssl directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/indicab.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/indicab.key
sudo chown $USER:$USER ./ssl/*
```

### Option B: Using Self-Signed Certificate (Testing Only)
```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./ssl/indicab.key \
  -out ./ssl/indicab.crt \
  -subj "/C=IN/ST=State/L=City/O=IndiCab/CN=yourdomain.com"
```

### Update Nginx Configuration
```bash
# Edit nginx.conf and replace:
# - yourdomain.com with your actual domain
# - Certificate paths if different

nano nginx.conf
```

## Step 5: Initialize Database

### Create Database Initialization Script
```bash
cat > db-init/01-init.sql << 'EOF'
-- Create initial database
CREATE DATABASE IF NOT EXISTS indicab_prod;
USE indicab_prod;

-- Create admin user
CREATE USER IF NOT EXISTS 'indicab_user'@'%' IDENTIFIED BY 'YourDatabasePassword456!';
GRANT ALL PRIVILEGES ON indicab_prod.* TO 'indicab_user'@'%';
FLUSH PRIVILEGES;

-- Enable necessary MySQL features for JPA
SET GLOBAL sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
EOF

chmod 644 db-init/01-init.sql
```

## Step 6: Start the Application

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Verify all containers are running
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Expected Output
```
STATUS  CONTAINER NAME        PORTS
Up      indicab-mysql        3306/tcp
Up      indicab-redis        6379/tcp
Up      indicab-backend      8080/tcp
Up      indicab-frontend     5173/tcp
Up      indicab-nginx        0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

## Step 7: Verify Deployment

```bash
# Test API endpoint
curl -k https://yourdomain.com/api/service-cities

# Test frontend
curl -k https://yourdomain.com

# Check Docker logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs mysql
```

## Step 8: Configure Automatic Backups

### Database Backup Script
```bash
cat > ./backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/indicab"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/indicab_backup_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

# Backup MySQL database
docker-compose -f docker-compose.prod.yml exec -T mysql mysqldump \
  -u indicab_user \
  -pYourDatabasePassword456! \
  --all-databases > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
EOF

chmod +x ./backup.sh

# Schedule daily backups using cron
crontab -e
# Add this line:
# 0 2 * * * /path/to/backup.sh
```

## Step 9: Setup Monitoring and Logs

### Docker Log Rotation
```bash
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

sudo systemctl restart docker
```

### Monitor System Resources
```bash
# Install htop for real-time monitoring
sudo apt install -y htop

# View Docker resource usage
docker stats
```

## Step 10: Configure Auto-Renewal for SSL Certificates

```bash
# Create renewal script
cat > /usr/local/bin/renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /path/to/ssl/indicab.crt
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /path/to/ssl/indicab.key
docker-compose -f /path/to/docker-compose.prod.yml restart nginx
EOF

chmod +x /usr/local/bin/renew-ssl.sh

# Add to crontab
crontab -e
# Add this line:
# 0 3 * * 1 /usr/local/bin/renew-ssl.sh
```

## Maintenance Commands

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f mysql
```

### Stop and Start Services
```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

### Database Management
```bash
# Access MySQL shell
docker-compose -f docker-compose.prod.yml exec mysql mysql -u indicab_user -p indicab_prod

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend ./mvnw flyway:migrate
```

### Clear Cache
```bash
# Flush Redis cache
docker-compose -f docker-compose.prod.yml exec redis redis-cli -a YourRedisPassword789! FLUSHALL
```

## Troubleshooting

### Issue: Services not starting
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Verify port availability
sudo netstat -tlnp | grep LISTEN

# Check disk space
df -h
```

### Issue: Database connection errors
```bash
# Verify MySQL is running
docker-compose -f docker-compose.prod.yml exec mysql mysql -u indicab_user -p -e "SELECT 1"

# Check MySQL logs
docker-compose -f docker-compose.prod.yml logs mysql
```

### Issue: Frontend not loading
```bash
# Verify Nginx configuration
docker exec indicab-nginx nginx -t

# Check Nginx logs
docker-compose -f docker-compose.prod.yml logs nginx

# Verify frontend files exist
docker exec indicab-nginx ls -la /usr/share/nginx/html/
```

### Issue: API timeouts
```bash
# Check backend health
curl -k https://yourdomain.com/actuator/health

# View backend logs
docker-compose -f docker-compose.prod.yml logs backend

# Verify Redis connection
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
```

## Performance Tuning

### Nginx Optimization
- Increase `worker_connections` in nginx.conf for high traffic
- Enable caching headers for static assets
- Use CDN for static assets if needed

### Database Optimization
- Regular backups and optimization: `OPTIMIZE TABLE tablename;`
- Monitor slow queries: `SET GLOBAL slow_query_log = 'ON';`
- Adjust buffer pool size based on RAM

### Redis Optimization
- Monitor memory usage: `redis-cli INFO memory`
- Enable maxmemory policy for automatic eviction
- Use persistence with caution on SSD only

## Security Best Practices

1. **Change all default passwords** in .env.prod
2. **Enable firewall**: `sudo ufw enable && sudo ufw default deny incoming`
3. **Open only necessary ports**:
   ```bash
   sudo ufw allow 22/tcp    # SSH
   sudo ufw allow 80/tcp    # HTTP
   sudo ufw allow 443/tcp   # HTTPS
   ```
4. **Implement DDoS protection** using fail2ban or Cloudflare
5. **Regular security updates**: `sudo apt update && sudo apt upgrade`
6. **Monitor logs regularly** for suspicious activity
7. **Use strong, unique passwords** for all services
8. **Implement API rate limiting** (already configured in nginx.conf)

## Deployment Checklist

- [ ] VPS created with adequate resources
- [ ] Docker and Docker Compose installed
- [ ] Repository cloned
- [ ] Environment variables configured
- [ ] SSL certificates obtained
- [ ] Database initialization script created
- [ ] Docker images built successfully
- [ ] All services started and running
- [ ] SSL certificate renewal scheduled
- [ ] Backup script created and scheduled
- [ ] Monitoring and logging configured
- [ ] Security best practices implemented
- [ ] Domain DNS records pointed to VPS IP
- [ ] HTTPS access verified
- [ ] API endpoints tested
- [ ] Admin panel accessible

## Support and Maintenance

For issues or questions:
1. Check application logs: `docker-compose logs -f`
2. Review system resources: `docker stats`
3. Consult Docker documentation: https://docs.docker.com
4. For Spring Boot issues: https://spring.io/projects/spring-boot
5. For React/Vite issues: https://vitejs.dev

---
**Last Updated**: February 15, 2026
**Version**: 1.0
**Status**: Production Ready
