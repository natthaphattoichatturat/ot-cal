# การอัพเดทข้อมูลเงินเดือนและประเภทการจ้างงานพนักงาน

ระบบนี้จะเพิ่มข้อมูล `monthly_salary` และ `employment_type` ให้กับพนักงานในฐานข้อมูล โดยดึงข้อมูลจากไฟล์ CSV

## 📋 ไฟล์ที่เกี่ยวข้อง

1. **`add_employee_salary_columns.sql`** - เพิ่มคอลัมน์ใหม่ในฐานข้อมูล
2. **`import_employee_salary_data.js`** - นำเข้าข้อมูลจาก CSV
3. **`employee_data_typhoon_cleaned.csv`** - ไฟล์ข้อมูลพนักงาน

## 🚀 ขั้นตอนการใช้งาน

### ขั้นตอนที่ 1: เพิ่มคอลัมน์ใหม่ในฐานข้อมูล

รัน SQL ในฐานข้อมูล Supabase:

```sql
-- คัดลอกและรันคำสั่งทั้งหมดในไฟล์ add_employee_salary_columns.sql
```

หรือรันผ่าน command line:

```bash
# หากใช้ psql
psql -h your-supabase-host -U postgres -d postgres -f add_employee_salary_columns.sql

# หรือรันผ่าน Supabase Dashboard SQL Editor
```

### ขั้นตอนที่ 2: ติดตั้ง dependencies (ถ้ายังไม่มี)

```bash
npm install @supabase/supabase-js
```

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` หรือตั้งค่า environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://clmzzsyxrymhbfvyclwe.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_pVh3YLa0hZyEEFAX12my7g_IAu4lKwk
```

### ขั้นตอนที่ 4: รันการนำเข้าข้อมูล

```bash
node import_employee_salary_data.js
```

## 📊 โครงสร้างข้อมูล

### คอลัมน์ใหม่ที่เพิ่ม:
- **`monthly_salary`** (NUMERIC(10,2)): เงินเดือนรายเดือน (บาท)
- **`employment_type`** (VARCHAR(50)): ประเภทการจ้างงาน

### ตัวอย่างข้อมูล:
```csv
employee_id,monthly_salary,employment_type
20052508,13280.0,รายเดือน
20055709,,รายวัน
```

## ✅ ฟีเจอร์ของระบบ

- **Safe Update**: อัพเดทเฉพาะข้อมูลที่มีอยู่ ไม่กระทบข้อมูลเดิม (แก้ไขจาก upsert เป็น update)
- **Batch Processing**: แบ่งการอัพเดทเป็น batch ขนาดเล็กเพื่อป้องกัน timeout
- **Error Handling**: จัดการข้อผิดพลาดอย่างละเอียด
- **Progress Tracking**: แสดงความคืบหน้าของการอัพเดท
- **Data Validation**: ตรวจสอบว่าพนักงานมีอยู่ในฐานข้อมูลก่อนการอัพเดท
- **Employee Verification**: ตรวจสอบพนักงานที่มีอยู่จริงก่อนการอัพเดท

## 🔍 การตรวจสอบผลการทำงาน

หลังการรันเสร็จสิ้น สามารถตรวจสอบข้อมูลได้โดย:

```sql
-- ตรวจสอบจำนวนพนักงานที่มีข้อมูลเงินเดือน
SELECT
  employment_type,
  COUNT(*) as count,
  AVG(monthly_salary) as avg_salary,
  MIN(monthly_salary) as min_salary,
  MAX(monthly_salary) as max_salary
FROM employees
WHERE monthly_salary > 0
GROUP BY employment_type
ORDER BY employment_type;

-- ตรวจสอบข้อมูลตัวอย่าง
SELECT employee_id, name, monthly_salary, employment_type
FROM employees
WHERE monthly_salary > 0
LIMIT 10;
```

## ⚠️ ข้อควรระวัง

1. **Backup ข้อมูล**: สำรองข้อมูลก่อนการอัพเดท
2. **Test ก่อน**: ทดสอบกับข้อมูลจำนวนน้อยก่อน
3. **ตรวจสอบ CSV**: ไฟล์ CSV ต้องอยู่ในโฟลเดอร์เดียวกันกับไฟล์ JS
4. **Environment Variables**: ตรวจสอบว่าตั้งค่า Supabase URL และ Key ถูกต้อง

## 🔧 การแก้ปัญหา

### ข้อผิดพลาด: "column monthly_salary does not exist"
- **สาเหตุ**: ยังไม่ได้รัน SQL สำหรับเพิ่มคอลัมน์
- **แก้ไข**: รันไฟล์ `add_employee_salary_columns.sql` ก่อน

### ข้อผิดพลาด: "File not found"
- **สาเหตุ**: ไม่พบไฟล์ CSV
- **แก้ไข**: ตรวจสอบว่าไฟล์ `employee_data_typhoon_cleaned.csv` อยู่ในโฟลเดอร์เดียวกัน

### ข้อผิดพลาด: "null value in column 'name' violates not-null constraint"
- **สาเหตุ**: ใช้ upsert แทน update ทำให้พยายาม insert ข้อมูลใหม่ที่มีคอลัมน์ name เป็น null
- **แก้ไข**: ระบบได้แก้ไขให้ใช้ update เฉพาะคอลัมน์ที่ต้องการแล้ว

### ข้อผิดพลาด: "Supabase connection failed"
- **สาเหตุ**: Environment variables ไม่ถูกต้อง
- **แก้ไข**: ตรวจสอบ SUPABASE_URL และ SERVICE_ROLE_KEY

### ข้อผิดพลาด: "พนักงานบางคนไม่มีอยู่ในฐานข้อมูล"
- **สาเหตุ**: CSV มีข้อมูลพนักงานที่ยังไม่ได้เพิ่มเข้าไปในระบบ
- **แก้ไข**: ตรวจสอบและเพิ่มข้อมูลพนักงานก่อน หรือระบบจะแสดงข้อความเตือน

## 📈 ผลลัพธ์ที่คาดหวัง

หลังการอัพเดทสำเร็จ:
- พนักงานทั้งหมดจะมีข้อมูล `monthly_salary` และ `employment_type`
- สามารถใช้ข้อมูลนี้ในการคำนวณเงินเดือนและรายงานได้
- ระบบจะแสดงสถิติการอัพเดทที่ชัดเจน
