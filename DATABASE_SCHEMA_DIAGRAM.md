# Database Schema Diagram - ระบบคำนวณค่าจ้าง

## 📊 ภาพรวมความสัมพันธ์ของ Tables

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        WAGE CALCULATION SYSTEM                               │
│                      ระบบคำนวณค่าจ้างและประกันสังคม                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   employees      │ ─────┐
│──────────────────│      │
│ employee_id (PK) │      │
│ name             │      │
│ department       │      │
│ perhr_salary     │ ─┐   │
│ perday_salary    │  │   │
└──────────────────┘  │   │
                      │   │
                      │   │
         ┌────────────┼───┼──────────────────┐
         │            │   │                  │
         ▼            ▼   ▼                  ▼
┌──────────────────────────────┐    ┌─────────────────────────┐
│   daily_attendance           │    │   wage_periods          │
│──────────────────────────────│    │─────────────────────────│
│ id (PK)                      │    │ id (PK)                 │
│ employee_id (FK) ────────────┼───►│ wage_month              │
│ work_date                    │    │ period_number (1 or 2)  │
│ actual_hours                 │    │ work_start_date         │
│ ot_normal_hours   (×1.5)     │    │ work_end_date           │
│ ot_special_hours  (×2)       │    │ payment_date            │
│ ot_premium_hours  (×3)       │    │ sso_due_date            │
│ check_in_time                │    └─────────────────────────┘
│ check_out_time               │              │
│ scheduled_in_time            │              │
│ is_holiday, is_leave         │              │
└──────────────────────────────┘              │
         │                                    │
         │                                    │
         └────────────┬───────────────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │   daily_wages              │ ◄────────┐
         │────────────────────────────│          │
         │ id (PK)                    │          │
         │ employee_id (FK)           │          │
         │ work_date                  │          │
         │ wage_period_id (FK)        │          │
         │                            │          │
         │ -- ข้อมูลชั่วโมง --         │          │
         │ actual_hours               │          │
         │ ot_normal_hours            │          │
         │ ot_special_hours           │          │
         │ ot_premium_hours           │          │
         │                            │          │
         │ -- ค่าจ้างที่คำนวณ --       │          │
         │ base_wage                  │  คำนวณ   │
         │ ot1_wage                   │  โดย     │
         │ ot2_wage                   │  Trigger │
         │ ot3_wage                   │  อัตโนมัติ│
         │ daily_total_wage           │          │
         └────────────────────────────┘          │
                      │                          │
                      │                          │
                      ▼                          │
         ┌────────────────────────────┐          │
         │ attendance_punctuality     │          │
         │────────────────────────────│          │
         │ id (PK)                    │          │
         │ employee_id (FK)           │          │
         │ work_date                  │          │
         │ wage_period_id (FK)        │          │
         │ early_minutes              │  ตรวจสอบ  │
         │ is_punctual (>= 5 นาที)    │  เบี้ยขยัน │
         └────────────────────────────┘          │
                      │                          │
                      │                          │
                      └──────────┬───────────────┘
                                 │
                                 ▼
                ┌────────────────────────────────┐
                │   period_wages                 │
                │────────────────────────────────│
                │ id (PK)                        │
                │ employee_id (FK)               │
                │ wage_period_id (FK)            │
                │                                │
                │ -- สรุปค่าจ้าง --               │
                │ total_base_wage                │
                │ total_ot1_wage                 │
                │ total_ot2_wage                 │
                │ total_ot3_wage                 │
                │ gross_wage                     │
                │                                │
                │ -- เบี้ยขยัน --                 │
                │ attendance_bonus (300 บาท)     │
                │ eligible_for_bonus             │
                │                                │
                │ -- รวมรายได้ --                 │
                │ total_income                   │
                │                                │
                │ -- หักรายจ่าย --                │
                │ sso_employee                   │
                │ tax_withholding                │
                │ total_deductions               │
                │                                │
                │ -- เงินสุทธิ --                 │
                │ net_wage                       │
                └────────────────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
    ┌──────────────────────┐  ┌────────────────────────┐  ┌───────────────────────────┐
    │ sso_monthly_summary  │  │  tax_calculations      │  │ employee_wage_summary_ytd │
    │──────────────────────│  │────────────────────────│  │───────────────────────────│
    │ id (PK)              │  │ id (PK)                │  │ id (PK)                   │
    │ employee_id (FK)     │  │ employee_id (FK)       │  │ employee_id (FK)          │
    │ wage_month           │  │ wage_period_id (FK)    │  │ year                      │
    │                      │  │                        │  │                           │
    │ -- รายได้ 2 งวด --   │  │ gross_income           │  │ ytd_gross_wage            │
    │ period1_income       │  │ taxable_income         │  │ ytd_attendance_bonus      │
    │ period2_income       │  │ tax_amount             │  │ ytd_total_income          │
    │ total_monthly_income │  │ tax_rate               │  │                           │
    │                      │  │                        │  │ ytd_sso                   │
    │ -- ฐานและอัตรา --    │  │ ytd_income             │  │ ytd_tax                   │
    │ sso_base (≤15,000)   │  │ ytd_tax                │  │ ytd_total_deductions      │
    │ sso_rate (5%)        │  │                        │  │                           │
    │                      │  │ personal_allowance     │  │ ytd_net_wage              │
    │ -- SSO แต่ละงวด --   │  │ sso_deduction          │  │                           │
    │ period1_sso          │  │ other_allowances       │  │ total_periods_paid        │
    │ period2_sso          │  │ total_allowances       │  │ total_days_worked         │
    │ total_monthly_sso    │  └────────────────────────┘  │ total_ot_hours            │
    │   (≤750 บาท)         │                              └───────────────────────────┘
    │                      │
    │ employer_sso         │
    │ sso_due_date         │
    └──────────────────────┘
