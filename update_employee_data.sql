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
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
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
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
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
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
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
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055285';

-- อัพเดทข้อมูลพนักงาน ID: 20055353
UPDATE public.employees
SET
  section = '1',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1997-10-31',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-01-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055353';

-- อัพเดทข้อมูลพนักงาน ID: 20055709
UPDATE public.employees
SET
  section = '1',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1998-12-14',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-04-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055709';

-- อัพเดทข้อมูลพนักงาน ID: 20055881
UPDATE public.employees
SET
  section = '1',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2003-09-29',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-04-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055881';

-- อัพเดทข้อมูลพนักงาน ID: 20055882
UPDATE public.employees
SET
  section = '1',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2001-03-13',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-04-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055882';

-- อัพเดทข้อมูลพนักงาน ID: 20055895
UPDATE public.employees
SET
  section = '1',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2001-06-10',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-05-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055895';

-- อัพเดทข้อมูลพนักงาน ID: 20055897
UPDATE public.employees
SET
  section = '1',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1999-12-14',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-05-03',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055897';

-- อัพเดทข้อมูลพนักงาน ID: 20056217
UPDATE public.employees
SET
  section = '1',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1999-01-22',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-06-17',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056217';

-- อัพเดทข้อมูลพนักงาน ID: 20056237
UPDATE public.employees
SET
  section = '1',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2002-09-01',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-07-05',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056237';

-- อัพเดทข้อมูลพนักงาน ID: 20056291
UPDATE public.employees
SET
  section = '1',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2000-06-13',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-08-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056291';

-- อัพเดทข้อมูลพนักงาน ID: 20056359
UPDATE public.employees
SET
  section = '1',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2002-12-27',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-11-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056359';

-- อัพเดทข้อมูลพนักงาน ID: 20056372
UPDATE public.employees
SET
  section = '1',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2004-08-22',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-02-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056372';

-- อัพเดทข้อมูลพนักงาน ID: 20056386
UPDATE public.employees
SET
  section = '1',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1998-06-28',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-04-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056386';

-- อัพเดทข้อมูลพนักงาน ID: 20056395
UPDATE public.employees
SET
  section = '1',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2007-04-04',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-04-28',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056395';

-- อัพเดทข้อมูลพนักงาน ID: 20056470
UPDATE public.employees
SET
  section = '1',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2003-06-03',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-07-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056470';

-- อัพเดทข้อมูลพนักงาน ID: 20056540
UPDATE public.employees
SET
  section = '1',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2005-03-15',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-18',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056540';

-- อัพเดทข้อมูลพนักงาน ID: 20056561
UPDATE public.employees
SET
  section = '1',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2000-01-28',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056561';

-- อัพเดทข้อมูลพนักงาน ID: 20054903
UPDATE public.employees
SET
  section = '3',
  position = 'หัวหน้าแผนก',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1973-10-21',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2018-11-01',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054903';

-- อัพเดทข้อมูลพนักงาน ID: 20055532
UPDATE public.employees
SET
  section = '3',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1985-05-17',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-08-17',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055532';

-- อัพเดทข้อมูลพนักงาน ID: 20056174
UPDATE public.employees
SET
  section = '3',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2002-04-29',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-05-13',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056174';

-- อัพเดทข้อมูลพนักงาน ID: 20056232
UPDATE public.employees
SET
  section = '3',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2004-05-16',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-07-01',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056232';

-- อัพเดทข้อมูลพนักงาน ID: 20056361
UPDATE public.employees
SET
  section = '3',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2006-05-14',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-12-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056361';

-- อัพเดทข้อมูลพนักงาน ID: 20056435
UPDATE public.employees
SET
  section = '3',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2000-08-01',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-06-16',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056435';

-- อัพเดทข้อมูลพนักงาน ID: 20053773
UPDATE public.employees
SET
  section = '4',
  position = 'หัวหน้าแผนก',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1993-09-06',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2014-11-13',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053773';

-- อัพเดทข้อมูลพนักงาน ID: 20054872
UPDATE public.employees
SET
  section = '4',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1970-05-26',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2018-04-24',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054872';

-- อัพเดทข้อมูลพนักงาน ID: 20055418
UPDATE public.employees
SET
  section = '4',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2001-09-11',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-03-30',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055418';

-- อัพเดทข้อมูลพนักงาน ID: 20055471
UPDATE public.employees
SET
  section = '4',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2002-11-13',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-05-03',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055471';

-- อัพเดทข้อมูลพนักงาน ID: 20055473
UPDATE public.employees
SET
  section = '4',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2000-08-09',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-05-03',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055473';

-- อัพเดทข้อมูลพนักงาน ID: 20055726
UPDATE public.employees
SET
  section = '4',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2004-04-27',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-04-28',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055726';

-- อัพเดทข้อมูลพนักงาน ID: 20056041
UPDATE public.employees
SET
  section = '4',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1989-03-03',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-01-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056041';

-- อัพเดทข้อมูลพนักงาน ID: 20056338
UPDATE public.employees
SET
  section = '4',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2000-01-19',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-10-28',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056338';

-- อัพเดทข้อมูลพนักงาน ID: 20056387
UPDATE public.employees
SET
  section = '4',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1989-06-08',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-04-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056387';

-- อัพเดทข้อมูลพนักงาน ID: 20052779
UPDATE public.employees
SET
  section = '5',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1979-08-03',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2012-09-05',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20052779';

-- อัพเดทข้อมูลพนักงาน ID: 20053751
UPDATE public.employees
SET
  section = '5',
  position = 'Sub Leader',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1996-02-09',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2014-10-01',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053751';

-- อัพเดทข้อมูลพนักงาน ID: 20054285
UPDATE public.employees
SET
  section = '5',
  position = 'Sub Leader',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1987-01-07',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0,
  start_date = '2016-06-20',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054285';

-- อัพเดทข้อมูลพนักงาน ID: 20055290
UPDATE public.employees
SET
  section = '5',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1997-10-21',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2020-09-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055290';

-- อัพเดทข้อมูลพนักงาน ID: 20055426
UPDATE public.employees
SET
  section = '5',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1985-11-13',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-04-19',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055426';

-- อัพเดทข้อมูลพนักงาน ID: 20055522
UPDATE public.employees
SET
  section = '5',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1996-10-09',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-07-05',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055522';

-- อัพเดทข้อมูลพนักงาน ID: 20055608
UPDATE public.employees
SET
  section = '5',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1995-02-25',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-01-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055608';

-- อัพเดทข้อมูลพนักงาน ID: 20055669
UPDATE public.employees
SET
  section = '5',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1986-07-03',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-02-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055669';

-- อัพเดทข้อมูลพนักงาน ID: 20055694
UPDATE public.employees
SET
  section = '5',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1995-04-09',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-04-01',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055694';

-- อัพเดทข้อมูลพนักงาน ID: 20055852
UPDATE public.employees
SET
  section = '5',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1993-03-01',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-01-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055852';

-- อัพเดทข้อมูลพนักงาน ID: 20055857
UPDATE public.employees
SET
  section = '5',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'กัมพูชา',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1978-06-09',
  tax_id = '0020011253908',
  social_security = '6016601182965',
  provident_fund = 0.0,
  start_date = '2023-01-16',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055857';

-- อัพเดทข้อมูลพนักงาน ID: 20055858
UPDATE public.employees
SET
  section = '5',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1994-06-03',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-01-16',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055858';

-- อัพเดทข้อมูลพนักงาน ID: 20055915
UPDATE public.employees
SET
  section = '5',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1997-08-03',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-06-27',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055915';

-- อัพเดทข้อมูลพนักงาน ID: 20056004
UPDATE public.employees
SET
  section = '5',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1994-06-18',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-01-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056004';

-- อัพเดทข้อมูลพนักงาน ID: 20056043
UPDATE public.employees
SET
  section = '5',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1992-08-24',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-01-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056043';

-- อัพเดทข้อมูลพนักงาน ID: 20056044
UPDATE public.employees
SET
  section = '5',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2006-01-18',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-01-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056044';

-- อัพเดทข้อมูลพนักงาน ID: 20056045
UPDATE public.employees
SET
  section = '5',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1990-08-02',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-01-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056045';

-- อัพเดทข้อมูลพนักงาน ID: 20056123
UPDATE public.employees
SET
  section = '5',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1998-07-13',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-03-14',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056123';

-- อัพเดทข้อมูลพนักงาน ID: 20056149
UPDATE public.employees
SET
  section = '5',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1997-09-06',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-04-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056149';

-- อัพเดทข้อมูลพนักงาน ID: 20056163
UPDATE public.employees
SET
  section = '5',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2005-04-28',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-05-06',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056163';

-- อัพเดทข้อมูลพนักงาน ID: 20056183
UPDATE public.employees
SET
  section = '5',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1999-12-08',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-05-13',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056183';

