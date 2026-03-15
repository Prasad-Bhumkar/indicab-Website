# HikariCP Connection Pooling Configuration Guide

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Status:** Production-Ready Review  
**Component:** Database Connection Management

---

## Current Configuration Review

### Current Settings (application.properties)

```properties
# Connection Pool Configuration for VPS
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=1200000
```

### Current Configuration Analysis

| Parameter | Current Value | Status | Recommendation |
|-----------|---------------|--------|-----------------|
| `maximum-pool-size` | 10 | ⚠️ Low | 15-20 for production |
| `minimum-idle` | 5 | ✅ OK | Keep or increase to 7-10 |
| `connection-timeout` | 20s | ✅ OK | Good for typical workloads |
| `idle-timeout` | 5min | ✅ OK | Appropriate for most cases |
| `max-lifetime` | 20min | ✅ OK | Standard for MySQL |

---

## HikariCP Configuration Parameters Explained

### 1. Maximum Pool Size

**Current:** 10 connections  
**Parameter:** `maximumPoolSize`

**Purpose:** Maximum number of connections in the pool

**Calculation Formula:**
```
Maximum Pool Size = ((core_count * 2) + effective_spindle_count) * load_factor
```

**Example for Common Scenarios:**

| Scenario | CPU Cores | Load Factor | Recommended | Reasoning |
|----------|-----------|-------------|-------------|-----------|
| Low traffic (dev/test) | 2 | 1.0 | 5-8 | Minimal connections needed |
| Medium traffic (100-500 req/s) | 4 | 1.2 | 10-15 | Balanced approach |
| High traffic (500-2000 req/s) | 8 | 1.5 | 20-30 | More concurrency |
| Very high (2000+ req/s) | 16 | 2.0 | 40-50 | Maximum scalability |

**Current VPS Assumption:**
- CPU: 4 cores (typical for starter VPS)
- Load factor: 1.2
- **Calculated:** (4 * 2 + 1) * 1.2 = ~12-15 connections

**Recommendation:** Increase from 10 to **15**

---

### 2. Minimum Idle

**Current:** 5 connections  
**Parameter:** `minimumIdle`

**Purpose:** Minimum number of idle connections maintained in pool

**Benefits:**
- Faster response times (connections already warmed up)
- Reduced connection establishment overhead
- Better performance during traffic spikes

**Best Practice:** `minimumIdle = maximum-pool-size / 2`

**Current Calculation:** 5 = 10 / 2 ✅ Correct  
**Recommended Calculation:** 7 = 15 / 2 (with new maximum)

**Recommendation:** Increase to **7-8**

---

### 3. Connection Timeout

**Current:** 20000 ms (20 seconds)  
**Parameter:** `connectionTimeout`

**Purpose:** Maximum time to wait for a connection from pool before throwing exception

**Analysis:**
- 20 seconds is reasonable for typical applications
- Very high timeout can mask performance issues
- Too low timeout can cause spurious failures

**Scenarios:**

| Scenario | Current (20s) | Alternative | Reasoning |
|----------|--------------|-------------|-----------|
| Normal traffic | ✅ Good | 15-30s | Balanced |
| Timeout sensitive app | ⚠️ Consider | 5-10s | Fail fast |
| Database intensive | ✅ OK | 20-30s | Operations take time |

**Recommendation:** Keep at **20 seconds** (current is good)

---

### 4. Idle Timeout

**Current:** 300000 ms (5 minutes)  
**Parameter:** `idleTimeout`

**Purpose:** Maximum time a connection can sit idle in pool before being closed

**Analysis:**
- 5 minutes is appropriate for most applications
- Helps prevent connection stale-outs from firewalls/proxies
- Reduces memory overhead for long-idle connections

**Considerations:**

| Setting | Pros | Cons |
|---------|------|------|
| 5 min | ✅ Standard, safe | May close viable connections |
| 10 min | Keeps more connections | Higher memory usage |
| 2 min | Saves resources | May be too aggressive |

**Recommendation:** Keep at **5 minutes** (current is optimal)

---

### 5. Max Lifetime

**Current:** 1200000 ms (20 minutes)  
**Parameter:** `maxLifetime`

**Purpose:** Maximum lifetime of a connection (from creation to removal)

**Constraints:**
- Must be LONGER than MySQL `max_allowed_packet` + buffer
- Must be SHORTER than MySQL `wait_timeout` (typically 28800s / 8 hours)
- Should match MySQL server's connection timeout

**Current Analysis:**
- 20 minutes = 1200 seconds ✅ Reasonable
- Well below MySQL's default `wait_timeout` (28800s)
- Prevents long-lived connection issues

**Recommendation:** Keep at **20 minutes** (current is good)

---

## Environment-Specific Recommendations

### Development Environment

```properties
# Local development - smaller pool
spring.datasource.hikari.maximum-pool-size=5
spring.datasource.hikari.minimum-idle=2
spring.datasource.hikari.connection-timeout=10000
```

### Staging Environment

```properties
# Staging - moderate traffic
spring.datasource.hikari.maximum-pool-size=12
spring.datasource.hikari.minimum-idle=6
spring.datasource.hikari.connection-timeout=20000
```

