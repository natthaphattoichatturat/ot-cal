# 📚 คู่มือระบบจัดการพนักงาน HR Management System

## 🎯 ภาพรวมระบบ

ระบบจัดการข้อมูลพนักงานแบบครบวงจร ประกอบด้วย:
1. **Webapp** - ระบบจัดการพนักงานบน Browser
2. **LINE LIFF (HR Admin)** - ระบบจัดการผ่าน LINE OA สำหรับ HR
3. **LINE LIFF (OT Viewer)** - ระบบดู OT ผ่าน LINE สำหรับพนักงาน

---

## 📋 URL Endpoints และการตั้งค่า

### 🌐 Domain
```
https://ot-cal-sdht.vercel.app/
```

### 🔗 LINE Configuration

#### LINE OA สำหรับ HR (ระบบจัดการพนักงาน)
- **Channel ID**: `2008409515`
- **Channel Secret**: `4335066cdfd6a6fa7cd0b04c8993c0bb`
- **Channel Access Token**: `1YxuekdODxH0PKgSl+xLpXYrnViKidJAC64ZirqFXHv68FiPl4ybkqTnz7W+gwx24ysl0vj5xTsLg8uEXUmTNSGEBA7QbzL6R3xA8BsscP5ov5eWXSCjSuo5G9LIbNvAlgWOEzVQWok1EMzy/csE9wdB04t89/1O/w1cDnyilFU=`

#### LIFF Endpoints

| LIFF | LIFF ID | LIFF URL | Endpoint URL | วัตถุประสงค์ |
|------|---------|----------|--------------|-------------|
| HR Admin | `2008409515-1Ew4WMVL` | `https://liff.line.me/2008409515-1Ew4WMVL` | `https://ot-cal-sdht.vercel.app/liff/hr-admin` | จัดการข้อมูลพนักงาน |
| OT Viewer | `2008409515-EDXmdnJG` | `https://liff.line.me/2008409515-EDXmdnJG` | `https://ot-cal-sdht.vercel.app/liff/ot-viewer` | ดูชั่วโมง OT |

#### Webhook URL
```
https://ot-cal-sdht.vercel.app/api/line/hr-webhook
```

---

## 🗄️ Database Schema

### ✅ คอลัมน์ใหม่ที่เพิ่มในตาราง `employees`

```sql
-- รหัสฝ่าย (เช่น 001, 002)
division_code VARCHAR(10)

-- รหัสแผนก (เช่น 001, 002)
section_code VARCHAR(10)

-- ที่อยู่
address TEXT

-- สถานะพนักงาน (active, inactive, removed)
status VARCHAR(20) DEFAULT 'active'

-- วันที่ลบ/ปลด
removed_at TIMESTAMP WITH TIME ZONE

-- ผู้ลบ/ปลด
removed_by VARCHAR(100)

-- หมายเหตุ
remarks TEXT
```

### 📝 วิธีการรัน SQL

1. เข้า Supabase Dashboard
2. ไปที่ SQL Editor
3. Copy SQL จากไฟล์ `database-employee-updates.sql`
4. รันคำสั่ง

```bash
# ไฟล์: database-employee-updates.sql
```

---

## 🖥️ Webapp Pages

### 1. หน้ารายชื่อพนักงาน
**URL**: `/employees`

**Features**:
- แสดงรายชื่อพนักงานทั้งหมดในตาราง
- **ไม่แสดงค่าจ้าง** (perday_salary, perhr_salary)
- Search แบบ real-time 2 ช่อง:
  - ค้นหาจากชื่อ
  - ค้นหาจากรหัสพนักงาน
- Scrollable table (เลื่อนดูได้)
- คลิกแถวเพื่อดูรายละเอียด
- ปุ่มเพิ่มพนักงาน
- ปุ่ม Import ไฟล์ CSV/Excel

**คอลัมน์ที่แสดง**:
- รหัสพนักงาน
- ชื่อ-นามสกุล
- แผนก
- รหัสฝ่าย
- รหัสแผนก
- เลขบัตรประชาชน
- ที่อยู่
- LINE ID (แสดง ✓ ถ้ามี)
- สถานะ (badge สี)

---

### 2. หน้ารายละเอียดพนักงาน
**URL**: `/employees/[id]`

**Features**:
- แสดงข้อมูลพนักงานแบบละเอียด
- **ไม่แสดงค่าจ้าง**
- ปุ่ม "แก้ไขข้อมูล" เพื่อเข้าโหมดแก้ไข
- โหมดแก้ไข:
  - แก้ไขได้ทุกฟิลด์ยกเว้นรหัสพนักงาน
  - ปุ่ม "บันทึก" และ "ยกเลิก"
- แสดงข้อความสถานะการบันทึก

