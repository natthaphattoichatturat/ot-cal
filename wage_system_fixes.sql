-- ============================================================================
-- Wage System Fixes & Enhancements
-- วันที่: 13 ธันวาคม 2568
-- ============================================================================

-- 1. อัพเดท leave_records table: เพิ่ม is_paid column
-- ============================================================================
-- เพิ่ม column is_paid เพื่อแยกประเภทการลาที่หักเงิน vs ไม่หักเงิน

ALTER TABLE leave_records
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN leave_records.is_paid IS 'true = ไม่หักเงิน (ลาป่วย, ลาพักร้อน), false = หักเงิน (ลากิจ, ลาคลอด)';

-- Update ข้อมูลเดิมให้ตรงตามประเภทการลา
UPDATE leave_records
SET is_paid = CASE
  WHEN LOWER(leave_type) IN ('ลาป่วย', 'ลาพักร้อน', 'sick_leave', 'annual_leave') THEN TRUE
  ELSE FALSE
END
WHERE is_paid IS NULL;


-- 2. เพิ่ม indexes สำหรับ performance
-- ============================================================================

-- Index สำหรับ query leave_records ตามวันที่และพนักงาน
CREATE INDEX IF NOT EXISTS idx_leave_records_employee_date
ON leave_records(employee_id, leave_date);

-- Index สำหรับ query attendance ตาม employee และวันที่
CREATE INDEX IF NOT EXISTS idx_daily_attendance_employee_date
ON daily_attendance(employee_id, work_date);

-- Index สำหรับ query wage_details
CREATE INDEX IF NOT EXISTS idx_wage_details_employee_period
ON wage_details(employee_id, year, month, period);


-- 3. ตรวจสอบและสร้าง wage_details table (ถ้ายังไม่มี)
-- ============================================================================

CREATE TABLE IF NOT EXISTS wage_details (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  period INTEGER NOT NULL CHECK (period IN (1, 2)),

  -- ข้อมูลพนักงาน
  employment_type VARCHAR(50),
  perday_salary NUMERIC(10,2) DEFAULT 0,
  perhr_salary NUMERIC(10,2) DEFAULT 0,
  monthly_salary NUMERIC(10,2) DEFAULT 0,

  -- วันทำงาน
  total_days INTEGER DEFAULT 0,
  work_days INTEGER DEFAULT 0,
  holiday_work_days INTEGER DEFAULT 0,
  leave_days INTEGER DEFAULT 0,
  absent_days INTEGER DEFAULT 0,

  -- ค่าจ้างและ OT
  base_wage NUMERIC(10,2) DEFAULT 0,
  ot1_hours NUMERIC(10,2) DEFAULT 0,
  ot2_hours NUMERIC(10,2) DEFAULT 0,
  ot3_hours NUMERIC(10,2) DEFAULT 0,
  ot1_wage NUMERIC(10,2) DEFAULT 0,
  ot2_wage NUMERIC(10,2) DEFAULT 0,
  ot3_wage NUMERIC(10,2) DEFAULT 0,
  total_ot_wage NUMERIC(10,2) DEFAULT 0,

  -- เงินเพิ่ม
  night_shift_days INTEGER DEFAULT 0,
  night_shift_allowance NUMERIC(10,2) DEFAULT 0,
  attendance_bonus NUMERIC(10,2) DEFAULT 0,
  additional_income NUMERIC(10,2) DEFAULT 0,

  -- เงินหัก
  late_minutes INTEGER DEFAULT 0,
  late_deduction NUMERIC(10,2) DEFAULT 0,
  leave_deduction NUMERIC(10,2) DEFAULT 0,
  additional_deduction NUMERIC(10,2) DEFAULT 0,

  -- รวมรายได้และหัก
  gross_income NUMERIC(10,2) DEFAULT 0,
  total_income NUMERIC(10,2) DEFAULT 0,
  sso NUMERIC(10,2) DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  total_deduction NUMERIC(10,2) DEFAULT 0,
  net_wage NUMERIC(10,2) DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(employee_id, year, month, period)
);

COMMENT ON TABLE wage_details IS 'ตารางเก็บรายละเอียดค่าจ้างแบบละเอียด (V2) สำหรับทั้งพนักงานรายวันและรายเดือน';


-- 4. ตรวจสอบและสร้าง wage_adjustments table (ถ้ายังไม่มี)
-- ============================================================================

