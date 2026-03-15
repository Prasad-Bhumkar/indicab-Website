# IndiCab - System Architecture & Design Documentation

**Last Updated:** February 15, 2026  
**Status:** Production Ready ✅

---

## 📐 System Overview

IndiCab is a modern, scalable ride-booking application built with a microservices-ready architecture running on a single VPS. The system is designed for high availability, fault tolerance, and easy horizontal scaling.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet Users                           │
│                              ↓                                   │
│                         HTTPS (Port 443)                        │
│                              ↓                                   │
├─────────────────────────────────────────────────────────────────┤
│                    Nginx Reverse Proxy                           │
│  • SSL/TLS Termination                                          │
│  • Load Balancing                                               │
│  • Static Asset Serving                                         │
│  • Rate Limiting                                                │
│  • Security Headers                                             │
│  • WebSocket Forwarding                                         │
│              ↙              ↓              ↘                     │
├──────────────┬──────────────┬──────────────┬──────────────────────┤
│              │              │              │                      │
│   Frontend   │   Backend    │   MySQL      │   Redis             │
│   (React)    │   (Java)     │   (DB)       │   (Cache)           │
│   Port 5173  │   Port 8000  │   Port 3306  │   Port 6379        │
│              │              │              │                      │
├──────────────┴──────────────┴──────────────┴──────────────────────┤
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Layered Architecture

### Frontend Architecture

```
┌─────────────────────────────────────┐
│          Presentation Layer         │
│  • React Components                 │
│  • Pages & Routes                   │
│  • User Interface                   │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│       State Management Layer         │
│  • Redux Slices                     │
│  • Async Thunks                     │
│  • Selectors                        │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│        Service Layer                │
│  • API Client (Axios)               │
│  • WebSocket Service                │
│  • Logger Service                   │
│  • Cache Manager                    │
│  • Error Handler                    │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      HTTP & WebSocket Layer         │
│  • REST API (http://localhost:8000) │
│  • WebSocket (ws://localhost:8000)  │
└─────────────────────────────────────┘
```

### Backend Architecture

```
┌─────────────────────────────────────┐
│      REST API Controller Layer       │
│  • UserController                   │
│  • BookingController                │
│  • AdminController                  │
│  • RideTrackingWebSocketController  │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      Service Layer                  │
│  • UserService                      │
│  • BookingService                   │
│  • RideTrackingService              │
│  • CacheService                     │
│  • EmailService (future)            │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      Repository Layer (DAO)         │
│  • UserRepository                   │
│  • BookingRepository                │
│  • DriverRepository                 │
│  • BlogRepository                   │
│  • VehicleRepository                │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      Entity & Mapper Layer          │
│  • JPA Entities                     │
│  • DTOs                             │
│  • Mappers                          │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      Data Access Layer              │
│  • MySQL Database                   │
│  • Redis Cache                      │
│  • Flyway Migrations                │
└─────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### Booking Flow

```
User (Frontend)
    ↓
[Booking Form] (React Component)
    ↓
[Fare Calculation] (Redux selector)
    ├→ GET /api/v1/routes (Popular routes)
    ├→ GET /api/v1/admin/vehicles (Vehicle fleet)
    └→ Calculate: baseFare + (distance × ratePerKm)
    ↓
[User Confirmation]
    ↓
POST /api/v1/bookings (Create booking)
    ↓
[Backend] BookingController → BookingService
    ├→ Validate user & input
    ├→ Calculate fare
    ├→ Create booking record
    ├→ Save to MySQL
    ├→ Cache booking (Redis)
    └→ Return booking confirmation
    ↓
[Frontend] Display confirmation
    ├→ Save to Redux store
    ├→ Update booking history
    └→ Show success message
```

### Real-time Ride Tracking Flow

```
[Driver Updates Location]
    ↓
POST /api/v1/ride/track/{rideId}
    ↓
[Backend WebSocket] RideTrackingWebSocketController
    ├→ Receive driver location update
    ├→ Update ride progress
    ├→ Broadcast via STOMP
    └→ Send to /topic/ride/{rideId}
    ↓
[Frontend WebSocket Client]
    ├→ Subscribe to /topic/ride/{rideId}
    ├→ Receive real-time updates
    ├→ Update Redux state
    └→ Animate location on map
    ↓
[User Interface]
    ├→ Live driver location
    ├→ ETA countdown
    ├→ Progress bar
    └→ Driver info card
```

### Admin Content Management Flow

```
[Admin User]
    ↓
