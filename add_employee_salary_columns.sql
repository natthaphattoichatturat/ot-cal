-- ============================================
-- เพิ่มคอลัมน์ monthly_salary และ employment_type ให้กับตาราง employees
-- เพื่อรองรับข้อมูลเงินเดือนรายเดือนและประเภทการจ้างงาน
-- ============================================

-- เพิ่มคอลัมน์ monthly_salary (เงินเดือนรายเดือน)
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS monthly_salary NUMERIC(10, 2) DEFAULT 0.00;

-- เพิ่มคอลัมน์ employment_type (ประเภทการจ้างงาน: รายเดือน, รายวัน, ฯลฯ)
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50);

-- เพิ่ม comment เพื่ออธิบาย
COMMENT ON COLUMN employees.monthly_salary IS 'เงินเดือนรายเดือน (บาท)';
COMMENT ON COLUMN employees.employment_type IS 'ประเภทการจ้างงาน (รายเดือน, รายวัน, ชั่วคราว, ฯลฯ)';

-- สร้าง index สำหรับค้นหา
CREATE INDEX IF NOT EXISTS idx_employees_monthly_salary ON employees(monthly_salary);
CREATE INDEX IF NOT EXISTS idx_employees_employment_type ON employees(employment_type);

-- ============================================
-- ตรวจสอบโครงสร้างตารางหลังการเพิ่มคอลัมน์
-- ============================================
-- ใช้คำสั่งนี้เพื่อตรวจสอบ:
-- \d employees;
-- หรือ SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'employees' ORDER BY ordinal_position;
