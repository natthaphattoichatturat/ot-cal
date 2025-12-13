# OT Calculation System - Changelog

## 📋 สรุปการเปลี่ยนแปลง

เปลี่ยนระบบการคำนวณ OT จาก **"คูณทีละวัน"** เป็น **"รวมชั่วโมงจริงก่อน แล้วค่อยคูณในตอนท้าย"**

---

## 🎯 วัตถุประสงค์

ให้ระบบคำนวณ OT ตามหลักการที่ถูกต้อง:
1. เก็บ**ชั่วโมงจริง**ของแต่ละประเภท OT ในแต่ละวัน
2. **รวมชั่วโมงจริง**ในแต่ละงวด (งวดที่ 1: วันที่ 26 เดือนก่อน - 10, งวดที่ 2: วันที่ 11-25)
3. **คูณด้วย multiplier** เฉพาะตอนแสดงผลรวม (×1.5, ×2, ×3)

---

## 🔧 การแก้ไข Backend

### 1. **Database Schema** (`daily_attendance` table)

เพิ่มคอลัมน์ใหม่ 4 คอลัมน์สำหรับเก็บชั่วโมงที่คำนวณแล้ว:

```sql
ALTER TABLE daily_attendance
ADD COLUMN IF NOT EXISTS ot_normal_hours_multiplied numeric(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ot_special_hours_multiplied numeric(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ot_premium_hours_multiplied numeric(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ot_hours_multiplied numeric(10, 2) DEFAULT 0;
```

**ความหมายของคอลัมน์:**

| คอลัมน์ | ความหมาย |
|---------|----------|
| `ot_normal_hours` | ชั่วโมง OT ปกติ (จริง ไม่คูณ) |
| `ot_special_hours` | ชั่วโมง OT พิเศษ (จริง ไม่คูณ) |
| `ot_premium_hours` | ชั่วโมง OT ขั้นสูง (จริง ไม่คูณ) |
| `ot_hours` | ชั่วโมง OT รวม (จริง ไม่คูณ) |
| `ot_normal_hours_multiplied` | OT ปกติที่คำนวณแล้ว (×1.5) |
| `ot_special_hours_multiplied` | OT พิเศษที่คำนวณแล้ว (รายวัน ×2, รายเดือน ×1) |
| `ot_premium_hours_multiplied` | OT ขั้นสูงที่คำนวณแล้ว (×3) |
| `ot_hours_multiplied` | OT รวมที่คำนวณแล้ว |

---

### 2. **lib/otCalculator.ts**

#### 2.1 อัพเดท Interface

```typescript
interface WorkSession {
  workDate: string
  checkInTime: string
  checkOutTime: string
  actualHours: number
  otHours: number                    // รวมชั่วโมงจริง (ไม่คูณ)
  otNormalHours: number              // OT ปกติ (ชั่วโมงจริง)
  otSpecialHours: number             // OT พิเศษ (ชั่วโมงจริง)
  otPremiumHours: number             // OT ขั้นสูง (ชั่วโมงจริง)
  otNormalHoursMultiplied: number    // OT ปกติที่คำนวณแล้ว (×1.5)
  otSpecialHoursMultiplied: number   // OT พิเศษที่คำนวณแล้ว (×2 หรือ ×1)
  otPremiumHoursMultiplied: number   // OT ขั้นสูงที่คำนวณแล้ว (×3)
  otHoursMultiplied: number          // รวม OT ที่คำนวณแล้ว
  isHoliday: boolean
  shift: 1 | 2
  late: boolean
  lateHours: number
  allowLateNextDay: boolean
  employmentType: 'รายวัน' | 'รายเดือน'
}
```

#### 2.2 การคำนวณใหม่

**เดิม (ผิด):**
```typescript
// วันธรรมดา
otNormalHours = actualHours
otHours = actualHours * 1.5  // ❌ คูณทันที
```

**ใหม่ (ถูก):**
```typescript
// วันธรรมดา
otNormalHours = roundDownToHalfHourInHours(actualHours)  // ชั่วโมงจริง (ปัด)
otHours = otNormalHours                                   // รวมชั่วโมงจริง

// คำนวณชั่วโมงที่คูณแล้ว (แยกต่างหาก)
otNormalHoursMultiplied = otNormalHours * 1.5
otHoursMultiplied = otNormalHoursMultiplied
```

**การปัดเศษ:**
- ใช้ `roundDownToHalfHourInHours()` ปัดลงเป็น `.0` หรือ `.5` เท่านั้น
- ตัวอย่าง: `3.67 ชม. → 3.5 ชม.`, `3.12 ชม. → 3.0 ชม.`

---

### 3. **app/api/import-scans/route.ts**

บันทึกทั้งชั่วโมงจริงและชั่วโมงที่คำนวณแล้วลง database:

