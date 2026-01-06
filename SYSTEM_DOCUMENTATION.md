# ระบบจัดการเงินเดือนและการทำงาน (OT Calculation System)

## ภาพรวมระบบ

ระบบนี้เป็นระบบจัดการเงินเดือนและการทำงานที่ครบครันสำหรับบริษัท ฟงซัน พริ้นติ้ง จำกัด โดยมีฟีเจอร์หลักในการคำนวณค่าจ้าง ล่วงเวลา ประกันสังคม ภาษี และการส่งออกเอกสารทางการเงินต่างๆ

## 🏗️ สถาปัตยกรรมระบบ

### เทคโนโลยีที่ใช้
- **Frontend**: Next.js 14 (React Framework)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Styling**: Tailwind CSS
- **Charts**: Chart.js/Recharts
- **PDF Generation**: html2canvas + jsPDF
- **UI Components**: Custom components with CSS-in-JS

## 📊 โครงสร้างฐานข้อมูล

### ตารางหลัก (Core Tables)

#### 1. `employees` - ข้อมูลพนักงาน
```sql
- employee_id: รหัสพนักงาน (UNIQUE)
- name: ชื่อพนักงาน
- department: แผนก
- perday_salary: ค่าจ้างรายวัน
- perhr_salary: ค่าจ้างรายชั่วโมง
- monthly_salary: เงินเดือน
- employment_type: ประเภทการจ้าง ('รายวัน'/'รายเดือน')
- status: สถานะ ('active'/'inactive')
- bank_id, bank_account: ข้อมูลธนาคาร
- tax_id, social_security: เลขประจำตัวผู้เสียภาษี/ประกันสังคม
```

#### 2. `daily_attendance` - ข้อมูลการเข้างานประจำวัน
```sql
- employee_id: รหัสพนักงาน
- work_date: วันที่ทำงาน
- check_in_time, check_out_time: เวลาเข้างาน/ออกงาน
- scheduled_in_time, scheduled_out_time: เวลาที่กำหนด
- actual_hours: ชั่วโมงที่ทำงานจริง
- ot_normal_hours, ot_special_hours, ot_premium_hours: ชั่วโมงล่วงเวลา
- is_holiday: เป็นวันหยุดหรือไม่
- late, late_hours: ข้อมูลการมาสาย
```

#### 3. `leave_records` - ข้อมูลการลา
```sql
- employee_id: รหัสพนักงาน
- leave_date: วันที่ลา
- leave_type: ประเภทการลา ('ลาป่วย', 'ลาพักร้อน', etc.)
- leave_hours: ชั่วโมงที่ลา
- status: สถานะ ('pending', 'approved', 'rejected')
- is_paid: เป็นการลาที่ได้ค่าจ้างหรือไม่
```

#### 4. `wage_adjustments` - การปรับเงินเดือน
```sql
- employee_id: รหัสพนักงาน
- year, month, period: งวดการจ่าย
- adjustment_type: ประเภท ('income'/'deduction')
- category: หมวดหมู่
- amount: จำนวนเงิน
- description: รายละเอียด
```

#### 5. `wage_summary` - สรุปรายได้ประจำงวด
```sql
- employee_id: รหัสพนักงาน
- year, month, period: งวดการจ่าย
- base_wage: ค่าจ้างปกติ
- ot_wage: ค่าล่วงเวลา
- attendance_bonus: เบี้ยขยัน
- total_income: รายได้รวม
- sso, tax: ค่าประกันสังคมและภาษี
- net_wage: เงินสุทธิ
```

### ตารางสนับสนุน (Supporting Tables)

#### 6. `special_holidays` - วันหยุดพิเศษ
```sql
- holiday_date: วันที่หยุด
- holiday_name: ชื่อวันหยุด
- is_national: เป็นวันหยุดราชการหรือไม่
```

#### 7. `morning_ot_allowances` - สิทธิ์ล่วงเวลาเช้า
```sql
- employee_id: รหัสพนักงาน
- year, month, period: งวด
- allowed_hours: ชั่วโมงที่อนุญาต
- selected_dates: วันที่ที่เลือกทำงาน
```

#### 8. `income_deduction_master` - รายการเพิ่ม/หักเริ่มต้น
```sql
- category: ประเภท ('income'/'deduction')
- item_name: ชื่อรายการ
- item_name_th: ชื่อไทย
- default_amount: จำนวนเริ่มต้น
- include_in_sso: รวมในฐานคำนวณประกันสังคมหรือไม่
```

#### 9. `wage_periods` - งวดการจ่ายเงินเดือน
```sql
- wage_month: เดือนที่จ่าย
- period_number: งวดที่ (1 หรือ 2)
- work_start_date, work_end_date: ช่วงวันที่ทำงาน
- payment_date: วันที่จ่ายเงิน
- is_closed: ปิดงวดแล้วหรือไม่
```

