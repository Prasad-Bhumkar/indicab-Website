# IndiCab API Reference - Admin Endpoints

## Overview

This document provides comprehensive API documentation for all admin endpoints with search, sorting, and pagination capabilities.

**Base URL:** `http://localhost:8000/api/v1`

**Authentication:** All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Admin User Management

### GET /admin/users
Retrieve all system users with pagination, sorting, and search filters.

**Parameters:**
- `page` (query, integer): Page number (0-indexed), default: 0
- `size` (query, integer): Page size, default: 20
- `sort` (query, string): Sort criteria (e.g., `email,asc` or `createdAt,desc`)
- `search` (query, string, optional): Search in name and email fields
- `email` (query, string, optional): Filter by exact email
- `role` (query, string, optional): Filter by role (USER, DRIVER, ADMIN)

**Example Request:**
```bash
GET /api/v1/admin/users?page=0&size=10&search=john&role=USER&sort=email,asc
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "phone": "9876543210",
      "address": "123 Main St",
      "createdAt": "2026-03-01T10:00:00",
      "updatedAt": "2026-03-03T15:30:00"
    }
  ],
  "number": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1,
  "hasNext": false,
  "hasPrevious": false
}
```

**Status Codes:**
- `200 OK`: Users retrieved successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### GET /admin/user/{id}
Retrieve a specific user by ID.

**Parameters:**
- `id` (path, long): User ID

**Example Request:**
```bash
GET /api/v1/admin/user/1
```

**Status Codes:**
- `200 OK`: User retrieved successfully
- `404 Not Found`: User not found
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### DELETE /admin/user/{id}
Delete a user by ID.

**Parameters:**
- `id` (path, long): User ID

**Status Codes:**
- `200 OK`: User deleted successfully
- `404 Not Found`: User not found
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### DELETE /admin/users/bulk
Delete multiple users at once.

**Request Body:**
```json
[1, 2, 3]
```

**Status Codes:**
- `204 No Content`: Users deleted successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

## Admin Booking Management

### GET /admin/bookings
Retrieve all bookings with pagination, sorting, and search filters.

**Parameters:**
- `page` (query, integer): Page number (0-indexed), default: 0
- `size` (query, integer): Page size, default: 20
- `sort` (query, string): Sort criteria (e.g., `createdAt,desc`)
- `search` (query, string, optional): Search in pickup and dropoff locations
- `status` (query, string, optional): Filter by status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
- `userId` (query, long, optional): Filter by user ID

**Example Request:**
```bash
GET /api/v1/admin/bookings?page=0&size=15&search=bangalore&status=PENDING&sort=createdAt,desc
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "user": { "id": 1, "name": "John Doe" },
      "status": "PENDING",
      "pickupAddress": "123 Main St",
      "dropoffAddress": "456 Park Ave",
      "amount": 500.00,
      "createdAt": "2026-03-03T10:00:00",
      "updatedAt": "2026-03-03T15:30:00"
    }
  ],
  "number": 0,
  "size": 15,
  "totalElements": 10,
  "totalPages": 1
}
```

**Status Codes:**
- `200 OK`: Bookings retrieved successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### GET /admin/bookings/{id}
Retrieve a specific booking by ID.

**Parameters:**
- `id` (path, long): Booking ID

**Status Codes:**
- `200 OK`: Booking retrieved successfully
- `404 Not Found`: Booking not found
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### PUT /admin/bookings/{id}/confirm
Confirm a booking and send confirmation email to customer.

**Parameters:**
- `id` (path, long): Booking ID

**Status Codes:**
- `200 OK`: Booking confirmed successfully
- `404 Not Found`: Booking not found
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### PUT /admin/bookings/{id}/cancel
Cancel a booking and send cancellation email to customer.

**Parameters:**
- `id` (path, long): Booking ID
- `reason` (query, string, optional): Cancellation reason

**Status Codes:**
- `200 OK`: Booking cancelled successfully
- `404 Not Found`: Booking not found
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### DELETE /admin/bookings/{id}
Delete a booking record permanently.

**Parameters:**
- `id` (path, long): Booking ID

