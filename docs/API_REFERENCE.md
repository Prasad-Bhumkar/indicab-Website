# IndiCab - Complete API Reference

**Last Updated:** February 22, 2026  
**Base URL:** `http://localhost:8000/api/v1` (Development) | `https://api.indicab.com/api/v1` (Production)  
**API Version:** 1.0  
**Authentication:** JWT Bearer Token

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication Endpoints](#authentication-endpoints)
3. [User Endpoints](#user-endpoints)
4. [Booking Endpoints](#booking-endpoints)
5. [Driver Endpoints](#driver-endpoints)
6. [Route Endpoints](#route-endpoints)
7. [Vehicle Endpoints](#vehicle-endpoints)
8. [Admin Endpoints](#admin-endpoints)
9. [WebSocket Endpoints](#websocket-endpoints)
10. [Response Format](#response-format)
11. [Error Handling](#error-handling)

---

## Overview

### API Characteristics
- **Style:** RESTful API following REST principles
- **Data Format:** JSON for request and response bodies
- **Authentication:** JWT Bearer tokens in Authorization header
- **Rate Limiting:** 100 requests/second per user
- **Response Pagination:** Supports page, size, sort parameters
- **CORS:** Enabled for frontend domains

### Common Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
```

### Response Pagination

Available on list endpoints (GET requests returning multiple records):

```
Query Parameters:
- page=0              → Page number (0-indexed, default: 0)
- size=20             → Records per page (default: 20, max: 100)
- sort=id,desc        → Sort field and direction (default: id,desc)

Example:
GET /api/v1/bookings?page=0&size=10&sort=created_at,desc
```

---

## Authentication Endpoints

### 1. User Login

```http
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "9876543210",
    "role": "CUSTOMER",
    "profileImageUrl": "https://..."
  }
}

Error Response: 401 Unauthorized
{
  "success": false,
  "error": "Invalid email or password",
  "status": 401,
  "timestamp": "2026-02-22T10:30:00Z"
}
```

**Token Details:**
- **Access Token:** Expires in 15 minutes (900 seconds)
- **Refresh Token:** Expires in 7 days (604800 seconds)
- **Storage:** localStorage (frontend)

---

### 2. User Registration

```http
POST /auth/register
Content-Type: application/json

Request Body:
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword123",
  "phone": "9876543210",
  "role": "CUSTOMER"
}

Response: 201 Created
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "user": {
    "id": 2,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9876543210",
    "role": "CUSTOMER"
  }
}

Error Response: 400 Bad Request
{
  "success": false,
  "error": "User with email already exists",
  "status": 400
}
```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

---

### 3. Admin Login

```http
POST /auth/admin-login
Content-Type: application/json

Request Body:
{
  "email": "admin@example.com",
  "password": "adminPassword123"
}

Response: 200 OK
{
  "success": true,
  "token": "...",
  "refreshToken": "...",
  "user": {
    "id": 5,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}

Error Response: 403 Forbidden
{
  "success": false,
  "error": "User is not an admin",
  "status": 403
}
```

---

### 4. Refresh Token

```http
POST /auth/refresh-token
Content-Type: application/json

Request Body:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response: 200 OK
{
  "success": true,
  "token": "new_access_token...",
  "refreshToken": "new_refresh_token..."
}

Error Response: 401 Unauthorized
{
  "success": false,
  "error": "Refresh token expired or invalid",
  "status": 401
}
```

---

### 5. Logout

```http
POST /auth/logout
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Endpoints

### 1. Get Current User Profile

```http
GET /users/profile
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "9876543210",
    "address": "123 Main St, Mumbai",
    "role": "CUSTOMER",
    "profileImageUrl": "https://...",
    "isActive": true,
    "isVerified": true,
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

---

### 2. Update User Profile

```http
PUT /users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "name": "John Doe Updated",
  "phone": "9876543210",
  "address": "456 New Street, Mumbai",
  "profileImageUrl": "https://..."
}

Response: 200 OK
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "name": "John Doe Updated",
    ...
  }
}
```

---

### 3. Change Password

```http
PUT /users/change-password
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "oldPassword": "currentPassword123",
  "newPassword": "newPassword123"
}

Response: 200 OK
{
  "success": true,
  "message": "Password changed successfully"
}

Error Response: 400 Bad Request
{
  "success": false,
  "error": "Old password is incorrect"
}
```

---

### 4. Upload Profile Image

```http
POST /users/upload-profile-image
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Body:
profile_image: <file>

Response: 200 OK
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "https://..."
  }
}
```

---

## Booking Endpoints

### 1. Create Booking

```http
POST /bookings
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "sourceLocation": "Mumbai Central",
  "destinationLocation": "Pune Station",
  "pickupTime": "2026-02-23T10:30:00Z",
  "estimatedDistance": 150.5,
  "paymentMethod": "CASH",
  "notes": "Please call before arrival"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 1,
    "bookingNumber": "BK-20260222-001",
    "userId": 1,
    "sourceLocation": "Mumbai Central",
    "destinationLocation": "Pune Station",
    "pickupTime": "2026-02-23T10:30:00Z",
    "status": "PENDING",
    "baseFare": 100,
    "totalFare": 500,
    "paymentStatus": "PENDING",
    "createdAt": "2026-02-22T10:30:00Z"
  }
}
```

---

### 2. Get Bookings List

```http
GET /bookings?page=0&size=20&sort=createdAt,desc
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "bookingNumber": "BK-20260222-001",
      "sourceLocation": "Mumbai Central",
      "destinationLocation": "Pune Station",
      "status": "COMPLETED",
      "totalFare": 500,
      "createdAt": "2026-02-22T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 0,
    "totalPages": 5,
    "totalItems": 100,
    "pageSize": 20
  }
}
```

---

### 3. Get Booking Details

```http
GET /bookings/{bookingId}
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "bookingNumber": "BK-20260222-001",
    "userId": 1,
    "driverId": 3,
    "sourceLocation": "Mumbai Central",
    "destinationLocation": "Pune Station",
    "pickupTime": "2026-02-23T10:30:00Z",
    "estimatedArrivalTime": "2026-02-23T12:30:00Z",
    "actualArrivalTime": null,
    "status": "PENDING",
    "baseFare": 100,
    "distanceCharge": 300,
    "totalFare": 500,
    "paymentMethod": "CASH",
    "paymentStatus": "PENDING",
    "driver": {
      "id": 3,
      "name": "Driver Name",
      "rating": 4.5,
      "totalTrips": 250
    },
    "createdAt": "2026-02-22T10:30:00Z"
  }
}
```

---

### 4. Cancel Booking

```http
DELETE /bookings/{bookingId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "cancellationReason": "Changed my schedule"
}

