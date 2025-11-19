-- ============================================
-- HR System Enhancement - Database Schema (FIXED)
-- ระบบเงินได้/เงินหัก, ภาษี, และเอกสาร
-- ============================================

-- ============================================
-- 1. ตาราง wage_income_deductions
-- เก็บรายการเงินได้และเงินหักเพิ่มเติมแต่ละงวด
-- ============================================
CREATE TABLE IF NOT EXISTS public.wage_income_deductions (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  wage_period_id INTEGER REFERENCES wage_periods(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  period INTEGER NOT NULL CHECK (period IN (1, 2)),

  -- ประเภทรายการ
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('income', 'deduction')),
  item_name VARCHAR(100) NOT NULL, -- ชื่อรายการ เช่น 'ค่าตำแหน่ง', 'มาสาย', 'ค่ากะ'
  item_code VARCHAR(50), -- รหัสรายการ เช่น 'POSITION_ALLOWANCE', 'LATE_DEDUCTION'

  -- จำนวนเงิน
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,

  -- คุณสมบัติ
  include_in_sso BOOLEAN DEFAULT false, -- นำไปคำนวณ SSO หรือไม่
  is_fixed BOOLEAN DEFAULT false, -- เป็นค่าคงที่ทุกงวดหรือไม่
  is_automatic BOOLEAN DEFAULT false, -- คำนวณอัตโนมัติหรือไม่

  -- หมายเหตุ
  remarks TEXT,

  -- ผู้บันทึก
  created_by VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_income_deductions_employee ON wage_income_deductions(employee_id);
CREATE INDEX IF NOT EXISTS idx_income_deductions_period ON wage_income_deductions(wage_period_id);
CREATE INDEX IF NOT EXISTS idx_income_deductions_type ON wage_income_deductions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_income_deductions_item_code ON wage_income_deductions(item_code);
CREATE INDEX IF NOT EXISTS idx_income_deductions_date ON wage_income_deductions(year, month, period);

-- ============================================
-- 2. ตาราง tax_calculations (Updated)
-- เก็บการคำนวณภาษีแต่ละงวด
-- ============================================
CREATE TABLE IF NOT EXISTS public.tax_calculations (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  wage_period_id INTEGER REFERENCES wage_periods(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  period INTEGER NOT NULL CHECK (period IN (1, 2)),

  -- รายได้ประจำงวด
  period_gross_income NUMERIC(10, 2) DEFAULT 0.00, -- รายได้รวมงวดนี้
  period_taxable_income NUMERIC(10, 2) DEFAULT 0.00, -- รายได้ที่ต้องเสียภาษีงวดนี้

  -- ยอดสะสม YTD (Year-to-Date)
  ytd_gross_income NUMERIC(10, 2) DEFAULT 0.00, -- รายได้รวมสะสมตั้งแต่ต้นปี
  ytd_taxable_income NUMERIC(10, 2) DEFAULT 0.00, -- รายได้ที่ต้องเสียภาษีสะสม
  ytd_tax_paid NUMERIC(10, 2) DEFAULT 0.00, -- ภาษีที่จ่ายไปแล้วสะสม

  -- การประมาณการ
  estimated_annual_income NUMERIC(10, 2) DEFAULT 0.00, -- ประมาณการรายได้ทั้งปี
  expense_deduction NUMERIC(10, 2) DEFAULT 0.00, -- ค่าใช้จ่าย (สูงสุด 100,000)
  personal_deduction NUMERIC(10, 2) DEFAULT 60000.00, -- ค่าลดหย่อนส่วนตัว
  other_deductions NUMERIC(10, 2) DEFAULT 0.00, -- ค่าลดหย่อนอื่นๆ
  net_taxable_income NUMERIC(10, 2) DEFAULT 0.00, -- เงินได้สุทธิที่ต้องเสียภาษี

  -- ภาษี
  estimated_annual_tax NUMERIC(10, 2) DEFAULT 0.00, -- ภาษีที่ต้องเสียทั้งปี (ประมาณการ)
  period_tax_withheld NUMERIC(10, 2) DEFAULT 0.00, -- ภาษีหักงวดนี้

  -- จำนวนงวดที่เหลือ
  remaining_periods INTEGER DEFAULT 0,

  -- วันที่คำนวณ
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='tax_calculations' AND column_name='year') THEN
    ALTER TABLE public.tax_calculations ADD COLUMN year INTEGER NOT NULL DEFAULT 2024;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='tax_calculations' AND column_name='month') THEN
    ALTER TABLE public.tax_calculations ADD COLUMN month INTEGER NOT NULL DEFAULT 1;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='tax_calculations' AND column_name='period') THEN
    ALTER TABLE public.tax_calculations ADD COLUMN period INTEGER NOT NULL DEFAULT 1 CHECK (period IN (1, 2));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='tax_calculations' AND column_name='period_gross_income') THEN
    ALTER TABLE public.tax_calculations ADD COLUMN period_gross_income NUMERIC(10, 2) DEFAULT 0.00;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='tax_calculations' AND column_name='period_taxable_income') THEN
    ALTER TABLE public.tax_calculations ADD COLUMN period_taxable_income NUMERIC(10, 2) DEFAULT 0.00;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='tax_calculations' AND column_name='ytd_gross_income') THEN
    ALTER TABLE public.tax_calculations ADD COLUMN ytd_gross_income NUMERIC(10, 2) DEFAULT 0.00;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='tax_calculations' AND column_name='ytd_taxable_income') THEN
    ALTER TABLE public.tax_calculations ADD COLUMN ytd_taxable_income NUMERIC(10, 2) DEFAULT 0.00;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='tax_calculations' AND column_name='ytd_tax_paid') THEN
    ALTER TABLE public.tax_calculations ADD COLUMN ytd_tax_paid NUMERIC(10, 2) DEFAULT 0.00;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='tax_calculations' AND column_name='estimated_annual_income') THEN
    ALTER TABLE public.tax_calculations ADD COLUMN estimated_annual_income NUMERIC(10, 2) DEFAULT 0.00;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='tax_calculations' AND column_name='expense_deduction') THEN
    ALTER TABLE public.tax_calculations ADD COLUMN expense_deduction NUMERIC(10, 2) DEFAULT 0.00;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='tax_calculations' AND column_name='personal_deduction') THEN
    ALTER TABLE public.tax_calculations ADD COLUMN personal_deduction NUMERIC(10, 2) DEFAULT 60000.00;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='tax_calculations' AND column_name='other_deductions') THEN
    ALTER TABLE public.tax_calculations ADD COLUMN other_deductions NUMERIC(10, 2) DEFAULT 0.00;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='tax_calculations' AND column_name='net_taxable_income') THEN
    ALTER TABLE public.tax_calculations ADD COLUMN net_taxable_income NUMERIC(10, 2) DEFAULT 0.00;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='tax_calculations' AND column_name='estimated_annual_tax') THEN
    ALTER TABLE public.tax_calculations ADD COLUMN estimated_annual_tax NUMERIC(10, 2) DEFAULT 0.00;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='tax_calculations' AND column_name='period_tax_withheld') THEN
    ALTER TABLE public.tax_calculations ADD COLUMN period_tax_withheld NUMERIC(10, 2) DEFAULT 0.00;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='tax_calculations' AND column_name='remaining_periods') THEN
    ALTER TABLE public.tax_calculations ADD COLUMN remaining_periods INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='tax_calculations' AND column_name='calculated_at') THEN
    ALTER TABLE public.tax_calculations ADD COLUMN calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Drop old constraint if exists, add new one
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE table_name='tax_calculations' AND constraint_name='unique_tax_period') THEN
    ALTER TABLE public.tax_calculations DROP CONSTRAINT unique_tax_period;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE table_name='tax_calculations' AND constraint_name='tax_unique_period') THEN
    ALTER TABLE public.tax_calculations ADD CONSTRAINT tax_unique_period UNIQUE (employee_id, year, month, period);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tax_employee ON tax_calculations(employee_id);
