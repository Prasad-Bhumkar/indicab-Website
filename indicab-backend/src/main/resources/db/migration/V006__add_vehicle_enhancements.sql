-- V006: Add vehicle enhancement fields

-- Add vehicle insurance and inspection fields
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS insurance_number VARCHAR(100);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS insurance_expiry_date DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS last_inspection_date DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
