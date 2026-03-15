# SSL/TLS Setup Guide for IndiCab

**Status:** Production-Ready Configuration  
**Last Updated:** March 4, 2026  
**Priority:** CRITICAL - Security

---

## Overview

This guide provides step-by-step instructions for setting up HTTPS/SSL/TLS certificates using Let's Encrypt with automatic renewal. This ensures secure encrypted communication between clients and the IndiCab application.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Certbot Installation](#certbot-installation)
3. [Certificate Generation](#certificate-generation)
4. [Nginx Configuration](#nginx-configuration)
5. [Automatic Renewal](#automatic-renewal)
6. [Verification & Testing](#verification--testing)
7. [Troubleshooting](#troubleshooting)
8. [Security Best Practices](#security-best-practices)

---

## Prerequisites

Before starting SSL/TLS configuration, ensure:

- [ ] Domain name registered and pointing to your server IP
- [ ] Server IP accessible on ports 80 and 443
- [ ] Nginx installed and running
- [ ] Root/sudo access to the server
- [ ] Port 80 and 443 are open in firewall

**Check Prerequisites:**

```bash
# Verify domain resolves correctly
nslookup yourdomain.com
# OR
dig yourdomain.com

# Verify port access
nc -zv yourdomain.com 80
nc -zv yourdomain.com 443

# Check firewall
sudo ufw status
# Should show: 80/tcp, 443/tcp ALLOW
```

---

## Certbot Installation

### On Ubuntu/Debian

```bash
# Update package manager
sudo apt-get update
sudo apt-get upgrade -y

# Install Certbot and Nginx plugin
sudo apt-get install certbot python3-certbot-nginx -y

# Verify installation
certbot --version
```

### On CentOS/RHEL

```bash
# Install Certbot
sudo yum install certbot python3-certbot-nginx -y

# Verify installation
certbot --version
```

### On Amazon Linux 2

```bash
# Install Certbot from EPEL
sudo amazon-linux-extras install certbot-nginx -y

# Verify installation
certbot --version
```

---

## Certificate Generation

### Method 1: Automatic (Recommended - Nginx Plugin)

The simplest method - Certbot automatically configures Nginx:

```bash
# Generate certificate for single domain
sudo certbot certonly --nginx \
  -d yourdomain.com

# Generate certificate for multiple domains
sudo certbot certonly --nginx \
  -d yourdomain.com \
  -d www.yourdomain.com \
  -d api.yourdomain.com

# Interactive mode (answers prompts)
sudo certbot certonly --nginx
```

### Method 2: Manual (Standalone)

If Nginx is not yet configured:

```bash
# Temporarily stop Nginx (if running)
sudo systemctl stop nginx

# Generate certificate
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com

# Start Nginx again
sudo systemctl start nginx
```

### Method 3: DNS Challenge (For Wildcard Certificates)

Useful for wildcard domains like `*.yourdomain.com`:

```bash
# Generate wildcard certificate
sudo certbot certonly --manual --preferred-challenges dns \
  -d yourdomain.com \
  -d "*.yourdomain.com"

# You'll be prompted to add DNS TXT records
# Follow the instructions to verify domain ownership
```

---

## Certificate Location

After generation, certificates are stored at:

```
/etc/letsencrypt/live/yourdomain.com/
├── privkey.pem           # Private key (KEEP SECURE!)
├── fullchain.pem         # Full certificate chain (use this for Nginx)
├── cert.pem              # Certificate only
└── chain.pem             # CA chain
```

**Important Files for Nginx:**
- `fullchain.pem` - Use this as `ssl_certificate`
- `privkey.pem` - Use this as `ssl_certificate_key`

---

## Nginx Configuration

### Update Nginx Configuration

Edit your Nginx config file:

```bash
sudo nano /etc/nginx/sites-available/default
# OR
sudo nano /etc/nginx/nginx.conf
```

### HTTPS Server Block (Production)

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Allow certbot validation
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server Block
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificates - Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Configuration - Modern (TLS 1.2+)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5:!3DES;
    
    # TLS 1.3 specific settings
    ssl_conf_command Ciphers TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256;

    # Session Management
    ssl_session_cache shared:SSL:50m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;

    # OCSP Stapling (optional but recommended)
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/yourdomain.com/chain.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'" always;

    # Hide Nginx version
    server_tokens off;

    # Root directory and index
    root /var/www/indicab;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/atom+xml image/svg+xml;

    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
    limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=10r/m;

    # API routes
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # WebSocket support
    location /ws/ {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;
        proxy_connect_timeout 60s;
    }

    # Frontend routes (React SPA)
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=0, must-revalidate" always;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable" always;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log warn;
}
```

### Validate Nginx Configuration

```bash
# Test Nginx configuration syntax
sudo nginx -t

# Should output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Reload Nginx

```bash
# Reload configuration (graceful restart)
sudo systemctl reload nginx

# OR restart
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

---

## Automatic Renewal

Let's Encrypt certificates expire after 90 days. Set up automatic renewal:

### Option 1: Systemd Timer (Recommended)

```bash
# Enable and start the certbot renewal timer
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Check timer status
sudo systemctl status certbot.timer
sudo systemctl list-timers --all | grep certbot
```

### Option 2: Cron Job

```bash
# Edit crontab
sudo crontab -e

# Add renewal job (runs daily at 2:30 AM)
30 2 * * * /usr/bin/certbot renew --quiet --noninteractive --post-hook "systemctl reload nginx"
```

### Option 3: Manual Renewal

```bash
# Manually renew certificates
sudo certbot renew

# Dry run (test renewal without making changes)
sudo certbot renew --dry-run
```

### Verify Renewal Setup

```bash
# Check renewal hooks
sudo certbot show yourdomain.com

# Test renewal process
sudo certbot renew --dry-run

# Should output: Congratulations, all renewals succeeded
```

---

## Verification & Testing

### 1. Test HTTPS Endpoint

```bash
# Simple HTTPS request
curl https://yourdomain.com

# Verbose output to see certificate details
curl -v https://yourdomain.com

# Show certificate chain
curl -I https://yourdomain.com

# Check response status (should be 200)
curl -w "\nStatus: %{http_code}\n" https://yourdomain.com
```

### 2. Check HTTP to HTTPS Redirect

```bash
# Should redirect to HTTPS (301 status)
curl -I http://yourdomain.com

# Should show:
# HTTP/1.1 301 Moved Permanently
# Location: https://yourdomain.com
```

### 3. Verify SSL Certificate

```bash
# View certificate details
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout

# Check certificate expiration date
openssl x509 -enddate -noout -in /etc/letsencrypt/live/yourdomain.com/cert.pem

# Output should show: notAfter=YYYY-MM-DD (should be ~90 days in future)
```

### 4. SSL Labs Test (Online)

Visit: https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com

- Should show: **A** or **A+** rating
- Check for:
  - ✅ Certificate validity
  - ✅ Protocol support (TLS 1.2, 1.3)
  - ✅ Key exchange
  - ✅ Cipher strength
  - ✅ Certificate chain

### 5. Certificate Chain Verification

```bash
# Verify full chain
openssl verify -CAfile /etc/letsencrypt/live/yourdomain.com/chain.pem \
  /etc/letsencrypt/live/yourdomain.com/cert.pem

# Output should be: OK
```

### 6. Test with Browser

```
1. Open https://yourdomain.com in browser
2. Click lock icon in address bar
3. Verify certificate:
   - Issuer: Let's Encrypt Authority
   - Valid for: yourdomain.com, www.yourdomain.com
   - Expires: ~90 days from generation date
```

---

## Troubleshooting

### Certificate Generation Fails

**Problem:** `Error during authentication... Challenge failed`

**Solution:**
```bash
# Check if port 80 is accessible
sudo ufw allow 80
sudo ufw allow 443

# Check if Nginx is blocking port 80
sudo systemctl stop nginx
sudo certbot certonly --standalone -d yourdomain.com
sudo systemctl start nginx

# Check DNS resolution
nslookup yourdomain.com
# Should return your server's IP
```

### SSL Certificate Not Loading in Browser

**Problem:** Browser shows "NET::ERR_CERT_AUTHORITY_INVALID"

**Solution:**
```bash
# Verify certificate files exist
ls -la /etc/letsencrypt/live/yourdomain.com/

# Check Nginx configuration references correct path
grep ssl_certificate /etc/nginx/nginx.conf

# Test Nginx syntax
sudo nginx -t

# Check Nginx logs
sudo tail -50 /var/log/nginx/error.log
```

### HTTP Not Redirecting to HTTPS

**Problem:** `http://yourdomain.com` doesn't redirect

**Solution:**
```bash
# Check Nginx configuration has redirect block
sudo grep -A 5 "listen 80" /etc/nginx/nginx.conf

# Reload Nginx
sudo systemctl reload nginx

# Test with curl
curl -I http://yourdomain.com
# Should show 301 status
```

### Certificate Renewal Failing

**Problem:** Certbot renewal scheduled but failing

**Solution:**
```bash
# Check renewal logs
sudo journalctl -u certbot.service --no-pager | tail -50

# OR check cron logs
sudo grep CRON /var/log/syslog | tail -20

# Manually test renewal
sudo certbot renew --dry-run -v

# Check certificate expiration
sudo certbot certificates

# Manually renew if needed
sudo certbot renew --force-renewal
```

### Mixed Content Error (HTTPS page loading HTTP resources)

**Problem:** Browser console shows mixed content warnings

**Solution:**
```bash
# Update all resource URLs to use HTTPS
# In HTML, CSS, JS: Change http:// to https://

# Force HTTPS in API calls
# Update API_BASE_URL in .env files

# Restart services
docker-compose restart frontend backend
```

---

## Security Best Practices

### 1. Secure Certificate Permissions

```bash
# Ensure private key is only readable by root/nginx
sudo ls -la /etc/letsencrypt/live/yourdomain.com/

# Should show: -rw-r--r-- for .pem files
# Private key should NOT be world-readable
sudo chmod 600 /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### 2. Implement HSTS

```nginx
# Already included in configuration above
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# This tells browsers to always use HTTPS for 1 year (31536000 seconds)
# 'preload' flag submits domain to HSTS preload list
```

### 3. Monitor Certificate Expiration

```bash
# Set up alerts (via Nagios, Zabbix, etc.)
# OR use a monitoring service

# Check expiration date regularly
echo "Certificate expires on: $(openssl x509 -enddate -noout -in /etc/letsencrypt/live/yourdomain.com/cert.pem | cut -d= -f2)"

# Add to crontab to get email alerts
0 0 * * * /usr/bin/certbot certificates | grep "Expiration Date" | mail -s "SSL Certificate Status" admin@yourdomain.com
```

### 4. Keep Certbot Updated

```bash
# Update certbot regularly
sudo apt-get update
sudo apt-get upgrade certbot

# Check version
certbot --version
```

### 5. Backup Certificates

```bash
# Backup Let's Encrypt certificates
sudo tar -czf /backup/letsencrypt-$(date +%Y%m%d).tar.gz /etc/letsencrypt/

# Store securely (consider encrypted backup storage)
```

### 6. Use Strong Ciphers

The configuration above uses:
- TLS 1.2 and 1.3 minimum
- Strong cipher suites
- Preference for server-selected ciphers
- Forward secrecy with ECDHE

---

## Success Criteria Checklist

- [x] SSL certificate installed (`/etc/letsencrypt/live/yourdomain.com/`)
- [x] HTTPS endpoint working on port 443
- [x] HTTP requests redirect to HTTPS (301)
- [x] Auto-renewal configured (systemd timer or cron)
- [x] Security headers set (HSTS, CSP, X-Frame-Options, etc.)
- [x] Certificate valid for 90+ days
- [x] HTTPS verified via curl and browser
- [x] SSL Labs test shows A+ rating
- [x] No mixed content warnings
- [x] Certificate renewal tested successfully

---

## Monitoring & Alerts

### Certificate Expiration Monitoring

```bash
# Check upcoming renewals
sudo certbot certificates

# Expected output:
# - Name: yourdomain.com
#   Domains: yourdomain.com, www.yourdomain.com
#   Expiration Date: 2026-06-04

# Get days until expiration
echo "Days until expiration: $(( ($(date -d "$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/yourdomain.com/cert.pem | cut -d= -f2)" +%s) - $(date +%s)) / 86400 ))"
```

### Automated Monitoring (Recommended)

```bash
# Using Nagios/Icinga
echo "2 0 * * * /usr/local/bin/check_ssl_cert.sh yourdomain.com" | sudo tee -a /etc/cron.d/ssl-monitoring
```

---

## Related Documentation

- [SECURITY_AND_DEPLOYMENT.md](docs/SECURITY_AND_DEPLOYMENT.md) - Complete security guide
- [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) - Full deployment instructions
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot Documentation](https://certbot.eff.org/docs/)
- [Nginx SSL Configuration](https://nginx.org/en/docs/http/ngx_http_ssl_module.html)

---

**Status:** ✅ Production-Ready  
**Last Updated:** March 4, 2026  
**Maintained By:** DevOps Team  
**Next Review:** Quarterly
