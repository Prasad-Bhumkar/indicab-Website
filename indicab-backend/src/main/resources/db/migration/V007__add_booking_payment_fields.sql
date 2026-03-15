-- V007: Add payment tracking fields to bookings

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tip_amount DECIMAL(10, 2) DEFAULT 0;

-- Index for payment status
CREATE INDEX IF NOT EXISTS idx_booking_payment_status ON bookings(payment_status);
