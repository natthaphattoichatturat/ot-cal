# การตรวจสอบระบบ LINE OA แบบ Dual Architecture

## ✅ สรุปการตรวจสอบระบบ

### 1. Database Schema - LINE ID Columns
**สถานะ: ✅ เสร็จสมบูรณ์**

```sql
-- ไฟล์: database-migration-line-ids.sql
-- เพิ่มคอลัมม์ line_id_hr และเปลี่ยน line_id เป็น line_id_employ
ALTER TABLE employees ADD COLUMN IF NOT EXISTS line_id_hr TEXT;
ALTER TABLE employees RENAME COLUMN line_id TO line_id_employ;

-- สร้าง indexes
CREATE INDEX IF NOT EXISTS idx_employees_line_id_employ ON employees(line_id_employ);
CREATE INDEX IF NOT EXISTS idx_employees_line_id_hr ON employees(line_id_hr);
```

**การใช้งาน:**
- `line_id_employ` - เก็บ LINE User ID จาก Employee LINE OA (Channel ID: 2008436527)
- `line_id_hr` - เก็บ LINE User ID จาก HR LINE OA (Channel ID: 2008409511)

---

### 2. หน้าลงทะเบียน (Registration Pages)

#### 2.1 หน้าลงทะเบียนพนักงาน (Employee Registration)
**สถานะ: ✅ ถูกต้อง**

- **URL:** `https://ot-cal-sdht.vercel.app/liff/employee-register`
- **LIFF ID:** `2008436560-GMZNa4OA`
- **LINE OA:** Employee LINE OA (Channel ID: 2008436527)
- **บันทึกไปที่:** คอลัมม์ `line_id_employ`
- **API:** `/api/line/register-employee`

#### 2.2 หน้าลงทะเบียน HR Admin (Admin Registration)
**สถานะ: ✅ แก้ไขเสร็จสมบูรณ์**

- **URL:** `https://ot-cal-sdht.vercel.app/liff/admin-register`
- **LIFF ID:** `2008409515-rgKMDQBb` ✅ (อัพเดทแล้ว)
- **LIFF URL:** `https://liff.line.me/2008409515-rgKMDQBb`
- **LINE OA:** HR LINE OA (Channel ID: 2008409511) ✅
- **บันทึกไปที่:** คอลัมม์ `line_id_hr`
- **API:** `/api/line/register-admin`
- **ต้องใช้รหัสผ่าน:** `ecloude_tecHR2025!`
- **เฉพาะแผนก:** `admin_etec`

**การเปลี่ยนแปลง:**
- ✅ เปลี่ยนจาก LIFF ID เก่า `2008436560-lygzv9WO` (Employee LINE OA)
- ✅ เป็น LIFF ID ใหม่ `2008409515-rgKMDQBb` (HR LINE OA)
- ✅ ใช้ `@line/liff` package แทน manual script loading
- ✅ ใช้ `LINE_CONFIG.liff.adminRegistration` จาก config file

---

### 3. ระบบการใช้งาน LINE ID ที่ถูกต้อง

#### 3.1 ระบบที่ใช้ Employee LINE OA (`line_id_employ`)
**สถานะ: ✅ ถูกต้องทั้งหมด**

| ระบบ | ไฟล์ | การใช้งาน |
|------|------|-----------|
| Check-in/out | `app/api/line/attendance-checkin/route.ts` | ✅ ค้นหาพนักงานด้วย `line_id_employ` |
| รับข้อความนัดหมาย | `app/api/line/schedule-meeting/route.ts` | ✅ ส่งไปที่ `line_id_employ` |
| รับอนุมัติ/ปฏิเสธการลา | `app/api/line/webhook/route.ts` | ✅ ส่งไปที่ `line_id_employ` |
| ดู OT ของตัวเอง | `app/liff/employee-ot-viewer/page.tsx` | ✅ ค้นหาด้วย `line_id_employ` |
| Employee Webhook | `app/api/line/webhook/route.ts` | ✅ ใช้ Employee LINE OA token |

#### 3.2 ระบบที่ใช้ HR LINE OA (`line_id_hr`)
**สถานะ: ✅ ถูกต้องทั้งหมด**

| ระบบ | ไฟล์ | การใช้งาน |
|------|------|-----------|
| ตรวจสอบสิทธิ์ HR | `lib/hrPermission.ts` | ✅ ค้นหาด้วย `line_id_hr` |
| รับคำขอลา | `app/api/line/submit-leave/route.ts` | ✅ ส่งไปที่ `line_id_hr` ของ admin |
| AI Chatbot | `app/liff/ai-chatbot/page.tsx` | ✅ ตรวจสิทธิ์ด้วย `line_id_hr` |
| HR Dashboard | `app/liff/hr-dashboard/page.tsx` | ✅ ตรวจสิทธิ์ด้วย `line_id_hr` |
| นัดพนักงาน (UI) | `app/liff/employee-meeting/page.tsx` | ✅ ตรวจสิทธิ์ HR, แสดงรายชื่อพนักงาน |
| HR Webhook | `app/api/line/hr-webhook/route.ts` | ✅ ใช้ HR LINE OA token |

