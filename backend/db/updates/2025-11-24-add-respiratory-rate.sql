-- Add respiratory rate vital column to health_records
ALTER TABLE health_records
  ADD COLUMN vital_respiratory_rate INT NULL AFTER vital_heart_rate;

-- Optionally, update any existing notes or backfill if needed using a separate script.
