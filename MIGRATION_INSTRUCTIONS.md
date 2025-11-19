# Employee Data Migration Instructions

## ขั้นตอนการ Migration

### Step 1: เพิ่มคอลัมน์ใหม่ในฐานข้อมูล

1. ไปที่ Supabase Dashboard: https://supabase.com/dashboard/project/clmzzsyxrymhbfvyclwe
2. ไปที่ SQL Editor
3. Copy SQL จากไฟล์ `add_columns_migration.sql` แล้ว Run
4. ตรวจสอบว่าคอลัมน์ทั้งหมดถูกสร้างแล้ว

### Step 2: อัพเดทข้อมูลพนักงาน

รัน Node.js script เพื่ออัพเดทข้อมูลจาก CSV:

```bash
node run_employee_migration_v2.js
```

Script นี้จะ:
- อ่านข้อมูลจาก `employee_data_typhoon_cleaned.csv`
- อัพเดทข้อมูลพนักงานทั้งหมดผ่าน Supabase Client
- แสดงความคืบหน้าและสรุปผลลัพธ์

## คอลัมน์ที่เพิ่มใหม่

1. **ข้อมูลส่วนตัว**
   - section (แผนก/ส่วน)
   - position (ตำแหน่ง)
   - gender (เพศ)
   - nationality (สัญชาติ)
   - citizenship (เชื้อชาติ)
   - religion (ศาสนา)
   - birth_date (วันเกิด)
   - start_date (วันเริ่มงาน)

2. **เอกสารและภาษี**
   - tax_id (เลขที่ผู้เสียภาษี)
   - social_security (เลขประกันสังคม)

3. **กองทุนและสวัสดิการ**
   - provident_fund (กองทุนสำรองเลี้ยงชีพ)
   - company_provident_fund (กองทุนส่วนบริษัท)
   - provident_fund_deduction (หักกองทุนสำรอง)
   - social_fund_deduction (หักกองทุนสังคม)
   - life_insurance (ประกันชีวิต)
   - housing_loan (เงินกู้ที่อยู่อาศัย)
   - teacher_fund (กองทุนครู)
   - rmf_fund (กองทุน RMF)

## ไฟล์ที่เกี่ยวข้อง

- `add_columns_migration.sql` - SQL สำหรับเพิ่มคอลัมน์และ indexes
- `run_employee_migration_v2.js` - Script อัพเดทข้อมูลผ่าน Supabase Client
- `update_employee_data.sql` - SQL UPDATE statements ทั้งหมด (backup/reference)
- `employee_data_typhoon_cleaned.csv` - ข้อมูลต้นฉบับ

## หมายเหตุ

- ข้อมูลว่าง (`""`) ในไฟล์ CSV จะถูกแปลงเป็น `NULL` ในฐานข้อมูล
- ฟิลด์ตัวเลขที่ว่างจะถูกแปลงเป็น `0.0`
- วันที่จะถูกแปลงจากรูปแบบ `DD/MM/YYYY` เป็น `YYYY-MM-DD`
