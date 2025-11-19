-- ============================================
-- เพิ่มคอลัมน์ department_code
-- ============================================

-- เพิ่มคอลัมน์ department_code
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS department_code character varying(10);

-- เพิ่ม index
CREATE INDEX IF NOT EXISTS idx_employees_department_code
ON public.employees USING btree (department_code);

-- ตรวจสอบผลลัพธ์
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'employees'
  AND column_name = 'department_code';
