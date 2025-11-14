# แก้ไข: การคำนวณ OT สำหรับการทำงานข้ามวัน

## ปัญหาเดิม

เมื่ออัพโหลดไฟล์ที่มีข้อมูลวันที่ 10-13 Nov 2025:
- ระบบคำนวณ OT โดย fetch scans จาก 9-14 Nov (±1 วัน)
- **ปัญหา:** พนักงานที่สแกนเข้างานวันที่ 9 Nov เวลา 20:00 และสแกนออกวันที่ 10 Nov เวลา 03:00
- ระบบจะไม่พบ check-in จากวันที่ 9 Nov เพราะอยู่นอกช่วง buffer
- ทำให้ในวันที่ 10 Nov จะมีแต่ check-out อย่างเดียว (orphan check-out)
- ระบบจะ skip การคำนวณ OT สำหรับรอบงานนี้

## สาเหตุ

การทำงาน **Shift 2 (20:00-05:00)** มักจะข้ามวัน:
- Check-in: วันที่ 9 Nov 20:00
- Check-out: วันที่ 10 Nov 03:00

เมื่อ buffer เดิม = ±1 วัน:
- ไฟล์: 10-13 Nov
- Fetch range: 9-14 Nov
- **ไม่พอ!** เพราะ check-in อยู่ที่ 9 Nov แต่เราต้องการเริ่ม fetch ตั้งแต่ 8 Nov

## การแก้ไข

### 1. เพิ่ม buffer สำหรับ fetch scans

เปลี่ยนจาก ±1 วัน เป็น **-2/+1 วัน**:

```typescript
// เดิม: ±1 วัน
minDateObj.setDate(minDateObj.getDate() - 1)
maxDateObj.setDate(maxDateObj.getDate() + 1)

// ใหม่: -2/+1 วัน
// -2 days: เพื่อดึง check-in จากวันก่อนหน้า (สำหรับการทำงานข้ามวัน)
// +1 day: เพื่อดึง check-out จากวันถัดไป
minDateObj.setDate(minDateObj.getDate() - 2)
maxDateObj.setDate(maxDateObj.getDate() + 1)
```

### 2. แยก fetch range กับ upsert range

**Fetch range** (สำหรับดึงข้อมูลมาคำนวณ):
- วัตถุประสงค์: ดึง scans มาให้ครบถ้วนเพื่อจับคู่ check-in/check-out
- ช่วงวันที่: **Original dates -2/+1 วัน**

**Upsert range** (สำหรับบันทึกลง database):
- วัตถุประสงค์: อัพเดทเฉพาะวันที่เราต้องการ recalculate จริง ๆ
- ช่วงวันที่: **Original dates ±1 วัน**

```typescript
// Fetch range: -2/+1 วัน (กว้างกว่า)
const minDateObj = new Date(scanDates[0])
const maxDateObj = new Date(scanDates[scanDates.length - 1])
minDateObj.setDate(minDateObj.getDate() - 2)  // -2 วัน
maxDateObj.setDate(maxDateObj.getDate() + 1)  // +1 วัน

// Fetch scans ในช่วงกว้าง
const { data: allEmployeeScans } = await supabase
  .from('attendance_scans')
  .gte('scan_date', empMinDate)  // 8 Nov
  .lte('scan_date', empMaxDate)  // 14 Nov

// Upsert range: ±1 วัน (แคบกว่า)
const targetMinDateObj = new Date(scanDates[0])
const targetMaxDateObj = new Date(scanDates[scanDates.length - 1])
targetMinDateObj.setDate(targetMinDateObj.getDate() - 1)  // -1 วัน
targetMaxDateObj.setDate(targetMaxDateObj.getDate() + 1)  // +1 วัน

// Filter เฉพาะ workSessions ที่อยู่ในช่วง upsert
workSessions.forEach(session => {
  if (session.workDate < targetMinDate || session.workDate > targetMaxDate) {
    return  // ข้าม
  }

  allAttendanceRecords.push({...})  // บันทึกเฉพาะวันที่ 9-14 Nov
})
```

