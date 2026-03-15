# Payment Integration Removal Guide

Complete guide for removing Stripe and Razorpay payment integration from the IndiCab application.

**Status:** Payment removal in progress  
**Date:** February 15, 2026

---

## Summary of Changes

All payment-related code has been removed from the IndiCab application. This guide documents what was removed and what still needs to be deleted.

---

## Completed Removals

### ✅ Backend Changes

#### 1. Removed from pom.xml
- ✅ Stripe Java SDK (com.stripe:stripe-java:24.8.0)
- ✅ Razorpay Java SDK (com.razorpay:razorpay-java:1.4.1)

#### 2. Files to Delete from Backend

Create the payment folder can be safely deleted, or delete individual files:

**DTOs (Delete):**
- `indicab-backend/src/main/java/com/indicab/dto/PaymentRequestDTO.java`
- `indicab-backend/src/main/java/com/indicab/dto/PaymentResponseDTO.java`
- `indicab-backend/src/main/java/com/indicab/dto/RazorpayPaymentVerificationDTO.java`
- `indicab-backend/src/main/java/com/indicab/dto/RazorpayOrderDTO.java`

**Controllers (Delete):**
- `indicab-backend/src/main/java/com/indicab/controller/PaymentController.java`
- `indicab-backend/src/main/java/com/indicab/controller/RazorpayController.java`
- `indicab-backend/src/main/java/com/indicab/controller/RazorpayWebhookController.java`

**Entities (Delete):**
- `indicab-backend/src/main/java/com/indicab/entity/Payment.java`

**Repositories (Delete):**
- `indicab-backend/src/main/java/com/indicab/repository/PaymentRepository.java`

**Services (Delete):**
- `indicab-backend/src/main/java/com/indicab/service/PaymentService.java`
- `indicab-backend/src/main/java/com/indicab/service/impl/PaymentServiceImpl.java`
- `indicab-backend/src/main/java/com/indicab/service/RazorpayService.java`
- `indicab-backend/src/main/java/com/indicab/service/impl/RazorpayServiceImpl.java`

**Tests (Delete):**
- `indicab-backend/src/test/java/com/indicab/controller/PaymentControllerIntegrationTest.java`
- `indicab-backend/src/test/java/com/indicab/service/impl/PaymentServiceImplTest.java`
- `indicab-backend/src/test/java/com/indicab/service/impl/RazorpayServiceImplTest.java`

### ✅ Frontend Changes

#### 1. Redux Store Update
- ✅ Removed `paymentReducer` import from `src/app/store.js`
- ✅ Removed `payment` reducer from store configuration

#### 2. Files to Delete from Frontend

**Payment Feature Folder (Delete entire folder):**
- `indicab-frontend/src/features/payment/`
  - PaymentForm.jsx
  - PaymentForm.css
  - RazorpayPaymentForm.jsx
  - RazorpayPaymentForm.css
  - paymentApi.js
  - paymentSlice.js
  - paymentSelectors.js

#### 3. Manual Cleanup in Files

The following files may contain payment references that need to be reviewed and updated:

**BookingForm.jsx:**
- Search for any payment-related imports or logic
- Remove any PaymentForm component usage
- Remove any payment state management references

**App.jsx (or routing files):**
- Remove any routes that lead to payment pages
- Remove any payment-related navigation links

**Components:**
- Search all JSX files for `Payment` or `payment` references
- Remove or replace any payment UI elements

### ✅ Environment Variables Updated

**Remove from `.env` files:**
- `STRIPE_API_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

**Updated `.env`:**
- Removed payment gateway configuration sections

---

## Verification Checklist

### Backend Verification
```bash
cd indicab-backend

# Check for payment-related imports
grep -r "import.*stripe\|import.*razorpay" src/

# Check for Payment class references
grep -r "Payment\|Razorpay" src/ --include="*.java" | grep -v "build/"

# Verify clean build
./mvnw clean compile

# Run tests (should pass without payment tests)
./mvnw clean test
```

### Frontend Verification
```bash
cd indicab-frontend

# Check for payment imports
grep -r "payment\|Payment\|razorpay\|stripe" src/ --include="*.jsx" --include="*.js"

# Check for payment routes
grep -r "payment\|Payment" src/ --include="*.jsx"

# Run tests
npm run test -- --run

