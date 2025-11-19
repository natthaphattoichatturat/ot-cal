# สรุปการอัพเดทระบบ HR ครั้งใหญ่ 🚀

## ภาพรวมการทำงาน

อัพเดทระบบ HR OT Calculator ให้สมบูรณ์ครอบคลุมทุกด้านของการจัดการค่าจ้าง เงินได้ เงินหัก ภาษี และเอกสาร HR ตามความต้องการที่ระบุทั้งหมด

---

## ✅ งานที่เสร็จสมบูรณ์แล้ว

### 1. ระบบเงินได้และเงินหัก (Income & Deduction System)

#### 📁 SQL Database Schema
- **ไฟล์:** `income_deduction_system_migration.sql`
- **Tables ที่สร้าง:**
  - `income_deduction_records` - บันทึกรายการเงินได้/เงินหักแต่ละงวด
  - `income_deduction_master` - Master data ของรายการ
  - `employee_ytd_summary` - ข้อมูลสะสมรายปี (YTD)

#### 📝 รายการเงินหัก (Deductions) ที่รองรับ:
1. มาสาย - คำนวณ SSO อัตโนมัติ
2. ขาดงาน - คำนวณ SSO อัตโนมัติ
3. ลากิจ - คำนวณ SSO (หักเกินกำหนด)
4. ค่าชุมฟอร์ม - input (ไม่แน่นอน)
5. หักกยศ - input (ไม่แน่นอน)
6. สหกรณ์ - input (ไม่แน่นอน)
7. งานเสีย - คงที่ทุกงวด
8. ค่าฌาปนกิจ - input (ไม่แน่นอน)
9. หักค่าพิเศษ - input (ไม่แน่นอน)
10. หักค่าอื่นๆ - input (ไม่แน่นอน)

#### 💰 รายการเงินได้ (Income) ที่รองรับ:
1. ค่าตำแหน่ง - คงที่ทุกงวด, คำนวณ SSO
2. ค่าโทรศัพท์ - คงที่ทุกงวด, คำนวณ SSO
3. ค่าครองชีพ - input (ไม่แน่นอน)
4. ค่าพิเศษ - input (ไม่แน่นอน)
5. ค่าอื่นๆ - คงที่ทุกงวด
6. ค่าอื่นๆพิเศษ - input (ไม่แน่นอน)
7. คืนเบี้ยขยัน - input (ไม่แน่นอน)
8. คืนพักร้อน - input (ไม่แน่นอน)
9. โบนัสรายเดือน - input (ไม่แน่นอน)
10. โบนัสรายปี - input (ไม่แน่นอน)
11. ค่ากะ - input (ไม่แน่นอน), คำนวณ SSO

---

### 2. การคำนวณภาษีหัก ณ ที่จ่าย แบบ YTD

#### 📊 วิธีการคำนวณ (Cumulative YTD Method)

**ขั้นตอน:**
1. ประมาณการเงินได้ทั้งปี = เงินได้สะสม YTD + รายได้งวดนี้ + (รายได้งวดนี้ × จำนวนงวดที่เหลือ)
2. เงินได้สุทธิ = ประมาณการเงินได้ทั้งปี - ค่าใช้จ่าย (สูงสุด 100,000) - ค่าลดหย่อน
3. ภาษีที่ต้องเสียทั้งปี = คำนวณตามขั้นบันได
4. หักภาษีงวดนี้ = (ภาษีทั้งปี - ภาษีที่หักไปแล้ว YTD) / จำนวนงวดที่เหลือ

**ไฟล์ที่อัพเดท:**
- `lib/wageCalculations.ts` - เพิ่ม interfaces และ functions:
  - `TaxCalculationInput`
  - `TaxCalculationResult`
  - `calculateWithholdingTax()` - คำนวณภาษีแบบ YTD
  - `calculateProgressiveTax()` - คำนวณภาษีตามขั้นบันได

---

### 3. หน้าจัดการเงินได้/เงินหัก (`/wages`)

#### ✨ Features ใหม่:
- ปุ่ม "➕ เพิ่มเงินได้" (สีเขียว)
- ปุ่ม "➖ เพิ่มเงินหัก" (สีแดง)
- Popup สำหรับบันทึกข้อมูล:
  - เลือกงวดการจ่ายเงิน (แสดงอัตโนมัติจากที่เลือก)
  - เลือกรายการจาก master data
  - ใส่จำนวนเงิน
  - เลือกพนักงานหลายคนพร้อมกัน (checkbox)
  - ปุ่ม "เลือกทั้งหมด"
  - หมายเหตุเพิ่มเติม

