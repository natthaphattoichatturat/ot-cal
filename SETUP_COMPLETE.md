# ✅ ระบบคำนวณค่าจ้างสำเร็จเรียบร้อย!

## 🎉 สิ่งที่ได้สร้างเสร็จแล้วทั้งหมด

### 1. 📊 Database Schema (7 ตาราง)
ไฟล์: [wage-system-migration.sql](wage-system-migration.sql)

**ตารางที่สร้าง**:
- ✅ `wage_periods` - งวดจ่ายเงิน
- ✅ `daily_wages` - ค่าจ้างรายวัน (มี Trigger คำนวณอัตโนมัติ)
- ✅ `attendance_punctuality` - ตรวจสอบเบี้ยขยัน
- ✅ `period_wages` - สรุปค่าจ้างรายงวด
- ✅ `sso_monthly_summary` - ประกันสังคมรายเดือน (รองรับ 2 งวด/เดือน)
- ✅ `tax_calculations` - ภาษีเงินได้
- ✅ `employee_wage_summary_ytd` - สรุปสะสมรายปี

### 2. 🧮 Utility Functions
ไฟล์: [lib/wageCalculations.ts](lib/wageCalculations.ts)

**ฟังก์ชันที่สร้าง**:
- ✅ `calculateDailyWage()` - คำนวณค่าจ้างรายวัน (พื้นฐาน + OT 3 ระดับ)
- ✅ `checkAttendanceBonus()` - ตรวจสอบเบี้ยขยัน (มาก่อน >= 5 นาที ทุกวัน)
- ✅ `calculatePeriodWage()` - คำนวณค่าจ้างรายงวด
- ✅ `calculateMonthlySSO()` - คำนวณประกันสังคมแบบ 2 งวด/เดือน
- ✅ `calculateWithholdingTax()` - คำนวณภาษีเงินได้
- ✅ `getPeriodDates()` - คำนวณวันที่ของงวด
- ✅ `getDateRange()` - สร้างช่วงวันที่

### 3. 🌐 API Routes (5 APIs)

#### API #1: ค่าจ้างรายวัน
ไฟล์: [app/api/wages/daily/route.ts](app/api/wages/daily/route.ts)
```
GET /api/wages/daily?month=2024-11&period=1
```
- ดึงข้อมูลค่าจ้างรายวันของทุกคน
- คำนวณจาก daily_attendance real-time

#### API #2: สรุปค่าจ้างพนักงาน
ไฟล์: [app/api/wages/summary/route.ts](app/api/wages/summary/route.ts)
```
GET /api/wages/summary?month=2024-11&period=1
```
- สรุปค่าจ้างทุกคนในงวดนั้น
- รวมเบี้ยขยัน
- ใช้แสดงในตาราง /wages

#### API #3: รายละเอียดพนักงาน
ไฟล์: [app/api/wages/employee/[id]/route.ts](app/api/wages/employee/[id]/route.ts)
```
GET /api/wages/employee/E001?month=2024-11&period=1
```
- ดึงข้อมูลค่าจ้างของพนักงานคนเดียว
- คำนวณ SSO จาก 2 งวด
- ดึงข้อมูล YTD ด้วย

#### API #4: ซิงค์ข้อมูลค่าจ้าง
ไฟล์: [app/api/wages/sync/route.ts](app/api/wages/sync/route.ts)
```
POST /api/wages/sync
Body: { month: "2024-11", period: 1 }
```
- ซิงค์ข้อมูลจาก `daily_attendance` → `daily_wages`
- ซิงค์ `attendance_punctuality` ด้วย
- **ถูกเรียกอัตโนมัติหลัง import scan**

#### API #5: Import Scans (อัพเดท)
ไฟล์: [app/api/import-scans/route.ts](app/api/import-scans/route.ts)
- เพิ่มการเรียก `/api/wages/sync` อัตโนมัติหลัง import สำเร็จ
- คำนวณค่าจ้างทันทีที่ import เสร็จ

### 4. 💻 Frontend Pages (2 หน้า)

#### หน้า #1: ตารางค่าจ้าง
ไฟล์: [app/wages/page.tsx](app/wages/page.tsx)
```
URL: /wages
```

**Features**:
- ✅ **2 Tabs**:
  - Tab 1: ตารางค่าจ้างรายวัน
  - Tab 2: สรุปค่าจ้างพนักงาน (มี pagination)
- ✅ เลือกเดือน/ปี/งวด
- ✅ Search แบบ real-time (ชื่อ + รหัส)
- ✅ **Pagination**: 10 รายการ/หน้า (มีทั้งบนและล่าง)
- ✅ คลิกชื่อพนักงาน → ไปหน้า wage-detail

#### หน้า #2: Dashboard รายละเอียดพนักงาน
ไฟล์: [app/wages/[id]/page.tsx](app/wages/[id]/page.tsx)
```
URL: /wages/E001?month=2024-11&period=1
```

