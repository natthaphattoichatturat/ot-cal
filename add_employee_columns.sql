-- ============================================
-- เพิ่มคอลัมน์ใหม่ให้กับ table employees
-- ============================================

-- เพิ่มคอลัมน์ข้อมูลส่วนตัว
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS section character varying(100),
ADD COLUMN IF NOT EXISTS position character varying(100),
ADD COLUMN IF NOT EXISTS gender character varying(20),
ADD COLUMN IF NOT EXISTS nationality character varying(50),
ADD COLUMN IF NOT EXISTS citizenship character varying(50),
ADD COLUMN IF NOT EXISTS religion character varying(50),
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS start_date date;

-- เพิ่มคอลัมน์เอกสารและภาษี
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS tax_id character varying(20),
ADD COLUMN IF NOT EXISTS social_security character varying(20);

-- เพิ่มคอลัมน์กองทุนและสวัสดิการ (ใช้ numeric สำหรับตัวเลข)
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS provident_fund numeric(10, 2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS company_provident_fund numeric(10, 2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS provident_fund_deduction numeric(10, 2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS social_fund_deduction numeric(10, 2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS life_insurance numeric(10, 2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS housing_loan numeric(10, 2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS teacher_fund numeric(10, 2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS rmf_fund numeric(10, 2) DEFAULT 0.0;

-- เพิ่ม indexes สำหรับคอลัมน์ที่ค้นหาบ่อย
CREATE INDEX IF NOT EXISTS idx_employees_section ON public.employees USING btree (section);
CREATE INDEX IF NOT EXISTS idx_employees_position ON public.employees USING btree (position);
CREATE INDEX IF NOT EXISTS idx_employees_gender ON public.employees USING btree (gender);
CREATE INDEX IF NOT EXISTS idx_employees_start_date ON public.employees USING btree (start_date);

-- ============================================
-- อัพเดทข้อมูลจาก CSV
-- ============================================

-- อัพเดทข้อมูลพนักงาน ID: 20052508
UPDATE public.employees
SET
  section = '1',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1989-03-01',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2012-03-01',
  company_provident_fund = 0.0,
  provident_fund_deduction = 0.0,
  social_fund_deduction = 0.0,
  life_insurance = 0.0,
  housing_loan = 0.0,
  teacher_fund = 0.0,
  rmf_fund = 0.0
WHERE employee_id = '20052508';

-- อัพเดทข้อมูลพนักงาน ID: 20054465
UPDATE public.employees
SET
  section = '1',
  position = 'หัวหน้าแผนก',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1981-09-13',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2017-01-04',
  company_provident_fund = 0.0,
  provident_fund_deduction = 0.0,
  social_fund_deduction = 0.0,
  life_insurance = 0.0,
  housing_loan = 0.0,
  teacher_fund = 0.0,
  rmf_fund = 0.0
WHERE employee_id = '20054465';

-- อัพเดทข้อมูลพนักงาน ID: 20055244
UPDATE public.employees
SET
  section = '1',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1982-03-22',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2020-07-13',
  company_provident_fund = 0.0,
  provident_fund_deduction = 0.0,
  social_fund_deduction = 0.0,
  life_insurance = 0.0,
  housing_loan = 0.0,
  teacher_fund = 0.0,
  rmf_fund = 0.0
WHERE employee_id = '20055244';

-- อัพเดทข้อมูลพนักงาน ID: 20055285
UPDATE public.employees
SET
  section = '1',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1989-09-08',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2020-09-01',
  company_provident_fund = 0.0,
  provident_fund_deduction = 0.0,
  social_fund_deduction = 0.0,
  life_insurance = 0.0,
  housing_loan = 0.0,
  teacher_fund = 0.0,
  rmf_fund = 0.0
WHERE employee_id = '20055285';