-- อัพเดทข้อมูลพนักงาน ID: 20056195
UPDATE public.employees
SET
  section = '5',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2000-12-01',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-05-17',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056195';

-- อัพเดทข้อมูลพนักงาน ID: 20056200
UPDATE public.employees
SET
  section = '5',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2000-06-01',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-05-17',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056200';

-- อัพเดทข้อมูลพนักงาน ID: 20056337
UPDATE public.employees
SET
  section = '5',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1986-03-07',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-10-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056337';

-- อัพเดทข้อมูลพนักงาน ID: 20056463
UPDATE public.employees
SET
  section = '5',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2001-01-10',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-07-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056463';

-- อัพเดทข้อมูลพนักงาน ID: 20056480
UPDATE public.employees
SET
  section = '5',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1996-08-25',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-08-19',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056480';

-- อัพเดทข้อมูลพนักงาน ID: 20056530
UPDATE public.employees
SET
  section = '5',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2006-04-01',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056530';

-- อัพเดทข้อมูลพนักงาน ID: 20053346
UPDATE public.employees
SET
  section = '6',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1990-05-20',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2013-12-06',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053346';

-- อัพเดทข้อมูลพนักงาน ID: 20056173
UPDATE public.employees
SET
  section = '6',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2000-04-02',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-05-13',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056173';

-- อัพเดทข้อมูลพนักงาน ID: 20056240
UPDATE public.employees
SET
  section = '6',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1984-12-28',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-07-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056240';

-- อัพเดทข้อมูลพนักงาน ID: 20054138
UPDATE public.employees
SET
  section = '7',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1980-03-05',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2016-01-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054138';

-- อัพเดทข้อมูลพนักงาน ID: 20054920
UPDATE public.employees
SET
  section = '7',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1986-12-16',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2019-01-14',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054920';

-- อัพเดทข้อมูลพนักงาน ID: 20054929
UPDATE public.employees
SET
  section = '7',
  position = 'Sub Leader',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1978-07-14',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2019-01-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054929';

-- อัพเดทข้อมูลพนักงาน ID: 20055832
UPDATE public.employees
SET
  section = '7',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1986-08-21',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-08-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055832';

-- อัพเดทข้อมูลพนักงาน ID: 20056022
UPDATE public.employees
SET
  section = '7',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1999-05-21',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-01-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056022';

-- อัพเดทข้อมูลพนักงาน ID: 20056332
UPDATE public.employees
SET
  section = '7',
  position = 'Sub Leader',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1992-04-04',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-10-16',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056332';

-- อัพเดทข้อมูลพนักงาน ID: 20056388
UPDATE public.employees
SET
  section = '7',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1969-04-10',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-04-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056388';

-- อัพเดทข้อมูลพนักงาน ID: 20056434
UPDATE public.employees
SET
  section = '7',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1979-12-06',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-06-16',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056434';

-- อัพเดทข้อมูลพนักงาน ID: 20056445
UPDATE public.employees
SET
  section = '7',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1995-06-05',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-07-04',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056445';

-- อัพเดทข้อมูลพนักงาน ID: 20056466
UPDATE public.employees
SET
  section = '7',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1987-07-12',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-07-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056466';

-- อัพเดทข้อมูลพนักงาน ID: 20051185
UPDATE public.employees
SET
  section = '8',
  position = 'หัวหน้าแผนก',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1977-08-01',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2007-11-10',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20051185';

-- อัพเดทข้อมูลพนักงาน ID: 20055006
UPDATE public.employees
SET
  section = '8',
  position = 'Sub Leader',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1990-03-28',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2019-05-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055006';

-- อัพเดทข้อมูลพนักงาน ID: 20055210
UPDATE public.employees
SET
  section = '8',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1983-10-04',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2020-01-31',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055210';

-- อัพเดทข้อมูลพนักงาน ID: 20055219
UPDATE public.employees
SET
  section = '8',
  position = 'Sub Leader',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1981-07-24',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2020-02-18',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055219';

-- อัพเดทข้อมูลพนักงาน ID: 20055712
UPDATE public.employees
SET
  section = '8',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2003-10-18',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-04-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055712';

-- อัพเดทข้อมูลพนักงาน ID: 20056196
UPDATE public.employees
SET
  section = '8',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1983-12-13',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-05-17',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056196';

-- อัพเดทข้อมูลพนักงาน ID: 20056201
UPDATE public.employees
SET
  section = '8',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1991-12-22',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-05-17',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056201';

-- อัพเดทข้อมูลพนักงาน ID: 20056210
UPDATE public.employees
SET
  section = '8',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1997-07-18',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-05-25',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056210';

-- อัพเดทข้อมูลพนักงาน ID: 20056225
UPDATE public.employees
SET
  section = '8',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1997-12-04',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-06-17',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056225';

-- อัพเดทข้อมูลพนักงาน ID: 20056248
UPDATE public.employees
SET
  section = '8',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2005-09-09',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-07-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056248';

-- อัพเดทข้อมูลพนักงาน ID: 20056249
UPDATE public.employees
SET
  section = '8',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2003-07-18',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-07-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056249';

-- อัพเดทข้อมูลพนักงาน ID: 20056250
UPDATE public.employees
SET
  section = '8',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1978-08-26',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-07-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056250';

-- อัพเดทข้อมูลพนักงาน ID: 20056258
UPDATE public.employees
SET
  section = '8',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2006-03-24',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-07-31',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056258';

-- อัพเดทข้อมูลพนักงาน ID: 20056265
UPDATE public.employees
SET
  section = '8',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1990-04-29',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-08-05',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056265';

-- อัพเดทข้อมูลพนักงาน ID: 20056299
UPDATE public.employees
SET
  section = '8',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1997-12-02',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-09-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056299';

-- อัพเดทข้อมูลพนักงาน ID: 20056309
UPDATE public.employees
SET
  section = '8',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2001-06-20',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-09-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056309';

-- อัพเดทข้อมูลพนักงาน ID: 20056349
UPDATE public.employees
SET
  section = '8',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1978-04-22',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-11-06',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056349';

-- อัพเดทข้อมูลพนักงาน ID: 20056389
UPDATE public.employees
SET
  section = '8',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2004-10-20',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-04-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056389';

-- อัพเดทข้อมูลพนักงาน ID: 20056493
UPDATE public.employees
SET
  section = '8',
  position = 'หัวหน้าฝ่าย',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1983-01-01',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-03',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056493';

-- อัพเดทข้อมูลพนักงาน ID: 20056534
UPDATE public.employees
SET
  section = '8',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1983-08-04',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056534';

-- อัพเดทข้อมูลพนักงาน ID: 20056562
UPDATE public.employees
SET
  section = '8',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2006-09-29',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056562';

-- อัพเดทข้อมูลพนักงาน ID: 20056577
UPDATE public.employees
SET
  section = '8',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1998-02-09',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056577';

-- อัพเดทข้อมูลพนักงาน ID: 20056578
UPDATE public.employees
SET
  section = '8',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1990-08-11',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056578';

-- อัพเดทข้อมูลพนักงาน ID: 20052316
UPDATE public.employees
SET
  section = '9',
  position = 'ช่าง',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1978-08-21',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2011-06-06',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 3,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20052316';

-- อัพเดทข้อมูลพนักงาน ID: 20052436
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1979-05-01',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2011-11-22',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 5,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20052436';

-- อัพเดทข้อมูลพนักงาน ID: 20052450
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1979-01-16',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2011-12-06',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 5,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20052450';

-- อัพเดทข้อมูลพนักงาน ID: 20052575
UPDATE public.employees
SET
  section = '9',
  position = 'ช่าง',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1971-01-13',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2012-04-28',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20052575';

-- อัพเดทข้อมูลพนักงาน ID: 20053297
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1980-02-15',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2013-09-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053297';

-- อัพเดทข้อมูลพนักงาน ID: 20053298
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1975-06-22',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2013-09-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053298';

-- อัพเดทข้อมูลพนักงาน ID: 20053732
UPDATE public.employees
SET
  section = '9',
  position = 'Sub Leader',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1973-01-08',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2014-09-22',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053732';

-- อัพเดทข้อมูลพนักงาน ID: 20054092
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1972-09-14',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2015-12-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054092';

-- อัพเดทข้อมูลพนักงาน ID: 20054270
UPDATE public.employees
SET
  section = '9',
  position = 'หัวหน้าแผนก',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1994-02-10',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0,
  start_date = '2016-05-31',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054270';

-- อัพเดทข้อมูลพนักงาน ID: 20054309
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1992-11-07',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2016-06-27',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054309';

-- อัพเดทข้อมูลพนักงาน ID: 20054589
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1997-03-06',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2017-06-07',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054589';

-- อัพเดทข้อมูลพนักงาน ID: 20054604
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1995-03-10',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2017-06-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054604';

