# IndiCab API Endpoints Documentation

**Base URL:** `http://localhost:8000`

---

## Authentication Endpoints

### 1. User Login
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "phone": "9876543210",
    "role": "customer"
  }
}

Error (401 Unauthorized):
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 2. User Registration
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "phone": "9876543210",
  "role": "customer"
}

Response (201 Created):
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "phone": "9876543210",
    "role": "customer"
  }
}

Error (400 Bad Request):
{
  "success": false,
  "message": "User already exists"
}
```

### 3. User Logout
```
POST /api/auth/logout
Authorization: Bearer jwt_token_here

Response (200 OK):
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Booking Endpoints

### 1. Create Booking
```
POST /api/bookings
Authorization: Bearer jwt_token_here
Content-Type: application/json

Request Body:
{
  "tripType": "oneway|roundtrip|rental",
  "from": "Delhi",
  "to": "Agra",
  "departDate": "2024-02-20",
  "returnDate": "2024-02-22",
  "vehicleId": 1,
  "vehicle": "Sedan",
  "amount": 1500,
  "fullName": "John Doe",
  "phoneNumber": "9876543210",
  "email": "john@example.com",
  "licenseNumber": "DL01AB1234",
  "pickupAddress": "Hotel ABC, Delhi",
  "dropoffAddress": "Hotel XYZ, Agra",
  "passengerCount": 2,
  "specialRequirements": "Window seat preferred",
  "contactPreference": "call|sms|whatsapp",
  "paymentMethod": "UPI|Debit Card|Credit Card|Net Banking|Google Pay|PhonePe|Paytm|Cash",
  "status": "PENDING"
}

Response (201 Created):
{
  "id": "booking_id",
  "bookingReference": "INDICAB2024000001",
  "tripType": "oneway",
  "from": "Delhi",
  "to": "Agra",
  "departDate": "2024-02-20",
  "returnDate": null,
  "vehicleId": 1,
  "vehicle": "Sedan",
  "amount": 1500,
  "fullName": "John Doe",
  "phoneNumber": "9876543210",
  "email": "john@example.com",
  "licenseNumber": "DL01AB1234",
  "pickupAddress": "Hotel ABC, Delhi",
  "dropoffAddress": "Hotel XYZ, Agra",
  "passengerCount": 2,
  "specialRequirements": "Window seat preferred",
  "contactPreference": "call",
  "paymentMethod": "UPI",
  "status": "PENDING",
  "createdAt": "2024-02-15T10:30:00Z",
  "updatedAt": "2024-02-15T10:30:00Z"
}

Error (400 Bad Request):
{
  "success": false,
  "message": "Invalid booking details"
}

Error (409 Conflict):
{
  "success": false,
  "message": "This booking slot is no longer available"
}
```

### 2. Get All Bookings
```
GET /api/bookings?status=PENDING&limit=10&offset=0
Authorization: Bearer jwt_token_here

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "booking_id",
      "bookingReference": "INDICAB2024000001",
      "from": "Delhi",
      "to": "Agra",
      "departDate": "2024-02-20",
      "vehicle": "Sedan",
      "amount": 1500,
      "status": "PENDING",
      "createdAt": "2024-02-15T10:30:00Z"
    }
  ],
  "total": 5,
  "limit": 10,
  "offset": 0
}
```

### 3. Get Booking by ID
```
GET /api/bookings/:id
Authorization: Bearer jwt_token_here

Response (200 OK):
{
  "id": "booking_id",
  "bookingReference": "INDICAB2024000001",
  "tripType": "oneway",
  "from": "Delhi",
  "to": "Agra",
  "departDate": "2024-02-20",
  "vehicleId": 1,
  "vehicle": "Sedan",
  "amount": 1500,
  "fullName": "John Doe",
  "phoneNumber": "9876543210",
  "email": "john@example.com",
  "licenseNumber": "DL01AB1234",
  "pickupAddress": "Hotel ABC, Delhi",
  "dropoffAddress": "Hotel XYZ, Agra",
  "passengerCount": 2,
  "status": "PENDING",
  "createdAt": "2024-02-15T10:30:00Z",
  "updatedAt": "2024-02-15T10:30:00Z"
}
```