CREATE TABLE IF NOT EXISTS wage_adjustments (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  period INTEGER NOT NULL CHECK (period IN (1, 2)),

  adjustment_type VARCHAR(20) NOT NULL CHECK (adjustment_type IN ('income', 'deduction')),
  category VARCHAR(100) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE wage_adjustments IS 'ตารางสำหรับเพิ่ม/หักเงินพิเศษ (เช่น โบนัส, ค่าปรับ)';


-- 5. ตรวจสอบว่า daily_attendance มี multiplied fields หรือยัง
-- ============================================================================

ALTER TABLE daily_attendance
ADD COLUMN IF NOT EXISTS ot_normal_hours_multiplied NUMERIC(10,2) DEFAULT 0;

ALTER TABLE daily_attendance
ADD COLUMN IF NOT EXISTS ot_special_hours_multiplied NUMERIC(10,2) DEFAULT 0;

ALTER TABLE daily_attendance
ADD COLUMN IF NOT EXISTS ot_premium_hours_multiplied NUMERIC(10,2) DEFAULT 0;

ALTER TABLE daily_attendance
ADD COLUMN IF NOT EXISTS ot_hours_multiplied NUMERIC(10,2) DEFAULT 0;

COMMENT ON COLUMN daily_attendance.ot_normal_hours IS 'ชั่วโมง OT ปกติ (จริง ไม่คูณ)';
COMMENT ON COLUMN daily_attendance.ot_special_hours IS 'ชั่วโมง OT พิเศษ (จริง ไม่คูณ)';
COMMENT ON COLUMN daily_attendance.ot_premium_hours IS 'ชั่วโมง OT ขั้นสูง (จริง ไม่คูณ)';
COMMENT ON COLUMN daily_attendance.ot_hours IS 'ชั่วโมง OT รวม (จริง ไม่คูณ)';

COMMENT ON COLUMN daily_attendance.ot_normal_hours_multiplied IS 'ชั่วโมง OT ปกติที่คำนวณแล้ว (×1.5)';
COMMENT ON COLUMN daily_attendance.ot_special_hours_multiplied IS 'ชั่วโมง OT พิเศษที่คำนวณแล้ว (รายวัน ×2, รายเดือน ×1)';
COMMENT ON COLUMN daily_attendance.ot_premium_hours_multiplied IS 'ชั่วโมง OT ขั้นสูงที่คำนวณแล้ว (×3)';
COMMENT ON COLUMN daily_attendance.ot_hours_multiplied IS 'ชั่วโมง OT รวมที่คำนวณแล้ว';


-- 6. ตรวจสอบ employees table มี monthly_salary และ employment_type หรือยัง
-- ============================================================================

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS monthly_salary NUMERIC(10,2) DEFAULT 0;

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50) DEFAULT 'รายวัน';

COMMENT ON COLUMN employees.monthly_salary IS 'เงินเดือนต่องวด (สำหรับพนักงานรายเดือน)';
COMMENT ON COLUMN employees.employment_type IS 'ประเภทพนักงาน: รายวัน หรือ รายเดือน';

-- Update ค่า employment_type จาก perday_salary และ monthly_salary
UPDATE employees
SET employment_type = CASE
  WHEN monthly_salary > 0 THEN 'รายเดือน'
  ELSE 'รายวัน'
END
WHERE employment_type IS NULL OR employment_type = '';


-- 7. สร้าง View สำหรับ Summary ข้อมูล
-- ============================================================================

CREATE OR REPLACE VIEW wage_summary_view AS
SELECT
  wd.employee_id,
  e.name,
  e.department,
  e.employment_type,
  wd.year,
  wd.month,
  wd.period,
  wd.work_days,
  wd.leave_days,
  wd.base_wage,
  wd.total_ot_wage,
  wd.night_shift_allowance,
  wd.attendance_bonus,
  wd.gross_income,
  wd.late_deduction,
  wd.leave_deduction,
  wd.sso,
  wd.tax,
  wd.total_deduction,
  wd.net_wage,
  wd.updated_at
FROM wage_details wd
LEFT JOIN employees e ON wd.employee_id = e.employee_id
ORDER BY wd.year DESC, wd.month DESC, wd.period DESC, e.name;

COMMENT ON VIEW wage_summary_view IS 'View สำหรับดูสรุปค่าจ้างพนักงานทั้งหมด';


-- 8. สร้าง Function สำหรับ Auto Update updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger ให้ wage_details
DROP TRIGGER IF EXISTS update_wage_details_updated_at ON wage_details;
CREATE TRIGGER update_wage_details_updated_at
  BEFORE UPDATE ON wage_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger ให้ wage_adjustments
DROP TRIGGER IF EXISTS update_wage_adjustments_updated_at ON wage_adjustments;
CREATE TRIGGER update_wage_adjustments_updated_at
  BEFORE UPDATE ON wage_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- 9. Verification Queries (ให้ Run เพื่อตรวจสอบ)
-- ============================================================================

-- ตรวจสอบว่ามี columns ครบหรือยัง
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'leave_records'
  AND column_name = 'is_paid';

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'daily_attendance'
  AND column_name LIKE '%multiplied%'
ORDER BY ordinal_position;

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'employees'
  AND column_name IN ('monthly_salary', 'employment_type')
ORDER BY ordinal_position;

-- ตรวจสอบจำนวนพนักงานแต่ละประเภท
SELECT
  employment_type,
  COUNT(*) as count,
  AVG(monthly_salary) as avg_monthly_salary,
  AVG(perday_salary) as avg_perday_salary
FROM employees
GROUP BY employment_type;


-- 10. สร้าง Sample Data สำหรับ Testing (Optional)
-- ============================================================================

-- เพิ่มพนักงานตัวอย่าง (รายเดือน)
-- INSERT INTO employees (employee_id, name, department, perhr_salary, perday_salary, monthly_salary, employment_type, status)
-- VALUES
--   ('TEST001', 'ทดสอบ รายเดือน', 'IT', 70, 560, 6000, 'รายเดือน', 'active'),
--   ('TEST002', 'ทดสอบ รายวัน', 'Production', 70, 560, 0, 'รายวัน', 'active');

-- เพิ่มข้อมูลการลาตัวอย่าง
-- INSERT INTO leave_records (employee_id, leave_date, leave_type, leave_hours, status, is_paid)
-- VALUES
--   ('TEST001', '2025-12-15', 'ลาป่วย', 8, 'approved', TRUE),
--   ('TEST001', '2025-12-16', 'ลากิจ', 8, 'approved', FALSE);


-- ============================================================================
-- สิ้นสุด Migration Script
-- ============================================================================

COMMIT;
