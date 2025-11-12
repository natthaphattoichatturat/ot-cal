# 🚀 ระบบพร้อม Deploy - Dual LINE OA Architecture

## ✅ สิ่งที่ทำเสร็จแล้ว

### 1. Database Schema Migration
- ✅ สร้างไฟล์ `database-migration-line-ids.sql`
- ✅ เพิ่มคอลัมม์ `line_id_hr` สำหรับ HR LINE OA
- ✅ เปลี่ยนชื่อ `line_id` เป็น `line_id_employ` สำหรับ Employee LINE OA
- ✅ สร้าง indexes สำหรับการค้นหาที่รวดเร็ว
- ✅ เพิ่ม comments อธิบายคอลัมม์

### 2. Registration System
- ✅ **Employee Registration**: ทำงานบน Employee LINE OA, บันทึก `line_id_employ`
- ✅ **HR Admin Registration**: เปลี่ยนเป็นทำงานบน HR LINE OA, บันทึก `line_id_hr`
  - เปลี่ยน LIFF ID: `2008409515-rgKMDQBb`
  - URL: `https://liff.line.me/2008409515-rgKMDQBb`
  - ต้องใช้รหัสผ่าน: `ecloude_tecHR2025!`

### 3. Code Updates (13 ไฟล์)
✅ **Core Infrastructure**
- `lib/hrPermission.ts` - ตรวจสิทธิ์ด้วย `line_id_hr`
- `lib/lineConfig.ts` - อัพเดท LIFF ID สำหรับ admin registration

✅ **Registration APIs**
- `app/api/line/register-employee/route.ts` - บันทึก `line_id_employ`
- `app/api/line/register-admin/route.ts` - บันทึก `line_id_hr`

✅ **Attendance & Leave**
- `app/api/line/attendance-checkin/route.ts` - ใช้ `line_id_employ`
- `app/api/line/submit-leave/route.ts` - ใช้ทั้งสอง ID
- `app/api/line/webhook/route.ts` - ส่งข้อความด้วย `line_id_employ`

✅ **Meeting & Communication**
- `app/api/line/schedule-meeting/route.ts` - ส่งนัดหมายด้วย `line_id_employ`

✅ **Employee Management**
- `app/api/employees/route.ts` - รองรับทั้งสอง ID
- `app/api/employees/import/route.ts` - import ทั้งสอง ID

✅ **LIFF Pages**
- `app/liff/admin-register/page.tsx` - ใช้ HR LINE OA LIFF ID
- `app/liff/employee-ot-viewer/page.tsx` - ค้นหาด้วย `line_id_employ`
- `app/liff/employee-meeting/page.tsx` - แสดง Employee LINE OA status

### 4. Build Status
✅ **npm run build** - สำเร็จไม่มี errors

---

## 📋 ขั้นตอน Deploy (ทำตามลำดับ)

### Step 1: Run Database Migration
```bash
# 1. เปิด Supabase Dashboard
# URL: https://supabase.com/dashboard/project/YOUR_PROJECT_ID

# 2. ไปที่ SQL Editor

# 3. Copy โค้ดจากไฟล์ database-migration-line-ids.sql และรัน

# 4. ตรวจสอบผลลัพธ์จาก verification queries
```

**ผลลัพธ์ที่ควรเห็น:**
```
column_name     | data_type | is_nullable
----------------|-----------|------------
line_id_employ  | text      | YES
line_id_hr      | text      | YES
```

### Step 2: Deploy Code to Vercel
```bash
# อยู่ใน directory: /Users/piw/Downloads/ot_cal

# 1. Commit changes
git add .
git commit -m "✅ Complete dual LINE OA architecture

- Add line_id_hr column for HR LINE OA
- Rename line_id to line_id_employ for Employee LINE OA
- Update admin registration to use HR LINE OA LIFF
- Update all APIs to use correct LINE ID columns
- Fix meeting scheduler to send to Employee LINE OA
- Update permission checks to use HR LINE OA ID"

# 2. Push to GitHub
git push origin main

# 3. Vercel จะ deploy automatically
# หรือ deploy ด้วยตัวเอง:
vercel --prod
```

### Step 3: ตั้งค่า LINE Developer Console

#### 3.1 ตรวจสอบ Employee LINE OA (Channel ID: 2008436527)
1. เปิด https://developers.line.biz/console/
2. เลือก Employee LINE OA
3. Webhook URL: `https://ot-cal-sdht.vercel.app/api/line/webhook`
4. ตรวจสอบ LIFF Apps:
   - Employee Registration: `2008436560-GMZNa4OA` → `/liff/employee-register`
   - Leave Request: `2008436560-J06MeXN4` → `/liff/leave-request`
   - Attendance Check-in: `2008436560-DQqw6EPV` → `/liff/attendance-checkin`

