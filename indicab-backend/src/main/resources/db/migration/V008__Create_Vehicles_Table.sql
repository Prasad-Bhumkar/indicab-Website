-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(30) NOT NULL,
  seat_capacity INT,
  price_multiplier DECIMAL(5, 2) NOT NULL DEFAULT 1.0,
  image_url LONGTEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_vehicle_type (type),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample vehicles
INSERT INTO vehicles (name, type, seat_capacity, price_multiplier, is_active) VALUES
('Standard Sedan', 'SEDAN', 4, 1.00, TRUE),
('Luxury Sedan', 'LUXURY', 4, 2.00, TRUE),
('SUV', 'SUV', 5, 1.50, TRUE),
('Premium SUV', 'PREMIUM', 5, 1.80, TRUE),
('Economy Car', 'ECONOMY', 4, 0.80, TRUE),
('XL Van', 'XL', 8, 2.50, TRUE);
