-- Create routes table for popular routes with fixed pricing
CREATE TABLE IF NOT EXISTS routes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  from_city VARCHAR(100) NOT NULL,
  to_city VARCHAR(100) NOT NULL,
  distance DECIMAL(10, 2) NOT NULL,
  fixed_price DECIMAL(10, 2) NOT NULL,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_from_to (from_city, to_city),
  INDEX idx_is_popular (is_popular)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample popular routes
INSERT INTO routes (from_city, to_city, distance, fixed_price, is_popular) VALUES
('Bangalore', 'Mysore', 140.5, 1200.00, TRUE),
('Bangalore', 'Pune', 580.0, 4500.00, TRUE),
('Delhi', 'Agra', 240.0, 2500.00, TRUE),
('Mumbai', 'Pune', 150.0, 1500.00, TRUE),
('Hyderabad', 'Vijayawada', 290.0, 2000.00, TRUE);