Response: 200 OK
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "id": 1,
    "status": "CANCELLED",
    "cancellationReason": "Changed my schedule"
  }
}
```

---

### 5. Rate Booking

```http
POST /bookings/{bookingId}/rate
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "rating": 5,
  "feedback": "Great ride, driver was very friendly"
}

Response: 200 OK
{
  "success": true,
  "message": "Booking rated successfully",
  "data": {
    "id": 1,
    "passengerRating": 5,
    "passengerFeedback": "Great ride, driver was very friendly"
  }
}
```

---

## Driver Endpoints

### 1. Register as Driver

```http
POST /drivers/register
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "licenseNumber": "DL123456",
  "licenseExpiryDate": "2030-12-31",
  "bankAccountNumber": "123456789012",
  "bankIfscCode": "HDFC0001234"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 3,
    "userId": 2,
    "licenseNumber": "DL123456",
    "status": "PENDING",
    "rating": 0,
    "totalTrips": 0,
    "createdAt": "2026-02-22T10:30:00Z"
  }
}
```

---

### 2. Get Driver Profile

```http
GET /drivers/{driverId}
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Driver Name",
    "email": "driver@example.com",
    "phone": "9876543210",
    "licenseNumber": "DL123456",
    "status": "APPROVED",
    "rating": 4.7,
    "totalTrips": 250,
    "completedTrips": 248,
    "vehicleId": 1,
    "vehicleName": "Economy Sedan",
    "isActive": true,
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

---

### 3. Update Driver Location

```http
POST /drivers/{driverId}/update-location
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "latitude": 19.0760,
  "longitude": 72.8777
}

Response: 200 OK
{
  "success": true,
  "message": "Location updated successfully"
}
```

---

### 4. Get Assigned Bookings

```http
GET /drivers/assignments?status=PENDING
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "bookingNumber": "BK-20260222-001",
      "passengerName": "John Doe",
      "sourceLocation": "Mumbai Central",
      "destinationLocation": "Pune Station",
      "pickupTime": "2026-02-23T10:30:00Z",
      "status": "ACCEPTED"
    }
  ]
}
```

---

### 5. Accept Booking Assignment

