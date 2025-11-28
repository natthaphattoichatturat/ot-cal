# ระบบคำนวณค่าจ้าง V2 - คู่มือการใช้งาน

## 📋 สรุปการปรับปรุง

### 1. การคำนวณ OT แบบใหม่

#### พนักงานรายวัน (employment_type = 'รายวัน')
- **วันธรรมดา (จันทร์-เสาร์)**: 
  - เวลา 8:00-17:00 = ค่าแรงปกติ (ไม่คิด OT)
  - เวลา 17:30 เป็นต้นไป = OT × 1.5

- **วันอาทิตย์/วันหยุด**:
  - 8 ชั่วโมงแรก (หักพักแล้ว) = OT × 2
  - เกิน 8 ชั่วโมง = OT × 3

#### พนักงานรายเดือน (employment_type = 'รายเดือน')
- **วันธรรมดา (จันทร์-เสาร์)**: 
  - เวลา 8:00-17:00 = ค่าแรงปกติ (ไม่คิด OT)
  - เวลา 17:30 เป็นต้นไป = OT × 1.5

- **วันอาทิตย์/วันหยุด**:
  - 8 ชั่วโมงแรก (หักพักแล้ว) = OT × 1 ⭐ (แตกต่างจากรายวัน)
  - เกิน 8 ชั่วโมง = OT × 3

### 2. การคำนวณค่าจ้าง

#### พนักงานรายวัน
```
ค่าแรงปกติ = จำนวนวันที่มาทำงาน × perday_salary
              (ไม่นับวันอาทิตย์/วันหยุด)

ค่า OT = (ชั่วโมง OT รวม) × perhr_salary

ค่ากะ = จำนวนวันที่ทำกะดึก × 40 บาท

เบี้ยขยัน = 300 บาท (ถ้ามาก่อนเวลา >= 5 นาที ทุกวัน)

หักมาสาย = จำนวนนาที × (perhr_salary / 60)

เงินสุทธิ = ค่าแรงปกติ + ค่า OT + ค่ากะ + เบี้ยขยัน + เงินเพิ่ม
             - หักมาสาย - เงินหัก - SSO - ภาษี
```

#### พนักงานรายเดือน
```
ค่าแรงปกติ = monthly_salary

หักค่าลา = จำนวนวันลา × (monthly_salary / 15)

ค่า OT = (ชั่วโมง OT รวม) × perhr_salary

ค่ากะ = จำนวนวันที่ทำกะดึก × 40 บาท

เบี้ยขยัน = 300 บาท (ถ้ามาก่อนเวลา >= 5 นาที ทุกวัน)

หักมาสาย = จำนวนนาที × (perhr_salary / 60)

เงินสุทธิ = ค่าแรงปกติ + ค่า OT + ค่ากะ + เบี้ยขยัน + เงินเพิ่ม
             - หักค่าลา - หักมาสาย - เงินหัก - SSO - ภาษี
```

### 3. โครงสร้าง Database ใหม่

#### ตาราง leave_records
```sql
- employee_id: รหัสพนักงาน
- leave_date: วันที่ลา
- leave_type: ประเภทการลา ('ลากิจ', 'ลาป่วย', etc.)
- leave_hours: จำนวนชั่วโมงที่ลา (default 8)
- status: สถานะ ('pending', 'approved', 'rejected')
```

#### ตาราง wage_adjustments
```sql
- employee_id: รหัสพนักงาน
- year, month, period: งวดที่เกี่ยวข้อง
- adjustment_type: 'income' (เงินเพิ่ม) หรือ 'deduction' (เงินหัก)
- category: หมวดหมู่ ('โบนัส', 'หักค่าปรับ', etc.)
- amount: จำนวนเงิน
- description: รายละเอียด
```

