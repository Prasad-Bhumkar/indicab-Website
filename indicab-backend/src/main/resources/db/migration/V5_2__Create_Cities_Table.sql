-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_city_name (name),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample cities
INSERT INTO cities (name, latitude, longitude, is_active) VALUES
('Bangalore', 12.9716, 77.5946, TRUE),
('Mysore', 12.2958, 76.6394, TRUE),
('Pune', 18.5204, 73.8567, TRUE),
('Mumbai', 19.0760, 72.8777, TRUE),
('Delhi', 28.7041, 77.1025, TRUE),
('Agra', 27.1767, 78.0081, TRUE),
('Hyderabad', 17.3850, 78.4867, TRUE),
('Vijayawada', 16.5062, 80.6480, TRUE),
('Chennai', 13.0827, 80.2707, TRUE),
('Kolkata', 22.5726, 88.3639, TRUE);
