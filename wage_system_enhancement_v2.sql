-- ============================================
-- WAGE SYSTEM ENHANCEMENT V2
-- ระบบคำนวณค่าจ้างแบบละเอียด รองรับพนักงานรายวัน/รายเดือน
-- ============================================

-- 0. เพิ่มคอลัมน์ status ใน employees ถ้ายังไม่มี
ALTER TABLE public.employees 
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 1. ตาราง leave_records สำหรับบันทึกการลา
CREATE TABLE IF NOT EXISTS public.leave_records (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL REFERENCES employees(employee_id),
  leave_date DATE NOT NULL,
  leave_type VARCHAR(50) NOT NULL, -- 'ลากิจ', 'ลาป่วย', 'ลาพักร้อน', etc.
  leave_hours NUMERIC(5,2) DEFAULT 8.0, -- จำนวนชั่วโมงที่ลา (default เต็มวัน 8 ชม.)
  reason TEXT,
  approved_by VARCHAR(100),
  approved_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, leave_date)
);

CREATE INDEX idx_leave_records_employee ON leave_records(employee_id);
CREATE INDEX idx_leave_records_date ON leave_records(leave_date);
CREATE INDEX idx_leave_records_status ON leave_records(status);

-- 2. ตาราง wage_adjustments สำหรับบันทึกเงินเพิ่ม/เงินหัก
CREATE TABLE IF NOT EXISTS public.wage_adjustments (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL REFERENCES employees(employee_id),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  period INTEGER NOT NULL CHECK (period IN (1, 2)),
  adjustment_type VARCHAR(20) NOT NULL, -- 'income' (เงินเพิ่ม) หรือ 'deduction' (เงินหัก)
  category VARCHAR(50) NOT NULL, -- 'โบนัส', 'ค่าล่วงเวลาพิเศษ', 'หักค่าปรับ', 'หักค่าเสียหาย', etc.
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_wage_adjustments_employee ON wage_adjustments(employee_id);
CREATE INDEX idx_wage_adjustments_period ON wage_adjustments(year, month, period);
CREATE INDEX idx_wage_adjustments_type ON wage_adjustments(adjustment_type);

-- 3. ปรับปรุงตาราง wage_summary เพื่อเก็บข้อมูลละเอียดมากขึ้น
-- เพิ่มคอลัมน์ใหม่ใน wage_summary
ALTER TABLE public.wage_summary 
  ADD COLUMN IF NOT EXISTS work_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS leave_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS late_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS late_deduction NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS night_shift_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS night_shift_allowance NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS leave_deduction NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS additional_income NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS additional_deduction NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ot1_hours NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ot2_hours NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ot3_hours NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ot1_wage NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ot2_wage NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ot3_wage NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50);

