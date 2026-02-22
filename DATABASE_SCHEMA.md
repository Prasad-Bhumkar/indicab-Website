# IndiCab - Database Schema Documentation

**Last Updated:** February 22, 2026  
**Status:** Production Ready ✅

Comprehensive documentation of all database tables, relationships, and data structures.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Business Entities](#core-business-entities)
3. [Authentication & Security](#authentication--security)
4. [Content Management](#content-management)
5. [Audit & Logging](#audit--logging)
6. [Relationships & Foreign Keys](#relationships--foreign-keys)
7. [Indexes & Performance](#indexes--performance)
8. [Data Integrity Constraints](#data-integrity-constraints)
9. [Migration Management](#migration-management)

---

## Overview

### Database Technology
- **DBMS:** MySQL 8.0+
- **Connection Pooling:** HikariCP (10-20 connections)
- **Migration Tool:** Flyway
- **ORM:** Spring Data JPA with Hibernate

### Key Statistics
- **Total Tables:** 13
- **Relationships:** 18 Foreign Keys
- **Indexes:** 25+
- **Stored Procedures:** None (using application logic)
- **Views:** None (using queries)

### Naming Conventions
- **Table Names:** `LOWERCASE_WITH_UNDERSCORES` (e.g., `booking_history`)
- **Column Names:** `lowercase_with_underscores` (e.g., `created_at`)
- **Primary Keys:** `id` (AUTO_INCREMENT, BIGINT)
- **Foreign Keys:** `{entity}_id` (e.g., `user_id`)
- **Boolean Fields:** `is_{property}` (e.g., `is_active`)
- **Timestamps:** `created_at`, `updated_at` (TIMESTAMP, auto-populated)

---

## Core Business Entities

### 1. USERS Table

**Purpose:** Stores all application users (customers, drivers, admins)

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  role ENUM('CUSTOMER', 'DRIVER', 'ADMIN') DEFAULT 'CUSTOMER',
  
  -- Profile info
  profile_image_url VARCHAR(500),
  date_of_birth DATE,
  gender ENUM('MALE', 'FEMALE', 'OTHER'),
  
  -- Account status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  verified_at TIMESTAMP,
  
  -- Metadata
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at)
);
```

**Fields Description:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | BIGINT | Unique user identifier |
| `name` | VARCHAR(255) | Full name of user |
| `email` | VARCHAR(255) | Email address (unique) |
| `phone` | VARCHAR(20) | Phone number (unique) |
| `password_hash` | VARCHAR(255) | BCrypt hashed password |
| `role` | ENUM | User role (CUSTOMER, DRIVER, ADMIN) |
| `is_active` | BOOLEAN | Account active status |
| `is_verified` | BOOLEAN | Email verified status |
| `created_at` | TIMESTAMP | Account creation time |

**Sample Data:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "role": "CUSTOMER",
  "is_active": true,
  "is_verified": true,
  "created_at": "2026-01-15T10:30:00Z"
}
```

---

### 2. DRIVERS Table

**Purpose:** Stores driver-specific information and approval status

```sql
CREATE TABLE drivers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL UNIQUE,
  
  -- License info
  license_number VARCHAR(50) NOT NULL UNIQUE,
  license_expiry_date DATE NOT NULL,
  license_image_url VARCHAR(500),
  
  -- Vehicle assignment
  vehicle_id BIGINT,
  
  -- Status tracking
  status ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED') DEFAULT 'PENDING',
  rejection_reason TEXT,
  
  -- Performance metrics
  rating DECIMAL(3, 2) DEFAULT 0,
  total_trips INT DEFAULT 0,
  completed_trips INT DEFAULT 0,
  
  -- Bank details (for payments)
  bank_account_number VARCHAR(50),
  bank_ifsc_code VARCHAR(20),
  bank_account_holder_name VARCHAR(255),
  
  -- Status flags
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
  
  -- Indexes
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_vehicle_id (vehicle_id),
  INDEX idx_rating (rating),
  INDEX idx_is_active (is_active)
);
```

**Fields Description:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | BIGINT | Driver identifier |
| `user_id` | BIGINT | Reference to users table (FK) |
| `license_number` | VARCHAR(50) | Driver license number (unique) |
| `status` | ENUM | PENDING, APPROVED, REJECTED, SUSPENDED |
| `rating` | DECIMAL(3,2) | Average driver rating (0.00 - 5.00) |
| `total_trips` | INT | Total number of trips |
| `vehicle_id` | BIGINT | Currently assigned vehicle |

---

### 3. BOOKINGS Table

**Purpose:** Stores all ride booking records

```sql
CREATE TABLE bookings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_number VARCHAR(50) NOT NULL UNIQUE,
  
  -- User references
  user_id BIGINT NOT NULL,
  driver_id BIGINT,
  
  -- Trip details
  source_location VARCHAR(255) NOT NULL,
  destination_location VARCHAR(255) NOT NULL,
  route_id BIGINT,
  
  -- Timing
  pickup_time TIMESTAMP NOT NULL,
  estimated_arrival_time TIMESTAMP,
  actual_arrival_time TIMESTAMP,
  
  -- Fare information
  base_fare DECIMAL(10, 2) NOT NULL,
  distance_charge DECIMAL(10, 2),
  wait_charge DECIMAL(10, 2),
  surcharge DECIMAL(10, 2),
  discount DECIMAL(10, 2),
  total_fare DECIMAL(10, 2) NOT NULL,
  
  -- Payment
  payment_method ENUM('CASH', 'CARD', 'WALLET') DEFAULT 'CASH',
  payment_status ENUM('PENDING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
  
  -- Trip status
  status ENUM('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
  cancellation_reason TEXT,
  cancellation_by ENUM('CUSTOMER', 'DRIVER', 'SYSTEM'),
  
  -- Rating & feedback
  passenger_rating INT,
  driver_rating INT,
  passenger_feedback TEXT,
  driver_feedback TEXT,
  
  -- Distance tracking
  estimated_distance DECIMAL(8, 2),
  actual_distance DECIMAL(8, 2),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL,
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL,
  
  -- Indexes
  INDEX idx_user_id (user_id),
  INDEX idx_driver_id (driver_id),
  INDEX idx_status (status),
  INDEX idx_pickup_time (pickup_time),
  INDEX idx_created_at (created_at),
  INDEX idx_payment_status (payment_status),
  INDEX idx_booking_number (booking_number)
);
```

**Fields Description:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | BIGINT | Booking identifier |
| `booking_number` | VARCHAR(50) | Unique booking reference (e.g., BK-20260222-001) |
| `user_id` | BIGINT | Customer reference (FK) |
| `driver_id` | BIGINT | Assigned driver (nullable until assigned) |
| `status` | ENUM | PENDING, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED |
| `total_fare` | DECIMAL(10,2) | Total amount to be paid |
| `payment_status` | ENUM | PENDING, COMPLETED, FAILED |
| `created_at` | TIMESTAMP | When booking was made |

---

### 4. RIDES Table

**Purpose:** Tracks ride execution and real-time location data

```sql
CREATE TABLE rides (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT NOT NULL UNIQUE,
  driver_id BIGINT NOT NULL,
  
  -- Location tracking
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  last_location_update TIMESTAMP,
  
  -- Trip progress
  status ENUM('NOT_STARTED', 'PICKUP_INITIATED', 'DRIVER_ARRIVING', 'PASSENGER_ONBOARD', 'IN_TRANSIT', 'COMPLETED') DEFAULT 'NOT_STARTED',
  
  -- Timing
  driver_start_time TIMESTAMP,
  passenger_pickup_time TIMESTAMP,
  trip_start_time TIMESTAMP,
  trip_end_time TIMESTAMP,
  
  -- Distance tracking
  distance_covered DECIMAL(8, 2),
  estimated_remaining_distance DECIMAL(8, 2),
  
  -- Route information
  route_polyline LONGTEXT,  -- Encoded route points
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE RESTRICT,
  
  -- Indexes
  INDEX idx_booking_id (booking_id),
  INDEX idx_driver_id (driver_id),
  INDEX idx_status (status),
  INDEX idx_last_location_update (last_location_update)
);
```

---

### 5. VEHICLES Table

**Purpose:** Stores vehicle fleet information

```sql
CREATE TABLE vehicles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  vehicle_type ENUM('ECONOMY', 'PREMIUM', 'LUXURY') NOT NULL,
  
  -- Vehicle details
  registration_number VARCHAR(50) NOT NULL UNIQUE,
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  year_of_manufacture INT,
  
  -- Capacity
  seat_capacity INT NOT NULL DEFAULT 4,
  luggage_capacity INT,
  
  -- Pricing
  base_price_multiplier DECIMAL(3, 2) DEFAULT 1.0,
  description TEXT,
  
  -- Image
  image_url VARCHAR(500),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_vehicle_type (vehicle_type),
  INDEX idx_is_active (is_active),
  INDEX idx_registration_number (registration_number)
);
```

**Sample Data:**
```json
[
  {
    "id": 1,
    "name": "Economy - Sedan",
    "vehicle_type": "ECONOMY",
    "seat_capacity": 4,
    "base_price_multiplier": 1.0
  },
  {
    "id": 2,
    "name": "Premium - SUV",
    "vehicle_type": "PREMIUM",
    "seat_capacity": 6,
    "base_price_multiplier": 1.5
  }
]
```

---

### 6. ROUTES Table

**Purpose:** Stores popular pre-defined routes

```sql
CREATE TABLE routes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  source_city VARCHAR(100) NOT NULL,
  destination_city VARCHAR(100) NOT NULL,
  
  -- Distance & timing
  distance_km DECIMAL(8, 2) NOT NULL,
  estimated_duration_minutes INT NOT NULL,
  
  -- Pricing
  base_fare DECIMAL(10, 2) NOT NULL,
  per_km_charge DECIMAL(8, 2) NOT NULL,
  
  -- Popularity
  popularity_score INT DEFAULT 0,
  total_bookings INT DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_source_destination (source_city, destination_city),
  INDEX idx_is_active (is_active),
  INDEX idx_popularity_score (popularity_score)
);
```

---

## Authentication & Security

### 7. REFRESH_TOKENS Table

**Purpose:** Stores JWT refresh tokens for session management

```sql
CREATE TABLE refresh_tokens (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  
  -- Expiration
  expiry_date TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_user_id (user_id),
  INDEX idx_token (token),
  INDEX idx_expiry_date (expiry_date)
);
```

**Purpose:**
- Store refresh tokens for JWT authentication
- Allow users to get new access tokens without re-entering credentials
- Track token revocation for security
- Clean up expired tokens periodically

**Token Lifecycle:**
1. User logs in → Access Token (15 min) + Refresh Token (7 days)
2. Access token expires → Use Refresh Token to get new Access Token
3. Refresh token expires → User must login again
4. User logs out → Refresh Token marked as revoked

---

## Content Management

### 8. BLOGS Table

**Purpose:** Stores blog posts and articles

```sql
CREATE TABLE blogs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL UNIQUE,
  
  -- Content
  content LONGTEXT NOT NULL,
  excerpt VARCHAR(1000),
  
  -- Media
  featured_image_url VARCHAR(500),
  
  -- Author
  author_id BIGINT NOT NULL,
  
  -- Status & publishing
  status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'DRAFT',
  published_at TIMESTAMP,
  
  -- Engagement
  view_count INT DEFAULT 0,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  meta_keywords VARCHAR(500),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT,
  
  -- Indexes
  INDEX idx_status (status),
  INDEX idx_published_at (published_at),
  INDEX idx_author_id (author_id),
  INDEX idx_slug (slug)
);
```

---

### 9. PACKAGES Table

**Purpose:** Stores travel packages and offers

```sql
CREATE TABLE packages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Package type
  package_type ENUM('HOURLY', 'REGIONAL', 'DAILY', 'WEEKEND', 'MONTHLY') NOT NULL,
  
  -- Pricing
  base_fare DECIMAL(10, 2) NOT NULL,
  duration_hours INT,
  included_km INT,
  extra_km_charge DECIMAL(8, 2),
  
  -- Validity
  validity_days INT NOT NULL,
  discount_percentage INT DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_package_type (package_type),
  INDEX idx_is_active (is_active),
  INDEX idx_is_featured (is_featured)
);
```

---

### 10. CITIES Table

**Purpose:** Stores service area cities

```sql
CREATE TABLE cities (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  
  -- Location
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  service_available BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_name (name),
  INDEX idx_is_active (is_active),
  INDEX idx_service_available (service_available)
);
```

---

## Audit & Logging

### 11. AUDIT_LOGS Table

**Purpose:** Tracks all admin actions for compliance and debugging

```sql
CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  
  -- Who
  admin_id BIGINT NOT NULL,
  
  -- What
  entity_type VARCHAR(100) NOT NULL,
  entity_id BIGINT NOT NULL,
  action ENUM('CREATE', 'UPDATE', 'DELETE', 'VIEW') NOT NULL,
  
  -- How
  old_values LONGTEXT,  -- JSON format
  new_values LONGTEXT,  -- JSON format
  
  -- When & Where
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Foreign Keys
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE RESTRICT,
  
  -- Indexes
  INDEX idx_admin_id (admin_id),
  INDEX idx_entity_type (entity_type),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);
```

**Example Audit Log:**
```json
{
  "id": 1,
  "admin_id": 5,
  "entity_type": "USER",
  "entity_id": 10,
  "action": "UPDATE",
  "old_values": {"is_active": true},
  "new_values": {"is_active": false},
  "created_at": "2026-02-22T15:30:00Z"
}
```

---

### 12. BOOKING_HISTORY Table

**Purpose:** Historical tracking of booking status changes

```sql
CREATE TABLE booking_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT NOT NULL,
  
  -- Status change
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  
  -- Reason
  change_reason TEXT,
  changed_by_admin_id BIGINT,
  
  -- When
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by_admin_id) REFERENCES users(id) ON DELETE SET NULL,
  
  -- Indexes
  INDEX idx_booking_id (booking_id),
  INDEX idx_new_status (new_status),
  INDEX idx_created_at (created_at)
);
```

---

### 13. RECOMMENDATIONS Table

**Purpose:** Stores travel recommendations and suggestions

```sql
CREATE TABLE recommendations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  route_id BIGINT NOT NULL,
  
  -- Recommendation details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Image
  image_url VARCHAR(500),
  
  -- Metrics
  click_count INT DEFAULT 0,
  booking_count INT DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE RESTRICT,
  
  -- Indexes
  INDEX idx_user_id (user_id),
  INDEX idx_route_id (route_id),
  INDEX idx_is_active (is_active)
);
```

---

## Relationships & Foreign Keys

### Relationship Diagram

```
users (1) ──────────────── (∞) drivers
   |
   ├─ (1) ─────────────── (∞) bookings
   ├─ (1) ─────────────── (∞) blogs (as author)
   ├─ (1) ─────────────── (∞) refresh_tokens
   ├─ (1) ─────────────── (∞) audit_logs (as admin)
   └─ (1) ─────────────── (∞) recommendations

drivers (1) ──────── (0 or 1) vehicles
   |
   └─ (1) ─────────────── (∞) bookings
   
bookings (1) ──────── (0 or 1) routes
   |
   └─ (1) ──────── (0 or 1) rides

vehicles (1) ──────────────── (∞) routes (implicit)

routes (1) ──────────────── (∞) bookings
   |
   └─ (1) ──────────────── (∞) recommendations
```

### Cascading Rules

| Table | Referenced Table | Delete Action |
|-------|-----------------|---------------|
| DRIVERS | USERS | CASCADE |
| BOOKINGS | USERS | RESTRICT |
| BOOKINGS | DRIVERS | SET NULL |
| RIDES | BOOKINGS | CASCADE |
| AUDIT_LOGS | USERS | RESTRICT |
| REFRESH_TOKENS | USERS | CASCADE |
| BLOGS | USERS | RESTRICT |

---

## Indexes & Performance

### Index Strategy

**Composite Indexes (Multi-column):**
```sql
-- For common queries
ALTER TABLE bookings ADD INDEX idx_user_status (user_id, status);
ALTER TABLE bookings ADD INDEX idx_driver_status (driver_id, status);
ALTER TABLE routes ADD INDEX idx_location (source_city, destination_city);
```

**Performance Considerations:**
- Indexes speed up SELECT, WHERE, ORDER BY queries
- Indexes slow down INSERT, UPDATE, DELETE operations
- Balance between read and write performance

**Index Maintenance:**
```sql
-- Check unused indexes
SELECT * FROM sys.schema_unused_indexes;

-- Rebuild indexes
OPTIMIZE TABLE users;
OPTIMIZE TABLE bookings;

-- Analyze table statistics
ANALYZE TABLE bookings;
```

---

## Data Integrity Constraints

### Uniqueness Constraints

| Table | Column | Uniqueness |
|-------|--------|-----------|
| USERS | EMAIL | UNIQUE |
| USERS | PHONE | UNIQUE |
| DRIVERS | LICENSE_NUMBER | UNIQUE |
| DRIVERS | USER_ID | UNIQUE |
| BOOKINGS | BOOKING_NUMBER | UNIQUE |
| RIDES | BOOKING_ID | UNIQUE |
| VEHICLES | REGISTRATION_NUMBER | UNIQUE |
| ROUTES | SOURCE + DESTINATION | Composite |
| BLOGS | SLUG | UNIQUE |
| REFRESH_TOKENS | TOKEN | UNIQUE |

### Check Constraints

```sql
-- Age must be reasonable
ALTER TABLE users ADD CHECK (YEAR(CURDATE()) - YEAR(date_of_birth) >= 18);

-- Ratings must be 0-5
ALTER TABLE drivers ADD CHECK (rating >= 0 AND rating <= 5);

-- Fares must be positive
ALTER TABLE routes ADD CHECK (base_fare > 0);
```

### Default Values

| Table | Column | Default |
|-------|--------|---------|
| USERS | ROLE | 'CUSTOMER' |
| USERS | IS_ACTIVE | true |
| DRIVERS | STATUS | 'PENDING' |
| BOOKINGS | STATUS | 'PENDING' |
| BOOKINGS | PAYMENT_STATUS | 'PENDING' |
| VEHICLES | IS_ACTIVE | true |
| ROUTES | IS_ACTIVE | true |

---

## Migration Management

### Flyway Migrations

Migrations are automatically executed in order from `indicab-backend/src/main/resources/db/migration/`

```
V1__initial_schema.sql          → Create core tables
V2__add_drivers_table.sql       → Add drivers and vehicles
V3__add_audit_logs.sql          → Add audit logging
V4__add_recommendations.sql     → Add recommendations
V5__add_foreign_keys.sql        → Add constraints
```

### Creating New Migrations

```bash
# 1. Create migration file
touch indicab-backend/src/main/resources/db/migration/V6__new_feature.sql

# 2. Write SQL
cat > V6__new_feature.sql << 'EOF'
CREATE TABLE new_feature_table (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  ...
);
EOF

# 3. Run application (Flyway auto-executes)
./mvnw spring-boot:run

# Verify in logs:
# Flyway: Successfully validated 6 migrations
# Flyway: Successfully applied 1 migration
```

### Viewing Migration Status

```bash
# Connect to database
mysql -u indicab_user -p indicab_website

# Check Flyway metadata
SELECT * FROM flyway_schema_history;

# Shows all executed migrations with status
```

---

## Data Backup & Recovery

### Backup Strategy

```bash
# Full backup
mysqldump -u root -p indicab_website > backup_20260222.sql

# Compressed backup
mysqldump -u root -p indicab_website | gzip > backup_20260222.sql.gz

# Specific table
mysqldump -u root -p indicab_website users > users_backup.sql
```

### Restore from Backup

```bash
# Full restore
mysql -u root -p indicab_website < backup_20260222.sql

# From compressed
gunzip -c backup_20260222.sql.gz | mysql -u root -p indicab_website
```

---

## Performance Optimization

### Query Optimization Tips

```sql
-- ❌ Avoid: Full table scans
SELECT * FROM bookings WHERE DATE(created_at) = '2026-02-22';

-- ✅ Prefer: Indexed columns
SELECT * FROM bookings WHERE created_at >= '2026-02-22' AND created_at < '2026-02-23';

-- ❌ Avoid: Using functions on indexed columns
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';

-- ✅ Prefer: Direct comparison
SELECT * FROM users WHERE email = 'user@example.com';

-- ❌ Avoid: Selecting all columns
SELECT * FROM bookings;

-- ✅ Prefer: Specific columns
SELECT id, status, total_fare FROM bookings;
```

### Caching Strategy

```
Redis Cache Keys:
├─ user:{userId}              → User profile (TTL: 5 min)
├─ driver:{driverId}          → Driver info (TTL: 5 min)
├─ booking:{bookingId}        → Booking details (TTL: 10 min)
├─ routes:popular             → Popular routes (TTL: 1 hour)
├─ vehicles:fleet             → Vehicle fleet (TTL: 1 hour)
├─ cities:active              → Service cities (TTL: 24 hours)
└─ analytics:{key}            → Dashboard stats (TTL: 5 min)
```

---

## Common Queries

### Find Active Users
```sql
SELECT id, name, email, created_at 
FROM users 
WHERE is_active = true 
ORDER BY created_at DESC 
LIMIT 100;
```

### Find Bookings by Status
```sql
SELECT b.id, b.booking_number, u.name, b.total_fare, b.status
FROM bookings b
JOIN users u ON b.user_id = u.id
WHERE b.status = 'COMPLETED'
AND b.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY b.created_at DESC;
```

### Find Top Drivers
```sql
SELECT id, user_id, rating, completed_trips
FROM drivers
WHERE status = 'APPROVED'
ORDER BY rating DESC, completed_trips DESC
LIMIT 10;
```

### Calculate Daily Revenue
```sql
SELECT DATE(created_at) as date, SUM(total_fare) as daily_revenue
FROM bookings
WHERE status = 'COMPLETED'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## Next Steps

1. Review [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) for database setup
2. Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
3. Review migration files in `indicab-backend/src/main/resources/db/migration/`
4. See [agents.md](agents.md) for current development tasks

---

**Last Updated:** February 22, 2026  
**Maintainer:** Development Team