### ตารางเก่า/สำรอง (Legacy Tables)
- `attendance_checkin`, `daily_wages`, `period_wages` - ตารางเก่า
- `personal_data`, `personal_money`, `personal_tax`, `personal_work_detail` - ข้อมูลส่วนตัว
- `monthly_payroll`, `payroll_ytd` - ระบบเงินเดือนเก่า

## 🖥️ โครงสร้าง Frontend (Next.js App)

### โฟลเดอร์หลัก
```
app/                    # Next.js App Router
├── page.tsx           # หน้าแรก (Dashboard)
├── layout.tsx         # Layout หลัก
├── dashboard/         # แดชบอร์ด
├── employees/         # จัดการพนักงาน
├── wages/            # ดูเงินเดือน
├── export/           # ส่งออกเอกสาร
├── documents/        # เอกสาร
├── guide/            # คู่มือ
└── api/              # API Routes
```

### API Routes หลัก

#### `/api/employees`
- `GET`: ดึงข้อมูลพนักงานทั้งหมด
- `POST`: เพิ่มพนักงานใหม่

#### `/api/wages`
- `/calculate`: คำนวณเงินเดือน
- `/summary`: สรุปรายได้
- `/employee/[id]`: ข้อมูลเงินเดือนพนักงานคนเดียว

#### `/api/export`
- `/payslip`: สร้างข้อมูลสลิปเงินเดือน
- `/sso110`: สร้างข้อมูล SSO 1-10
- `/pnd1`: สร้างข้อมูล PND1
- `/pnd1kor`: สร้างข้อมูล PND1 Kor
- `/withholding-cert`: สร้างข้อมูล 50 ทวิ

#### `/api/attendance`
- `GET`: ดึงข้อมูลการเข้างาน
- `POST`: บันทึกการเข้างาน

## 🔧 Libraries และ Utilities

### `lib/wageCalculationsV2.ts` - ระบบคำนวณเงินเดือนหลัก
```typescript
export function calculatePeriodWageV2(
  employeeInfo: EmployeeInfoV2,
  dailyAttendances: DailyAttendanceV2[],
  leaveRecords: LeaveRecord[],
  wageAdjustments: WageAdjustment[],
  dateRange: { startDate: string, endDate: string },
  morningOTAllowance?: number,
  selectedDates?: any
): PeriodWageResult
```

ฟีเจอร์หลัก:
- คำนวณค่าจ้างปกติและล่วงเวลา
- คำนวณเบี้ยขยันและค่าแรงกะดึก
- จัดการการมาสายและการลา
- รวมการปรับเงินเดือน

### `lib/taxCalculations.ts` - ระบบคำนวณภาษี
```typescript
export function calculateEmployeeTax(
  currentPeriodIncome: number,
  ytdIncome: number,
  ytdTax: number,
  month: number,
  period: number,
  ytdSSO: number
): TaxCalculationResult
```

### `lib/lineConfig.ts` - การตั้งค่า LINE Integration
- การตั้งค่า Webhook
- การส่งข้อความอัตโนมัติ
- การจัดการ QR Code

### `utils/formatters.ts` - ฟอร์แมตข้อมูล
- `formatCurrency()`: จัดรูปแบบเงิน
- `formatDate()`: จัดรูปแบบวันที่
- `formatTime()`: จัดรูปแบบเวลา

## 📱 Components หลัก

### Dashboard Components
- `DashboardOverview`: ภาพรวมระบบ
- `AttendanceChart`: แผนภูมิการเข้างาน
- `WageSummaryChart`: แผนภูมิสรุปเงินเดือน

### Employee Management
- `EmployeeList`: รายชื่อพนักงาน
- `EmployeeForm`: ฟอร์มเพิ่ม/แก้ไขพนักงาน
- `EmployeeImport`: นำเข้าข้อมูลพนักงาน

### Wage Components
- `WageCalculator`: เครื่องคำนวณเงินเดือน
- `WageDetails`: รายละเอียดเงินเดือน
- `WageLogs`: ประวัติการคำนวณ

### Export Components
- `PayslipPreview`: แสดงตัวอย่างสลิปเงินเดือน
- `SSO110Preview`: แสดงตัวอย่าง SSO 1-10
- `PND1Preview`: แสดงตัวอย่าง PND1
- `WithholdingCertPreview`: แสดงตัวอย่าง 50 ทวิ

## 📋 ประเภทเอกสารที่ Export

### 1. สลิปเงินเดือน (Payslip)
- รายละเอียด: เงินเดือนปกติ + ล่วงเวลา + เบี้ยขยัน + หักภาษี/ประกันสังคม
- ความถี่: ทุกงวด (26/11-10/12, 11/12-25/12)
- ต้องการเลือกพนักงาน: ใช่

