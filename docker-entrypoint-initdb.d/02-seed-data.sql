-- ============================================================================
-- IndiCab Seed Data
-- ============================================================================
-- This script populates the database with sample data for development/testing.
-- Run after the schema has been created by Flyway/Hibernate.
-- Usage: docker exec -i indicab-mysql-1 mysql -u root -proot indicab_website < docker-entrypoint-initdb.d/02-seed-data.sql
-- ============================================================================

-- ============================================================================
-- 1. USERS
-- ============================================================================
-- Passwords are BCrypt hashed (strength 10). $2b$ is compatible with Spring Security.
-- admin@indicab.com / admin123 (ROLE_ADMIN)
-- john@example.com / password123 (ROLE_CUSTOMER)
INSERT INTO users (address, created_at, deleted_at, driver_applied_at, driver_approved_at, driver_status, email, license_number, name, password, phone, role, updated_at, vehicle_type)
VALUES
('123 Admin Street, Delhi', NOW(), NULL, NULL, NULL, NULL, 'admin@indicab.com', NULL, 'Admin User', '$2a$10$P0UwylHeIRuntNUND7IybuZIocfPog6S6pOFZ1YNxKv5Rkly3nrqe', '+91-9876543210', 'ADMIN', NOW(), NULL),
('456 Customer Road, Mumbai', NOW(), NULL, NULL, NULL, NULL, 'john@example.com', NULL, 'John Doe', '$2a$10$hTUrLlyr.Lyhk/9UDN4wuOZ.qwQCIJYntgbHBGM.zVOCjLjkQRKWC', '+91-9876543211', 'CUSTOMER', NOW(), NULL);

-- ============================================================================
-- 2. ROUTES (Popular intercity routes)
-- ============================================================================
INSERT INTO routes (created_at, distance, fixed_price, from_city, is_popular, to_city, updated_at)
VALUES
(NOW(), 25, 250, 'Delhi', 1, 'Noida', NOW()),
(NOW(), 150, 800, 'Mumbai', 1, 'Pune', NOW()),
(NOW(), 140, 500, 'Bangalore', 1, 'Mysore', NOW()),
(NOW(), 580, 900, 'Chennai', 1, 'Hyderabad', NOW()),
(NOW(), 350, 600, 'Kolkata', 1, 'Darjeeling', NOW()),
(NOW(), 30, 300, 'Delhi', 1, 'Gurgaon', NOW()),
(NOW(), 200, 700, 'Mumbai', 1, 'Surat', NOW()),
(NOW(), 50, 350, 'Bangalore', 1, 'Whitefield', NOW());

-- ============================================================================
-- 3. SERVICE CITIES
-- ============================================================================
INSERT INTO service_city (name)
VALUES
('Delhi'),
('Mumbai'),
('Bangalore'),
('Hyderabad'),
('Chennai'),
('Kolkata'),
('Pune'),
('Ahmedabad'),
('Jaipur'),
('Lucknow'),
('Chandigarh'),
('Goa');

-- ============================================================================
-- 4. RECOMMENDATIONS
-- ============================================================================
INSERT INTO recommendation (image, location, price, rating, reviews, title)
VALUES
('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=300&fit=crop', 'Downtown Area', '150', '4.8', '342', 'Quick City Ride'),
('https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=300&fit=crop', 'Airport Route', '500', '4.9', '856', 'Airport Transfer'),
('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop', 'Mountain Route', '1200', '4.7', '512', 'Weekend Getaway'),
('https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=500&h=300&fit=crop', 'Business District', '200', '4.6', '678', 'Evening Commute'),
('https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=500&h=300&fit=crop', 'Coastal Area', '800', '4.8', '423', 'Beach Trip'),
('https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=500&h=300&fit=crop', 'City Center', '180', '4.5', '267', 'Night Ride');

