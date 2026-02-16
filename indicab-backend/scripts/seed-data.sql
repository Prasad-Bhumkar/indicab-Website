-- IndiCab Database Seed Data Script
-- This script inserts sample data for testing and demonstration purposes
-- Optional: Run this script after database initialization for testing

USE indicab_website;

-- =============================================
-- Insert Sample Blogs
-- =============================================
INSERT INTO blogs (title, content, author, image_url, status, published_at, created_at, updated_at) VALUES
('Travel Tips for Safe Rides', 'Essential tips for ensuring safe and comfortable rides with IndiCab. Always verify driver information, share your ride details with trusted contacts, and use the in-app features to track your journey in real-time.', 'IndiCab Team', 'https://via.placeholder.com/600x400?text=Safety+Tips', 'PUBLISHED', NOW(), NOW(), NOW()),
('Benefits of Ride Sharing', 'Discover how ride sharing reduces traffic congestion, lowers carbon emissions, and provides affordable transportation. Join thousands of users who are making smart transportation choices with IndiCab.', 'Emma Johnson', 'https://via.placeholder.com/600x400?text=Ride+Sharing', 'PUBLISHED', NOW(), NOW(), NOW()),
('IndiCab App Features Guide', 'A comprehensive guide to using IndiCab features. Learn about real-time tracking, fare estimation, various payment options, and special packages designed to meet your transportation needs.', 'Admin', 'https://via.placeholder.com/600x400?text=App+Guide', 'DRAFT', NULL, NOW(), NOW());

-- =============================================
-- Insert Sample Packages
-- =============================================
INSERT INTO packages (name, description, package_type, base_fare, duration, validity, discount_percentage, features, image_url, is_active, created_at, updated_at) VALUES
('Hourly City Rides', 'Perfect for short city trips and local commutes. Book by the hour with no distance limitations within city limits.', 'hourly', 50.00, '1 Hour', '1 Day', 10.00, 'Unlimited distance,GPS tracking,Cancel anytime', 'https://via.placeholder.com/400x300?text=Hourly', 1, NOW(), NOW()),
('Extended Hourly Package', 'Best for shopping and city exploration. Get 4 hours of ride time with significant savings.', 'hourly', 180.00, '4 Hours', '1 Day', 15.00, 'Unlimited distance,Waits included,Premium vehicles available', 'https://via.placeholder.com/400x300?text=Extended', 1, NOW(), NOW()),
('Regional Weekend Getaway', 'Explore nearby cities and regions. Perfect for weekend trips with flexible timing and comfortable vehicles.', 'regional', 2500.00, 'Full Day', '7 Days', 12.00, 'AC vehicle,Professional driver,Sightseeing assistance', 'https://via.placeholder.com/400x300?text=Regional', 1, NOW(), NOW()),
('National Tour Package', 'Multi-day national tours with experienced drivers and curated routes. All-inclusive experience for family trips.', 'national', 15000.00, '7 Days', '30 Days', 20.00, 'Accommodation assistance,Driver meals,Route planning,24/7 support', 'https://via.placeholder.com/400x300?text=National', 1, NOW(), NOW()),
('Corporate Monthly Package', 'Dedicated ride solutions for corporate clients. Monthly unlimited rides with invoice billing and priority support.', 'corporate', 25000.00, 'Monthly', '30 Days', 25.00, 'Priority booking,Account manager,Expense reports,Flexible cancellation', 'https://via.placeholder.com/400x300?text=Corporate', 1, NOW(), NOW());

-- =============================================
-- Insert Sample Vehicles
-- =============================================
INSERT INTO vehicles (name, type, seat_capacity, price_multiplier, image_url, is_active, created_at, updated_at) VALUES
('Swift Sedan', 'economy', 4, 1.0, 'https://via.placeholder.com/300x200?text=Swift+Sedan', 1, NOW(), NOW()),
('Dzire Compact', 'economy', 4, 0.95, 'https://via.placeholder.com/300x200?text=Dzire', 1, NOW(), NOW()),
('Innova Cab', 'premium', 7, 1.5, 'https://via.placeholder.com/300x200?text=Innova+Cab', 1, NOW(), NOW()),
('Fortuner Premium', 'premium', 7, 1.75, 'https://via.placeholder.com/300x200?text=Fortuner', 1, NOW(), NOW()),
('BMW Executive', 'luxury', 5, 2.5, 'https://via.placeholder.com/300x200?text=BMW+Executive', 1, NOW(), NOW()),
('Mercedes Premium', 'luxury', 4, 3.0, 'https://via.placeholder.com/300x200?text=Mercedes', 1, NOW(), NOW());

-- =============================================
-- Display Sample Data Counts
-- =============================================
SELECT COUNT(*) as BlogCount FROM blogs;
SELECT COUNT(*) as PackageCount FROM packages;
SELECT COUNT(*) as VehicleCount FROM vehicles;

SELECT 'Sample data insertion completed successfully!' as Status;
