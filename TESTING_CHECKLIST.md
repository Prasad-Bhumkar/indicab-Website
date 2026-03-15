# INDICAB - COMPREHENSIVE TESTING CHECKLIST
**Project:** Ride-Sharing Application
**Last Updated:** March 4, 2026
**Status:** All Services Running (Backend 8000, Frontend 5173, MySQL 3306, Redis 6379)

---

## 📋 QUICK START
- **Frontend:** http://localhost (or port displayed in dev server)
- **Backend API:** http://localhost:8000/api/v1
- **WebSocket:** ws://localhost/ws (STOMP)
- **Admin Panel:** http://localhost/admin (login required)

---

## ✅ TEST SUITE 1: AUTHENTICATION & USER MANAGEMENT

### 1.1 User Registration
**Test Case:** Register new user
- **Steps:**
  1. Navigate to http://localhost/register
  2. Fill form: Name, Email, Password, Phone, Address
  3. Submit registration
  4. Expected: User created, redirect to login
  5. Verify: Check MySQL: `SELECT * FROM users WHERE email='test@example.com'`
- **Success Criteria:** ✓ User account created ✓ Can login with credentials ✓ Password hashed

### 1.2 User Login
**Test Case:** Login with valid credentials
- **Steps:**
  1. Navigate to http://localhost/login
  2. Enter registered email and password
  3. Click Login
  4. Expected: Access token + refresh token stored in localStorage
  5. Redirect to home page
- **Success Criteria:** ✓ Tokens in localStorage ✓ Protected routes accessible ✓ Auth header present

### 1.3 Token Refresh
**Test Case:** Automatic token refresh on expiry
- **Steps:**
  1. Login successfully
  2. Wait for access token to expire (or manually expire)
  3. Make any API call
  4. Intercept network tab: Should see refresh-token call first
  5. Expected: New access token retrieved, original request retried
- **Success Criteria:** ✓ Automatic refresh works ✓ No manual re-login needed ✓ Original request succeeds

### 1.4 Logout
**Test Case:** User logout
- **Steps:**
  1. Login as user
  2. Click logout button (top right)
  3. Expected: Tokens cleared from localStorage
  4. Redirect to login page
  5. Try accessing protected route: Should redirect to /login
- **Success Criteria:** ✓ Tokens cleared ✓ Protected routes inaccessible ✓ Can login again

### 1.5 Admin Login
**Test Case:** Admin login (special endpoint)
- **Steps:**
  1. Navigate to http://localhost/admin-login
  2. Login with admin credentials
  3. Expected: Redirect to /admin panel
  4. Verify: User role is ADMIN in token
- **Success Criteria:** ✓ Admin login works ✓ Admin panel accessible ✓ Role=ADMIN in JWT

---

## ✅ TEST SUITE 2: BOOKING MANAGEMENT

### 2.1 Guest Booking (No Login Required)
**Test Case:** Create booking as guest
- **Steps:**
  1. Navigate to http://localhost (home page)
  2. Fill booking form:
     - From Location: City A
     - To Location: City B
     - Date: Tomorrow
     - Vehicle Type: Select any
     - Passenger Count: 2
     - Name: Guest Name
     - Email: guest@example.com
     - Phone: +1234567890
  3. Click "Book Now"
  4. Expected: Booking reference number displayed
  5. Verify: Check MySQL: `SELECT * FROM bookings WHERE email='guest@example.com'`
- **Success Criteria:** ✓ Booking created ✓ Reference ID generated ✓ Status=PENDING

### 2.2 Guest Booking Status Lookup
**Test Case:** View booking status without login
- **Steps:**
  1. After guest booking, you get reference ID (e.g., BOOK-12345)
  2. Navigate to http://localhost/bookings/status/BOOK-12345
  3. Enter email: guest@example.com
  4. Expected: See booking details, location map, status
- **Success Criteria:** ✓ Public lookup works ✓ Email verified ✓ Status shown

### 2.3 Authenticated User Booking
**Test Case:** Create booking as logged-in user
- **Steps:**
  1. Login as user
  2. Fill booking form (same as 2.1)
  3. Submit
  4. Expected: Booking created + linked to user account
  5. Verify: Booking appears in user's history
- **Success Criteria:** ✓ Booking linked to user ✓ Appears in /history ✓ user_id populated