### Production Environment

```properties
# Production - optimized for load
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=10
spring.datasource.hikari.connection-timeout=25000
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=1200000

# Additional production settings
spring.datasource.hikari.connection-test-query=SELECT 1
spring.datasource.hikari.leak-detection-threshold=60000
spring.datasource.hikari.auto-commit=true
```

---

## Advanced Configuration Parameters

### Leak Detection

**Detects connections not returned to pool within threshold**

```properties
# Enable leak detection (production only)
spring.datasource.hikari.leak-detection-threshold=60000

# Detects connections held > 60 seconds
# Logs WARNING if detected, can help find connection leaks
```

### Auto Commit

**Controls automatic transaction commit behavior**

```properties
# Default is true - individual statements auto-commit
spring.datasource.hikari.auto-commit=true

# Set to false if using container-managed transactions (JPA)
# Hibernate handles transaction management
```

### Connection Test Query

**Optional validation query**

```properties
# Connection validation
spring.datasource.hikari.connection-test-query=SELECT 1

# Or use JDBC connection validation
spring.datasource.hikari.test-on-borrow=false
spring.datasource.hikari.test-on-return=false
spring.datasource.hikari.test-while-idle=true
```

---

## Load Testing & Capacity Planning

### Estimated Capacity with Current Configuration

```
Current Settings:
- Maximum Pool Size: 10
- Average Request Duration: 100ms
- Database Operations per Request: 1-3

Calculation:
Max Concurrent Requests = (Max Pool Size * Request Duration) / DB Op Count
                        = (10 * 0.1s) / 1.5
                        ≈ 667 requests/second

Recommended for Production:
- Maximum Pool Size: 15
- Max Concurrent Requests = (15 * 0.1s) / 1.5 ≈ 1,000 requests/second
```

### Load Test Scenarios

**Scenario 1: Normal Load (100 req/s)**
```
Required Connections: (100 * 0.1) / 1.5 ≈ 7
Current Pool: 10 ✅ Sufficient
```

**Scenario 2: Peak Load (500 req/s)**
```
Required Connections: (500 * 0.1) / 1.5 ≈ 33
Current Pool: 10 ❌ Insufficient
Recommended: 25 ✅ Sufficient with safety margin
```

**Scenario 3: Spike Load (1,000+ req/s)**
```
Requires: 40+ connections
Consider: Read replicas, caching, or database optimization
```

---

## Monitoring Pool Health

### JMX Metrics to Monitor

```properties
# Enable JMX for pool monitoring
spring.jmx.enabled=true
management.endpoints.web.exposure.include=health,metrics,jolokia
```

### Key Metrics to Track

| Metric | What It Measures | Warning Level | Critical Level |
|--------|-----------------|---------------|----|
| `hikaricp_connections` | Total connections | n/a | n/a |
| `hikaricp_connections_idle` | Idle connections | < 2 | 0 |
| `hikaricp_connections_pending` | Waiting for connection | > 2 | > 5 |
| `hikaricp_connections_active` | Active connections | > 80% of max | > 95% of max |
| `hikaricp_connection_timeouts` | Timeout errors | > 0/hour | > 5/hour |

### Prometheus Queries

```promql
# Pool utilization
hikaricp_connections_active / hikaricp_connections * 100

# Connection waiting rate
rate(hikaricp_connections_pending[5m])

# Timeout rate
rate(hikaricp_connection_timeouts_total[5m])
```

---

## Application.Properties Configuration Template

### Recommended Production Configuration

```properties
# ============================================================================
# HikariCP Connection Pool Configuration - PRODUCTION
# ============================================================================

# POOL SIZE SETTINGS
# Maximum connections: 15 (for 4-core VPS with moderate-high traffic)
spring.datasource.hikari.maximum-pool-size=15

# Minimum idle connections: 8 (50% of max)
spring.datasource.hikari.minimum-idle=8

# CONNECTION TIMEOUTS
# Wait up to 25 seconds for a connection
spring.datasource.hikari.connection-timeout=25000

# Close idle connections after 5 minutes
spring.datasource.hikari.idle-timeout=300000

# Maximum lifetime of a connection: 20 minutes
spring.datasource.hikari.max-lifetime=1200000

# ADVANCED SETTINGS
# Enable leak detection (logs warnings after 60 seconds)
spring.datasource.hikari.leak-detection-threshold=60000

# Connection validation (optional)
spring.datasource.hikari.connection-test-query=SELECT 1

# Transaction auto-commit (Hibernate handles transactions)
spring.datasource.hikari.auto-commit=true

# JDBC URL with optimizations
spring.datasource.url=${DATABASE_URL:jdbc:mysql://localhost:3306/indicab_website?useSSL=false&serverTimezone=UTC&allowMultiQueries=true&cachePrepStmts=true&prepStmtCacheSize=250&prepStmtCacheSqlLimit=2048}

# Datasource connection details
spring.datasource.username=${DATABASE_USERNAME:root}
spring.datasource.password=${DATABASE_PASSWORD:admin}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# ============================================================================
# Database-specific optimizations
# ============================================================================

# Character set
spring.datasource.hikari.connection-init-sql=SET NAMES utf8mb4

# Connection validation interval (check every 30 seconds)
spring.datasource.hikari.validation-interval=30000
```

