-- Add new columns to employees table
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS division_code VARCHAR(10), -- รหัสฝ่าย เช่น 001
ADD COLUMN IF NOT EXISTS section_code VARCHAR(10),  -- รหัสแผนก เช่น 001
ADD COLUMN IF NOT EXISTS address TEXT;              -- ที่อยู่

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_employees_division ON employees(division_code);
CREATE INDEX IF NOT EXISTS idx_employees_section ON employees(section_code);
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(name);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);

-- Create employee status tracking (for remove/inactive employees)
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active', -- active, inactive, removed
ADD COLUMN IF NOT EXISTS removed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS removed_by VARCHAR(100),
ADD COLUMN IF NOT EXISTS remarks TEXT; -- หมายเหตุเพิ่มเติม

-- Update existing records to have active status
UPDATE employees SET status = 'active' WHERE status IS NULL;

COMMENT ON COLUMN employees.division_code IS 'รหัสฝ่าย (เช่น 001, 002)';
COMMENT ON COLUMN employees.section_code IS 'รหัสแผนก (เช่น 001, 002)';
COMMENT ON COLUMN employees.address IS 'ที่อยู่พนักงาน';
COMMENT ON COLUMN employees.status IS 'สถานะพนักงาน: active, inactive, removed';
COMMENT ON COLUMN employees.removed_at IS 'วันที่ลบ/ปลดพนักงาน';
COMMENT ON COLUMN employees.removed_by IS 'ผู้ลบ/ปลดพนักงาน';
COMMENT ON COLUMN employees.remarks IS 'หมายเหตุเพิ่มเติม';
