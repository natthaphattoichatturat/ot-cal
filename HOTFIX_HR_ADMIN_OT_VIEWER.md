# 🔧 Hotfix: HR Admin & OT Viewer Issues

## ปัญหาที่พบ

### 1. หน้า `/liff/hr-admin` แสดงข้อความ "ไม่มีสิทธิ์เข้าใช้งาน"
**สาเหตุ:** ยังใช้ `line_id` แทนที่จะเป็น `line_id_hr`

### 2. หน้า `/liff/ot-viewer` ขึ้น Error 404
**สาเหตุ:** ไม่มีไฟล์หน้านี้ในระบบ

---

## การแก้ไข

### ✅ Fix 1: แก้ไข HR Admin Permission Check

**ไฟล์:** `app/liff/hr-admin/page.tsx`

**เปลี่ยนจาก:**
```typescript
const { data: employee } = await supabase
  .from('employees')
  .select('department')
  .eq('line_id', profile.userId)  // ❌ ผิด
  .single()
```

**เป็น:**
```typescript
const { data: employee } = await supabase
  .from('employees')
  .select('department')
  .eq('line_id_hr', profile.userId)  // ✅ ถูกต้อง
  .single()
```

**เหตุผล:**
- หน้า HR Admin ทำงานบน HR LINE OA (LIFF ID: `2008409515-1Ew4WMVL`)
- ต้องตรวจสอบสิทธิ์ด้วย `line_id_hr` ที่บันทึกจาก HR LINE OA
- ถ้าใช้ `line_id` (เก่า) หรือ `line_id_employ` จะหาข้อมูลไม่เจอ

---

### ✅ Fix 2: สร้างหน้า OT Viewer สำหรับ HR

**ไฟล์ใหม่:** `app/liff/ot-viewer/page.tsx`

**ฟีเจอร์:**
- ✅ ตรวจสอบสิทธิ์ HR ด้วย `checkHRPermission` (ใช้ `line_id_hr`)
- ✅ แสดงข้อมูล OT แบบ 2 โหมด:
  1. **โหมดสรุป** - แสดงผลรวม OT ของแต่ละคน
  2. **โหมดรายละเอียด** - แสดงรายละเอียดแต่ละวัน
- ✅ กรองช่วงเวลา (วันที่เริ่มต้น - สิ้นสุด)
- ✅ ค้นหาพนักงานด้วยชื่อหรือรหัส
- ✅ UI สวยงาม responsive
- ✅ แสดงสถิติ: ชั่วโมง OT, วันทำงาน, สาย, ลางาน, วันหยุด

**LIFF Configuration:**
- **LIFF ID:** `2008409515-EDXmdnJG`
- **Endpoint URL:** `https://ot-cal-sdht.vercel.app/liff/ot-viewer`
- **LINE OA:** HR LINE OA (Channel ID: 2008409511)
- **Permission:** เฉพาะ `admin_etec` เท่านั้น

---

## Build Status

```bash
✅ Build Successful

Route (app)                              Size     First Load JS
├ ○ /liff/hr-admin                       48.7 kB         169 kB  ✅ Fixed
└ ○ /liff/ot-viewer                      5.59 kB         129 kB  ✅ New
```

---

## การทดสอบ

### Test 1: HR Admin Page
1. ✅ ลงทะเบียน HR ผ่าน `https://liff.line.me/2008409515-rgKMDQBb`
2. ✅ ตรวจสอบว่า `line_id_hr` ถูกบันทึกใน database
3. ✅ เปิด `https://liff.line.me/2008409515-1Ew4WMVL` (HR Admin)
4. ✅ ต้องเข้าได้ (ถ้าเป็น `admin_etec`)
5. ❌ ถ้าไม่ใช่ `admin_etec` ต้องเห็น "ไม่มีสิทธิ์เข้าใช้งาน"