[Admin Dashboard/Page] (React)
    ├→ BlogManagement.jsx
    ├→ PackageManagement.jsx
    └→ VehicleManagement.jsx
    ↓
[Redux Thunks] (adminSlice.js)
    ├→ fetchBlogs() → GET /api/v1/admin/blogs
    ├→ createBlog(data) → POST /api/v1/admin/blogs
    ├→ updateBlog(id, data) → PUT /api/v1/admin/blogs/{id}
    └→ deleteBlog(id) → DELETE /api/v1/admin/blogs/{id}
    ↓
[Backend API] AdminBlogController
    ├→ Receive request
    ├→ Validate authentication (JWT)
    ├→ Validate authorization (Admin role)
    ├→ Process request
    ├→ Update MySQL database
    ├→ Invalidate Redis cache
    └→ Return response
    ↓
[Frontend] Update UI
    ├→ Update Redux store
    ├→ Trigger re-render
    └→ Show success/error message
```

---

## 🔐 Authentication & Security Architecture

```
┌─────────────────────────────────────────────────┐
│           Authentication Flow                   │
├─────────────────────────────────────────────────┤
│                                                 │
│ 1. User Login                                  │
│    POST /api/v1/auth/login                     │
│    ├→ Email & Password                         │
│    └→ Return: JWT Token                        │
│                                                 │
│ 2. Token Storage (Frontend)                    │
│    ├→ localStorage.setItem('token', jwt)       │
│    └→ Used for all subsequent requests         │
│                                                 │
│ 3. Request Authorization                       │
│    ├→ Every request includes:                  │
│    │  Authorization: Bearer {token}            │
│    └→ Backend validates JWT signature          │
│                                                 │
│ 4. Security Context (Backend)                  │
│    ├→ Spring Security extracts user from JWT   │
│    ├→ Sets SecurityContextHolder                │
│    └→ Available in Controller methods via      │
│        SecurityContextHolder.getContext()      │
│                                                 │
│ 5. Authorization Check                        │
│    ├→ @PreAuthorize("hasRole('ADMIN')")       │
│    ├→ Method-level security                   │
│    └→ Role-based access control (RBAC)        │
│                                                 │
│ 6. Logout                                      │
│    ├→ Clear token from localStorage            │
│    ├→ Clear Redis session (if used)            │
│    └→ Redirect to login page                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Security Layers

```
Layer 1: HTTPS/TLS
├→ All traffic encrypted in transit
├→ SSL certificate from Let's Encrypt
└→ Nginx termination on reverse proxy

Layer 2: CORS
├→ Whitelist allowed origins
├→ Restrict cross-origin requests
└→ Prevent CSRF attacks

Layer 3: Rate Limiting
├→ API: 100 requests/second
├→ Auth: 10 requests/minute
└→ Prevent brute force & DDoS

Layer 4: Authentication
├→ JWT tokens (stateless)
├→ Token expiration (24 hours default)
├→ Refresh token mechanism

Layer 5: Authorization
├→ Role-based access control (RBAC)
├→ User roles: CUSTOMER, DRIVER, ADMIN
├→ Method-level annotations
└→ Resource-level access checks

Layer 6: Input Validation
├→ DTO validation with @Valid
├→ XSS prevention in frontend
├→ SQL injection prevention (Hibernate)
└→ File upload restrictions

Layer 7: Logging & Monitoring
├→ Structured logging
├→ Sentry error tracking
├→ Audit trails for admin actions
└→ Suspicious activity alerts
```

---

## 💾 Data Layer Architecture

### Database Schema Design

