-- V009: Add driver rating summary fields

-- Add rating summary to users table for quick queries
ALTER TABLE users ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_ratings INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_rides INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(15, 2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_user_average_rating ON users(average_rating DESC);
