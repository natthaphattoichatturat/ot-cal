# 🤖 ระบบคำนวณค่าจ้างอัตโนมัติ (Auto Wage Calculation)

## ⚡ การทำงานอัตโนมัติ 100%

ระบบได้ถูก upgrade ให้คำนวณค่าจ้างอัตโนมัติทันทีหลังจาก import ไฟล์ scan แล้ว!

---

## 🔄 Workflow อัตโนมัติใหม่

```
1. Import ไฟล์ .txt (หน้าหลัก /)
   └─► Parse scans → attendance_scans table
       └─► Calculate OT → daily_attendance table
           └─► 🤖 AUTO: Calculate Wages → wage_summary table ✨ ใหม่!
```

### ขั้นตอนการทำงาน:

#### 1. **Parse & Store Scans**
```typescript
attendance_scans ← raw scan data (.txt file)
```

#### 2. **Calculate OT Hours**
```typescript
daily_attendance ← {
  actual_hours,      // ชั่วโมงทำงานจริง
  ot_normal_hours,   // OT x1.5
  ot_special_hours,  // OT x2
  ot_premium_hours   // OT x3
}
```

#### 3. **Auto Calculate Wages** 🆕
```typescript
wage_summary ← {
  base_wage,         // ค่าจ้างพื้นฐาน
  ot_wage,           // ค่า OT ทั้งหมด
  attendance_bonus,  // เบี้ยขยัน
  total_income,      // รายได้รวม
  sso,               // ประกันสังคม (คำนวณรายเดือน แบ่ง 2 งวด)
  tax,               // ภาษีหัก ณ ที่จ่าย (Cumulative YTD)
  total_deduction,   // รวมหัก
  net_wage           // เงินสุทธิ
}
```

---

## 📊 ข้อมูลที่คำนวณอัตโนมัติ

### A. ค่าจ้างรายวัน (Daily Wage)
```
Base Wage = actualHours × perhr_salary
OT 1.5 = ot_normal_hours × perhr_salary × 1.5
OT 2.0 = ot_special_hours × perhr_salary × 2.0
OT 3.0 = ot_premium_hours × perhr_salary × 3.0
```

### B. เบี้ยขยัน (Attendance Bonus)
```
เงื่อนไข:
- ไม่ลางาน (is_leave = false)
- ไม่มาสาย (late = false)
- ครบทุกวันในงวด

ได้รับ: 500 บาท/งวด
```

### C. ประกันสังคม (SSO)
```
คำนวณรายเดือน (ทั้ง 2 งวดรวมกัน):
- ฐานคำนวณ = รายได้ที่คำนวณ SSO (มี flag include_in_sso)
- อัตรา = 5%
- เพดาน = 15,000 บาท → SSO สูงสุด 750 บาท/เดือน

แบ่งงวด:
- งวด 1 = งวดที่มีรายได้มากกว่า
- งวด 2 = ที่เหลือ (อาจเป็น 0 ถ้างวด 1 ถึงเพดานแล้ว)
```

### D. ภาษีเงินได้ (Withholding Tax)
```
วิธี: Cumulative Year-to-Date (YTD)
1. ประมาณการเงินได้ทั้งปี
2. หักค่าใช้จ่าย (สูงสุด 100,000)
3. หักค่าลดหย่อน (ส่วนตัว + บุตร)
4. คำนวณภาษีตามขั้นบันได
5. หักภาษีงวดนี้ = (ภาษีทั้งปี - ภาษีที่หักไปแล้ว) / งวดที่เหลือ
```

---

## 🎯 ตัวอย่างการทำงาน

### สถานการณ์: Import ไฟล์ scan วันที่ 1-15 พฤศจิกายน 2025