#### ตาราง wage_details (ตารางหลักสำหรับเก็บรายละเอียดค่าจ้าง)
```sql
- employee_id, year, month, period
- employment_type: 'รายวัน' หรือ 'รายเดือน'
- work_days: จำนวนวันที่มาทำงาน
- leave_days: จำนวนวันลา
- base_wage: ค่าแรงพื้นฐาน
- ot1_hours, ot2_hours, ot3_hours: จำนวนชั่วโมง OT แต่ละประเภท
- ot1_wage, ot2_wage, ot3_wage: ค่า OT แต่ละประเภท
- night_shift_days, night_shift_allowance: ค่ากะ
- attendance_bonus: เบี้ยขยัน
- late_minutes, late_deduction: หักมาสาย
- leave_deduction: หักค่าลา (สำหรับรายเดือน)
- additional_income, additional_deduction: เงินเพิ่ม/หักพิเศษ
- sso, tax: ประกันสังคม, ภาษี
- net_wage: เงินสุทธิ
```

## 🚀 การติดตั้งและใช้งาน

### ขั้นตอนที่ 1: Run SQL Migration
```bash
# เปิด Supabase Console > SQL Editor
# Copy และ Run ไฟล์ wage_system_enhancement_v2.sql
```

### ขั้นตอนที่ 2: อัพเดทข้อมูลพนักงาน
```sql
-- กำหนดประเภทพนักงาน
UPDATE employees 
SET employment_type = 'รายวัน' 
WHERE employee_id IN ('...รหัสพนักงานรายวัน...');

UPDATE employees 
SET employment_type = 'รายเดือน' 
WHERE employee_id IN ('...รหัสพนักงานรายเดือน...');

-- กำหนดเงินเดือนต่องวด (สำหรับรายเดือน)
UPDATE employees 
SET monthly_salary = 6000 -- เงินเดือนต่องวด (ไม่ใช่ต่อเดือน)
WHERE employment_type = 'รายเดือน';
```

### ขั้นตอนที่ 3: Import ข้อมูลการเข้างาน
```
1. ไปที่หน้า Import Scans
2. Upload ไฟล์ .txt
3. ระบบจะคำนวณ OT อัตโนมัติตามประเภทพนักงาน
```

### ขั้นตอนที่ 4: คำนวณค่าจ้าง
```javascript
// เรียก API คำนวณค่าจ้าง V2
POST /api/wages/calculate-v2
{
  "month": 11,
  "year": 2025
}
```

### ขั้นตอนที่ 5: เพิ่ม/หักเงินพิเศษ
```javascript
// เพิ่มเงิน
POST /api/wages/adjustments
{
  "employee_id": "20052403",
  "year": 2025,
  "month": 11,
  "period": 1,
  "adjustment_type": "income",
  "category": "โบนัสพิเศษ",
  "amount": 500,
  "description": "ทำงานดีเด่น"
}

// หักเงิน
POST /api/wages/adjustments
{
  "employee_id": "20052403",
  "year": 2025,
  "month": 11,
  "period": 1,
  "adjustment_type": "deduction",
  "category": "หักค่าปรับ",
  "amount": 200,
  "description": "ทำของเสียหาย"
}
```

### ขั้นตอนที่ 6: บันทึกการลา (สำหรับพนักงานรายเดือน)
```javascript
POST /api/leave/records
{
  "employee_id": "20052403",
  "leave_date": "2025-10-29",
  "leave_type": "ลากิจ",
  "leave_hours": 8,
  "reason": "ธุระส่วนตัว",
  "status": "approved"
}
```

## 📊 API Endpoints ใหม่

### 1. คำนวณค่าจ้าง V2
```
POST /api/wages/calculate-v2
Body: { month: number, year: number }
```

### 2. ดึงรายละเอียดค่าจ้าง
```
GET /api/wages/details?employee_id=xxx&year=2025&month=11&period=1
```

### 3. จัดการเงินเพิ่ม/หัก
```
GET /api/wages/adjustments?employee_id=xxx&year=2025&month=11&period=1
POST /api/wages/adjustments
DELETE /api/wages/adjustments?id=xxx
```

### 4. บันทึกการลา
```
GET /api/leave/records?employee_id=xxx
POST /api/leave/records
PUT /api/leave/records/:id
DELETE /api/leave/records/:id
```

## 🔧 ไฟล์ที่ถูกสร้าง/แก้ไข

