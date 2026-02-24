# Admin API Reference Documentation

## Overview
This document provides a comprehensive reference for all admin endpoints in the IndiCab platform. All endpoints require `ADMIN` role authorization and JWT Bearer token authentication.

**Base URL:** `/api/v1`  
**Authentication:** Bearer Token (JWT)  
**Required Role:** ADMIN

---

## Authentication

### Admin Login
```
POST /auth/admin-login
Content-Type: application/json

{
  "email": "admin@indicab.com",
  "password": "password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@indicab.com",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

---

## Dashboard Management

### Get Dashboard Overview
```
GET /admin/dashboard/overview
Authorization: Bearer {token}

Response: {
  "timestamp": "2024-01-15T10:30:00",
  "users": {
    "total": 1500,
    "drivers": 450,
    "riders": 1050
  },
  "bookings": {
    "total": 5000,
    "pending": 250,
    "confirmed": 4000,
    "pendingPercentage": 5.0
  },
  "auditLogs": {
    "total": 10000,
    "failedOperations": 15,
    "failurePercentage": 0.15
  }
}
```

---

## User Management

### Get All Users (Paginated)
```
GET /admin/users?page=0&size=10&sort=name,asc
Authorization: Bearer {token}

Query Parameters:
- page: Page number (0-indexed)
- size: Page size (default: 10)
- sort: Sort field and direction (e.g., name,asc or email,desc)

Response: {
  "content": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "role": "USER",
      "status": "active",
      "createdAt": "2024-01-01T10:00:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 150,
  "totalPages": 15
}
```

### Get User by ID
```
GET /admin/user/{id}
Authorization: Bearer {token}

Response: {
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "role": "USER",
  "status": "active"
}
```

### Create User
```
POST /admin/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "9876543211",
  "password": "SecurePassword123!",
  "role": "USER",
  "status": "active"
}

Response: {
  "id": 151,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "9876543211",
  "role": "USER",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00"
}
```

### Update User
```
PUT /admin/users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Jane Smith Updated",
  "phone": "9876543212",
  "status": "active"
}

Response: {
  "id": 151,
  "name": "Jane Smith Updated",
  "email": "jane@example.com",
  "phone": "9876543212",
  "status": "active"
}
```

### Delete User
```
DELETE /admin/users/{id}
Authorization: Bearer {token}

Response: {
  "message": "User deleted successfully",
  "status": 200
}
```

### Bulk Delete Users
```
DELETE /admin/users/bulk
Authorization: Bearer {token}
Content-Type: application/json

{
  "ids": [1, 2, 3, 4, 5]
}

Response: {
  "deletedCount": 5,
  "message": "Users deleted successfully"
}
```

### Bulk Update User Roles
```
PUT /admin/users/bulk/role?role=DRIVER
Authorization: Bearer {token}
Content-Type: application/json

{
  "ids": [1, 2, 3]
}

Response: {
  "updatedCount": 3,
  "message": "User roles updated successfully"
}
```

---

## Driver Management

### Get All Drivers (Paginated)
```
GET /admin/drivers?page=0&size=10
Authorization: Bearer {token}

Response: {
  "content": [
    {
      "id": 1,
      "name": "Driver Name",
      "email": "driver@example.com",
      "phone": "9876543210",
      "licenseNumber": "DL1234567",
      "status": "approved",
      "approvedAt": "2024-01-01T10:00:00",
      "rating": 4.8
    }
  ],
  "totalElements": 450,
  "totalPages": 45
}
```

### Get Driver by ID
```
GET /admin/drivers/{id}
Authorization: Bearer {token}
```

### Create Driver
```
POST /admin/drivers
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Driver",
  "email": "newdriver@example.com",
  "phone": "9876543210",
  "licenseNumber": "DL7654321",
  "password": "SecurePass123!"
}
```

### Update Driver
```
PUT /admin/drivers/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "9876543211",
  "licenseNumber": "DL1234568"
}
```

### Delete Driver
```
DELETE /admin/drivers/{id}
Authorization: Bearer {token}
```

### Approve Driver
```
PUT /admin/drivers/{id}/approve
Authorization: Bearer {token}

