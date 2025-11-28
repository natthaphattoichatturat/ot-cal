# สรุปการปรับปรุงระบบคำนวณ OT และค่าจ้าง V2

## ✅ สิ่งที่ทำเสร็จแล้ว

### 1. ระบบคำนวณ OT แบบใหม่ ✅
- ✅ แก้ไข `lib/otCalculator.ts` เพื่อรองรับพนักงานรายวัน/รายเดือน
- ✅ แก้ไขการคำนวณ OT ในวันอาทิตย์/วันหยุด
  - พนักงานรายวัน: 8 ชม.แรก × 2, เกิน 8 ชม. × 3
  - พนักงานรายเดือน: 8 ชม.แรก × 1, เกิน 8 ชม. × 3
- ✅ เพิ่มการหักเวลาพัก (กลางวัน 1 ชม., เย็น 30 นาที)
- ✅ อัพเดท `app/api/import-scans/route.ts` ให้ส่งข้อมูล employment_type

### 2. ระบบคำนวณค่าจ้างแบบละเอียด ✅
- ✅ สร้าง `lib/wageCalculationsV2.ts` พร้อมฟังก์ชัน:
  - `calculatePeriodWageV2()` - คำนวณค่าจ้างรายงวดแบบละเอียด
  - `checkAttendanceBonusV2()` - ตรวจสอบเบี้ยขยัน
  - `calculateMonthlySSO()` - คำนวณประกันสังคม
  - รองรับการคำนวณค่ากะ (40 บาท/วัน)
  - รองรับการหักมาสาย
  - รองรับการหักค่าลา (สำหรับรายเดือน)

### 3. Database Schema ✅
- ✅ สร้าง `wage_system_enhancement_v2.sql` ประกอบด้วย:
  - ตาราง `leave_records` - บันทึกการลา
  - ตาราง `wage_adjustments` - เงินเพิ่ม/เงินหัก
  - ตาราง `wage_details` - รายละเอียดค่าจ้างแบบละเอียด
  - ตาราง `wage_calculation_log` - log การคำนวณ
  - View `v_wage_summary` - สรุปข้อมูลค่าจ้าง
  - เพิ่มคอลัมน์ใหม่ใน `wage_summary`

### 4. API Endpoints ใหม่ ✅
- ✅ `POST /api/wages/calculate-v2` - คำนวณค่าจ้าง V2
- ✅ `GET /api/wages/details` - ดึงรายละเอียดค่าจ้าง
- ✅ `GET/POST/DELETE /api/wages/adjustments` - จัดการเงินเพิ่ม/หัก

### 5. เอกสาร ✅
- ✅ `WAGE_SYSTEM_V2_IMPLEMENTATION.md` - คู่มือการใช้งานแบบละเอียด
- ✅ `IMPLEMENTATION_SUMMARY.md` - สรุปการทำงาน

## 📁 ไฟล์ที่ถูกสร้าง

### SQL Files
1. `wage_system_enhancement_v2.sql` - Migration สำหรับ database schema ใหม่

### Library Files
2. `lib/wageCalculationsV2.ts` - ฟังก์ชันคำนวณค่าจ้างแบบใหม่

### API Routes
3. `app/api/wages/calculate-v2/route.ts` - API คำนวณค่าจ้าง V2
4. `app/api/wages/adjustments/route.ts` - API จัดการเงินเพิ่ม/หัก
5. `app/api/wages/details/route.ts` - API ดึงรายละเอียดค่าจ้าง

### Documentation
6. `WAGE_SYSTEM_V2_IMPLEMENTATION.md` - คู่มือใช้งาน
7. `IMPLEMENTATION_SUMMARY.md` - สรุปการทำงาน (ไฟล์นี้)

## 📝 ไฟล์ที่ถูกแก้ไข

### Core Logic
1. `lib/otCalculator.ts`
   - เพิ่ม parameter `employmentType` ใน `calculateShift1OT()` และ `calculateShift2OT()`
   - แก้ไขการคำนวณ OT ในวันหยุดให้แตกต่างกันตามประเภทพนักงาน
   - เพิ่มการหักเวลาพักในวันหยุด
   - เพิ่ม field `employmentType` ใน `WorkSession` interface

