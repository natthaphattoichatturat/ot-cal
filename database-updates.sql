-- Database Schema Updates for LINE Integration
-- Run these queries in Supabase SQL Editor

-- 1. Add line_id column to employees table (if not exists)
ALTER TABLE employees ADD COLUMN IF NOT EXISTS line_id TEXT;

-- 2. Update identity_id type to VARCHAR for 13-digit ID card numbers
ALTER TABLE employees ALTER COLUMN identity_id TYPE VARCHAR(20);

-- 3. Add leave approval columns to leave_records table
ALTER TABLE leave_records ADD COLUMN IF NOT EXISTS leave_able BOOLEAN DEFAULT FALSE;
ALTER TABLE leave_records ADD COLUMN IF NOT EXISTS rejected_reason TEXT;

-- 4. Create index for faster LINE ID lookups
CREATE INDEX IF NOT EXISTS idx_employees_line_id ON employees(line_id);

-- 5. Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);

-- 6. Create index for leave queries
CREATE INDEX IF NOT EXISTS idx_leave_records_employee_date ON leave_records(employee_id, leave_date);

-- 7. Update existing NULL departments to default value (optional)
-- UPDATE employees SET department = 'ไม่ระบุ' WHERE department IS NULL;

-- Verification queries
-- Check if columns were added successfully:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'employees'
  AND column_name IN ('line_id', 'identity_id');

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'leave_records'
  AND column_name IN ('leave_able', 'rejected_reason');

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('employees', 'leave_records');