```http
POST /drivers/accept-booking/{bookingId}
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "message": "Booking accepted successfully",
  "data": {
    "id": 1,
    "status": "ACCEPTED"
  }
}
```

---

### 6. Update Booking Status

```http
PATCH /drivers/bookings/{bookingId}/status
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "status": "IN_PROGRESS"
}

Allowed Status Transitions:
PENDING → ACCEPTED
ACCEPTED → IN_PROGRESS
IN_PROGRESS → COMPLETED
Any Status → CANCELLED

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "status": "IN_PROGRESS"
  }
}
```

---

## Route Endpoints

### 1. Get Popular Routes

```http
GET /routes?page=0&size=10
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sourceCity": "Mumbai",
      "destinationCity": "Pune",
      "distanceKm": 150.5,
      "estimatedDurationMinutes": 180,
      "baseFare": 100,
      "perKmCharge": 2.5,
      "popularityScore": 850,
      "totalBookings": 5000,
      "isActive": true
    }
  ]
}
```

---

### 2. Search Routes

```http
GET /routes/search?from=Mumbai&to=Pune
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sourceCity": "Mumbai",
      "destinationCity": "Pune",
      "distanceKm": 150.5,
      "baseFare": 100,
      "perKmCharge": 2.5
    }
  ]
}
```

---

### 3. Calculate Fare

```http
POST /routes/calculate-fare
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "sourceLocation": "Mumbai Central",
  "destinationLocation": "Pune Station",
  "vehicleType": "ECONOMY",
  "distance": 150.5
}

Response: 200 OK
{
  "success": true,
  "data": {
    "baseFare": 100,
    "distanceCharge": 376.25,
    "surcharge": 0,
    "totalFare": 476.25,
    "estimatedDuration": "180 minutes"
  }
}
```

---

## Vehicle Endpoints

### 1. Get Available Vehicles

```http
GET /vehicles?isActive=true
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Economy Sedan",
      "vehicleType": "ECONOMY",
      "seatCapacity": 4,
      "priceMultiplier": 1.0,
      "imageUrl": "https://...",
      "description": "Affordable and comfortable",
      "isActive": true
    },
    {
      "id": 2,
      "name": "Premium SUV",
      "vehicleType": "PREMIUM",
      "seatCapacity": 6,
      "priceMultiplier": 1.5,
      "imageUrl": "https://...",
      "isActive": true
    }
  ]
}
```

---

### 2. Get Vehicle Details

```http
GET /vehicles/{vehicleId}
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Economy Sedan",
    "vehicleType": "ECONOMY",
    "registrationNumber": "MH-01-AB-1234",
    "seatCapacity": 4,
    "luggageCapacity": 50,
    "priceMultiplier": 1.0,
    "manufacturer": "Toyota",
    "model": "Fortuner",
    "yearOfManufacture": 2023,
    "isActive": true
  }
}
```

---

## Admin Endpoints

⚠️ **Note:** All admin endpoints require `Authorization: Bearer <admin_jwt_token>` and admin role

### 1. Get Dashboard Overview

```http
GET /admin/dashboard/overview
Authorization: Bearer <admin_jwt_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "totalUsers": 1500,
    "totalDrivers": 350,
    "totalBookings": 25000,
    "completedBookings": 24500,
    "totalRevenue": 1250000,
    "averageRating": 4.6,
    "activeRides": 45,
    "pendingApprovals": 12
  }
}
```

---

### 2. User Management

#### 2.1 Get All Users
```http
GET /admin/users?page=0&size=20&sort=createdAt,desc&search=john
Authorization: Bearer <admin_jwt_token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "phone": "9876543210",
      "role": "CUSTOMER",
      "isActive": true,
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 0,
    "totalPages": 1,
    "totalItems": 1,
    "pageSize": 20
  }
}
```

**Query Parameters:**
- `search` (optional): Search by name or email
- `email` (optional): Filter by exact email
- `role` (optional): Filter by role (CUSTOMER, DRIVER, ADMIN)
- `page`, `size`, `sort`: Standard pagination parameters

#### 2.2 Update User Status
```http
PATCH /admin/users/{userId}/status
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

Request Body:
{
  "isActive": false,
  "reason": "Suspicious activity detected"
}

Response: 200 OK
{
  "success": true,
  "message": "User status updated",
  "data": {
    "id": 1,
    "isActive": false
  }
}
```

