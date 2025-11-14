# คู่มือแก้ไขปัญหาและคำนวณ OT ใหม่

## ปัญหาที่พบ

1. **Import สำเร็จแต่ไม่มีการคำนวณ OT**
   - มี scans ใน `attendance_scans` วันที่ 26 Oct - 4 Nov
   - แต่ไม่มีข้อมูลใน `daily_attendance`

2. **Duplicates 1822 แถว**
   - เกิดจากข้อมูลวันที่ 25/10 ซ้ำระหว่างไฟล์เก่าและไฟล์ใหม่
   - นี่เป็นเรื่องปกติ ระบบจะข้าม duplicates อัตโนมัติ

## สาเหตุ

- API import มี bug: เมื่อ upsert ล้มเหลวจะ log error แต่**ไม่ return error** ให้ผู้ใช้เห็น
- ทำให้ user เห็นว่า "Successfully imported" แต่จริงๆ ข้อมูลไม่ได้ถูกบันทึก

## การแก้ไข

✅ **แก้ไขแล้ว** - code ปรับให้ return error ออกมาเมื่อ upsert ล้มเหลว

## วิธีคำนวณ OT ใหม่

### วิธีที่ 1: อัพโหลดไฟล์ใหม่อีกครั้ง (แนะนำ)

1. รอ Next.js reload (ประมาณ 1-2 วินาที)
2. เปิดหน้า Web App (http://localhost:3000)
3. อัพโหลดไฟล์ `text-4C97-9333-4E-0.txt` อีกครั้ง
4. ครั้งนี้ถ้ามี error จะแสดงออกมาให้เห็น
5. ตรวจสอบข้อมูลใน `daily_attendance`

**ผลลัพธ์ที่คาดหวัง:**
```
✓ Successfully imported X scans. Y duplicates skipped.
```
โดยที่ทุก scan จะถูกข้ามเพราะเป็น duplicate หมด (เพราะ import ไปแล้วครั้งแรก)
แต่ระบบจะคำนวณ OT ใหม่อยู่ดี!

### วิธีที่ 2: สร้างไฟล์ทดสอบเล็กๆ

สร้างไฟล์ `test_scan.txt` ที่มีข้อมูล 1-2 วันเท่านั้น:
```
01	26-10-2025	08:00:00	'20056315		1
01	26-10-2025	17:00:00	'20056315		2
```

แล้วอัพโหลดไฟล์นี้

### วิธีที่ 3: Query Database โดยตรง (Advanced)

ใช้ Supabase SQL Editor:

```sql
-- ลบข้อมูล attendance ช่วง 26 Oct - 4 Nov
DELETE FROM daily_attendance
WHERE work_date >= '2025-10-26' AND work_date <= '2025-11-04';

-- ลบ scans ช่วงเดียวกัน
DELETE FROM attendance_scans
WHERE scan_date >= '2025-10-26' AND scan_date <= '2025-11-04';
```

จากนั้นอัพโหลดไฟล์ใหม่อีกครั้ง

### วิธีที่ 4: ใช้ Script คำนวณใหม่ทั้งหมด

สร้างไฟล์ `recalculate_all.js`:

```javascript
// TODO: สร้าง script นี้ถ้าต้องการ recalculate ทั้งระบบ
```

## การตรวจสอบว่าสำเร็จ

ใช้ script ตรวจสอบ:

```bash
node check_data.js
```

ควรเห็น:
```
Checking daily_attendance
Total attendance (24 Oct - 5 Nov): XXX
By date:
  2025-10-24: 353
  2025-10-25: 265
  2025-10-26: XXX  <- ต้องมีข้อมูล
  2025-10-27: XXX  <- ต้องมีข้อมูล
  ...
  2025-11-04: XXX  <- ต้องมีข้อมูล
```

## คำถามที่พบบ่อย

**Q: ทำไม duplicates ถึงเยอะมาก (1822 แถว)?**

A: เพราะไฟล์ที่ import มีข้อมูลวันที่ 25 Oct ซ้ำกับข้อมูลเก่า
- ระบบเก่ามีข้อมูล: 11-25 Oct
- ไฟล์ใหม่มีข้อมูล: 25 Oct - 4 Nov
- วันที่ 25 Oct ซ้ำกัน (มี 876 scans)
- บวกกับ scans อื่นๆ ที่อาจซ้ำ รวมเป็น 1822 duplicates

นี่**ไม่ใช่ปัญหา** - ระบบออกแบบมาให้ข้าม duplicates ได้

**Q: ข้อมูลใน attendance_scans ปลอดภัยไหม?**

A: ปลอดภัย! ข้อมูลถูก insert เข้า `attendance_scans` สำเร็จแล้ว
แค่ขั้นตอนการคำนวณ OT ที่มีปัญหา (และแก้ไขแล้ว)

**Q: ต้อง re-import ทุกไฟล์หรือไม่?**

A: ไม่ต้อง! แค่ re-import ไฟล์ที่มีปัญหา (25 Oct - 4 Nov) ก็พอ