-- อัพเดทข้อมูลพนักงาน ID: 20055008
UPDATE public.employees
SET
  section = '9',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1999-12-09',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2019-05-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055008';

-- อัพเดทข้อมูลพนักงาน ID: 20055134
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1985-01-03',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2019-09-23',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055134';

-- อัพเดทข้อมูลพนักงาน ID: 20055190
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1983-07-11',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2020-01-07',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055190';

-- อัพเดทข้อมูลพนักงาน ID: 20055254
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1989-11-29',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2020-07-31',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055254';

-- อัพเดทข้อมูลพนักงาน ID: 20055262
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1995-10-08',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2020-08-10',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055262';

-- อัพเดทข้อมูลพนักงาน ID: 20055430
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2000-09-02',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-04-19',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055430';

-- อัพเดทข้อมูลพนักงาน ID: 20055432
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1988-04-25',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-04-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055432';

-- อัพเดทข้อมูลพนักงาน ID: 20055456
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1978-11-24',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-04-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055456';

-- อัพเดทข้อมูลพนักงาน ID: 20055555
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1998-07-03',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-09-28',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055555';

-- อัพเดทข้อมูลพนักงาน ID: 20055610
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1986-01-10',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-01-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055610';

-- อัพเดทข้อมูลพนักงาน ID: 20055649
UPDATE public.employees
SET
  section = '9',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1995-03-27',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-01-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055649';

-- อัพเดทข้อมูลพนักงาน ID: 20055904
UPDATE public.employees
SET
  section = '9',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1988-06-08',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-05-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055904';

-- อัพเดทข้อมูลพนักงาน ID: 20055912
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1993-07-28',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-06-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055912';

-- อัพเดทข้อมูลพนักงาน ID: 20056108
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1993-07-11',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-02-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056108';

-- อัพเดทข้อมูลพนักงาน ID: 20056136
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1993-05-25',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-04-01',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056136';

-- อัพเดทข้อมูลพนักงาน ID: 20056243
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2001-02-18',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-07-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056243';

-- อัพเดทข้อมูลพนักงาน ID: 20056245
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1988-12-26',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-07-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056245';

-- อัพเดทข้อมูลพนักงาน ID: 20056277
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1998-10-17',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-08-16',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056277';

-- อัพเดทข้อมูลพนักงาน ID: 20056278
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1988-11-06',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-08-16',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056278';

-- อัพเดทข้อมูลพนักงาน ID: 20056378
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1998-05-29',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-03-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056378';

-- อัพเดทข้อมูลพนักงาน ID: 20056477
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2004-01-14',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-08-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056477';

-- อัพเดทข้อมูลพนักงาน ID: 20056485
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1985-12-15',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-08-19',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056485';

-- อัพเดทข้อมูลพนักงาน ID: 20056528
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1988-09-07',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056528';

-- อัพเดทข้อมูลพนักงาน ID: 20056529
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1989-08-13',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056529';

-- อัพเดทข้อมูลพนักงาน ID: 20056542
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2003-05-03',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-18',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056542';

-- อัพเดทข้อมูลพนักงาน ID: 20056559
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1989-09-15',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056559';

-- อัพเดทข้อมูลพนักงาน ID: 20056560
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1975-06-26',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056560';

-- อัพเดทข้อมูลพนักงาน ID: 20056570
UPDATE public.employees
SET
  section = '9',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2004-11-07',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-08',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056570';

-- อัพเดทข้อมูลพนักงาน ID: 20052978
UPDATE public.employees
SET
  section = '19',
  position = 'หัวหน้าแผนก',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1979-05-13',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2013-01-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20052978';

-- อัพเดทข้อมูลพนักงาน ID: 20055498
UPDATE public.employees
SET
  section = '19',
  position = 'Sub Leader',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1994-04-07',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-05-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055498';

-- อัพเดทข้อมูลพนักงาน ID: 20055565
UPDATE public.employees
SET
  section = '19',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1978-08-07',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-10-05',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055565';

-- อัพเดทข้อมูลพนักงาน ID: 20055673
UPDATE public.employees
SET
  section = '19',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1980-03-12',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-02-28',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055673';

-- อัพเดทข้อมูลพนักงาน ID: 20055674
UPDATE public.employees
SET
  section = '19',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1983-04-26',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-02-28',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055674';

-- อัพเดทข้อมูลพนักงาน ID: 20055791
UPDATE public.employees
SET
  section = '19',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2002-06-02',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-07-04',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055791';

-- อัพเดทข้อมูลพนักงาน ID: 20055828
UPDATE public.employees
SET
  section = '19',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1987-08-27',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-08-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055828';

-- อัพเดทข้อมูลพนักงาน ID: 20055863
UPDATE public.employees
SET
  section = '19',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1980-10-27',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-01-23',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055863';

-- อัพเดทข้อมูลพนักงาน ID: 20056148
UPDATE public.employees
SET
  section = '19',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2000-04-04',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-04-22',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056148';

-- อัพเดทข้อมูลพนักงาน ID: 20056284
UPDATE public.employees
SET
  section = '19',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1989-12-24',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-08-20',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056284';

-- อัพเดทข้อมูลพนักงาน ID: 20056519
UPDATE public.employees
SET
  section = '19',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2025-09-08',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-08',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056519';

-- อัพเดทข้อมูลพนักงาน ID: 20056568
UPDATE public.employees
SET
  section = '19',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1989-02-23',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-08',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056568';

-- อัพเดทข้อมูลพนักงาน ID: 20056569
UPDATE public.employees
SET
  section = '19',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1984-09-10',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-08',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056569';

-- อัพเดทข้อมูลพนักงาน ID: 20055724
UPDATE public.employees
SET
  section = '21',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2000-04-03',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-04-28',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055724';

-- อัพเดทข้อมูลพนักงาน ID: 20056430
UPDATE public.employees
SET
  section = '21',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1987-03-04',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-06-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056430';

-- อัพเดทข้อมูลพนักงาน ID: 20056444
UPDATE public.employees
SET
  section = '21',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1989-03-05',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-07-04',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056444';

-- อัพเดทข้อมูลพนักงาน ID: 20052403
UPDATE public.employees
SET
  section = '22',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1972-07-13',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2011-09-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 5,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20052403';

-- อัพเดทข้อมูลพนักงาน ID: 20054502
UPDATE public.employees
SET
  section = '22',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1985-10-11',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2017-02-13',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054502';

-- อัพเดทข้อมูลพนักงาน ID: 20054534
UPDATE public.employees
SET
  section = '22',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1982-09-01',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2017-03-28',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054534';

-- อัพเดทข้อมูลพนักงาน ID: 20054932
UPDATE public.employees
SET
  section = '22',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1982-05-09',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2019-01-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054932';

-- อัพเดทข้อมูลพนักงาน ID: 20055015
UPDATE public.employees
SET
  section = '22',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1978-06-10',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2019-05-13',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055015';

-- อัพเดทข้อมูลพนักงาน ID: 20055400
UPDATE public.employees
SET
  section = '22',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1984-01-08',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-02-19',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055400';

-- อัพเดทข้อมูลพนักงาน ID: 20055408
UPDATE public.employees
SET
  section = '22',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1992-08-20',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-03-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055408';

-- อัพเดทข้อมูลพนักงาน ID: 20055412
UPDATE public.employees
SET
  section = '22',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1995-03-12',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-03-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055412';

-- อัพเดทข้อมูลพนักงาน ID: 20055451
UPDATE public.employees
SET
  section = '22',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1984-12-14',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-04-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055451';

-- อัพเดทข้อมูลพนักงาน ID: 20055942
UPDATE public.employees
SET
  section = '22',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2001-03-09',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-10-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055942';

-- อัพเดทข้อมูลพนักงาน ID: 20055945
UPDATE public.employees
SET
  section = '22',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2000-04-09',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-10-18',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055945';

-- อัพเดทข้อมูลพนักงาน ID: 20056055
UPDATE public.employees
SET
  section = '22',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1984-12-24',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-01-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056055';

-- อัพเดทข้อมูลพนักงาน ID: 20056059
UPDATE public.employees
SET
  section = '22',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1994-10-24',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-01-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056059';

-- อัพเดทข้อมูลพนักงาน ID: 20056221
UPDATE public.employees
SET
  section = '22',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1969-04-20',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-06-17',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056221';

-- อัพเดทข้อมูลพนักงาน ID: 20056313
UPDATE public.employees
SET
  section = '22',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2002-08-20',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-09-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056313';

-- อัพเดทข้อมูลพนักงาน ID: 20056544
UPDATE public.employees
SET
  section = '22',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1993-06-18',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-18',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056544';

-- อัพเดทข้อมูลพนักงาน ID: 20054133
UPDATE public.employees
SET
  section = '23',
  position = 'หัวหน้าแผนก',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1985-03-06',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2016-01-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054133';