#### 3.3 ระบบที่ใช้ทั้งสอง LINE ID
**สถานะ: ✅ ถูกต้อง**

| ระบบ | การใช้ `line_id_employ` | การใช้ `line_id_hr` |
|------|------------------------|---------------------|
| ส่งคำขอลา | ✅ บันทึก created_by | ✅ ส่งแจ้งเตือนไปที่ HR admin |
| นัดหมายพนักงาน | ✅ ส่งนัดหมายไปหาพนักงาน | ✅ HR ต้อง login ด้วย HR LINE OA |
| Employee Management | ✅ รองรับ import/export | ✅ รองรับ import/export |

---

### 4. LIFF Configuration Summary

#### Employee LINE OA LIFFs (Channel ID: 2008436527)
```javascript
employeeRegistration: '2008436560-GMZNa4OA'  // ลงทะเบียนพนักงาน
leaveRequest: '2008436560-J06MeXN4'          // ขอลา
attendanceCheckin: '2008436560-DQqw6EPV'     // Check-in/out
employeeOtViewer: '2008436560-WZqNLp6Z'      // ดู OT
aiPerformance: '2008436560-wJ3Mnl7g'         // ประเมินผลงาน (mock)
```

#### HR LINE OA LIFFs (Channel ID: 2008409511)
```javascript
adminRegistration: '2008409515-rgKMDQBb'     // ✅ ลงทะเบียน HR (ใหม่!)
hrAdmin: '2008409515-1Ew4WMVL'               // จัดการ HR
otViewer: '2008409515-EDXmdnJG'              // ดู OT ทั้งหมด
hrDashboard: '2008409515-XnPV2b48'           // Dashboard + AI
employeeMeeting: '2008409515-V336WkL9'       // นัดพนักงาน
aiChatbot: '2008409515-JPzQG38r'             // AI Chatbot
```

---

### 5. ตัวอย่างการทำงาน

#### กรณีที่ 1: พนักงานขอลา
```
1. พนักงาน → Employee LINE OA → LIFF Leave Request
2. ระบบบันทึก created_by = line_id_employ
3. ระบบดึง HR admins ที่มี department = 'admin_etec'
4. ส่งข้อความแจ้งเตือนไปที่ line_id_hr ของ HR admin
5. HR admin เห็นข้อความใน HR LINE OA
6. HR กดอนุมัติ/ปฏิเสธ
7. ระบบส่งผลการอนุมัติไปที่ line_id_employ ของพนักงาน
8. พนักงานเห็นผลใน Employee LINE OA
```

#### กรณีที่ 2: HR นัดพนักงาน
```
1. HR → HR LINE OA → LIFF Employee Meeting
2. ระบบตรวจสอบสิทธิ์ด้วย line_id_hr
3. HR เลือกพนักงานที่ต้องการนัด
4. ระบบดึง line_id_employ ของพนักงาน
5. ส่งข้อความนัดหมายไปที่ line_id_employ
6. พนักงานเห็นการนัดหมายใน Employee LINE OA
```

#### กรณีที่ 3: พนักงาน Check-in
```
1. พนักงาน → Employee LINE OA → LIFF Attendance Check-in
2. ระบบค้นหาพนักงานด้วย line_id_employ
3. บันทึก GPS location
4. ส่งข้อความยืนยันกลับไปที่ line_id_employ
5. พนักงานเห็นข้อความยืนยันใน Employee LINE OA
```

---

### 6. API Routes Summary

| API Route | LINE OA | LINE ID Column |
|-----------|---------|----------------|
| `/api/line/register-employee` | Employee | `line_id_employ` |
| `/api/line/register-admin` | HR | `line_id_hr` |
| `/api/line/attendance-checkin` | Employee | `line_id_employ` |
| `/api/line/submit-leave` | Both | Both |
| `/api/line/schedule-meeting` | Employee (send to) | `line_id_employ` |
| `/api/line/webhook` | Employee | `line_id_employ` |
| `/api/line/hr-webhook` | HR | `line_id_hr` |
| `/api/check-hr-permission` | HR | `line_id_hr` |

---

### 7. Build Status
✅ **Build Successful**

```
Route (app)                              Size     First Load JS
├ ○ /liff/admin-register                 2.96 kB         120 kB  ✅
├ ○ /liff/employee-register              1.98 kB        86.3 kB  ✅
├ ○ /liff/employee-meeting               3.75 kB         120 kB  ✅
├ ○ /liff/employee-ot-viewer             5.41 kB         128 kB  ✅
└ ... (all other routes)
```

