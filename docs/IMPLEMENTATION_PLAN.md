# Indicab System Enhancement & Admin Panel Implementation Plan

## Overview
Implement a complete booking management system with:
- Dynamic fare estimation on booking form
- Email notifications (admin on booking, user on confirmation)
- Admin CRUD for bookings, blogs, cities, routes, and vehicles
- Docker Compose deployment on single VPS

---

## Phase 1: Fare Calculation & Booking Form Enhancement

### 1.1 Backend Fare Calculation Service
**Files to create/modify:**
- `BookingService.java` - Add fare calculation method
- `FareCalculationService.java` (new) - Core fare calculation logic
- `RouteRepository.java` (new) - Store popular routes with fixed prices
- Route entity and related tables

**Implementation:**
- Create `Route` entity with fields: `from`, `to`, `distance`, `fixedPrice`, `isPopular`
- Implement `FareCalculationService`:
  - `calculateFare(from, to, vehicleType, distance)` 
  - If popular route exists → use fixed price
  - Else → calculate: `distance * basePricePerKm * vehicleTypeMultiplier`
- Expose endpoint: `GET /api/bookings/calculate-fare?from=X&to=Y&vehicle=Z&distance=D`

### 1.2 Frontend Booking Form Enhancement
**Files to modify:**
- `BookingForm.jsx` - Add real-time fare estimation
- `bookingSlice.js` (Redux) - Store calculated fare

**Implementation:**
- Add distance input field (can be derived from geocoding or manual input)
- Call `calculate-fare` endpoint on form change
- Display estimated amount in real-time
- Show breakdown: base fare + taxes/service charges

### 1.3 Data Models
**Backend:**
- Create `PricingRule` table for vehicle type multipliers
- Create `PopularRoute` table for fixed-price routes
- Seed initial data (sample routes, vehicle prices)

---

## Phase 2: Email Notifications

### 2.1 Backend Email Service
**Files to create/modify:**
- `EmailService.java` (new) - Handle all email sending
- `EmailController.java` (new) - Email endpoints
- `application.properties` - Add email configuration
- `BookingServiceImpl.java` - Call email on booking creation

**Implementation:**
- Use JavaMail with SMTP (Gmail, SendGrid, or custom mail server)
- Email templates using Thymeleaf
- Template 1: Admin notification (when booking created)
  - To: admin email (from env vars)
  - Subject: "New Booking - {bookingId}"
  - Body: Full booking details, customer info, estimated fare
- Template 2: User confirmation (when admin confirms)
  - To: customer email
  - Subject: "Your Booking is Confirmed"
  - Body: Booking ID, date/time, vehicle, pickup/dropoff, instructions

### 2.2 Email Flow
- **On booking submission**: Trigger email to admin with all details
- **On admin confirm**: Trigger confirmation email to customer
- **On admin cancel**: Trigger cancellation email to customer
- Implement retry logic for failed emails

### 2.3 Environment Configuration
```
MAIL_HOST=smtp.gmail.com (or your provider)
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@indicab.com
MAIL_FROM=noreply@indicab.com
```

---

## Phase 3: Admin Panel CRUD Operations

### 3.1 Booking Management
**Files to modify:**
- `AdminDashboardController.java` - Add booking endpoints
- `BookingServiceImpl.java` - Add confirmation/cancellation logic
- `AdminDashboard.jsx` - Enhanced booking list view

**Endpoints:**
- `GET /api/admin/bookings` - List all bookings (paginated)
- `GET /api/admin/bookings/{id}` - Get booking details
- `PUT /api/admin/bookings/{id}/confirm` - Confirm booking (send email to user)
- `PUT /api/admin/bookings/{id}/cancel` - Cancel booking (send email to user)
- `DELETE /api/admin/bookings/{id}` - Delete booking record

