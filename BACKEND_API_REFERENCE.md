# IndiCab Backend API Reference & Logic Documentation

**Last Updated:** March 15, 2026  
**Backend Framework:** Spring Boot 3.5.3 (Java 17)  
**Database:** MySQL 8.0+ with Flyway migrations  
**Base URL:** `/api/v1`

---

## 📋 Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [User Management](#user-management)
3. [Booking Management](#booking-management)
4. [Admin Dashboard](#admin-dashboard)
5. [Driver Management](#driver-management)
6. [Ride Tracking](#ride-tracking)
7. [Database Schema](#database-schema)
8. [Service Layer Logic](#service-layer-logic)
9. [Configuration & Security](#configuration--security)

---

## 🔐 Authentication Endpoints

**Base Path:** `/api/v1/auth`

### 1. User Login
```
POST /api/v1/auth/login
Authorization: None (public)

Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "123456789",
    "address": "123 Main St",
    "role": "USER"
  }
}

Error Responses:
- 401 Unauthorized: Invalid credentials
- 400 Bad Request: Validation failed
```

**Logic:**
- Uses Spring `AuthenticationManager` with `UsernamePasswordAuthenticationToken`
- Encrypts password with `PasswordEncoder`
- Generates JWT access token (15 minutes expiry)
- Creates/refreshes `RefreshToken` entity (7 days expiry)
- Returns user details in `UserResponseDTO`

---

### 2. User Registration
```
POST /api/v1/auth/register
Authorization: None (public)

Request:
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword123",
  "phone": "987654321",
  "address": "456 Oak Ave"
}

Response (201 Created):
{
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": 2,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "987654321",
    "address": "456 Oak Ave",
    "role": "USER"
  }
}

Error Responses:
- 409 Conflict: Email already exists
- 400 Bad Request: Validation failed
```

**Logic:**
- Validates unique email constraint in `UserService.registerUser()`
- Encodes password using Spring Security's `PasswordEncoder`
- Creates new `User` entity with default role "USER"
- Auto-logs in user after registration
- Sets `driverStatus = "NONE"` for new users

---

### 3. Refresh Access Token
```
POST /api/v1/auth/refresh-token
Authorization: None (public)

Request:
{
  "refreshToken": "refresh_token_here"
}

Response (200 OK):
{
  "accessToken": "new_jwt_token_here",
  "refreshToken": "same_or_new_refresh_token",
  "user": { ... }
}

Error Responses:
- 401 Unauthorized: Invalid or expired refresh token
- 400 Bad Request: Validation failed
```

**Logic:**
- Located in `RefreshTokenService`
- Validates refresh token hasn't expired
- Checks if token exists in database
- Generates new access token with same claims
- `RefreshToken` entity stores: `userId`, `token`, `expiryDate`

---

### 4. Admin Login
```
POST /api/v1/auth/admin-login
Authorization: None (public)

Request:
{
  "email": "admin@example.com",
  "password": "adminPassword123"
}

Response (200 OK):
{
  "accessToken": "jwt_token_with_admin_role",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": 5,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}

Error Responses:
- 401 Unauthorized: User is not ADMIN role
- 401 Unauthorized: Invalid credentials
```

**Logic:**
- Validates user exists and has `role = "ADMIN"`
- Throws exception if user role is not "ADMIN"
- JWT token contains role claim for authorization
- `@PreAuthorize("hasRole('ADMIN')")` enforces access control

---

### 5. User Logout
```
POST /api/v1/auth/logout
Authorization: Bearer {accessToken}

Response (200 OK):
{
  "statusCode": 200,
  "message": "Logout successful",
  "timestamp": "2026-03-15T10:30:00"
}

Error Responses:
- 401 Unauthorized: User not authenticated
```

**Logic:**
- Extracts user email from JWT token via `SecurityContextHolder`
- Deletes all refresh tokens for this user (`RefreshTokenService.deleteByUser()`)
- Clears Spring Security context
- Client should discard access token on frontend

---

## 👤 User Management

**Base Path:** `/api/v1/users`  
**Authentication:** Required (Bearer Token)

### 1. Get Current User Profile
```
GET /api/v1/users/profile
Authorization: Bearer {accessToken}

Response (200 OK):
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123456789",
  "address": "123 Main St"
}

Error Responses:
- 401 Unauthorized: User not authenticated
- 404 Not Found: User profile not found
- 500 Internal Server Error
```

**Logic:**
- Located in `UserController.getCurrentUserProfile()`
- Extracts username from `SecurityContextHolder.getContext().getAuthentication()`
- Queries `UserService.findByEmail()`
- Maps `User` entity to `UserProfileDTO`

---

### 2. Get User Profile by ID
```
GET /api/v1/users/{id}/profile
Authorization: Bearer {accessToken}

Response (200 OK):
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "987654321",
  "address": "456 Oak Ave"
}

Error Responses:
- 401 Unauthorized
- 404 Not Found: User not found
```

**Logic:**
- Calls `UserService.getUserOrThrow(id)` - throws if not found
- Returns 404 if user doesn't exist
- Maps to `UserProfileDTO`

---

### 3. Update User Profile
```
PUT /api/v1/users/{id}/profile
Authorization: Bearer {accessToken}

Request:
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "phone": "111222333",
  "address": "789 New St"
}

Response (200 OK):
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "phone": "111222333",
  "address": "789 New St"
}

Error Responses:
- 404 Not Found: User not found
- 400 Bad Request: Invalid request
- 401 Unauthorized
```

**Logic:**
- Located in `UserService.updateUserProfile(id, profileDTO)`
- Updates only non-null fields
- Validates email uniqueness if email is changed
- Sets `updatedAt` timestamp via Hibernate `@UpdateTimestamp`

---

### 4. Change Password
```
POST /api/v1/users/{id}/password
Authorization: Bearer {accessToken}

Request:
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}

Response (200 OK):
{
  "success": true,
  "message": "Password changed successfully"
}

Error Responses:
- 400 Bad Request: Current password is incorrect
- 400 Bad Request: New passwords don't match
- 400 Bad Request: Password too short (min 6 chars)
- 404 Not Found: User not found
- 401 Unauthorized
```

**Logic:**
- Verifies current password using `PasswordEncoder.matches()`
- Validates new password length (≥6 characters)
- Checks new password = confirm password
- Encodes new password before saving
- `User.password` stores bcrypt-encoded hash

---

### 5. Delete Account
```
DELETE /api/v1/users/{id}/account
Authorization: Bearer {accessToken}
Query Param: ?password=userPassword

Response (200 OK):
{
  "success": true,
  "message": "Account deletion initiated. Your data will be permanently deleted."
}

Error Responses:
- 400 Bad Request: Invalid password
- 404 Not Found: User not found
- 401 Unauthorized
```

**Logic:**
- Optional password verification for security
- Currently marks account for deletion (soft delete recommended in production)
- Should trigger cascade delete of related bookings, ratings, etc.

---

### 6. Get User Info by ID
```
GET /api/v1/users/{id}
Authorization: Bearer {accessToken}

Response (200 OK):
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123456789",
  "address": "123 Main St",
  "role": "USER"
}

Error Responses:
- 404 Not Found: User not found
- 401 Unauthorized
```

**Logic:**
- Returns basic user info in `UserResponseDTO`
- Includes user role for frontend permission checks

---

## 📅 Booking Management

**Base Path:** `/api/v1/bookings`  
**Authentication:** Required (Bearer Token)

### 1. Get User's Bookings (Paginated)
```
GET /api/v1/bookings?page=0&size=10
Authorization: Bearer {accessToken}

Query Parameters:
- page: Page number (0-indexed), default: 0
- size: Page size, default: 10

Response (200 OK):
{
  "content": [
    {
      "id": 1,
      "pickupLocation": "123 Main St",
      "dropoffLocation": "456 Oak Ave",
      "pickupTime": "2026-03-15T14:00:00",
      "status": "CONFIRMED",
      "totalPrice": 25.50,
      "userId": 1
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 45,
  "totalPages": 5
}

Error Responses:
- 401 Unauthorized: User not authenticated
```

**Logic:**
- Located in `BookingController.getUserBookings()`
- Extracts current user from security context
- Queries `BookingService.getBookingsByUserId(userId, pageable)`
- Uses Spring Data `Page` for pagination
- Maps results to `BookingResponseDTO`
- **Security:** Returns only current user's bookings

---

### 2. Get All Bookings (Legacy - No Pagination)
```
GET /api/v1/bookings/legacy
Authorization: Bearer {accessToken}

Response (200 OK):
[
  {
    "id": 1,
    "pickupLocation": "123 Main St",
    "dropoffLocation": "456 Oak Ave",
    "status": "CONFIRMED",
    "totalPrice": 25.50
  },
  ...
]

Note: Deprecated - use /api/v1/bookings with pagination instead
```

**Logic:**
- Deprecated endpoint
- Fetches all bookings without pagination
- Performance issue on large datasets
- Recommend using paginated version instead

---

### 3. Get Booking by ID
```
GET /api/v1/bookings/{id}
Authorization: Bearer {accessToken}

Response (200 OK):
{
  "id": 1,
  "pickupLocation": "123 Main St",
  "dropoffLocation": "456 Oak Ave",
  "pickupTime": "2026-03-15T14:00:00",
  "status": "CONFIRMED",
  "totalPrice": 25.50,
  "userId": 1,
  "notes": "Please arrive early",
  "createdAt": "2026-03-15T10:00:00",
  "updatedAt": "2026-03-15T12:00:00"
}

Error Responses:
- 404 Not Found: Booking not found
- 401 Unauthorized
```

**Logic:**
- Queries `BookingService.getBookingById(id)`
- Maps to `BookingResponseDTO`
- Does NOT validate ownership - frontend should check

---

### 4. Get Public Booking Status (Guest Lookup)
```
GET /api/v1/bookings/{id}/public
Authorization: None (public endpoint)

Response (200 OK):
{
  "id": 1,
  "pickupLocation": "123 Main St",
  "dropoffLocation": "456 Oak Ave",
  "status": "CONFIRMED",
  "estimatedTime": "15 minutes"
}

Error Responses:
- 404 Not Found: Booking not found
```

**Logic:**
- Public endpoint - no authentication required
- Returns limited info via `BookingMapper.toPublicDto()`
- Excludes sensitive data (phone, payment info, driver details)
- Allows tracking rides without account

---

### 5. Create New Booking
```
POST /api/v1/bookings
Authorization: Optional (works for authenticated and unauthenticated)

Request:
{
  "pickupLocation": "123 Main St",
  "dropoffLocation": "456 Oak Ave",
  "pickupTime": "2026-03-15T14:00:00",
  "packageType": "STANDARD",
  "notes": "Please arrive early",
  "specialRequests": "Non-smoking car"
}

Response (201 Created):
{
  "id": 45,
  "pickupLocation": "123 Main St",
  "dropoffLocation": "456 Oak Ave",
  "pickupTime": "2026-03-15T14:00:00",
  "status": "PENDING",
  "totalPrice": 25.50,
  "userId": 1
}

Error Responses:
- 400 Bad Request: Validation failed
```

**Logic:**
- Located in `BookingController.createBooking()`
- Attempts to get current user from security context
- If authenticated: links booking to user (`currentUserId` set)
- If guest: `currentUserId = null` (guest booking)
- Calls `BookingService.createBooking(bookingDTO, currentUserId)`
- Calculates price based on packageType
- Default status: "PENDING"
- Timestamps set automatically via Hibernate

---

### 6. Update Booking
```
PUT /api/v1/bookings/{id}
Authorization: Bearer {accessToken}

Request:
{
  "pickupLocation": "789 New St",
  "dropoffLocation": "321 Updated Ave",
  "pickupTime": "2026-03-16T10:00:00",
  "notes": "Updated notes"
}

Response (200 OK):
{
  "id": 1,
  "pickupLocation": "789 New St",
  "dropoffLocation": "321 Updated Ave",
  "pickupTime": "2026-03-16T10:00:00",
  "status": "PENDING",
  "totalPrice": 30.00
}

Error Responses:
- 404 Not Found: Booking not found
- 400 Bad Request: Validation failed
- 401 Unauthorized
```

**Logic:**
- Located in `BookingService.updateBooking(id, dto)`
- Only updates mutable fields (not status directly)
- Recalculates price if route changes
- Sets `updatedAt` timestamp

---

### 7. Delete/Cancel Booking
```
DELETE /api/v1/bookings/{id}
Authorization: Bearer {accessToken}

Response (204 No Content)

Error Responses:
- 404 Not Found: Booking not found
- 401 Unauthorized
```

**Logic:**
- Located in `BookingService.deleteBooking(id)`
- Soft delete (recommended) - marks as cancelled
- Hard delete - removes from database
- Should check if booking can be cancelled (status == PENDING only)

---

## 🏢 Admin Dashboard

**Base Path:** `/api/v1/admin/dashboard`  
**Authentication:** Required (Bearer Token + ADMIN role)  
**Authorization:** `@PreAuthorize("hasRole('ADMIN')")`

### 1. Get Dashboard Overview
```
GET /api/v1/admin/dashboard/overview
Authorization: Bearer {adminToken}

Response (200 OK):
{
  "timestamp": "2026-03-15T10:30:00",
  "users": {
    "total": 156,
    "drivers": 42,
    "riders": 114
  },
  "bookings": {
    "total": 523,
    "pending": 87,
    "confirmed": 436,
    "pendingPercentage": 16.63
  },
  "audit": {
    "totalLogs": 2145,
    "failedOperations": 23,
    "failureRate": 1.07
  }
}

Error Responses:
- 403 Forbidden: User does not have ADMIN role
- 401 Unauthorized: Invalid or missing token
```

**Logic:**
- Located in `AdminDashboardController.getDashboardOverview()`
- Queries database for:
  - `UserRepository.count()` - total users
  - Stream filtering on role for drivers/riders
  - `BookingRepository.count()` - total bookings
  - Stream filtering on status for pending/confirmed
  - `AuditLogRepository.count()` - audit logs
- Calculates percentages and statistics
- Returns compiled response

---

### 2. Get Users List (Paginated)
```
GET /api/v1/admin/dashboard/users?page=0&size=20&sort=createdAt,desc
Authorization: Bearer {adminToken}

Query Parameters:
- page: Page number (0-indexed)
- size: Page size
- sort: Sorting (e.g., "createdAt,desc" or "name,asc")

Response (200 OK):
{
  "content": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "123456789",
      "address": "123 Main St",
      "role": "USER",
      "createdAt": "2026-03-01T10:00:00",
      "updatedAt": "2026-03-15T09:00:00"
    },
    ...
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": [{"property": "createdAt", "direction": "DESC"}]
  },
  "totalElements": 156,
  "totalPages": 8,
  "number": 0,
  "size": 20,
  "numberOfElements": 20
}

Error Responses:
- 403 Forbidden: Not ADMIN
- 401 Unauthorized
```

**Logic:**
- Uses Spring Data `Pageable` interface
- Spring converts query params to `PageRequest`
- Queries `UserRepository.findAll(pageable)`
- Returns Spring Data `Page<User>`

---

### 3. Get Bookings List (Paginated + Filtered)
```
GET /api/v1/admin/dashboard/bookings?page=0&size=20&status=PENDING
Authorization: Bearer {adminToken}

Query Parameters:
- page: Page number
- size: Page size
- status: Filter by status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
- sort: Sorting order

Response (200 OK):
{
  "content": [
    {
      "id": 1,
      "pickupLocation": "123 Main St",
      "dropoffLocation": "456 Oak Ave",
      "pickupTime": "2026-03-15T14:00:00",
      "status": "PENDING",
      "totalPrice": 25.50,
      "userId": 1,
      "createdAt": "2026-03-15T10:00:00"
    },
    ...
  ],
  "totalElements": 87,
  "totalPages": 5,
  "number": 0
}

Error Responses:
- 403 Forbidden: Not ADMIN
- 401 Unauthorized
```

**Logic:**
- Located in `AdminDashboardController.getBookings()`
- Uses `SearchSpecification` for dynamic filtering
- If `status` provided: filters by status using JPA Specification
- Returns paginated results

---

### 4. Get Audit Logs
```
GET /api/v1/admin/audit?page=0&size=50
Authorization: Bearer {adminToken}

Response (200 OK):
{
  "content": [
    {
      "id": 1,
      "adminId": 5,
      "action": "DELETE",
      "entityType": "USER",
      "entityIds": [10, 11, 12],
      "timestamp": "2026-03-15T10:30:00",
      "ipAddress": "192.168.1.1",
      "status": "SUCCESS",
      "details": "Bulk deleted 3 users"
    },
    ...
  ],
  "totalElements": 2145,
  "totalPages": 43
}

Error Responses:
- 403 Forbidden: Not ADMIN
- 401 Unauthorized
```

**Logic:**
- `AuditLog` entity tracks admin actions
- Fields: `adminId`, `action` (DELETE, UPDATE_ROLE, etc), `entityType`, `entityIds`, `timestamp`, `ipAddress`, `status`, `details`
- Located in `AdminAuditController`
- Searchable by date, action type, status

---

## 👨‍💼 Admin User Management

**Base Path:** `/api/v1/admin`  
**Authentication:** Required (Bearer Token + ADMIN role)

### 1. Get All Users (Search + Sort + Filter)
```
GET /api/v1/admin/users?page=0&size=20&search=john&email=john@example.com&role=DRIVER
Authorization: Bearer {adminToken}

Query Parameters:
- page, size: Pagination
- search: Search in name or email (contains)
- email: Exact email match
- role: Filter by role (USER, DRIVER, ADMIN)

Response (200 OK):
{
  "content": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "DRIVER",
      ...
    }
  ],
  "totalElements": 42,
  "totalPages": 3
}

Error Responses:
- 403 Forbidden: Not ADMIN
- 401 Unauthorized
```

**Logic:**
- Uses `SearchSpecification.SpecificationBuilder` for dynamic queries
- Supports multiple filter combinations
- Builds JPA Specification dynamically based on params
- Query example: "name contains 'john' OR email contains 'john'" + "email = 'john@example.com'" + "role = 'DRIVER'"

---

### 2. Get User by ID (Admin View)
```
GET /api/v1/admin/user/{id}
Authorization: Bearer {adminToken}

Response (200 OK):
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123456789",
  "address": "123 Main St",
  "role": "USER",
  "licenseNumber": null,
  "vehicleType": null,
  "driverStatus": "NONE",
  "createdAt": "2026-03-01T10:00:00",
  "updatedAt": "2026-03-15T09:00:00"
}

Error Responses:
- 404 Not Found: User not found
- 403 Forbidden: Not ADMIN
- 401 Unauthorized
```

**Logic:**
- Returns complete `User` entity with all fields
- Admin can see sensitive driver application info

---

### 3. Delete User
```
DELETE /api/v1/admin/user/{id}
Authorization: Bearer {adminToken}

Response (200 OK):
{
  "message": "User deleted successfully"
}

Error Responses:
- 404 Not Found: User not found
- 403 Forbidden: Not ADMIN
- 401 Unauthorized
```

**Logic:**
- Hard delete: `UserRepository.deleteById(id)`
- Should implement soft delete in production
- Logs action via `AuditLoggingService`

---

### 4. Bulk Delete Users
```
DELETE /api/v1/admin/users/bulk
Authorization: Bearer {adminToken}

Request:
[1, 2, 3, 4, 5]

Response (204 No Content)

Error Responses:
- 403 Forbidden: Not ADMIN
- 401 Unauthorized
```

**Logic:**
- Located in `AdminController.bulkDeleteUsers(ids)`
- Calls `UserService.bulkDeleteUsers(ids)`
- Logs operation via `AuditLoggingService.logBulkOperation()`
- Includes admin ID, IP address, count, and operation description
- If error: calls `logFailedBulkOperation()`

---

### 5. Bulk Update User Roles
```
PUT /api/v1/admin/users/bulk/role?role=DRIVER
Authorization: Bearer {adminToken}

Request:
[1, 2, 3]

Response (200 OK)

Error Responses:
- 403 Forbidden: Not ADMIN
- 401 Unauthorized
```

**Logic:**
- Updates `User.role` for multiple users
- Calls `UserService.bulkUpdateUsersRole(ids, role)`
- Logs operation with admin ID and IP address
- Validates role is valid before updating

---

## 🚗 Driver Management

**Base Path:** `/api/v1/driver`  
**Authentication:** Required (Bearer Token)

### 1. Apply for Driver Status
```
POST /api/v1/driver/apply
Authorization: Bearer {userToken}

Request:
{
  "licenseNumber": "DL-12345-6789",
  "vehicleType": "SEDAN",
  "licenseExpiry": "2027-12-31"
}

Response (201 Created):
{
  "id": 1,
  "userId": 5,
  "licenseNumber": "DL-12345-6789",
  "vehicleType": "SEDAN",
  "driverStatus": "PENDING",
  "driverAppliedAt": "2026-03-15T10:30:00"
}

Error Responses:
- 400 Bad Request: Validation failed
- 401 Unauthorized
```

**Logic:**
- Located in `DriverController.applyAsDriver()`
- Extracts user ID from authentication
- Calls `DriverService.applyAsDriver(userId, dto)`
- Sets `User.driverStatus = "PENDING"`
- Sets `User.driverAppliedAt = now()`
- Creates audit log

---

### 2. Get Pending Driver Applications (Admin Only)
```
GET /api/v1/driver/pending
Authorization: Bearer {adminToken}

Response (200 OK):
[
  {
    "id": 1,
    "userId": 5,
    "name": "Jane Driver",
    "email": "jane@example.com",
    "licenseNumber": "DL-12345-6789",
    "vehicleType": "SEDAN",
    "driverStatus": "PENDING",
    "driverAppliedAt": "2026-03-15T10:30:00"
  },
  ...
]

Error Responses:
- 403 Forbidden: Not ADMIN
- 401 Unauthorized
```

**Logic:**
- Queries users where `driverStatus = "PENDING"`
- Returns `DriverResponseDTO` with full details
- Admin uses this to review applications

---

### 3. Get Approved Drivers
```
GET /api/v1/driver/approved
Authorization: Bearer {token} (optional)

Response (200 OK):
[
  {
    "id": 2,
    "userId": 7,
    "name": "John Driver",
    "licenseNumber": "DL-98765-4321",
    "vehicleType": "SUV",
    "driverStatus": "APPROVED",
    "driverApprovedAt": "2026-03-10T14:00:00"
  },
  ...
]

Error Responses:
- 401 Unauthorized
```

**Logic:**
- Public-ish endpoint (auth optional)
- Queries users where `driverStatus = "APPROVED"`
- Frontend uses to display available drivers

---

### 4. Get All Drivers
```
GET /api/v1/driver/all
Authorization: Bearer {token}

Response (200 OK):
[
  {
    "id": 1,
    "userId": 5,
    "name": "Jane Driver",
    "driverStatus": "PENDING"
  },
  {
    "id": 2,
    "userId": 7,
    "name": "John Driver",
    "driverStatus": "APPROVED"
  },
  ...
]

Error Responses:
- 401 Unauthorized
```

**Logic:**
- Returns all drivers across all statuses
- Used by admin for management overview

---

### 5. Get Driver Details by ID
```
GET /api/v1/driver/{driverId}
Authorization: Bearer {token}

Response (200 OK):
{
  "id": 2,
  "userId": 7,
  "name": "John Driver",
  "email": "john@example.com",
  "phone": "123456789",
  "licenseNumber": "DL-98765-4321",
  "vehicleType": "SUV",
  "driverStatus": "APPROVED",
  "rating": 4.8,
  "completedRides": 157
}

Error Responses:
- 404 Not Found: Driver not found
- 401 Unauthorized
```

**Logic:**
- Queries driver by ID
- Includes rating and ride statistics

---

### 6. Review Driver Application (Admin Only)
```
POST /api/v1/driver/review-application
Authorization: Bearer {adminToken}

Request:
{
  "driverId": 1,
  "status": "APPROVED",
  "feedback": "License verified and background check passed"
}

Response (200 OK):
{
  "id": 1,
  "userId": 5,
  "name": "Jane Driver",
  "driverStatus": "APPROVED",
  "driverApprovedAt": "2026-03-15T15:00:00"
}

Error Responses:
- 400 Bad Request: Invalid status
- 404 Not Found: Driver not found
- 403 Forbidden: Not ADMIN
- 401 Unauthorized
```

**Logic:**
- Located in `DriverService.reviewDriverApplication(approvalDTO)`
- Updates `User.driverStatus` to APPROVED or REJECTED
- Sets `User.driverApprovedAt = now()` if approved
- Creates audit log for review action

---

### 7. Get Driver's Rides
```
GET /api/v1/driver/rides
Authorization: Bearer {driverToken}

Response (200 OK):
[
  {
    "id": 1,
    "pickupLocation": "123 Main St",
    "dropoffLocation": "456 Oak Ave",
    "pickupTime": "2026-03-15T14:00:00",
    "status": "IN_PROGRESS",
    "userId": 10,
    "totalPrice": 25.50
  },
  ...
]

Error Responses:
- 401 Unauthorized
```

**Logic:**
- Extracts driver ID from authentication
- Returns rides assigned to this driver
- Currently returns empty list (mock implementation)
- TODO: Implement ride assignment logic

---

## 🗺️ Ride Tracking

**Base Path:** `/api/v1/ride`  
**Authentication:** Optional (public tracking available)

### 1. Get Current Ride Tracking
```
GET /api/v1/ride/track/{rideId}
Authorization: None (public)

Response (200 OK):
{
  "rideId": "ride-123",
  "driverId": "driver-456",
  "status": "IN_PROGRESS",
  "currentLocation": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "pickupLocation": {
    "latitude": 40.7589,
    "longitude": -73.9851
  },
  "dropoffLocation": {
    "latitude": 40.7484,
    "longitude": -73.9857
  },
  "progress": 45,
  "estimatedArrival": "2026-03-15T14:15:00"
}

Error Responses:
- 404 Not Found: Ride not found
- 500 Internal Server Error
```

**Logic:**
- Located in `RideController.trackRide(rideId)`
- Calls `RideTrackingService.getCurrentRideTracking(rideId)`
- Returns current location, progress, and ETA
- Data stored in Redis cache for real-time performance

---

### 2. Simulate Ride Progress (Testing)
```
POST /api/v1/ride/simulate/{rideId}
Authorization: None

Response (200 OK):
{
  "rideId": "ride-123",
  "progress": 50,
  "currentLocation": {
    "latitude": 40.7200,
    "longitude": -74.0100
  },
  "estimatedArrival": "2026-03-15T14:10:00"
}

Error Responses:
- 404 Not Found: Ride not found
- 500 Internal Server Error
```

**Logic:**
- For demo/testing purposes
- Increments progress percentage
- Updates location coordinates
- Decreases estimated arrival time
- Used by frontend demo

---

### 3. Start Ride Tracking
```
POST /api/v1/ride/start/{rideId}
Authorization: None

Response (200 OK):
{
  "message": "Tracking started for ride: ride-123",
  "rideId": "ride-123",
  "wsUrl": "/ws/ride",
  "subscribeTopic": "/topic/ride/ride-123"
}

Error Responses:
- 500 Internal Server Error
```

**Logic:**
- Located in `RideTrackingService.startTracking(rideId)`
- Initializes tracking session
- Creates initial location entry in Redis
- Returns WebSocket subscription topic

---

### 4. Stop Ride Tracking
```
POST /api/v1/ride/stop/{rideId}
Authorization: None

Response (200 OK):
{
  "message": "Tracking stopped for ride: ride-123",
  "rideId": "ride-123"
}

Error Responses:
- 500 Internal Server Error
```

**Logic:**
- Calls `RideTrackingService.stopTracking(rideId)`
- Closes tracking session
- Saves final location data
- Archives to database from Redis

---

### 5. Get Active Rides
```
GET /api/v1/ride/active
Authorization: None

Response (200 OK):
{
  "count": 3,
  "rides": [
    {
      "rideId": "ride-123",
      "status": "IN_PROGRESS",
      "progress": 45,
      "driver": "John Driver"
    },
    ...
  ],
  "wsUrl": "/ws/ride",
  "subscribeTopic": "/topic/rides/active"
}

Error Responses:
- 500 Internal Server Error
```

**Logic:**
- Queries `RideTrackingService.getActiveRides()`
- Returns all rides with status != COMPLETED/CANCELLED
- Real-time updates via WebSocket

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role VARCHAR(50) DEFAULT 'USER',
  license_number VARCHAR(100),
  vehicle_type VARCHAR(50),
  driver_status VARCHAR(50) DEFAULT 'NONE',
  driver_applied_at TIMESTAMP NULL,
  driver_approved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_created_at (created_at),
  INDEX idx_driver_status (driver_status),
  INDEX idx_email_role (email, role)
);
```

**JPA Entity:** `com.indicab.entity.User`  
**Key Fields:**
- `id`: Auto-increment PK
- `email`: Unique, used for login
- `password`: bcrypt-encoded
- `role`: USER, DRIVER, ADMIN
- `driver*`: Driver application fields
- `created_at`, `updated_at`: Timestamp tracking

---

### Bookings Table
```sql
CREATE TABLE bookings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT REFERENCES users(id),
  pickup_location VARCHAR(255) NOT NULL,
  dropoff_location VARCHAR(255) NOT NULL,
  pickup_time TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  total_price DECIMAL(10, 2),
  package_type VARCHAR(50),
  notes TEXT,
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**JPA Entity:** `com.indicab.entity.Booking`  
**Statuses:** PENDING, CONFIRMED, COMPLETED, CANCELLED  
**Relationships:** Many-to-One with User

---

### Refresh Tokens Table
```sql
CREATE TABLE refresh_token (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL REFERENCES users(id),
  token VARCHAR(500) NOT NULL UNIQUE,
  expiry_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_token (token),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**JPA Entity:** `com.indicab.entity.RefreshToken`  
**Expiry:** 7 days by default  
**Logic:** One token per user (replaced on refresh)

---

### Audit Logs Table
```sql
CREATE TABLE audit_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  admin_id BIGINT REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_ids LONGTEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(50),
  status VARCHAR(50),
  details LONGTEXT,
  
  INDEX idx_admin_id (admin_id),
  INDEX idx_action (action),
  INDEX idx_timestamp (timestamp)
);
```

**JPA Entity:** `com.indicab.entity.AuditLog`  
**Actions:** DELETE, UPDATE_ROLE, CREATE, UPDATE, etc.  
**Status:** SUCCESS, FAILED

---

## 🔧 Service Layer Logic

### UserService Interface
```java
// Located in: com.indicab.service.UserService

User registerUser(UserRegistrationDTO registrationDTO);
Optional<User> findByEmail(String email);
Optional<User> findById(Long id);
List<User> getAllUsers();
User updateUserProfile(Long id, UserProfileDTO profileDTO);
boolean emailExists(String email);
User getUserOrThrow(Long id);
void bulkDeleteUsers(List<Long> ids);
void bulkUpdateUsersRole(List<Long> ids, String role);
```

**Implementation Logic:**
- `registerUser()`: Validates email uniqueness, encodes password, sets default role
- `updateUserProfile()`: Partial updates, checks email uniqueness if changed
- `bulkDeleteUsers()`: Loops through IDs, deletes each, logs action
- `bulkUpdateUsersRole()`: Updates role for multiple users, validates role value

---

### BookingService Interface
```java
Booking createBooking(BookingRequestDTO bookingDTO, Long currentUserId);
Optional<Booking> getBookingById(Long id);
List<Booking> getAllBookings();
Page<Booking> getAllBookingsPaged(Pageable pageable);
Booking updateBooking(Long id, BookingRequestDTO bookingDTO);
void deleteBooking(Long id);
boolean bookingExists(Long id);
Booking getBookingOrThrow(Long id);
Page<Booking> getBookingsByUserId(Long userId, Pageable pageable);
List<Booking> getBookingsByUserId(Long userId);
void bulkDeleteBookings(List<Long> ids);
void bulkUpdateBookingsStatus(List<Long> ids, String status);
```

**Implementation Logic:**
- `createBooking()`: Links to user if provided, calculates price, defaults to PENDING
- `updateBooking()`: Recalculates price if locations change
- `getBookingsByUserId()`: Filters by user, supports pagination

---

### JwtTokenProvider / JwtUtil
```java
// Located in: com.indicab.util.JwtUtil
// Or: com.indicab.service.JwtTokenProvider (depending on implementation)

String generateToken(UserDetails userDetails);
String getUsernameFromToken(String token);
boolean validateToken(String token);
Date getExpirationDateFromToken(String token);
boolean isTokenExpired(String token);
```

**JWT Configuration:**
- **Secret:** Set via `JWT_SECRET` env variable (min 32 chars)
- **Access Token Expiry:** 15 minutes (900 seconds)
- **Refresh Token Expiry:** 7 days (604800 seconds)
- **Algorithm:** HS512 (HMAC with SHA-512)
- **Claims:** username, roles, issued-at, expires-at

---

### RefreshTokenService
```java
RefreshToken createRefreshToken(Long userId);
Optional<RefreshToken> findByToken(String token);
boolean isTokenExpired(RefreshToken token);
void deleteByUser(User user);
void deleteExpiredTokens();
```

**Logic:**
- One refresh token per user
- Replaces old token on new refresh
- Automatic cleanup of expired tokens recommended

---

### AuditLoggingService
```java
void logBulkOperation(Long adminId, String action, String entityType, 
                     List<Long> entityIds, String ipAddress, String details);
void logFailedBulkOperation(Long adminId, String action, String entityType, 
                           List<Long> entityIds, String ipAddress, String error);
```

**Logged Information:**
- Admin ID who performed action
- Action type (DELETE, UPDATE_ROLE, etc.)
- Entity type (USER, BOOKING, etc.)
- Entity IDs affected
- Admin's IP address
- Operation details
- Success/Failure status

---

## 🔐 Configuration & Security

### Security Configuration
```java
// Located in: com.indicab.config.SecurityConfig

@Configuration
@EnableWebSecurity
public class SecurityConfig {
  - JWT authentication filter
  - CORS configuration
  - HTTP security rules
  - Method-level @PreAuthorize enforcement
  - Password encoder (bcrypt)
  - Authentication manager
}
```

**Key Security Features:**
- **JWT Bearer Token:** All authenticated endpoints require `Authorization: Bearer {token}`
- **Role-Based Access:** `@PreAuthorize("hasRole('ADMIN')")`
- **CORS:** Configured for frontend origins (localhost:5173, etc.)
- **Password Encoding:** Bcrypt with strength 10
- **Token Validation:** Server-side JWT validation on each request

---

### CORS Configuration
```properties
cors.allowed-origins=http://localhost:5173,http://localhost:5174,https://yourdomain.com
```

**Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS  
**Allowed Headers:** Content-Type, Authorization  
**Credentials:** Allow cookies/credentials

---

### Database Connection Pool
```properties
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=1200000
```

**Pool Sizing:**
- 10 max connections (tuned for VPS)
- 5 minimum idle connections
- 20 second connection timeout
- 5 minute idle timeout
- 20 minute max connection lifetime

---

### Error Handling
```java
// Located in: com.indicab.config.GlobalExceptionHandler

@RestControllerAdvice
public class GlobalExceptionHandler {
  - Handles @Valid validation errors
  - Catches IllegalArgumentException
  - Catches EntityNotFoundException
  - Returns structured error responses
}
```

**Error Response Format:**
```json
{
  "statusCode": 400,
  "message": "Error description",
  "details": ["field1 is required"],
  "timestamp": "2026-03-15T10:30:00"
}
```

---

## 📊 Key Statistics

- **Total API Endpoints:** 50+ REST endpoints
- **Authenticated Endpoints:** 45+ (require JWT)
- **Public Endpoints:** 5+ (guest booking, ride tracking, etc.)
- **Controllers:** 25 (main controllers listed above)
- **Services:** 9 core services
- **Database Tables:** 14+ (users, bookings, refresh_token, audit_log, etc.)
- **Indexes:** 20+ for query optimization

---

## 🚀 Deployment Checklist

- [ ] JWT_SECRET set to random 64+ character string
- [ ] DATABASE_URL configured for MySQL
- [ ] CORS_ALLOWED_ORIGINS updated for production domain
- [ ] Database migrations applied (Flyway)
- [ ] Redis configured (optional but recommended)
- [ ] SSL/TLS certificate configured
- [ ] Actuator endpoints restricted (/health, /metrics only)
- [ ] Error stacktrace disabled in production
- [ ] Logging levels set to INFO
- [ ] Connection pool tuned for traffic expectations

---

## 📝 API Testing

### Using Swagger UI
- **URL:** `http://localhost:8000/api/v1/swagger-ui.html`
- **OpenAPI Docs:** `http://localhost:8000/api/v1/docs`
- All endpoints documented with request/response examples

### Using cURL
```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get user profile (with token)
curl -X GET http://localhost:8000/api/v1/users/profile \
  -H "Authorization: Bearer {accessToken}"
```

### Using Postman
1. Import OpenAPI spec from `/api/v1/docs`
2. Set `jwt_token` variable after login
3. Use `{{jwt_token}}` in Authorization header
4. Test endpoints with sample data

---

## 🔗 Related Documentation

- **Database Migrations:** See `indicab-backend/src/main/resources/db/migration/`
- **Frontend Integration:** See `indicab-frontend/docs/API_INTEGRATION.md`
- **WebSocket Events:** See `WEBSOCKET_GUIDE.md`
- **Deployment Guide:** See `agents.md` - DevOps Quick Reference
- **Project Status:** See `agents.md` - Active Issues Queue

---

**End of Backend API Reference**

*For questions or issues, check agents.md ACTIVE ISSUES QUEUE or contact Database Engineer*