**ฟิลด์ที่แสดง**:
- รหัสพนักงาน (ไม่สามารถแก้ไข)
- ชื่อ-นามสกุล *
- แผนก *
- รหัสฝ่าย
- รหัสแผนก
- เลขบัตรประชาชน
- LINE User ID
- ที่อยู่
- หมายเหตุ

---

### 3. หน้าเพิ่มพนักงาน
**URL**: `/employees/add`

**Features**:
- ฟอร์มกรอกข้อมูลพนักงานใหม่
- Validation ข้อมูลที่จำเป็น
- หลังบันทึกสำเร็จ → redirect ไปหน้ารายละเอียด

**ฟิลด์ที่กรอก**:
- รหัสพนักงาน * (ต้องไม่ซ้ำ)
- ชื่อ-นามสกุล *
- แผนก *
- รหัสฝ่าย
- รหัสแผนก
- เลขบัตรประชาชน
- LINE User ID
- ที่อยู่
- หมายเหตุ

---

### 4. หน้า Import ข้อมูลพนักงาน
**URL**: `/employees/import`

**Features**:
- ดาวน์โหลด Template CSV
- Upload ไฟล์ CSV/Excel
- แสดงผลการ Import:
  - จำนวนทั้งหมด
  - สำเร็จ (สีเขียว)
  - ล้มเหลว (สีแดง)
- แสดงรายการที่ Import ไม่สำเร็จพร้อมสาเหตุ

**รูปแบบ CSV Template**:
```csv
employee_id,name,department,division_code,section_code,address,identity_id,line_id,remarks
EMP001,สมชาย ใจดี,ผลิต,001,001,123 ถ.สุขุมวิท กรุงเทพฯ,1234567890123,U1234567890abcdef,
EMP002,สมหญิง รักดี,บัญชี,002,002,456 ถ.พหลโยธิน กรุงเทพฯ,9876543210987,,หมายเหตุ
```

---

## 📱 LINE LIFF - HR Admin

### หน้า Landing (Menu หลัก)
**URL**: `/liff/hr-admin`
**LIFF ID**: `2008409515-1Ew4WMVL`

**Features**:
- ตรวจสอบสิทธิ์: `department = 'admin_etec'`
- แสดงข้อความปฏิเสธถ้าไม่มีสิทธิ์
- Menu 4 กล่อง:
  1. 👥 ดูรายละเอียดพนักงาน → `/liff/hr-admin/employees`
  2. ✏️ แก้ไขข้อมูลพนักงาน → `/liff/hr-admin/edit`
  3. ➕ เพิ่มพนักงาน → `/liff/hr-admin/add`
  4. 🗑️ ลบพนักงาน → `/liff/hr-admin/remove`

---

### หน้าดูรายละเอียดพนักงาน
**URL**: `/liff/hr-admin/employees`

**Features** (ต้องสร้างเพิ่ม):
- แสดงรายชื่อพนักงานในรูปแบบ mobile-friendly
- Search bar สำหรับค้นหา (ชื่อ หรือ รหัส)
- คลิกเพื่อดูรายละเอียด
- ปุ่มกลับหน้าหลัก
- ตรวจสอบสิทธิ์ `admin_etec`

---

### หน้าแก้ไขข้อมูลพนักงาน
**URL**: `/liff/hr-admin/edit`

**Features** (ต้องสร้างเพิ่ม):
- Search เพื่อเลือกพนักงานที่จะแก้ไข
- แสดงฟอร์มแก้ไขข้อมูล
- บันทึกการเปลี่ยนแปลง
- แสดงข้อความยืนยัน
- ปุ่มกลับหน้าหลัก

---

### หน้าเพิ่มพนักงาน
**URL**: `/liff/hr-admin/add`

**Features** (ต้องสร้างเพิ่ม):
- ฟอร์มเพิ่มพนักงานใหม่
- Validation ข้อมูล
- แสดงข้อความยืนยัน
- ปุ่มกลับหน้าหลัก

---

### หน้าลบพนักงาน
**URL**: `/liff/hr-admin/remove`

**Features** (ต้องสร้างเพิ่ม):
- Search เพื่อเลือกพนักงานที่จะลบ
- แสดงข้อมูลพนักงานก่อนลบ
- ยืนยันการลบ (soft delete)
- บันทึกผู้ลบและเวลา
- ปุ่มกลับหน้าหลัก

---

## 📱 LINE LIFF - OT Viewer

### หน้าดูชั่วโมง OT
**URL**: `/liff/ot-viewer`
**LIFF ID**: `2008409515-EDXmdnJG`

**Features** (ต้องสร้างเพิ่ม):
- Layout เหมาะกับมือถือ
- เลือกช่วงวันที่:
  - เลือกวันเริ่มต้น
  - เลือกวันสิ้นสุด