```
[Step 1] Import File
Input: scan_20251101_20251115.txt
├─ 150 scans imported
└─ 0 duplicates

[Step 2] Calculate OT (อัตโนมัติ)
├─ 10 employees processed
├─ 150 attendance records created/updated
└─ OT breakdown:
    • OT Normal (x1.5): 120 hours
    • OT Special (x2): 30 hours
    • OT Premium (x3): 5 hours

[Step 3] 🤖 Calculate Wages (อัตโนมัติ)
├─ Detected affected months: 11/2025
├─ Calculating for period 1 & 2...
└─ Results:
    ✅ Period 1 (26 Oct - 10 Nov): 10 records
    ✅ Period 2 (11 Nov - 25 Nov): 10 records
    💰 Total: 20 wage records calculated

[Output Message]
✅ Imported 150 scans. 0 duplicates skipped.
💰 Auto-calculated 20 wage records.
📊 11/2025: 20 records
```

---

## 💡 ความแตกต่างจากเดิม

### ก่อนหน้า (Manual) ❌
```
1. Import scan file → daily_attendance ✅
2. ไปหน้า /wages → เลือกเดือน → กดปุ่มคำนวณ 🔘
3. รอ... wage_summary ✅
4. ไปดูหน้า /wages/[id] หรือ LIFF
```

### ตอนนี้ (Automatic) ✅
```
1. Import scan file → daily_attendance ✅
                   → wage_summary ✅ (อัตโนมัติ!)
2. ไปดูหน้า /wages/[id] หรือ LIFF ทันที
```

---

## 🔧 Technical Implementation

### API Endpoint: `/api/import-scans`

**เพิ่มใน Response:**
```typescript
{
  success: true,
  inserted: 150,
  duplicates: 0,
  recalculated: 0,
  wagesCalculated: 20,        // 🆕 จำนวนค่าจ้างที่คำนวณ
  wageDetails: [              // 🆕 รายละเอียดแต่ละเดือน
    "11/2025: 20 records"
  ],
  message: "✅ Imported 150 scans..."
}
```

**Logic ที่เพิ่ม:**
```typescript
// หลังจาก upsert daily_attendance เสร็จ
const affectedMonths = new Set<string>()
allAttendanceRecords.forEach(record => {
  const date = new Date(record.work_date)
  affectedMonths.add(`${year}-${month}`)
})

// คำนวณค่าจ้างสำหรับแต่ละเดือนที่ได้รับผลกระทบ
for (const monthStr of affectedMonths) {
  const [year, month] = monthStr.split('-').map(Number)
  
  // เรียก /api/wages/calculate แบบ internal
  await calculateWages({ month, year })
  
  // บันทึกลง wage_summary (upsert)
}
```

---

## 🎨 UI Changes

### หน้าหลัก (/)

**Import Message - ก่อน:**
```
✓ Successfully imported 150 scans. 0 duplicates skipped.
```

**Import Message - หลัง:**
```
✅ Successfully imported 150 scans. 0 duplicates skipped.
💰 Auto-calculated 20 wage records.
📊 11/2025: 20 records
```

---

## ⚠️ สิ่งที่ต้องรู้

### 1. Performance
- ถ้า import scan จำนวนมาก อาจใช้เวลาคำนวณ 10-30 วินาที
- ระบบจะคำนวณทุกเดือนที่ได้รับผลกระทบ
- ใช้ upsert → ไม่ซ้ำซ้อน ถ้ามีข้อมูลเดิมจะอัพเดท

### 2. ข้อมูลที่ต้องมีครบ
```
✅ employees → perhr_salary, perday_salary
✅ daily_attendance → actual_hours, ot_*_hours
✅ (Optional) special_holidays → สำหรับคำนวณ OT พิเศษ
```

### 3. การ Re-calculate
- Import scan ซ้ำ (duplicate) → ระบบจะ recalculate OT + wages อัตโนมัติ
- แก้ไขข้อมูล attendance ด้วยมือ → ควร import file ใหม่เพื่อ trigger calculation

---

## 🐛 Troubleshooting

### ปัญหา: Import สำเร็จ แต่ wage_summary ยังเป็น 0
**สาเหตุ:**
- table `wage_summary` ยังไม่ถูกสร้าง
- employees ไม่มี perhr_salary

