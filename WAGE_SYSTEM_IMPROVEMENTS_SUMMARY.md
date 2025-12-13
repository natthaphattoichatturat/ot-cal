# 💰 สรุปการปรับปรุงระบบคำนวณค่าจ้าง

**วันที่:** 13 ธันวาคม 2568
**เวอร์ชัน:** 2.1 (Enhanced Wage Calculation)

---

## 📌 สรุปการแก้ไขทั้งหมด

### ✅ 1. แก้ไขการหักค่าลา - แยกประเภท Leave Type

**ไฟล์ที่แก้ไข:**
- [lib/wageCalculationsV2.ts](lib/wageCalculationsV2.ts)
- [app/api/wages/calculate-v2/route.ts](app/api/wages/calculate-v2/route.ts)

**การเปลี่ยนแปลง:**

#### เดิม (ผิด):
```typescript
// หักค่าลาทุกประเภทเหมือนกัน
const leaveDays = leaveRecords.length
leaveDeduction = leaveDays * dailyRate
```

#### ใหม่ (ถูก):
```typescript
// แยกเป็น paid leave และ unpaid leave
const paidLeaveDays = leaveRecords.filter(leave => leave.is_paid === true).length
const unpaidLeaveDays = leaveRecords.filter(leave => leave.is_paid !== true).length

// หักเฉพาะ unpaid leave (ลากิจ, ลาคลอด)
if (!isDaily && unpaidLeaveDays > 0) {
  const dailyRate = employee.monthly_salary / 15
  leaveDeduction = unpaidLeaveDays * dailyRate
}
```

**กฎการกำหนด is_paid:**
- **Paid Leave (ไม่หักเงิน):** ลาป่วย, ลาพักร้อน, sick_leave, annual_leave
- **Unpaid Leave (หักเงิน):** ลากิจ, ลาคลอด, และอื่นๆ

---

### ✅ 2. ปรับเกณฑ์กะกลางคืน จาก 19:00 → 20:00