CREATE INDEX IF NOT EXISTS idx_tax_year ON tax_calculations(year);
CREATE INDEX IF NOT EXISTS idx_tax_period ON tax_calculations(wage_period_id);

-- ============================================
-- 3. ตาราง ytd_summary
-- สรุปยอดสะสมรายปีของพนักงาน
-- ============================================
CREATE TABLE IF NOT EXISTS public.ytd_summary (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  year INTEGER NOT NULL,

  -- ยอดเงินเดือนและรายได้
  total_salary NUMERIC(10, 2) DEFAULT 0.00, -- เงินเดือนสะสม
  total_income NUMERIC(10, 2) DEFAULT 0.00, -- รายได้รวมสะสม
  total_deductions NUMERIC(10, 2) DEFAULT 0.00, -- รวมหักสะสม

  -- ภาษีและประกันสังคม
  total_tax_withheld NUMERIC(10, 2) DEFAULT 0.00, -- ภาษีหักสะสม
  total_sso_employee NUMERIC(10, 2) DEFAULT 0.00, -- SSO พนักงานจ่ายสะสม
  total_sso_employer NUMERIC(10, 2) DEFAULT 0.00, -- SSO นายจ้างจ่ายสะสม

  -- เงินได้สุทธิ
  net_income NUMERIC(10, 2) DEFAULT 0.00, -- เงินได้สุทธิสะสม

  -- จำนวนงวดที่จ่ายแล้ว
  periods_paid INTEGER DEFAULT 0,

  -- อัพเดทล่าสุด
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT ytd_unique_employee_year UNIQUE (employee_id, year)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ytd_employee ON ytd_summary(employee_id);
CREATE INDEX IF NOT EXISTS idx_ytd_year ON ytd_summary(year);

-- ============================================
-- 4. ตาราง tax_brackets
-- อัตราภาษีเงินได้บุคคลธรรมดาแบบขั้นบันได
-- ============================================
CREATE TABLE IF NOT EXISTS public.tax_brackets (
  id SERIAL PRIMARY KEY,
  min_income NUMERIC(12, 2) NOT NULL, -- รายได้ขั้นต่ำ
  max_income NUMERIC(12, 2), -- รายได้ขั้นสูง (NULL = ไม่จำกัด)
  tax_rate NUMERIC(5, 2) NOT NULL, -- อัตราภาษี (%)
  year INTEGER NOT NULL, -- ปีภาษี (สำหรับกรณีมีการเปลี่ยนแปลง)
  active BOOLEAN DEFAULT true
);

-- Add missing columns if table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='tax_brackets' AND column_name='year') THEN
    ALTER TABLE public.tax_brackets ADD COLUMN year INTEGER NOT NULL DEFAULT 2024;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='tax_brackets' AND column_name='active') THEN
    ALTER TABLE public.tax_brackets ADD COLUMN active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- ข้อมูลอัตราภาษี ปี 2024-2025 (ตามกฎหมายปัจจุบัน)