```

---

## 🔗 ความสัมพันธ์ระหว่าง Tables

### 1. **employees** ←→ **daily_attendance**
- **Relationship**: 1:N (One-to-Many)
- พนักงาน 1 คน มีการเข้างานได้หลายวัน
- `employees.employee_id` = `daily_attendance.employee_id`

### 2. **daily_attendance** → **daily_wages**
- **Relationship**: 1:1 (One-to-One)
- การเข้างานแต่ละวันจะถูกคำนวณเป็นค่าจ้าง 1 รายการ
- `daily_attendance.employee_id + work_date` = `daily_wages.employee_id + work_date`

### 3. **wage_periods** ←→ **daily_wages**
- **Relationship**: 1:N (One-to-Many)
- งวดจ่ายเงิน 1 งวด มีค่าจ้างรายวันหลายรายการ
- `wage_periods.id` = `daily_wages.wage_period_id`

### 4. **daily_wages** → **attendance_punctuality**
- **Relationship**: 1:1 (One-to-One)
- ค่าจ้างรายวันแต่ละวันมีการตรวจสอบเบี้ยขยัน 1 รายการ
- `daily_wages.employee_id + work_date` = `attendance_punctuality.employee_id + work_date`

### 5. **period_wages** ← **daily_wages** (Aggregated)
- **Relationship**: 1:N (สรุปจากหลายวัน)
- ค่าจ้างรายงวดเป็นผลรวมของค่าจ้างรายวันทั้งหมดในงวดนั้น
- `period_wages.employee_id + wage_period_id` ← SUM(`daily_wages` WHERE employee_id + wage_period_id)

### 6. **period_wages** → **sso_monthly_summary**
- **Relationship**: 2:1 (Two-to-One)
- ค่าจ้าง 2 งวดรวมกันเป็น SSO 1 เดือน
- `sso_monthly_summary.employee_id + wage_month` ← `period_wages` (งวดที่ 1 + งวดที่ 2)

### 7. **period_wages** → **tax_calculations**
- **Relationship**: 1:1 (One-to-One)
- ค่าจ้างแต่ละงวดมีการคำนวณภาษี 1 รายการ
- `period_wages.id` = `tax_calculations.wage_period_id`

### 8. **period_wages** → **employee_wage_summary_ytd** (Accumulated)
- **Relationship**: N:1 (Many-to-One)
- ค่าจ้างหลายงวดสะสมเป็น YTD 1 รายการต่อปี
- `employee_wage_summary_ytd.employee_id + year` ← SUM(`period_wages` WHERE year)

---

## 🎯 Data Flow (การไหลของข้อมูล)

```
1. พนักงานเข้างาน → บันทึกใน daily_attendance
                              ↓
2. ระบบคำนวณ OT → อัพเดท ot_normal_hours, ot_special_hours, ot_premium_hours
                              ↓