```
┌─────────────────────────────────────────┐
│        Core Business Tables              │
├─────────────────────────────────────────┤
│                                         │
│ USERS                                   │
│ ├─ id (PK)                              │
│ ├─ name, email, phone                   │
│ ├─ password (hashed)                    │
│ ├─ address, role                        │
│ └─ created_at, updated_at               │
│                                         │
│ DRIVERS                                 │
│ ├─ id (PK)                              │
│ ├─ user_id (FK to USERS)                │
│ ├─ license_number, vehicle_id           │
│ ├─ status (pending/approved/rejected)   │
│ ├─ rating, trips_completed              │
│ └─ created_at, updated_at               │
│                                         │
│ BOOKINGS                                │
│ ├─ id (PK)                              │
│ ├─ user_id (FK), driver_id (FK)         │
│ ├─ from, to, date, time                 │
│ ├─ status, amount                       │
│ └─ created_at, updated_at               │
│                                         │
│ VEHICLES                                │
│ ├─ id (PK)                              │
│ ├─ name, type (economy/premium/luxury)  │
│ ├─ seat_capacity, price_multiplier      │
│ ├─ is_active                            │
│ └─ created_at, updated_at               │
│                                         │
├─────────────────────────────────────────┤
│      Content Management Tables           │
├─────────────────────────────────────────┤
│                                         │
│ BLOGS                                   │
│ ├─ id (PK)                              │
│ ├─ title, content, author               │
│ ├─ image_url, status (draft/published)  │
│ ├─ published_at                         │
│ └─ created_at, updated_at               │
│                                         │
│ PACKAGES                                │
│ ├─ id (PK)                              │
│ ├─ name, description                    │
│ ├─ package_type (hourly/regional...)    │
│ ├─ base_fare, duration, validity        │
│ ├─ discount_percentage, is_active       │
│ └─ created_at, updated_at               │
│                                         │
│ ROUTES                                  │
│ ├─ id (PK)                              │
│ ├─ source, destination                  │
│ ├─ distance, estimated_time             │
│ ├─ popularity                           │
│ └─ created_at, updated_at               │
│                                         │
└─────────────────────────────────────────┘
```

### Indexing Strategy

```
USERS
├─ PK: id
├─ UNIQUE: email
└─ INDEX: created_at (for pagination)

BOOKINGS
├─ PK: id
├─ FK: user_id (for user's bookings)
├─ FK: driver_id (for driver's assignments)
├─ INDEX: status (for filtering)
└─ INDEX: created_at (for sorting)

BLOGS
├─ PK: id
├─ INDEX: status (published/draft)
├─ INDEX: published_at (for latest blogs)
└─ INDEX: created_at

VEHICLES
├─ PK: id
├─ INDEX: type (for filtering)
└─ INDEX: is_active (for active vehicles)
```

### Caching Strategy (Redis)

```
Cache Keys Format: {entity}:{id}:{version}

Active Caches:
├─ user:{userId} → User profile (TTL: 5 min)
├─ driver:{driverId} → Driver info (TTL: 5 min)
├─ booking:{bookingId} → Booking details (TTL: 10 min)
├─ routes:all → Popular routes (TTL: 1 hour)
├─ packages:all → Travel packages (TTL: 1 hour)
├─ vehicles:all → Vehicle fleet (TTL: 1 hour)
├─ admin:stats → Dashboard stats (TTL: 5 min)
└─ ride:tracking:{rideId} → Live tracking (TTL: 1 hour or until ride ends)

Cache Invalidation:
├─ User updated → Clear user:*
├─ Booking created → Clear routes:all (might affect fare)
├─ Vehicle updated → Clear vehicles:all
└─ Admin stats → Clear every 5 minutes
```

---

## 🌐 API Architecture

### RESTful Principles

```
Resource: Booking

GET    /api/v1/bookings          → List all bookings (paginated)
POST   /api/v1/bookings          │ Create new booking
GET    /api/v1/bookings/{id}     → Get booking details
PUT    /api/v1/bookings/{id}     → Update booking
DELETE /api/v1/bookings/{id}     → Delete booking (soft delete)

Status Codes:
├─ 200 OK → Successful GET, PUT
├─ 201 Created → Successful POST
├─ 204 No Content → Successful DELETE
├─ 400 Bad Request → Invalid input
├─ 401 Unauthorized → Missing/invalid token
├─ 403 Forbidden → Insufficient permissions
├─ 404 Not Found → Resource not found
├─ 409 Conflict → Resource state conflict
└─ 500 Internal Server Error → Server error
```

### Response Format

```json
{
  "success": true,
  "data": {
    "id": 1,
    "from": "Mumbai",
    "to": "Pune",
    "status": "completed",
    "amount": 500,
    "createdAt": "2026-02-15T10:30:00Z"
  },
  "timestamp": "2026-02-15T10:35:00Z"
}
```

### Error Response Format

```json
{
  "success": false,
  "error": "Booking not found",
  "status": 404,
  "timestamp": "2026-02-15T10:35:00Z",
  "path": "/api/v1/bookings/999"
}
```

---

## 📡 WebSocket Architecture

### STOMP Protocol Flow

```
1. Client connects to /ws/ride (SockJS)
   └→ Server accepts connection

2. Client subscribes to /topic/ride/{rideId}
   └→ Server confirms subscription

3. Driver publishes to /app/ride/track/{rideId}
   └→ Server receives message

4. Server processes and broadcasts
   └→ Send to /topic/ride/{rideId}

5. All subscribed clients receive update
   └→ Frontend updates React state
   └→ UI re-renders with new location

6. Disconnection handling
   ├→ Automatic reconnection with exponential backoff
   ├→ Fallback to HTTP polling if WebSocket fails
   └→ Graceful cleanup on component unmount
```