### 4. Update Booking
```
PUT /api/bookings/:id
Authorization: Bearer jwt_token_here
Content-Type: application/json

Request Body: (send only fields to update)
{
  "status": "CANCELLED",
  "specialRequirements": "Updated requirements"
}

Response (200 OK):
{
  "id": "booking_id",
  "bookingReference": "INDICAB2024000001",
  "status": "CANCELLED",
  "specialRequirements": "Updated requirements",
  "updatedAt": "2024-02-15T11:00:00Z"
}
```

### 5. Cancel Booking
```
DELETE /api/bookings/:id
Authorization: Bearer jwt_token_here

Response (200 OK):
{
  "success": true,
  "message": "Booking cancelled successfully",
  "refund": 1500,
  "refundStatus": "processed"
}

Error (404 Not Found):
{
  "success": false,
  "message": "Booking not found"
}
```

---

## Routes Endpoints

### 1. Get All Popular Routes
```
GET /api/routes?limit=10&offset=0
Authorization: Bearer jwt_token_here (optional)

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "from": "Ahmednagar",
      "to": "Pune",
      "distance": 120,
      "price": 1200,
      "duration": "3 hours",
      "image": "https://image.url",
      "description": "Scenic route through Maharashtra",
      "availableVehicles": ["Sedan", "SUV", "Luxury"],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 25,
  "limit": 10,
  "offset": 0
}
```

### 2. Get Route Details
```
GET /api/routes/:id
Authorization: Bearer jwt_token_here (optional)

Response (200 OK):
{
  "id": 1,
  "from": "Ahmednagar",
  "to": "Pune",
  "distance": 120,
  "price": 1200,
  "duration": "3 hours",
  "image": "https://image.url",
  "description": "Scenic route through Maharashtra",
  "availableVehicles": [
    {
      "id": 1,
      "type": "Sedan",
      "capacity": 4,
      "baseFare": 150,
      "ratePerKm": 10,
      "perDayCharge": 100
    }
  ],
  "reviews": [
    {
      "rating": 4.5,
      "comment": "Great service",
      "reviewer": "John Doe"
    }
  ]
}
```

---

## Recommendations Endpoints

### 1. Get Recommendations
```
GET /api/recommendations?limit=6&userId=optional_id
Authorization: Bearer jwt_token_here (optional)

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Weekend Getaway",
      "from": "Delhi",
      "to": "Jaipur",
      "price": 2500,
      "image": "https://image.url",
      "description": "Perfect for weekend trips",
      "type": "popular|personalized|trending"
    }
  ],
  "total": 12
}
```

---

## Profile Endpoints

### 1. Get User Profile
```
GET /api/profile
Authorization: Bearer jwt_token_here

Response (200 OK):
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "profileImage": "https://image.url",
  "address": "123 Main St, Delhi",
  "preferredPayment": "UPI",
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "9876543211"
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-02-15T10:30:00Z"
}
```

### 2. Update Profile
```
PUT /api/profile
Authorization: Bearer jwt_token_here
Content-Type: application/json

Request Body:
{
  "name": "John Doe Updated",
  "phone": "9876543210",
  "address": "456 New St, Delhi",
  "preferredPayment": "Debit Card"
}

Response (200 OK):
{
  "id": "user_id",
  "name": "John Doe Updated",
  "email": "john@example.com",
  "phone": "9876543210",
  "address": "456 New St, Delhi",
  "preferredPayment": "Debit Card",
  "updatedAt": "2024-02-15T11:00:00Z"
}
```

---

## Payment Endpoints

### 1. Create Payment Intent
```
GET /api/payment/intent?amount=1500&currency=INR&bookingId=booking_id
Authorization: Bearer jwt_token_here

Response (200 OK):
{
  "success": true,
  "clientSecret": "pi_1234567890abcdef",
  "amount": 1500,
  "currency": "INR",
  "paymentId": "payment_id"
}
```

### 2. Process Payment
```
POST /api/payment
Authorization: Bearer jwt_token_here
Content-Type: application/json

Request Body:
{
  "bookingId": "booking_id",
  "amount": 1500,
  "currency": "INR",
  "paymentMethod": "upi",
  "paymentIntentId": "pi_1234567890abcdef"
}

Response (200 OK):
{
  "success": true,
  "paymentId": "payment_id",
  "status": "COMPLETED",
  "amount": 1500,
  "transactionId": "TXN123456789",
  "bookingId": "booking_id",
  "createdAt": "2024-02-15T10:30:00Z"
}

Error (402 Payment Required):
{
  "success": false,
  "message": "Payment declined"
}
```

