-- V003: Add constraint and unique indexes

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_unique ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicle_registration ON vehicles(registration_number);
