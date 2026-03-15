-- V002: Add missing indexes for performance optimization

CREATE INDEX IF NOT EXISTS idx_vehicle_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_booking_driver_id ON bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_booking_vehicle_id ON bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_refresh_token_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_rating_booking_id ON ratings(booking_id);