## ตัวอย่างการทำงาน

### สถานการณ์: อัพโหลดไฟล์ 10-13 Nov 2025

**Input:**
- ไฟล์มีข้อมูล: 10-13 Nov
- พนักงาน A (Shift 2):
  - Check-in: 9 Nov 20:00
  - Check-out: 10 Nov 03:00
- พนักงาน B (Shift 2):
  - Check-in: 13 Nov 20:00
  - Check-out: 14 Nov 03:00

**ขั้นตอนที่ 1: Fetch scans**
```
Fetch range: 8 Nov - 14 Nov (-2/+1)
✓ ดึงได้ทั้ง check-in ของพนักงาน A (9 Nov) และ check-out (10 Nov)
✓ ดึงได้ทั้ง check-in ของพนักงาน B (13 Nov) และ check-out (14 Nov)
```

**ขั้นตอนที่ 2: คำนวณ OT**
```
พนักงาน A:
  - workDate: 2025-11-09 (ตามวันที่ check-in)
  - Check-in: 20:00, Check-out: 03:00 (next day)
  - OT hours: 7 hours

พนักงาน B:
  - workDate: 2025-11-13
  - Check-in: 20:00, Check-out: 03:00 (next day)
  - OT hours: 7 hours
```

**ขั้นตอนที่ 3: Upsert ลง daily_attendance**
```
Upsert range: 9 Nov - 14 Nov (±1)

พนักงาน A (workDate: 9 Nov):
  ✓ 9 Nov >= 9 Nov && 9 Nov <= 14 Nov
  ✓ Upsert ลง database

พนักงาน B (workDate: 13 Nov):
  ✓ 13 Nov >= 9 Nov && 13 Nov <= 14 Nov
  ✓ Upsert ลง database
```

### กรณีที่มีข้อมูลนอก upsert range

**สมมติว่ามี:**
- พนักงาน C: Check-in 7 Nov 08:00, Check-out 7 Nov 17:00

**ผลลัพธ์:**
```
Fetch: ✓ ดึงมาได้ (7 Nov อยู่ใน fetch range 8-14 Nov... จริงๆ ไม่ได้อยู่ แต่ถ้าเป็น 8 Nov)
Calculate: ✓ คำนวณได้ workDate = 8 Nov
Upsert: ✗ Skip เพราะ 8 Nov < 9 Nov (นอก upsert range)

Console log: "Skipping upsert for 2025-11-08 (outside target range)"
```

## ประโยชน์

### 1. จับคู่ scans ได้ครบถ้วน
- ดึงข้อมูลย้อนหลัง 2 วัน เพื่อให้แน่ใจว่าได้ check-in จากวันก่อนหน้า
- จับคู่ check-in/check-out ได้ถูกต้องแม้จะข้ามวัน

### 2. อัพเดทเฉพาะวันที่ต้องการ
- ไม่เขียนทับข้อมูลวันที่เราไม่ได้ต้องการ recalculate
- Upsert เฉพาะช่วงวันที่ upload ±1 วัน

### 3. ข้อมูลแม่นยำขึ้น
- ไม่มี orphan check-out ที่ขาด check-in
- คำนวณ OT ได้ถูกต้องสำหรับทุก shift

## ตารางสรุป

| ไฟล์อัพโหลด | Fetch Range | Upsert Range | วัตถุประสงค์ |
|------------|-------------|--------------|-------------|
| 10-13 Nov | 8-14 Nov (-2/+1) | 9-14 Nov (±1) | ดึงข้อมูลมาเยอะ แต่ save เฉพาะที่ต้องการ |
| 1-5 Dec | 29 Nov - 6 Dec | 30 Nov - 6 Dec | เดียวกัน |
| 20 Jan | 18-21 Jan | 19-21 Jan | แม้อัพโหลดวันเดียวก็ใช้ buffer เดิม |