-- อัพเดทข้อมูลพนักงาน ID: 20054578
UPDATE public.employees
SET
  section = '23',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1986-10-01',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2017-05-19',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054578';

-- อัพเดทข้อมูลพนักงาน ID: 20054927
UPDATE public.employees
SET
  section = '23',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1995-01-07',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2019-01-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054927';

-- อัพเดทข้อมูลพนักงาน ID: 20052460
UPDATE public.employees
SET
  section = '25',
  position = 'หัวหน้าฝ่าย',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1982-03-13',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2012-01-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20052460';

-- อัพเดทข้อมูลพนักงาน ID: 20055031
UPDATE public.employees
SET
  section = '25',
  position = 'หัวหน้าฝ่าย',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1975-07-25',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2018-10-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055031';

-- อัพเดทข้อมูลพนักงาน ID: 20055068
UPDATE public.employees
SET
  section = '25',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1996-06-28',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2019-07-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055068';

-- อัพเดทข้อมูลพนักงาน ID: 20055887
UPDATE public.employees
SET
  section = '25',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2000-05-20',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-04-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055887';

-- อัพเดทข้อมูลพนักงาน ID: 20056262
UPDATE public.employees
SET
  section = '25',
  position = 'หัวหน้าฝ่าย',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1997-09-25',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-08-01',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056262';

-- อัพเดทข้อมูลพนักงาน ID: 20056342
UPDATE public.employees
SET
  section = '25',
  position = 'ผู้จัดการโรงงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1976-03-19',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-10-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056342';

-- อัพเดทข้อมูลพนักงาน ID: 20056377
UPDATE public.employees
SET
  section = '25',
  position = 'ผู้ช่วยผู้จัดการ',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1974-11-09',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-03-03',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056377';

-- อัพเดทข้อมูลพนักงาน ID: 20056418
UPDATE public.employees
SET
  section = '25',
  position = 'ผู้ช่วยผู้จัดการ',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1981-09-29',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-05-05',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056418';

-- อัพเดทข้อมูลพนักงาน ID: 20052855
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1977-03-24',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2012-10-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20052855';

-- อัพเดทข้อมูลพนักงาน ID: 20053025
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1976-04-01',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2013-03-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053025';

-- อัพเดทข้อมูลพนักงาน ID: 20053746
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1982-07-18',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2014-09-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053746';

-- อัพเดทข้อมูลพนักงาน ID: 20054104
UPDATE public.employees
SET
  section = '31',
  position = 'Sub Leader',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1980-04-25',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2016-01-04',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054104';

-- อัพเดทข้อมูลพนักงาน ID: 20054419
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1997-12-15',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2016-09-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054419';

-- อัพเดทข้อมูลพนักงาน ID: 20054422
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1988-11-22',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2016-09-28',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054422';

-- อัพเดทข้อมูลพนักงาน ID: 20054435
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1983-09-03',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2016-10-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054435';

-- อัพเดทข้อมูลพนักงาน ID: 20054541
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1984-04-19',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2017-03-31',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054541';

-- อัพเดทข้อมูลพนักงาน ID: 20054547
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1998-08-06',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2017-04-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054547';

-- อัพเดทข้อมูลพนักงาน ID: 20054620
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1989-12-24',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2017-07-20',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054620';

-- อัพเดทข้อมูลพนักงาน ID: 20054623
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1998-04-14',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2017-07-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054623';

-- อัพเดทข้อมูลพนักงาน ID: 20054635
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1997-01-01',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2017-08-04',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054635';

-- อัพเดทข้อมูลพนักงาน ID: 20054729
UPDATE public.employees
SET
  section = '31',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1986-03-24',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2018-01-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054729';

-- อัพเดทข้อมูลพนักงาน ID: 20054977
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1979-02-05',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2019-03-13',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054977';

-- อัพเดทข้อมูลพนักงาน ID: 20055119
UPDATE public.employees
SET
  section = '31',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1998-05-23',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2019-09-10',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055119';

-- อัพเดทข้อมูลพนักงาน ID: 20055300
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1998-09-24',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2020-09-30',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055300';

-- อัพเดทข้อมูลพนักงาน ID: 20055407
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1994-06-30',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-03-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055407';

-- อัพเดทข้อมูลพนักงาน ID: 20055725
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1999-12-26',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-04-28',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055725';

-- อัพเดทข้อมูลพนักงาน ID: 20055824
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1982-01-20',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-07-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055824';

-- อัพเดทข้อมูลพนักงาน ID: 20055888
UPDATE public.employees
SET
  section = '31',
  position = 'Sub Leader',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1994-02-28',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-04-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055888';

-- อัพเดทข้อมูลพนักงาน ID: 20055941
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2000-07-24',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-10-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055941';

-- อัพเดทข้อมูลพนักงาน ID: 20056068
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1986-03-08',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-01-30',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056068';

-- อัพเดทข้อมูลพนักงาน ID: 20056094
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1992-08-05',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-02-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056094';

-- อัพเดทข้อมูลพนักงาน ID: 20056166
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2003-04-03',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-05-06',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056166';

-- อัพเดทข้อมูลพนักงาน ID: 20056185
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1996-08-30',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-05-13',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056185';

-- อัพเดทข้อมูลพนักงาน ID: 20056202
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1994-07-11',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-05-27',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056202';

-- อัพเดทข้อมูลพนักงาน ID: 20056222
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2005-11-22',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-06-17',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056222';

-- อัพเดทข้อมูลพนักงาน ID: 20056298
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1992-04-20',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-09-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056298';

-- อัพเดทข้อมูลพนักงาน ID: 20056446
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1995-03-24',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-07-04',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056446';

-- อัพเดทข้อมูลพนักงาน ID: 20056471
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2006-07-09',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-08-04',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056471';

-- อัพเดทข้อมูลพนักงาน ID: 20056472
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1987-05-11',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-08-04',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056472';

-- อัพเดทข้อมูลพนักงาน ID: 20056556
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2005-05-12',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056556';

-- อัพเดทข้อมูลพนักงาน ID: 20056557
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1999-09-25',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056557';

-- อัพเดทข้อมูลพนักงาน ID: 20056558
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1981-03-29',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056558';

-- อัพเดทข้อมูลพนักงาน ID: 20056572
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1991-08-08',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-14',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056572';

-- อัพเดทข้อมูลพนักงาน ID: 20056573
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1986-11-14',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-14',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056573';

-- อัพเดทข้อมูลพนักงาน ID: 20056574
UPDATE public.employees
SET
  section = '31',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1987-06-29',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-14',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056574';

-- อัพเดทข้อมูลพนักงาน ID: 20053630
UPDATE public.employees
SET
  section = '32',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1972-06-15',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2014-07-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053630';

-- อัพเดทข้อมูลพนักงาน ID: 20054394
UPDATE public.employees
SET
  section = '32',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1969-03-09',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2016-09-05',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054394';

-- อัพเดทข้อมูลพนักงาน ID: 20054550
UPDATE public.employees
SET
  section = '32',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1994-07-04',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2017-04-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054550';

-- อัพเดทข้อมูลพนักงาน ID: 20054557
UPDATE public.employees
SET
  section = '32',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1997-05-22',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2017-04-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054557';

-- อัพเดทข้อมูลพนักงาน ID: 20055052
UPDATE public.employees
SET
  section = '32',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1997-10-14',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2019-06-17',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055052';

-- อัพเดทข้อมูลพนักงาน ID: 20055349
UPDATE public.employees
SET
  section = '32',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1991-02-09',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2020-11-16',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055349';

-- อัพเดทข้อมูลพนักงาน ID: 20055438
UPDATE public.employees
SET
  section = '32',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2002-07-18',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-04-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055438';

-- อัพเดทข้อมูลพนักงาน ID: 20055547
UPDATE public.employees
SET
  section = '32',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1982-01-20',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-09-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055547';

-- อัพเดทข้อมูลพนักงาน ID: 20055559
UPDATE public.employees
SET
  section = '32',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1979-10-04',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-09-28',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055559';

-- อัพเดทข้อมูลพนักงาน ID: 20055637
UPDATE public.employees
SET
  section = '32',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1997-03-07',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-01-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055637';

-- อัพเดทข้อมูลพนักงาน ID: 20055885
UPDATE public.employees
SET
  section = '32',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1979-04-10',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-04-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055885';

-- อัพเดทข้อมูลพนักงาน ID: 20056153
UPDATE public.employees
SET
  section = '32',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2006-03-20',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-04-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056153';

-- อัพเดทข้อมูลพนักงาน ID: 20056180
UPDATE public.employees
SET
  section = '32',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1990-06-23',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-05-13',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056180';

-- อัพเดทข้อมูลพนักงาน ID: 20056181
UPDATE public.employees
SET
  section = '32',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1989-09-02',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-05-13',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056181';