#### 3.2 ตั้งค่า HR LINE OA (Channel ID: 2008409511)
1. เปิด https://developers.line.biz/console/
2. เลือก HR LINE OA
3. Webhook URL: `https://ot-cal-sdht.vercel.app/api/line/hr-webhook`
4. ตรวจสอบ LIFF Apps:
   - **Admin Registration: `2008409515-rgKMDQBb` → `/liff/admin-register`** ✅ สำคัญ!
   - HR Dashboard: `2008409515-XnPV2b48` → `/liff/hr-dashboard`
   - Employee Meeting: `2008409515-V336WkL9` → `/liff/employee-meeting`
   - AI Chatbot: `2008409515-JPzQG38r` → `/liff/ai-chatbot`

---

## 🧪 Testing Checklist

### Phase 1: Database Migration
- [ ] เข้า Supabase SQL Editor
- [ ] รัน migration script
- [ ] ตรวจสอบว่าคอลัมม์ `line_id_employ` และ `line_id_hr` ถูกสร้างแล้ว
- [ ] ตรวจสอบ indexes ถูกสร้างแล้ว

### Phase 2: Registration Testing
- [ ] **Test Employee Registration**
  1. เปิด Employee LINE OA
  2. ไปที่ `https://liff.line.me/2008436560-GMZNa4OA`
  3. กรอกข้อมูลและลงทะเบียน
  4. ตรวจสอบใน database: `line_id_employ` ต้องมีค่า

- [ ] **Test HR Registration**
  1. เปิด HR LINE OA
  2. ไปที่ `https://liff.line.me/2008409515-rgKMDQBb` ✅
  3. กรอกรหัสผ่าน: `ecloude_tecHR2025!`
  4. กรอกข้อมูลและลงทะเบียน (ต้องเป็น admin_etec)
  5. ตรวจสอบใน database: `line_id_hr` ต้องมีค่า

### Phase 3: Feature Testing
- [ ] **Leave Request System**
  1. พนักงานขอลาผ่าน Employee LINE OA
  2. HR admin ต้องได้รับแจ้งเตือนใน HR LINE OA
  3. HR กดอนุมัติ/ปฏิเสธ
  4. พนักงานต้องได้รับผลใน Employee LINE OA

- [ ] **Meeting Scheduler**
  1. HR login ผ่าน HR LINE OA
  2. เปิด Employee Meeting LIFF
  3. เลือกพนักงานและตั้งเวลานัด
  4. พนักงานต้องได้รับนัดหมายใน Employee LINE OA

- [ ] **Attendance Check-in**
  1. พนักงาน login ผ่าน Employee LINE OA
  2. เปิด Check-in LIFF
  3. กด Check-in/Check-out
  4. ต้องได้รับข้อความยืนยันใน Employee LINE OA

- [ ] **HR Dashboard**
  1. HR login ผ่าน HR LINE OA (สำคัญ!)
  2. เปิด HR Dashboard
  3. ต้องเข้าถึงได้ (ถ้าเป็น admin_etec)
  4. ถ้าไม่ใช่ admin_etec ต้องเห็น error

- [ ] **AI Chatbot**
  1. HR admin ส่งข้อความไปที่ HR LINE OA
  2. ระบบ chatbot ต้องตอบกลับได้
  3. ทดสอบ query ต่างๆ (database query, system usage)

### Phase 4: Permission Testing
- [ ] ทดสอบ admin_etec เข้า HR features ได้
- [ ] ทดสอบพนักงานทั่วไปเข้า HR features ไม่ได้
- [ ] ทดสอบ HR login ผ่าน Employee LINE OA แล้วเข้า HR features ไม่ได้

---

## 📊 ตรวจสอบข้อมูลใน Database

### Query สำหรับตรวจสอบหลัง Deploy
```sql
-- 1. ตรวจสอบ schema
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'employees'
    AND column_name IN ('line_id_employ', 'line_id_hr')
ORDER BY column_name;

-- 2. ดูพนักงานที่ลงทะเบียนแล้ว
SELECT
    employee_id,
    name,
    department,
    CASE
        WHEN line_id_employ IS NOT NULL THEN '✅ Employee LINE'
        ELSE '❌ ยังไม่ได้ลงทะเบียน'
    END as employee_line_status,
    CASE
        WHEN line_id_hr IS NOT NULL THEN '✅ HR LINE'
        ELSE '❌ ยังไม่ได้ลงทะเบียน'
    END as hr_line_status,
    status
FROM employees
WHERE status = 'active'
ORDER BY employee_id;

-- 3. สรุปสถิติการลงทะเบียน
SELECT
    COUNT(*) as total_active_employees,
    COUNT(line_id_employ) as registered_employee_line,
    COUNT(line_id_hr) as registered_hr_line,
    COUNT(CASE WHEN line_id_employ IS NOT NULL AND line_id_hr IS NOT NULL THEN 1 END) as registered_both
FROM employees
WHERE status = 'active';

-- 4. ดู HR admins
SELECT
    employee_id,
    name,
    department,
    line_id_hr,
    status
FROM employees
WHERE department = 'admin_etec'
    AND status = 'active';
```

---

## 🔐 รหัสผ่าน & Credentials

### Admin Registration Password
```
ecloude_tecHR2025!
```

