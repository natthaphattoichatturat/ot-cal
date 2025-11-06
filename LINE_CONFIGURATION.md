# LINE OA & LIFF Configuration Guide

## 🔗 Webhook URL Configuration

### LINE OA Messaging API Webhook
ให้ไปตั้งค่าใน [LINE Developers Console](https://developers.line.biz/)

**Webhook URL:**
```
https://ot-cal-sdht.vercel.app/api/line/webhook
```

**การตั้งค่า:**
1. เข้า LINE Developers Console
2. เลือก Provider และ Channel (2008436527)
3. ไปที่ Messaging API settings
4. ใส่ Webhook URL: `https://ot-cal-sdht.vercel.app/api/line/webhook`
5. **เปิด Use webhook**: ON
6. **เปิด Webhook redelivery**: ON (แนะนำ)
7. กด **Verify** เพื่อทดสอบ webhook

---

## 📱 LIFF Endpoint URL Configuration

### LIFF 1: Employee Registration (พนักงานลงทะเบียน)

**LIFF ID:** `2008436560-GMZNa4OA`
**LIFF URL:** `https://liff.line.me/2008436560-GMZNa4OA`

**Endpoint URL ที่ต้องตั้งใน LIFF Console:**
```
https://ot-cal-sdht.vercel.app/liff/employee-register
```

**การตั้งค่า:**
1. เข้า LINE Developers Console
2. เลือก LINE Login Channel (2008436560)
3. ไปที่ LIFF tab
4. เลือก LIFF App ID: `2008436560-GMZNa4OA`
5. กด Edit
6. ตั้งค่า:
   - **Endpoint URL**: `https://ot-cal-sdht.vercel.app/liff/employee-register`
   - **Scope**: profile, openid
   - **Bot link feature**: On (Optional)
7. Save

---

### LIFF 2: Admin Registration (HR/Admin ลงทะเบียน)

**LIFF ID:** `2008436560-lygzv9WO`
**LIFF URL:** `https://liff.line.me/2008436560-lygzv9WO`

**Endpoint URL ที่ต้องตั้งใน LIFF Console:**
```
https://ot-cal-sdht.vercel.app/liff/admin-register
```

**การตั้งค่า:**
1. เข้า LINE Developers Console
2. เลือก LINE Login Channel (2008436560)
3. ไปที่ LIFF tab
4. เลือก LIFF App ID: `2008436560-lygzv9WO`
5. กด Edit
6. ตั้งค่า:
   - **Endpoint URL**: `https://ot-cal-sdht.vercel.app/liff/admin-register`
   - **Scope**: profile, openid
   - **Bot link feature**: On (Optional)
7. Save

**Admin Password:** `ecloude_tecHR2025!`

---

### LIFF 3: Leave Request (แบบฟอร์มขอลา)

**LIFF ID:** `2008436560-J06MeXN4`
**LIFF URL:** `https://liff.line.me/2008436560-J06MeXN4`

**Endpoint URL ที่ต้องตั้งใน LIFF Console:**
```
https://ot-cal-sdht.vercel.app/liff/leave-request
```

**การตั้งค่า:**
1. เข้า LINE Developers Console
2. เลือก LINE Login Channel (2008436560)
3. ไปที่ LIFF tab
4. เลือก LIFF App ID: `2008436560-J06MeXN4`
5. กด Edit
6. ตั้งค่า:
   - **Endpoint URL**: `https://ot-cal-sdht.vercel.app/liff/leave-request`
   - **Scope**: profile, openid
   - **Bot link feature**: On (Optional)
7. Save

---

## 📋 API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/line/webhook` | POST | รับ webhook events จาก LINE (postback) |
| `/api/line/register-employee` | POST | ลงทะเบียนพนักงาน |
| `/api/line/register-admin` | POST | ลงทะเบียน Admin/HR |
| `/api/line/submit-leave` | POST | ส่งคำขอลา |

---

## 🔐 Environment Variables

ต้องเพิ่ม environment variables เหล่านี้ใน Vercel:

```env
# Supabase (Already exists)
NEXT_PUBLIC_SUPABASE_URL=https://clmzzsyxrymhbfvyclwe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# LINE OA Configuration (Optional - already in code)
# If you want to move to env variables for security:
NEXT_PUBLIC_LINE_CHANNEL_ID=2008436527
NEXT_PUBLIC_LINE_CHANNEL_SECRET=8c524fd6d33e4c964fac2e5bee10ac4f
NEXT_PUBLIC_LINE_CHANNEL_ACCESS_TOKEN=<your-token>
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=2008436560
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_SECRET=c0f5746d2541552c7c006afcddeb2fb0
```

---

## 📊 Database Schema Updates

ต้องรัน SQL queries เหล่านี้ใน Supabase SQL Editor:

```sql
-- Add line_id column to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS line_id TEXT;

-- Change identity_id to VARCHAR for storing 13-digit ID card number
ALTER TABLE employees ALTER COLUMN identity_id TYPE VARCHAR(20);

-- Add leave approval columns to leave_records
ALTER TABLE leave_records ADD COLUMN IF NOT EXISTS leave_able BOOLEAN DEFAULT FALSE;
ALTER TABLE leave_records ADD COLUMN IF NOT EXISTS rejected_reason TEXT;
```

---

## 🧪 Testing Flow

### 1. Test Employee Registration (LIFF 1)
1. เปิด `https://liff.line.me/2008436560-GMZNa4OA`
2. Login ด้วย LINE
3. กรอกข้อมูล: เลขบัตรประชาชน, ชื่อ, รหัสพนักงาน (optional)
4. กด Submit
5. ตรวจสอบว่า `line_id` ถูกเพิ่มในตาราง `employees`

### 2. Test Admin Registration (LIFF 2)
1. เปิด `https://liff.line.me/2008436560-lygzv9WO`
2. Login ด้วย LINE
3. ใส่รหัสผ่าน: `ecloude_tecHR2025!`
4. กรอกข้อมูล: รหัสพนักงาน, ชื่อ, เลขบัตรประชาชน
5. กด Submit
6. ตรวจสอบว่ามี record ใหม่ใน `employees` ที่ `department = 'admin_etec'`

### 3. Test Leave Request (LIFF 3)
1. เปิด LIFF URL ของ Leave Request (หลังจากสร้าง LIFF App แล้ว)
2. Login ด้วย LINE
3. กรอกแบบฟอร์ม: รหัสพนักงาน, วันที่ลา, ประเภท, เหตุผล
4. กด Submit
5. ตรวจสอบ:
   - Record ใหม่ใน `leave_records` ที่ `leave_able = false`
   - Admin ทุกคนได้รับ Flex Message การ์ดการลา
6. Admin กด "อนุมัติ" หรือ "ไม่อนุมัติ"
7. พนักงานได้รับ notification ผลการพิจารณา

---

## 🎯 Postback Data Format

เมื่อ Admin กดปุ่มใน Flex Message:

**Approve:**
```
action=approve&leaveId=123&employeeId=20056001
```

**Reject:**
```
action=reject&leaveId=123&employeeId=20056001
```

---

## 🚨 Troubleshooting

### Webhook ไม่ทำงาน
1. ตรวจสอบว่า Webhook URL ถูกต้อง
2. ตรวจสอบว่า "Use webhook" เปิดอยู่
3. ดู logs ใน LINE Developers Console
4. ตรวจสอบ Vercel logs

### LIFF ไม่โหลด
1. ตรวจสอบว่า Endpoint URL ตรงกับ path ใน Next.js
2. ตรวจสอบว่า LIFF ID ถูกต้อง
3. Clear LINE app cache และลองใหม่

### ข้อความไม่ส่ง
1. ตรวจสอบ Channel Access Token
2. ตรวจสอบว่า `line_id` ถูกบันทึกในฐานข้อมูล
3. ตรวจสอบ logs ใน Vercel

---

## 📚 Reference Links

- [LINE Developers Console](https://developers.line.biz/)
- [LINE Messaging API Documentation](https://developers.line.me/en/docs/messaging-api/)
- [LIFF Documentation](https://developers.line.me/en/docs/liff/)
- [Flex Message Simulator](https://developers.line.biz/flex-simulator/)

---

© 2025 E-Cloud Technology - OT Calculator System