## วิธีทดสอบ

### ขั้นตอนที่ 1: สร้างข้อมูลทดสอบ

```sql
-- เคลียร์ข้อมูลเก่า (ระวัง! จะลบข้อมูลทั้งหมด)
DELETE FROM attendance_scans WHERE scan_date >= '2025-11-08' AND scan_date <= '2025-11-14';
DELETE FROM daily_attendance WHERE work_date >= '2025-11-08' AND work_date <= '2025-11-14';

-- เพิ่มข้อมูลทดสอบ: พนักงาน 001 ทำงาน Shift 2 ข้ามวัน
INSERT INTO attendance_scans (machine_id, scan_date, scan_time, employee_id, scan_type) VALUES
('M01', '2025-11-09', '20:00:00', '001', 1),  -- Check-in 9 Nov
('M01', '2025-11-10', '03:00:00', '001', 2),  -- Check-out 10 Nov
('M01', '2025-11-13', '20:00:00', '001', 1),  -- Check-in 13 Nov
('M01', '2025-11-14', '03:00:00', '001', 2);  -- Check-out 14 Nov
```

### ขั้นตอนที่ 2: สร้างไฟล์ทดสอบ

สร้างไฟล์ `test-cross-day.txt`:
```
M02	2025-11-10	10:00:00	001	1
M02	2025-11-10	17:00:00	001	2
M02	2025-11-11	08:00:00	001	1
M02	2025-11-11	18:00:00	001	2
```

### ขั้นตอนที่ 3: อัพโหลดและตรวจสอบ

1. อัพโหลดไฟล์ `test-cross-day.txt` (วันที่ 10-11 Nov)
2. เช็ค console logs:
```
Calculating OT for date range: 2025-11-08 to 2025-11-12 (original: 2025-11-10 to 2025-11-11)
Will upsert attendance records for dates: 2025-11-09 to 2025-11-12
Fetched 4 total scans for calculation
```

3. ตรวจสอบ daily_attendance:
```sql
SELECT work_date, employee_id, check_in_time, check_out_time, ot_hours
FROM daily_attendance
WHERE employee_id = '001'
  AND work_date >= '2025-11-08'
  AND work_date <= '2025-11-14'
ORDER BY work_date;
```

คาดหวัง:
```
work_date   | check_in_time | check_out_time | ot_hours
2025-11-09  | 20:00:00      | 03:00:00       | 7.00    <- จับคู่ได้แม้ check-in อยู่นอกช่วง upload
2025-11-10  | 10:00:00      | 17:00:00       | 0.00
2025-11-11  | 08:00:00      | 18:00:00       | 1.50
```

### ขั้นตอนที่ 4: ตรวจสอบกรณี orphan check-out

ลองลบ check-in ของวันที่ 9 Nov ออก:
```sql
DELETE FROM attendance_scans
WHERE employee_id = '001' AND scan_date = '2025-11-09' AND scan_type = 1;
```

อัพโหลดไฟล์เดิมอีกครั้ง ควรเห็น:
```
Skipping incomplete scan for employee 001 on 2025-11-10 - check-out only
```

## สรุป

✅ **Fetch range: -2/+1 วัน** - ดึงข้อมูลมาเยอะพอสำหรับจับคู่
✅ **Upsert range: ±1 วัน** - อัพเดทเฉพาะที่ต้องการ
✅ **จับคู่ข้ามวันได้** - Shift 2 ที่ check-in วันก่อนหน้า
✅ **ไม่เขียนทับข้อมูลเก่า** - Skip workDate ที่อยู่นอก upsert range

การเปลี่ยนแปลงนี้ทำให้การคำนวณ OT แม่นยำและครบถ้วนยิ่งขึ้น โดยเฉพาะกับ Shift 2 ที่มักทำงานข้ามวัน
