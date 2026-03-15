-- V008: Add notification enhancements

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS booking_id BIGINT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url VARCHAR(255);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

ALTER TABLE notifications ADD FOREIGN KEY IF NOT EXISTS fk_notification_booking 
    (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_notification_booking_id ON notifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_notification_created_at ON notifications(created_at DESC);