### Connection Management

```
┌─────────────────────────────────────┐
│   WebSocket Reconnection Strategy    │
├─────────────────────────────────────┤
│                                     │
│ Initial: 2 seconds                  │
│ Attempt 2: 4 seconds                │
│ Attempt 3: 8 seconds                │
│ Attempt 4: 16 seconds               │
│ Attempt 5: 30 seconds (capped)      │
│                                     │
│ Max Attempts: 5                     │
│ After failure: Fallback to polling  │
│                                     │
│ Polling Interval: 3 seconds         │
│                                     │
└─────────────────────────────────────┘
```

---

## 🚀 Performance & Scalability

### Optimization Techniques

```
Frontend
├─ Code Splitting (Vite lazy routes)
├─ Component Lazy Loading
├─ Redux selector memoization
├─ Image optimization (WebP)
├─ Gzip compression (Nginx)
├─ Browser caching (Cache headers)
└─ Service Worker (PWA support)

Backend
├─ Database connection pooling (HikariCP)
├─ Query optimization (indexes)
├─ N+1 query prevention (Eager loading)
├─ Redis caching (3 layer: user, request, session)
├─ Async request processing
├─ Database query limits (max 100 results)
└─ Request/response compression

Network
├─ HTTPS compression (Gzip)
├─ Asset caching (1 year for versioned assets)
├─ CDN-ready (can add Cloudflare)
├─ WebSocket persistence (reduce HTTP overhead)
└─ JWT tokens (stateless, no session storage)
```

### Scaling Strategies

```
Current: Single VPS
├─ 5 containers (Frontend, Backend, MySQL, Redis, Nginx)
├─ Suitable for: < 10,000 users
└─ RAM requirement: ~8GB

Scale to Multiple VPSs:
├─ Database tier (MySQL + replication)
├─ Cache tier (Redis cluster)
├─ Application tier (Load balanced backends)
└─ CDN tier (Frontend static assets)

Scale to Kubernetes:
├─ Containerized services (already in Docker)
├─ Auto-scaling based on CPU/memory
├─ Service mesh (Istio for advanced routing)
└─ Database as managed service (RDS, CloudSQL)
```

---

## 🔄 Integration Points

### Third-party Services (Pluggable)

```
Authentication
├─ Google OAuth (future)
├─ Facebook Login (future)
└─ SMS OTP (future)

Payment Gateway (IF NEEDED - currently removed)
├─ Razorpay API
├─ Stripe API
└─ PayPal API

Email Service
├─ SendGrid (for transactional emails)
├─ AWS SES (alternative)
└─ Mailgun (alternative)

SMS Service
├─ Twilio API
├─ AWS SNS
└─ Nexmo API

Mapping & Location
├─ Google Maps API
├─ Mapbox API
└─ OpenStreetMap (free)

Error Tracking
├─ Sentry (implemented)
├─ New Relic (alternative)
└─ DataDog (alternative)

Analytics
├─ Google Analytics
├─ Mixpanel
└─ Amplitude

Notifications
├─ FCM (Firebase Cloud Messaging)
├─ APNs (Apple Push Notification)
└─ WebPush API
```

---