-- อัพเดทข้อมูลพนักงาน ID: 20056268
UPDATE public.employees
SET
  section = '32',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1994-04-03',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-08-13',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056268';

-- อัพเดทข้อมูลพนักงาน ID: 20056269
UPDATE public.employees
SET
  section = '32',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2005-08-13',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-08-16',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056269';

-- อัพเดทข้อมูลพนักงาน ID: 20056300
UPDATE public.employees
SET
  section = '32',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1978-12-03',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-09-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056300';

-- อัพเดทข้อมูลพนักงาน ID: 20056368
UPDATE public.employees
SET
  section = '32',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2003-07-12',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-01-27',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056368';

-- อัพเดทข้อมูลพนักงาน ID: 20056489
UPDATE public.employees
SET
  section = '32',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1970-07-08',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-01',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056489';

-- อัพเดทข้อมูลพนักงาน ID: 20056439
UPDATE public.employees
SET
  section = '35',
  position = 'หัวหน้าฝ่าย',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1982-01-27',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-09-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056439';

-- อัพเดทข้อมูลพนักงาน ID: 20053296
UPDATE public.employees
SET
  section = '15',
  position = 'แม่บ้าน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1974-04-30',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2013-09-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053296';

-- อัพเดทข้อมูลพนักงาน ID: 20053750
UPDATE public.employees
SET
  section = '15',
  position = 'แม่บ้าน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1978-04-26',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2014-09-30',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053750';

-- อัพเดทข้อมูลพนักงาน ID: 20053793
UPDATE public.employees
SET
  section = '15',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1990-07-04',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2015-01-05',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053793';

-- อัพเดทข้อมูลพนักงาน ID: 20054852
UPDATE public.employees
SET
  section = '15',
  position = 'แม่บ้าน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1983-09-07',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2018-09-03',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054852';

-- อัพเดทข้อมูลพนักงาน ID: 20055667
UPDATE public.employees
SET
  section = '15',
  position = 'พ่อบ้าน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1972-03-28',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-02-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055667';

-- อัพเดทข้อมูลพนักงาน ID: 20055708
UPDATE public.employees
SET
  section = '15',
  position = 'แม่บ้าน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1972-04-25',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-04-22',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055708';

-- อัพเดทข้อมูลพนักงาน ID: 20055954
UPDATE public.employees
SET
  section = '15',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1996-05-19',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-11-01',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055954';

-- อัพเดทข้อมูลพนักงาน ID: 20056233
UPDATE public.employees
SET
  section = '15',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1982-03-14',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-07-01',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056233';

-- อัพเดทข้อมูลพนักงาน ID: 20056308
UPDATE public.employees
SET
  section = '15',
  position = 'จป.',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1997-08-25',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-09-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056308';

-- อัพเดทข้อมูลพนักงาน ID: 20056433
UPDATE public.employees
SET
  section = '15',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1998-08-07',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-06-16',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056433';

-- อัพเดทข้อมูลพนักงาน ID: 20056545
UPDATE public.employees
SET
  section = '15',
  position = 'แม่บ้าน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1984-11-17',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-23',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056545';

-- อัพเดทข้อมูลพนักงาน ID: 20052609
UPDATE public.employees
SET
  section = '10',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1981-05-17',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2012-05-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20052609';

-- อัพเดทข้อมูลพนักงาน ID: 20053060
UPDATE public.employees
SET
  section = '10',
  position = 'หัวหน้าแผนก',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1977-12-31',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2013-04-18',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053060';

-- อัพเดทข้อมูลพนักงาน ID: 20053883
UPDATE public.employees
SET
  section = '10',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1986-05-08',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2015-04-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053883';

-- อัพเดทข้อมูลพนักงาน ID: 20054477
UPDATE public.employees
SET
  section = '10',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1980-07-01',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2017-01-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054477';

-- อัพเดทข้อมูลพนักงาน ID: 20054665
UPDATE public.employees
SET
  section = '10',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1984-09-07',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2017-09-20',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054665';

-- อัพเดทข้อมูลพนักงาน ID: 20055009
UPDATE public.employees
SET
  section = '10',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1996-11-25',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2019-05-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055009';

-- อัพเดทข้อมูลพนักงาน ID: 20055549
UPDATE public.employees
SET
  section = '10',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2002-03-28',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-09-28',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055549';

-- อัพเดทข้อมูลพนักงาน ID: 20055736
UPDATE public.employees
SET
  section = '10',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2003-06-30',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-05-04',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055736';

-- อัพเดทข้อมูลพนักงาน ID: 20055769
UPDATE public.employees
SET
  section = '10',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2004-05-05',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-06-13',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055769';

-- อัพเดทข้อมูลพนักงาน ID: 20055801
UPDATE public.employees
SET
  section = '10',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1988-10-28',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-07-12',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055801';

-- อัพเดทข้อมูลพนักงาน ID: 20055921
UPDATE public.employees
SET
  section = '10',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2003-12-02',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-08-14',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055921';

-- อัพเดทข้อมูลพนักงาน ID: 20055939
UPDATE public.employees
SET
  section = '10',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2004-02-01',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-10-04',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055939';

-- อัพเดทข้อมูลพนักงาน ID: 20056003
UPDATE public.employees
SET
  section = '10',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1994-12-15',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-01-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056003';

-- อัพเดทข้อมูลพนักงาน ID: 20056191
UPDATE public.employees
SET
  section = '10',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2001-08-20',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-05-17',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056191';

-- อัพเดทข้อมูลพนักงาน ID: 20056345
UPDATE public.employees
SET
  section = '10',
  position = 'หัวหน้าแผนก',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1984-04-29',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-11-01',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056345';

-- อัพเดทข้อมูลพนักงาน ID: 20056422
UPDATE public.employees
SET
  section = '10',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2004-07-12',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-05-19',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056422';

-- อัพเดทข้อมูลพนักงาน ID: 20056428
UPDATE public.employees
SET
  section = '10',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2006-10-05',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-06-05',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056428';

-- อัพเดทข้อมูลพนักงาน ID: 20056468
UPDATE public.employees
SET
  section = '10',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1993-08-29',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-07-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056468';

-- อัพเดทข้อมูลพนักงาน ID: 20056469
UPDATE public.employees
SET
  section = '10',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1999-01-20',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-07-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056469';

-- อัพเดทข้อมูลพนักงาน ID: 20056517
UPDATE public.employees
SET
  section = '10',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1998-09-21',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-08',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056517';

-- อัพเดทข้อมูลพนักงาน ID: 20056518
UPDATE public.employees
SET
  section = '10',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1994-09-28',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-08',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056518';

-- อัพเดทข้อมูลพนักงาน ID: 20056532
UPDATE public.employees
SET
  section = '10',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2025-09-15',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056532';

-- อัพเดทข้อมูลพนักงาน ID: 20056571
UPDATE public.employees
SET
  section = '10',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2001-10-08',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-14',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056571';

-- อัพเดทข้อมูลพนักงาน ID: 20054317
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1959-12-03',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2015-03-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054317';

-- อัพเดทข้อมูลพนักงาน ID: 20055218
UPDATE public.employees
SET
  section = '14',
  position = 'หัวหน้าฝ่าย',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1994-12-21',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2020-02-17',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055218';

-- อัพเดทข้อมูลพนักงาน ID: 20055333
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1995-09-29',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2020-11-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055333';

-- อัพเดทข้อมูลพนักงาน ID: 20055866
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1997-08-07',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-02-01',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055866';

-- อัพเดทข้อมูลพนักงาน ID: 20056216
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1990-02-10',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-06-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056216';

-- อัพเดทข้อมูลพนักงาน ID: 20056353
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1997-01-02',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-11-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056353';

-- อัพเดทข้อมูลพนักงาน ID: 20056357
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1996-02-29',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-11-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056357';

-- อัพเดทข้อมูลพนักงาน ID: 20056379
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2002-05-09',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-03-20',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056379';

-- อัพเดทข้อมูลพนักงาน ID: 20056383
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1998-02-15',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-04-17',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056383';

-- อัพเดทข้อมูลพนักงาน ID: 20056419
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1996-02-29',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-05-05',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056419';

-- อัพเดทข้อมูลพนักงาน ID: 20056432
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2003-03-21',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-06-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056432';

-- อัพเดทข้อมูลพนักงาน ID: 20056499
UPDATE public.employees
SET
  section = '14',
  position = 'หัวหน้าฝ่าย',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1982-06-07',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2009-10-16',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056499';

-- อัพเดทข้อมูลพนักงาน ID: 20056500
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1990-04-24',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2013-06-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056500';

-- อัพเดทข้อมูลพนักงาน ID: 20056501
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1988-02-27',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2017-07-17',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056501';

-- อัพเดทข้อมูลพนักงาน ID: 20056502
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1992-10-06',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2019-01-14',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056502';