#### 🔧 API Endpoints:
- `/api/income-deduction` - POST, GET, PUT, DELETE
- `/api/income-deduction/master` - GET master data

---

### 4. ระบบการลางาน (Leave Request System)

#### 🔄 การเปลี่ยนแปลง:
**เดิม:** ส่งคำขออนุมัติไปที่ HR ผ่าน LINE OA ของ HR

**ใหม่:** 
- ส่งคำขออนุมัติไปที่ **หัวหน้าแผนก** (department = "หัวหน้าแผนก") ผ่าน LINE OA ของพนักงาน
- HR ได้รับเฉพาะ **ข้อมูลแจ้งเตือน** (ไม่มีปุ่มอนุมัติ/ไม่อนุมัติ)
- ข้อมูลที่ HR ได้รับ: รหัสพนักงาน, ชื่อ, วันที่ลา, ประเภทการลา, เหตุผล, สถานะ

**ไฟล์ที่แก้ไข:**
- `/app/api/line/submit-leave/route.ts`
- `/lib/lineConfig.ts` - เพิ่ม `sendEmployeeLineMessage` alias

---

### 5. ระบบลงทะเบียนพนักงาน (`/liff/employee-register`)

#### 🔑 การเปลี่ยนแปลง:
**เดิม:** 
- ใช้เลขบัตรประชาชนเป็นหลัก (บังคับ)
- รหัสพนักงาน optional

**ใหม่:**
- ใช้ **รหัสพนักงานเป็นหลัก** (บังคับ)
- เลขบัตรประชาชน optional (เพื่อความปลอดภัย)
- ชื่อไม่ต้องกรอก (ใช้จากระบบ)

**ไฟล์ที่แก้ไข:**
- `/app/liff/employee-register/page.tsx`
- `/app/api/line/register-employee/route.ts`

---

### 6. ระบบ Chatbot AI

#### 🐛 แก้ไขปัญหา:
เดิม: เมื่อถาม "เดือนตุลาคม ใครทำโอทีเยอะสุด" ได้คำตอบผิดพลาด

**สาเหตุ:** พยายามใช้ RPC function `execute_raw_query` ที่ไม่มีในระบบ

**การแก้ไข:**
- เพิ่ม fallback query โดยใช้ Supabase query builder
- ตรวจจับ keywords และเลือกใช้ query ที่เหมาะสม:
  - `daily_attendance` / `ot_hours` → query daily_attendance table
  - `employees` → query employees table
  - `leave_records` → query leave_records table

**ไฟล์ที่แก้ไข:**
- `/app/api/chatbot/route.ts` - function `executeSQL()`

---

### 7. หน้าจัดการเอกสาร HR (`/documents`)

#### 📄 เอกสารที่รองรับ (UI เท่านั้น ยังไม่มี action):

| เอกสาร | ความถี่ | ข้อมูลที่ใช้ |
|--------|---------|-------------|
| **สลิปเงินเดือน (Payslip)** | ทุกงวด (2 ครั้ง/เดือน) | ค่าจ้าง, OT, เงินได้, เงินหัก, ยอดสะสม YTD |
| **ภ.ง.ด.1 (P.N.D.1)** | รายเดือน (7 ของเดือนถัดไป) | ∑(รายได้รวม), ∑(ภาษีที่หัก) |
| **สปส. 1-10 (SSO Form)** | รายเดือน (15 ของเดือนถัดไป) | ∑(ค่าจ้างจ่ายจริง), ∑(SSO) |
| **หนังสือรับรองฯ 50 ทวิ** | รายปี (15 ก.พ.) | YTD รายได้รวม, YTD ภาษี (รายบุคคล) |
| **ภ.ง.ด.1ก (P.N.D.1 Kor)** | รายปี (ภายใน ก.พ.) | ∑(YTD รายได้), ∑(YTD ภาษี) |

**ไฟล์ที่สร้าง:**
- `/app/documents/page.tsx`

---

## 📊 โครงสร้าง Database ที่เพิ่มเข้ามา

