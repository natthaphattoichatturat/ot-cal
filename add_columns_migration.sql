-- ============================================
-- เพิ่มคอลัมน์ใหม่ให้กับ table employees
-- Run this SQL in Supabase SQL Editor first
-- ============================================

-- เพิ่มคอลัมน์ข้อมูลส่วนตัว
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS department_code character varying(10),
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

-- เพิ่มคอลัมน์กองทุนและสวัสดิการ
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
CREATE INDEX IF NOT EXISTS idx_employees_department_code ON public.employees USING btree (department_code);
CREATE INDEX IF NOT EXISTS idx_employees_section ON public.employees USING btree (section);
CREATE INDEX IF NOT EXISTS idx_employees_position ON public.employees USING btree (position);
CREATE INDEX IF NOT EXISTS idx_employees_gender ON public.employees USING btree (gender);
CREATE INDEX IF NOT EXISTS idx_employees_start_date ON public.employees USING btree (start_date);

-- ตรวจสอบผลลัพธ์
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'employees'
  AND column_name IN (
    'department_code', 'section', 'position', 'gender', 'nationality', 'citizenship',
    'religion', 'birth_date', 'start_date', 'tax_id', 'social_security',
    'provident_fund', 'company_provident_fund', 'provident_fund_deduction',
    'social_fund_deduction', 'life_insurance', 'housing_loan',
    'teacher_fund', 'rmf_fund'
  )
ORDER BY column_name;