**ไฟล์ที่แก้ไข:**
- [lib/wageCalculationsV2.ts:163-170](lib/wageCalculationsV2.ts#L163-L170)

**การเปลี่ยนแปลง:**

#### เดิม:
```typescript
// เข้ากะตั้งแต่ 19:00 ถึง 05:59
return checkInHour >= 19 || checkInHour < 6
```

#### ใหม่:
```typescript
// เข้ากะตั้งแต่ 20:00 ถึง 05:59 (ตรงตามกะกลางคืน 20:00-05:30)
return checkInHour >= 20 || checkInHour < 6
```

**เบี้ยกะกลางคืน:** 40 บาท/วัน (ไม่เปลี่ยนแปลง)

---

### ✅ 3. แก้ไขการคำนวณ OT Wage ให้ใช้ Multiplied Fields

**ไฟล์ที่แก้ไข:**
- [lib/wageCalculationsV2.ts:145-163](lib/wageCalculationsV2.ts#L145-L163)
- [app/api/wages/calculate-v2/route.ts:91-113](app/api/wages/calculate-v2/route.ts#L91-L113)

**การเปลี่ยนแปลง:**

#### เดิม (คูณซ้ำ):
```typescript
ot1_hours += att.ot_normal_hours || 0  // ชั่วโมงจริง (เช่น 2.0)
ot1_wage = ot1_hours * perhr_salary * 1.5  // ❌ คูณ 1.5 ซ้ำ
```

#### ใหม่ (ถูกต้อง):
```typescript
// ใช้ multiplied fields ที่คูณไว้แล้วใน daily_attendance
ot1_hours += att.ot_normal_hours_multiplied ?? (att.ot_normal_hours || 0)
ot2_hours += att.ot_special_hours_multiplied ?? (att.ot_special_hours || 0)
ot3_hours += att.ot_premium_hours_multiplied ?? (att.ot_premium_hours || 0)

// คูณเฉพาะ perhr_salary (multiplier คูณไว้แล้ว)
ot1_wage = ot1_hours * perhr_salary
ot2_wage = ot2_hours * perhr_salary
ot3_wage = ot3_hours * perhr_salary
```

**ตัวอย่าง:**
```
OT ปกติ 2.0 ชม. (ชั่วโมงจริง)
→ ot_normal_hours_multiplied = 2.0 × 1.5 = 3.0 ชม.
→ ot1_wage = 3.0 × 70 = 210 บาท ✓
```

---

### ✅ 4. เพิ่ม Backward Compatibility

**Nullish Coalescing (??) Operator:**
```typescript
ot1_hours += att.ot_normal_hours_multiplied ?? (att.ot_normal_hours || 0)
```

**ความหมาย:**
- ถ้ามี `ot_normal_hours_multiplied` → ใช้ค่านี้ (ระบบใหม่)
- ถ้าไม่มี (`null` หรือ `undefined`) → ใช้ `ot_normal_hours` (ระบบเก่า)

**ประโยชน์:**
- รองรับข้อมูลเก่าที่ยังไม่มี multiplied fields
- ไม่ต้อง migrate ข้อมูลเดิม

---

## 🗄️ Database Schema Changes

### 1. เพิ่ม `is_paid` column ใน `leave_records`

```sql
ALTER TABLE leave_records
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;

-- Update ข้อมูลเดิม
UPDATE leave_records
SET is_paid = CASE
  WHEN LOWER(leave_type) IN ('ลาป่วย', 'ลาพักร้อน', 'sick_leave', 'annual_leave') THEN TRUE
  ELSE FALSE
END;
```

### 2. เพิ่ม Multiplied Fields ใน `daily_attendance` (ถ้ายังไม่มี)

```sql
ALTER TABLE daily_attendance
ADD COLUMN IF NOT EXISTS ot_normal_hours_multiplied NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ot_special_hours_multiplied NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ot_premium_hours_multiplied NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ot_hours_multiplied NUMERIC(10,2) DEFAULT 0;
```

### 3. เพิ่ม `monthly_salary` และ `employment_type` ใน `employees` (ถ้ายังไม่มี)

```sql
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS monthly_salary NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50) DEFAULT 'รายวัน';
```

### 4. สร้าง Indexes เพื่อ Performance

```sql
CREATE INDEX IF NOT EXISTS idx_leave_records_employee_date
ON leave_records(employee_id, leave_date);

CREATE INDEX IF NOT EXISTS idx_daily_attendance_employee_date
ON daily_attendance(employee_id, work_date);

CREATE INDEX IF NOT EXISTS idx_wage_details_employee_period
ON wage_details(employee_id, year, month, period);
```

---

## 📝 วิธีการ Deploy

### Step 1: Run Database Migration

```bash
# รัน SQL script
psql -U your_username -d your_database -f wage_system_fixes.sql
```

หรือ copy SQL จากไฟล์ [wage_system_fixes.sql](wage_system_fixes.sql) ไป run ใน Supabase SQL Editor

### Step 2: Verify Database Changes

```sql
-- ตรวจสอบว่ามี columns ครบหรือยัง
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'leave_records' AND column_name = 'is_paid';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'daily_attendance' AND column_name LIKE '%multiplied%';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'employees' AND column_name IN ('monthly_salary', 'employment_type');
```

### Step 3: Deploy โค้ดใหม่

```bash
# Deploy to production
npm run build
npm run deploy  # หรือ git push (ถ้าใช้ auto deploy)
```

### Step 4: Recalculate Wages (Optional)

ถ้าต้องการคำนวณค่าจ้างใหม่สำหรับเดือนปัจจุบัน:

```bash
# เรียก API calculate-v2
curl -X POST https://your-domain.com/api/wages/calculate-v2 \
  -H "Content-Type: application/json" \
  -d '{"month": 12, "year": 2025}'
```

---

## 🧪 การทดสอบ

### Test Case 1: พนักงานรายเดือน ลาป่วย (Paid Leave)

**ข้อมูลทดสอบ:**
```
Employee: TEST001 (รายเดือน)
Monthly Salary: 6,000 บาท
Work Period 2: 11-25 ธ.ค. 2568 (15 วัน)
Leave: ลาป่วย 1 วัน (2025-12-15)
```

**ผลที่คาดหวัง:**
```
Base Wage: 6,000 บาท (ไม่หัก)
Leave Deduction: 0 บาท (ลาป่วยไม่หักเงิน)
```

### Test Case 2: พนักงานรายเดือน ลากิจ (Unpaid Leave)

**ข้อมูลทดสอบ:**
```
Employee: TEST001 (รายเดือน)
Monthly Salary: 6,000 บาท
Work Period 2: 11-25 ธ.ค. 2568 (15 วัน)
Leave: ลากิจ 1 วัน (2025-12-16)
```

**ผลที่คาดหวัง:**
```
Base Wage: 6,000 บาท
Daily Rate: 6,000 / 15 = 400 บาท/วัน
Leave Deduction: 400 บาท
Net Base Wage: 6,000 - 400 = 5,600 บาท
```

### Test Case 3: พนักงานรายวัน ทำ OT

**ข้อมูลทดสอบ:**
```
Employee: TEST002 (รายวัน)
Perday Salary: 560 บาท
Perhr Salary: 70 บาท
Work Days: 10 วัน
OT Normal: 5 ชม. (ชั่วโมงจริง)
```

**ผลที่คาดหวัง:**
```
Base Wage: 10 × 560 = 5,600 บาท
OT Normal (multiplied): 5 × 1.5 = 7.5 ชม.
OT Wage: 7.5 × 70 = 525 บาท
Total: 5,600 + 525 = 6,125 บาท
```

### Test Case 4: พนักงานทำกะกลางคืน

**ข้อมูลทดสอบ:**
```
Employee: TEST003
Check-in: 20:15 น. (กะ 2)
ทำงาน 5 วัน
```

**ผลที่คาดหวัง:**
```
Night Shift Days: 5 วัน (เข้างาน >= 20:00)
Night Shift Allowance: 5 × 40 = 200 บาท
```

---

## ⚠️ ข้อควรระวัง

### 1. การ Migrate ข้อมูลเก่า

**ข้อมูล `leave_records` เก่าที่ยังไม่มี `is_paid`:**
- SQL script จะ update อัตโนมัติ (ดู section 1 ใน `wage_system_fixes.sql`)
- ตรวจสอบให้แน่ใจว่า `leave_type` ถูกต้อง

**ข้อมูล `daily_attendance` เก่าที่ยังไม่มี `multiplied fields`:**
- ระบบจะใช้ `ot_normal_hours` แทน (backward compatibility)
- แนะนำให้ recalculate OT ใหม่เพื่อสร้าง multiplied fields

### 2. การคำนวณ SSO และภาษี

**SSO:**
- คำนวณรายเดือน (5% ของรายได้ ฐานสูงสุด 15,000 บาท)
- แบ่งเป็น 2 งวด (งวด 1 หักก่อน, งวด 2 หักส่วนที่เหลือ)
- **ไม่มีการเปลี่ยนแปลง**

**ภาษี:**
- ใช้ Cumulative YTD Method
- ประมาณการรายได้ทั้งปี → คำนวณภาษีตามขั้นบันได → หักทีละงวด
- **ไม่มีการเปลี่ยนแปลง**

### 3. เบี้ยขยัน (Attendance Bonus)

**เงื่อนไข:**
- มาก่อนเวลา >= 5 นาที ทุกวันในงวด
- ไม่ลางาน (ไม่นับ paid leave)
- ไม่มาสาย

**จำนวนเงิน:** 300 บาท/งวด (ไม่เปลี่ยนแปลง)

---

## 📊 สถิติและ Metrics

### ก่อนปรับปรุง (Old System)

**ปัญหา:**
- หักค่าลาทุกประเภทเหมือนกัน (ลาป่วยก็หักเงิน ❌)
- คำนวณ OT wage ผิด (คูณ multiplier ซ้ำ ❌)
- เกณฑ์กะกลางคืนไม่ตรง (19:00 แทน 20:00 ❌)

**ผลกระทบ:**
- พนักงานรายเดือนที่ลาป่วยโดนหักเงินผิด
- ค่า OT สูงเกินจริง (คูณ 1.5 ซ้ำ)
- เบี้ยกะดึกจ่ายผิดคน (เข้างาน 19:30 ก็ได้เบี้ย)

### หลังปรับปรุง (New System)

**การแก้ไข:**
- ✅ แยก paid/unpaid leave ถูกต้อง
- ✅ ใช้ multiplied fields ถูกต้อง
- ✅ เกณฑ์กะกลางคืน 20:00-05:59 ตรงตามความต้องการ

**ผลลัพธ์:**
- พนักงานรายเดือนลาป่วยไม่โดนหักเงิน ✓
- ค่า OT คำนวณถูกต้อง (ใช้ multiplied fields) ✓
- เบี้ยกะดึกจ่ายถูกต้อง (เข้างาน >= 20:00) ✓

---

## 🔍 Verification Checklist

ก่อน Deploy ให้ตรวจสอบดังนี้:

- [ ] Run SQL migration script สำเร็จ
- [ ] ตรวจสอบว่ามี `is_paid` column ใน `leave_records`
- [ ] ตรวจสอบว่ามี multiplied fields ใน `daily_attendance`
- [ ] ตรวจสอบว่ามี `monthly_salary`, `employment_type` ใน `employees`
- [ ] Deploy โค้ดใหม่สำเร็จ
- [ ] ทดสอบด้วย Test Cases ทั้ง 4 cases
- [ ] Recalculate wages สำหรับเดือนปัจจุบัน (ถ้าต้องการ)
- [ ] ตรวจสอบ logs ไม่มี error

---

## 📞 การติดต่อและรายงานปัญหา

หากพบปัญหาหรือมีคำถาม:

1. ตรวจสอบ logs ใน API response
2. ตรวจสอบ database ว่า columns ครบหรือยัง
3. ทดสอบด้วย Test Cases
4. Report issue พร้อม logs และข้อมูลทดสอบ

---

## 📚 เอกสารอ้างอิง

1. [WAGE_CALCULATION_COMPLETE_GUIDE.md](WAGE_CALCULATION_COMPLETE_GUIDE.md) - คู่มือระบบคำนวณค่าจ้างฉบับสมบูรณ์
2. [CHANGELOG_OT_CALCULATION.md](CHANGELOG_OT_CALCULATION.md) - การเปลี่ยนแปลงระบบคำนวณ OT
3. [wage_system_fixes.sql](wage_system_fixes.sql) - SQL Migration Script

---

**สร้างโดย:** Claude Code Agent
**วันที่:** 13 ธันวาคม 2568
**เวอร์ชัน:** 2.1
