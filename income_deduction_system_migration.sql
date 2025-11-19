-- ===========================================
-- ระบบจัดการเงินได้และเงินหักพนักงาน
-- Income & Deduction Management System
-- ===========================================

-- 1. สร้าง table สำหรับบันทึกรายการเงินได้และเงินหัก
CREATE TABLE IF NOT EXISTS public.income_deduction_records (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL,
  pay_period_month INT NOT NULL, -- เดือนที่ทำงาน (1-12)
  pay_period_year INT NOT NULL, -- ปีที่ทำงาน (ค.ศ.)
  pay_period INT NOT NULL, -- งวดที่จ่าย (1 หรือ 2)
  record_type VARCHAR(20) NOT NULL, -- 'income' หรือ 'deduction'
  item_name VARCHAR(100) NOT NULL, -- ชื่อรายการ เช่น มาสาย, ค่ากะ, คืนพักร้อน
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0, -- จำนวนเงิน
  include_in_sso BOOLEAN NOT NULL DEFAULT false, -- นำไปคำนวณ SSO หรือไม่
  is_fixed BOOLEAN NOT NULL DEFAULT false, -- เป็นค่าคงที่ทุกงวดหรือไม่
  notes TEXT, -- หมายเหตุเพิ่มเติม
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(100), -- ผู้บันทึก
  
  -- Foreign key constraint
  CONSTRAINT fk_income_deduction_employee 
    FOREIGN KEY (employee_id) 
    REFERENCES public.employees(employee_id) 
    ON DELETE CASCADE,
    
  -- Check constraints
  CONSTRAINT chk_record_type CHECK (record_type IN ('income', 'deduction')),
  CONSTRAINT chk_pay_period CHECK (pay_period IN (1, 2)),
  CONSTRAINT chk_pay_period_month CHECK (pay_period_month BETWEEN 1 AND 12),
  CONSTRAINT chk_amount CHECK (amount >= 0)
);

-- 2. สร้าง indexes สำหรับการค้นหาที่เร็วขึ้น
CREATE INDEX IF NOT EXISTS idx_income_deduction_employee_id 
  ON public.income_deduction_records(employee_id);

CREATE INDEX IF NOT EXISTS idx_income_deduction_period 
  ON public.income_deduction_records(pay_period_year, pay_period_month, pay_period);

CREATE INDEX IF NOT EXISTS idx_income_deduction_type 
  ON public.income_deduction_records(record_type);

CREATE INDEX IF NOT EXISTS idx_income_deduction_item_name 
  ON public.income_deduction_records(item_name);

CREATE INDEX IF NOT EXISTS idx_income_deduction_include_sso 
  ON public.income_deduction_records(include_in_sso);

-- 3. สร้าง composite index สำหรับ query ที่ใช้บ่อย
CREATE INDEX IF NOT EXISTS idx_income_deduction_employee_period 
  ON public.income_deduction_records(employee_id, pay_period_year, pay_period_month, pay_period);

-- 4. สร้าง table สำหรับ master data ของรายการเงินได้/เงินหัก
CREATE TABLE IF NOT EXISTS public.income_deduction_master (
  id SERIAL PRIMARY KEY,
  category VARCHAR(20) NOT NULL, -- 'income' หรือ 'deduction'
  item_name VARCHAR(100) NOT NULL UNIQUE, -- ชื่อรายการ
  item_name_th VARCHAR(100) NOT NULL, -- ชื่อภาษาไทย
  include_in_sso BOOLEAN NOT NULL DEFAULT false, -- นำไปคำนวณ SSO หรือไม่
  is_fixed BOOLEAN NOT NULL DEFAULT false, -- เป็นค่าคงที่ทุกงวดหรือไม่
  default_amount DECIMAL(10, 2) DEFAULT 0, -- จำนวนเงินเริ่มต้น
  description TEXT, -- คำอธิบาย
  is_active BOOLEAN NOT NULL DEFAULT true, -- ใช้งานอยู่หรือไม่
  display_order INT DEFAULT 0, -- ลำดับการแสดงผล
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT chk_master_category CHECK (category IN ('income', 'deduction'))
);