```typescript
attendanceMap.set(key, {
  employee_id: employeeId,
  work_date: session.workDate,
  check_in_time: session.checkInTime,
  check_out_time: session.checkOutTime,

  // ชั่วโมงจริง (ไม่คูณ)
  actual_hours: session.actualHours,
  ot_hours: session.otHours,
  ot_normal_hours: session.otNormalHours,
  ot_special_hours: session.otSpecialHours,
  ot_premium_hours: session.otPremiumHours,

  // ชั่วโมงที่คำนวณแล้ว (คูณแล้ว)
  ot_normal_hours_multiplied: session.otNormalHoursMultiplied,
  ot_special_hours_multiplied: session.otSpecialHoursMultiplied,
  ot_premium_hours_multiplied: session.otPremiumHoursMultiplied,
  ot_hours_multiplied: session.otHoursMultiplied,

  is_holiday: session.isHoliday,
  late: session.late,
  late_hours: session.lateHours,
  updated_at: new Date().toISOString()
})
```

---

### 4. **app/api/attendance/route.ts**

ส่งข้อมูล multiplied fields ไปยัง frontend:

```typescript
attendanceMap.get(empId).attendance[record.work_date] = {
  actualHours: record.actual_hours,
  otHours: record.ot_hours,
  otNormalHours: record.ot_normal_hours || 0,
  otSpecialHours: record.ot_special_hours || 0,
  otPremiumHours: record.ot_premium_hours || 0,
  otHoursMultiplied: record.ot_hours_multiplied || 0,
  otNormalHoursMultiplied: record.ot_normal_hours_multiplied || 0,
  otSpecialHoursMultiplied: record.ot_special_hours_multiplied || 0,
  otPremiumHoursMultiplied: record.ot_premium_hours_multiplied || 0,
  isHoliday: record.is_holiday,
  late: record.late,
  checkInTime: record.check_in_time,
  checkOutTime: record.check_out_time
}
```

---

## 🎨 การแก้ไข Frontend

### 1. **app/page.tsx**

#### 1.1 อัพเดท Interface

```typescript
interface AttendanceData {
  employeeId: string
  name: string
  department: string
  attendance: {
    [date: string]: {
      otHours: number
      otNormalHours: number
      otSpecialHours: number
      otPremiumHours: number
      otHoursMultiplied: number
      otNormalHoursMultiplied: number
      otSpecialHoursMultiplied: number
      otPremiumHoursMultiplied: number
      actualHours: number
      isHoliday: boolean
      late: boolean
      checkInTime: string
      checkOutTime: string
    }
  }
}
```

#### 1.2 เพิ่ม 8 คอลัมน์สรุป

**โครงสร้างตาราง:**
```
┌─────────────┬─────────────┬──────────────────────────────────┬──────────────────────────────────┬─────────┐
│ รหัสพนักงาน │ ชื่อพนักงาน │ 4 คอลัมน์ชั่วโมงจริง (สีฟ้า)     │ 4 คอลัมน์ชั่วโมงคำนวณ (สีส้ม)    │ วันที่  │
├─────────────┼─────────────┼──────────────────────────────────┼──────────────────────────────────┼─────────┤
│             │             │ รวม OT │ OT ปกติ │ OT พิเศษ │   │ รวม OT │ OT ปกติ │ OT พิเศษ │   │ 1 2 3..│
│             │             │        │         │ OT ขั้นสูง │   │(คำนวณ)│ (×1.5)  │ (×2)     │   │        │
│             │             │        │         │          │   │        │         │ (×3)     │   │        │
└─────────────┴─────────────┴──────────────────────────────────┴──────────────────────────────────┴─────────┘
```

**4 คอลัมน์แรก (ชั่วโมงจริง - สีฟ้า):**
1. รวม OT
2. OT ปกติ
3. OT พิเศษ
4. OT ขั้นสูง

**4 คอลัมน์หลัง (ชั่วโมงคำนวณ - สีส้ม):**
1. รวม OT (คำนวณ)
2. OT ปกติ (×1.5)
3. OT พิเศษ (×2 สำหรับรายวัน, ×1 สำหรับรายเดือน)
4. OT ขั้นสูง (×3)

#### 1.3 การรวมยอด

```typescript
dates.forEach(date => {
  if (employee.attendance[date]) {
    // รวมชั่วโมงจริง
    totalOT += employee.attendance[date].otHours
    totalNormalOT += employee.attendance[date].otNormalHours || 0
    totalSpecialOT += employee.attendance[date].otSpecialHours || 0
    totalPremiumOT += employee.attendance[date].otPremiumHours || 0

    // รวมชั่วโมงที่คำนวณแล้ว
    totalOTMultiplied += employee.attendance[date].otHoursMultiplied || 0
    totalNormalOTMultiplied += employee.attendance[date].otNormalHoursMultiplied || 0
    totalSpecialOTMultiplied += employee.attendance[date].otSpecialHoursMultiplied || 0
    totalPremiumOTMultiplied += employee.attendance[date].otPremiumHoursMultiplied || 0
  }
})
```