# Build check
npm run build
```

---

## Files to Manually Delete

Since direct file deletion is restricted, use your IDE or file explorer to delete:

### Backend Files (16 files)
```
indicab-backend/src/main/java/com/indicab/dto/PaymentRequestDTO.java
indicab-backend/src/main/java/com/indicab/dto/PaymentResponseDTO.java
indicab-backend/src/main/java/com/indicab/dto/RazorpayPaymentVerificationDTO.java
indicab-backend/src/main/java/com/indicab/dto/RazorpayOrderDTO.java
indicab-backend/src/main/java/com/indicab/controller/PaymentController.java
indicab-backend/src/main/java/com/indicab/controller/RazorpayController.java
indicab-backend/src/main/java/com/indicab/controller/RazorpayWebhookController.java
indicab-backend/src/main/java/com/indicab/entity/Payment.java
indicab-backend/src/main/java/com/indicab/repository/PaymentRepository.java
indicab-backend/src/main/java/com/indicab/service/PaymentService.java
indicab-backend/src/main/java/com/indicab/service/impl/PaymentServiceImpl.java
indicab-backend/src/main/java/com/indicab/service/RazorpayService.java
indicab-backend/src/main/java/com/indicab/service/impl/RazorpayServiceImpl.java
indicab-backend/src/test/java/com/indicab/controller/PaymentControllerIntegrationTest.java
indicab-backend/src/test/java/com/indicab/service/impl/PaymentServiceImplTest.java
indicab-backend/src/test/java/com/indicab/service/impl/RazorpayServiceImplTest.java
```

### Frontend Files (Entire folder)
```
indicab-frontend/src/features/payment/
  ├── PaymentForm.jsx
  ├── PaymentForm.css
  ├── RazorpayPaymentForm.jsx
  ├── RazorpayPaymentForm.css
  ├── paymentApi.js
  ├── paymentSlice.js
  └── paymentSelectors.js
```

---

## Search Commands for Cleanup

Use these commands to find remaining payment references:

### Backend
```bash
cd indicab-backend

# Find all payment-related files
find . -type f -name "*payment*" -o -name "*Payment*" -o -name "*razorpay*" -o -name "*Razorpay*"

# Find imports of removed classes
grep -r "PaymentController\|PaymentService\|RazorpayService" src/ --include="*.java"

# Find import statements
grep -r "com.stripe\|com.razorpay" src/ --include="*.java"
```

### Frontend
```bash
cd indicab-frontend

# Find all payment-related files
find . -type f -name "*payment*" -o -name "*Payment*" -o -name "*razorpay*" -o -name "*Razorpay*"

# Find imports
grep -r "from.*payment\|import.*payment" src/ --include="*.jsx" --include="*.js"

# Find component usage
grep -r "PaymentForm\|RazorpayPaymentForm" src/ --include="*.jsx"
```

---

## What Remains

After payment removal, the following features remain functional:

✅ **Booking System** - Intact
- Create bookings
- View booking history
- Confirm/cancel bookings

✅ **Fare Calculation** - Intact
- Distance-based calculations
- Popular route pricing
- Vehicle multipliers

✅ **Admin Dashboard** - Intact
- Manage users, drivers, bookings
- Approve/reject drivers
- CRUD operations

✅ **Email Notifications** - Intact
- Admin notification on new bookings
- Customer confirmation emails
- Cancellation notifications

✅ **Authentication** - Intact
- User registration and login
- JWT token management
- Role-based access control

---

## Migration Notes

### For Existing Users/Customers

If the application was previously accepting payments:
- Existing payment records will need to be archived separately
- Payment history should be backed up before removing Payment entities
- Customer notifications should be sent about payment method changes

### Future Payment Re-integration

If you need to re-add payment support later:
1. Create new PaymentService with your preferred provider
2. Add DTOs for payment requests/responses
3. Create PaymentController with appropriate endpoints
4. Add payment-related Redux slices
5. Integrate with BookingForm for payment collection

---

## Build Verification

### Backend Build
```bash
cd indicab-backend
./mvnw clean package

# Expected: BUILD SUCCESS
# No errors about Payment classes
```

### Frontend Build
```bash
cd indicab-frontend
npm run build

# Expected: Build completed successfully
# No warnings about missing payment modules
```

---

## Summary of Removed Lines

- **pom.xml:** 13 lines removed (Stripe + Razorpay dependencies)
- **store.js:** 2 lines removed (payment import), 1 line removed (payment reducer)
- **Backend Files:** 16 files (~2000+ lines of code)
- **Frontend Files:** 7 files (~500+ lines of code)

**Total:** ~2,500+ lines of payment-related code removed

---

## Remaining Tasks

1. Delete all files listed in "Files to Manually Delete" section
2. Search codebase for any remaining payment references
3. Run full test suite to verify no broken dependencies
4. Update API documentation to reflect removed endpoints
5. Update README if it mentions payment support
6. Commit changes with message: "chore: remove payment integration (Stripe/Razorpay)"

---

## Support

If you encounter any issues after removing payment integration:
1. Check the verification checklist above
2. Search for remaining payment references using provided commands
3. Ensure all payment files are properly deleted
4. Run clean build: `./mvnw clean compile` (backend) or `npm install && npm run build` (frontend)

---

*Last Updated: February 15, 2026*