### ไฟล์ใหม่
1. `wage_system_enhancement_v2.sql` - SQL migration
2. `lib/wageCalculationsV2.ts` - ฟังก์ชันคำนวณค่าจ้างแบบใหม่
3. `app/api/wages/calculate-v2/route.ts` - API คำนวณค่าจ้าง V2
4. `app/api/wages/adjustments/route.ts` - API จัดการเงินเพิ่ม/หัก
5. `app/api/wages/details/route.ts` - API ดึงรายละเอียดค่าจ้าง

### ไฟล์ที่แก้ไข
1. `lib/otCalculator.ts` - เพิ่มการรองรับพนักงานรายวัน/รายเดือน
2. `app/api/import-scans/route.ts` - ส่งข้อมูล employment_type ไปคำนวณ OT

## 📝 ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: พนักงานรายวันทำงานวันอาทิตย์
```
วันที่: 26/10/2025 (วันอาทิตย์)
เข้างาน: 07:51 → 08:00
ออกงาน: 20:07 → 20:00

การคำนวณ:
- 08:00-17:00 = 9 ชม. - พัก 1 ชม. = 8 ชม. → OT × 2 = 16 ชม.
- 17:30-20:00 = 2.5 ชม. → OT × 3 = 7.5 ชม.
- รวม OT = 16 + 7.5 = 23.5 ชั่วโมง

ถ้าค่าแรงชั่วโมงละ 50 บาท:
- ค่า OT = 23.5 × 50 = 1,175 บาท
```

### ตัวอย่างที่ 2: พนักงานรายเดือนทำงานวันอาทิตย์
```
วันที่: 26/10/2025 (วันอาทิตย์)
เข้างาน: 07:51 → 08:00
ออกงาน: 20:07 → 20:00

การคำนวณ:
- 08:00-17:00 = 9 ชม. - พัก 1 ชม. = 8 ชม. → OT × 1 = 8 ชม.
- 17:30-20:00 = 2.5 ชม. → OT × 3 = 7.5 ชม.
- รวม OT = 8 + 7.5 = 15.5 ชั่วโมง

ถ้าค่าแรงชั่วโมงละ 50 บาท:
- ค่า OT = 15.5 × 50 = 775 บาท
```

### ตัวอย่างที่ 3: พนักงานรายเดือนลางาน
```
งวด: 26/10/2025 - 10/11/2025
เงินเดือน: 6,000 บาท/งวด
ลาวันที่: 29/10/2025, 05/11/2025 (2 วัน)

การคำนวณ:
- ค่าแรงรายวัน = 6,000 / 15 = 400 บาท
- หักค่าลา = 400 × 2 = 800 บาท
- ค่าแรงปกติงวดนี้ = 6,000 - 800 = 5,200 บาท
```

## ⚠️ ข้อควรระวัง

1. **ต้อง Run SQL Migration ก่อน** - ไม่งั้นจะไม่มีตารางใหม่
2. **ต้องกำหนด employment_type** - ไม่งั้นจะคำนวณเป็นรายวันทั้งหมด
3. **เงินเดือนรายเดือน** - ต้องกรอกเป็นเงินต่องวด ไม่ใช่ต่อเดือน
4. **การลา** - ต้องมี status = 'approved' ถึงจะหักเงิน
5. **Recalculate** - ถ้าเปลี่ยน employment_type ต้อง recalculate OT ใหม่

## 🎯 สิ่งที่ต้องทำต่อ

1. สร้าง API สำหรับบันทึกการลา (leave_records)
2. ปรับหน้า /wages ให้แสดงข้อมูลจาก wage_details
3. ปรับหน้า /wages/[id] ให้แสดงรายละเอียดครบถ้วน
4. เพิ่มปุ่มเพิ่ม/หักเงินในหน้า wages page
5. สร้างหน้าจัดการการลา
6. สร้างระบบออกสลิปเงินเดือน (PDF)

## 📞 Support

หากมีปัญหาหรือข้อสงสัย กรุณาติดต่อ:
- ตรวจสอบ console.log ใน browser
- ตรวจสอบ Supabase logs
- ตรวจสอบข้อมูลใน wage_details table

