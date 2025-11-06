# 🚀 LINE Integration Quick Start Guide

## ขั้นตอนที่ 1: อัพเดท Database Schema

1. เข้า [Supabase Dashboard](https://supabase.com/dashboard)
2. เลือก Project: ot-cal
3. ไปที่ **SQL Editor**
4. รัน SQL queries จากไฟล์ `database-updates.sql`:

```sql
ALTER TABLE employees ADD COLUMN IF NOT EXISTS line_id TEXT;
ALTER TABLE employees ALTER COLUMN identity_id TYPE VARCHAR(20);
ALTER TABLE leave_records ADD COLUMN IF NOT EXISTS leave_able BOOLEAN DEFAULT FALSE;
ALTER TABLE leave_records ADD COLUMN IF NOT EXISTS rejected_reason TEXT;
```

---

## ขั้นตอนที่ 2: Deploy ไปยัง Vercel

```bash
git add .
git commit -m "Add LINE OA integration with LIFF"
git push origin main
```

Vercel จะ auto-deploy ให้อัตโนมัติ

---

## ขั้นตอนที่ 3: ตั้งค่า LINE Webhook

1. เข้า [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก Provider และ Channel **2008436527**
3. ไปที่ **Messaging API** tab
4. หา **Webhook settings**
5. ใส่ Webhook URL:
   ```
   https://ot-cal-sdht.vercel.app/api/line/webhook
   ```
6. **เปิด "Use webhook"**: ON
7. กด **Verify** เพื่อทดสอบ (ควรได้ Success)
8. **เปิด "Webhook redelivery"**: ON (แนะนำ)

---

## ขั้นตอนที่ 4: ตั้งค่า LIFF Apps

### LIFF 1: Employee Registration (ลงทะเบียนพนักงาน)

1. เข้า [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก Provider และ Channel **2008436560** (LINE Login)
3. ไปที่ **LIFF** tab
4. เลือก LIFF App ID: **2008436560-GMZNa4OA**
5. กด **Edit**
6. อัพเดท Endpoint URL:
   ```
   https://ot-cal-sdht.vercel.app/liff/employee-register
   ```
7. ตรวจสอบ Scopes: `profile`, `openid`
8. Save

**LIFF URL สำหรับแชร์:**
```
https://liff.line.me/2008436560-GMZNa4OA
```

---

### LIFF 2: Admin Registration (ลงทะเบียน Admin/HR)

1. ในหน้า LIFF tab เดิม
2. เลือก LIFF App ID: **2008436560-lygzv9WO**
3. กด **Edit**
4. อัพเดท Endpoint URL:
   ```
   https://ot-cal-sdht.vercel.app/liff/admin-register
   ```
5. ตรวจสอบ Scopes: `profile`, `openid`
6. Save

**LIFF URL สำหรับแชร์:**
```
https://liff.line.me/2008436560-lygzv9WO
```

**Admin Password:** `ecloude_tecHR2025!`

---

### LIFF 3: Leave Request (แบบฟอร์มขอลา)

✅ **LIFF App สร้างเรียบร้อยแล้ว:**

**LIFF ID:** `2008436560-J06MeXN4`
**LIFF URL:** `https://liff.line.me/2008436560-J06MeXN4`

**ตั้งค่า Endpoint URL:**
1. เข้า [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก Provider และ Channel **2008436560** (LINE Login)
3. ไปที่ **LIFF** tab
4. เลือก LIFF App ID: **2008436560-J06MeXN4**
5. กด **Edit**
6. อัพเดท Endpoint URL:
   ```
   https://ot-cal-sdht.vercel.app/liff/leave-request
   ```
7. ตรวจสอบ Scopes: `profile`, `openid`
8. Save

**LIFF URL สำหรับแชร์:**
```
https://liff.line.me/2008436560-J06MeXN4
```

---

## ขั้นตอนที่ 5: ทดสอบระบบ

### 5.1 ทดสอบ Employee Registration

1. เปิด LINE app บนมือถือ
2. เปิด URL: `https://liff.line.me/2008436560-GMZNa4OA`
3. Login ด้วย LINE
4. กรอกข้อมูล:
   - เลขบัตรประชาชน: 1234567890123
   - ชื่อ-นามสกุล: ทดสอบ ระบบ
   - รหัสพนักงาน: (ตามที่มีในระบบ)
5. กด **ยืนยันลงทะเบียน**
6. ควรได้ข้อความ ✅ "ลงทะเบียนสำเร็จ"
7. ตรวจสอบใน Supabase ว่า `line_id` ถูกบันทึกแล้ว

---

### 5.2 ทดสอบ Admin Registration

1. เปิด URL: `https://liff.line.me/2008436560-lygzv9WO`
2. Login ด้วย LINE
3. ใส่รหัสผ่าน: `ecloude_tecHR2025!`
4. กรอกข้อมูล:
   - รหัสพนักงาน: ADMIN001
   - ชื่อ-นามสกุล: Admin Test
   - เลขบัตรประชาชน: 9876543210123
5. กด **ยืนยันลงทะเบียน Admin**
6. ตรวจสอบใน Supabase:
   - มี record ใหม่
   - `department` = `admin_etec`
   - `line_id` ถูกบันทึก

---

### 5.3 ทดสอบ Leave Request & Approval

**ฝั่งพนักงาน:**
1. เปิด LIFF URL ของ Leave Request (หลังสร้าง LIFF App แล้ว)
2. กรอกแบบฟอร์ม:
   - รหัสพนักงาน: (ที่ลงทะเบียนไว้)
   - วันที่ลา: เลือกวัน
   - ประเภทการลา: ลาป่วย
   - เหตุผล: ทดสอบระบบ
3. กด **ส่งคำขอลา**
4. ควรได้ข้อความ ✅ "ส่งคำขอลาสำเร็จ"

**ฝั่ง Admin:**
1. Admin จะได้รับการ์ด Flex Message ใน LINE Chat
2. การ์ดจะแสดงข้อมูล:
   - รหัสพนักงาน
   - ชื่อ
   - วันที่ลา
   - ประเภทการลา
   - เหตุผล
3. กดปุ่ม **✅ อนุมัติ** หรือ **❌ ไม่อนุมัติ**

**กลับมาที่พนักงาน:**
- พนักงานจะได้รับข้อความแจ้งผลการอนุมัติใน LINE

---

## 📊 ตรวจสอบ Logs

### Vercel Logs
1. เข้า [Vercel Dashboard](https://vercel.com/)
2. เลือก Project: ot-cal
3. ไปที่ **Logs** tab
4. Filter โดย `/api/line/`

### LINE Developers Logs
1. เข้า LINE Developers Console
2. เลือก Channel
3. ไปที่ **Messaging API** → **Webhook settings**
4. กด **View logs** เพื่อดู webhook requests

---

## 🎯 URLs สำคัญ

| Purpose | URL |
|---------|-----|
| Webhook | `https://ot-cal-sdht.vercel.app/api/line/webhook` |
| LIFF 1 (Employee) | `https://liff.line.me/2008436560-GMZNa4OA` |
| LIFF 2 (Admin) | `https://liff.line.me/2008436560-lygzv9WO` |
| LIFF 3 (Leave) | `https://liff.line.me/{NEW_LIFF_ID}` |
| Web App | `https://ot-cal-sdht.vercel.app` |

---

## 🔍 Troubleshooting

### ❌ Webhook Verify Failed
- ตรวจสอบว่า deploy เสร็จแล้ว
- ลอง curl webhook: `curl https://ot-cal-sdht.vercel.app/api/line/webhook`
- ตรวจสอบ signature validation ใน code

### ❌ LIFF ไม่โหลด
- ตรวจสอบ Endpoint URL ว่าตรงกับ path
- Clear cache LINE app
- ลองบน browser แทน

### ❌ ส่งข้อความไม่ได้
- ตรวจสอบ Channel Access Token
- ตรวจสอบว่า `line_id` มีค่าใน database
- ดู Vercel logs หา error

---

## ✅ Checklist

- [ ] รัน SQL updates ใน Supabase
- [ ] Deploy code ไป Vercel สำเร็จ
- [ ] ตั้งค่า Webhook URL ใน LINE Console
- [ ] Verify webhook สำเร็จ (เห็น ✅)
- [ ] ตั้งค่า LIFF 1 Endpoint URL
- [ ] ตั้งค่า LIFF 2 Endpoint URL
- [ ] สร้าง LIFF 3 ใหม่และตั้งค่า Endpoint URL
- [ ] อัพเดท LIFF ID ของ LIFF 3 ในโค้ด
- [ ] ทดสอบ Employee Registration สำเร็จ
- [ ] ทดสอบ Admin Registration สำเร็จ
- [ ] ทดสอบ Leave Request สำเร็จ
- [ ] ทดสอบ Leave Approval สำเร็จ
- [ ] พนักงานได้รับ notification สำเร็จ

---

**🎉 เสร็จสิ้น! ระบบพร้อมใช้งาน**

หากมีปัญหา ดูรายละเอียดเพิ่มเติมที่ `LINE_CONFIGURATION.md`
