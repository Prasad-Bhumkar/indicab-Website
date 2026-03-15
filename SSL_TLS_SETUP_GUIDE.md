# SSL/TLS Configuration Guide for IndiCab

## Overview

This guide covers setting up SSL/TLS certificates using Let's Encrypt and configuring nginx for production HTTPS deployment.

## Quick Start

### Step 1: Install Certbot (Let's Encrypt)

**On Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

**On macOS:**
```bash
brew install certbot
```

**Using Docker (recommended):**
```bash
docker run -it --rm -v /etc/letsencrypt:/etc/letsencrypt -v /var/lib/letsencrypt:/var/lib/letsencrypt certbot/certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

### Step 2: Generate SSL Certificate

**Option A: Using Certbot (automatic)**
```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

**Option B: Using DNS validation (for DNS-only domains)**
```bash
sudo certbot certonly --dns-route53 -d yourdomain.com
```

**Option C: Using Docker with existing server**
```bash
docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/lib/letsencrypt:/var/lib/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --non-interactive \
  --agree-tos \
  -m your-email@example.com \
  -d yourdomain.com \
  -d www.yourdomain.com
```

### Step 3: Copy Certificates to Docker Volume

After certificate generation, copy to a location accessible to Docker:

```bash
# Find the certificate location
sudo ls -la /etc/letsencrypt/live/yourdomain.com/

# Copy to Docker volume
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /path/to/docker/volume/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /path/to/docker/volume/key.pem

# Set permissions
sudo chmod 644 /path/to/docker/volume/cert.pem
sudo chmod 600 /path/to/docker/volume/key.pem
```

### Step 4: Update docker-compose.yml

Add certificate volumes to your nginx service:

```yaml
services:
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./indicab-frontend/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./indicab-frontend/dist:/etc/nginx/html:ro
      - /path/to/certificates:/etc/nginx/ssl:ro  # Mount SSL certs
      - /path/to/certbot:/var/www/certbot:ro      # Mount certbot challenges
    depends_on:
      - backend
```

### Step 5: Start Services with HTTPS

```bash
docker-compose up -d
```

### Step 6: Verify HTTPS is Working

```bash
# Test HTTPS connection
curl -v https://yourdomain.com

# Expected response: 200 OK with SSL certificate info

# Test HTTP to HTTPS redirect
curl -I http://yourdomain.com
# Expected: 301 redirect to https://yourdomain.com
```

## SSL Certificate Renewal

### Automatic Renewal (Recommended)

**Using systemd timer (Linux):**
```bash
# Enable automatic renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Check status
sudo systemctl status certbot.timer
```

**Using Docker with cron (any platform):**
```bash
#!/bin/bash
# Run this monthly via cron (0 0 1 * *)

docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/lib/letsencrypt:/var/lib/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  -p 80:80 \
  certbot/certbot renew \
  --webroot \
  -w /var/www/certbot \
  --quiet

# Copy renewed certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /path/to/docker/volume/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /path/to/docker/volume/key.pem

# Reload nginx
docker exec <nginx-container-id> nginx -s reload
```

### Manual Renewal

```bash
sudo certbot renew --force-renewal -d yourdomain.com
```

## Nginx Configuration

Current nginx.conf includes:

1. **HTTP Server (Port 80)**
   - Redirects all traffic to HTTPS
   - Handles Let's Encrypt ACME challenges
   - No sensitive content served over HTTP

2. **HTTPS Server (Port 443)**
   - TLS 1.2 and 1.3 enabled
   - Strong cipher suites configured
   - Security headers (HSTS, CSP, X-Frame-Options, etc.)
   - Gzip compression enabled
   - Static asset caching (365 days)
   - HTML no-cache (always check for updates)
   - API reverse proxy to backend
   - SPA routing fallback

## Security Headers Explained

| Header | Purpose |
|--------|---------|
| `Strict-Transport-Security` | Forces HTTPS for 1 year (includes subdomains) |
| `X-Frame-Options` | Prevents clickjacking attacks |
| `X-Content-Type-Options` | Prevents MIME sniffing |
| `Content-Security-Policy` | Restricts resource loading to trusted sources |
| `X-XSS-Protection` | Browser-level XSS filtering |
| `Referrer-Policy` | Controls referrer information |
| `Permissions-Policy` | Restricts access to browser APIs |