### 2. สปส. 1-10 (SSO Form)
- รายละเอียด: แบบส่งเงินสมทบประกันสังคม
- ความถี่: รายเดือน
- ต้องการเลือกพนักงาน: ไม่ใช่ (ทั้งบริษัท)

### 3. ภ.ง.ด.1 (PND1)
- รายละเอียด: แบบยื่นภาษีเงินได้หัก ณ ที่จ่าย รายเดือน
- ความถี่: รายเดือน
- ต้องการเลือกพนักงาน: ไม่ใช่ (ทั้งบริษัท)

### 4. ภ.ง.ด.1ก (PND1 Kor)
- รายละเอียด: แบบยื่นภาษีเงินได้หัก ณ ที่จ่าย รายปี
- ความถี่: รายปี
- ต้องการเลือกพนักงาน: ไม่ใช่ (ทั้งบริษัท)

### 5. 50 ทวิ (Withholding Certificate)
- รายละเอียด: หนังสือรับรองการหักภาษี ณ ที่จ่าย
- ความถี่: รายปี
- ต้องการเลือกพนักงาน: ใช่

## 🔄 Workflow การทำงาน

### 1. การจัดการพนักงาน
1. เพิ่ม/แก้ไขข้อมูลพนักงาน
2. ตั้งค่าอัตราเงินเดือน
3. จัดการข้อมูลธนาคารและภาษี

### 2. การบันทึกการเข้างาน
1. บันทึกเวลาเข้างาน/ออกงาน
2. คำนวณชั่วโมงทำงาน
3. จัดการการมาสายและการลา

### 3. การคำนวณเงินเดือน
1. คำนวณค่าจ้างปกติ
2. คำนวณล่วงเวลา (OT1, OT2, OT3)
3. คำนวณเบี้ยขยัน
4. คำนวณภาษีและประกันสังคม
5. รวมการปรับเงินเดือน

### 4. การส่งออกเอกสาร
1. เลือกประเภทเอกสาร
2. เลือกงวดเวลา
3. เลือกพนักงาน (ถ้าจำเป็น)
4. สร้าง PDF และดาวน์โหลด

## 🔐 ระบบรักษาความปลอดภัย

### Authentication
- ใช้ Supabase Auth
- JWT Token สำหรับ API access
- Role-based access control

### Data Validation
- Input validation ใน frontend
- Database constraints
- TypeScript type checking

## 📱 Integration กับแอปพลิเคชันภายนอก

### LINE Integration
- LINE OA สำหรับการแจ้งเตือน
- QR Code สำหรับเช็คชื่อ
- Webhook สำหรับรับข้อมูล

### Mobile App
- React Native app สำหรับพนักงาน
- เช็คชื่อผ่าน GPS
- ดูสลิปเงินเดือน

## 🔄 ระบบ Backup และ Recovery

### Database Backup
- อัตโนมัติ backup ทุกวัน
- เก็บข้อมูลย้อนหลัง 30 วัน

### Log System
- `wage_calculation_log`: บันทึกการคำนวณ
- `wage_adjustment_logs`: บันทึกการปรับเงินเดือน
- `auto_adjustment_logs`: บันทึกการปรับอัตโนมัติ

## 📈 การรายงานและวิเคราะห์

### Dashboard Reports
- สรุปการเข้างานทั้งบริษัท
- วิเคราะห์ค่าใช้จ่ายเงินเดือน
- ติดตามภาษีและประกันสังคม

### Export Reports
- รายงานภาษีรายเดือน/รายปี
- รายงานประกันสังคม
- รายงานเงินเดือนพนักงาน

## 🚀 การปรับปรุงและพัฒนา

### Version History
- v1.0: ระบบคำนวณเงินเดือนพื้นฐาน
- v2.0: เพิ่มระบบ export เอกสาร
- v2.1: เพิ่ม LINE integration
- v2.2: ปรับปรุง UI/UX

### Planned Features
- Machine Learning สำหรับพยากรณ์ค่าใช้จ่าย
- Mobile app สำหรับพนักงาน
- Integration กับระบบ ERP

## 👥 ผู้ใช้งานระบบ

### HR Admin
- จัดการข้อมูลพนักงาน
- คำนวณและอนุมัติเงินเดือน
- ส่งออกเอกสารทางการเงิน

### พนักงาน
- ดูข้อมูลส่วนตัว
- เช็คชื่อเข้างาน
- ดูสลิปเงินเดือน

### ผู้บริหาร
- ดูรายงานสรุป
- ติดตามค่าใช้จ่าย
- วางแผนงบประมาณ

---

**หมายเหตุ**: ระบบนี้ได้รับการพัฒนาให้รองรับการใช้งานในองค์กรขนาดกลางถึงใหญ่ โดยคำนึงถึงความถูกต้องของการคำนวณและความปลอดภัยของข้อมูล
