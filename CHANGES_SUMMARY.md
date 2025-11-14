# สรุปการเปลี่ยนแปลงระบบ OT

## การแก้ไขที่เสร็จสมบูรณ์แล้ว ✅

### 1. แก้ bug: ไฟล์ duplicate ไม่คำนวณ OT
- **ไฟล์:** [app/api/import-scans/route.ts](app/api/import-scans/route.ts#L62-L138)
- **ปัญหา:** เมื่ออัพโหลดไฟล์ที่เป็น duplicate ทั้งหมด ระบบจะ return ทันทีโดยไม่คำนวณ OT
- **การแก้ไข:** แม้ว่าทุก scan จะเป็น duplicate ระบบจะยังคงคำนวณ OT สำหรับช่วงวันที่ในไฟล์ (±1 วัน)
- **ผลลัพธ์:**
  - กรณีมี scan ใหม่: `Successfully imported X scans. Y duplicates skipped.`
  - กรณี duplicate ทั้งหมด: `All X scans were duplicates. Recalculated OT for Y attendance records.`

### 2. เพิ่มคอลัมน์แสดงประเภท OT
- **ไฟล์ที่แก้ไข:**
  - [lib/supabase.ts](lib/supabase.ts) - เพิ่ม interface
  - [lib/otCalculator.ts](lib/otCalculator.ts) - คำนวณ OT แยกประเภท
  - [app/api/import-scans/route.ts](app/api/import-scans/route.ts) - บันทึก OT แยกประเภท
  - [app/api/attendance/route.ts](app/api/attendance/route.ts) - ส่ง OT แยกประเภทไปหน้า frontend
  - [app/page.tsx](app/page.tsx) - แสดง 3 คอลัมน์ใหม่ในตาราง

- **คอลัมน์ใหม่:**
  - **OT ปกติ (×1.5)** - ทำงานนอกเวลาในวันธรรมดา
  - **OT พิเศษ (×2)** - ทำงานในวันหยุด/อาทิตย์ ≤ 8 ชั่วโมง
  - **OT ขั้นสูง (×3)** - ทำงานในวันหยุด/อาทิตย์ > 8 ชั่วโมง

### 3. ปรับปรุงการคำนวณ OT
- **คำนวณเฉพาะช่วงวันที่อัพโหลด ±1 วัน** (ไม่คำนวณทั้งระบบ)
- **ข้าม scan ที่ไม่สมบูรณ์** (ไม่มีคู่ check-in/check-out) เป็นการลงโทษพนักงาน
- **ลบ scan ซ้ำภายใน 2 นาที** เพื่อป้องกัน duplicate ในไฟล์เดียวกัน

### 4. แก้ไขการจับคู่ scan ข้ามวัน ⭐ NEW
- **ไฟล์:** [app/api/import-scans/route.ts](app/api/import-scans/route.ts#L150-L215)
- **ปัญหา:** กรณีทำงาน Shift 2 ข้ามวัน (เช่น check-in 9 Nov 20:00, check-out 10 Nov 03:00) เมื่ออัพโหลดไฟล์วันที่ 10-13 Nov ระบบจะไม่พบ check-in จากวันที่ 9 Nov ทำให้ skip การคำนวณ OT
- **การแก้ไข:**
  - **Fetch range: -2/+1 วัน** - ดึงข้อมูลย้อนหลัง 2 วัน เพื่อให้แน่ใจว่าได้ check-in จากวันก่อนหน้า
  - **Upsert range: ±1 วัน** - บันทึกเฉพาะวันที่ต้องการ recalculate จริง ๆ
- **ตัวอย่าง:**
  - อัพโหลดไฟล์: 10-13 Nov
  - Fetch scans จาก: 8-14 Nov (-2/+1)
  - Upsert ลง daily_attendance: 9-14 Nov (±1)
  - ผลลัพธ์: จับคู่ check-in/check-out ข้ามวันได้ครบถ้วน ไม่มี orphan check-out
- **เอกสาร:** [CROSS_DAY_CALCULATION_FIX.md](CROSS_DAY_CALCULATION_FIX.md)

### 5. เพิ่มหน้าคู่มือและปุ่มนำทาง
- [app/guide/webapp/page.tsx](app/guide/webapp/page.tsx) - คู่มือใช้งาน Web App
- [app/guide/line/page.tsx](app/guide/line/page.tsx) - คู่มือใช้งานระบบ LINE
- [app/page.tsx](app/page.tsx) - เพิ่มปุ่มไปหน้าจัดการพนักงานและคู่มือ

## สิ่งที่คุณต้องทำต่อ 🔧

### ขั้นตอนที่ 1: เพิ่มคอลัมน์ใน Database (จำเป็น)

คุณต้องเพิ่ม 3 คอลัมน์ใหม่ใน table `daily_attendance`:

**วิธีที่ 1: ใช้ Supabase Dashboard**
1. เข้า [Supabase Dashboard](https://supabase.com/dashboard)
2. เลือกโปรเจกต์ของคุณ
3. ไปที่ **SQL Editor** → คลิก **New Query**
4. Copy SQL จากไฟล์ [add_ot_columns_migration.sql](add_ot_columns_migration.sql) และวาง
5. คลิก **Run**

**วิธีที่ 2: Copy-Paste SQL นี้ตรง ๆ**
```sql
ALTER TABLE daily_attendance
ADD COLUMN IF NOT EXISTS ot_normal_hours NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ot_special_hours NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ot_premium_hours NUMERIC(10, 2) DEFAULT 0;
```

### ขั้นตอนที่ 2: ทดสอบระบบ

1. **Refresh Development Server** (ถ้ายังไม่ได้ refresh จะ auto-reload อยู่แล้ว)
   ```bash
   # ถ้า dev server ยังไม่รันอยู่
   npm run dev
   ```

2. **อัพโหลดไฟล์ซ้ำเพื่อทดสอบ recalculation**
   - ไปที่หน้า Web App (http://localhost:3000)
   - อัพโหลดไฟล์ `/Users/piw/Downloads/ot_cal/text-4C97-9333-4E-0.txt` อีกครั้ง
   - ควรเห็นข้อความ: `All X scans were duplicates. Recalculated OT for Y attendance records.`

3. **ตรวจสอบข้อมูลใน Database**
   ```bash
   node check_data.js
   ```

   ผลลัพธ์ที่คาดหวัง:
   ```
   Checking daily_attendance
   Total attendance (24 Oct - 5 Nov): XXX
   By date:
     2025-10-24: 353
     2025-10-25: 265
     2025-10-26: XXX  <- ควรมีข้อมูล
     2025-10-27: XXX  <- ควรมีข้อมูล
     ...
     2025-11-04: XXX  <- ควรมีข้อมูล
   ```

4. **ตรวจสอบหน้า Web App**
   - ตรวจสอบว่ามีคอลัมน์ใหม่ 3 คอลัมน์แสดงอยู่: OT ปกติ, OT พิเศษ, OT ขั้นสูง
   - ตรวจสอบว่ามีข้อมูลแสดงในคอลัมน์เหล่านั้น (ไม่ใช่ 0 ทั้งหมด)

## เอกสารสำคัญ 📚

- [DUPLICATE_RECALCULATION_FIX.md](DUPLICATE_RECALCULATION_FIX.md) - อธิบายการแก้ bug duplicate
- [DATABASE_MIGRATION_GUIDE.md](DATABASE_MIGRATION_GUIDE.md) - คู่มือเพิ่มคอลัมน์ database
- [add_ot_columns_migration.sql](add_ot_columns_migration.sql) - SQL script สำหรับ migration
- [check_data.js](check_data.js) - Script ตรวจสอบข้อมูล

## หมายเหตุสำคัญ ⚠️

- ✅ Code เปลี่ยนแปลงทั้งหมดเสร็จแล้ว
- ⚠️ **ต้องเพิ่มคอลัมน์ใน database ก่อนใช้งาน** มิฉะนั้นจะ error
- ✅ ข้อมูลเก่าจะมีค่า 0 ในคอลัมน์ใหม่ (ไม่กระทบข้อมูลเดิม)
- ✅ ข้อมูลใหม่จะมีการแยกประเภท OT อัตโนมัติ
- ✅ Re-upload ไฟล์ได้เสมอเพื่อ recalculate OT

## คำถามที่พบบ่อย ❓

**Q: ต้อง restart server หรือไม่?**
A: ไม่ต้อง Next.js จะ hot-reload อัตโนมัติ

**Q: จะ recalculate ข้อมูลเก่าได้ไหม?**
A: ได้ แค่อัพโหลดไฟล์ scan ของช่วงวันที่ต้องการอีกครั้ง (แม้จะเป็น duplicate)

**Q: ถ้า upload duplicate จะเกิด duplicate ใน database ไหม?**
A: ไม่เกิด ระบบป้องกัน duplicate ใน `attendance_scans` อยู่แล้ว

**Q: ข้อมูลเดิมจะหายไหม?**
A: ไม่หาย แต่ข้อมูลเก่าจะมีค่า 0 ในคอลัมน์ใหม่ (ยกเว้นถ้า re-upload ไฟล์)