### 3. Get Payment Status
```
GET /api/payment/:paymentId
Authorization: Bearer jwt_token_here

Response (200 OK):
{
  "paymentId": "payment_id",
  "status": "COMPLETED|PENDING|FAILED|REFUNDED",
  "amount": 1500,
  "bookingId": "booking_id",
  "transactionId": "TXN123456789",
  "createdAt": "2024-02-15T10:30:00Z"
}
```

---

## Razorpay Payment Endpoints

### 1. Create Razorpay Order
```
POST /razorpay/create-order
Authorization: Bearer jwt_token_here
Content-Type: application/json

Request Body:
{
  "bookingId": "booking_id",
  "amount": 1500,
  "currency": "INR",
  "paymentMethod": "razorpay"
}

Response (200 OK):
{
  "success": true,
  "orderId": "order_1234567890abcdef",
  "amount": 1500,
  "currency": "INR",
  "key": "razorpay_key_id"
}
```

### 2. Verify Razorpay Payment
```
POST /razorpay/verify-payment
Authorization: Bearer jwt_token_here
Content-Type: application/json

Request Body:
{
  "orderId": "order_1234567890abcdef",
  "paymentId": "pay_1234567890abcdef",
  "signature": "signature_hash_here",
  "bookingId": "booking_id"
}

Response (200 OK):
{
  "success": true,
  "message": "Payment verified successfully",
  "bookingId": "booking_id",
  "status": "COMPLETED"
}

Error (400 Bad Request):
{
  "success": false,
  "message": "Payment verification failed"
}
```

---

## Driver Endpoints

### 1. Register as Driver
```
POST /api/driver/register
Content-Type: application/json

Request Body:
{
  "name": "Driver Name",
  "email": "driver@example.com",
  "password": "password123",
  "phone": "9876543210",
  "licenseNumber": "DL01AB1234",
  "licenseExpiry": "2025-12-31",
  "aadharNumber": "123456789012",
  "vehicleType": "Sedan|SUV|Luxury|Tempo",
  "vehicleRegistration": "DL01AB1234",
  "bankAccount": "1234567890",
  "ifscCode": "BANK0001234"
}

Response (201 Created):
{
  "success": true,
  "driverId": "driver_id",
  "message": "Registration submitted for approval",
  "status": "PENDING_APPROVAL"
}

Error (400 Bad Request):
{
  "success": false,
  "message": "License number already registered"
}
```

### 2. Get All Drivers
```
GET /api/driver/all?status=APPROVED&limit=10
Authorization: Bearer jwt_token_here

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "driver_id",
      "name": "Driver Name",
      "email": "driver@example.com",
      "phone": "9876543210",
      "status": "APPROVED",
      "vehicleType": "Sedan",
      "rating": 4.5,
      "ridesCompleted": 150,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 50
}
```

### 3. Get Driver Applications
```
GET /api/driver/pending
Authorization: Bearer admin_token
Authorization: Bearer admin_token

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "applicationId": "app_id",
      "driverId": "driver_id",
      "name": "Driver Name",
      "email": "driver@example.com",
      "phone": "9876543210",
      "licenseNumber": "DL01AB1234",
      "vehicleType": "Sedan",
      "status": "PENDING",
      "submittedAt": "2024-02-10T00:00:00Z"
    }
  ],
  "total": 5
}
```

### 4. Review Driver Application (Approve/Reject)
```
POST /api/driver/review-application
Authorization: Bearer admin_token
Content-Type: application/json

Request Body:
{
  "applicationId": "app_id",
  "status": "APPROVED|REJECTED",
  "rejectionReason": "Optional reason if rejected",
  "adminNotes": "Optional notes"
}

Response (200 OK):
{
  "success": true,
  "message": "Application approved successfully",
  "driverId": "driver_id",
  "status": "APPROVED",
  "approvedAt": "2024-02-15T10:30:00Z"
}
```