**Features แสดง**:
- ✅ **ข้อมูลส่วนตัว**: รหัส, ชื่อ, แผนก, ค่าจ้าง
- ✅ **รายได้รวม**:
  - ค่าจ้างพื้นฐาน
  - ค่า OT ปกติ (×1.5)
  - ค่า OT พิเศษ (×2)
  - ค่า OT ขั้นสูง (×3)
  - เบี้ยขยัน 300 บาท
  - **รวมรายได้** (เด่นสุด)
- ✅ **ดูรายละเอียดรายวัน**: เลือกวันด้วย checkbox
- ✅ **จำนวนชั่วโมง OT**: แยกตามประเภท
- ✅ **ประกันสังคม (SSO)**:
  - รายได้ 2 งวด
  - ฐานคำนวณ (max 15,000)
  - SSO แต่ละงวด
  - **SSO รวมทั้งเดือน** (max 750)
  - วันนำส่ง (วันที่ 15)
- ✅ **สรุปสะสมรายปี (YTD)**:
  1. เงินเดือนสะสม
  2. รวมรายได้สะสม
  3. ประกันสังคมสะสม
  4. ภาษีสะสม
  5. รวมหักสะสม
  6. **เงินสุทธิสะสม**

### 5. 🔗 Navigation

**หน้าหลัก** (`/`):
- เพิ่มปุ่ม "คำนวณค่าจ้าง" (สีน้ำเงิน) ที่ไปหน้า `/wages`

---

## 📋 วิธีใช้งาน

### Step 1: Run Database Migration
```bash
# เชื่อมต่อ Supabase
psql -h <your-supabase-host> -U postgres -d postgres -f wage-system-migration.sql
```

### Step 2: ตรวจสอบ Environment Variables
```bash
# .env.local หรือ .env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000  # สำหรับ sync API
```

### Step 3: รันโปรเจกต์
```bash
npm run dev
```

### Step 4: ทดสอบระบบ

1. **Import Scan** ที่หน้าหลัก `/`
   - ระบบจะคำนวณ OT อัตโนมัติ
   - **คำนวณค่าจ้างอัตโนมัติ** (ใหม่!)
   - บันทึกลง `daily_wages` และ `attendance_punctuality`

2. **ดูค่าจ้าง** ที่ `/wages`
   - เลือกเดือน/งวด
   - ดูตารางค่าจ้างรายวัน (Tab 1)
   - ดูสรุปพนักงาน (Tab 2)
   - Search พนักงาน
   - เปลี่ยนหน้า (Pagination)

3. **ดูรายละเอียดพนักงาน** คลิกที่ชื่อพนักงาน
   - ดูรายได้รวม
   - เลือกดูรายวัน
   - ดูชั่วโมง OT
   - **ดูประกันสังคม** (คำนวณจาก 2 งวด)
   - ดูข้อมูลสะสม YTD

---

## 🔄 การทำงานของระบบ (Data Flow)

```
1. Import Scan (.txt file)
   ↓
2. บันทึกลง attendance_scans
   ↓
3. คำนวณ OT → บันทึกลง daily_attendance
   ↓
4. 🆕 เรียก /api/wages/sync อัตโนมัติ
   ↓
5. คำนวณค่าจ้าง → บันทึกลง daily_wages
   ↓
6. ตรวจสอบเบี้ยขยัน → บันทึกลง attendance_punctuality
   ↓
7. แสดงผลที่หน้า /wages
```

---

## ⚠️ สูตรสำคัญ

### การคำนวณค่าจ้างรายวัน
```
ค่าจ้างพื้นฐาน = 8 × perhr_salary (ถ้ามีเวลาเข้างาน)
ค่า OT ปกติ = ot_normal_hours × perhr_salary (ot_normal_hours คูณ 1.5 แล้ว)
ค่า OT พิเศษ = ot_special_hours × perhr_salary (ot_special_hours คูณ 2 แล้ว)
ค่า OT ขั้นสูง = ot_premium_hours × perhr_salary (ot_premium_hours คูณ 3 แล้ว)
รวมค่าจ้างรายวัน = ทั้งหมดบวกกัน
```

### การคำนวณเบี้ยขยัน
```
เงื่อนไข:
- เข้างานก่อนเวลา >= 5 นาที
- ทุกวันในงวด (ไม่นับวันหยุด/ลา)

ได้เบี้ยขยัน: 300 บาท
```

### การคำนวณประกันสังคม (SSO)
```
รายได้ทั้งเดือน = period1_income + period2_income
ฐานคำนวณ (sso_base) = MIN(รายได้ทั้งเดือน, 15000)
SSO ทั้งเดือน = MIN(sso_base × 5%, 750)

งวดที่ 1: SSO = MIN(period1_income × 5%, 750)
งวดที่ 2: SSO = SSO ทั้งเดือน - SSO งวดที่ 1
```