### 2.4 View Booking History
**Test Case:** Access booking history (authenticated)
- **Steps:**
  1. Login as user who has made bookings
  2. Navigate to http://localhost/history
  3. Expected: List of all user's bookings with pagination
  4. Click on any booking: See details
  5. Filter/sort: By date, status, vehicle type
- **Success Criteria:** ✓ All user bookings shown ✓ Pagination works ✓ Details popup works

### 2.5 Update Booking (User)
**Test Case:** Update own booking (before confirmation)
- **Steps:**
  1. From booking history, click on a PENDING booking
  2. Click "Edit"
  3. Change details (passenger count, special requirements, etc.)
  4. Click "Save"
  5. Expected: Changes saved, booking updated
- **Success Criteria:** ✓ Editable fields updated ✓ Confirmation shown ✓ DB reflects changes

### 2.6 Cancel Booking (User)
**Test Case:** Cancel own booking
- **Steps:**
  1. From booking history, select a PENDING booking
  2. Click "Cancel"
  3. Confirm cancellation
  4. Expected: Status changes to CANCELLED
- **Success Criteria:** ✓ Status = CANCELLED ✓ Confirmation email sent ✓ Not visible in active bookings

---

## ✅ TEST SUITE 3: ADMIN BOOKING MANAGEMENT

### 3.1 Admin View All Bookings
**Test Case:** Admin can see all bookings (paginated)
- **Steps:**
  1. Login as admin
  2. Navigate to /admin/bookings
  3. Expected: Table of all bookings with pagination
  4. Should show: Booking ID, From, To, Status, Amount, Date, User
- **Success Criteria:** ✓ All bookings visible ✓ Pagination works ✓ Sorting works

### 3.2 Admin Search & Filter Bookings
**Test Case:** Search and filter bookings with multiple criteria
- **Steps:**
  1. From /admin/bookings
  2. Use search: Filter by city, passenger name, email, phone
  3. Filter by status: PENDING, CONFIRMED, CANCELLED
  4. Filter by date range
  5. Expected: Results updated in real-time
- **Success Criteria:** ✓ Search works ✓ Filters work ✓ Combined filters work

### 3.3 Admin Confirm Booking
**Test Case:** Admin confirms pending booking
- **Steps:**
  1. From bookings list, select a PENDING booking
  2. Click "Confirm"
  3. Expected: Status changes to CONFIRMED
  4. Booking email sent to customer
- **Success Criteria:** ✓ Status = CONFIRMED ✓ Email sent ✓ Driver assigned (if applicable)

### 3.4 Admin Cancel Booking
**Test Case:** Admin cancels booking
- **Steps:**
  1. Select any booking
  2. Click "Cancel"
  3. Optional: Add cancellation reason
  4. Confirm
  5. Expected: Status = CANCELLED, customer notified
- **Success Criteria:** ✓ Status changed ✓ Email sent ✓ Refund processed (if applicable)

### 3.5 Admin Bulk Operations
**Test Case:** Bulk delete/confirm/cancel bookings
- **Steps:**
  1. From /admin/bookings
  2. Select multiple bookings (checkboxes)
  3. Click "Bulk Action" → Delete / Confirm / Cancel
  4. Confirm bulk action
  5. Expected: All selected bookings updated
- **Success Criteria:** ✓ Bulk delete works ✓ Bulk status change works ✓ No duplicates

### 3.6 Admin View Booking Stats
**Test Case:** View booking analytics
- **Steps:**
  1. From /admin (dashboard)
  2. Look for "Booking Statistics" widget
  3. Expected: Show total bookings, pending, confirmed, cancelled
  4. Revenue stats: Total amount, avg fare
- **Success Criteria:** ✓ Stats calculated correctly ✓ Numbers match DB ✓ Charts render

---

## ✅ TEST SUITE 4: PROFILE MANAGEMENT

### 4.1 View User Profile
**Test Case:** View own profile
- **Steps:**
  1. Login as user
  2. Navigate to http://localhost/profile
  3. Expected: Show name, email, phone, address, role
- **Success Criteria:** ✓ All user data displayed ✓ Data matches registration

### 4.2 Update Profile
**Test Case:** Update profile information
- **Steps:**
  1. From /profile, click "Edit"
  2. Update: Name, Phone, Address
  3. Click "Save"
  4. Expected: Changes saved to DB
- **Success Criteria:** ✓ Fields updated ✓ Confirmation shown ✓ DB reflects changes