Response: {
  "message": "Driver approved successfully",
  "status": "approved",
  "approvedAt": "2024-01-15T10:30:00"
}
```

### Reject Driver
```
PUT /admin/drivers/{id}/reject
Authorization: Bearer {token}
Content-Type: application/json

{
  "rejectionReason": "License verification failed"
}

Response: {
  "message": "Driver rejected successfully",
  "status": "rejected",
  "rejectionReason": "License verification failed"
}
```

### Bulk Delete Drivers
```
DELETE /admin/drivers/bulk
Authorization: Bearer {token}
Content-Type: application/json

{
  "ids": [1, 2, 3]
}
```

---

## Booking Management

### Get All Bookings (Paginated)
```
GET /admin/bookings?page=0&size=10&status=PENDING
Authorization: Bearer {token}

Query Parameters:
- page: Page number
- size: Page size
- status: Filter by status (PENDING, CONFIRMED, COMPLETED, CANCELLED)

Response: {
  "content": [
    {
      "id": 1,
      "userId": 101,
      "from": "Mumbai Central",
      "to": "Mumbai Airport",
      "status": "PENDING",
      "price": 450.00,
      "paymentStatus": "PENDING",
      "createdAt": "2024-01-15T09:00:00"
    }
  ],
  "totalElements": 5000,
  "totalPages": 500
}
```

### Get Booking by ID
```
GET /admin/bookings/{id}
Authorization: Bearer {token}
```

### Update Booking Status
```
PUT /admin/bookings/{id}/status?status=CONFIRMED
Authorization: Bearer {token}

Response: {
  "id": 1,
  "status": "CONFIRMED",
  "updatedAt": "2024-01-15T10:30:00"
}
```

### Cancel Booking
```
PUT /admin/bookings/{id}/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "User requested cancellation"
}

Response: {
  "message": "Booking cancelled successfully",
  "status": "CANCELLED",
  "refundAmount": 450.00
}
```

### Delete Booking
```
DELETE /admin/bookings/{id}
Authorization: Bearer {token}
```

### Bulk Delete Bookings
```
DELETE /admin/bookings/bulk
Authorization: Bearer {token}
Content-Type: application/json

{
  "ids": [1, 2, 3, 4, 5]
}
```

### Bulk Update Booking Status
```
PUT /admin/bookings/bulk/status?status=CONFIRMED
Authorization: Bearer {token}
Content-Type: application/json

{
  "ids": [1, 2, 3]
}
```

### Get Booking Statistics
```
GET /admin/bookings/stats/overview
Authorization: Bearer {token}

Response: {
  "totalBookings": 5000,
  "pendingBookings": 250,
  "completedBookings": 4500,
  "cancelledBookings": 250,
  "totalRevenue": 2250000.00,
  "averagePrice": 450.00
}
```

---

## Blog Management

### Get All Blogs (Paginated)
```
GET /admin/blogs?page=0&size=10
Authorization: Bearer {token}

Response: {
  "content": [
    {
      "id": 1,
      "title": "IndiCab Safety Tips",
      "content": "Important safety guidelines...",
      "preview": "Learn how to stay safe...",
      "category": "Safety",
      "status": "published",
      "createdAt": "2024-01-10T10:00:00",
      "updatedAt": "2024-01-15T10:00:00"
    }
  ],
  "totalElements": 50,
  "totalPages": 5
}
```

### Get Blog by ID
```
GET /admin/blogs/{id}
Authorization: Bearer {token}
```

### Create Blog
```
POST /admin/blogs
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "New Travel Guide",
  "content": "Complete travel guide content...",
  "preview": "Preview of the guide...",
  "category": "Travel",
  "image": "https://example.com/image.jpg",
  "status": "draft"
}
```

### Update Blog
```
PUT /admin/blogs/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content...",
  "status": "published"
}
```

### Delete Blog
```
DELETE /admin/blogs/{id}
Authorization: Bearer {token}
```

### Publish Blog
```
PUT /admin/blogs/{id}/publish
Authorization: Bearer {token}