---

## 🎯 การใช้งานจริง

### ตัวอย่าง: พนักงาน "นายสมชาย"

**เดือนพฤศจิกายน 2567**:
- งวดที่ 1 (26 ต.ค. - 10 พ.ย.): รายได้ 8,000 บาท
- งวดที่ 2 (11 - 25 พ.ย.): รายได้ 8,500 บาท

**การคำนวณ SSO**:
```
รายได้ทั้งเดือน = 8,000 + 8,500 = 16,500 บาท
ฐานคำนวณ = MIN(16,500, 15,000) = 15,000 บาท
SSO ทั้งเดือน = 15,000 × 5% = 750 บาท

งวดที่ 1: หัก = MIN(8,000 × 5%, 750) = 400 บาท
งวดที่ 2: หัก = 750 - 400 = 350 บาท
```

**วันนำส่ง SSO**: วันที่ 15 ธันวาคม 2567

---

## 📚 เอกสารเพิ่มเติม

1. **[WAGE_SYSTEM_IMPLEMENTATION_GUIDE.md](WAGE_SYSTEM_IMPLEMENTATION_GUIDE.md)** - คู่มือพัฒนาแบบละเอียด
2. **[DATABASE_SCHEMA_DIAGRAM.md](DATABASE_SCHEMA_DIAGRAM.md)** - Diagram และรายละเอียด Tables
3. **[wage-system-migration.sql](wage-system-migration.sql)** - SQL Script สำหรับสร้าง Tables

---

## ✨ Features พิเศษ

### 1. 🤖 Auto Calculation
- คำนวณค่าจ้างอัตโนมัติเมื่อ import scan
- ใช้ Trigger ใน database คำนวณค่าจ้างรายวัน
- ซิงค์ข้อมูลอัตโนมัติทุกครั้งที่ import

### 2. 💰 Accurate SSO Calculation
- รองรับการคำนวณแบบ 2 งวด/เดือน
- งวดที่ 2 หักส่วนต่างให้ครบ (ไม่เกิน 750 บาท/เดือน)
- แสดงวันนำส่งอัตโนมัติ

### 3. 🎁 Attendance Bonus
- ตรวจสอบอัตโนมัติว่ามาก่อนเวลา >= 5 นาที
- ต้องมาก่อนทุกวันในงวดถึงจะได้เบี้ยขยัน 300 บาท

### 4. 📊 Real-time Dashboard
- ดูข้อมูลสะสม YTD
- เลือกดูรายละเอียดรายวัน
- แสดง SSO และภาษีแยกชัดเจน

### 5. 🔍 Advanced Search & Pagination
- Search แบบ real-time
- Pagination 10 รายการ/หน้า
- มีปุ่มทั้งบนและล่าง

---

## 🚀 Next Steps (ถ้าต้องการเพิ่ม)

1. **Export รายงาน**:
   - Export เป็น Excel
   - Export เป็น PDF
   - Print สลิปเงินเดือน

2. **ภาษีเงินได้แบบละเอียด**:
   - คำนวณตามขั้นบันได
   - รองรับค่าลดหย่อนต่างๆ
   - คำนวณภาษีสะสมแบบถูกต้อง

3. **Dashboard สรุปทั้งบริษัท**:
   - สรุปค่าจ้างทั้งบริษัท
   - กราฟแสดง Trend
   - เปรียบเทียบ Month-over-Month

4. **ระบบ Approval**:
   - HR อนุมัติค่าจ้างก่อนจ่าย
   - History การแก้ไข
   - Comment และ Note

5. **แจ้งเตือน**:
   - แจ้งเตือนวันครบกำหนดส่ง SSO
   - แจ้งเตือนวันจ่ายเงิน
   - Email สลิปเงินเดือน

---

## 🎉 สรุป

ระบบคำนวณค่าจ้างพร้อมใช้งานแล้ว! มีฟีเจอร์ครบถ้วนตามที่ต้องการ:

✅ คำนวณค่าจ้างอัตโนมัติเมื่อ import
✅ รองรับ OT 3 ระดับ (×1.5, ×2, ×3)
✅ เบี้ยขยัน 300 บาท (มาก่อน >= 5 นาที ทุกวัน)
✅ ประกันสังคมแบบ 2 งวด/เดือน (งวดที่ 2 หักส่วนต่าง)
✅ แสดงวันนำส่ง SSO
✅ ข้อมูลสะสม YTD (6 รายการ)
✅ Dashboard แบบ real-time
✅ Search & Pagination
✅ 2 Tabs (รายวัน + สรุปพนักงาน)
✅ หน้ารายละเอียดพนักงาน (Dashboard)

**Happy Coding! 🚀**