### 4.3 Change Password
**Test Case:** Change account password
- **Steps:**
  1. From /profile, click "Change Password"
  2. Enter: Current password, New password, Confirm new password
  3. Click "Update"
  4. Expected: Password changed, success message
  5. Try logging in with old password: Should fail
  6. Try logging in with new password: Should succeed
- **Success Criteria:** ✓ Old password no longer works ✓ New password works ✓ Hash updated in DB

### 4.4 Delete Account
**Test Case:** Delete user account
- **Steps:**
  1. From /profile, click "Delete Account"
  2. Confirm deletion (may require password)
  3. Expected: Account and all related data deleted
  4. Try logging in: Should fail
- **Success Criteria:** ✓ Account deleted ✓ Login fails ✓ Bookings preserved or archived

---

## ✅ TEST SUITE 5: DRIVER FEATURES

### 5.1 Apply as Driver
**Test Case:** User applies to be a driver
- **Steps:**
  1. Login as regular user
  2. Navigate to driver application form
  3. Fill: License number, vehicle type, vehicle details
  4. Submit
  5. Expected: Application created, status=PENDING
  6. Verify: Check DB `SELECT * FROM users WHERE driverStatus='PENDING'`
- **Success Criteria:** ✓ Application created ✓ Status=PENDING ✓ Admin notified

### 5.2 Admin Review Driver Application
**Test Case:** Admin reviews pending driver applications
- **Steps:**
  1. Login as admin
  2. Navigate to /admin/drivers or /admin/driver-applications
  3. View pending applications
  4. Select one application
  5. View details: Name, License, Vehicle, Experience
  6. Click "Approve" or "Reject"
  7. If approve: Status=APPROVED
  8. If reject: Status=REJECTED (optional reason)
- **Success Criteria:** ✓ Applications listed ✓ Can approve ✓ Can reject ✓ User notified

### 5.3 Driver Dashboard (Approved Drivers Only)
**Test Case:** Access driver dashboard
- **Steps:**
  1. Login as approved driver
  2. Navigate to http://localhost/driver/dashboard
  3. Expected: Dashboard with assigned rides
  4. See: Route details, passenger info, pickup/dropoff locations
- **Success Criteria:** ✓ Only approved drivers can access ✓ Assigned rides shown ✓ Route details clear

### 5.4 Driver Update Location (Real-time Tracking)
**Test Case:** Driver sends location updates
- **Steps:**
  1. Driver opens active ride
  2. System requests GPS permission
  3. Driver location sent to server every 5-10 seconds
  4. Passenger sees live location on map
  5. Expected: WebSocket connection established
- **Success Criteria:** ✓ WebSocket connected ✓ Location updates real-time ✓ Passenger map updates

---

## ✅ TEST SUITE 6: REAL-TIME RIDE TRACKING

### 6.1 WebSocket Connection
**Test Case:** Establish WebSocket connection
- **Steps:**
  1. Open browser console
  2. Navigate to /ride-tracker
  3. Expected: WebSocket connected message
  4. Check Network tab: ws://localhost/ws shows connection
- **Success Criteria:** ✓ STOMP connection established ✓ No connection errors ✓ Console shows "Connected"

### 6.2 Subscribe to Ride Updates
**Test Case:** Subscribe to specific ride tracking topic
- **Steps:**
  1. Open /ride-tracker (as passenger)
  2. Select active ride to track
  3. Expected: Subscribe to /topic/ride/{rideId}
  4. See in Network: SUBSCRIBE frame sent
- **Success Criteria:** ✓ SUBSCRIBE frame sent ✓ Topic correct format ✓ No errors

### 6.3 Receive Location Updates
**Test Case:** Receive real-time driver location
- **Steps:**
  1. Passenger viewing active ride
  2. Driver sends location via mobile app or dashboard
  3. Expected: Passenger map updates in real-time
  4. See: Driver marker moves on map
- **Success Criteria:** ✓ Updates received in <2 seconds ✓ Map refreshes ✓ ETA updates

### 6.4 Ride Status Updates
**Test Case:** Receive ride status changes
- **Steps:**
  1. Ride is CONFIRMED
  2. Driver clicks "Started"
  3. Expected: Passenger sees "Ride Started" notification
  4. Driver clicks "Completed"
  5. Expected: Passenger sees "Ride Completed"
- **Success Criteria:** ✓ Status notifications work ✓ Notifications in real-time ✓ UI updates accordingly