Response: {
  "message": "Blog published successfully",
  "status": "published",
  "publishedAt": "2024-01-15T10:30:00"
}
```

### Unpublish Blog
```
PUT /admin/blogs/{id}/unpublish
Authorization: Bearer {token}

Response: {
  "message": "Blog unpublished successfully",
  "status": "draft"
}
```

### Bulk Delete Blogs
```
DELETE /admin/blogs/bulk
Authorization: Bearer {token}
Content-Type: application/json

{
  "ids": [1, 2, 3]
}
```

---

## Package Management

### Get All Packages (Paginated)
```
GET /admin/packages?page=0&size=10
Authorization: Bearer {token}

Response: {
  "content": [
    {
      "id": 1,
      "name": "4-Hour City Rental",
      "type": "hourly",
      "baseFare": 1299.00,
      "duration": "4 hours",
      "validity": "Valid for 30 days",
      "discountPercentage": 13.5,
      "features": ["AC Vehicle", "Professional Driver", "Free Cancellation"],
      "status": "active"
    }
  ],
  "totalElements": 100,
  "totalPages": 10
}
```

### Get Package by ID
```
GET /admin/packages/{id}
Authorization: Bearer {token}
```

### Create Package
```
POST /admin/packages
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Premium Weekend Package",
  "type": "regional",
  "baseFare": 5999.00,
  "duration": "2 days",
  "validity": "Valid for 60 days",
  "description": "Perfect weekend getaway...",
  "discountPercentage": 15,
  "features": ["5-Star Hotel", "Meals Included", "Tour Guide"]
}
```

### Update Package
```
PUT /admin/packages/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Package Name",
  "baseFare": 6499.00,
  "discountPercentage": 20
}
```

### Delete Package
```
DELETE /admin/packages/{id}
Authorization: Bearer {token}
```

### Bulk Delete Packages
```
DELETE /admin/packages/bulk
Authorization: Bearer {token}
Content-Type: application/json

{
  "ids": [1, 2, 3]
}
```

---

## Vehicle Management

### Get All Vehicles (Paginated)
```
GET /admin/vehicles?page=0&size=10
Authorization: Bearer {token}

Response: {
  "content": [
    {
      "id": 1,
      "type": "Sedan",
      "baseFare": 50.00,
      "ratePerKm": 15.00,
      "perDayCharge": 800.00,
      "capacity": 4,
      "description": "Comfortable sedan for city rides",
      "status": "active"
    }
  ],
  "totalElements": 20,
  "totalPages": 2
}
```

### Get Vehicle by ID
```
GET /admin/vehicles/{id}
Authorization: Bearer {token}
```

### Create Vehicle
```
POST /admin/vehicles
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "SUV Premium",
  "baseFare": 75.00,
  "ratePerKm": 20.00,
  "perDayCharge": 1200.00,
  "capacity": 7,
  "description": "Luxury SUV for premium rides",
  "image": "https://example.com/suv.jpg"
}
```

### Update Vehicle
```
PUT /admin/vehicles/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "Updated Vehicle Type",
  "baseFare": 80.00,
  "ratePerKm": 22.00
}
```

### Delete Vehicle
```
DELETE /admin/vehicles/{id}
Authorization: Bearer {token}
```

### Bulk Delete Vehicles
```
DELETE /admin/vehicles/bulk
Authorization: Bearer {token}
Content-Type: application/json

{
  "ids": [1, 2, 3]
}
```

---

## Audit Logs

### Get Audit Logs (Paginated)
```
GET /admin/audit-logs?page=0&size=10
Authorization: Bearer {token}

Query Parameters:
- page: Page number
- size: Page size
- operation: Filter by operation (CREATE, UPDATE, DELETE)
- status: Filter by status (SUCCESS, FAILED)
- resourceType: Filter by resource type (USER, DRIVER, BOOKING, etc.)