-- อัพเดทข้อมูลพนักงาน ID: 20056503
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1986-12-27',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2019-02-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056503';

-- อัพเดทข้อมูลพนักงาน ID: 20056504
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1986-02-05',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-06-13',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056504';

-- อัพเดทข้อมูลพนักงาน ID: 20056505
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1992-09-10',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-08-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056505';

-- อัพเดทข้อมูลพนักงาน ID: 20056506
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1996-09-18',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-10-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056506';

-- อัพเดทข้อมูลพนักงาน ID: 20056507
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1987-10-14',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-03-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056507';

-- อัพเดทข้อมูลพนักงาน ID: 20056508
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1993-09-30',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-02-28',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056508';

-- อัพเดทข้อมูลพนักงาน ID: 20056509
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2005-04-12',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-04-28',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056509';

-- อัพเดทข้อมูลพนักงาน ID: 20056510
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1998-03-23',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-07-14',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056510';

-- อัพเดทข้อมูลพนักงาน ID: 20056511
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1997-04-19',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-07-14',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056511';

-- อัพเดทข้อมูลพนักงาน ID: 20056533
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2002-11-13',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056533';

-- อัพเดทข้อมูลพนักงาน ID: 20056536
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2001-09-18',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-18',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056536';

-- อัพเดทข้อมูลพนักงาน ID: 20056537
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1986-02-15',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-18',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056537';

-- อัพเดทข้อมูลพนักงาน ID: 20056575
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2002-09-24',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-14',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056575';

-- อัพเดทข้อมูลพนักงาน ID: 20056579
UPDATE public.employees
SET
  section = '14',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1992-09-09',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056579';

-- อัพเดทข้อมูลพนักงาน ID: 20056015
UPDATE public.employees
SET
  section = '16',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1998-10-13',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-01-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056015';

-- อัพเดทข้อมูลพนักงาน ID: 20056424
UPDATE public.employees
SET
  section = '16',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1989-04-18',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-06-05',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056424';

-- อัพเดทข้อมูลพนักงาน ID: 20056425
UPDATE public.employees
SET
  section = '16',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1987-07-07',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-06-05',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056425';

-- อัพเดทข้อมูลพนักงาน ID: 20056436
UPDATE public.employees
SET
  section = '16',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1996-11-22',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-06-18',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056436';

-- อัพเดทข้อมูลพนักงาน ID: 20056443
UPDATE public.employees
SET
  section = '16',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2003-08-14',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-07-01',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056443';

-- อัพเดทข้อมูลพนักงาน ID: 20056456
UPDATE public.employees
SET
  section = '16',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1994-09-13',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2019-10-16',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056456';

-- อัพเดทข้อมูลพนักงาน ID: 20056516
UPDATE public.employees
SET
  section = '16',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1972-05-20',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2002-08-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056516';

-- อัพเดทข้อมูลพนักงาน ID: 20056523
UPDATE public.employees
SET
  section = '16',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2000-06-08',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056523';

-- อัพเดทข้อมูลพนักงาน ID: 20056524
UPDATE public.employees
SET
  section = '16',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2001-08-02',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056524';

-- อัพเดทข้อมูลพนักงาน ID: 20053353
UPDATE public.employees
SET
  section = '17',
  position = 'หัวหน้าแผนก',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1980-06-27',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2014-01-06',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053353';

-- อัพเดทข้อมูลพนักงาน ID: 20056056
UPDATE public.employees
SET
  section = '17',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2005-05-20',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-01-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056056';

-- อัพเดทข้อมูลพนักงาน ID: 20056354
UPDATE public.employees
SET
  section = '17',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1988-04-10',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-11-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056354';

-- อัพเดทข้อมูลพนักงาน ID: 20056421
UPDATE public.employees
SET
  section = '17',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1988-07-23',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-05-14',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056421';

-- อัพเดทข้อมูลพนักงาน ID: 20056455
UPDATE public.employees
SET
  section = '17',
  position = 'หัวหน้าฝ่าย',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1973-05-15',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-04-24',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056455';

-- อัพเดทข้อมูลพนักงาน ID: 20053679
UPDATE public.employees
SET
  section = '2',
  position = 'หัวหน้าแผนก',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1987-12-31',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2014-08-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053679';

-- อัพเดทข้อมูลพนักงาน ID: 20054592
UPDATE public.employees
SET
  section = '2',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1995-12-11',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2017-06-14',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054592';

-- อัพเดทข้อมูลพนักงาน ID: 20055710
UPDATE public.employees
SET
  section = '2',
  position = 'ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1996-12-23',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-04-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055710';

-- อัพเดทข้อมูลพนักงาน ID: 20053813
UPDATE public.employees
SET
  section = '26',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1986-11-18',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2015-01-28',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053813';

-- อัพเดทข้อมูลพนักงาน ID: 20054985
UPDATE public.employees
SET
  section = '26',
  position = 'หัวหน้าฝ่าย',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1990-08-05',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2019-03-18',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054985';

-- อัพเดทข้อมูลพนักงาน ID: 20055054
UPDATE public.employees
SET
  section = '26',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1996-10-08',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2019-06-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055054';

-- อัพเดทข้อมูลพนักงาน ID: 20055943
UPDATE public.employees
SET
  section = '26',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1994-11-24',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-10-16',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055943';

-- อัพเดทข้อมูลพนักงาน ID: 20054993
UPDATE public.employees
SET
  section = '18',
  position = 'หัวหน้าฝ่าย',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1980-12-24',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2019-03-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054993';

-- อัพเดทข้อมูลพนักงาน ID: 20055763
UPDATE public.employees
SET
  section = '18',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1998-04-28',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-06-01',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055763';

-- อัพเดทข้อมูลพนักงาน ID: 20056454
UPDATE public.employees
SET
  section = '18',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1996-01-30',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-05-12',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056454';

-- อัพเดทข้อมูลพนักงาน ID: 20056514
UPDATE public.employees
SET
  section = '18',
  position = 'หัวหน้าฝ่าย',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1985-11-29',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2015-03-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056514';

-- อัพเดทข้อมูลพนักงาน ID: 20056515
UPDATE public.employees
SET
  section = '18',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2001-08-22',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-02-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056515';

-- อัพเดทข้อมูลพนักงาน ID: 20053056
UPDATE public.employees
SET
  section = '12',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1989-09-29',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2013-03-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053056';

-- อัพเดทข้อมูลพนักงาน ID: 20054083
UPDATE public.employees
SET
  section = '12',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1990-01-11',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2015-12-07',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054083';

-- อัพเดทข้อมูลพนักงาน ID: 20054272
UPDATE public.employees
SET
  section = '12',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1997-04-19',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2016-05-31',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054272';

-- อัพเดทข้อมูลพนักงาน ID: 20054801
UPDATE public.employees
SET
  section = '12',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1994-06-08',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2018-04-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054801';

-- อัพเดทข้อมูลพนักงาน ID: 20054874
UPDATE public.employees
SET
  section = '12',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1989-12-13',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2018-09-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054874';

-- อัพเดทข้อมูลพนักงาน ID: 20055186
UPDATE public.employees
SET
  section = '12',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1998-02-02',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2020-01-07',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055186';

-- อัพเดทข้อมูลพนักงาน ID: 20055494
UPDATE public.employees
SET
  section = '12',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2001-12-03',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-05-17',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055494';

-- อัพเดทข้อมูลพนักงาน ID: 20055685
UPDATE public.employees
SET
  section = '12',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1998-04-14',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-03-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055685';

-- อัพเดทข้อมูลพนักงาน ID: 20055886
UPDATE public.employees
SET
  section = '12',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2000-11-11',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-04-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055886';

-- อัพเดทข้อมูลพนักงาน ID: 20056548
UPDATE public.employees
SET
  section = '12',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2000-07-17',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056548';

-- อัพเดทข้อมูลพนักงาน ID: 20056554
UPDATE public.employees
SET
  section = '12',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = NULL,
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056554';

-- อัพเดทข้อมูลพนักงาน ID: 20056555
UPDATE public.employees
SET
  section = '12',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2004-03-15',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056555';

-- อัพเดทข้อมูลพนักงาน ID: 20053340
UPDATE public.employees
SET
  section = '13',
  position = 'Sub Leader',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1984-12-03',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2013-11-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053340';

-- อัพเดทข้อมูลพนักงาน ID: 20053959
UPDATE public.employees
SET
  section = '13',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1980-06-20',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2015-06-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053959';

-- อัพเดทข้อมูลพนักงาน ID: 20054867
UPDATE public.employees
SET
  section = '13',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1994-02-22',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2018-09-18',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054867';

-- อัพเดทข้อมูลพนักงาน ID: 20055486
UPDATE public.employees
SET
  section = '13',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1992-09-27',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-05-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055486';

-- อัพเดทข้อมูลพนักงาน ID: 20055820
UPDATE public.employees
SET
  section = '13',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1986-08-21',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-07-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055820';