INSERT INTO tax_brackets (min_income, max_income, tax_rate, year) VALUES
(0, 150000, 0, 2024),
(150001, 300000, 5, 2024),
(300001, 500000, 10, 2024),
(500001, 750000, 15, 2024),
(750001, 1000000, 20, 2024),
(1000001, 2000000, 25, 2024),
(2000001, 5000000, 30, 2024),
(5000001, NULL, 35, 2024)
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_tax_brackets_year ON tax_brackets(year, active);

-- ============================================
-- 5. ตาราง leave_approvals
-- เก็บข้อมูลการอนุมัติการลา
-- ============================================
CREATE TABLE IF NOT EXISTS public.leave_approvals (
  id SERIAL PRIMARY KEY,
  leave_id INTEGER NOT NULL REFERENCES leave_records(id) ON DELETE CASCADE,
  employee_id VARCHAR(20) NOT NULL REFERENCES employees(employee_id),

  -- ผู้อนุมัติ
  approver_id VARCHAR(20) REFERENCES employees(employee_id), -- รหัสพนักงานผู้อนุมัติ
  approver_name VARCHAR(255), -- ชื่อผู้อนุมัติ
  approver_position VARCHAR(100), -- ตำแหน่งผู้อนุมัติ

  -- สถานะการอนุมัติ
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),

  -- หมายเหตุจากผู้อนุมัติ
  approval_note TEXT,

  -- วันที่ดำเนินการ
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leave_approvals_leave ON leave_approvals(leave_id);
CREATE INDEX IF NOT EXISTS idx_leave_approvals_approver ON leave_approvals(approver_id);

