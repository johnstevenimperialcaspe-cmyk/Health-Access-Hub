-- Migration: remove vital_respiratory_rate column from health_records

ALTER TABLE health_records
  DROP COLUMN IF EXISTS vital_respiratory_rate;