---

## 🎯 สรุปการตรวจสอบ

### ✅ ระบบทำงานถูกต้องตามที่ต้องการ

1. ✅ Database มี 2 คอลัมม์: `line_id_employ` และ `line_id_hr`
2. ✅ หน้าลงทะเบียนพนักงาน → Employee LINE OA → บันทึก `line_id_employ`
3. ✅ หน้าลงทะเบียน HR → HR LINE OA → บันทึก `line_id_hr`
4. ✅ LIFF ID สำหรับ admin-register เปลี่ยนเป็น `2008409515-rgKMDQBb` แล้ว
5. ✅ ระบบนัดพนักงาน → ค้นหา `line_id_employ` เพื่อส่งไปที่ Employee LINE OA
6. ✅ ระบบคำขอลา → ส่งแจ้งเตือนไปที่ `line_id_hr` ของ HR
7. ✅ ทุก API ใช้ LINE ID ที่ถูกต้องตามหน้าที่

---

## 📋 ขั้นตอนการ Deploy

### 1. รัน Database Migration
```sql
-- Login เข้า Supabase SQL Editor
-- Copy และรันโค้ดจาก database-migration-line-ids.sql
```

### 2. Deploy Code
```bash
# Build สำเร็จแล้ว
npm run build

# Deploy ไป Vercel
git add .
git commit -m "✅ Complete dual LINE ID architecture with HR admin registration on HR LINE OA"
git push
```

### 3. ตั้งค่า LINE Developer Console

#### ตั้งค่า HR LINE OA LIFF
1. ไปที่ https://developers.line.biz/console/
2. เลือก HR LINE OA (Channel ID: 2008409511)
3. ไปที่ LIFF → เลือก LIFF ID `2008409515-rgKMDQBb`
4. ตรวจสอบ Endpoint URL: `https://ot-cal-sdht.vercel.app/liff/admin-register`
5. Scope ที่ต้องการ: `profile`, `openid`

---

## 🧪 การทดสอบระบบ

### ทดสอบการลงทะเบียน
- [ ] ลงทะเบียนพนักงานผ่าน Employee LINE OA → ตรวจสอบ `line_id_employ` ใน database
- [ ] ลงทะเบียน HR ผ่าน HR LINE OA → ตรวจสอบ `line_id_hr` ใน database
- [ ] ตรวจสอบว่า user เดียวกันมี LINE ID ต่างกันทั้งสองฝั่ง

### ทดสอบระบบส่งข้อความ
- [ ] พนักงานขอลา → HR ได้รับแจ้งเตือนใน HR LINE OA
- [ ] HR อนุมัติ → พนักงานได้รับแจ้งเตือนใน Employee LINE OA
- [ ] HR นัดพนักงาน → พนักงานได้รับแจ้งเตือนใน Employee LINE OA

### ทดสอบสิทธิ์การใช้งาน
- [ ] เฉพาะ admin_etec เข้า HR Dashboard ได้
- [ ] พนักงานทั่วไปเข้า HR Dashboard ไม่ได้
- [ ] AI Chatbot ใช้งานได้เฉพาะผ่าน HR LINE OA

---

## ⚠️ สิ่งที่ต้องระวัง

1. **User ต้องลงทะเบียนทั้งสองฝั่ง**
   - ถ้าต้องการใช้ Employee features → ลงทะเบียนที่ Employee LINE OA
   - ถ้าเป็น HR → ลงทะเบียนที่ HR LINE OA ด้วย

2. **LINE ID ต่างกัน**
   - User คนเดียวกันจะมี LINE ID ต่างกันใน Employee LINE OA และ HR LINE OA
   - ห้ามใช้ LINE ID จาก LINE OA หนึ่งไปค้นหาข้อมูลของอีก LINE OA

3. **HR Permission**
   - HR features ทั้งหมดต้อง login ผ่าน HR LINE OA
   - ถ้า login ผ่าน Employee LINE OA จะเข้าไม่ได้

---

## 📞 LIFF URLs สำหรับใช้งาน

### Employee LINE OA URLs
```
ลงทะเบียน: https://liff.line.me/2008436560-GMZNa4OA
ขอลา: https://liff.line.me/2008436560-J06MeXN4
Check-in: https://liff.line.me/2008436560-DQqw6EPV
ดู OT: https://liff.line.me/2008436560-WZqNLp6Z
```

### HR LINE OA URLs
```
ลงทะเบียน HR: https://liff.line.me/2008409515-rgKMDQBb ✅ ใหม่!
Dashboard: https://liff.line.me/2008409515-XnPV2b48
นัดพนักงาน: https://liff.line.me/2008409515-V336WkL9
AI Chatbot: https://liff.line.me/2008409515-JPzQG38r
```
