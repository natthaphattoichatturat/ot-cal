# คู่มือระบบ Check-in/Check-out ผ่าน LINE LIFF

## ภาพรวมระบบ

ระบบ Check-in/Check-out อัตโนมัติผ่าน LINE Rich Menu ที่พนักงานสามารถกดปุ่มเดียวเพื่อบันทึกเวลาเข้า-ออกงาน

## การตั้งค่า LIFF

### ข้อมูล LIFF
- **LIFF ID**: `2008436560-DQqw6EPV`
- **LIFF URL**: `https://liff.line.me/2008436560-DQqw6EPV`
- **Endpoint URL**: `https://ot-cal-sdht.vercel.app/liff/attendance-checkin`

### ขั้นตอนการตั้งค่าใน LINE Developers Console

1. เข้า [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก Provider และ Channel ของคุณ
3. ไปที่แท็บ "LIFF"
4. เลือก LIFF ID `2008436560-DQqw6EPV`
5. ตั้งค่า Endpoint URL เป็น: `https://ot-cal-sdht.vercel.app/liff/attendance-checkin`
6. ตั้งค่า LIFF App:
   - **LIFF app name**: Check-in/Check-out
   - **Size**: Full
   - **Endpoint URL**: `https://ot-cal-sdht.vercel.app/liff/attendance-checkin`
   - **Scopes**: `profile`, `openid`
   - **Bot link feature**: On (Optional)
7. บันทึกการตั้งค่า

### ตั้งค่า Rich Menu

ใน LINE Official Account Manager:

1. ไปที่ Rich Menu
2. สร้าง Rich Menu ใหม่หรือแก้ไขที่มีอยู่
3. เพิ่มปุ่ม "เข้างาน/ออกงาน" หรือ "Check-in/out"
4. ตั้งค่า Action เป็น "Link"
5. ใส่ URL: `https://liff.line.me/2008436560-DQqw6EPV`

## โครงสร้างฐานข้อมูล

### ตาราง `attendance_checkin`

```sql
CREATE TABLE attendance_checkin (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    work_date DATE NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    shift INTEGER, -- 1 = 08:00-17:00, 2 = 20:00-05:00
    gps_location_in TEXT,
    gps_location_out TEXT,
    is_checked_in BOOLEAN DEFAULT FALSE,
    is_checked_out BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_checkin_employee FOREIGN KEY (employee_id)
        REFERENCES employees(employee_id),
    UNIQUE(employee_id, work_date)
);
```

### การรัน SQL

รัน SQL script ที่ไฟล์ `database-checkin-updates.sql` ใน Supabase SQL Editor:

```bash
# ไฟล์: database-checkin-updates.sql
```

## กฎการทำงาน

### การกำหนดกะการทำงาน (Auto Shift Detection)

#### กะที่ 1 (08:00-17:00)
- **เวลา Check-in**: 05:00-08:00 หรือ 12:00-13:00
- **ตัวอย่าง**: พนักงานกดปุ่มเวลา 07:30 → ระบบจะบันทึกเป็นกะเช้า

#### กะที่ 2 (20:00-05:00)
- **เวลา Check-in**: 17:30-20:00
- **ตัวอย่าง**: พนักงานกดปุ่มเวลา 19:45 → ระบบจะบันทึกเป็นกะดึก

### Flow การทำงาน

```
1. พนักงานกดปุ่มบน Rich Menu
   ↓
2. LIFF เปิดและดึง LINE User ID
   ↓
3. ขอ GPS Location (ถ้าได้รับอนุญาต)
   ↓
4. ตรวจสอบว่ามีการ Check-in วันนี้หรือไม่
   ↓
   ├─ ไม่มี → บันทึก Check-in + กำหนดกะอัตโนมัติ
   │           └─ ส่ง LINE Message ยืนยัน
   │
   └─ มีแล้ว → ตรวจสอบว่า Check-out หรือยัง
               ├─ ยัง → บันทึก Check-out + คำนวณชั่วโมงทำงาน
               │        └─ ส่ง LINE Message ยืนยัน
               │
               └─ แล้ว → แสดงข้อความว่าเสร็จสิ้นแล้ว
```

## ตัวอย่างข้อความที่ส่งกลับ

### Check-in สำเร็จ
```
✅ บันทึก Check-in สำเร็จ

ชื่อ: สมชาย ใจดี
รหัสพนักงาน: EMP001
วันที่: 9 พ.ย. 2568
เวลา Check-in: 07:30
กะการทำงาน: กะเช้า (08:00-17:00)
```

### Check-out สำเร็จ
```
✅ บันทึก Check-out สำเร็จ

ชื่อ: สมชาย ใจดี
รหัสพนักงาน: EMP001
วันที่: 9 พ.ย. 2568
เวลา Check-out: 17:15
กะการทำงาน: กะเช้า (08:00-17:00)
ระยะเวลาทำงาน: 9 ชั่วโมง 45 นาที
```

### Check-out ซ้ำ
```
คุณได้ Check-out เรียบร้อยแล้ววันนี้
กรุณารอถึงวันพรุ่งนี้สำหรับการ Check-in ครั้งถัดไป
```

## API Endpoints

### POST `/api/line/attendance-checkin`

**Request Body:**
```json
{
  "lineUserId": "U1234567890abcdef",
  "gpsLocation": "13.7563,100.5018"
}
```

**Response (Check-in):**
```json
{
  "success": true,
  "message": "✅ บันทึก Check-in สำเร็จ...",
  "data": {
    "id": 1,
    "employee_id": "EMP001",
    "work_date": "2024-11-09",
    "check_in_time": "2024-11-09T00:30:00.000Z",
    "shift": 1
  },
  "action": "check-in"
}
```

**Response (Check-out):**
```json
{
  "success": true,
  "message": "✅ บันทึก Check-out สำเร็จ...",
  "data": {
    "id": 1,
    "check_out_time": "2024-11-09T10:15:00.000Z"
  },
  "action": "check-out"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "ไม่พบข้อมูลพนักงาน กรุณาลงทะเบียนก่อนใช้งาน"
}
```

## การ Query ข้อมูลใน Supabase

### ดูข้อมูล Check-in/out ทั้งหมดของวันนี้
```sql
SELECT
  ac.*,
  e.name,
  e.department
FROM attendance_checkin ac
JOIN employees e ON ac.employee_id = e.employee_id
WHERE ac.work_date = CURRENT_DATE
ORDER BY ac.check_in_time DESC;
```

### ดูพนักงานที่ยัง Check-in แต่ไม่ Check-out
```sql
SELECT
  ac.*,
  e.name,
  e.department
FROM attendance_checkin ac
JOIN employees e ON ac.employee_id = e.employee_id
WHERE ac.work_date = CURRENT_DATE
  AND ac.is_checked_in = true
  AND ac.is_checked_out = false;
```

### สรุปชั่วโมงการทำงานรายวัน
```sql
SELECT
  employee_id,
  employee_name,
  work_date,
  check_in_time,
  check_out_time,
  CASE shift
    WHEN 1 THEN 'กะเช้า (08:00-17:00)'
    WHEN 2 THEN 'กะดึก (20:00-05:00)'
  END as shift_name,
  EXTRACT(EPOCH FROM (check_out_time - check_in_time))/3600 as work_hours
FROM attendance_checkin
WHERE work_date >= CURRENT_DATE - INTERVAL '7 days'
  AND is_checked_out = true
ORDER BY work_date DESC, employee_id;
```

### ดูข้อมูล GPS
```sql
SELECT
  employee_id,
  employee_name,
  work_date,
  gps_location_in,
  gps_location_out
FROM attendance_checkin
WHERE gps_location_in IS NOT NULL
  OR gps_location_out IS NOT NULL
ORDER BY work_date DESC;
```

## การทดสอบ

### 1. ทดสอบผ่าน LINE App
1. เปิด LINE App
2. เปิด Chat กับ Official Account
3. กด Rich Menu → เลือกปุ่ม Check-in/out
4. ตรวจสอบว่า LIFF เปิดขึ้นมา
5. ตรวจสอบข้อความที่ได้รับกลับ
6. ตรวจสอบข้อมูลใน Database

### 2. ทดสอบ Shift Detection
- **Test Case 1**: กดเวลา 07:00 → ต้องได้กะที่ 1
- **Test Case 2**: กดเวลา 12:30 → ต้องได้กะที่ 1
- **Test Case 3**: กดเวลา 19:00 → ต้องได้กะที่ 2

### 3. ทดสอบ Check-out
- กด Check-in ครั้งแรก
- รอสักครู่
- กดอีกครั้ง → ต้องเป็น Check-out
- ตรวจสอบว่าคำนวณชั่วโมงทำงานถูกต้อง

### 4. ทดสอบ GPS
- อนุญาตให้เข้าถึง Location
- ตรวจสอบว่าข้อมูล GPS บันทึกใน Database

## Troubleshooting

### ปัญหา: LIFF ไม่เปิด
- ตรวจสอบว่า Endpoint URL ถูกต้อง
- ตรวจสอบว่า LIFF ID ถูกต้อง
- ตรวจสอบว่า Domain ใน Vercel ทำงานปกติ

### ปัญหา: ไม่พบข้อมูลพนักงาน
- ตรวจสอบว่าพนักงานได้ลงทะเบียน LINE ID แล้ว
- ตรวจสอบค่า `line_id` ใน table `employees`

### ปัญหา: GPS ไม่ทำงาน
- GPS เป็น Optional, ระบบจะทำงานได้แม้ไม่มี GPS
- ผู้ใช้ต้องอนุญาตให้เข้าถึง Location บน Browser

### ปัญหา: เวลาไม่ตรง
- ระบบใช้ Thailand timezone (UTC+7)
- ตรวจสอบการคำนวณเวลาในโค้ด

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Files Created

1. `/database-checkin-updates.sql` - Database schema
2. `/lib/lineConfig.ts` - Updated with new LIFF ID
3. `/app/liff/attendance-checkin/page.tsx` - LIFF frontend
4. `/app/api/line/attendance-checkin/route.ts` - API endpoint

## Next Steps

1. รัน SQL script ใน Supabase
2. Deploy โค้ดไปยัง Vercel
3. ตั้งค่า LIFF Endpoint URL ใน LINE Developers Console
4. ตั้งค่า Rich Menu ใน LINE OA Manager
5. ทดสอบระบบ

---

**หมายเหตุ**: หลังจาก Deploy แล้ว อย่าลืมตั้งค่า Endpoint URL ใน LIFF Console ให้เป็น:
```
https://ot-cal-sdht.vercel.app/liff/attendance-checkin
```