-- ============================================
-- 6. ตาราง document_templates
-- เทมเพลตเอกสารต่างๆ
-- ============================================
CREATE TABLE IF NOT EXISTS public.document_templates (
  id SERIAL PRIMARY KEY,
  document_type VARCHAR(50) NOT NULL UNIQUE, -- 'payslip', 'pnd1', 'sso_form', 'cert_50_tawi', 'pnd1_kor'
  document_name VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(20), -- 'per_period', 'monthly', 'yearly'
  template_data JSONB, -- เก็บ template configuration
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- เพิ่มข้อมูลเอกสารพื้นฐาน
INSERT INTO document_templates (document_type, document_name, description, frequency) VALUES
('payslip', 'สลิปเงินเดือน', 'เอกสารแสดงรายละเอียดการจ่ายเงินเดือนแต่ละงวด', 'per_period'),
('pnd1', 'ภ.ง.ด.1', 'แบบแสดงรายการภาษีเงินได้หัก ณ ที่จ่าย (รายเดือน)', 'monthly'),
('sso_form', 'สปส. 1-10', 'แบบรายการเงินสมทบประกันสังคม', 'monthly'),
('cert_50_tawi', 'หนังสือรับรอง 50 ทวิ', 'หนังสือรับรองการหักภาษี ณ ที่จ่าย', 'yearly'),
('pnd1_kor', 'ภ.ง.ด.1 ก', 'รายงานภาษีเงินได้บุคคลธรรมดา (รายปี)', 'yearly')
ON CONFLICT (document_type) DO NOTHING;

-- ============================================
-- 7. ตาราง generated_documents
-- บันทึกเอกสารที่สร้างแล้ว
-- ============================================
CREATE TABLE IF NOT EXISTS public.generated_documents (
  id SERIAL PRIMARY KEY,
  document_type VARCHAR(50) NOT NULL,
  employee_id VARCHAR(20) REFERENCES employees(employee_id),
  year INTEGER NOT NULL,
  month INTEGER,
  period INTEGER CHECK (period IN (1, 2)),

  -- ข้อมูลเอกสาร
  document_data JSONB, -- ข้อมูลในเอกสาร
  file_path TEXT, -- path ของไฟล์ถ้ามีการ export

  -- สถานะ
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'sent')),

  -- วันที่สร้าง
  generated_by VARCHAR(100),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generated_docs_type ON generated_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_generated_docs_employee ON generated_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_generated_docs_period ON generated_documents(year, month, period);

-- ============================================
-- 8. อัพเดทตาราง period_wages
-- เพิ่มคอลัมน์สำหรับเงินได้/หักเพิ่มเติมและภาษี
-- ============================================
ALTER TABLE public.period_wages
ADD COLUMN IF NOT EXISTS additional_income NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS additional_deductions NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS sso_base NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS sso_employee NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS sso_employer NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS tax_withheld NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS net_pay NUMERIC(10, 2) DEFAULT 0.00;