---

## Monitoring & Alerts

### Health Check Endpoint

```properties
# Enable health endpoint
management.endpoints.web.exposure.include=health,metrics,info
management.endpoint.health.show-details=when-authorized
management.health.db.enabled=true
```

**Example Response:**
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "MySQL 8.0.23",
        "validationQuery": "isValid()"
      }
    }
  }
}
```

### Alert Thresholds

**Configure in monitoring system (Prometheus, etc.):**

```yaml
alert: HikariCPExhausted
expr: 'hikaricp_connections_active / hikaricp_connections > 0.9'
for: 2m
annotations:
  summary: "Connection pool nearly exhausted ({{ .Value | humanizePercentage }})"
  runbook: "Increase maximum-pool-size or optimize database queries"

alert: HikariCPTimeouts
expr: 'rate(hikaricp_connection_timeouts_total[5m]) > 1'
for: 5m
annotations:
  summary: "Connection timeout errors occurring"
  runbook: "Check database performance and connection pool size"
```

---

## Common Issues & Solutions

### Issue 1: Connection Pool Exhaustion

**Symptoms:**
- "Unable to acquire JDBC Connection" exceptions
- Application slows down or becomes unresponsive

**Root Causes:**
1. Pool size too small
2. Long-running queries not releasing connections
3. Connection leak (not returning connections to pool)

**Solutions:**
```properties
# 1. Increase pool size
spring.datasource.hikari.maximum-pool-size=25
spring.datasource.hikari.minimum-idle=12

# 2. Enable leak detection
spring.datasource.hikari.leak-detection-threshold=30000

# 3. Reduce statement timeout
# (Configure in Spring or MySQL)
```

### Issue 2: Stale Connections

**Symptoms:**
- "Communications link failure" errors
- Database connections dropping randomly

**Root Causes:**
1. Network timeout between app and database
2. Database closing idle connections
3. Firewall closing idle connections

**Solutions:**
```properties
# 1. Shorter idle timeout
spring.datasource.hikari.idle-timeout=180000  # 3 minutes

# 2. Add connection test query
spring.datasource.hikari.connection-test-query=SELECT 1

# 3. Configure MySQL
# Set wait_timeout=600 (10 minutes) on MySQL server
```

### Issue 3: Memory Leaks

**Symptoms:**
- Heap memory growing over time
- OutOfMemoryError eventually occurs

**Root Causes:**
1. Connection leaks
2. Unbounded query result sets
3. Memory leaks in third-party libraries

**Solutions:**
```properties
# Enable leak detection
spring.datasource.hikari.leak-detection-threshold=30000

# Monitor with JVM profiler
# Use jmap or YourKit to identify leaks
```

---

## Scaling Recommendations

### Vertical Scaling (Same Server, More Resources)

```
CPU: 4 → 8 cores
Memory: 4GB → 8GB

Adjusted Configuration:
- maximum-pool-size: 15 → 25
- minimum-idle: 8 → 12
```

### Horizontal Scaling (Multiple Servers)

```
Configuration per server:
- maximum-pool-size: 10-15 (smaller pool per instance)
- minimum-idle: 5-8

Load Balancer distributes traffic across instances
Database benefits from connection pooling across servers
```

### Read Replica Strategy

```
For high-read traffic:
1. Configure read-only replica
2. Route read queries to replica pool
3. Keep write operations on primary

Configuration:
- Primary pool: 10 connections (write-intensive)
- Replica pool: 20 connections (read-heavy)
```

---

## Testing Pool Configuration

### Load Test Script

```bash
#!/bin/bash
# Test HikariCP under load

while true; do
  # Generate load
  for i in {1..50}; do
    curl -s http://localhost:8000/api/bookings \
      -H "Authorization: Bearer $TOKEN" &
  done
  
  # Monitor pool
  sleep 5
  curl -s http://localhost:8000/actuator/metrics/hikaricp.connections | jq .
  
  wait
done
```

---

## Configuration Checklist for Production

- [ ] `maximum-pool-size` set appropriately (10-20 for VPS)
- [ ] `minimum-idle` = maximum-pool-size / 2
- [ ] `connection-timeout` set to 20-30 seconds
- [ ] `idle-timeout` set to 5 minutes
- [ ] `max-lifetime` set to 20 minutes
- [ ] Leak detection enabled: `leak-detection-threshold=60000`
- [ ] Health check endpoint configured
- [ ] Monitoring/metrics enabled
- [ ] Alert thresholds configured
- [ ] Load tested with expected traffic volume
- [ ] Connection test query configured (optional)
- [ ] MySQL `wait_timeout` synchronized with pool settings

---

## Related Configuration

See also:
- `DATABASE_OPTIMIZATION_GUIDE.md` - Query optimization
- `BACKUP_STRATEGY.md` - Backup configuration
- `application.properties` - Full Spring configuration

---

**Document Owner:** Database Engineer / DevOps  
**Last Review:** February 2026  
**Next Review:** May 2026
