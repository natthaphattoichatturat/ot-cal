-- Migration: Add OT breakdown columns to daily_attendance table
-- Created: 2025-01-14
-- Description: Add columns to track different types of OT (normal, special, premium)

-- Add new columns to daily_attendance table
ALTER TABLE daily_attendance
ADD COLUMN IF NOT EXISTS ot_normal_hours NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ot_special_hours NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ot_premium_hours NUMERIC(10, 2) DEFAULT 0;

-- Add comments to describe each column
COMMENT ON COLUMN daily_attendance.ot_normal_hours IS 'OT hours for regular days (multiplied by 1.5)';
COMMENT ON COLUMN daily_attendance.ot_special_hours IS 'OT hours for holidays/Sunday first 8 hours (multiplied by 2)';
COMMENT ON COLUMN daily_attendance.ot_premium_hours IS 'OT hours for holidays/Sunday over 8 hours (multiplied by 3)';

-- Update existing records to set default values (optional, only if you want to backfill)
-- UPDATE daily_attendance
-- SET
--   ot_normal_hours = 0,
--   ot_special_hours = 0,
--   ot_premium_hours = 0
-- WHERE
--   ot_normal_hours IS NULL
--   OR ot_special_hours IS NULL
--   OR ot_premium_hours IS NULL;