## Testing & Validation

### Check SSL Certificate

```bash
# View certificate details
openssl s_client -connect yourdomain.com:443 -showcerts

# Check expiration date
echo | openssl s_client -connect yourdomain.com:443 -servername yourdomain.com 2>/dev/null | openssl x509 -noout -dates

# Verify certificate chain
openssl verify /etc/letsencrypt/live/yourdomain.com/fullchain.pem
```

### SSL Security Score

Use online tools to verify configuration:
- [SSL Labs](https://www.ssllabs.com/ssltest/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [Security Headers](https://securityheaders.com/)

### Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test HTTPS endpoint
ab -n 100 -c 10 https://yourdomain.com/

# Expected: 100 successful requests with HTTPS
```

## Troubleshooting

### Issue: Certificate Validation Fails

**Solution:**
```bash
# Check certificate validity period
curl -I https://yourdomain.com

# If invalid, revoke and regenerate
sudo certbot revoke --cert-path /etc/letsencrypt/live/yourdomain.com/fullchain.pem
sudo certbot certonly --standalone -d yourdomain.com
```

### Issue: Mixed Content Warning

**Solution:** Ensure all resources use HTTPS:
```nginx
# In nginx.conf, add to HTTPS block:
add_header Content-Security-Policy "upgrade-insecure-requests" always;
```

### Issue: Certificate Not Found

**Solution:**
```bash
# Verify certificate paths
ls -la /etc/letsencrypt/live/yourdomain.com/

# Update nginx.conf with correct paths
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

# Reload nginx
docker exec <container-id> nginx -s reload
```

## Production Checklist

- [ ] Let's Encrypt certificate installed
- [ ] HTTPS endpoint working (port 443)
- [ ] HTTP redirects to HTTPS
- [ ] Auto-renewal configured
- [ ] Security headers set correctly
- [ ] Certificate valid for 90+ days
- [ ] Certificate covers all domains (yourdomain.com, www.yourdomain.com)
- [ ] HSTS preload header configured
- [ ] SSL Labs score: A+ or A
- [ ] No mixed content warnings
- [ ] Certificate renewal logs monitored

## Monitoring

### Certificate Expiration Alerts

**Option 1: Using certbot with email**
```bash
sudo certbot renew --email your-email@example.com --agree-tos --quiet
```

**Option 2: Using monitoring tool**
```bash
# Create a simple monitoring script
#!/bin/bash
CERT_FILE="/etc/letsencrypt/live/yourdomain.com/fullchain.pem"
EXPIRE_DATE=$(openssl x509 -enddate -noout -in $CERT_FILE | cut -d= -f2)
EXPIRE_SECONDS=$(date -d "$EXPIRE_DATE" +%s)
CURRENT_SECONDS=$(date +%s)
DAYS_LEFT=$(( ($EXPIRE_SECONDS - $CURRENT_SECONDS) / 86400 ))

if [ $DAYS_LEFT -lt 30 ]; then
  # Send alert
  echo "Certificate expires in $DAYS_LEFT days" | mail -s "SSL Certificate Alert" admin@example.com
fi
```

## Advanced Configuration

### HTTP/2 Push

```nginx
# In HTTPS server block
location / {
  # Push critical CSS/JS to client
  http2_push /css/main.css;
  http2_push /js/bundle.js;
}
```

### Rate Limiting

```nginx
# Limit requests per IP
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /api/ {
  limit_req zone=api_limit burst=20 nodelay;
  proxy_pass http://backend:8000;
}
```

### Custom Error Pages

```nginx
error_page 404 /404.html;
error_page 500 502 503 504 /50x.html;

location = /50x.html {
  root /etc/nginx/html;
}
```

## Support & Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot Usage](https://certbot.eff.org/instructions)
- [Nginx SSL/TLS Configuration](https://nginx.org/en/docs/http/ngx_http_ssl_module.html)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