-- 4. สร้างตาราง wage_details สำหรับเก็บรายละเอียดค่าจ้างแบบละเอียด
CREATE TABLE IF NOT EXISTS public.wage_details (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL REFERENCES employees(employee_id),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  period INTEGER NOT NULL CHECK (period IN (1, 2)),
  
  -- ข้อมูลพื้นฐาน
  employment_type VARCHAR(50), -- 'รายวัน' หรือ 'รายเดือน'
  perday_salary NUMERIC(10,2) DEFAULT 0,
  perhr_salary NUMERIC(10,2) DEFAULT 0,
  monthly_salary NUMERIC(10,2) DEFAULT 0,
  
  -- วันทำงาน
  total_days INTEGER DEFAULT 0, -- จำนวนวันทั้งหมดในงวด
  work_days INTEGER DEFAULT 0, -- จำนวนวันที่มาทำงาน (ไม่นับวันหยุด)
  holiday_work_days INTEGER DEFAULT 0, -- จำนวนวันที่ทำงานในวันหยุด/อาทิตย์
  leave_days INTEGER DEFAULT 0, -- จำนวนวันลา
  absent_days INTEGER DEFAULT 0, -- จำนวนวันขาดงาน
  
  -- ค่าแรงพื้นฐาน
  base_wage NUMERIC(10,2) DEFAULT 0, -- ค่าแรงปกติ
  
  -- OT
  ot1_hours NUMERIC(10,2) DEFAULT 0, -- OT ปกติ (x1.5)
  ot2_hours NUMERIC(10,2) DEFAULT 0, -- OT วันหยุด 8 ชม.แรก (x2 รายวัน, x1 รายเดือน)
  ot3_hours NUMERIC(10,2) DEFAULT 0, -- OT วันหยุดเกิน 8 ชม. (x3)
  ot1_wage NUMERIC(10,2) DEFAULT 0,
  ot2_wage NUMERIC(10,2) DEFAULT 0,
  ot3_wage NUMERIC(10,2) DEFAULT 0,
  total_ot_wage NUMERIC(10,2) DEFAULT 0,
  
  -- เงินเพิ่ม
  night_shift_days INTEGER DEFAULT 0, -- จำนวนวันที่ทำกะดึก
  night_shift_allowance NUMERIC(10,2) DEFAULT 0, -- ค่าเงินกะ (40 บาท/วัน)
  attendance_bonus NUMERIC(10,2) DEFAULT 0, -- เบี้ยขยัน (300 บาท)
  additional_income NUMERIC(10,2) DEFAULT 0, -- เงินเพิ่มอื่นๆ จาก wage_adjustments
  
  -- เงินหัก
  late_minutes INTEGER DEFAULT 0, -- จำนวนนาทีที่มาสายรวม
  late_deduction NUMERIC(10,2) DEFAULT 0, -- เงินหักค่ามาสาย
  leave_deduction NUMERIC(10,2) DEFAULT 0, -- เงินหักค่าลา (สำหรับรายเดือน)
  additional_deduction NUMERIC(10,2) DEFAULT 0, -- เงินหักอื่นๆ จาก wage_adjustments
  
  -- รวมรายได้และหัก
  gross_income NUMERIC(10,2) DEFAULT 0, -- รายได้รวมก่อนหัก
  total_income NUMERIC(10,2) DEFAULT 0, -- รายได้รวมหลังหักมาสาย/ลา
  
  -- หักภาษีและประกัน
  sso NUMERIC(10,2) DEFAULT 0, -- ประกันสังคม
  tax NUMERIC(10,2) DEFAULT 0, -- ภาษี
  total_deduction NUMERIC(10,2) DEFAULT 0, -- รวมเงินหักทั้งหมด
  
  -- เงินสุทธิ
  net_wage NUMERIC(10,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(employee_id, year, month, period)
);

CREATE INDEX idx_wage_details_employee ON wage_details(employee_id);
CREATE INDEX idx_wage_details_period ON wage_details(year, month, period);
CREATE INDEX idx_wage_details_employment_type ON wage_details(employment_type);

-- 5. สร้าง view สำหรับดูข้อมูลค่าจ้างแบบรวม
CREATE OR REPLACE VIEW v_wage_summary AS
SELECT 
  wd.*,
  e.name,
  e.department,
  e.position,
  e.section,
  -- คำนวณสูตรต่างๆ
  CASE 
    WHEN wd.employment_type = 'รายวัน' THEN wd.work_days
    ELSE wd.total_days - wd.leave_days
  END as effective_work_days,
  wd.base_wage + wd.total_ot_wage + wd.night_shift_allowance + wd.attendance_bonus + wd.additional_income as total_earnings,
  wd.late_deduction + wd.leave_deduction + wd.additional_deduction + wd.sso + wd.tax as total_all_deductions
FROM wage_details wd
JOIN employees e ON wd.employee_id = e.employee_id;

-- 6. สร้างตาราง wage_calculation_log สำหรับ debug
CREATE TABLE IF NOT EXISTS public.wage_calculation_log (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  period INTEGER NOT NULL,
  calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB, -- เก็บรายละเอียดการคำนวณทั้งหมด
  errors TEXT,
  success BOOLEAN DEFAULT true
);

CREATE INDEX idx_wage_calc_log_employee ON wage_calculation_log(employee_id);
CREATE INDEX idx_wage_calc_log_period ON wage_calculation_log(year, month, period);

-- 7. Comment อธิบายโครงสร้าง
COMMENT ON TABLE leave_records IS 'บันทึกการลาของพนักงาน';
COMMENT ON TABLE wage_adjustments IS 'บันทึกเงินเพิ่ม/เงินหักพิเศษที่ HR เพิ่มเข้ามา';
COMMENT ON TABLE wage_details IS 'รายละเอียดค่าจ้างแบบละเอียดทุกรายการ สำหรับออกสลิปเงินเดือน';
COMMENT ON TABLE wage_calculation_log IS 'Log การคำนวณค่าจ้างเพื่อ debug';

-- 8. Sample data สำหรับทดสอบ
-- INSERT INTO leave_records (employee_id, leave_date, leave_type, reason, status)
-- VALUES ('20052403', '2025-10-29', 'ลากิจ', 'ธุระส่วนตัว', 'approved');

COMMENT ON COLUMN wage_details.ot1_hours IS 'OT ปกติในวันธรรมดา คูณ 1.5';
COMMENT ON COLUMN wage_details.ot2_hours IS 'OT วันหยุด 8 ชม.แรก - รายวัน: x2, รายเดือน: x1';
COMMENT ON COLUMN wage_details.ot3_hours IS 'OT วันหยุดเกิน 8 ชม. คูณ 3';