---

## 📊 ตัวอย่างการคำนวณ

### ตัวอย่างที่ 1: วันธรรมดา

**พนักงานทำ OT:**
- วันที่ 1: OT ปกติ 2.5 ชม.
- วันที่ 2: OT ปกติ 3.0 ชม.
- วันที่ 3: OT ปกติ 1.5 ชม.

**การคำนวณ:**
```
รวม OT ปกติ (ชั่วโมงจริง) = 2.5 + 3.0 + 1.5 = 7.0 ชม.
OT ปกติ (คำนวณ) = 7.0 × 1.5 = 10.5 ชม.
```

### ตัวอย่างที่ 2: วันหยุด (พนักงานรายวัน)

**พนักงานทำงานวันอาทิตย์:**
- เข้างาน: 7:23
- ออกงาน: 20:03
- ชั่วโมงทำงานจริง: 11.12 ชม. (หลังหักพัก)

**การคำนวณ:**
```
ชั่วโมงทำงาน (หลังปัด) = 11.0 ชม.
→ เกิน 8 ชม. แล้ว

8 ชม.แรก:
- OT พิเศษ = 8.0 ชม.
- OT พิเศษ (คำนวณ) = 8.0 × 2 = 16.0 ชม.

ส่วนที่เกิน:
- OT ขั้นสูง = 11.0 - 8.0 = 3.0 ชม.
- OT ขั้นสูง (คำนวณ) = 3.0 × 3 = 9.0 ชม.

รวม OT (ชั่วโมงจริง) = 8.0 + 3.0 = 11.0 ชม.
รวม OT (คำนวณ) = 16.0 + 9.0 = 25.0 ชม.
```

### ตัวอย่างที่ 3: วันหยุด (พนักงานรายเดือน)

**เหมือนกับตัวอย่างที่ 2 แต่เป็นพนักงานรายเดือน:**

```
8 ชม.แรก:
- OT พิเศษ = 8.0 ชม.
- OT พิเศษ (คำนวณ) = 8.0 × 1 = 8.0 ชม. ← ต่างตรงนี้!

ส่วนที่เกิน:
- OT ขั้นสูง = 3.0 ชม.
- OT ขั้นสูง (คำนวณ) = 3.0 × 3 = 9.0 ชม.

รวม OT (ชั่วโมงจริง) = 8.0 + 3.0 = 11.0 ชม.
รวม OT (คำนวณ) = 8.0 + 9.0 = 17.0 ชม. ← น้อยกว่ารายวัน
```

---

## 🔍 กฎการคำนวณ OT

### 1. วันธรรมดา (Weekday)

| เวลา | ประเภท OT | Multiplier |
|------|-----------|------------|
| 6:00 - 8:00 | OT ปกติ | ×1.5 |
| 17:30 - ... | OT ปกติ | ×1.5 |

**การปัด:**
- OT ที่น้อยกว่า 30 นาที → ปัดเป็น 0
- OT ที่ 30-59 นาที → ปัดเป็น 0.5 ชม.
- OT ที่ 60-89 นาที → ปัดเป็น 1.0 ชม.

### 2. วันหยุด/อาทิตย์ (Holiday/Sunday)

#### พนักงานรายวัน:
| ชั่วโมงทำงาน | ประเภท OT | Multiplier |
|-------------|-----------|------------|
| 0-8 ชม. | OT พิเศษ | ×2 |
| เกิน 8 ชม. | OT ขั้นสูง | ×3 |

#### พนักงานรายเดือน:
| ชั่วโมงทำงาน | ประเภท OT | Multiplier |
|-------------|-----------|------------|
| 0-8 ชม. | OT พิเศษ | ×1 |
| เกิน 8 ชม. | OT ขั้นสูง | ×3 |

**หมายเหตุ:**
- วันหยุด: นับทุกชั่วโมงที่ทำงาน (รวมเวลาปกติ 8:00-17:00)
- หักเวลาพัก: พักกลางวัน 1 ชม., พักเย็น 30 นาที

### 3. การเข้างานก่อนเวลา

#### Shift 1 (กะเช้า 8:00-17:00):
- **เริ่ม OT**: 6:00 น.
- **OT สูงสุด**: 2 ชั่วโมง
- **ตัวอย่าง**:
  - เข้างาน 6:00 → OT เช้า 2.0 ชม.
  - เข้างาน 7:00 → OT เช้า 1.0 ชม.
  - เข้างาน 7:45 → OT เช้า 0.5 ชม. (ปัดลง)