#### 2.3 Delete User
```http
DELETE /admin/users/{userId}
Authorization: Bearer <admin_jwt_token>

Response: 200 OK
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### 3. Driver Management

#### 3.1 Get All Drivers
```http
GET /admin/drivers?page=0&size=20&status=PENDING&search=driver
Authorization: Bearer <admin_jwt_token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 3,
      "name": "Driver Name",
      "email": "driver@example.com",
      "licenseNumber": "DL123456",
      "status": "PENDING",
      "rating": 0,
      "totalTrips": 0
    }
  ],
  "pagination": {
    "currentPage": 0,
    "totalPages": 1,
    "totalItems": 1,
    "pageSize": 20
  }
}
```

**Query Parameters:**
- `search` (optional): Search by name or email
- `status` (optional): Filter by status (PENDING, APPROVED, REJECTED)
- `page`, `size`, `sort`: Standard pagination parameters

#### 3.2 Approve Driver
```http
PATCH /admin/drivers/{driverId}/approve
Authorization: Bearer <admin_jwt_token>

Response: 200 OK
{
  "success": true,
  "message": "Driver approved successfully",
  "data": {
    "id": 3,
    "status": "APPROVED"
  }
}
```

#### 3.3 Reject Driver
```http
PATCH /admin/drivers/{driverId}/reject
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

Request Body:
{
  "rejectionReason": "Invalid license number"
}

Response: 200 OK
{
  "success": true,
  "message": "Driver rejected",
  "data": {
    "id": 3,
    "status": "REJECTED",
    "rejectionReason": "Invalid license number"
  }
}
```

---

### 4. Booking Management

#### 4.1 Get All Bookings (Admin View)
```http
GET /admin/bookings?page=0&size=20&status=COMPLETED&search=mumbai
Authorization: Bearer <admin_jwt_token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "bookingNumber": "BK-20260222-001",
      "passengerName": "John Doe",
      "driverName": "Driver Name",
      "totalFare": 500,
      "status": "COMPLETED",
      "createdAt": "2026-02-22T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 0,
    "totalPages": 1,
    "totalItems": 1,
    "pageSize": 20
  }
}
```

**Query Parameters:**
- `search` (optional): Search in pickup/dropoff locations
- `status` (optional): Filter by booking status
- `userId` (optional): Filter by passenger ID
- `page`, `size`, `sort`: Standard pagination parameters

#### 4.2 Update Booking Status
```http
PATCH /admin/bookings/{bookingId}/status
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

Request Body:
{
  "status": "CANCELLED",
  "reason": "Driver no-show"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "status": "CANCELLED"
  }
}
```

---

### 5. Blog Management

#### 5.1 Create Blog Post
```http
POST /admin/blogs
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

Request Body:
{
  "title": "Travel Tips for Summer",
  "slug": "travel-tips-summer",
  "content": "<p>...</p>",
  "excerpt": "Best practices for summer travel",
  "status": "DRAFT",
  "metaTitle": "Travel Tips",
  "metaDescription": "Summer travel guide"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Travel Tips for Summer",
    "slug": "travel-tips-summer",
    "status": "DRAFT",
    "createdAt": "2026-02-22T10:30:00Z"
  }
}
```

#### 5.2 Get All Blogs
```http
GET /admin/blogs?page=0&size=20&status=PUBLISHED&search=travel
Authorization: Bearer <admin_jwt_token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Travel Tips for Summer",
      "slug": "travel-tips-summer",
      "status": "PUBLISHED",
      "viewCount": 1500,
      "publishedAt": "2026-02-20T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 0,
    "totalPages": 1,
    "totalItems": 1,
    "pageSize": 20
  }
}
```

**Query Parameters:**
- `search` (optional): Search in title or content
- `status` (optional): Filter by blog status (DRAFT, PUBLISHED, ARCHIVED)
- `orderBy`, `orderDirection`: Custom sorting parameters (alternative to `sort`)
- `page`, `size`, `sort`: Standard pagination parameters

#### 5.3 Update Blog
```http
PUT /admin/blogs/{blogId}
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

Request Body:
{
  "title": "Updated Title",
  "content": "<p>Updated content</p>",
  "status": "PUBLISHED"
}

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

#### 5.4 Delete Blog
```http
DELETE /admin/blogs/{blogId}
Authorization: Bearer <admin_jwt_token>

Response: 200 OK
{
  "success": true,
  "message": "Blog deleted successfully"
}
```

---

### 6. Analytics Endpoints