### 5. Get Driver Rides
```
GET /api/driver/rides?driverId=driver_id&status=COMPLETED&limit=10
Authorization: Bearer jwt_token_here

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "rideId": "ride_id",
      "bookingId": "booking_id",
      "from": "Delhi",
      "to": "Agra",
      "date": "2024-02-20",
      "distance": 240,
      "fare": 2400,
      "status": "COMPLETED",
      "passengerName": "John Doe",
      "rating": 4.5,
      "completedAt": "2024-02-20T16:30:00Z"
    }
  ],
  "total": 150
}
```

---

## Admin Endpoints

### 1. Get Dashboard Stats
```
GET /api/admin/dashboard
Authorization: Bearer admin_token

Response (200 OK):
{
  "success": true,
  "stats": {
    "totalBookings": 500,
    "totalRevenue": 750000,
    "totalDrivers": 50,
    "totalUsers": 1000,
    "completedRides": 480,
    "cancelledRides": 20,
    "avgRating": 4.6,
    "todayBookings": 25,
    "todayRevenue": 37500
  }
}
```

### 2. Get All Users (Admin)
```
GET /api/admin/users?limit=20&offset=0&search=john
Authorization: Bearer admin_token

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "status": "ACTIVE|SUSPENDED|BANNED",
      "totalBookings": 5,
      "totalSpent": 12500,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-02-15T10:30:00Z"
    }
  ],
  "total": 1000
}
```

### 3. Get All Bookings (Admin)
```
GET /api/admin/bookings?status=PENDING&limit=20&offset=0
Authorization: Bearer admin_token

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "booking_id",
      "bookingReference": "INDICAB2024000001",
      "from": "Delhi",
      "to": "Agra",
      "departDate": "2024-02-20",
      "passengerName": "John Doe",
      "amount": 1500,
      "status": "PENDING",
      "createdAt": "2024-02-15T10:30:00Z"
    }
  ],
  "total": 500
}
```

### 4. Get All Drivers (Admin)
```
GET /api/admin/drivers?status=APPROVED&limit=20&offset=0
Authorization: Bearer admin_token

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "driver_id",
      "name": "Driver Name",
      "email": "driver@example.com",
      "phone": "9876543210",
      "status": "APPROVED",
      "ridesCompleted": 150,
      "rating": 4.5,
      "documentStatus": "VERIFIED",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 50
}
```

### 5. Suspend User (Admin)
```
PUT /api/admin/users/:userId/suspend
Authorization: Bearer admin_token
Content-Type: application/json

Request Body:
{
  "reason": "Violation of terms and conditions"
}

Response (200 OK):
{
  "success": true,
  "message": "User suspended successfully",
  "userId": "user_id",
  "status": "SUSPENDED"
}
```

### 6. Approve Driver (Admin)
```
PUT /api/admin/drivers/:driverId/approve
Authorization: Bearer admin_token

Response (200 OK):
{
  "success": true,
  "message": "Driver approved successfully",
  "driverId": "driver_id",
  "status": "APPROVED"
}
```

---

## Service Cities Endpoint

### 1. Get Service Cities
```
GET /api/service-cities
Authorization: Bearer jwt_token_here (optional)

Response (200 OK):
{
  "success": true,
  "cities": [
    {
      "id": 1,
      "name": "Delhi",
      "state": "Delhi",
      "isActive": true,
      "radius": 50,
      "coordinates": { "lat": 28.6139, "lng": 77.2090 }
    },
    {
      "id": 2,
      "name": "Mumbai",
      "state": "Maharashtra",
      "isActive": true,
      "radius": 50,
      "coordinates": { "lat": 19.0760, "lng": 72.8777 }
    }
  ],
  "total": 25
}
```

---

## Error Codes & Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid authentication |
| 403 | Forbidden - User doesn't have permission |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource conflict (e.g., booking slot unavailable) |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Server temporarily down |

---

## Common Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
X-API-Version: 1.0
```

---

## Rate Limiting

- **Public endpoints:** 100 requests per minute per IP
- **Authenticated endpoints:** 1000 requests per minute per user
- **Headers returned:**
  - `X-RateLimit-Limit: 1000`
  - `X-RateLimit-Remaining: 999`
  - `X-RateLimit-Reset: 1645123200`

---

## Environment Variables (Frontend)

```
VITE_API_BASE_URL=http://localhost:8000
VITE_RAZORPAY_KEY_ID=your_razorpay_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key (currently disabled)
```

---

**Last Updated:** 2024-02-15
**Version:** 1.0