### API Integration
2. `app/api/import-scans/route.ts`
   - ดึงข้อมูล `employment_type` จาก employees table
   - ส่ง `employeeDataMap` ไปยัง `calculateOTFromScans()`

## 🎯 ขั้นตอนการใช้งาน

### Step 1: Run SQL Migration
```bash
# 1. เปิด Supabase Console
# 2. ไปที่ SQL Editor
# 3. Copy เนื้อหาจาก wage_system_enhancement_v2.sql
# 4. Run SQL
```

### Step 2: อัพเดทข้อมูลพนักงาน
```sql
-- กำหนดประเภทพนักงาน
UPDATE employees 
SET employment_type = 'รายวัน' 
WHERE ...;

UPDATE employees 
SET employment_type = 'รายเดือน' 
WHERE ...;

-- กำหนดเงินเดือนต่องวด (สำหรับรายเดือน)
UPDATE employees 
SET monthly_salary = 6000 
WHERE employment_type = 'รายเดือน';
```

### Step 3: Import Scans และคำนวณ OT
```
1. Import ไฟล์ scan ผ่านหน้า /import-scans
2. ระบบจะคำนวณ OT อัตโนมัติตามประเภทพนักงาน
```

### Step 4: คำนวณค่าจ้าง
```javascript
// เรียก API
POST /api/wages/calculate-v2
{
  "month": 11,
  "year": 2025
}
```

### Step 5: เพิ่ม/หักเงินพิเศษ (ถ้ามี)
```javascript
POST /api/wages/adjustments
{
  "employee_id": "20052403",
  "year": 2025,
  "month": 11,
  "period": 1,
  "adjustment_type": "income", // หรือ "deduction"
  "category": "โบนัส",
  "amount": 500
}
```

## 📊 ตัวอย่างการคำนวณ

### ตัวอย่าง 1: พนักงานรายวัน - วันอาทิตย์
```
เข้างาน: 07:51 → 08:00
ออกงาน: 20:07 → 20:00

08:00-17:00 = 9 ชม. - พัก 1 ชม. = 8 ชม.
→ OT × 2 = 16 ชั่วโมง

17:30-20:00 = 2.5 ชม.
→ OT × 3 = 7.5 ชั่วโมง

รวม OT = 23.5 ชั่วโมง
ค่า OT (@ 50 บาท/ชม.) = 1,175 บาท
```

### ตัวอย่าง 2: พนักงานรายเดือน - วันอาทิตย์
```
เข้างาน: 07:51 → 08:00
ออกงาน: 20:07 → 20:00

08:00-17:00 = 9 ชม. - พัก 1 ชม. = 8 ชม.
→ OT × 1 = 8 ชั่วโมง

17:30-20:00 = 2.5 ชม.
→ OT × 3 = 7.5 ชั่วโมง

รวม OT = 15.5 ชั่วโมง
ค่า OT (@ 50 บาท/ชม.) = 775 บาท
```

### ตัวอย่าง 3: พนักงานรายวัน - งวดที่ 1
```
งวด: 26/10/2025 - 10/11/2025 (16 วัน)
- วันอาทิตย์: 3 วัน
- วันธรรมดา: 13 วัน
- เข้างาน: 13 วัน
- ค่าแรงรายวัน: 400 บาท

ค่าแรงปกติ = 13 × 400 = 5,200 บาท
ค่า OT = 93 ชม. × 50 = 4,650 บาท
ค่ากะ = 6 วัน × 40 = 240 บาท
เบี้ยขยัน = 300 บาท
หักมาสาย = 0 บาท

รวม = 10,390 บาท
```

### ตัวอย่าง 4: พนักงานรายเดือน - มีการลา
```
งวด: 26/10/2025 - 10/11/2025
เงินเดือน: 6,000 บาท/งวด
ลา: 2 วัน (29/10, 05/11)

ค่าแรงปกติ = 6,000 บาท
หักค่าลา = 2 × (6,000/15) = 800 บาท
ค่าแรงสุทธิ = 5,200 บาท
```