#### 6.1 Get Booking Analytics
```http
GET /admin/analytics/bookings?from=2026-02-01&to=2026-02-22
Authorization: Bearer <admin_jwt_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "totalBookings": 1500,
    "completedBookings": 1450,
    "cancelledBookings": 50,
    "totalRevenue": 750000,
    "averageBookingValue": 500,
    "dailyData": [
      {
        "date": "2026-02-22",
        "bookings": 50,
        "revenue": 25000
      }
    ]
  }
}
```

#### 6.2 Get Driver Analytics
```http
GET /admin/analytics/drivers?from=2026-02-01&to=2026-02-22
Authorization: Bearer <admin_jwt_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "totalDrivers": 350,
    "activeDrivers": 300,
    "avgRating": 4.6,
    "topDrivers": [
      {
        "id": 3,
        "name": "Top Driver",
        "rating": 4.9,
        "completedTrips": 500
      }
    ]
  }
}
```

---

## WebSocket Endpoints

### Connection
```javascript
// Frontend connection
const stompClient = new StompJs.Client({
  brokerURL: 'ws://localhost:8000/ws/ride',
  connectHeaders: {
    Authorization: `Bearer ${jwt_token}`
  }
});

stompClient.onConnect = (frame) => {
  // Subscribe to ride updates
  stompClient.subscribe(`/topic/ride/{rideId}`, (message) => {
    console.log(JSON.parse(message.body));
  });
};

stompClient.activate();
```

### Topics Available

**Ride Tracking (Real-time):**
```
/topic/ride/{rideId}
- Driver location updates
- Booking status changes
- ETA updates
```

**Admin Updates (Admin Dashboard):**
```
/topic/admin/bookings      - New bookings notification
/topic/admin/drivers       - Driver status updates
/topic/admin/users         - User activities
/topic/admin/dashboard     - Dashboard metrics update
```

### Example WebSocket Messages

```json
// Ride Update
{
  "rideId": 1,
  "status": "IN_PROGRESS",
  "driverLatitude": 19.0760,
  "driverLongitude": 72.8777,
  "estimatedArrival": "2026-02-23T10:45:00Z",
  "distance": 2.5
}

// Admin Notification
{
  "type": "BOOKING_CREATED",
  "bookingId": 1,
  "bookingNumber": "BK-20260222-001",
  "timestamp": "2026-02-22T10:30:00Z"
}
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Example",
    ...
  },
  "message": "Operation successful",
  "timestamp": "2026-02-22T10:30:00Z"
}
```

### Success List Response

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "currentPage": 0,
    "totalPages": 5,
    "totalItems": 100,
    "pageSize": 20,
    "hasNext": true,
    "hasPrevious": false
  },
  "timestamp": "2026-02-22T10:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "status": 400,
  "path": "/api/v1/endpoint",
  "timestamp": "2026-02-22T10:30:00Z",
  "details": {
    "field": ["error message"]
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Common Cause |
|------|---------|------------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input, validation error |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | User lacks required permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists or state conflict |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

### Error Codes

```
// Authentication
AUTH_001 - Invalid credentials
AUTH_002 - Token expired
AUTH_003 - Token invalid

// Validation
VAL_001 - Email already exists
VAL_002 - Invalid email format
VAL_003 - Password too weak

// Not Found
NOT_FOUND_001 - User not found
NOT_FOUND_002 - Booking not found
NOT_FOUND_003 - Driver not found

// Business Logic
BUS_001 - Cannot cancel completed booking
BUS_002 - Driver not approved
BUS_003 - No vehicles available
```

---

## Rate Limiting

```
Default Limits:
- General API: 100 requests/second per user
- Authentication: 10 login attempts/minute per IP
- File Upload: 5MB max file size

Rate Limit Headers:
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1645423200

Error Response (429):
{
  "success": false,
  "error": "Rate limit exceeded. Try again after 60 seconds",
  "retryAfter": 60
}
```

---

## Testing API with Postman

1. **Import Collection:** Use the Postman collection file (if available)
2. **Set Variables:**
   - `base_url` = http://localhost:8000/api/v1
   - `token` = Your JWT token (obtained from login)
3. **Test Endpoints:** Start with login, then test other endpoints

**Example Login Request:**
```
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## API Documentation Tool

Interactive API documentation available at:
- **Development:** http://localhost:8000/api/v1/swagger-ui.html
- **Production:** https://api.indicab.com/api/v1/swagger-ui.html

---

## Related Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - System design and architecture
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Database structure
- [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) - Local development setup
- [agents.md](agents.md) - Development tasks and roadmap

---

**Last Updated:** February 22, 2026  
**Version:** 1.0  
**Status:** Complete