**Status Codes:**
- `204 No Content`: Booking deleted successfully
- `404 Not Found`: Booking not found
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### DELETE /admin/bookings/bulk
Delete multiple bookings at once.

**Request Body:**
```json
[1, 2, 3]
```

**Status Codes:**
- `204 No Content`: Bookings deleted successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### PUT /admin/bookings/bulk/status
Update status for multiple bookings at once.

**Parameters:**
- `status` (query, string): New status (PENDING, CONFIRMED, COMPLETED, CANCELLED)

**Request Body:**
```json
[1, 2, 3]
```

**Status Codes:**
- `200 OK`: Bookings updated successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### GET /admin/bookings/stats/overview
Get booking statistics overview.

**Status Codes:**
- `200 OK`: Statistics retrieved successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

**Response:**
```json
{
  "totalBookings": 150,
  "pendingBookings": 25,
  "confirmedBookings": 100,
  "cancelledBookings": 25,
  "totalRevenue": 75000.00
}
```

---

## Admin Blog Management

### GET /admin/blogs
Retrieve all blogs with pagination, sorting, and search filters.

**Parameters:**
- `page` (query, integer): Page number (0-indexed), default: 0
- `size` (query, integer): Page size, default: 20
- `sort` (query, string): Sort criteria (e.g., `createdAt,desc`)
- `search` (query, string, optional): Search in title and content
- `status` (query, string, optional): Filter by status (DRAFT, PUBLISHED)

**Example Request:**
```bash
GET /api/v1/admin/blogs?page=0&size=10&search=travel&status=PUBLISHED&sort=createdAt,desc
```

**Status Codes:**
- `200 OK`: Blogs retrieved successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### GET /admin/blogs/drafts
Retrieve draft blogs only with optional search.

**Parameters:**
- `page` (query, integer): Page number (0-indexed), default: 0
- `size` (query, integer): Page size, default: 20
- `sort` (query, string): Sort criteria
- `search` (query, string, optional): Search in title and content

**Status Codes:**
- `200 OK`: Draft blogs retrieved successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### POST /admin/blogs
Create a new blog post.

**Request Body:**
```json
{
  "title": "Blog Title",
  "content": "Blog content...",
  "status": "DRAFT",
  "author": "Admin Name"
}
```

**Status Codes:**
- `201 Created`: Blog created successfully
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### GET /admin/blogs/{id}
Retrieve a specific blog by ID.

**Parameters:**
- `id` (path, long): Blog ID

**Status Codes:**
- `200 OK`: Blog retrieved successfully
- `404 Not Found`: Blog not found
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### PUT /admin/blogs/{id}
Update an existing blog post.