-- อัพเดทข้อมูลพนักงาน ID: 20055821
UPDATE public.employees
SET
  section = '13',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2002-01-04',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-07-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055821';

-- อัพเดทข้อมูลพนักงาน ID: 20055861
UPDATE public.employees
SET
  section = '13',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1989-01-31',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-01-16',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055861';

-- อัพเดทข้อมูลพนักงาน ID: 20055964
UPDATE public.employees
SET
  section = '13',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1996-03-18',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-11-13',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055964';

-- อัพเดทข้อมูลพนักงาน ID: 20056124
UPDATE public.employees
SET
  section = '13',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1990-10-18',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-03-14',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056124';

-- อัพเดทข้อมูลพนักงาน ID: 20056128
UPDATE public.employees
SET
  section = '13',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1995-06-17',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-03-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056128';

-- อัพเดทข้อมูลพนักงาน ID: 20056154
UPDATE public.employees
SET
  section = '13',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2005-03-21',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-04-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056154';

-- อัพเดทข้อมูลพนักงาน ID: 20056281
UPDATE public.employees
SET
  section = '13',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1992-02-08',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-08-20',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056281';

-- อัพเดทข้อมูลพนักงาน ID: 20056440
UPDATE public.employees
SET
  section = '13',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1988-06-06',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-10-07',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056440';

-- อัพเดทข้อมูลพนักงาน ID: 20056488
UPDATE public.employees
SET
  section = '13',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2001-06-28',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-01',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056488';

-- อัพเดทข้อมูลพนักงาน ID: 20056566
UPDATE public.employees
SET
  section = '13',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2006-09-07',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-08',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056566';

-- อัพเดทข้อมูลพนักงาน ID: 20055675
UPDATE public.employees
SET
  section = '24',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1995-08-15',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-02-28',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055675';

-- อัพเดทข้อมูลพนักงาน ID: 20055841
UPDATE public.employees
SET
  section = '24',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1966-10-25',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-08-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055841';

-- อัพเดทข้อมูลพนักงาน ID: 20056054
UPDATE public.employees
SET
  section = '24',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2002-06-13',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-01-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056054';

-- อัพเดทข้อมูลพนักงาน ID: 20056092
UPDATE public.employees
SET
  section = '24',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1994-09-21',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-02-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056092';

-- อัพเดทข้อมูลพนักงาน ID: 20056541
UPDATE public.employees
SET
  section = '24',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1995-06-24',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-18',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056541';

-- อัพเดทข้อมูลพนักงาน ID: 20056576
UPDATE public.employees
SET
  section = '24',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1998-11-07',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056576';

-- อัพเดทข้อมูลพนักงาน ID: 20054367
UPDATE public.employees
SET
  section = '28',
  position = 'หัวหน้าแผนก',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1976-07-08',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2007-10-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054367';

-- อัพเดทข้อมูลพนักงาน ID: 20054666
UPDATE public.employees
SET
  section = '28',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1989-02-06',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2017-09-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054666';

-- อัพเดทข้อมูลพนักงาน ID: 20055436
UPDATE public.employees
SET
  section = '28',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2003-01-20',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-04-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055436';

-- อัพเดทข้อมูลพนักงาน ID: 20055437
UPDATE public.employees
SET
  section = '28',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2003-01-26',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-04-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055437';

-- อัพเดทข้อมูลพนักงาน ID: 20055714
UPDATE public.employees
SET
  section = '28',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2002-03-18',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-04-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055714';

-- อัพเดทข้อมูลพนักงาน ID: 20055963
UPDATE public.employees
SET
  section = '28',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1996-09-16',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-11-13',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055963';

-- อัพเดทข้อมูลพนักงาน ID: 20056306
UPDATE public.employees
SET
  section = '28',
  position = 'ผู้ช่วยผู้จัดการ',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1981-01-01',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-09-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056306';

-- อัพเดทข้อมูลพนักงาน ID: 20056343
UPDATE public.employees
SET
  section = '28',
  position = 'ผู้จัดการ',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1986-06-01',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-10-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056343';

-- อัพเดทข้อมูลพนักงาน ID: 20056465
UPDATE public.employees
SET
  section = '28',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1983-03-04',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-07-21',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056465';

-- อัพเดทข้อมูลพนักงาน ID: 20056522
UPDATE public.employees
SET
  section = '28',
  position = 'ผู้ช่วยผู้จัดการ',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1968-08-11',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056522';

-- อัพเดทข้อมูลพนักงาน ID: 20056546
UPDATE public.employees
SET
  section = '28',
  position = 'ผู้จัดการ',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1983-01-30',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056546';

-- อัพเดทข้อมูลพนักงาน ID: 20056553
UPDATE public.employees
SET
  section = '28',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1997-12-29',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-10-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056553';

-- อัพเดทข้อมูลพนักงาน ID: 20056513
UPDATE public.employees
SET
  section = '37',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1973-06-17',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-11-13',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056513';

-- อัพเดทข้อมูลพนักงาน ID: 20052446
UPDATE public.employees
SET
  section = '20',
  position = 'หัวหน้าแผนก',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1970-10-22',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2011-12-06',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 5,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20052446';

-- อัพเดทข้อมูลพนักงาน ID: 20053078
UPDATE public.employees
SET
  section = '20',
  position = 'หัวหน้าฝ่าย',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1993-03-30',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2013-05-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053078';

-- อัพเดทข้อมูลพนักงาน ID: 20053707
UPDATE public.employees
SET
  section = '20',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = 'พุทธ',
  birth_date = '1983-12-15',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2014-09-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20053707';

-- อัพเดทข้อมูลพนักงาน ID: 20054438
UPDATE public.employees
SET
  section = '20',
  position = 'หัวหน้าฝ่าย',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1990-05-25',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2015-07-06',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054438';

-- อัพเดทข้อมูลพนักงาน ID: 20054975
UPDATE public.employees
SET
  section = '20',
  position = 'Sub Leader',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1993-08-05',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2019-03-12',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20054975';

-- อัพเดทข้อมูลพนักงาน ID: 20055512
UPDATE public.employees
SET
  section = '20',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2000-08-01',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2021-06-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20055512';

-- อัพเดทข้อมูลพนักงาน ID: 20056287
UPDATE public.employees
SET
  section = '20',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1996-03-02',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-08-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056287';

-- อัพเดทข้อมูลพนักงาน ID: 20056294
UPDATE public.employees
SET
  section = '20',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2004-10-23',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2024-09-02',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056294';

-- อัพเดทข้อมูลพนักงาน ID: 20056376
UPDATE public.employees
SET
  section = '20',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2000-03-21',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-03-03',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056376';

-- อัพเดทข้อมูลพนักงาน ID: 20056314
UPDATE public.employees
SET
  section = '30',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1998-11-11',
  tax_id = '0020101124813',
  social_security = '6016702835051',
  provident_fund = 0.0,
  start_date = '2024-09-30',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056314';

-- อัพเดทข้อมูลพนักงาน ID: 20056315
UPDATE public.employees
SET
  section = '30',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1999-07-11',
  tax_id = '0071051255147',
  social_security = '6016501446839',
  provident_fund = 0.0,
  start_date = '2024-09-30',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056315';

-- อัพเดทข้อมูลพนักงาน ID: 20056316
UPDATE public.employees
SET
  section = '30',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1996-11-01',
  tax_id = '0013011158975',
  social_security = '6016503407563',
  provident_fund = 0.0,
  start_date = '2024-09-30',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056316';

-- อัพเดทข้อมูลพนักงาน ID: 20056317
UPDATE public.employees
SET
  section = '30',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2004-03-09',
  tax_id = '0070041060580',
  social_security = '6016702835344',
  provident_fund = 0.0,
  start_date = '2024-09-30',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056317';

-- อัพเดทข้อมูลพนักงาน ID: 20056318
UPDATE public.employees
SET
  section = '30',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1990-07-20',
  tax_id = '0071051267064',
  social_security = '6016601427658',
  provident_fund = 0.0,
  start_date = '2024-09-30',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056318';

-- อัพเดทข้อมูลพนักงาน ID: 20056319
UPDATE public.employees
SET
  section = '30',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1993-06-10',
  tax_id = '0071051267081',
  social_security = '6016601427593',
  provident_fund = 0.0,
  start_date = '2024-09-30',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056319';

-- อัพเดทข้อมูลพนักงาน ID: 20056320
UPDATE public.employees
SET
  section = '30',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '2004-04-06',
  tax_id = '0063981861698',
  social_security = '6016702835123',
  provident_fund = 0.0,
  start_date = '2024-09-30',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056320';

-- อัพเดทข้อมูลพนักงาน ID: 20056322
UPDATE public.employees
SET
  section = '30',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '2000-02-06',
  tax_id = '0991027909185',
  social_security = '6016702835000',
  provident_fund = 0.0,
  start_date = '2024-09-30',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056322';