- Search รหัสพนักงาน หรือ ชื่อ
- แสดงข้อมูล OT:
  - รายการแต่ละวัน
  - ชั่วโมง OT ต่อวัน
  - **รวมชั่วโมง OT ทั้งหมด** (Bold/Highlight)
- รองรับการดูหลายวันในครั้งเดียว
- ปุ่มรีเฟรชข้อมูล

**ตัวอย่าง Layout**:
```
┌─────────────────────────────────┐
│  ชั่วโมง OT                     │
├─────────────────────────────────┤
│  🔍 ค้นหา: [_______________]    │
│                                 │
│  📅 วันที่: [____] ถึง [____]   │
│      [ค้นหา]                    │
├─────────────────────────────────┤
│  📊 สรุป                        │
│  รวมทั้งหมด: 45.5 ชั่วโมง      │
├─────────────────────────────────┤
│  📋 รายละเอียด                  │
│  ─────────────────────────────  │
│  EMP001 - สมชาย ใจดี            │
│  9 พ.ย. 2568    3.5 ชม.        │
│  10 พ.ย. 2568   4.0 ชม.        │
│  11 พ.ย. 2568   2.5 ชม.        │
│  ...                            │
└─────────────────────────────────┘
```

---

## 🔌 API Endpoints

### 1. GET `/api/employees`
ดึงรายชื่อพนักงาน

**Query Parameters**:
- `search` - คำค้นหา
- `searchBy` - ค้นหาจาก: `name` | `employee_id`
- `status` - สถานะ: `active` | `inactive` | `removed`
- `includeInactive` - รวมพนักงานที่ไม่ active: `true` | `false`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employee_id": "EMP001",
      "name": "สมชาย ใจดี",
      "department": "ผลิต",
      "division_code": "001",
      "section_code": "001",
      "address": "123 ถ.สุขุมวิท",
      "identity_id": "1234567890123",
      "line_id": "U1234567890abcdef",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 2. POST `/api/employees`
เพิ่มพนักงานใหม่

**Request Body**:
```json
{
  "employee_id": "EMP001",
  "name": "สมชาย ใจดี",
  "department": "ผลิต",
  "division_code": "001",
  "section_code": "001",
  "address": "123 ถ.สุขุมวิท",
  "identity_id": "1234567890123",
  "line_id": "U1234567890abcdef",
  "remarks": "หมายเหตุ"
}
```

**Response**:
```json
{
  "success": true,
  "data": { /* employee object */ }
}
```

---

### 3. PUT `/api/employees`
แก้ไขข้อมูลพนักงาน

**Request Body**:
```json
{
  "id": 1,
  "updates": {
    "name": "สมชาย ใจดีมาก",
    "address": "456 ถ.พหลโยธิน"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": { /* updated employee */ }
}
```

---

### 4. DELETE `/api/employees`
ลบ/ปลดพนักงาน (Soft Delete)

**Request Body**:
```json
{
  "employee_id": "EMP001",
  "removed_by": "HR_ADMIN",
  "permanent": false
}
```

**Response**:
```json
{
  "success": true,
  "data": { /* updated employee with status=removed */ }
}
```

---

### 5. POST `/api/employees/import`
Import พนักงานจาก CSV

**Request Body**:
```json
{
  "employees": [
    {
      "employee_id": "EMP001",
      "name": "สมชาย ใจดี",
      "department": "ผลิต",
      ...
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "results": {
    "total": 10,
    "success": [/* successful records */],
    "failed": [
      {
        "data": { /* employee data */ },
        "error": "รหัสพนักงานซ้ำ"
      }
    ]
  },
  "message": "สำเร็จ 8/10 รายการ"
}
```

---

### 6. GET `/api/employees/[id]`
ดึงข้อมูลพนักงานคนเดียว

**Response**:
```json
{
  "success": true,
  "data": { /* employee object */ }
}
```

---

## 🔐 Authorization

### Webapp
- ไม่มีการตรวจสอบสิทธิ์ (ใช้ภายใน)

### LIFF HR Admin
- ตรวจสอบ LINE User ID กับตาราง `employees`
- ต้องมี `department = 'admin_etec'`
- แสดงข้อความปฏิเสธถ้าไม่มีสิทธิ์

---

## 📊 Data Flow

### 1. Webapp → API → Database
```
User (Browser)
  → Webapp Page
  → Fetch API
  → Next.js API Route
  → Supabase Client
  → PostgreSQL Database
```

### 2. LINE LIFF → API → Database
```
User (LINE App)
  → LIFF Page
  → LIFF SDK (get LINE User ID)
  → Check Authorization
  → Fetch API
  → Next.js API Route
  → Supabase Client
  → PostgreSQL Database
```