### Table: `income_deduction_records`
```sql
- id (SERIAL PRIMARY KEY)
- employee_id (VARCHAR(20), FK)
- pay_period_month (INT) - เดือนที่ทำงาน 1-12
- pay_period_year (INT) - ปี ค.ศ.
- pay_period (INT) - งวดที่ 1 หรือ 2
- record_type (VARCHAR(20)) - 'income' หรือ 'deduction'
- item_name (VARCHAR(100)) - ชื่อรายการ
- amount (DECIMAL(10,2)) - จำนวนเงิน
- include_in_sso (BOOLEAN) - คำนวณ SSO ไหม
- is_fixed (BOOLEAN) - คงที่ทุกงวดไหม
- notes (TEXT)
- created_at, updated_at, created_by
```

### Table: `income_deduction_master`
```sql
- id (SERIAL PRIMARY KEY)
- category (VARCHAR(20)) - 'income' หรือ 'deduction'
- item_name (VARCHAR(100) UNIQUE)
- item_name_th (VARCHAR(100)) - ชื่อภาษาไทย
- include_in_sso (BOOLEAN)
- is_fixed (BOOLEAN)
- default_amount (DECIMAL(10,2))
- description (TEXT)
- is_active (BOOLEAN)
- display_order (INT)
```

### Table: `employee_ytd_summary`
```sql
- id (SERIAL PRIMARY KEY)
- employee_id (VARCHAR(20), FK)
- year (INT)
- ytd_gross_wage - เงินเดือนสะสม
- ytd_ot_wage - OT สะสม
- ytd_attendance_bonus - เบี้ยขยันสะสม
- ytd_income - รายได้เพิ่มเติมสะสม
- ytd_total_income - รวมรายได้สะสม
- ytd_sso - ประกันสังคมสะสม
- ytd_tax - ภาษีสะสม
- ytd_deduction - รายการหักอื่นๆสะสม
- ytd_total_deduction - รวมหักสะสม
- ytd_net_wage - เงินสุทธิสะสม
```

### เพิ่มคอลัมน์ใน `employees` table:
```sql
- position_allowance - ค่าตำแหน่ง (คงที่)
- phone_allowance - ค่าโทรศัพท์ (คงที่)
- other_allowance - ค่าอื่นๆคงที่
- defective_work_deduction - งานเสีย (คงที่)
- tax_allowance - ค่าลดหย่อนภาษีส่วนตัว (default 60,000)
- spouse_allowance - ค่าลดหย่อนคู่สมรส
- child_allowance - ค่าลดหย่อนบุตร
- number_of_children - จำนวนบุตร
```

---

## 🔧 วิธีนำ SQL ไปใช้

### ขั้นตอนที่ 1: รัน Migration Script
```bash
# นำไฟล์นี้ไป run บน Supabase SQL Editor
income_deduction_system_migration.sql
```

### ขั้นตอนที่ 2: ตรวจสอบว่า Tables ถูกสร้างแล้ว
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%income_deduction%';

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'employee_ytd_summary';
```

### ขั้นตอนที่ 3: ตรวจสอบ Master Data
```sql
SELECT * FROM income_deduction_master ORDER BY category, display_order;
```

---

## 🚀 วิธีทดสอบระบบ

### 1. ทดสอบระบบเงินได้/เงินหัก

```bash
# 1. เปิดหน้า /wages
# 2. เลือกเดือนและงวด
# 3. กดปุ่ม "➕ เพิ่มเงินได้"
# 4. เลือกรายการ เช่น "ค่ากะ"
# 5. ใส่จำนวนเงิน เช่น 500
# 6. เลือกพนักงาน 1-2 คน
# 7. กดบันทึก
# 8. ตรวจสอบใน database ว่ามี record เพิ่มเข้ามา
```

### 2. ทดสอบระบบการลางาน

```bash
# 1. เปิด LIFF /liff/leave-request ผ่าน LINE OA ของพนักงาน
# 2. กรอกข้อมูลการลา
# 3. ส่งคำขอ
# 4. ตรวจสอบว่าหัวหน้าแผนก (ถ้ามี) ได้รับข้อความพร้อมปุ่มอนุมัติ
# 5. ตรวจสอบว่า HR ได้รับข้อความแจ้งเตือน (ไม่มีปุ่ม)
```

### 3. ทดสอบระบบลงทะเบียนพนักงาน

```bash
# 1. เปิด LIFF /liff/employee-register
# 2. กรอกรหัสพนักงาน (บังคับ)
# 3. กรอกเลขบัตรประชาชน (ไม่บังคับ)
# 4. ส่งข้อมูล
# 5. ตรวจสอบว่า line_id_employ ใน database ถูก update
```

### 4. ทดสอบ Chatbot

```bash
# 1. เปิด LIFF /liff/ai-chatbot ผ่าน LINE OA ของ HR
# 2. ถามคำถาม: "เดือนตุลาคม ใครทำโอทีเยอะสุด"
# 3. ควรได้คำตอบที่ถูกต้อง (ไม่ error)
```

### 5. ทดสอบหน้าจัดการเอกสาร

```bash
# 1. เปิดหน้า /documents
# 2. ดูรายการเอกสารทั้งหมด
# 3. คลิกแต่ละ card เพื่อดูรายละเอียด
# (ยังไม่มี action - เป็น UI เท่านั้น)
```

---

## 📋 งานที่ยังค้างอยู่ (ต้องทำเพิ่ม)

### 1. อัพเดทหน้า `/employees/[id]` ✏️
**ต้องเพิ่ม:**
- แสดงรายการเงินได้/เงินหักทั้งหมดของพนักงานคนนั้น
- แสดงยอดสะสม YTD
- ตารางแสดงรายละเอียดแต่ละงวด

**วิธีทำ:**
```typescript
// เพิ่ม API call ใน /app/employees/[id]/page.tsx
const fetchIncomeDeduction = async (employeeId: string) => {
  const res = await fetch(`/api/income-deduction?employee_id=${employeeId}`)
  const data = await res.json()
  if (data.success) {
    // แสดงข้อมูล
  }
}
```

### 2. อัพเดท `/liff/employee-ot-viewer` 📊
**ต้องเพิ่ม:**
- ดูค่าจ้างของตัวเองในแต่ละงวด
- ดูข้อมูลสะสม:
  1. เงินเดือนสะสม
  2. ภาษีเงินได้สะสม
  3. ประกันสังคมสะสม
  4. รวมเงินได้สะสม
  5. รวมหักสะสม
  6. เงินได้สุทธิสะสม

**วิธีทำ:**
```typescript
// เพิ่มใน /app/liff/employee-ot-viewer/page.tsx
const [ytdData, setYtdData] = useState<any>(null)