### 6.5 WebSocket Error Handling
**Test Case:** Handle connection loss
- **Steps:**
  1. Open ride tracker
  2. Unplug network / simulate offline
  3. Expected: Disconnect notification shown
  4. When network back: Auto-reconnect
- **Success Criteria:** ✓ Graceful disconnect handling ✓ Reconnect on network return ✓ No UI crash

---

## ✅ TEST SUITE 7: FARE CALCULATION & VEHICLES

### 7.1 View Available Vehicles
**Test Case:** See vehicle types and pricing
- **Steps:**
  1. On booking form, click "Vehicle Type"
  2. Expected: List of vehicles with:
     - Name (Economy, Premium, etc.)
     - Base fare
     - Price multiplier
     - Seat capacity
     - Image
- **Success Criteria:** ✓ All vehicles shown ✓ Prices displayed ✓ Images loaded

### 7.2 Calculate Fare
**Test Case:** Get fare estimate before booking
- **Steps:**
  1. Fill booking form: From, To, Date, Vehicle, Passenger Count
  2. Expected: Fare calculated automatically
  3. Show breakdown: Base fare + distance surcharge + vehicle multiplier = Total
- **Success Criteria:** ✓ Fare calculated ✓ Breakdown shown ✓ Matches backend calculation

### 7.3 Fare Calculation Details
**Test Case:** Verify fare calculation logic
- **Steps:**
  1. Book ride from City A to City B
  2. Note the fare calculation components:
     - Distance
     - Base rate per km
     - Vehicle multiplier
     - Total
  3. Expected: Formula: (Distance × Base Rate) × Vehicle Multiplier = Base Fare
- **Success Criteria:** ✓ Math correct ✓ Multipliers applied ✓ No rounding errors

### 7.4 View Pricing Config
**Test Case:** Admin can view/edit pricing
- **Steps:**
  1. Login as admin
  2. Navigate to /admin/pricing or /admin/fares
  3. Expected: Current pricing config displayed
  4. Edit: Base rate per km, vehicle multipliers
  5. Save
  6. Expected: New fares calculated for new bookings
- **Success Criteria:** ✓ Config visible ✓ Can edit ✓ Changes apply to new bookings

---

## ✅ TEST SUITE 8: NOTIFICATIONS

### 8.1 In-App Notifications
**Test Case:** Receive notifications
- **Steps:**
  1. Login as user
  2. Make a booking
  3. Expected: Notification appears in notification center
  4. Notification text: "Your booking has been confirmed"
- **Success Criteria:** ✓ Notification created ✓ Appears in UI ✓ Timestamp correct

### 8.2 Notification Pagination
**Test Case:** View all notifications with pagination
- **Steps:**
  1. Navigate to notification center (bell icon)
  2. Expected: List of notifications, paginated
  3. Pagination controls: Next, Previous, page numbers
- **Success Criteria:** ✓ All notifications shown ✓ Pagination works ✓ Sorting by date

### 8.3 Mark as Read
**Test Case:** Mark notification as read
- **Steps:**
  1. From notification list
  2. Click on unread notification (usually bold/highlighted)
  3. Expected: Notification marked as read
  4. Visual change: No longer bold
- **Success Criteria:** ✓ Read status updated ✓ Unread count decreases ✓ Visual indicator changes

### 8.4 Unread Count
**Test Case:** View unread notification count
- **Steps:**
  1. Login (have unread notifications)
  2. Bell icon shows count badge
  3. Expected: Badge shows number of unread
  4. After reading all: Badge disappears or shows 0
- **Success Criteria:** ✓ Count accurate ✓ Updates in real-time ✓ Badge visible

### 8.5 Mark All as Read
**Test Case:** Mark all notifications as read at once
- **Steps:**
  1. From notification center
  2. Click "Mark All as Read"
  3. Expected: All notifications marked as read
  4. Unread count becomes 0
- **Success Criteria:** ✓ Bulk mark works ✓ Count updated ✓ All visual indicators cleared

### 8.6 Delete Notification
**Test Case:** Delete individual notification
- **Steps:**
  1. From notification list
  2. Click delete/trash icon on a notification
  3. Confirm deletion
  4. Expected: Notification removed from list
- **Success Criteria:** ✓ Notification deleted ✓ List refreshed ✓ Can't recover

---

## ✅ TEST SUITE 9: ROUTES, PACKAGES & SERVICE CITIES