-- อัพเดทข้อมูลพนักงาน ID: 20056323
UPDATE public.employees
SET
  section = '30',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2000-02-29',
  tax_id = '0991018495659',
  social_security = '6016702834950',
  provident_fund = 0.0,
  start_date = '2024-09-30',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056323';

-- อัพเดทข้อมูลพนักงาน ID: 20056327
UPDATE public.employees
SET
  section = '30',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '2002-01-07',
  tax_id = '0991025673583',
  social_security = '6016501376083',
  provident_fund = 0.0,
  start_date = '2024-10-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056327';

-- อัพเดทข้อมูลพนักงาน ID: 20056328
UPDATE public.employees
SET
  section = '30',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1999-01-07',
  tax_id = '0991025635886',
  social_security = '6016501734231',
  provident_fund = 0.0,
  start_date = '2024-10-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056328';

-- อัพเดทข้อมูลพนักงาน ID: 20056330
UPDATE public.employees
SET
  section = '30',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1989-04-16',
  tax_id = '0071051206332',
  social_security = '6016000511921',
  provident_fund = 0.0,
  start_date = '2024-10-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056330';

-- อัพเดทข้อมูลพนักงาน ID: 20056331
UPDATE public.employees
SET
  section = '30',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1998-04-14',
  tax_id = '0991028000571',
  social_security = '6016702959876',
  provident_fund = 0.0,
  start_date = '2024-10-15',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056331';

-- อัพเดทข้อมูลพนักงาน ID: 20056344
UPDATE public.employees
SET
  section = '30',
  position = 'พนักงาน',
  gender = 'ผู้หญิง',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1996-11-15',
  tax_id = '0991028030292',
  social_security = '6016702995236',
  provident_fund = 0.0,
  start_date = '2024-10-30',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056344';

-- อัพเดทข้อมูลพนักงาน ID: 20056549
UPDATE public.employees
SET
  section = '30',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1985-04-14',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056549';

-- อัพเดทข้อมูลพนักงาน ID: 20056550
UPDATE public.employees
SET
  section = '30',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1989-05-23',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-25',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056550';

-- อัพเดทข้อมูลพนักงาน ID: 20056551
UPDATE public.employees
SET
  section = '30',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1996-05-17',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056551';

-- อัพเดทข้อมูลพนักงาน ID: 20056552
UPDATE public.employees
SET
  section = '30',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '2003-05-15',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2025-09-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056552';

-- อัพเดทข้อมูลพนักงาน ID: 20056450
UPDATE public.employees
SET
  section = '36',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '2001-04-29',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2023-12-26',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056450';

-- อัพเดทข้อมูลพนักงาน ID: 20056451
UPDATE public.employees
SET
  section = '36',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1997-01-09',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2022-08-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056451';

-- อัพเดทข้อมูลพนักงาน ID: 20056512
UPDATE public.employees
SET
  section = '36',
  position = 'เจ้าหน้าที่',
  gender = 'ผู้หญิง',
  nationality = 'ไทย',
  citizenship = 'ไทย',
  religion = NULL,
  birth_date = '1991-01-25',
  tax_id = NULL,
  social_security = NULL,
  provident_fund = 0.0,
  start_date = '2019-10-11',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056512';

-- อัพเดทข้อมูลพนักงาน ID: 20056398
UPDATE public.employees
SET
  section = '38',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1991-10-18',
  tax_id = '0024051072355',
  social_security = '6016801401628',
  provident_fund = 0.0,
  start_date = '2025-04-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056398';

-- อัพเดทข้อมูลพนักงาน ID: 20056400
UPDATE public.employees
SET
  section = '38',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1994-01-03',
  tax_id = '0991029465306',
  social_security = '6016801401687',
  provident_fund = 0.0,
  start_date = '2025-04-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056400';

-- อัพเดทข้อมูลพนักงาน ID: 20056401
UPDATE public.employees
SET
  section = '38',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1988-12-22',
  tax_id = '0991016079291',
  social_security = '6016603663669',
  provident_fund = 0.0,
  start_date = '2025-04-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056401';

-- อัพเดทข้อมูลพนักงาน ID: 20056402
UPDATE public.employees
SET
  section = '38',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '2002-07-25',
  tax_id = '0026041060402',
  social_security = '6016801401784',
  provident_fund = 0.0,
  start_date = '2025-04-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056402';

-- อัพเดทข้อมูลพนักงาน ID: 20056403
UPDATE public.employees
SET
  section = '38',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '2003-11-22',
  tax_id = '0991029465357',
  social_security = '6016801401822',
  provident_fund = 0.0,
  start_date = '2025-04-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056403';

-- อัพเดทข้อมูลพนักงาน ID: 20056405
UPDATE public.employees
SET
  section = '38',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1994-05-21',
  tax_id = '0991029465501',
  social_security = '6016801401962',
  provident_fund = 0.0,
  start_date = '2025-04-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056405';

-- อัพเดทข้อมูลพนักงาน ID: 20056406
UPDATE public.employees
SET
  section = '38',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1995-05-07',
  tax_id = '0991029465535',
  social_security = '6016801402039',
  provident_fund = 0.0,
  start_date = '2025-04-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056406';

-- อัพเดทข้อมูลพนักงาน ID: 20056407
UPDATE public.employees
SET
  section = '38',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '2001-03-25',
  tax_id = '0991029465608',
  social_security = '6016801402110',
  provident_fund = 0.0,
  start_date = '2025-04-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056407';

-- อัพเดทข้อมูลพนักงาน ID: 20056408
UPDATE public.employees
SET
  section = '38',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '2003-04-06',
  tax_id = '6016801402152',
  social_security = '6016801402152',
  provident_fund = 0.0,
  start_date = '2025-04-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056408';

-- อัพเดทข้อมูลพนักงาน ID: 20056409
UPDATE public.employees
SET
  section = '38',
  position = 'ผช.ช่าง',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '2002-06-20',
  tax_id = NULL,
  social_security = '6016801402225',
  provident_fund = 0.0,
  start_date = '2025-04-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056409';

-- อัพเดทข้อมูลพนักงาน ID: 20056410
UPDATE public.employees
SET
  section = '38',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '2004-05-10',
  tax_id = '0991029465772',
  social_security = '6016801402292',
  provident_fund = 0.0,
  start_date = '2025-04-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056410';

-- อัพเดทข้อมูลพนักงาน ID: 20056411
UPDATE public.employees
SET
  section = '38',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1999-02-18',
  tax_id = '0991029466558',
  social_security = '6016102208721',
  provident_fund = 0.0,
  start_date = '2025-04-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056411';

-- อัพเดทข้อมูลพนักงาน ID: 20056412
UPDATE public.employees
SET
  section = '38',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1995-09-22',
  tax_id = '0991029465829',
  social_security = '6016801402420',
  provident_fund = 0.0,
  start_date = '2025-04-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056412';

-- อัพเดทข้อมูลพนักงาน ID: 20056413
UPDATE public.employees
SET
  section = '38',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1996-05-16',
  tax_id = '0991029465896',
  social_security = '6016801402497',
  provident_fund = 0.0,
  start_date = '2025-04-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056413';

-- อัพเดทข้อมูลพนักงาน ID: 20056414
UPDATE public.employees
SET
  section = '38',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1996-01-03',
  tax_id = '0991029466124',
  social_security = '6016801402578',
  provident_fund = 0.0,
  start_date = '2025-04-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056414';

-- อัพเดทข้อมูลพนักงาน ID: 20056415
UPDATE public.employees
SET
  section = '38',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '1992-07-11',
  tax_id = '0991023054258',
  social_security = '6016600174284',
  provident_fund = 0.0,
  start_date = '2025-04-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056415';

-- อัพเดทข้อมูลพนักงาน ID: 20056416
UPDATE public.employees
SET
  section = '38',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '2004-12-30',
  tax_id = '0991029466507',
  social_security = '6016801402705',
  provident_fund = 0.0,
  start_date = '2025-04-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056416';

-- อัพเดทข้อมูลพนักงาน ID: 20056417
UPDATE public.employees
SET
  section = '38',
  position = 'พนักงาน',
  gender = 'ผู้ชาย',
  nationality = 'พม่า',
  citizenship = 'พม่า',
  religion = NULL,
  birth_date = '2001-12-24',
  tax_id = '0991029466523',
  social_security = '6016801402781',
  provident_fund = 0.0,
  start_date = '2025-04-29',
  company_provident_fund = 0,
  provident_fund_deduction = 0,
  social_fund_deduction = 0,
  life_insurance = 0,
  housing_loan = 0,
  teacher_fund = 0,
  rmf_fund = 0
WHERE employee_id = '20056417';

-- ============================================
-- เสร็จสิ้นการอัพเดท
-- ============================================