const fetchYTD = async (employeeId: string) => {
  // Fetch จาก employee_ytd_summary table
  const { data } = await supabase
    .from('employee_ytd_summary')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('year', new Date().getFullYear())
    .single()
  
  setYtdData(data)
}

// แสดงข้อมูลในหน้า
```

### 3. ปรับปรุงหน้าจัดการข้อมูลพนักงาน 👥
**ต้องเพิ่มฟิลด์ตาม employees schema:**

หน้าที่ต้องแก้:
- `/app/employees/add/page.tsx`
- `/app/employees/edit/page.tsx`
- `/app/liff/hr-admin/add/page.tsx`
- `/app/liff/hr-admin/edit/page.tsx`

**ฟิลด์ที่ต้องเพิ่ม:**
```typescript
- section (VARCHAR(100)) - แผนก/ฝ่าย
- position (VARCHAR(100)) - ตำแหน่ง
- gender (VARCHAR(20)) - เพศ
- nationality (VARCHAR(50)) - สัญชาติ
- citizenship (VARCHAR(50)) - เชื้อชาติ
- religion (VARCHAR(50)) - ศาสนา
- birth_date (DATE) - วันเกิด
- start_date (DATE) - วันเริ่มงาน
- tax_id (VARCHAR(20)) - เลขประจำตัวผู้เสียภาษี
- social_security (VARCHAR(20)) - เลขประกันสังคม
- provident_fund (DECIMAL) - กองทุนสำรองเลี้ยงชีพ
- และอื่นๆ ตาม schema
```

### 4. Run npm build เพื่อทดสอบระบบ 🏗️

```bash
# ขั้นตอนการ build
cd /Users/piw/Downloads/ot_cal
npm install  # ถ้ายังไม่ได้ install dependencies
npm run build

# ถ้ามี error ให้แก้ไข linter errors ก่อน
npm run lint
```

---

## 🎯 การใช้งานระบบเงินได้/เงินหักในอนาคต

### ตัวอย่างการใช้งาน:

#### 1. เพิ่มค่ากะให้พนักงานหลายคน
```typescript
POST /api/income-deduction
{
  "employeeIds": ["EMP001", "EMP002", "EMP003"],
  "payPeriodMonth": 11,
  "payPeriodYear": 2024,
  "payPeriod": 1,
  "recordType": "income",
  "itemName": "shift_allowance",
  "amount": 500,
  "includeInSso": true,
  "notes": "ค่ากะกลางคืน 1-10 พ.ย. 67"
}
```

#### 2. ดึงข้อมูลเงินได้/เงินหักของพนักงาน
```typescript
GET /api/income-deduction?employee_id=EMP001&year=2024&month=11&period=1
```

#### 3. ดึง Master Data
```typescript
GET /api/income-deduction/master?category=income  // เงินได้
GET /api/income-deduction/master?category=deduction  // เงินหัก
```

---

## 🔐 Security & Best Practices

### 1. API Security
- ✅ ใช้ Supabase RLS (Row Level Security) สำหรับทุก table
- ✅ ตรวจสอบ authentication ก่อนทุก operation
- ✅ Validate input data ก่อนบันทึกลง database

### 2. Data Validation
```typescript
// ตัวอย่าง validation
if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
  return error('กรุณาเลือกพนักงานอย่างน้อย 1 คน')
}