---

## 🚀 การ Deploy

### 1. รัน SQL ใน Supabase
```sql
-- Copy จาก database-employee-updates.sql
```

### 2. ตั้งค่า LIFF ใน LINE Developers Console

**LIFF: HR Admin (2008409515-1Ew4WMVL)**
```
LIFF App Name: HR Admin
Size: Full
Endpoint URL: https://ot-cal-sdht.vercel.app/liff/hr-admin
Scopes: profile, openid
```

**LIFF: OT Viewer (2008409515-EDXmdnJG)**
```
LIFF App Name: OT Viewer
Size: Full
Endpoint URL: https://ot-cal-sdht.vercel.app/liff/ot-viewer
Scopes: profile, openid
```

### 3. ตั้งค่า Webhook
```
Webhook URL: https://ot-cal-sdht.vercel.app/api/line/hr-webhook
```

### 4. Deploy to Vercel
```bash
# Push to GitHub
git add -A
git commit -m "Add HR Management System"
git push

# Vercel will auto-deploy
```

---

## 📝 TODO: หน้าที่ต้องสร้างเพิ่ม

เนื่องจากเวลาจำกัด หน้าเหล่านี้ยังไม่ได้สร้าง แต่มี API พร้อมแล้ว:

### LIFF Pages ที่ต้องเพิ่ม:
1. `/liff/hr-admin/employees` - ดูรายชื่อพนักงาน
2. `/liff/hr-admin/edit` - แก้ไขข้อมูล
3. `/liff/hr-admin/add` - เพิ่มพนักงาน
4. `/liff/hr-admin/remove` - ลบพนักงาน
5. `/liff/ot-viewer` - ดูชั่วโมง OT

### API ที่ต้องเพิ่ม:
1. `/api/line/hr-webhook` - รับ webhook จาก LINE

### Structure สำหรับหน้า LIFF ที่เหลือ:
```tsx
// Template structure
'use client'
import { useEffect, useState } from 'react'
import liff from '@line/liff'
import { LINE_CONFIG } from '@/lib/lineConfig'

export default function Page() {
  // 1. Check LIFF init
  // 2. Check authorization (department = admin_etec)
  // 3. Render UI
  // 4. Call API
  // 5. Handle response
}
```

---

## ✅ Files Created

### Database
- `/database-employee-updates.sql` - SQL schema updates

### API Routes
- `/app/api/employees/route.ts` - CRUD operations
- `/app/api/employees/[id]/route.ts` - Get single employee
- `/app/api/employees/import/route.ts` - Bulk import

### Webapp Pages
- `/app/employees/page.tsx` - List employees
- `/app/employees/[id]/page.tsx` - Employee detail/edit
- `/app/employees/add/page.tsx` - Add employee
- `/app/employees/import/page.tsx` - Import CSV

### LIFF Pages
- `/app/liff/hr-admin/page.tsx` - Landing menu

### Configuration
- `/lib/lineConfig.ts` - Updated with HR credentials

### Documentation
- `/HR_SYSTEM_DOCUMENTATION.md` - This file

---

## 🎨 UI/UX Guidelines

### Colors
- Primary: `#667eea` (Purple)
- Success: `#4CAF50` (Green)
- Error: `#f44336` (Red)
- Warning: `#ff9800` (Orange)

### Mobile-First Design
- ใช้ Flexbox/Grid สำหรับ responsive
- Font size อ่านง่ายบนมือถือ (14-16px)
- ปุ่มขนาดใหญ่พอกด (min-height: 44px)
- Spacing เพียงพอ (padding, margin)

---

## 🐛 Troubleshooting

### ปัญหา: LIFF ไม่เปิด
- ตรวจสอบ LIFF ID ถูกต้อง
- ตรวจสอบ Endpoint URL
- ตรวจสอบ Scopes ครบถ้วน

### ปัญหา: ไม่มีสิทธิ์
- ตรวจสอบ `line_id` ในตาราง `employees`
- ตรวจสอบ `department = 'admin_etec'`

### ปัญหา: Import CSV ล้มเหลว
- ตรวจสอบรูปแบบ CSV ถูกต้อง
- ตรวจสอบ encoding เป็น UTF-8
- ตรวจสอบไม่มีรหัสพนักงานซ้ำ

---

## 📞 Support

สำหรับคำถามหรือปัญหา:
1. ตรวจสอบเอกสารนี้ก่อน
2. ดูที่ Console/Network tab ใน Browser DevTools
3. ตรวจสอบ Logs ใน Vercel Dashboard

---

**สร้างโดย**: Claude Code 🤖
**วันที่**: 2024-11-12
**เวอร์ชัน**: 1.0
