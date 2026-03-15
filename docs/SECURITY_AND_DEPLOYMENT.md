# IndiCab - Security & Production Deployment Guide

**Last Updated:** February 22, 2026  
**Status:** Production Ready ✅  
**Security Level:** Enterprise-Grade

A comprehensive guide for securing the application and deploying to production.

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Environment Security](#environment-security)
3. [Application Security](#application-security)
4. [Database Security](#database-security)
5. [API Security](#api-security)
6. [Infrastructure Security](#infrastructure-security)
7. [Deployment Checklist](#deployment-checklist)
8. [Monitoring & Alerts](#monitoring--alerts)
9. [Incident Response](#incident-response)
10. [Compliance & Regulations](#compliance--regulations)

---

## Security Overview

### Security Layers

```
Layer 1: HTTPS/TLS
├─ SSL/TLS encryption for all traffic
├─ Certificate: Let's Encrypt (free) or commercial
└─ HSTS enforcement

Layer 2: API Security
├─ JWT token authentication
├─ CORS with origin whitelisting
├─ Rate limiting (Bucket4j)
├─ Input validation & sanitization
└─ SQL injection prevention

Layer 3: Application Security
├─ Spring Security framework
├─ Password hashing (BCrypt)
├─ Role-based access control (RBAC)
├─ Authorization checks (@PreAuthorize)
└─ Audit logging

Layer 4: Database Security
├─ Connection encryption (SSL)
├─ User permissions & roles
├─ Data at rest encryption
├─ Backup encryption
└─ Access logging

Layer 5: Infrastructure Security
├─ Firewall rules (UFW/Security Groups)
├─ SSH hardening
├─ Network isolation
├─ DDoS protection
└─ Intrusion detection
```

### Security Standards

- **Authentication:** OAuth 2.0, JWT tokens
- **Encryption:** AES-256, TLS 1.3
- **Hashing:** BCrypt (passwords), SHA-256 (files)
- **Standards Compliance:** OWASP Top 10, CWE Top 25

---

## Environment Security

### Production Environment Variables

Create `.env.production` file (NEVER commit to git):

```env
# ==================== DATABASE ====================
DATABASE_URL=jdbc:mysql://db.example.com:3306/indicab_prod
DB_USERNAME=indicab_prod_user
DB_PASSWORD=STRONG_PASSWORD_MIN_32_CHARS_WITH_SPECIAL

# ==================== JWT ====================
JWT_SECRET=GENERATE_RANDOM_256_BIT_KEY_MIN_64_CHARS
JWT_EXPIRATION=900
JWT_REFRESH_EXPIRATION=604800

# ==================== SPRING ====================
SPRING_PROFILE=production
SPRING_ENVIRONMENT=prod

# ==================== CORS ====================
CORS_ALLOWED_ORIGINS=https://example.com,https://www.example.com

# ==================== REDIS ====================
REDIS_HOST=redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=STRONG_PASSWORD

# ==================== SMTP (Email) ====================
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=noreply@example.com
MAIL_PASSWORD=APP_PASSWORD_FROM_GMAIL
MAIL_FROM=noreply@example.com

# ==================== SENTRY ====================
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1

# ==================== FRONTEND ====================
FRONTEND_URL=https://example.com
FRONTEND_PORT=443

# ==================== FILE STORAGE ====================
FILE_STORAGE_TYPE=s3
AWS_S3_BUCKET=indicab-prod
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=XXXX
AWS_SECRET_ACCESS_KEY=XXXX

# ==================== PAYMENT (if enabled) ====================
STRIPE_API_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# ==================== GOOGLE MAPS ====================
GOOGLE_MAPS_API_KEY=XXXXX

# ==================== SECURITY ====================
SECURITY_REQUIRE_HTTPS=true
SECURITY_SECURE_COOKIES=true
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=100
```

### Environment Variable Security

```bash
# ✅ DO: Use secrets management
# AWS Secrets Manager
aws secretsmanager create-secret --name indicab/prod/jwt-secret

# Hashicorp Vault
vault kv put secret/indicab JWT_SECRET=xxxxx

# ❌ DON'T: Store secrets in git
# Never commit .env.production
# Never commit config files with secrets

# .gitignore
.env
.env.production
.env.*.local
*.key
*.pem
```

---

## Application Security

### Password Security

**Backend (Spring Security):**

```java
// Password encoder configuration (Spring Security)
@Configuration
public class SecurityConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt with strength 12 (slower, more secure)
        return new BCryptPasswordEncoder(12);
    }
}
```

**Password Requirements:**
```
Minimum 12 characters (16+ recommended)
├─ At least 1 uppercase letter (A-Z)
├─ At least 1 lowercase letter (a-z)
├─ At least 1 number (0-9)
└─ At least 1 special character (!@#$%^&*)

Example: MySecure@Pass123
```

**Frontend Validation (Vup):**

```javascript
// src/features/auth/validationSchemas.js
const passwordSchema = yup
  .string()
  .min(12, "Password must be at least 12 characters")
  .matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/,
    "Password must contain uppercase, lowercase, number, and special character"
  )
  .required("Password is required");
```

### JWT Security

**Token Configuration:**

```properties
# application-prod.properties
jwt.secret=${JWT_SECRET}  # Min 64 characters
jwt.expiration=900        # 15 minutes (short-lived)
jwt.refresh-expiration=604800  # 7 days
jwt.issuer=indicab
jwt.audience=mobile-app,web-app
```

**Token Best Practices:**
```
✅ Short expiration (15 minutes)
✅ Use refresh tokens for renewal
✅ Store in httpOnly cookies (not localStorage if possible)
✅ Sign tokens with secret key
✅ Validate signature on every request
✅ Include user ID and role in token
❌ Don't store sensitive data in token (it's readable)
```

### CORS Configuration

**Backend:**

```java
@Configuration
public class CorsConfig {
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins(
                        "https://example.com",
                        "https://www.example.com"
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                    .allowedHeaders("Content-Type", "Authorization")
                    .allowCredentials(true)
                    .maxAge(3600);
            }
        };
    }
}
```

### Input Validation & Sanitization

**Backend (Hibernate Validation):**

```java
@Entity
public class User {
    
    @NotEmpty(message = "Name is required")
    @Size(min = 2, max = 255)
    private String name;
    
    @Email(message = "Invalid email format")
    @NotEmpty(message = "Email is required")
    private String email;
    
    @Pattern(
        regexp = "^[6-9]\\d{9}$",
        message = "Invalid Indian phone number"
    )
    private String phone;
}
```

**Frontend (Yup Validation):**

```javascript
const schema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email")
    .required("Email is required"),
  
  phone: yup
    .string()
    .matches(/^[6-9]\d{9}$/, "Invalid phone number")
    .required("Phone is required"),
});
```

### SQL Injection Prevention

```sql
❌ VULNERABLE:
String query = "SELECT * FROM users WHERE email = '" + email + "'";

✅ SAFE (Using JPA):
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(@Param("email") String email);
}

✅ SAFE (Using parameterized queries):
@Query("SELECT u FROM User u WHERE u.email = :email")
User findByEmail(@Param("email") String email);
```

### XSS Prevention

**Frontend (React):**

```javascript
❌ VULNERABLE:
<div dangerHtml={userInput} />

✅ SAFE:
<div>{userInput}</div>  // React escapes by default

✅ SAFE (if HTML needed):
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(htmlContent) 
}} />
```

---

## Database Security

### MySQL Security

**1. User Permissions:**

```sql
-- Create production user with limited privileges
CREATE USER 'indicab_prod'@'%' IDENTIFIED BY 'STRONG_PASSWORD';

-- Grant only necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE 
ON indicab_production.* 
TO 'indicab_prod'@'%';

-- Revoke dangerous permissions
REVOKE ALL PRIVILEGES ON *.* FROM 'indicab_prod'@'%';
REVOKE GRANT OPTION ON *.* FROM 'indicab_prod'@'%';

-- Remove default accounts
DROP USER IF EXISTS 'root'@'%';
DROP USER IF EXISTS 'root'@'127.0.0.1';
DROP USER IF EXISTS ''@'localhost';
DROP USER IF EXISTS ''@'%';
```

**2. Connection Security:**

```properties
# application-prod.properties
spring.datasource.url=jdbc:mysql://db.example.com:3306/indicab_prod?useSSL=true&serverTimezone=UTC&requireSSL=true
spring.datasource.username=indicab_prod
spring.datasource.password=${DB_PASSWORD}

# Connection pooling
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
```

**3. Backup Security:**

```bash
# Encrypted backup
mysqldump \
  --single-transaction \
  --routines \
  --triggers \
  -u indicab_prod -p indicab_production | \
  gzip | \
  openssl enc -aes-256-cbc -salt > backup_$(date +%Y%m%d).sql.gz.enc

# Restore from encrypted backup
openssl enc -d -aes-256-cbc -in backup_20260222.sql.gz.enc | \
  gunzip | \
  mysql -u root -p indicab_production
```

---

## API Security

### Rate Limiting

**Backend (Bucket4j):**

```java
@Component
public class RateLimitingInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, 
                             HttpServletResponse response, 
                             Object handler) throws Exception {
        String key = getClientKey(request);
        Bucket bucket = bucketCache.resolveBucket(key);
        
        if (bucket.tryConsume(1)) {
            return true;  // Request allowed
        } else {
            response.setStatus(429);  // Too Many Requests
            response.getWriter().write("Rate limit exceeded");
            return false;
        }
    }
}
```

**Configuration:**

```properties
# Rate limiting
rate.limit.enabled=true
rate.limit.requests-per-minute=100
rate.limit.requests-per-second=10
rate.limit.burst-capacity=150

# Per endpoint
auth.rate-limit=10/minute      # Login attempts
api.rate-limit=100/minute      # General API
```

### Security Headers

**Nginx Configuration:**

```nginx
# /etc/nginx/nginx.conf or /etc/nginx/sites-enabled/default

# HTTPS/HSTS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# CSP (Content Security Policy)
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'" always;

# X-Frame-Options (clickjacking prevention)
add_header X-Frame-Options "SAMEORIGIN" always;

# X-Content-Type-Options
add_header X-Content-Type-Options "nosniff" always;

# X-XSS-Protection
add_header X-XSS-Protection "1; mode=block" always;

# Referrer-Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Permissions-Policy (formerly Feature-Policy)
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

---

## Infrastructure Security

### Firewall Configuration

**UFW (Ubuntu):**

```bash
# Enable firewall
sudo ufw enable

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (change to custom port in production)
sudo ufw allow ssh
sudo ufw allow 22

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow MySQL (only from application server)
sudo ufw allow from 192.168.1.100 to any port 3306

# Allow Redis (only from application server)
sudo ufw allow from 192.168.1.100 to any port 6379

# Check status
sudo ufw status
```

### SSH Hardening

```bash
# Edit SSH configuration
sudo nano /etc/ssh/sshd_config

# Disable password authentication (use keys only)
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes

# Change default port
Port 2222

# Limit login attempts
MaxAuthTries 3
MaxSessions 5

# Restart SSH service
sudo systemctl restart ssh
```

### SSL/TLS Certificate

**Using Let's Encrypt (Free):**

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d example.com -d www.example.com

# Auto-renewal
sudo certbot renew --dry-run

# Nginx SSL configuration
server {
    listen 443 ssl http2;
    server_name example.com www.example.com;
    
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Deployment Checklist

### Pre-Deployment (1 Week Before)

- [ ] Security audit completed
- [ ] Penetration testing (if applicable)
- [ ] Database backup verified
- [ ] SSL certificate obtained
- [ ] Environment variables configured
- [ ] Secrets secured in vault
- [ ] Load testing completed
- [ ] Disaster recovery plan documented
- [ ] On-call escalation team assigned
- [ ] Rollback procedure tested

### Infrastructure Preparation

- [ ] VPS/Cloud instance provisioned
- [ ] OS security updates applied
- [ ] Firewall rules configured
- [ ] SSH keys generated (no password auth)
- [ ] Docker/Docker Compose installed
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed
- [ ] DNS records updated
- [ ] Monitoring tools installed
- [ ] Logging aggregation configured

### Application Deployment

```bash
# 1. Clone repository
git clone https://github.com/yourusername/indicab-Website.git /opt/indicab
cd /opt/indicab

# 2. Configure environment
cp .env.production.example .env
nano .env  # Edit with production secrets

# 3. Build application
docker-compose -f docker-compose.prod.yml build

# 4. Run migrations
docker-compose -f docker-compose.prod.yml run backend ./mvnw flyway:migrate

# 5. Start services
docker-compose -f docker-compose.prod.yml up -d

# 6. Verify deployment
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs

# 7. Run health checks
curl http://localhost:8000/actuator/health
curl http://localhost:8000/api/v1/swagger-ui.html
```

### Post-Deployment

- [ ] Health checks passed
- [ ] API endpoints responding
- [ ] Database accessible
- [ ] Real-time features working (WebSocket)
- [ ] Email notifications sending
- [ ] File uploads working
- [ ] Logging capturing events
- [ ] Monitoring dashboards active
- [ ] Alerts configured
- [ ] Backup jobs scheduled
- [ ] Performance within SLAs

---

## Monitoring & Alerts

### Key Metrics to Monitor

```
Application:
├─ Response time (p50, p95, p99)
├─ Error rate (4xx, 5xx)
├─ Request throughput
├─ Active connections
├─ Database query time
└─ Cache hit/miss ratio

Infrastructure:
├─ CPU usage (alert > 80%)
├─ Memory usage (alert > 85%)
├─ Disk usage (alert > 90%)
├─ Network bandwidth
├─ Uptime
└─ SSL certificate expiry

Security:
├─ Failed login attempts
├─ Rate limit violations
├─ Unauthorized access attempts
├─ SQL injection attempts
└─ Malicious IPs
```

### Prometheus Setup

```yaml
# /opt/indicab/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/actuator/prometheus'
```

### Grafana Dashboards

```
Pre-built dashboards:
├─ Application Performance (APM)
├─ Database Metrics
├─ Infrastructure (CPU, Memory, Disk)
├─ API Endpoints
├─ Error Tracking
└─ Security Events
```

---

## Incident Response

### Security Incident Severity Levels

| Level | Impact | Response Time |
|-------|--------|---------------|
| CRITICAL | Complete service down, data breach | Immediate (< 15 min) |
| HIGH | Partial outage, security vulnerability | < 1 hour |
| MEDIUM | Degraded performance, potential issues | < 4 hours |
| LOW | Minor issues, no immediate impact | < 24 hours |

### Incident Response Steps

```
1. DETECT & ALERT
   ├─ Monitoring system detects anomaly
   ├─ Alert sent to on-call engineer
   └─ Page in escalation team if CRITICAL

2. ASSESS
   ├─ Check logs for root cause
   ├─ Verify impact scope
   ├─ Check if rollback needed
   └─ Document timeline

3. RESPOND
   ├─ If security breach: Enable DLP, block IPs
   ├─ If performance: Check DB, cache, API
   ├─ If outage: Rollback or failover
   └─ Start war room / Slack channel

4. COMMUNICATE
   ├─ Notify stakeholders
   ├─ Provide status updates
   ├─ Post on status page
   └─ Update eta to resolution

5. RESOLVE
   ├─ Implement fix / rollback
   ├─ Verify services recovered
   ├─ Run health checks
   └─ Monitor for regression

6. POST-INCIDENT
   ├─ Write detailed incident report
   ├─ Root cause analysis
   ├─ Action items & fixes
   ├─ Share learnings with team
   └─ Update runbooks
```

### Common Incident Scenarios

**Database Down:**
```
1. Check MySQL service: systemctl status mysql
2. Check connectivity: mysql -h db.host -u user -p
3. Check logs: tail -100 /var/log/mysql/error.log
4. If corrupted: Restore from backup
5. If failed: Failover to replica
```

**API Overloaded:**
```
1. Check request rate: curl http://localhost:8000/metrics
2. Check database queries: SHOW FULL PROCESSLIST;
3. Enable rate limiting if not active
4. Optimize slow queries
5. Scale horizontally if needed
```

**Security Breach Suspected:**
```
1. Revoke all active JWT tokens
2. Force password reset for all users
3. Enable enhanced logging
4. Block suspicious IPs
5. Review access logs
6. Update secrets
```

---

## Compliance & Regulations

### Data Protection (GDPR/CCPA)

```
Compliance Requirements:
├─ Data encryption (AES-256)
├─ Access control & authentication
├─ Audit logging (6-12 months)
├─ Right to be forgotten (data deletion)
├─ Data portability
├─ Privacy policy
└─ Consent management

Implementation:
├─ Encrypt sensitive data at rest
├─ Encrypt data in transit (TLS)
├─ Implement access control
├─ Keep audit logs
├─ Provide data export API
├─ Provide data deletion API
└─ Document data processing
```

### PCI-DSS (If Payment Enabled)

```
Payment Security:
├─ Don't store card numbers
├─ Use PCI-compliant payment processor (Stripe)
├─ Encrypt card data in transit
├─ Network security (firewall, IDS)
├─ Regular security testing
├─ Access control & monitoring
├─ Vulnerability assessment
└─ Incident response plan

Implementation:
├─ All payment via third-party processor
├─ Never handle card data directly
├─ Enable 3D Secure
├─ Monitor for fraud
├─ Annual PCI audit (if Level 1)
```

### Security Certifications

**Recommended:**
```
├─ SOC 2 Type II (Security, Availability, Integrity)
├─ ISO 27001 (Information Security Management)
├─ HIPAA (if handling health data)
├─ NIST Cybersecurity Framework
└─ Annual penetration testing
```

---

## Security Checklist (Production)

### Infrastructure Security
- [ ] SSH key-based authentication only
- [ ] Firewall enabled with minimal rules
- [ ] DDoS protection enabled
- [ ] Intrusion detection system active
- [ ] VPN for admin access
- [ ] Regular OS security updates

### Application Security
- [ ] HTTPS/TLS 1.3 enabled
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Input validation everywhere
- [ ] SQL injection prevention in place
- [ ] XSS protection enabled
- [ ] CSRF tokens if needed

### Database Security
- [ ] Non-default user for app
- [ ] No root/admin credentials in code
- [ ] SSL connections enforced
- [ ] Regular backups encrypted
- [ ] Backup retention policy defined
- [ ] Data encryption at rest (if sensitive)

### API Security
- [ ] JWT tokens with short expiry
- [ ] Refresh token mechanism
- [ ] API key rotation policy
- [ ] OAuth 2.0 for third-party access
- [ ] API versioning for compatibility
- [ ] Endpoint deprecation policy

### Monitoring & Logging
- [ ] Centralized logging enabled
- [ ] Security event monitoring active
- [ ] Alerts configured for anomalies
- [ ] Incident response plan documented
- [ ] Backup testing schedule
- [ ] Disaster recovery tested

---

## Related Documentation

- [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) - Development environment
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Detailed deployment steps
- [VPS_DEPLOYMENT_GUIDE.md](VPS_DEPLOYMENT_GUIDE.md) - VPS-specific setup
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Database structure
- [API_REFERENCE.md](API_REFERENCE.md) - API documentation

---

**Last Updated:** February 22, 2026  
**Security Review:** Quarterly  
**Status:** Production Ready