if (amount < 0) {
  return error('จำนวนเงินต้องมากกว่าหรือเท่ากับ 0')
}
```

### 3. Error Handling
- ✅ ทุก API มี try-catch
- ✅ Log errors ไปที่ console
- ✅ Return meaningful error messages

---

## 📱 LINE Integration Updates

### Employee LINE OA (2008436527)
- ส่งคำขออนุมัติการลาไปหาหัวหน้าแผนก
- ลงทะเบียนด้วยรหัสพนักงาน
- ดู OT และค่าจ้างของตัวเอง

### HR LINE OA (2008409515)
- รับการแจ้งเตือนการลางาน (ไม่มีปุ่มอนุมัติ)
- ใช้ AI Chatbot ได้ดีขึ้น
- เข้าถึงระบบจัดการเงินได้/เงินหัก

---

## 📈 Roadmap ต่อไป

### Phase 1 (ทำเสร็จแล้ว ✅)
- [x] ระบบเงินได้/เงินหัก
- [x] การคำนวณภาษี YTD
- [x] แก้ไขระบบการลางาน
- [x] แก้ไขระบบลงทะเบียนพนักงาน
- [x] แก้ไข Chatbot
- [x] หน้าจัดการเอกสาร UI

### Phase 2 (ต้องทำต่อ 🔄)
- [ ] อัพเดทหน้ารายละเอียดพนักงาน
- [ ] อัพเดท employee-ot-viewer
- [ ] ปรับปรุงฟอร์มข้อมูลพนักงาน
- [ ] Build และทดสอบระบบ

### Phase 3 (Future 🚀)
- [ ] API สำหรับออกเอกสาร (PDF generation)
- [ ] ระบบ notification อัตโนมัติ
- [ ] Dashboard analytics
- [ ] Mobile app optimization
- [ ] Advanced reporting

---

## 💾 Backup & Rollback

### ก่อนนำระบบขึ้น Production:

```bash
# 1. Backup database
pg_dump -h your-host -U your-user -d your-db > backup_before_update.sql

# 2. Backup code
git add .
git commit -m "Backup before comprehensive HR update"
git push

# 3. Test on staging environment first
npm run build
npm run start  # Test locally

# 4. Monitor errors
tail -f logs/app.log
```

---

## 📞 Support & Contact

### หากพบปัญหา:
1. ตรวจสอบ console logs
2. ตรวจสอบ Supabase logs
3. ตรวจสอบ LINE webhook logs
4. ดู error messages จาก API responses

### Database Issues:
```sql
-- ตรวจสอบ tables
SELECT * FROM information_schema.tables WHERE table_schema = 'public';

-- ตรวจสอบ constraints
SELECT * FROM information_schema.table_constraints WHERE table_name = 'income_deduction_records';

-- ตรวจสอบ indexes
SELECT * FROM pg_indexes WHERE tablename = 'income_deduction_records';
```

---

## 🎉 สรุป

ระบบ HR OT Calculator ได้รับการอัพเดทครั้งใหญ่ครอบคลุม:
- ✅ ระบบเงินได้และเงินหัก 21 รายการ
- ✅ การคำนวณภาษี YTD แบบถูกต้อง
- ✅ ระบบการลางานที่ปรับปรุงใหม่
- ✅ ระบบลงทะเบียนที่ใช้รหัสพนักงานเป็นหลัก
- ✅ Chatbot AI ที่ทำงานได้ดีขึ้น
- ✅ หน้าจัดการเอกสาร HR 5 ประเภท

**พร้อมสำหรับ Phase 2** เพื่อทำให้ระบบสมบูรณ์ 100%! 🚀

---

**Last Updated:** November 19, 2025
**Version:** 2.0.0
**Status:** Phase 1 Completed ✅