### LINE OA Channels
```
Employee LINE OA
Channel ID: 2008436527
Channel Secret: 8c524fd6d33e4c964fac2e5bee10ac4f

HR LINE OA
Channel ID: 2008409511
Channel Secret: 99b6f4656a2037e14c8975b5fb61916b
```

---

## 🎯 Key URLs

### Employee LINE OA
```
Registration: https://liff.line.me/2008436560-GMZNa4OA
Leave Request: https://liff.line.me/2008436560-J06MeXN4
Check-in: https://liff.line.me/2008436560-DQqw6EPV
OT Viewer: https://liff.line.me/2008436560-WZqNLp6Z
```

### HR LINE OA
```
Admin Registration: https://liff.line.me/2008409515-rgKMDQBb ✅ ใหม่!
HR Dashboard: https://liff.line.me/2008409515-XnPV2b48
Meeting Scheduler: https://liff.line.me/2008409515-V336WkL9
AI Chatbot: https://liff.line.me/2008409515-JPzQG38r
```

### Webhooks
```
Employee Webhook: https://ot-cal-sdht.vercel.app/api/line/webhook
HR Webhook: https://ot-cal-sdht.vercel.app/api/line/hr-webhook
```

---

## ⚠️ Important Notes

### 1. User Registration Flow
- พนักงานทุกคนต้องลงทะเบียนผ่าน Employee LINE OA ก่อน
- เฉพาะ HR (admin_etec) ต้องลงทะเบียนเพิ่มผ่าน HR LINE OA
- User คนเดียวกันจะมี LINE ID ต่างกันในแต่ละ LINE OA

### 2. Permission System
- HR features ทั้งหมดต้อง login ผ่าน HR LINE OA
- ถ้า login ผ่าน Employee LINE OA จะไม่สามารถเข้า HR features ได้
- เฉพาะแผนก admin_etec เท่านั้นที่เข้า HR features ได้

### 3. Messaging
- ข้อความไปหาพนักงาน → ส่งไปที่ `line_id_employ` → Employee LINE OA
- ข้อความไปหา HR → ส่งไปที่ `line_id_hr` → HR LINE OA
- ห้ามส่งข้อความไปยัง LINE ID ที่ไม่ตรงกับ LINE OA

---

## 🆘 Troubleshooting

### ปัญหา: "ไม่พบข้อมูลพนักงาน"
**สาเหตุ:** ยังไม่ได้ลงทะเบียน LINE OA ที่ถูกต้อง
**วิธีแก้:** ลงทะเบียนผ่าน LIFF registration ของ LINE OA นั้นๆ

### ปัญหา: "คุณไม่มีสิทธิ์เข้าถึงระบบ HR"
**สาเหตุ:** อาจเป็น 1 ใน 3 ข้อ
1. ไม่ได้ลงทะเบียนผ่าน HR LINE OA (`line_id_hr` เป็น NULL)
2. Login ผ่าน Employee LINE OA (LINE ID ไม่ตรง)
3. ไม่ใช่แผนก admin_etec

**วิธีแก้:**
- ตรวจสอบว่าลงทะเบียนผ่าน HR LINE OA แล้ว
- ต้องเปิด LIFF ผ่าน HR LINE OA เท่านั้น
- ตรวจสอบ department ใน database

### ปัญหา: "พนักงานไม่ได้รับข้อความนัดหมาย"
**สาเหตุ:** `line_id_employ` เป็น NULL
**วิธีแก้:** พนักงานต้องลงทะเบียนผ่าน Employee LINE OA ก่อน

---

## ✅ Deployment Checklist

- [ ] Run database migration
- [ ] Deploy code to Vercel
- [ ] Verify all LIFF URLs in LINE Developer Console
- [ ] Test employee registration (Employee LINE OA)
- [ ] Test HR registration (HR LINE OA) ✅ สำคัญที่สุด!
- [ ] Test leave request flow
- [ ] Test meeting scheduler
- [ ] Test HR permission checks
- [ ] Test AI chatbot
- [ ] Update documentation (if needed)
- [ ] Notify users about new registration URLs

---

## 📝 Files Changed

```
Modified (15 files):
├── lib/hrPermission.ts
├── lib/lineConfig.ts
├── app/api/line/register-employee/route.ts
├── app/api/line/register-admin/route.ts
├── app/api/line/attendance-checkin/route.ts
├── app/api/line/submit-leave/route.ts
├── app/api/line/schedule-meeting/route.ts
├── app/api/line/webhook/route.ts
├── app/api/employees/route.ts
├── app/api/employees/import/route.ts
├── app/liff/admin-register/page.tsx ✅ สำคัญ!
├── app/liff/employee-ot-viewer/page.tsx
└── app/liff/employee-meeting/page.tsx

Created (3 files):
├── database-migration-line-ids.sql
├── SYSTEM_VERIFICATION.md
└── DEPLOYMENT_READY.md (this file)
```

---

## 🎉 Ready to Deploy!

ระบบพร้อม deploy แล้ว! ทำตาม Deployment Checklist และทดสอบทุกฟีเจอร์ตาม Testing Checklist