#### Shift 2 (กะดึก 20:00-05:00):
- **เริ่ม OT**: 17:30 น.
- **OT สูงสุด**: ไม่จำกัด
- **ตัวอย่าง**:
  - เข้างาน 17:30 → OT เย็น 2.5 ชม.
  - เข้างาน 18:00 → OT เย็น 2.0 ชม.
  - เข้างาน 19:30 → OT เย็น 0.5 ชม. (ปัดลง)

---

## 🚀 ขั้นตอนการ Deploy

### 1. รัน Migration

```sql
-- เพิ่มคอลัมน์ใหม่
ALTER TABLE daily_attendance
ADD COLUMN IF NOT EXISTS ot_normal_hours_multiplied numeric(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ot_special_hours_multiplied numeric(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ot_premium_hours_multiplied numeric(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ot_hours_multiplied numeric(10, 2) DEFAULT 0;

-- เพิ่ม comment อธิบาย
COMMENT ON COLUMN daily_attendance.ot_normal_hours IS 'ชั่วโมง OT ปกติ (จริง ไม่ผ่านการคูณ)';
COMMENT ON COLUMN daily_attendance.ot_special_hours IS 'ชั่วโมง OT พิเศษ (จริง ไม่ผ่านการคูณ)';
COMMENT ON COLUMN daily_attendance.ot_premium_hours IS 'ชั่วโมง OT ขั้นสูง (จริง ไม่ผ่านการคูณ)';
COMMENT ON COLUMN daily_attendance.ot_hours IS 'ชั่วโมง OT รวม (จริง ไม่ผ่านการคูณ)';

COMMENT ON COLUMN daily_attendance.ot_normal_hours_multiplied IS 'ชั่วโมง OT ปกติที่คำนวณแล้ว (×1.5)';
COMMENT ON COLUMN daily_attendance.ot_special_hours_multiplied IS 'ชั่วโมง OT พิเศษที่คำนวณแล้ว (รายวัน ×2, รายเดือน ×1)';
COMMENT ON COLUMN daily_attendance.ot_premium_hours_multiplied IS 'ชั่วโมง OT ขั้นสูงที่คำนวณแล้ว (×3)';
COMMENT ON COLUMN daily_attendance.ot_hours_multiplied IS 'ชั่วโมง OT รวมที่คำนวณแล้ว';
```

### 2. Deploy Code

```bash
# Pull code ใหม่
git pull origin main

# Build
npm run build

# Restart server
pm2 restart app
```

### 3. Re-import ข้อมูล

เนื่องจากข้อมูลเก่าไม่มี multiplied fields ต้อง re-import:

```bash
# ลบข้อมูลเก่า (ถ้าต้องการ)
DELETE FROM daily_attendance;

# Import ใหม่ผ่าน UI
# ไป / > Import Data > เลือกไฟล์ .txt > Import
```

---

## ✅ Checklist

- [x] อัพเดท Database Schema (เพิ่ม 4 คอลัมน์)
- [x] แก้ไข `lib/otCalculator.ts` (เปลี่ยนวิธีคำนวณ)
- [x] แก้ไข `app/api/import-scans/route.ts` (บันทึกข้อมูลใหม่)
- [x] แก้ไข `app/api/attendance/route.ts` (ส่งข้อมูลใหม่)
- [x] แก้ไข `app/page.tsx` (แสดง 8 คอลัมน์)
- [ ] รัน Migration SQL
- [ ] Re-import ข้อมูล
- [ ] ทดสอบการคำนวณ

---

## 📝 หมายเหตุ

### ข้อดีของระบบใหม่:
1. ✅ คำนวณตามหลักการที่ถูกต้อง (รวมก่อน แล้วค่อยคูณ)
2. ✅ ข้อมูลชัดเจน แยกชั่วโมงจริงกับชั่วโมงคำนวณ
3. ✅ ง่ายต่อการตรวจสอบและ debug
4. ✅ รองรับทั้งพนักงานรายวันและรายเดือน

### ข้อควรระวัง:
1. ⚠️ ต้อง re-import ข้อมูลเก่าทั้งหมด
2. ⚠️ ข้อมูลเก่าจะไม่มี multiplied fields (แสดงเป็น 0)
3. ⚠️ ต้อง deploy ทั้ง backend และ frontend พร้อมกัน

---

## 👤 ผู้พัฒนา

- **วันที่**: 2025-12-13
- **ผู้แก้ไข**: Claude Sonnet 4.5
- **อนุมัติโดย**: [ระบุชื่อ]

---

## 📚 อ้างอิง

- [otCalculator.ts](lib/otCalculator.ts)
- [import-scans/route.ts](app/api/import-scans/route.ts)
- [attendance/route.ts](app/api/attendance/route.ts)
- [page.tsx](app/page.tsx)