### 9.1 View Popular Routes
**Test Case:** See popular routes on home page
- **Steps:**
  1. Navigate to http://localhost
  2. Look for "Popular Routes" section
  3. Expected: Show 5-10 popular routes with:
     - From city
     - To city
     - Distance
     - Estimated fare
- **Success Criteria:** ✓ Routes displayed ✓ Data correct ✓ Formatted nicely

### 9.2 View Service Cities
**Test Case:** See which cities are served
- **Steps:**
  1. On home page, look for "Service Areas"
  2. Expected: List of cities where service is available
  3. Click on city: Navigate to /city/{cityName}
- **Success Criteria:** ✓ Cities listed ✓ Links work ✓ City page loads

### 9.3 City Page
**Test Case:** View specific city's routes and info
- **Steps:**
  1. Click on a service city
  2. Navigate to http://localhost/city/mumbai
  3. Expected: Show all routes from/to this city
  4. Local attractions, weather, travel guides
- **Success Criteria:** ✓ City info displayed ✓ Routes filtered correctly ✓ Attractions shown

### 9.4 Travel Packages
**Test Case:** View and book travel packages
- **Steps:**
  1. Navigate to http://localhost/packages
  2. Expected: List of available packages:
     - Weekend getaway
     - Long drive package
     - Group discount package
  3. Each package shows: Name, price, features, duration, validity
  4. Click "Book Package": Add to cart or create booking
- **Success Criteria:** ✓ Packages displayed ✓ Details clear ✓ Booking works

### 9.5 Blog
**Test Case:** Read travel blogs
- **Steps:**
  1. Navigate to http://localhost/blog
  2. Expected: List of blog posts
  3. Each post: Title, excerpt, author, date, thumbnail
  4. Click post: Full article displayed
- **Success Criteria:** ✓ Blog posts listed ✓ Full post view works ✓ Comments visible (if enabled)

### 9.6 Admin Manage Packages
**Test Case:** Admin create/edit packages
- **Steps:**
  1. Login as admin
  2. Navigate to /admin/packages
  3. Click "Create New Package"
  4. Fill: Name, description, base fare, duration, discount
  5. Upload image
  6. Save
  7. Expected: Package created and visible to users
- **Success Criteria:** ✓ Package created ✓ Appears in /packages ✓ Bookable

### 9.7 Admin Manage Blog
**Test Case:** Admin create/edit blog posts
- **Steps:**
  1. Navigate to /admin/blog
  2. Click "Create Post"
  3. Fill: Title, content, featured image
  4. Publish
  5. Expected: Post visible on /blog
- **Success Criteria:** ✓ Post created ✓ SEO tags included ✓ Image uploaded

---

## ✅ TEST SUITE 10: OFFLINE FUNCTIONALITY & SYNC

### 10.1 Offline Booking Queue
**Test Case:** Create booking while offline
- **Steps:**
  1. Open DevTools → Network → Offline mode
  2. Fill booking form
  3. Click "Book Now"
  4. Expected: Booking saved to localStorage
  5. Message: "Booking saved. Will sync when online."
- **Success Criteria:** ✓ Booking in localStorage ✓ User notified ✓ Not lost on refresh

### 10.2 Queue Display
**Test Case:** View queued bookings
- **Steps:**
  1. While offline, make 2-3 bookings
  2. Open browser DevTools → Application → localStorage
  3. Expected: offlineQueue object contains all bookings
  4. Each booking has: id, booking_data, timestamp, status
- **Success Criteria:** ✓ Queue visible ✓ Bookings stored with metadata ✓ Timestamps accurate

### 10.3 Sync on Network Return
**Test Case:** Auto-sync queued bookings when coming online
- **Steps:**
  1. Make offline bookings (see 10.1)
  2. Go Online (toggle offline in DevTools)
  3. Expected: Auto-sync starts
  4. Watch Network tab: POST requests to /api/v1/bookings
  5. Each booking synced: Status changes to "SYNCED"
- **Success Criteria:** ✓ Auto-sync works ✓ No manual action needed ✓ All bookings sent

### 10.4 Sync Status Display
**Test Case:** Show sync status to user
- **Steps:**
  1. During sync, UI shows progress
  2. Expected: "Syncing bookings..." with spinner
  3. After each successful sync: "✓ Booking XXX synced"
  4. All synced: "All bookings synced"
- **Success Criteria:** ✓ Status shown ✓ Progress visible ✓ Completion confirmed