**Parameters:**
- `id` (path, long): Blog ID

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "status": "PUBLISHED"
}
```

**Status Codes:**
- `200 OK`: Blog updated successfully
- `404 Not Found`: Blog not found
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### DELETE /admin/blogs/{id}
Delete a blog post permanently.

**Parameters:**
- `id` (path, long): Blog ID

**Status Codes:**
- `204 No Content`: Blog deleted successfully
- `404 Not Found`: Blog not found
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### PUT /admin/blogs/{id}/publish
Publish a blog (change status to PUBLISHED).

**Parameters:**
- `id` (path, long): Blog ID

**Status Codes:**
- `200 OK`: Blog published successfully
- `404 Not Found`: Blog not found
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### PUT /admin/blogs/{id}/unpublish
Unpublish a blog (change status to DRAFT).

**Parameters:**
- `id` (path, long): Blog ID

**Status Codes:**
- `200 OK`: Blog unpublished successfully
- `404 Not Found`: Blog not found
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### DELETE /admin/blogs/bulk
Delete multiple blogs at once.

**Request Body:**
```json
[1, 2, 3]
```

**Status Codes:**
- `204 No Content`: Blogs deleted successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### PUT /admin/blogs/bulk/status
Update status for multiple blogs at once.

**Parameters:**
- `status` (query, string): New status (DRAFT, PUBLISHED)

**Request Body:**
```json
[1, 2, 3]
```

**Status Codes:**
- `200 OK`: Blogs updated successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

## Admin Driver Management

### GET /admin/drivers
Retrieve all drivers with pagination, sorting, and search filters.

**Parameters:**
- `page` (query, integer): Page number (0-indexed), default: 0
- `size` (query, integer): Page size, default: 20
- `sort` (query, string): Sort criteria
- `search` (query, string, optional): Search in driver name and email

**Example Request:**
```bash
GET /api/v1/admin/drivers?page=0&size=20&search=john&sort=name,asc
```

**Status Codes:**
- `200 OK`: Drivers retrieved successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### GET /admin/drivers/pending
Retrieve pending driver applications with pagination, sorting, and search filters.

**Parameters:**
- `page` (query, integer): Page number (0-indexed), default: 0
- `size` (query, integer): Page size, default: 20
- `sort` (query, string): Sort criteria
- `search` (query, string, optional): Search in driver name and email

**Status Codes:**
- `200 OK`: Pending applications retrieved successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### GET /admin/drivers/approved
Retrieve approved drivers with pagination, sorting, and search filters.

**Parameters:**
- `page` (query, integer): Page number (0-indexed), default: 0
- `size` (query, integer): Page size, default: 20
- `sort` (query, string): Sort criteria
- `search` (query, string, optional): Search in driver name and email

**Status Codes:**
- `200 OK`: Approved drivers retrieved successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### GET /admin/drivers/{id}
Retrieve a specific driver by ID.

**Parameters:**
- `id` (path, long): Driver ID

**Status Codes:**
- `200 OK`: Driver retrieved successfully
- `404 Not Found`: Driver not found
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### PUT /admin/drivers/{id}/review
Approve or reject a driver application.

**Parameters:**
- `id` (path, long): Driver ID

**Request Body:**
```json
{
  "status": "APPROVED",
  "comments": "License verified"
}
```

**Status Codes:**
- `200 OK`: Driver application reviewed successfully
- `404 Not Found`: Driver not found
- `400 Bad Request`: Invalid approval status
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### DELETE /admin/drivers/bulk
Delete multiple drivers at once.

**Request Body:**
```json
[1, 2, 3]
```

**Status Codes:**
- `204 No Content`: Drivers deleted successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

## Admin Package Management

### GET /admin/packages
Retrieve all packages with pagination, sorting, and search filters.

**Parameters:**
- `page` (query, integer): Page number (0-indexed), default: 0
- `size` (query, integer): Page size, default: 20
- `sort` (query, string): Sort criteria
- `search` (query, string, optional): Search in package name and description
- `isActive` (query, boolean, optional): Filter by active status
- `type` (query, string, optional): Filter by package type

**Example Request:**
```bash
GET /api/v1/admin/packages?page=0&size=10&search=premium&isActive=true&sort=createdAt,desc
```

**Status Codes:**
- `200 OK`: Packages retrieved successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### GET /admin/packages/active
Retrieve only active packages with pagination, sorting, and search filters.

**Parameters:**
- `page` (query, integer): Page number (0-indexed), default: 0
- `size` (query, integer): Page size, default: 20
- `sort` (query, string): Sort criteria
- `search` (query, string, optional): Search in name and description

**Status Codes:**
- `200 OK`: Active packages retrieved successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### GET /admin/packages/type/{type}
Retrieve packages filtered by type with pagination, sorting, and search.

**Parameters:**
- `type` (path, string): Package type
- `page` (query, integer): Page number (0-indexed), default: 0
- `size` (query, integer): Page size, default: 20
- `sort` (query, string): Sort criteria
- `search` (query, string, optional): Search in name and description

**Status Codes:**
- `200 OK`: Packages retrieved successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### GET /admin/packages/{id}
Retrieve a specific package by ID.

**Parameters:**
- `id` (path, long): Package ID

**Status Codes:**
- `200 OK`: Package retrieved successfully
- `404 Not Found`: Package not found
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### POST /admin/packages
Create a new travel package.

**Request Body:**
```json
{
  "name": "Premium Package",
  "description": "A premium travel package",
  "type": "PREMIUM",
  "price": 5000.00,
  "isActive": true
}
```

**Status Codes:**
- `201 Created`: Package created successfully
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### PUT /admin/packages/{id}
Update an existing package.

**Parameters:**
- `id` (path, long): Package ID

**Status Codes:**
- `200 OK`: Package updated successfully
- `404 Not Found`: Package not found
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### DELETE /admin/packages/{id}
Delete a package.

**Parameters:**
- `id` (path, long): Package ID

**Status Codes:**
- `204 No Content`: Package deleted successfully
- `404 Not Found`: Package not found
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

## Admin Audit Logs

### GET /admin/audit-logs
Retrieve all audit logs with pagination, sorting, and search filters.

**Parameters:**
- `page` (query, integer): Page number (0-indexed), default: 0
- `size` (query, integer): Page size, default: 20
- `sort` (query, string): Sort criteria (default: createdAt,desc)
- `operation` (query, string, optional): Filter by operation type (CREATE, UPDATE, DELETE)
- `status` (query, string, optional): Filter by status (SUCCESS, FAILED)

**Example Request:**
```bash
GET /api/v1/admin/audit-logs?page=0&size=20&operation=DELETE&status=SUCCESS&sort=createdAt,desc
```

**Status Codes:**
- `200 OK`: Audit logs retrieved successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### GET /admin/audit-logs/user/{userId}
Retrieve audit logs for a specific user.

**Parameters:**
- `userId` (path, long): User ID
- `page` (query, integer): Page number (0-indexed), default: 0
- `size` (query, integer): Page size, default: 20

**Status Codes:**
- `200 OK`: User audit logs retrieved successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

### GET /admin/audit-logs/operation/{operation}
Retrieve audit logs for a specific operation type.

**Parameters:**
- `operation` (path, string): Operation type (CREATE, UPDATE, DELETE)
- `page` (query, integer): Page number (0-indexed), default: 0
- `size` (query, integer): Page size, default: 20

**Status Codes:**
- `200 OK`: Operation audit logs retrieved successfully
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have admin role

---

## Query Parameters Reference

### Pagination Parameters
- `page` (integer, 0-indexed): Which page to retrieve
- `size` (integer): Number of records per page

### Sorting Parameters
- `sort` (string): Field to sort by and direction
  - Format: `fieldName,asc` or `fieldName,desc`
  - Example: `createdAt,desc` or `email,asc`
  - Multiple sorts: `createdAt,desc&sort=email,asc`

### Search/Filter Parameters
- `search` (string): Full-text search across multiple fields
- Field-specific filters vary by endpoint
  - User filters: `email`, `role`
  - Booking filters: `status`, `userId`
  - Blog filters: `status`
  - Driver filters: search only
  - Package filters: `isActive`, `type`
  - Audit filters: `operation`, `status`

---

## Error Response Format

All endpoints return error responses in this format:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "timestamp": "2026-03-03T15:30:00",
  "status": 400
}
```

### Common Error Codes
- `VALIDATION_ERROR` (422): Invalid input parameters
- `UNAUTHORIZED` (401): Missing or invalid authentication token
- `FORBIDDEN` (403): User lacks required ADMIN role
- `NOT_FOUND` (404): Requested resource not found
- `CONFLICT` (409): Resource already exists
- `INTERNAL_ERROR` (500): Server error

---

## Authentication

### Bearer Token
Include the JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Generation
- Login endpoint: `POST /api/v1/auth/login`
- Token lifespan: 15 minutes (900 seconds)
- Refresh token lifespan: 7 days (604800 seconds)

---

## Rate Limiting

Currently, no rate limiting is implemented. This should be configured in production.

---

## Versioning

This API follows semantic versioning:
- Current version: v1
- All endpoints use prefix: `/api/v1/`

---

## Support

For issues or questions:
1. Check the logs: `docker-compose logs backend`
2. Check the Swagger UI: `http://localhost:8000/api/v1/swagger-ui.html`
3. Contact the admin team

---

*Last Updated: 2026-03-03*
*Version: 1.0*