-- ============================================================================
-- 5. VEHICLES
-- ============================================================================
INSERT INTO vehicles (created_at, image_url, is_active, name, price_multiplier, seat_capacity, type, updated_at)
VALUES
(NOW(), 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500&h=300&fit=crop', 1, 'Standard Sedan', 1.0, 4, 'SEDAN', NOW()),
(NOW(), 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&h=300&fit=crop', 1, 'Premium SUV', 1.5, 6, 'SUV', NOW()),
(NOW(), 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=500&h=300&fit=crop', 1, 'Luxury Sedan', 2.0, 4, 'LUXURY', NOW()),
(NOW(), 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop', 1, 'Economy Hatchback', 0.8, 4, 'HATCHBACK', NOW());

-- ============================================================================
-- 6. PACKAGES
-- ============================================================================
INSERT INTO packages (base_fare, created_at, description, discount_percentage, duration, features, image_url, is_active, name, package_type, updated_at, validity)
VALUES
(500, NOW(), 'Perfect for local travel within the city. Up to 50 km coverage.', 5.00, '4 hours', 'AC Cab, Driver Allowance, Fuel Included', 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=500&h=300&fit=crop', 1, 'City Hourly Package', 'HOURLY', NOW(), 'Same day'),
(2000, NOW(), 'Ideal for intercity trips. Complete outstation travel solution.', 10.00, '12 hours', 'Round Trip, Toll Included, Night Halt Allowance', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&h=300&fit=crop', 1, 'Outstation Round Trip', 'REGIONAL', NOW(), '3 days'),
(5000, NOW(), 'Comprehensive travel package for long distance journeys.', 15.00, '24 hours', 'Multi-city, Hotel Booking Assistance, Flexible Route', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop', 1, 'National Travel Package', 'NATIONAL', NOW(), '7 days'),
(3000, NOW(), 'Corporate travel solution for business professionals.', 20.00, '8 hours', 'GST Invoice, Priority Support, Fleet Tracking', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=300&fit=crop', 1, 'Corporate Business Package', 'CORPORATE', NOW(), '1 month');

-- ============================================================================
-- 7. BLOGS
-- ============================================================================
INSERT INTO blogs (author, content, created_at, image_url, published_at, status, title, updated_at)
VALUES
('IndiCab Team', 'Traveling solo is one of the most empowering experiences. Whether you are exploring a new city or commuting within your own, safety should always come first. Here are 10 essential safety tips for solo travelers using ride-sharing services:

1. **Verify your ride** – Always check the license plate, driver name, and car model before getting in.
2. **Share your trip** – Use the share trip feature to let friends/family track your journey in real-time.
3. **Sit in the back** – This gives you space and easy exit on either side.
4. **Trust your instincts** – If something feels off, cancel the ride and book another.
5. **Keep valuables hidden** – Phones, wallets, and jewelry should stay out of sight.
6. **Use in-app emergency features** – Familiarize yourself with the SOS button before you ride.
7. **Avoid sharing personal information** – Keep conversations casual.
8. **Check the route** – Follow along on your map to ensure the driver stays on course.
9. **Travel during busy hours** – Daytime rides are generally safer.
10. **Rate your experience** – Your feedback helps keep the community safe for everyone.

Stay safe and happy traveling!', NOW(), 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=500&h=300&fit=crop', NOW(), 'PUBLISHED', '10 Essential Safety Tips for Solo Travelers', NOW()),
('IndiCab Team', 'India is a land of diverse landscapes, cultures, and experiences. While trains and flights connect the country, there is something special about hitting the open road. Here are the top 5 road trip destinations you must explore:

## 1. Mumbai to Goa
The ultimate Indian road trip. NH66 takes you along the picturesque Western Ghats with stunning coastal views.

## 2. Manali to Leh
A high-altitude adventure through some of the most breathtaking mountain passes in the world.

## 3. Bangalore to Coorg
A short drive through coffee plantations and misty hills. Perfect for a weekend getaway.

## 4. Delhi to Jaipur
The golden triangle road trip taking you through vibrant Rajasthan with its forts and palaces.

## 5. Chennai to Pondicherry
A scenic coastal drive ending in the charming French-colonial town of Pondicherry.

Book your next road trip with IndiCab and enjoy comfortable, reliable rides!', NOW(), 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop', NOW(), 'PUBLISHED', 'Top 5 Road Trip Destinations in India', NOW()),
('IndiCab Team', 'Planning a trip but worried about the budget? Here are 10 money-saving tips for your next adventure:

1. **Book in advance** – Early bookings often come with discounts.
2. **Travel off-peak** – Avoid weekends and holidays for lower fares.
3. **Share rides** – Split costs with friends or use shared ride options.
4. **Use package deals** – Our travel packages offer great value for money.
5. **Pack light** – Avoid extra luggage charges.
6. **Choose the right vehicle** – Economy options for short trips, premium for long comfort.
7. **Use promo codes** – Keep an eye out for special offers and discounts.
8. **Plan your route** – Avoid unnecessary detours and toll roads.
9. **Join loyalty programs** – Earn points on every ride.
10. **Track your expenses** – Use the app to monitor your travel spending.

With IndiCab, you get affordable rates without compromising on safety or comfort!', NOW(), 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=500&h=300&fit=crop', NOW(), 'PUBLISHED', '10 Money-Saving Tips for Smart Travelers', NOW());

-- ============================================================================
-- 8. BOOKINGS (sample bookings linked to John Doe)
-- ============================================================================
INSERT INTO bookings (amount, contact_preference, created_at, date, dropoff_address, email, from_location, full_name, license, passenger_count, phone_number, pickup_address, special_requirements, status, to_location, updated_at, vehicle, user_id)
VALUES
(250, 'PHONE', NOW(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Noida Sector 18', 'john@example.com', 'Delhi Connaught Place', 'John Doe', NULL, 2, '+91-9876543211', 'Connaught Place, Delhi', NULL, 'CONFIRMED', 'Noida Sector 18', NOW(), 'Standard Sedan', 2),
(800, 'EMAIL', NOW(), DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Pune Station', 'john@example.com', 'Mumbai Airport', 'John Doe', 'DL-123456', 3, '+91-9876543211', 'Chhatrapati Shivaji Maharaj International Airport', 'Need extra luggage space', 'PENDING', 'Pune Railway Station', NOW(), 'Premium SUV', 2),
(500, 'PHONE', NOW(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Mysore Palace', 'john@example.com', 'Bangalore MG Road', 'John Doe', NULL, 4, '+91-9876543211', 'MG Road, Bangalore', NULL, 'PENDING', 'Mysore Palace', NOW(), 'Standard Sedan', 2);