-- เพิ่ม comment
COMMENT ON COLUMN period_wages.additional_income IS 'เงินได้เพิ่มเติม (ค่าตำแหน่ง, ค่าโทรศัพท์, ฯลฯ)';
COMMENT ON COLUMN period_wages.additional_deductions IS 'เงินหักเพิ่มเติม (มาสาย, ขาดงาน, ฯลฯ)';
COMMENT ON COLUMN period_wages.sso_base IS 'ฐานคำนวณ SSO';
COMMENT ON COLUMN period_wages.tax_withheld IS 'ภาษีหัก ณ ที่จ่าย';
COMMENT ON COLUMN period_wages.net_pay IS 'เงินได้สุทธิ (หลังหัก SSO และภาษี)';

-- ============================================
-- 9. ฟังก์ชันคำนวณภาษีแบบขั้นบันได
-- ============================================
CREATE OR REPLACE FUNCTION calculate_progressive_tax(
  taxable_income NUMERIC,
  tax_year INTEGER DEFAULT 2024
)
RETURNS NUMERIC AS $$
DECLARE
  total_tax NUMERIC := 0;
  bracket RECORD;
  taxable_in_bracket NUMERIC;
BEGIN
  FOR bracket IN
    SELECT * FROM tax_brackets
    WHERE year = tax_year AND active = true
    ORDER BY min_income
  LOOP
    IF taxable_income <= bracket.min_income THEN
      EXIT;
    END IF;

    IF bracket.max_income IS NULL THEN
      taxable_in_bracket := taxable_income - bracket.min_income;
    ELSE
      taxable_in_bracket := LEAST(taxable_income, bracket.max_income) - bracket.min_income;
    END IF;

    IF taxable_in_bracket > 0 THEN
      total_tax := total_tax + (taxable_in_bracket * bracket.tax_rate / 100);
    END IF;
  END LOOP;

  RETURN ROUND(total_tax, 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. View สำหรับดึงข้อมูลค่าจ้างพร้อมรายละเอียดทั้งหมด
-- ============================================
CREATE OR REPLACE VIEW v_period_wages_detail AS
SELECT
  pw.*,
  e.name,
  e.department,
  e.position,
  wp.start_date,
  wp.end_date,

  -- รายได้รวม
  (pw.total_base_wage + pw.total_ot1_wage + pw.total_ot2_wage + pw.total_ot3_wage +
   COALESCE(pw.attendance_bonus, 0) + COALESCE(pw.additional_income, 0)) as gross_income,

  -- หักรวม
  (COALESCE(pw.sso_employee, 0) + COALESCE(pw.tax_withheld, 0) +
   COALESCE(pw.additional_deductions, 0)) as total_deductions

FROM period_wages pw
JOIN employees e ON pw.employee_id = e.employee_id
LEFT JOIN wage_periods wp ON pw.wage_period_id = wp.id;

-- ============================================
-- สร้าง Trigger สำหรับอัพเดท updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wage_income_deductions_updated_at
  BEFORE UPDATE ON wage_income_deductions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Grant permissions (สำหรับ Supabase)
-- ============================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ============================================
-- สรุป Schema ที่สร้าง
-- ============================================
-- 1. wage_income_deductions - เก็บรายการเงินได้/เงินหักเพิ่มเติม
-- 2. tax_calculations - คำนวณภาษีแต่ละงวด (updated with new columns)
-- 3. ytd_summary - สรุปยอดสะสมรายปี
-- 4. tax_brackets - อัตราภาษีขั้นบันได
-- 5. leave_approvals - การอนุมัติการลา
-- 6. document_templates - เทมเพลตเอกสาร
-- 7. generated_documents - เอกสารที่สร้างแล้ว
-- 8. period_wages (updated) - เพิ่มคอลัมน์ภาษีและ SSO
-- 9. calculate_progressive_tax() - ฟังก์ชันคำนวณภาษี
-- 10. v_period_wages_detail - View รวมข้อมูลค่าจ้าง