## 📋 Component Communication Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    Frontend (React)                       │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │           React Components Layer                │   │
│  │  • HeroSection, Blog, BookingForm, etc.         │   │
│  └────────────────────┬────────────────────────────┘   │
│                       │ setState / useContext            │
│  ┌────────────────────▼────────────────────────────┐   │
│  │           Redux State Management                │   │
│  │  • Slices: auth, bookings, admin, cache        │   │
│  │  • Thunks: async API calls                      │   │
│  │  • Selectors: derived state                     │   │
│  └────────────────────┬────────────────────────────┘   │
│                       │ dispatch(thunk)                  │
│  ┌────────────────────▼────────────────────────────┐   │
│  │         Services Layer                          │   │
│  │  • apiClient (HTTP)                             │   │
│  │  • websocketService (WebSocket)                 │   │
│  │  • logger, errorHandler                         │   │
│  └────────────────────┬────────────────────────────┘   │
│                       │ HTTP / WS                        │
└───────────────────────┼─────────────────────────────────┘
                        │
                 ┌──────┴──────┐
                 │             │
    ┌────────────▼─────────┐   │
    │  REST API (HTTP)     │   │
    │  /api/v1/*           │   │
    └──────────────────────┘   │
                                │
    ┌──────────────────────┐    │
    │  WebSocket (STOMP)   │◄───┘
    │  /ws/ride            │
    └──────────┬───────────┘
               │
        ┌──────▼──────────────────────────────────┐
        │      Backend (Spring Boot)               │
        │                                          │
        │  ┌──────────────────────────────────┐   │
        │  │  REST Controller & WebSocket Ctrl│   │
        │  │  • Parse requests                │   │
        │  │  • Call services                 │   │
        │  │  • Return responses              │   │
        │  └──────────────┬───────────────────┘   │
        │                 │                       │
        │  ┌──────────────▼───────────────────┐   │
        │  │     Business Logic Layer         │   │
        │  │  • UserService                   │   │
        │  │  • BookingService                │   │
        │  │  • RideTrackingService           │   │
        │  │  • CacheService                  │   │
        │  └──────────────┬───────────────────┘   │
        │                 │                       │
        │  ┌──────────────▼───────────────────┐   │
        │  │   Repository/DAO Layer           │   │
        │  │  • UserRepository                │   │
        │  │  • BookingRepository             │   │
        │  └──────────────┬───────────────────┘   │
        │                 │                       │
        └─────────────────┼───────────────────────┘
                          │
          ┌───────────────┼───────────────────┐
          │               │                   │
    ┌─────▼────────┐  ┌──▼──────────┐  ┌────▼─────────┐
    │   MySQL DB   │  │ Redis Cache │  │ File System  │
    │  (8.0+)      │  │  (7.0+)     │  │ (Logs, etc)  │
    └──────────────┘  └─────────────┘  └──────────────┘
```

---

## 🔧 Development Workflow

```
1. Feature Development
   ├─ Create feature branch: git checkout -b feature/feature-name
   ├─ Make changes (frontend + backend)
   ├─ Test locally: npm run dev:all
   └─ Commit: git commit -m "feat: description"

2. Testing
   ├─ Frontend: npm test
   ├─ Backend: mvn test
   └─ Manual: UI testing + API testing

3. Code Review
   ├─ Push branch: git push origin feature/feature-name
   ├─ Create pull request
   ├─ Review checklist
   └─ Approve & merge

4. Deployment
   ├─ Merge to main
   ├─ Build: ./deploy.sh build
   ├─ Test: ./deploy.sh verify
   ├─ Deploy: ./deploy.sh start
   └─ Monitor: ./deploy.sh logs backend/frontend
```

---

## 📊 Monitoring & Observability

### Metrics Collected

```
Application Metrics:
├─ Request count & latency
├─ Database query count & time
├─ Cache hit/miss rate
├─ Error rate & types
├─ Active user sessions
└─ WebSocket connections

System Metrics:
├─ CPU usage
├─ Memory usage
├─ Disk I/O
├─ Network bandwidth
├─ Container health
└─ Database connection pool

Business Metrics:
├─ Bookings created (count, revenue)
├─ Ride completion rate
├─ Average rating
├─ Driver approval rate
└─ Customer churn rate
```

### Logging Strategy

```
Log Levels:
├─ DEBUG: Detailed info for debugging
├─ INFO: General application flow
├─ WARN: Potential issues (recoverable)
├─ ERROR: Failures (needs attention)
└─ FATAL: Critical system failures

Log Format (JSON):
{
  "timestamp": "2026-02-15T10:30:00.000Z",
  "level": "INFO",
  "logger": "com.indicab.service.BookingService",
  "message": "Booking created successfully",
  "bookingId": "12345",
  "userId": "67890",
  "duration": "234ms"
}

Log Storage:
├─ Local files: /var/log/indicab/
├─ Rotation: Daily, max 30 days
├─ Sentry: Errors and exceptions
└─ ELK Stack: (optional) centralized logging
```

---

## 🎓 Architecture Principles

1. **Separation of Concerns**
   - Controllers handle HTTP
   - Services handle business logic
   - Repositories handle data access

2. **DRY (Don't Repeat Yourself)**
   - Reusable components
   - Shared utilities
   - Common mappers

3. **SOLID Principles**
   - Single Responsibility
   - Open/Closed
   - Liskov Substitution
   - Interface Segregation
   - Dependency Inversion

4. **Fail-Safe Defaults**
   - WebSocket fallback to polling
   - Missing data uses defaults
   - Errors show user-friendly messages
   - Offline mode for critical features

5. **Security by Default**
   - HTTPS enforced
   - JWT authentication
   - Input validation
   - CORS configured
   - Rate limiting enabled
```