### Test 2: OT Viewer
1. ✅ ลงทะเบียน HR ผ่าน `https://liff.line.me/2008409515-rgKMDQBb`
2. ✅ เปิด `https://liff.line.me/2008409515-EDXmdnJG` (OT Viewer)
3. ✅ ต้องเห็นหน้า OT Viewer (ถ้าเป็น `admin_etec`)
4. ✅ เลือกช่วงเวลา (เช่น เดือนนี้)
5. ✅ สลับระหว่าง "สรุปรายคน" และ "รายละเอียด"
6. ✅ ทดสอบค้นหาพนักงาน

---

## ไฟล์ที่เปลี่ยนแปลง

```
Modified (1 file):
├── app/liff/hr-admin/page.tsx           # แก้ไข line_id → line_id_hr

Created (1 file):
└── app/liff/ot-viewer/page.tsx          # สร้างหน้าใหม่
```

---

## LINE Developer Console Setup

### HR LINE OA (Channel ID: 2008409511)

ตรวจสอบ LIFF Apps:

| LIFF Name | LIFF ID | Endpoint URL | Status |
|-----------|---------|--------------|--------|
| Admin Registration | `2008409515-rgKMDQBb` | `/liff/admin-register` | ✅ |
| HR Admin | `2008409515-1Ew4WMVL` | `/liff/hr-admin` | ✅ Fixed |
| **OT Viewer** | `2008409515-EDXmdnJG` | `/liff/ot-viewer` | ✅ New |
| HR Dashboard | `2008409515-XnPV2b48` | `/liff/hr-dashboard` | ✅ |
| Employee Meeting | `2008409515-V336WkL9` | `/liff/employee-meeting` | ✅ |
| AI Chatbot | `2008409515-JPzQG38r` | `/liff/ai-chatbot` | ✅ |

---

## ขั้นตอน Deploy

### 1. Commit & Push
```bash
git add .
git commit -m "🔧 Fix HR admin permission & Add OT viewer page

- Fix hr-admin to use line_id_hr for permission check
- Create new /liff/ot-viewer page for HR to view employee OT
- Add summary and detail view modes
- Add date range filter and search functionality"

git push origin main
```

### 2. Verify Deployment
```bash
# รอ Vercel deploy เสร็จ (1-2 นาที)
# ตรวจสอบที่ Vercel Dashboard
```

### 3. Test on LINE
```bash
# 1. Test HR Admin
https://liff.line.me/2008409515-1Ew4WMVL

# 2. Test OT Viewer
https://liff.line.me/2008409515-EDXmdnJG
```

---

## เงื่อนไขการใช้งาน

### ทั้ง 2 หน้าต้องการ:
1. ✅ Login ผ่าน HR LINE OA
2. ✅ ลงทะเบียน HR แล้ว (มี `line_id_hr` ใน database)
3. ✅ เป็นแผนก `admin_etec`

### ถ้าเงื่อนไขไม่ครบ:
- จะเห็นหน้า "ไม่มีสิทธิ์เข้าใช้งาน"
- ต้องลงทะเบียน HR ก่อนที่: `https://liff.line.me/2008409515-rgKMDQBb`

---

## สรุป

✅ **ปัญหาที่ 1:** แก้แล้ว - HR Admin ใช้ `line_id_hr` ตรวจสอบสิทธิ์
✅ **ปัญหาที่ 2:** แก้แล้ว - สร้างหน้า OT Viewer ใหม่
✅ **Build:** สำเร็จ ไม่มี errors
✅ **Ready to Deploy:** พร้อม push ไป production

---

## 🔗 Quick Links

### HR Admin
```
LIFF URL: https://liff.line.me/2008409515-1Ew4WMVL
```

### OT Viewer (NEW)
```
LIFF URL: https://liff.line.me/2008409515-EDXmdnJG
```

### Admin Registration
```
LIFF URL: https://liff.line.me/2008409515-rgKMDQBb
Password: ecloude_tecHR2025!
```