3. Trigger คำนวณค่าจ้าง → บันทึกใน daily_wages (อัตโนมัติ)
                              ↓
4. ตรวจสอบเวลาเข้างาน → บันทึกใน attendance_punctuality
                              ↓
5. สิ้นงวด → สรุปค่าจ้าง → บันทึกใน period_wages
                              ↓
6. คำนวณ SSO (2 งวด) → บันทึกใน sso_monthly_summary
                              ↓
7. คำนวณภาษี → บันทึกใน tax_calculations
                              ↓
8. อัพเดท YTD → บันทึกใน employee_wage_summary_ytd
```

---

## 📋 Table Details

### 🔹 wage_periods (งวดจ่ายเงิน)
**Purpose**: กำหนดรอบการจ่ายเงิน 2 งวด/เดือน

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary Key |
| `wage_month` | DATE | เดือนของค่าจ้าง (เช่น 2024-11-01 = พ.ย. 67) |
| `period_number` | INTEGER | งวดที่ 1 หรือ 2 |
| `work_start_date` | DATE | วันเริ่มทำงาน |
| `work_end_date` | DATE | วันสุดท้ายของการทำงาน |
| `payment_date` | DATE | วันจ่ายเงิน (งวดที่ 1 = 20, งวดที่ 2 = 4) |
| `sso_due_date` | DATE | วันครบกำหนดส่ง SSO (วันที่ 15 เดือนถัดไป) |
| `is_closed` | BOOLEAN | ปิดงวดแล้วหรือยัง |

**Key**: UNIQUE(`wage_month`, `period_number`)

---

### 🔹 daily_wages (ค่าจ้างรายวัน)
**Purpose**: คำนวณและเก็บค่าจ้างของพนักงานแต่ละวัน

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary Key |
| `employee_id` | VARCHAR(20) | FK → employees |
| `work_date` | DATE | วันที่ทำงาน |
| `wage_period_id` | INTEGER | FK → wage_periods |
| `actual_hours` | NUMERIC(5,2) | ชั่วโมงทำงานจริง |
| `ot_normal_hours` | NUMERIC(5,2) | OT ปกติ (×1.5 แล้ว) |
| `ot_special_hours` | NUMERIC(5,2) | OT พิเศษ (×2 แล้ว) |
| `ot_premium_hours` | NUMERIC(5,2) | OT ขั้นสูง (×3 แล้ว) |
| `perhr_salary` | NUMERIC(10,2) | อัตราค่าจ้างรายชั่วโมง |
| **`base_wage`** | NUMERIC(10,2) | **ค่าจ้างพื้นฐาน = 8 × perhr_salary** |
| **`ot1_wage`** | NUMERIC(10,2) | **ค่า OT ปกติ = ot_normal_hours × perhr_salary** |
| **`ot2_wage`** | NUMERIC(10,2) | **ค่า OT พิเศษ = ot_special_hours × perhr_salary** |
| **`ot3_wage`** | NUMERIC(10,2) | **ค่า OT ขั้นสูง = ot_premium_hours × perhr_salary** |
| **`daily_total_wage`** | NUMERIC(10,2) | **รวมค่าจ้างของวัน** |

**Key**: UNIQUE(`employee_id`, `work_date`)
**Trigger**: `calculate_daily_wage()` - คำนวณอัตโนมัติเมื่อ INSERT/UPDATE

---

### 🔹 attendance_punctuality (ตรวจสอบเบี้ยขยัน)
**Purpose**: ตรวจสอบว่าพนักงานเข้างานก่อนเวลา >= 5 นาที

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary Key |
| `employee_id` | VARCHAR(20) | FK → employees |
| `work_date` | DATE | วันที่ทำงาน |
| `wage_period_id` | INTEGER | FK → wage_periods |
| `scheduled_in_time` | TIME | เวลาเข้างานที่กำหนด |
| `check_in_time` | TIME | เวลาเข้างานจริง |
| `early_minutes` | INTEGER | จำนวนนาทีที่มาก่อนเวลา |
| **`is_punctual`** | BOOLEAN | **มาก่อนเวลา >= 5 นาที = TRUE** |

**Key**: UNIQUE(`employee_id`, `work_date`)

---

### 🔹 period_wages (สรุปค่าจ้างรายงวด)
**Purpose**: สรุปค่าจ้างทั้งงวดของพนักงานแต่ละคน

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary Key |
| `employee_id` | VARCHAR(20) | FK → employees |
| `wage_period_id` | INTEGER | FK → wage_periods |
| `total_base_wage` | NUMERIC(10,2) | รวมค่าจ้างพื้นฐาน |
| `total_ot1_wage` | NUMERIC(10,2) | รวมค่า OT ปกติ |
| `total_ot2_wage` | NUMERIC(10,2) | รวมค่า OT พิเศษ |
| `total_ot3_wage` | NUMERIC(10,2) | รวมค่า OT ขั้นสูง |
| **`gross_wage`** | NUMERIC(10,2) | **รวมค่าจ้างทั้งหมด (ไม่รวมเบี้ยขยัน)** |
| **`attendance_bonus`** | NUMERIC(10,2) | **เบี้ยขยัน 300 บาท (ถ้ามีสิทธิ์)** |
| `total_days_worked` | INTEGER | จำนวนวันทำงาน |
| `punctual_days` | INTEGER | จำนวนวันที่มาก่อนเวลา |
| `eligible_for_bonus` | BOOLEAN | มีสิทธิ์ได้เบี้ยขยันหรือไม่ |
| **`total_income`** | NUMERIC(10,2) | **รวมรายได้ = gross_wage + attendance_bonus** |
| `sso_employee` | NUMERIC(10,2) | ประกันสังคม (ส่วนพนักงาน) |
| `tax_withholding` | NUMERIC(10,2) | ภาษีหัก ณ ที่จ่าย |
| `total_deductions` | NUMERIC(10,2) | รวมหัก |
| **`net_wage`** | NUMERIC(10,2) | **เงินสุทธิที่ได้รับ** |

**Key**: UNIQUE(`employee_id`, `wage_period_id`)

---

### 🔹 sso_monthly_summary (ประกันสังคมรายเดือน)
**Purpose**: คำนวณ SSO แบบรายเดือน (รวม 2 งวด)

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary Key |
| `employee_id` | VARCHAR(20) | FK → employees |
| `wage_month` | DATE | เดือนของค่าจ้าง |
| `period1_income` | NUMERIC(10,2) | รายได้งวดที่ 1 |
| `period2_income` | NUMERIC(10,2) | รายได้งวดที่ 2 |
| `total_monthly_income` | NUMERIC(10,2) | รายได้รวมทั้งเดือน |
| **`sso_base`** | NUMERIC(10,2) | **ฐานคำนวณ = MIN(total_monthly_income, 15000)** |
| `sso_rate` | NUMERIC(5,4) | อัตรา 5% |
| **`period1_sso`** | NUMERIC(10,2) | **SSO งวดที่ 1 = MIN(period1_income × 5%, 750)** |
| **`period2_sso`** | NUMERIC(10,2) | **SSO งวดที่ 2 = total_monthly_sso - period1_sso** |
| **`total_monthly_sso`** | NUMERIC(10,2) | **รวม SSO ทั้งเดือน = sso_base × 5% (≤750)** |
| `employer_sso` | NUMERIC(10,2) | SSO ส่วนบริษัท |
| `sso_due_date` | DATE | วันครบกำหนดส่ง (วันที่ 15) |

**Key**: UNIQUE(`employee_id`, `wage_month`)

**สูตรสำคัญ**:
```
sso_base = MIN(period1_income + period2_income, 15000)
total_monthly_sso = MIN(sso_base × 0.05, 750)
period1_sso = MIN(period1_income × 0.05, 750)
period2_sso = total_monthly_sso - period1_sso
```

---

### 🔹 tax_calculations (ภาษีเงินได้)
**Purpose**: คำนวณภาษีหัก ณ ที่จ่าย

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary Key |
| `employee_id` | VARCHAR(20) | FK → employees |
| `wage_period_id` | INTEGER | FK → wage_periods |
| `gross_income` | NUMERIC(10,2) | รายได้รวม |
| `taxable_income` | NUMERIC(10,2) | รายได้หลังหักค่าลดหย่อน |
| `tax_amount` | NUMERIC(10,2) | ภาษีที่ต้องจ่าย |
| `ytd_income` | NUMERIC(10,2) | รายได้สะสม (YTD) |
| `ytd_tax` | NUMERIC(10,2) | ภาษีสะสม (YTD) |

**Key**: UNIQUE(`employee_id`, `wage_period_id`)

---

### 🔹 employee_wage_summary_ytd (สรุปสะสมรายปี)
**Purpose**: เก็บข้อมูลสะสมตั้งแต่ต้นปี

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary Key |
| `employee_id` | VARCHAR(20) | FK → employees |
| `year` | INTEGER | ปี ค.ศ. |
| **`ytd_gross_wage`** | NUMERIC(12,2) | **เงินเดือนสะสม** |
| `ytd_attendance_bonus` | NUMERIC(12,2) | เบี้ยขยันสะสม |
| **`ytd_total_income`** | NUMERIC(12,2) | **รวมรายได้สะสม** |
| **`ytd_sso`** | NUMERIC(12,2) | **ประกันสังคมสะสม** |
| **`ytd_tax`** | NUMERIC(12,2) | **ภาษีสะสม** |
| `ytd_total_deductions` | NUMERIC(12,2) | รวมหักสะสม |
| **`ytd_net_wage`** | NUMERIC(12,2) | **เงินสุทธิสะสม** |
| `total_periods_paid` | INTEGER | จำนวนงวดที่จ่ายแล้ว |
| `total_days_worked` | INTEGER | จำนวนวันทำงานทั้งหมด |
| `total_ot_hours` | NUMERIC(10,2) | รวม OT ทั้งหมด |

**Key**: UNIQUE(`employee_id`, `year`)

---

## 🚀 การใช้งานและ Query ตัวอย่าง

### 1. ดูค่าจ้างรายวันของพนักงาน
```sql
SELECT * FROM v_daily_wages_detail
WHERE employee_id = 'E001'
  AND work_date BETWEEN '2024-11-01' AND '2024-11-30'