**วิธีแก้:**
```sql
-- 1. Check table exists
SELECT * FROM wage_summary LIMIT 1;

-- 2. Check employee salary
SELECT employee_id, perhr_salary FROM employees WHERE perhr_salary IS NULL;

-- 3. Update missing salary
UPDATE employees SET perhr_salary = 70 WHERE perhr_salary IS NULL;
```

### ปัญหา: Import ช้ามาก
**สาเหตุ:**
- คำนวณค่าจ้างหลายเดือนพร้อมกัน
- employees จำนวนมาก

**วิธีแก้:**
- ปกติแล้วไม่เป็นปัญหา (< 30 วินาที)
- ถ้าช้าเกิน 1 นาที → เช็ค database performance

---

## 📊 ผลลัพธ์ที่คาดหวัง

### หลัง Import เสร็จ ผู้ใช้จะ:

✅ **เห็นข้อมูล OT** ในหน้าหลัก (/) ทันที  
✅ **เห็นยอดค่าจ้าง** ในหน้า /wages/[id] ทันที  
✅ **เห็นยอดสะสม 12 รายการ** (YTD + All-Time) ทันที  
✅ **พนักงานเปิด LIFF** เห็นข้อมูลทันที (ไม่ต้องรอ HR กดปุ่ม)

---

## 🔄 การอัพเดทข้อมูล

### เมื่อไหร่ที่ระบบคำนวณใหม่อัตโนมัติ:

| สถานการณ์ | OT | Wages | YTD | All-Time |
|-----------|:--:|:-----:|:---:|:--------:|
| Import scan file ใหม่ | ✅ | ✅ | ✅ | ✅ |
| Import scan ซ้ำ (re-import) | ✅ | ✅ | ✅ | ✅ |
| เพิ่ม/ลบ พนักงาน | ❌ | ❌ | ❌ | ❌ |
| แก้ไขเงินเดือน | ❌ | ❌ | ❌ | ❌ |
| เพิ่ม income/deduction manual | ❌ | ⚠️ | ⚠️ | ⚠️ |

**หมายเหตุ:**
- ⚠️ = ต้องกดปุ่ม "คำนวณค่าจ้าง" ในหน้า /wages ด้วยตนเอง
- ❌ = ต้อง re-import scan file เพื่อ trigger calculation

---

## 🚀 สรุป Benefits

### 1. **ความสะดวก** 😊
- ไม่ต้องกดปุ่มคำนวณค่าจ้างอีกต่อไป
- Import ครั้งเดียว → ข้อมูลครบทุกอย่าง

### 2. **ความแม่นยำ** 🎯
- คำนวณทันทีหลังได้ข้อมูล OT
- ไม่มีโอกาสลืมคำนวณ

### 3. **ประสบการณ์ผู้ใช้** ⚡
- พนักงานเปิด LIFF เห็นข้อมูลทันที
- HR ไม่ต้องทำขั้นตอนเพิ่ม

### 4. **Real-time Data** 📊
- YTD และ All-Time summary อัพเดทอัตโนมัติ
- รายงานความแม่นยำสูง

---

## 📝 Checklist การใช้งาน

เมื่อต้องการดูค่าจ้างประจำเดือน:

- [ ] Import ไฟล์ scan (หน้าหลัก /)
- [ ] รอ 10-30 วินาที (ระบบคำนวณอัตโนมัติ)
- [ ] ดูข้อความ "💰 Auto-calculated X wage records"
- [ ] เปิดหน้า /wages/[id] → เห็นยอดสะสม 12 รายการ
- [ ] พนักงานเปิด LIFF → เห็นข้อมูลเหมือนกัน
- [ ] ✅ เสร็จสิ้น!

---

**อัพเดท:** 20 พฤศจิกายน 2568  
**Feature:** Auto Wage Calculation  
**Status:** ✅ Production Ready