-- 5. Insert master data สำหรับรายการเงินหัก
INSERT INTO public.income_deduction_master (category, item_name, item_name_th, include_in_sso, is_fixed, default_amount, description, display_order)
VALUES
  ('deduction', 'late_deduction', 'มาสาย', true, false, 0, 'หักเงินเนื่องจากมาสาย คำนวณ SSO อัตโนมัติ', 1),
  ('deduction', 'absent_deduction', 'ขาดงาน', true, false, 0, 'หักเงินเนื่องจากขาดงาน คำนวณ SSO อัตโนมัติ', 2),
  ('deduction', 'leave_deduction', 'ลากิจ', true, false, 0, 'หักเงินเนื่องจากลากิจเกินกำหนด คำนวณ SSO', 3),
  ('deduction', 'uniform_fee', 'ค่าชุมฟอร์ม', false, false, 0, 'ค่าชุมฟอร์ม (ไม่แน่นอน)', 4),
  ('deduction', 'student_loan', 'หักกยศ', false, false, 0, 'หักค่ากองทุนเงินให้กู้ยืมเพื่อการศึกษา (ไม่แน่นอน)', 5),
  ('deduction', 'cooperative', 'สหกรณ์', false, false, 0, 'หักเงินสหกรณ์ (ไม่แน่นอน)', 6),
  ('deduction', 'defective_work', 'งานเสีย', false, true, 0, 'หักค่างานเสีย (คงที่ทุกงวด)', 7),
  ('deduction', 'funeral_fee', 'ค่าฌาปนกิจ', false, false, 0, 'ค่าฌาปนกิจ (ไม่แน่นอน)', 8),
  ('deduction', 'special_deduction', 'หักค่าพิเศษ', false, false, 0, 'หักค่าพิเศษอื่นๆ (ไม่แน่นอน)', 9),
  ('deduction', 'other_deduction', 'หักค่าอื่นๆ', false, false, 0, 'หักค่าอื่นๆ (ไม่แน่นอน)', 10)
ON CONFLICT (item_name) DO UPDATE SET
  item_name_th = EXCLUDED.item_name_th,
  include_in_sso = EXCLUDED.include_in_sso,
  is_fixed = EXCLUDED.is_fixed,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- 6. Insert master data สำหรับรายการเงินได้
INSERT INTO public.income_deduction_master (category, item_name, item_name_th, include_in_sso, is_fixed, default_amount, description, display_order)
VALUES
  ('income', 'position_allowance', 'ค่าตำแหน่ง', true, true, 0, 'ค่าตำแหน่งคงที่ทุกงวด คำนวณ SSO', 1),
  ('income', 'phone_allowance', 'ค่าโทรศัพท์', true, true, 0, 'ค่าโทรศัพท์คงที่ทุกงวด คำนวณ SSO', 2),
  ('income', 'cost_of_living', 'ค่าครองชีพ', false, false, 0, 'ค่าครองชีพ (ไม่แน่นอน)', 3),
  ('income', 'special_allowance', 'ค่าพิเศษ', false, false, 0, 'ค่าพิเศษ (ไม่แน่นอน)', 4),
  ('income', 'other_allowance', 'ค่าอื่นๆ', false, true, 0, 'ค่าอื่นๆคงที่ทุกงวด', 5),
  ('income', 'other_special', 'ค่าอื่นๆพิเศษ', false, false, 0, 'ค่าอื่นๆพิเศษ (ไม่แน่นอน)', 6),
  ('income', 'diligence_refund', 'คืนเบี้ยขยัน', false, false, 0, 'คืนเบี้ยขยัน (ไม่แน่นอน)', 7),
  ('income', 'vacation_refund', 'คืนพักร้อน', false, false, 0, 'คืนพักร้อน (ไม่แน่นอน)', 8),
  ('income', 'monthly_bonus', 'โบนัสรายเดือน', false, false, 0, 'โบนัสรายเดือน (ไม่แน่นอน)', 9),
  ('income', 'yearly_bonus', 'โบนัสรายปี', false, false, 0, 'โบนัสรายปี (ไม่แน่นอน)', 10),
  ('income', 'shift_allowance', 'ค่ากะ', true, false, 0, 'ค่ากะ คำนวณ SSO (ไม่แน่นอน)', 11)
ON CONFLICT (item_name) DO UPDATE SET
  item_name_th = EXCLUDED.item_name_th,
  include_in_sso = EXCLUDED.include_in_sso,
  is_fixed = EXCLUDED.is_fixed,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- 7. สร้าง table สำหรับบันทึกข้อมูล YTD (Year-To-Date) สำหรับแต่ละพนักงาน
CREATE TABLE IF NOT EXISTS public.employee_ytd_summary (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL,
  year INT NOT NULL, -- ปี ค.ศ.
  ytd_gross_wage DECIMAL(12, 2) DEFAULT 0, -- เงินเดือนสะสม
  ytd_ot_wage DECIMAL(12, 2) DEFAULT 0, -- OT สะสม
  ytd_attendance_bonus DECIMAL(12, 2) DEFAULT 0, -- เบี้ยขยันสะสม
  ytd_income DECIMAL(12, 2) DEFAULT 0, -- รายได้เพิ่มเติมสะสม
  ytd_total_income DECIMAL(12, 2) DEFAULT 0, -- รวมรายได้สะสม
  ytd_sso DECIMAL(12, 2) DEFAULT 0, -- ประกันสังคมสะสม
  ytd_tax DECIMAL(12, 2) DEFAULT 0, -- ภาษีหัก ณ ที่จ่ายสะสม
  ytd_deduction DECIMAL(12, 2) DEFAULT 0, -- รายการหักอื่นๆสะสม
  ytd_total_deduction DECIMAL(12, 2) DEFAULT 0, -- รวมหักสะสม
  ytd_net_wage DECIMAL(12, 2) DEFAULT 0, -- เงินสุทธิสะสม
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key constraint
  CONSTRAINT fk_ytd_employee 
    FOREIGN KEY (employee_id) 
    REFERENCES public.employees(employee_id) 
    ON DELETE CASCADE,
    
  -- Unique constraint
  CONSTRAINT uk_ytd_employee_year UNIQUE (employee_id, year)
);

