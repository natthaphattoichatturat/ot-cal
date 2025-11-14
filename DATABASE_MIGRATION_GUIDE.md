# คู่มือการเพิ่มคอลัมน์ใน Database

## ภาพรวม
คุณต้องเพิ่ม 3 คอลัมน์ใหม่ใน table `daily_attendance` เพื่อเก็บข้อมูล OT แยกตามประเภท

## คอลัมน์ที่ต้องเพิ่ม

| ชื่อคอลัมน์ | ประเภทข้อมูล | Default | คำอธิบาย |
|------------|-------------|---------|----------|
| `ot_normal_hours` | NUMERIC(10, 2) | 0 | จำนวนชั่วโมง OT ปกติ (วันธรรมดา × 1.5) |
| `ot_special_hours` | NUMERIC(10, 2) | 0 | จำนวนชั่วโมง OT พิเศษ (วันหยุด 8 ชม.แรก × 2) |
| `ot_premium_hours` | NUMERIC(10, 2) | 0 | จำนวนชั่วโมง OT ขั้นสูง (วันหยุด เกิน 8 ชม. × 3) |

## วิธีการเพิ่มคอลัมน์

### ตัวเลือกที่ 1: ใช้ Supabase Dashboard (แนะนำ)

1. เข้า [Supabase Dashboard](https://supabase.com/dashboard)
2. เลือกโปรเจกต์ของคุณ
3. ไปที่ **Table Editor** → เลือกตาราง `daily_attendance`
4. คลิกปุ่ม **"+"** หรือ **"Add Column"**
5. เพิ่มคอลัมน์ทีละคอลัมน์:

   **คอลัมน์ที่ 1:**
   - Name: `ot_normal_hours`
   - Type: `numeric`
   - Default value: `0`
   - Allow nullable: ไม่ติ๊ก (NOT NULL)

   **คอลัมน์ที่ 2:**
   - Name: `ot_special_hours`
   - Type: `numeric`
   - Default value: `0`
   - Allow nullable: ไม่ติ๊ก (NOT NULL)

   **คอลัมน์ที่ 3:**
   - Name: `ot_premium_hours`
   - Type: `numeric`
   - Default value: `0`
   - Allow nullable: ไม่ติ๊ก (NOT NULL)

6. คลิก **"Save"** หลังจากเพิ่มแต่ละคอลัมน์

### ตัวเลือกที่ 2: ใช้ SQL Editor

1. เข้า [Supabase Dashboard](https://supabase.com/dashboard)
2. ไปที่ **SQL Editor**
3. คลิก **"New Query"**
4. Copy SQL จากไฟล์ `add_ot_columns_migration.sql` แล้ววางในหน้าต่าง
5. คลิก **"Run"**

**SQL Script:**
```sql
ALTER TABLE daily_attendance
ADD COLUMN IF NOT EXISTS ot_normal_hours NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ot_special_hours NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ot_premium_hours NUMERIC(10, 2) DEFAULT 0;
```

### ตัวเลือกที่ 3: ใช้ psql CLI (สำหรับ Advanced User)

```bash
psql -h <your-supabase-db-host> -U postgres -d postgres
```

แล้วรัน SQL เดียวกับตัวเลือกที่ 2

## การตรวจสอบว่าเพิ่มสำเร็จ

1. ไปที่ **Table Editor** → `daily_attendance`
2. ตรวจสอบว่ามีคอลัมน์ใหม่ 3 คอลัมน์ปรากฏในตาราง
3. ลอง INSERT ข้อมูลทดสอบ (หรือรอให้ระบบคำนวณ OT ครั้งถัดไป)

## หลังจากเพิ่มคอลัมน์แล้ว

### ข้อมูลเก่าจะเป็นอย่างไร?
- ข้อมูลเก่าที่มีอยู่แล้วจะมีค่า `0` ในคอลัมน์ใหม่ทั้ง 3 (ตาม default value)
- ยังคงมีค่า `ot_hours` เดิมอยู่ (ไม่เสียหาย)

### จะ Recalculate ข้อมูลเก่าได้ไหม?
**วิธีที่ 1: อัพโหลดไฟล์ scan ใหม่**
- อัพโหลดไฟล์ scan ของวันที่ต้องการคำนวณใหม่
- ระบบจะคำนวณและ update ข้อมูลให้อัตโนมัติ (เพราะมี UPSERT)

**วิธีที่ 2: ทิ้งข้อมูลเก่า (ไม่แนะนำ)**
- ลบข้อมูลในตาราง `daily_attendance` ช่วงวันที่ต้องการ
- อัพโหลดไฟล์ scan ใหม่

**วิธีที่ 3: ยอมรับว่าข้อมูลเก่าไม่มีรายละเอียด**
- ข้อมูลเก่าจะแสดง 0 ในคอลัมน์ใหม่
- ข้อมูลใหม่จากนี้ไปจะมีรายละเอียดครบ

## การทดสอบ

1. อัพโหลดไฟล์ scan ทดสอบ (1-2 วัน)
2. ตรวจสอบในตาราง `daily_attendance` ว่ามีค่าในคอลัมน์ใหม่หรือไม่
3. ดูหน้า Web App (/) ว่าแสดงคอลัมน์ใหม่ถูกต้องหรือไม่

## หมายเหตุสำคัญ

- ✅ คอลัมน์เหล่านี้จะถูกคำนวณและบันทึกอัตโนมัติจากการอัพโหลดไฟล์ scan
- ✅ ไม่ต้องกรอกข้อมูลด้วยตนเอง
- ✅ การคำนวณใช้ logic ที่ปรับปรุงแล้วใน `otCalculator.ts`
- ⚠️ หากไม่เพิ่มคอลัมน์ในฐานข้อมูล ระบบจะ error เมื่ออัพโหลดไฟล์ scan

## คำถามที่พบบ่อย

**Q: ต้อง restart server หรือไม่?**
A: ไม่ต้อง การเพิ่มคอลัมน์ใน database ไม่ต้อง restart

**Q: จะเกิด downtime ไหม?**
A: ไม่มี การเพิ่มคอลัมน์ด้วย `ALTER TABLE` ทำงานได้ทันทีและไม่กระทบระบบที่กำลังทำงาน

**Q: ข้อมูลเดิมจะเสียหายไหม?**
A: ไม่เสีย จะเพิ่มเฉพาะคอลัมน์ใหม่เท่านั้น คอลัมน์เดิมและข้อมูลยังคงอยู่ครบถ้วน