Response: {
  "content": [
    {
      "id": 1,
      "adminId": 1,
      "action": "CREATE",
      "resourceType": "USER",
      "resourceId": 151,
      "details": "Created new user: jane@example.com",
      "status": "SUCCESS",
      "ipAddress": "192.168.1.100",
      "timestamp": "2024-01-15T10:30:00"
    }
  ],
  "totalElements": 10000,
  "totalPages": 1000
}
```

### Get Audit Logs for Specific User
```
GET /admin/audit-logs/user/{userId}
Authorization: Bearer {token}
```

### Get Audit Log Statistics
```
GET /admin/audit-logs/statistics
Authorization: Bearer {token}

Response: {
  "totalLogs": 10000,
  "successfulOperations": 9985,
  "failedOperations": 15,
  "operationBreakdown": {
    "CREATE": 3000,
    "UPDATE": 5000,
    "DELETE": 2000
  },
  "resourceBreakdown": {
    "USER": 4000,
    "DRIVER": 2000,
    "BOOKING": 3000,
    "BLOG": 1000
  }
}
```

---

## Analytics

### Get Analytics Dashboard
```
GET /admin/analytics
Authorization: Bearer {token}

Response: {
  "period": "7_DAYS",
  "data": {
    "dailyBookings": [
      { "date": "2024-01-09", "count": 250, "revenue": 112500 },
      { "date": "2024-01-10", "count": 280, "revenue": 126000 }
    ],
    "topDrivers": [
      { "id": 1, "name": "Driver 1", "bookings": 150, "revenue": 67500 },
      { "id": 2, "name": "Driver 2", "bookings": 140, "revenue": 63000 }
    ],
    "vehicleDistribution": [
      { "type": "Sedan", "count": 800, "percentage": 40 },
      { "type": "SUV", "count": 600, "percentage": 30 }
    ]
  }
}
```

---

## Real-Time WebSocket Updates

### Connection
```
WebSocket URL: /api/ws/admin
Headers: {
  "Authorization": "Bearer {token}"
}
```

### Topics
Admin subscribers can listen to the following STOMP topics:

- `/topic/admin/bookings` - Real-time booking updates
- `/topic/admin/drivers` - Real-time driver updates
- `/topic/admin/users` - Real-time user updates
- `/topic/admin/dashboard` - Real-time dashboard statistics
- `/topic/admin/audit-logs` - Real-time audit log events
- `/topic/admin/operations` - Real-time admin operation notifications

### Example Subscription (Frontend)
```javascript
// Subscribe to booking updates
stompClient.subscribe('/topic/admin/bookings', (message) => {
  const booking = JSON.parse(message.body);
  console.log('New booking:', booking);
});
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid input data",
  "status": 400
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid JWT token",
  "status": 401
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "User does not have ADMIN role",
  "status": 403
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found",
  "status": 404
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "status": 500
}
```

---

## Frontend Integration

The frontend uses `adminApi.js` helper to interact with these endpoints. Key methods:

- `adminApi.fetchUsersApi(params)`
- `adminApi.createUserApi(userData)`
- `adminApi.updateUserApi(id, userData)`
- `adminApi.deleteUserApi(id)`
- Similar methods for drivers, bookings, blogs, packages, vehicles, etc.

Frontend Redux `adminSlice.js` contains async thunks that dispatch these API calls and manage state.

---

## Best Practices

1. **Always include Bearer token** in Authorization header
2. **Validate inputs** using Yup schemas on frontend before sending
3. **Handle errors gracefully** with appropriate error messages
4. **Use pagination** for large datasets
5. **Log all admin operations** via audit logs
6. **Implement role-based access control** on both frontend and backend
7. **Use WebSocket subscriptions** for real-time updates
8. **Rate limit** admin operations in production

---

**Last Updated:** January 2024  
**Version:** 1.0