ORDER BY work_date;
```

### 2. ดูค่าจ้างรายงวด
```sql
SELECT * FROM v_period_wages_detail
WHERE wage_month = '2024-11-01'
  AND period_number = 1;
```

### 3. ดูประกันสังคมรายเดือน
```sql
SELECT
  employee_id,
  wage_month,
  period1_income,
  period2_income,
  total_monthly_income,
  sso_base,
  period1_sso,
  period2_sso,
  total_monthly_sso,
  sso_due_date
FROM sso_monthly_summary
WHERE wage_month = '2024-11-01';
```

### 4. ดูข้อมูลสะสมรายปี
```sql
SELECT * FROM employee_wage_summary_ytd
WHERE employee_id = 'E001'
  AND year = 2024;
```

---

## ✨ Features พิเศษ

### 1. **Automatic Calculation Trigger**
ระบบจะคำนวณค่าจ้างอัตโนมัติเมื่อมีการเพิ่มหรือแก้ไขข้อมูลใน `daily_wages`

### 2. **SSO Calculation Logic**
รองรับการคำนวณ SSO แบบ 2 งวด/เดือน ตามกฎหมาย:
- งวดที่ 1: หักตามรายได้งวดนั้น
- งวดที่ 2: หักส่วนต่างให้ครบตามรายได้ทั้งเดือน (ไม่เกิน 750 บาท)

### 3. **Attendance Bonus Logic**
เบี้ยขยัน 300 บาท จะได้ก็ต่อเมื่อ:
- เข้างานก่อนเวลา >= 5 นาที
- **ทุกวัน** ในงวดนั้น (ไม่นับวันหยุดและวันลา)

### 4. **YTD Auto-Update**
ระบบจะอัพเดทข้อมูลสะสมรายปีอัตโนมัติเมื่อปิดงวด

---

## 📝 หมายเหตุ

1. **การปิดงวด**: เมื่อปิดงวดแล้ว ควรตั้ง `wage_periods.is_closed = TRUE` เพื่อป้องกันการแก้ไข
2. **วันนำส่ง SSO**: ระบบจะคำนวณวันที่ 15 ของเดือนถัดไปจากเดือนของค่าจ้างอัตโนมัติ
3. **ข้อมูล YTD**: ควรอัพเดทหลังจากปิดงวดทุกครั้ง
4. **Backup**: แนะนำให้ทำ backup database ก่อนรัน migration

---

สร้างโดย: Claude AI
วันที่: 18 พฤศจิกายน 2567
เวอร์ชั่น: 1.0