**Features:**
- Filter by status (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- Sort by date, amount, customer name
- Search by booking ID or customer email
- Bulk actions (confirm multiple, cancel multiple)

### 3.2 Cities Management
**Files to create/modify:**
- `CityController.java` (new) - CRUD endpoints
- `CityService.java` (new) - Business logic
- `CityRepository.java` (new) - Database access
- `City.java` (new) - Entity

**Endpoints:**
- `GET /api/admin/cities` - List all cities
- `POST /api/admin/cities` - Create city
- `GET /api/admin/cities/{id}` - Get city details
- `PUT /api/admin/cities/{id}` - Update city
- `DELETE /api/admin/cities/{id}` - Delete city

**Cities Component (Frontend):**
- `CitiesManagement.jsx` - CRUD UI
- Table with edit/delete buttons
- Modal for add/edit forms
- Validation (city name required, unique)

### 3.3 Vehicles/Cars Management
**Files to create/modify:**
- `VehicleController.java` (new)
- `VehicleService.java` (new)
- `VehicleRepository.java` (new)
- `Vehicle.java` (new) - Entity

**Endpoints:**
- `GET /api/admin/vehicles` - List all vehicles
- `POST /api/admin/vehicles` - Create vehicle
- `GET /api/admin/vehicles/{id}` - Get vehicle details
- `PUT /api/admin/vehicles/{id}` - Update vehicle
- `DELETE /api/admin/vehicles/{id}` - Delete vehicle

**Vehicles Component (Frontend):**
- `VehiclesManagement.jsx`
- Display: name, type, seat capacity, base price multiplier
- Edit/delete functionality

### 3.4 Popular Routes Management
**Files to create/modify:**
- `RouteController.java` (new)
- `RouteService.java` (new)
- `RouteRepository.java` (new)
- `Route.java` (new) - Entity

**Endpoints:**
- `GET /api/admin/routes` - List all routes
- `POST /api/admin/routes` - Create route
- `GET /api/admin/routes/{id}` - Get route details
- `PUT /api/admin/routes/{id}` - Update route
- `DELETE /api/admin/routes/{id}` - Delete route

**Routes Component (Frontend):**
- `RoutesManagement.jsx`
- Display: from, to, distance, fixed price
- Toggle popular/unpopular
- Edit/delete functionality

### 3.5 Blogs Management
**Files to create/modify:**
- `BlogController.java` (new)
- `BlogService.java` (new)
- `BlogRepository.java` (new) - Database access
- `Blog.java` (new) - Entity

**Endpoints:**
- `GET /api/blogs` - List all blogs (public, paginated)
- `GET /api/admin/blogs` - List all blogs (admin)
- `POST /api/admin/blogs` - Create blog
- `GET /api/admin/blogs/{id}` - Get blog details
- `PUT /api/admin/blogs/{id}` - Update blog
- `DELETE /api/admin/blogs/{id}` - Delete blog

**Blog Entity Fields:**
- `title`, `content`, `author`, `imageUrl`, `publishedAt`, `status` (DRAFT/PUBLISHED)

**Blogs Component (Frontend):**
- `BlogsManagement.jsx`
- Rich text editor for content (e.g., React Quill)
- Image upload support
- Publish/draft toggle
- Edit/delete functionality

### 3.6 Admin Panel Navigation
**Files to modify:**
- `AdminDashboard.jsx` - Add menu/navigation
- `AdminLayout.jsx` (new) - Consistent layout

**Navigation Menu:**
```
Dashboard
├── Bookings
├── Cities
├── Vehicles
├── Routes
├── Blogs
└── Settings (users, mail config, etc.)
```

---

## Phase 4: Database & Domain Models

### 4.1 New Entities
- `PopularRoute` - from, to, distance, fixedPrice, isActive
- `Vehicle` - name, type, capacity, priceMultiplier
- `City` - name, latitude, longitude, isActive
- `Blog` - title, content, author, imageUrl, publishedAt, status
- `PricingRule` - vehicleType, basePrice, multiplier

### 4.2 Entity Relationships
```
User (existing) ←→ Booking (existing)
Booking ←→ Vehicle (many-to-one)
Booking ← City (from/to cities)
Vehicle ← VehicleType
PopularRoute ← City, City
Blog (independent)
```

### 4.3 Database Migrations
- Use Flyway or Liquibase for schema management
- Create migration scripts for:
  - New tables
  - Seed data (sample cities, vehicles, routes)
  - Indexes on frequently queried columns

---

## Phase 5: Frontend Components

### 5.1 New Admin Components
- `AdminDashboard.jsx` - Enhanced dashboard
- `BookingsManagement.jsx` - Booking CRUD
- `CitiesManagement.jsx` - Cities CRUD
- `VehiclesManagement.jsx` - Vehicles CRUD
- `RoutesManagement.jsx` - Routes CRUD
- `BlogsManagement.jsx` - Blogs CRUD
- `AdminLayout.jsx` - Admin layout wrapper

### 5.2 Shared Components
- `DataTable.jsx` - Reusable table with sorting/filtering
- `ConfirmModal.jsx` - Confirmation dialogs
- `FormModal.jsx` - Modal for add/edit forms
- `ImageUpload.jsx` - Image upload component

### 5.3 Booking Form Update
- `BookingForm.jsx` - Add fare estimation display
- Add distance input
- Real-time fare calculation
- Show fare breakdown

---

## Phase 6: Docker & Deployment

### 6.1 Docker Setup
**Current state:** Docker files exist, need to ensure single VPS deployment works

**Files to verify/modify:**
- `docker-compose.yml` - Ensure all services defined
- `Dockerfile` (backend) - Verify multi-stage build
- `Dockerfile` (frontend) - Verify multi-stage build
- `.env.example` - Document all environment variables

**Services in docker-compose.yml:**
1. **MySQL database** - Port 3306
2. **Backend (Spring Boot)** - Port 8080
3. **Frontend (Nginx)** - Port 80/443
4. **Optional: Mailhog** - SMTP mock for testing (port 1025)

### 6.2 Environment Variables
```
# Database
MYSQL_ROOT_PASSWORD=secure-password
MYSQL_DATABASE=indicab
MYSQL_USER=indicab_user
MYSQL_PASSWORD=secure-user-password

# Backend
SERVER_PORT=8080
SPRING_PROFILE=prod
LOG_LEVEL=INFO

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@indicab.com

# Frontend
VITE_API_BASE_URL=http://backend:8080/api
```

### 6.3 VPS Deployment Steps
1. SSH into VPS
2. Install Docker & Docker Compose
3. Clone repository
4. Create `.env` file with production values
5. Run `docker-compose up -d`
6. Setup SSL certificate (Let's Encrypt via Certbot)
7. Configure Nginx for SSL and reverse proxy
8. Setup automated backups for MySQL

### 6.4 Nginx Configuration
- Reverse proxy to backend (port 8080)
- Serve frontend static files (port 80/443)
- Compression (gzip)
- Security headers
- SSL/TLS termination

---

## Phase 7: Testing & Quality Assurance

### 7.1 Backend Tests
- Unit tests for `FareCalculationService`
- Unit tests for `EmailService`
- Integration tests for CRUD endpoints
- Email template validation

### 7.2 Frontend Tests
- Component tests for admin panels
- Form validation tests
- Real-time fare estimation tests

### 7.3 Manual Testing
- End-to-end booking flow
- Email delivery verification
- Admin CRUD operations
- Docker deployment validation

---

## Implementation Order (Recommended)

1. **Week 1**: Database models + fare calculation + API endpoints
2. **Week 2**: Email service integration + booking flow updates
3. **Week 3**: Admin CRUD for bookings, cities, vehicles, routes
4. **Week 4**: Blog management + frontend components
5. **Week 5**: Testing, deployment, and production setup

---

## Technology Stack Summary
- **Backend**: Spring Boot 3.5.3, MySQL, JavaMail, Flyway
- **Frontend**: React 18, Redux, Axios, React Router
- **Deployment**: Docker Compose, Nginx, Let's Encrypt
- **Email**: SMTP (Gmail/SendGrid/custom)
- **Frontend Editor**: React Quill (for blog content)
