-- Database Migration: Separate LINE IDs for Employee and HR LINE OA
-- Execute this in Supabase SQL Editor

-- 1. Add new column for HR LINE OA
ALTER TABLE employees ADD COLUMN IF NOT EXISTS line_id_hr TEXT;

-- 2. Rename existing line_id to line_id_employ for clarity
ALTER TABLE employees RENAME COLUMN line_id TO line_id_employ;

-- 3. Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_employees_line_id_employ ON employees(line_id_employ);
CREATE INDEX IF NOT EXISTS idx_employees_line_id_hr ON employees(line_id_hr);

-- 4. Add comments to columns for documentation
COMMENT ON COLUMN employees.line_id_employ IS 'LINE User ID from Employee LINE OA (Channel ID: 2008436527)';
COMMENT ON COLUMN employees.line_id_hr IS 'LINE User ID from HR LINE OA (Channel ID: 2008409511)';

-- Verification queries
-- Check if columns exist and have correct names
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'employees'
    AND column_name IN ('line_id_employ', 'line_id_hr')
ORDER BY column_name;

-- Check sample data
SELECT
    employee_id,
    name,
    department,
    line_id_employ,
    line_id_hr,
    status
FROM employees
WHERE status = 'active'
ORDER BY employee_id
LIMIT 10;

-- Summary
SELECT
    COUNT(*) as total_employees,
    COUNT(line_id_employ) as registered_employee_line,
    COUNT(line_id_hr) as registered_hr_line,
    COUNT(CASE WHEN line_id_employ IS NOT NULL AND line_id_hr IS NOT NULL THEN 1 END) as registered_both
FROM employees
WHERE status = 'active';
