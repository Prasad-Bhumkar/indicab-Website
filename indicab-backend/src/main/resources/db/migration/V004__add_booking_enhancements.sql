-- V004: Add booking enhancements

-- Add cancellation reason column if not exists
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP NULL;

-- Add composite index for status and date filtering
CREATE INDEX IF NOT EXISTS idx_booking_status_date ON bookings(status, created_at DESC);
