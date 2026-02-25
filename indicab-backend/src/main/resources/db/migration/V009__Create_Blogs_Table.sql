-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT,
  author VARCHAR(100) NOT NULL,
  image_url LONGTEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_published_at (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample blog posts
INSERT INTO blogs (title, content, author, status, published_at) VALUES
(
  'Top Destinations for Weekend Trips from Bangalore',
  'Discover the most beautiful weekend destinations near Bangalore. From the misty hills of Coorg to the serene temples of Mysore, explore what makes these places special and how Indicab can help you reach them comfortably.',
  'Admin',
  'PUBLISHED',
  NOW()
),
(
  'Tips for Safe and Comfortable Long-Distance Travel',
  'Learn essential tips for making your long-distance journeys safer and more comfortable. From packing tips to health precautions, we cover everything you need to know for a great travel experience.',
  'Admin',
  'PUBLISHED',
  NOW()
),
(
  'The Future of Urban Mobility',
  'Exploring how ride-sharing services like Indicab are reshaping urban transportation. Discover the trends, benefits, and future possibilities of shared mobility.',
  'Admin',
  'DRAFT',
  NULL
);
