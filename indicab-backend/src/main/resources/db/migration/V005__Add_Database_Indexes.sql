-- V005__Add_Database_Indexes.sql
-- Database optimization: Add indexes for improved query performance

-- User table indexes
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_driver_status ON users(driver_status);
CREATE INDEX IF NOT EXISTS idx_user_created_at ON users(created_at);

-- Booking table indexes
CREATE INDEX IF NOT EXISTS idx_booking_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_booking_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_booking_from ON bookings(from_location);
CREATE INDEX IF NOT EXISTS idx_booking_to ON bookings(to_location);
CREATE INDEX IF NOT EXISTS idx_booking_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_booking_user_status ON bookings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_booking_date_range ON bookings(date, status);

-- RefreshToken table indexes
CREATE INDEX IF NOT EXISTS idx_refresh_token_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_token_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_token_expiry ON refresh_tokens(expiry_date);

-- Payment table indexes
CREATE INDEX IF NOT EXISTS idx_payment_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_stripe_id ON payments(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payment_created_at ON payments(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_role_created ON users(role, created_at);
CREATE INDEX IF NOT EXISTS idx_booking_user_created ON bookings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_booking_status ON payments(booking_id, status);

-- Add foreign key constraints if not already present
ALTER TABLE bookings ADD CONSTRAINT IF NOT EXISTS fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE refresh_tokens ADD CONSTRAINT IF NOT EXISTS fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE payments ADD CONSTRAINT IF NOT EXISTS fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;