### 10.5 Sync Retry Logic
**Test Case:** Retry failed sync
- **Steps:**
  1. Make offline bookings
  2. Come online, but API returns error (simulate)
  3. Expected: Retry mechanism triggered
  4. Auto-retry every 30 seconds
  5. Max retries: 3, then manual retry button
- **Success Criteria:** ✓ Retries work ✓ Error handled ✓ Bookings not lost

### 10.6 Sync Conflict Resolution
**Test Case:** Handle bookings modified during offline
- **Steps:**
  1. Create booking while offline
  2. During sync, booking already exists (ID conflict)
  3. Expected: Merge logic applied or user prompted
- **Success Criteria:** ✓ No duplicate bookings ✓ Latest version used ✓ User informed

---

## ✅ TEST SUITE 11: ADMIN DASHBOARD & ANALYTICS

### 11.1 Admin Dashboard Overview
**Test Case:** Admin dashboard loads with stats
- **Steps:**
  1. Login as admin
  2. Navigate to /admin
  3. Expected: Dashboard with widgets:
     - Total bookings
     - Confirmed bookings
     - Pending bookings
     - Revenue (today, this month, all-time)
     - Active drivers
- **Success Criteria:** ✓ All widgets load ✓ Numbers accurate ✓ Charts render

### 11.2 Revenue Analytics
**Test Case:** View revenue breakdown
- **Steps:**
  1. On admin dashboard
  2. Look for "Revenue" chart
  3. Expected: Show revenue by date, vehicle type, route
  4. Filter options: Date range, vehicle type
- **Success Criteria:** ✓ Charts displayed ✓ Filters work ✓ Numbers match DB

### 11.3 Booking Analytics
**Test Case:** View booking trends
- **Steps:**
  1. From dashboard
  2. "Bookings" widget shows trend graph
  3. Expected: Show bookings over time (daily/weekly/monthly)
  4. Breakdown: PENDING, CONFIRMED, CANCELLED
- **Success Criteria:** ✓ Graph renders ✓ Trend visible ✓ Breakdown accurate

### 11.4 User Management
**Test Case:** Admin manage users
- **Steps:**
  1. Navigate to /admin/users
  2. Expected: Table of all users
  3. Can: View details, deactivate, reset password
  4. Filter: By status, registration date, activity
- **Success Criteria:** ✓ Users listed ✓ Actions work ✓ Changes applied

### 11.5 Audit Logs
**Test Case:** View system audit log
- **Steps:**
  1. Navigate to /admin/audit-logs
  2. Expected: All system actions logged:
     - User login/logout
     - Booking creation/modification
     - Admin actions
  3. Each log: Timestamp, action, user, details
- **Success Criteria:** ✓ Logs comprehensive ✓ Sortable/filterable ✓ Timestamps accurate

---

## ✅ TEST SUITE 12: ERROR HANDLING & EDGE CASES

### 12.1 Invalid Input Validation
**Test Case:** Form validation on booking
- **Steps:**
  1. On booking form, try to submit with:
     - Empty fields
     - Invalid phone format
     - Invalid email
     - Past date
  2. Expected: Error message for each field
- **Success Criteria:** ✓ All validations work ✓ Clear error messages ✓ Submit disabled

### 12.2 Duplicate Booking Prevention
**Test Case:** Prevent double-booking
- **Steps:**
  1. Fill booking form
  2. Click "Book Now" twice (quick double-click)
  3. Expected: Only one booking created
  4. Second click: Button disabled or error shown
- **Success Criteria:** ✓ No duplicate bookings ✓ Button disabled during submission ✓ Confirmation shown

### 12.3 Expired Token Handling
**Test Case:** Handle expired authentication token
- **Steps:**
  1. Login, get token
  2. Wait for token to expire (or manually expire)
  3. Try to access protected route
  4. Expected: Auto-refresh token OR redirect to login
- **Success Criteria:** ✓ Token refreshed automatically ✓ No manual login needed ✓ Route accessible

### 12.4 Invalid Route Handling
**Test Case:** Handle 404 errors
- **Steps:**
  1. Navigate to non-existent route: http://localhost/invalid-page
  2. Expected: 404 page displayed with home button
- **Success Criteria:** ✓ 404 page shown ✓ Navigation works ✓ Not a blank page

### 12.5 Network Error Handling
**Test Case:** Handle API errors gracefully
- **Steps:**
  1. Make booking
  2. Simulate network error (DevTools → throttle)
  3. Expected: Error message shown
  4. Option to retry