-- 8. สร้าง indexes สำหรับ YTD table
CREATE INDEX IF NOT EXISTS idx_ytd_employee_id 
  ON public.employee_ytd_summary(employee_id);

CREATE INDEX IF NOT EXISTS idx_ytd_year 
  ON public.employee_ytd_summary(year);

-- 9. สร้าง view สำหรับดูข้อมูลสรุป
CREATE OR REPLACE VIEW public.v_income_deduction_summary AS
SELECT 
  ir.employee_id,
  e.name as employee_name,
  e.department,
  ir.pay_period_year,
  ir.pay_period_month,
  ir.pay_period,
  ir.record_type,
  SUM(ir.amount) as total_amount,
  SUM(CASE WHEN ir.include_in_sso THEN ir.amount ELSE 0 END) as sso_amount,
  COUNT(*) as record_count
FROM public.income_deduction_records ir
LEFT JOIN public.employees e ON ir.employee_id = e.employee_id
GROUP BY 
  ir.employee_id, 
  e.name,
  e.department,
  ir.pay_period_year, 
  ir.pay_period_month, 
  ir.pay_period, 
  ir.record_type;

-- 10. สร้าง function สำหรับอัพเดท updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. สร้าง triggers
CREATE TRIGGER update_income_deduction_records_updated_at
    BEFORE UPDATE ON public.income_deduction_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_deduction_master_updated_at
    BEFORE UPDATE ON public.income_deduction_master
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 12. เพิ่มคอลัมน์ใหม่ในตาราง employees สำหรับค่าคงที่
-- (ถ้ายังไม่มีคอลัมน์เหล่านี้)
DO $$ 
BEGIN
    -- ค่าตำแหน่ง (คงที่)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='employees' AND column_name='position_allowance') THEN
        ALTER TABLE public.employees ADD COLUMN position_allowance DECIMAL(10, 2) DEFAULT 0;
    END IF;
    
    -- ค่าโทรศัพท์ (คงที่)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='employees' AND column_name='phone_allowance') THEN
        ALTER TABLE public.employees ADD COLUMN phone_allowance DECIMAL(10, 2) DEFAULT 0;
    END IF;
    
    -- ค่าอื่นๆคงที่
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='employees' AND column_name='other_allowance') THEN
        ALTER TABLE public.employees ADD COLUMN other_allowance DECIMAL(10, 2) DEFAULT 0;
    END IF;
    
    -- งานเสีย (คงที่)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='employees' AND column_name='defective_work_deduction') THEN
        ALTER TABLE public.employees ADD COLUMN defective_work_deduction DECIMAL(10, 2) DEFAULT 0;
    END IF;
    
    -- ค่าลดหย่อนภาษีส่วนตัว
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='employees' AND column_name='tax_allowance') THEN
        ALTER TABLE public.employees ADD COLUMN tax_allowance DECIMAL(10, 2) DEFAULT 60000;
    END IF;
    
    -- ค่าลดหย่อนคู่สมรส
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='employees' AND column_name='spouse_allowance') THEN
        ALTER TABLE public.employees ADD COLUMN spouse_allowance DECIMAL(10, 2) DEFAULT 0;
    END IF;
    
    -- ค่าลดหย่อนบุตร
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='employees' AND column_name='child_allowance') THEN
        ALTER TABLE public.employees ADD COLUMN child_allowance DECIMAL(10, 2) DEFAULT 0;
    END IF;
    
    -- จำนวนบุตร
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='employees' AND column_name='number_of_children') THEN
        ALTER TABLE public.employees ADD COLUMN number_of_children INT DEFAULT 0;
    END IF;
END $$;

-- 13. สร้าง comments สำหรับ tables และ columns
COMMENT ON TABLE public.income_deduction_records IS 'ตารางบันทึกรายการเงินได้และเงินหักของพนักงานแต่ละงวด';
COMMENT ON TABLE public.income_deduction_master IS 'ตาราง Master Data สำหรับรายการเงินได้และเงินหัก';
COMMENT ON TABLE public.employee_ytd_summary IS 'ตารางสรุปข้อมูลสะสมรายปีของพนักงาน (Year-To-Date)';

COMMENT ON COLUMN public.income_deduction_records.include_in_sso IS 'true = นำไปคำนวณ SSO, false = ไม่นำไปคำนวณ SSO';
COMMENT ON COLUMN public.income_deduction_records.is_fixed IS 'true = ค่าคงที่ทุกงวด, false = ค่าไม่คงที่ (ต้อง input)';

-- 14. Grant permissions (ถ้าต้องการ)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.income_deduction_records TO your_role;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.income_deduction_master TO your_role;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_ytd_summary TO your_role;
-- GRANT SELECT ON public.v_income_deduction_summary TO your_role;

-- ===========================================
-- Migration Complete!
-- ===========================================

-- เพื่อตรวจสอบว่า tables ถูกสร้างแล้ว ให้รัน:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%income_deduction%';
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'employee_ytd_summary';

