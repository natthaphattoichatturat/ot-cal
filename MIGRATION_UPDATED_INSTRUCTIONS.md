# Employee Data Migration Instructions (Updated)

## การเปลี่ยนแปลง

ไฟล์ CSV ได้รับการอัพเดทโดยเปลี่ยนคอลัมน์ `department` เป็น `department_code`

## ขั้นตอนการ Migration

### Step 1: เพิ่มคอลัมน์ใหม่ในฐานข้อมูล

1. ไปที่ Supabase Dashboard: https://supabase.com/dashboard/project/clmzzsyxrymhbfvyclwe
2. ไปที่ SQL Editor
3. Copy SQL ด้านล่างนี้ แล้ว Run:

```sql
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
```

4. ตรวจสอบผลลัพธ์ที่ด้านล่าง ควรเห็นรายการคอลัมน์ทั้ง **19 คอลัมน์** (รวม department_code)

### Step 2: อัพเดทข้อมูลพนักงาน

รัน Node.js script:

```bash
node run_migration_final.js
```

Script จะ:
- อ่านข้อมูลจาก `employee_data_typhoon_cleaned.csv` (421 records)
- อัพเดทข้อมูลพนักงานทุกคนรวมถึง **department_code**
- แสดงความคืบหน้าทุก 100 records
- แสดงสรุปผลลัพธ์เมื่อเสร็จสิ้น

## คอลัมน์ที่เพิ่มใหม่ทั้งหมด (19 คอลัมน์)

1. **department_code** ← **คอลัมน์ใหม่**
2. section
3. position
4. gender
5. nationality
6. citizenship
7. religion
8. birth_date
9. start_date
10. tax_id
11. social_security
12. provident_fund
13. company_provident_fund
14. provident_fund_deduction
15. social_fund_deduction
16. life_insurance
17. housing_loan
18. teacher_fund
19. rmf_fund

## ไฟล์ที่อัพเดทแล้ว

- ✅ `add_columns_migration.sql` - เพิ่ม department_code column
- ✅ `run_migration_final.js` - อัพเดทให้รวม department_code
- ✅ `employee_data_typhoon_cleaned.csv` - CSV ที่แก้ไขแล้ว

## หมายเหตุ

- **department_code** จะถูกอัพเดทจากคอลัมน์ใหม่ในไฟล์ CSV
- คอลัมน์เดิม **department** ยังคงอยู่ใน table (ไม่ได้ลบ)
- ถ้าต้องการ sync department_code → department ให้รัน:
  ```sql
  UPDATE employees SET department = department_code WHERE department_code IS NOT NULL;
  ```