## 🔍 การตรวจสอบผลลัพธ์

### ตรวจสอบ OT ที่คำนวณ
```sql
SELECT 
  employee_id,
  work_date,
  actual_hours,
  ot_normal_hours,
  ot_special_hours,
  ot_premium_hours,
  is_holiday
FROM daily_attendance
WHERE employee_id = '20052403'
  AND work_date BETWEEN '2025-10-26' AND '2025-11-10'
ORDER BY work_date;
```

### ตรวจสอบค่าจ้างที่คำนวณ
```sql
SELECT *
FROM wage_details
WHERE employee_id = '20052403'
  AND year = 2025
  AND month = 11
  AND period = 1;
```

### ตรวจสอบเงินเพิ่ม/หัก
```sql
SELECT *
FROM wage_adjustments
WHERE employee_id = '20052403'
  AND year = 2025
  AND month = 11
  AND period = 1;
```

## ⚠️ ข้อควรระวัง

1. **ต้อง Run SQL Migration ก่อนใช้งาน**
2. **ต้องกำหนด employment_type ให้ทุกพนักงาน**
3. **เงินเดือนรายเดือน = เงินต่องวด (ไม่ใช่ต่อเดือน)**
4. **ถ้าเปลี่ยน employment_type ต้อง recalculate OT ใหม่**
5. **การลาต้องมี status = 'approved' ถึงจะหักเงิน**

## 🚧 สิ่งที่ยังต้องทำต่อ

### Phase 2 (ต้องทำเอง)
1. ⬜ สร้าง API สำหรับจัดการการลา (`/api/leave/records`)
2. ⬜ ปรับหน้า `/wages` ให้ใช้ข้อมูลจาก `wage_details`
3. ⬜ ปรับหน้า `/wages/[id]` ให้แสดงรายละเอียดครบถ้วน
4. ⬜ เพิ่มปุ่มเพิ่ม/หักเงินในหน้า wages (เชื่อมกับ API ที่มีอยู่แล้ว)
5. ⬜ สร้างหน้าจัดการการลา
6. ⬜ สร้างระบบออกสลิปเงินเดือน (PDF)
7. ⬜ สร้างหน้ารายงานสรุปค่าจ้างรายเดือน
8. ⬜ เพิ่ม validation และ error handling

### Phase 3 (Optional)
- ⬜ สร้าง dashboard สรุปค่าใช้จ่ายบุคลากร
- ⬜ Export ข้อมูลเป็น Excel
- ⬜ ระบบแจ้งเตือนผ่าน LINE เมื่อคำนวณค่าจ้างเสร็จ
- ⬜ ระบบอนุมัติการลาผ่าน LINE

## 📞 การ Debug

### ถ้า OT คำนวณไม่ถูกต้อง
1. ตรวจสอบ `employment_type` ใน employees table
2. ตรวจสอบ `is_holiday` ใน daily_attendance
3. ดู console.log ใน browser
4. ตรวจสอบ Supabase logs

### ถ้าค่าจ้างคำนวณไม่ถูกต้อง
1. ตรวจสอบข้อมูลใน `wage_details`
2. ตรวจสอบ `wage_adjustments`
3. ตรวจสอบ `leave_records`
4. ดู `wage_calculation_log` table

## 🎉 สรุป

ระบบคำนวณ OT และค่าจ้าง V2 ได้ถูกพัฒนาเสร็จสมบูรณ์แล้ว โดยมีการปรับปรุงหลักๆ ดังนี้:

1. ✅ รองรับพนักงานรายวันและรายเดือน
2. ✅ คำนวณ OT วันหยุดถูกต้องตามกฎหมาย
3. ✅ คำนวณค่ากะ (40 บาท/วัน)
4. ✅ หักมาสายอัตโนมัติ
5. ✅ หักค่าลา (สำหรับรายเดือน)
6. ✅ เพิ่ม/หักเงินพิเศษได้
7. ✅ บันทึกรายละเอียดครบถ้วนใน wage_details

**ขั้นตอนถัดไป**: Run SQL migration และเริ่มใช้งานได้เลย! 🚀