- **Success Criteria:** ✓ Error message clear ✓ Retry works ✓ Not generic error

### 12.6 Concurrent Request Handling
**Test Case:** Handle multiple simultaneous requests
- **Steps:**
  1. Open multiple tabs
  2. Each tab: Make booking simultaneously
  3. Expected: Both complete without race conditions
  4. Each gets unique booking ID
- **Success Criteria:** ✓ No race conditions ✓ No duplicate IDs ✓ All succeed

### 12.7 Large Dataset Handling
**Test Case:** Handle large numbers of bookings
- **Steps:**
  1. Admin view bookings with 10,000+ records
  2. Expected: Pagination loads without lag
  3. Search: Still performant
  4. Filter: <1 second response
- **Success Criteria:** ✓ Pagination smooth ✓ Search fast ✓ No UI freeze

### 12.8 Special Characters in Input
**Test Case:** Handle special characters in text fields
- **Steps:**
  1. Booking form: Enter name with special chars: "José María"
  2. Address with symbols: "123 Main St. #456"
  3. Phone with formatting: "+1 (234) 567-8900"
  4. Expected: All stored and displayed correctly (no encoding issues)
- **Success Criteria:** ✓ Characters preserved ✓ No corruption ✓ Display correct

---

## 🐛 KNOWN ISSUES & NOTES

### Session Management
- JWT refresh token valid for 7 days
- Access token expires in 15 minutes
- Manual logout on other devices not immediate (JWT still valid)

### WebSocket Limitations
- Max 100 concurrent WebSocket connections (configurable)
- Reconnection timeout: 5 seconds
- Message size limit: 64MB

### Database
- Flyway migrations: V001-V016+ applied
- All tables created successfully
- Connection pool: HikariCP (10-20 connections)

### Browser Compatibility
- Chrome/Edge 90+: Full support
- Firefox 88+: Full support
- Safari 14+: Full support
- IE 11: Not supported (no ES6)

---

## 📈 PERFORMANCE EXPECTATIONS

| Operation | Expected Time | Acceptable Range |
|-----------|----------------|------------------|
| Page Load | < 2 seconds | < 3 seconds |
| API Response | < 500ms | < 1 second |
| WebSocket Connection | < 1 second | < 2 seconds |
| Search/Filter | < 500ms | < 1 second |
| Booking Creation | < 1 second | < 2 seconds |
| Image Load | < 2 seconds | < 3 seconds |

---

## ✅ CHECKLIST - USE THIS TO TRACK YOUR TESTING

- [ ] Authentication (Register, Login, Logout, Token Refresh)
- [ ] Guest Booking (Create & Status Lookup)
- [ ] Authenticated Booking (Create & History)
- [ ] Booking Updates & Cancellation
- [ ] Admin Booking Management (View, Search, Filter, Actions)
- [ ] Admin Bulk Operations
- [ ] Profile Management (View, Update, Password Change, Delete)
- [ ] Driver Application & Review
- [ ] Driver Dashboard
- [ ] Real-time Ride Tracking (WebSocket)
- [ ] Fare Calculation
- [ ] Vehicle Management
- [ ] Notifications (Create, Mark Read, Delete)
- [ ] Routes & Popular Destinations
- [ ] Service Cities
- [ ] Travel Packages
- [ ] Blog
- [ ] Offline Booking Queue
- [ ] Sync When Online
- [ ] Admin Dashboard & Analytics
- [ ] Audit Logs
- [ ] Error Handling & Validation
- [ ] Duplicate Prevention
- [ ] Token Expiry & Refresh
- [ ] 404 Error Page
- [ ] Network Error Handling
- [ ] Concurrent Requests
- [ ] Performance Testing
- [ ] Special Characters Handling

---

## 🎯 SUCCESS CRITERIA

All tests should pass with:
- ✅ No crashes or uncaught errors
- ✅ No data loss or corruption
- ✅ No security vulnerabilities exploited
- ✅ Performance within acceptable range
- ✅ All features working as documented
- ✅ Error messages clear and helpful
- ✅ Data consistency across devices
- ✅ No XSS, SQL Injection, or CSRF vulnerabilities
- ✅ Proper access control (users can't access others' data)
- ✅ Graceful degradation on network issues

---

**Document Created:** March 4, 2026
**Version:** 1.0
**Status:** Ready for QA Execution
