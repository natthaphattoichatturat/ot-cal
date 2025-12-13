# 💰 ระบบคำนวณค่าจ้าง - คู่มือฉบับสมบูรณ์

## 📋 สารบัญ
1. [ภาพรวมระบบ](#1-ภาพรวมระบบ)
2. [ขั้นตอนที่ 1: Import และ Parse ไฟล์](#2-ขั้นตอนที่-1-import-และ-parse-ไฟล์)
3. [ขั้นตอนที่ 2: คำนวณ OT Hours](#3-ขั้นตอนที่-2-คำนวณ-ot-hours)
4. [ขั้นตอนที่ 3: คำนวณค่าจ้างอัตโนมัติ](#4-ขั้นตอนที่-3-คำนวณค่าจ้างอัตโนมัติ)
5. [ขั้นตอนที่ 4: แสดงผลข้อมูล](#5-ขั้นตอนที่-4-แสดงผลข้อมูล)
6. [สูตรคำนวณทั้งหมด](#6-สูตรคำนวณทั้งหมด)
7. [ไฟล์และ Functions สำคัญ](#7-ไฟล์และ-functions-สำคัญ)

---

## 1. ภาพรวมระบบ

### 1.1 จุดเริ่มต้น: หน้าหลัก
**ไฟล์:** `/app/page.tsx`  
**บรรทัด:** 1-525

#### UI Components:
- **บรรทัด 354-367:** ปุ่ม Upload ไฟล์
```tsx
<input 
  type="file" 
  accept=".txt" 
  onChange={(e) => setImportFile(e.target.files?.[0])}
/>
<button onClick={handleImport}>นำเข้าข้อมูล</button>
```

- **บรรทัด 192-226:** Function `handleImport()` - จัดการการ import
```tsx
const handleImport = async () => {
  const formData = new FormData()
  formData.append('file', importFile)
  
  const response = await fetch('/api/import-scans', {
    method: 'POST',
    body: formData
  })
  
  const result = await response.json()
  
  // แสดงข้อความสำเร็จ + จำนวนค่าจ้างที่คำนวณอัตโนมัติ
  if (result.wagesCalculated > 0) {
    message += `\n💰 คำนวณค่าจ้างอัตโนมัติ: ${result.wagesCalculated} รายการ`
  }
}
```

### 1.2 Flow ทั้งหมด
```
User Upload .txt → Import API → Parse File → Calculate OT → Store to daily_attendance
                                                                ↓
                                                   Auto Trigger: Calculate Wages
                                                                ↓
                                                    Store to wage_summary
                                                                ↓
                                                    Display Results
```

---

## 2. ขั้นตอนที่ 1: Import และ Parse ไฟล์

### 2.1 API Route: Import Scans
**ไฟล์:** `/app/api/import-scans/route.ts`  
**บรรทัด:** 1-424

#### Step 1: รับไฟล์และอ่านข้อมูล
**บรรทัด 5-28:**
```typescript
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  const content = await file.text()
  
  // เรียก parseScanFile() จาก otCalculator.ts
  const scans = parseScanFile(content)
}
```

#### Step 2: ตรวจสอบ Duplicates
**บรรทัด 30-60:**
```typescript
// Query scans ที่มีอยู่แล้วในช่วงวันที่เดียวกัน
const { data: existingScans } = await supabase
  .from('attendance_scans')
  .select('*')
  .gte('scan_date', minDate)
  .lte('scan_date', maxDate)

// สร้าง Set เพื่อเช็ค duplicates
const existingSet = new Set(
  existingScans.map(s => `${s.machine_id}|${s.scan_date}|${s.scan_time}|${s.employee_id}|${s.scan_type}`)
)

// Filter เอาแค่ scans ใหม่
const newScans = scans.filter(scan => !existingSet.has(key))
```

#### Step 3: สร้างพนักงานใหม่ (ถ้ายังไม่มี)
**บรรทัด 62-113:**
```typescript
const employeeIds = [...new Set(scans.map(s => s.employee_id))]

// Check ว่า employee ไหนยังไม่มีใน DB
const { data: existingEmployees } = await supabase
  .from('employees')
  .select('employee_id')
  .in('employee_id', employeeIds)

const missingEmployeeIds = employeeIds.filter(id => !existingIds.has(id))

// สร้าง employee ใหม่ด้วยข้อมูล default
if (missingEmployeeIds.length > 0) {
  const newEmployees = missingEmployeeIds.map(id => ({
    employee_id: id,
    name: `พนักงาน ${id}`,
    department: 'Uncategorized',
    perday_salary: 560,
    perhr_salary: 70  // สำคัญ! ใช้คำนวณค่าจ้าง
  }))
  
  await supabase.from('employees').insert(newEmployees)
}
```

#### Step 4: Insert Scans เข้า Database
**บรรทัด 115-138:**
```typescript
if (newScans.length > 0) {
  const { data: insertedData } = await supabase
    .from('attendance_scans')
    .insert(newScans.map(s => ({
      machine_id: s.machine_id,
      scan_date: s.scan_date,
      scan_time: s.scan_time,
      employee_id: s.employee_id,
      scan_type: s.scan_type
    })))
    .select()
    
  insertedScans = insertedData || []
}
```

### 2.2 Parse Scan File Function
**ไฟล์:** `/lib/otCalculator.ts`  
**บรรทัด:** 455-497

#### Logic: แปลง Text → Scan Records
```typescript
export function parseScanFile(content: string): any[] {
  const lines = content.split('\n')
  const scans: any[] = []
  
  for (const line of lines) {
    // Format: NO. Machine Date Time Name CardNumber ScanType
    // Example: 1  1  2024-10-26  06:00:00  ...  20051185  1
    
    const match = trimmed.match(
      /^(\d+)\s+(\d+)\s+(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+.+?\s+(\d{8})\s+([12])\s*$/
    )
    
    if (match) {
      const [_, __, machineId, scanDate, scanTime, employeeId, scanType] = match
      scans.push({ machine_id, scan_date, scan_time, employee_id, scan_type })
    }
  }
  
  return scans
}
```

**Output ตัวอย่าง:**
```javascript
[
  { machine_id: "1", scan_date: "2025-11-01", scan_time: "08:00:00", 
    employee_id: "20051185", scan_type: 1 },
  { machine_id: "1", scan_date: "2025-11-01", scan_time: "18:30:00", 
    employee_id: "20051185", scan_type: 2 },
  ...
]
```

---

## 3. ขั้นตอนที่ 2: คำนวณ OT Hours

### 3.1 Get Holidays และ Employee Scans
**ไฟล์:** `/app/api/import-scans/route.ts`  
**บรรทัด:** 140-186

```typescript
// Get holidays สำหรับเช็คว่าวันไหนเป็นวันหยุด
const { data: holidays } = await supabase
  .from('special_holidays')
  .select('*')

// Get employee IDs ที่ได้รับผลกระทบ
const affectedEmployees = [...new Set(insertedScans.map(s => s.employee_id))]

// เพิ่ม buffer ±1-2 วัน เพื่อจัดการกับกะกลางคืน
minDateObj.setDate(minDateObj.getDate() - 2)  // -2 days
maxDateObj.setDate(maxDateObj.getDate() + 1)  // +1 day

// Fetch ทุก scans ของพนักงานเหล่านี้ในช่วงวันที่
const { data: allEmployeeScans } = await supabase
  .from('attendance_scans')
  .select('*')
  .in('employee_id', affectedEmployees)
  .gte('scan_date', empMinDate)
  .lte('scan_date', empMaxDate)
  .order('scan_date', { ascending: true })
  .order('scan_time', { ascending: true })

// Group by employee
const scansByEmployee = new Map()
allEmployeeScans?.forEach(scan => {
  if (!scansByEmployee.has(scan.employee_id)) {
    scansByEmployee.set(scan.employee_id, [])
  }
  scansByEmployee.get(scan.employee_id).push(scan)
})
```

### 3.2 Calculate OT for Each Employee
**ไฟล์:** `/app/api/import-scans/route.ts`  
**บรรทัด:** 198-328

```typescript
const attendanceMap = new Map()

for (const employeeId of affectedEmployees) {
  const employeeScans = scansByEmployee.get(employeeId) || []
  
  // เรียก calculateOTFromScans() จาก otCalculator.ts
  const workSessions = calculateOTFromScans(employeeScans, holidays || [])
  
  // Merge sessions สำหรับวันเดียวกัน (ถ้ามีหลายกะ)
  for (const session of workSessions) {
    const key = `${employeeId}|${session.workDate}`
    
    if (!attendanceMap.has(key)) {
      attendanceMap.set(key, {
        employee_id: employeeId,
        work_date: session.workDate,
        actual_hours: session.actualHours,
        ot_hours: session.otHours,
        ot_normal_hours: session.otNormalHours,     // ×1.5
        ot_special_hours: session.otSpecialHours,   // ×2
        ot_premium_hours: session.otPremiumHours,   // ×3
        is_holiday: session.isHoliday,
        late: session.late,
        ...
      })
    } else {
      // รวมกับ session ที่มีอยู่แล้ว
      const existing = attendanceMap.get(key)
      existing.actual_hours += session.actualHours
      existing.ot_hours += session.otHours
      // ... รวมค่าอื่นๆ
    }
  }
}

const allAttendanceRecords = Array.from(attendanceMap.values())
```

### 3.3 Calculate OT Function (Core Logic)
**ไฟล์:** `/lib/otCalculator.ts`  
**บรรทัด:** 198-446

#### Function: calculateOTFromScans()
```typescript
export function calculateOTFromScans(
  scans: AttendanceScan[],
  holidays: SpecialHoliday[]
): WorkSession[] {
  
  const sessions: WorkSession[] = []
  
  // Step 1: Pair scans (IN → OUT)
  let i = 0
  while (i < scans.length) {
    const checkIn = scans[i]
    
    if (checkIn.scan_type !== 1) {
      i++
      continue
    }
    
    // หา check-out ที่ match
    let checkOut: AttendanceScan | null = null
    for (let j = i + 1; j < scans.length; j++) {
      if (scans[j].scan_type === 2) {
        checkOut = scans[j]
        i = j + 1
        break
      }
    }
    
    if (!checkOut) continue
    
    // Step 2: กำหนดกะ (1 = 08:00-17:00, 2 = 20:00-05:00)
    const shift = determineShift(checkIn.scan_time)
    
    // Step 3: Check วันหยุด
    const isHoliday = isSpecialDay(parseISO(workDate), holidays)
    
    // Step 4: คำนวณชั่วโมงตามกะ
    let result
    if (shift === 1) {
      result = calculateShift1(checkIn.scan_time, checkOut.scan_time, 
                               checkOut.scan_date, isHoliday)
    } else {
      result = calculateShift2(checkIn.scan_date, checkIn.scan_time,
                               checkOut.scan_date, checkOut.scan_time, isHoliday)
    }
    
    sessions.push({
      workDate: checkIn.scan_date,
      actualHours: result.actualHours,
      otNormalHours: result.otNormalHours,    // OT ×1.5
      otSpecialHours: result.otSpecialHours,  // OT ×2
      otPremiumHours: result.otPremiumHours,  // OT ×3
      isHoliday,
      shift,
      late: result.late
    })
  }
  
  return sessions
}
```

#### Function: calculateShift1() - กะ 1 (08:00-17:00)
**บรรทัด 250-344:**
```typescript
function calculateShift1(
  checkInTime: string,
  checkOutTime: string,
  checkOutDate: string,
  isHoliday: boolean
) {
  const scheduledIn = timeToMinutes('08:00:00')
  const scheduledOut = timeToMinutes('17:00:00')
  const lunchBreak = 60  // 1 ชม.พัก
  
  let checkInMinutes = timeToMinutes(checkInTime)
  let checkOutMinutes = timeToMinutes(checkOutTime)
  
  // ตรวจสอบมาสาย
  let late = checkInMinutes > scheduledIn + 5
  let lateHours = late ? (checkInMinutes - scheduledIn) / 60 : 0
  
  // คำนวณชั่วโมงทำงาน
  let workMinutes = checkOutMinutes - checkInMinutes - lunchBreak
  
  if (isHoliday) {
    // วันหยุด: ไม่มี actual hours, ทุกชั่วโมงเป็น OT
    // 8 ชม.แรก = ×2, เกิน 8 ชม. = ×3
    const totalHours = workMinutes / 60
    const otSpecialHours = Math.min(totalHours, 8)
    const otPremiumHours = Math.max(0, totalHours - 8)
    
    return {
      actualHours: 0,
      otNormalHours: 0,
      otSpecialHours: roundDownToHalfHour(otSpecialHours * 60) / 60,
      otPremiumHours: roundDownToHalfHour(otPremiumHours * 60) / 60,
      late: false
    }
  } else {
    // วันปกติ
    let actualHours = 8
    let otNormalHours = 0
    
    if (workMinutes > (8 * 60)) {
      const overtimeMinutes = workMinutes - (8 * 60)
      otNormalHours = roundDownToHalfHour(overtimeMinutes) / 60
    } else {
      actualHours = workMinutes / 60
    }
    
    return {
      actualHours: actualHours,
      otNormalHours: otNormalHours,
      otSpecialHours: 0,
      otPremiumHours: 0,
      late: late,
      lateHours: lateHours
    }
  }
}
```

#### Function: calculateShift2() - กะ 2 (20:00-05:00)
**บรรทัด 346-445:**
```typescript
function calculateShift2(
  checkInDate: string,
  checkInTime: string,
  checkOutDate: string,
  checkOutTime: string,
  isHoliday: boolean
) {
  // Logic คล้าย Shift 1 แต่คำนวณข้ามวัน
  // กะ 2 เริ่ม 20:00 วันแรก และจบ 05:00 วันถัดไป
  
  // ตรวจสอบว่า checkout เป็นวันถัดไปหรือไม่
  const checkInDateObj = parseISO(checkInDate)
  const checkOutDateObj = parseISO(checkOutDate)
  const dayDiff = (checkOutDateObj.getTime() - checkInDateObj.getTime()) / (1000 * 60 * 60 * 24)
  
  let checkOutMinutesAdjusted = checkOutMinutes
  if (dayDiff >= 1) {
    checkOutMinutesAdjusted += 24 * 60  // เพิ่ม 24 ชม.
  }
  
  // คำนวณเหมือน Shift 1
  const workMinutes = checkOutMinutesAdjusted - checkInMinutes - lunchBreak
  
  // ... logic คล้ายกัน
}
```

### 3.4 Store to daily_attendance
**ไฟล์:** `/app/api/import-scans/route.ts`  
**บรรทัด:** 329-349

```typescript
const allAttendanceRecords = Array.from(attendanceMap.values())

if (allAttendanceRecords.length > 0) {
  const { error: attendanceError } = await supabase
    .from('daily_attendance')
    .upsert(allAttendanceRecords, {
      onConflict: 'employee_id,work_date'  // Update ถ้ามีอยู่แล้ว
    })
  
  if (attendanceError) throw attendanceError
  
  console.log(`✅ Upserted ${allAttendanceRecords.length} attendance records`)
}
```

**ผลลัพธ์:** ตาราง `daily_attendance` มีข้อมูล:
```
employee_id | work_date  | actual_hours | ot_normal | ot_special | ot_premium | late
------------|------------|--------------|-----------|------------|------------|-----
20051185    | 2025-11-01 | 8.00         | 1.50      | 0.00       | 0.00       | false
20051185    | 2025-11-03 | 0.00         | 0.00      | 8.00       | 2.00       | false
```

---

## 4. ขั้นตอนที่ 3: คำนวณค่าจ้างอัตโนมัติ

### 4.1 Detect Affected Months
**ไฟล์:** `/app/api/import-scans/route.ts`  
**บรรทัด:** 354-364

```typescript
// หาเดือนที่ได้รับผลกระทบจากการ import
const affectedMonths = new Set<string>()
allAttendanceRecords.forEach(record => {
  const date = new Date(record.work_date)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  affectedMonths.add(`${year}-${month.toString().padStart(2, '0')}`)
})

// ตัวอย่าง: Set(["2025-11", "2025-12"])
```

### 4.2 Call Wage Calculate API for Each Month
**ไฟล์:** `/app/api/import-scans/route.ts`  
**บรรทัด:** 366-395

```typescript
let wagesCalculated = 0
const wageResults: string[] = []

for (const monthStr of affectedMonths) {
  const [year, month] = monthStr.split('-').map(Number)
  
  // เรียก API calculate wages แบบ internal
  const calculateUrl = new URL('/api/wages/calculate', request.url)
  const calculateRequest = new NextRequest(calculateUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ month, year })
  })
  
  const calculateModule = await import('../wages/calculate/route')
  const calculateResponse = await calculateModule.POST(calculateRequest)
  const calculateData = await calculateResponse.json()
  
  if (calculateData.success) {
    wagesCalculated += calculateData.calculated || 0
    wageResults.push(`${month}/${year}: ${calculateData.calculated} records`)
  }
}
```

### 4.3 Wage Calculate API (หัวใจของระบบ!)
**ไฟล์:** `/app/api/wages/calculate/route.ts`  
**บรรทัด:** 1-276

#### Step 1: Setup และ Get Employees
**บรรทัด 11-40:**
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { month, year } = body  // เช่น month: 11, year: 2025
  
  console.log(`Starting wage calculation for ${month}/${year}`)
  
  // Get all active employees
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('*')
  
  if (!employees || employees.length === 0) {
    return NextResponse.json({ 
      success: false, 
      error: 'No employees found' 
    })
  }
  
  const wageRecords = []
```

#### Step 2: Process Both Periods (1 & 2)
**บรรทัด 42-235:**
```typescript
// คำนวณทั้ง 2 งวด (งวด 1: 26-10, งวด 2: 11-25)
for (const period of [1, 2]) {
  
  // กำหนดวันเริ่มต้น-สิ้นสุดของงวด
  const { startDate, endDate } = getPeriodDates(year, month, period)
  
  // Period 1: 26 เดือนก่อน - 10 เดือนปัจจุบัน
  // Period 2: 11 - 25 เดือนปัจจุบัน
  
  console.log(`Processing period ${period}: ${startDate} to ${endDate}`)
  
  // Loop ทุกพนักงาน
  for (const employee of employees) {
    const employeeId = employee.employee_id
    const perhrSalary = employee.perhr_salary || 0
    
    if (perhrSalary === 0) {
      console.warn(`Skipping ${employeeId}: perhr_salary is 0`)
      continue
    }
    
    // ดึงข้อมูล attendance ของพนักงานในงวดนี้
    const { data: attendances } = await supabase
      .from('daily_attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('work_date', startDate)
      .lte('work_date', endDate)
    
    if (!attendances || attendances.length === 0) continue
    
    // คำนวณค่าจ้างรายวัน
    const dailyWages = attendances.map(att => 
      calculateDailyWage(
        {
          work_date: att.work_date,
          actual_hours: att.actual_hours || 0,
          ot_normal_hours: att.ot_normal_hours || 0,
          ot_special_hours: att.ot_special_hours || 0,
          ot_premium_hours: att.ot_premium_hours || 0,
          is_holiday: att.is_holiday || false,
          is_leave: att.is_leave || false,
          late: att.late || false
        },
        perhrSalary
      )
    )
    
    // เช็คเบี้ยขยัน (ไม่ลา, ไม่สาย)
    const hasBonus = checkAttendanceBonus(attendances)
    
    // คำนวณค่าจ้างรวมของงวด
    const periodWage = calculatePeriodWage(
      employee,
      dailyWages,
      hasBonus
    )
    
    // คำนวณ SSO (ต้องคำนวณรายเดือน แล้วแบ่ง 2 งวด)
    let ssoForThisPeriod = 0
    
    if (period === 2) {
      // งวด 2: คำนวณ SSO รายเดือน
      // ต้องดูรายได้งวด 1 ด้วย
      
      const period1Wage = wageRecords.find(w => 
        w.employee_id === employeeId && 
        w.year === year && 
        w.month === month && 
        w.period === 1
      )
      
      const period1Income = period1Wage?.total_income || 0
      const period2Income = periodWage.total_income
      
      const ssoCalc = calculateMonthlySSO(period1Income, period2Income)
      
      // Update งวด 1
      if (period1Wage) {
        period1Wage.sso = ssoCalc.period1_sso
        period1Wage.total_deduction = period1Wage.sso + period1Wage.tax
        period1Wage.net_wage = period1Wage.total_income - period1Wage.total_deduction
      }
      
      ssoForThisPeriod = ssoCalc.period2_sso
    }
    
    // คำนวณภาษี (Cumulative YTD Method)
    let taxForThisPeriod = 0
    
    if (period === 2) {
      // ดึง YTD data
      const { data: ytdData } = await supabase
        .from('wage_summary')
        .select('total_income, tax')
        .eq('employee_id', employeeId)
        .eq('year', year)
        .lt('month', month)
      
      const ytdIncome = ytdData?.reduce((sum, w) => sum + w.total_income, 0) || 0
      const ytdTax = ytdData?.reduce((sum, w) => sum + w.tax, 0) || 0
      
      // คำนวณภาษีด้วย Cumulative YTD
      const taxCalc = calculateWithholdingTax({
        current_period_income: periodWage.total_income,
        ytd_income_before_this_period: ytdIncome,
        ytd_tax_before_this_period: ytdTax,
        current_month: month,
        current_period: period,
        tax_allowance: employee.tax_allowance || 60000,
        expense_deduction_rate: 0.5,
        max_expense_deduction: 100000
      })
      
      taxForThisPeriod = taxCalc.tax_this_period
    }
    
    // สร้าง wage record
    const wageRecord = {
      employee_id: employeeId,
      year: year,
      month: month,
      period: period,
      base_wage: periodWage.total_base_wage,
      ot_wage: periodWage.total_ot1_wage + periodWage.total_ot2_wage + periodWage.total_ot3_wage,
      attendance_bonus: periodWage.attendance_bonus,
      total_income: periodWage.total_income,
      sso: ssoForThisPeriod,
      tax: taxForThisPeriod,
      total_deduction: ssoForThisPeriod + taxForThisPeriod,
      net_wage: periodWage.total_income - ssoForThisPeriod - taxForThisPeriod,
      updated_at: new Date().toISOString()
    }
    
    wageRecords.push(wageRecord)
  }
}
```

#### Step 3: Upsert to Database
**บรรทัด 237-256:**
```typescript
// Upsert ทุก records พร้อมกัน
if (wageRecords.length > 0) {
  const { error: upsertError } = await supabase
    .from('wage_summary')
    .upsert(wageRecords, {
      onConflict: 'employee_id,year,month,period'
    })
  
  if (upsertError) {
    console.error('Failed to upsert wage records:', upsertError)
    throw upsertError
  }
  
  console.log(`✅ Upserted ${wageRecords.length} wage records`)
}

return NextResponse.json({
  success: true,
  message: `Calculated and saved ${wageRecords.length} wage records`,
  calculated: wageRecords.length
})
```

### 4.4 Helper Function: getPeriodDates()
**ไฟล์:** `/app/api/wages/calculate/route.ts`  
**บรรทัด:** 260-276

```typescript
function getPeriodDates(year: number, month: number, period: number) {
  if (period === 1) {
    // งวด 1: 26 เดือนก่อน - 10 เดือนปัจจุบัน
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    
    return {
      startDate: `${prevYear}-${String(prevMonth).padStart(2, '0')}-26`,
      endDate: `${year}-${String(month).padStart(2, '0')}-10`
    }
  } else {
    // งวด 2: 11 - 25 เดือนปัจจุบัน
    return {
      startDate: `${year}-${String(month).padStart(2, '0')}-11`,
      endDate: `${year}-${String(month).padStart(2, '0')}-25`
    }
  }
}
```

---

## 5. ขั้นตอนที่ 4: แสดงผลข้อมูล

### 5.1 Wages Detail Page (Web App)
**ไฟล์:** `/app/wages/[id]/page.tsx`  
**บรรทัด:** 1-500+

#### Fetch Wage Data
**บรรทัด 40-120:**
```typescript
useEffect(() => {
  const fetchData = async () => {
    const params = new URLSearchParams(window.location.search)
    const month = params.get('month')    // 2025-11
    const period = params.get('period')  // 1 or 2
    
    // 1. Fetch wage data for this period
    const wageRes = await fetch(
      `/api/wages/employee/${employeeId}?month=${month}&period=${period}`
    )
    const wageData = await wageRes.json()
    
    // 2. Fetch YTD summary
    const year = parseInt(month.split('-')[0])
    const ytdRes = await fetch(`/api/employees/${employeeId}/ytd?year=${year}`)
    const ytdData = await ytdRes.json()
    
    // 3. Fetch All-Time summary
    const allTimeRes = await fetch(`/api/employees/${employeeId}/all-time-summary`)
    const allTimeData = await allTimeRes.json()
    
    setPeriodWage(wageData.data.periodWage)
    setYtd(ytdData.data)
    setAllTimeData(allTimeData.data)
  }
  
  fetchData()
}, [employeeId])
```

#### Display Period Wage
**บรรทัด 200-250:**
```tsx
{/* รายได้งวดนี้ */}
<div className="card">
  <div>ค่าจ้างพื้นฐาน: {base_wage.toFixed(2)} ฿</div>
  <div>ค่าโอที: {ot_wage.toFixed(2)} ฿</div>
  <div>เบี้ยขยัน: {attendance_bonus.toFixed(2)} ฿</div>
  <div>รวมรายได้: {total_income.toFixed(2)} ฿</div>
</div>

{/* รายการหักงวดนี้ */}
<div className="card">
  <div>ประกันสังคม: {sso.toFixed(2)} ฿</div>
  <div>ภาษีเงินได้งวดนี้: {tax.toFixed(2)} ฿</div>
  <div>รวมหัก: {total_deduction.toFixed(2)} ฿</div>
  <div>เงินสุทธิ: {net_wage.toFixed(2)} ฿</div>
</div>
```

#### Display YTD Summary (6 รายการ)
**บรรทัด 280-350:**
```tsx
{ytd && (
  <div className="card">
    <h3>📊 ยอดสะสมรายปี {year + 543}</h3>
    
    <div>1. เงินเดือนสะสมทั้งปี: {ytd.ytd_gross_wage.toFixed(2)} ฿</div>
    <div>2. ภาษีเงินได้สะสมทั้งปี: {ytd.ytd_tax.toFixed(2)} ฿</div>
    <div>3. ประกันสังคมสะสมทั้งปี: {ytd.ytd_sso.toFixed(2)} ฿</div>
    <div>4. รวมเงินได้สะสมทั้งปี: {ytd.ytd_total_income.toFixed(2)} ฿</div>
    <div>5. รวมหักสะสมทั้งปี: {ytd.ytd_total_deductions.toFixed(2)} ฿</div>
    <div>6. เงินได้สุทธิสะสมทั้งปี: {ytd.ytd_net_wage.toFixed(2)} ฿</div>
  </div>
)}
```

#### Display All-Time Summary (6 รายการ)
**บรรทัด 360-430:**
```tsx
{allTimeData && (
  <div className="card">
    <h3>💎 ยอดสะสมทั้งหมด (ตั้งแต่เริ่มงาน)</h3>
    
    <div>7. เงินเดือนสะสมทั้งหมด: {allTimeData.total_gross_wage.toFixed(2)} ฿</div>
    <div>8. ภาษีเงินได้สะสมทั้งหมด: {allTimeData.total_tax.toFixed(2)} ฿</div>
    <div>9. ประกันสังคมสะสมทั้งหมด: {allTimeData.total_sso.toFixed(2)} ฿</div>
    <div>10. รวมเงินได้สะสมทั้งหมด: {allTimeData.total_income.toFixed(2)} ฿</div>
    <div>11. รวมหักสะสมทั้งหมด: {allTimeData.total_deduction.toFixed(2)} ฿</div>
    <div>12. เงินได้สุทธิสะสมทั้งหมด: {allTimeData.total_net_wage.toFixed(2)} ฿</div>
    
    <div>งวดที่ทำงานทั้งหมด: {allTimeData.total_periods} งวด</div>
  </div>
)}
```

### 5.2 LIFF Employee OT Viewer
**ไฟล์:** `/app/liff/employee-ot-viewer/page.tsx`  
**บรรทัด:** 1-540

#### Initialize LIFF และ Get Employee
**บรรทัด 80-140:**
```typescript
useEffect(() => {
  const initializeLiff = async () => {
    await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID_OT_VIEWER! })
    
    if (!liff.isLoggedIn()) {
      liff.login()
      return
    }
    
    // Get LINE profile
    const profile = await liff.getProfile()
    setLineUserId(profile.userId)
    setDisplayName(profile.displayName)
    
    // Get employee from LINE ID
    const { data: empData } = await supabase
      .from('employees')
      .select('*')
      .eq('line_id', profile.userId)
      .single()
    
    if (empData) {
      setEmployee(empData)
      await fetchData(empData.employee_id)
    }
  }
  
  initializeLiff()
}, [])
```

#### Fetch Wage Summaries
**บรรทัด 150-200:**
```typescript
const fetchData = async (employeeId: string) => {
  const selectedYear = startDate ? new Date(startDate).getFullYear() : new Date().getFullYear()
  
  // 1. Get wage summaries for selected year
  const wageRes = await fetch(
    `/api/wages/employee-summary?employee_id=${employeeId}&year=${selectedYear}`
  )
  const wageSummaries = await wageRes.json()
  setWageSummaries(wageSummaries.data || [])
  
  // 2. Get YTD
  const ytdRes = await fetch(`/api/employees/${employeeId}/ytd?year=${selectedYear}`)
  const ytdData = await ytdRes.json()
  setYtdData(ytdData.data)
  
  // 3. Get All-Time
  const allTimeRes = await fetch(`/api/employees/${employeeId}/all-time-summary`)
  const allTimeData = await allTimeRes.json()
  setAllTimeData(allTimeData.data)
}
```

#### Display Wage Summaries
**บรรทัด 350-420:**
```tsx
{wageSummaries.map((wage, index) => (
  <div key={index} className="wage-card">
    <h3>งวดที่ {wage.period} - {wage.month}/{wage.year + 543}</h3>
    
    <div>เงินเดือน: {wage.base_wage.toFixed(2)} ฿</div>
    <div>ค่า OT: {wage.ot_wage.toFixed(2)} ฿</div>
    <div>เบี้ยขยัน: {wage.attendance_bonus.toFixed(2)} ฿</div>
    <div>รวมรายได้: {wage.total_income.toFixed(2)} ฿</div>
    <div>ประกันสังคม: {wage.sso.toFixed(2)} ฿</div>
    <div>🏦 ภาษีเงินได้งวดนี้: {wage.tax.toFixed(2)} ฿</div>
    <div>รวมหัก: {wage.total_deduction.toFixed(2)} ฿</div>
    <div>เงินสุทธิ: {wage.net_wage.toFixed(2)} ฿</div>
  </div>
))}
```

#### Display YTD & All-Time (เหมือน Web App)
**บรรทัด 430-540:**
```tsx
{/* YTD Summary - 6 รายการ */}
{/* All-Time Summary - 6 รายการ */}
```

---

## 6. สูตรคำนวณทั้งหมด

### 6.1 Daily Wage Calculation
**ไฟล์:** `/lib/wageCalculations.ts`  
**บรรทัด:** 30-80

```typescript
export function calculateDailyWage(
  attendance: DailyAttendance,
  perhrSalary: number
): DailyWage {
  
  // ค่าจ้างพื้นฐาน
  const base_wage = (attendance.actual_hours || 0) * perhrSalary
  
  // OT ปกติ (×1.5)
  const ot1_wage = (attendance.ot_normal_hours || 0) * perhrSalary * 1.5
  
  // OT พิเศษ (×2) - วันหยุด 8 ชม.แรก
  const ot2_wage = (attendance.ot_special_hours || 0) * perhrSalary * 2.0
  
  // OT ขั้นสูง (×3) - วันหยุด เกิน 8 ชม.
  const ot3_wage = (attendance.ot_premium_hours || 0) * perhrSalary * 3.0
  
  return {
    work_date: attendance.work_date,
    base_wage: base_wage,
    ot1_wage: ot1_wage,
    ot2_wage: ot2_wage,
    ot3_wage: ot3_wage,
    total: base_wage + ot1_wage + ot2_wage + ot3_wage
  }
}
```

**ตัวอย่าง:**
```
perhr_salary = 70฿
actual_hours = 8
ot_normal_hours = 1.5
ot_special_hours = 0
ot_premium_hours = 0

base_wage = 8 × 70 = 560฿
ot1_wage = 1.5 × 70 × 1.5 = 157.5฿
total = 717.5฿
```

### 6.2 Attendance Bonus Check
**ไฟล์:** `/lib/wageCalculations.ts`  
**บรรทัด:** 82-95

```typescript
export function checkAttendanceBonus(attendances: DailyAttendance[]): boolean {
  // เบี้ยขยัน 500฿ ถ้า:
  // 1. ไม่ลางาน (is_leave = false ทุกวัน)
  // 2. ไม่มาสาย (late = false ทุกวัน)
  
  return attendances.every(att => !att.is_leave && !att.late)
}
```

### 6.3 Period Wage Calculation
**ไฟล์:** `/lib/wageCalculations.ts`  
**บรรทัด:** 97-140

```typescript
export function calculatePeriodWage(
  employee: Employee,
  dailyWages: DailyWage[],
  hasAttendanceBonus: boolean
): PeriodWage {
  
  // รวมค่าจ้างรายวัน
  let total_base_wage = 0
  let total_ot1_wage = 0
  let total_ot2_wage = 0
  let total_ot3_wage = 0
  
  for (const daily of dailyWages) {
    total_base_wage += daily.base_wage
    total_ot1_wage += daily.ot1_wage
    total_ot2_wage += daily.ot2_wage
    total_ot3_wage += daily.ot3_wage
  }
  
  // เบี้ยขยัน
  const attendance_bonus = hasAttendanceBonus ? 500 : 0
  
  // รายได้รวม
  const total_income = total_base_wage + total_ot1_wage + total_ot2_wage + 
                       total_ot3_wage + attendance_bonus
  
  return {
    total_base_wage,
    total_ot1_wage,
    total_ot2_wage,
    total_ot3_wage,
    attendance_bonus,
    total_income,
    tax_withholding: 0,  // คำนวณทีหลัง
    net_income: total_income
  }
}
```

### 6.4 Monthly SSO Calculation
**ไฟล์:** `/lib/wageCalculations.ts`  
**บรรทัด:** 142-175

```typescript
export function calculateMonthlySSO(
  period1_income: number,
  period2_income: number
): { period1_sso: number; period2_sso: number; monthly_total: number } {
  
  // 1. รวมรายได้ทั้งเดือน
  const monthly_income = period1_income + period2_income
  
  // 2. คำนวณฐาน SSO (เพดาน 15,000฿)
  const sso_base = Math.min(monthly_income, 15000)
  
  // 3. คำนวณ SSO รายเดือน (อัตรา 5%)
  const monthly_sso = sso_base * 0.05
  
  // 4. แบ่งตามสัดส่วนรายได้ของแต่ละงวด
  let period1_sso = 0
  let period2_sso = 0
  
  if (monthly_income > 0) {
    if (period1_income >= period2_income) {
      // งวด 1 รายได้มากกว่า → หัก SSO ทั้งหมดในงวด 1
      period1_sso = monthly_sso
      period2_sso = 0
    } else {
      // แบ่งตามสัดส่วน
      const period1_ratio = period1_income / monthly_income
      period1_sso = Math.floor(monthly_sso * period1_ratio)
      period2_sso = monthly_sso - period1_sso
    }
  }
  
  return {
    period1_sso: Math.round(period1_sso * 100) / 100,
    period2_sso: Math.round(period2_sso * 100) / 100,
    monthly_total: Math.round(monthly_sso * 100) / 100
  }
}
```

**ตัวอย่าง:**
```
period1_income = 12,344.50฿
period2_income = 6,126.82฿
monthly_income = 18,471.32฿

sso_base = 15,000฿ (เพดาน)
monthly_sso = 15,000 × 0.05 = 750฿

เนื่องจาก period1_income > period2_income:
period1_sso = 750฿
period2_sso = 0฿
```

### 6.5 Withholding Tax Calculation (Cumulative YTD)
**ไฟล์:** `/lib/wageCalculations.ts`  
**บรรทัด:** 177-280

```typescript
export function calculateWithholdingTax(input: TaxCalculationInput): TaxCalculationResult {
  
  // Input:
  // - current_period_income: รายได้งวดนี้
  // - ytd_income_before_this_period: รายได้สะสม YTD ก่อนงวดนี้
  // - ytd_tax_before_this_period: ภาษีสะสม YTD ก่อนงวดนี้
  // - current_month: เดือนปัจจุบัน (1-12)
  // - current_period: งวดปัจจุบัน (1 or 2)
  // - tax_allowance: ค่าลดหย่อน (default 60,000)
  // - max_expense_deduction: ค่าใช้จ่ายสูงสุด (default 100,000)
  
  // Step 1: คำนวณจำนวนงวดที่เหลือในปี (รวมงวดนี้)
  const total_periods_in_year = 24  // 12 เดือน × 2 งวด
  const current_period_number = (input.current_month - 1) * 2 + input.current_period
  const remaining_periods_including_current = total_periods_in_year - current_period_number + 1
  const remaining_periods_excluding_current = remaining_periods_including_current - 1
  
  // Step 2: ประมาณการรายได้ทั้งปี
  const estimated_yearly_income = 
    input.ytd_income_before_this_period +
    input.current_period_income +
    (input.current_period_income * remaining_periods_excluding_current)
  
  // Step 3: หักค่าใช้จ่าย (50% หรือสูงสุด 100,000฿)
  const expense_deduction = Math.min(
    estimated_yearly_income * input.expense_deduction_rate,
    input.max_expense_deduction
  )
  
  // Step 4: หักค่าลดหย่อน
  const taxable_income = Math.max(
    0,
    estimated_yearly_income - expense_deduction - input.tax_allowance
  )
  
  // Step 5: คำนวณภาษีตามขั้นบันได
  const yearly_tax = calculateProgressiveTax(taxable_income)
  
  // Step 6: คำนวณภาษีที่ต้องหักงวดนี้
  const remaining_tax = Math.max(0, yearly_tax - input.ytd_tax_before_this_period)
  const tax_this_period = remaining_periods_including_current > 0
    ? Math.floor(remaining_tax / remaining_periods_including_current)
    : 0
  
  return {
    estimated_yearly_income,
    expense_deduction,
    taxable_income,
    yearly_tax,
    tax_this_period,
    remaining_periods: remaining_periods_including_current
  }
}
```

#### Progressive Tax Calculation
**บรรทัด 282-320:**
```typescript
function calculateProgressiveTax(taxableIncome: number): number {
  // อัตราภาษีขั้นบันได (2025)
  const brackets = [
    { limit: 150000, rate: 0.00 },    // 0 - 150,000: ไม่เสียภาษี
    { limit: 300000, rate: 0.05 },    // 150,001 - 300,000: 5%
    { limit: 500000, rate: 0.10 },    // 300,001 - 500,000: 10%
    { limit: 750000, rate: 0.15 },    // 500,001 - 750,000: 15%
    { limit: 1000000, rate: 0.20 },   // 750,001 - 1,000,000: 20%
    { limit: 2000000, rate: 0.25 },   // 1,000,001 - 2,000,000: 25%
    { limit: 5000000, rate: 0.30 },   // 2,000,001 - 5,000,000: 30%
    { limit: Infinity, rate: 0.35 }   // 5,000,001+: 35%
  ]
  
  let tax = 0
  let previousLimit = 0
  
  for (const bracket of brackets) {
    if (taxableIncome > previousLimit) {
      const taxableInThisBracket = Math.min(
        taxableIncome - previousLimit,
        bracket.limit - previousLimit
      )
      tax += taxableInThisBracket * bracket.rate
      previousLimit = bracket.limit
    } else {
      break
    }
  }
  
  return Math.round(tax)
}
```

**ตัวอย่างการคำนวณภาษี:**
```
งวดที่ 1/2025 (มกราคม งวด 1):
- รายได้งวดนี้ = 12,344.50฿
- YTD ก่อนงวดนี้ = 0฿
- งวดที่เหลือ = 24 - 1 = 23 งวด

ประมาณการรายได้ทั้งปี = 0 + 12,344.50 + (12,344.50 × 23) = 296,268.50฿
หักค่าใช้จ่าย (50%) = 148,134.25฿
หักค่าลดหย่อน = 60,000฿
เงินได้สุทธิ = 296,268.50 - 148,134.25 - 60,000 = 88,134.25฿

ภาษีทั้งปี = 0฿ (เพราะต่ำกว่า 150,000)
ภาษีงวดนี้ = 0 / 24 = 0฿
```

---

## 7. ไฟล์และ Functions สำคัญ

### 7.1 Frontend Files

#### 1. `/app/page.tsx` (หน้าหลัก)
- **บรรทัด 192-226:** `handleImport()` - Upload file
- **บรรทัด 101-122:** `fetchAttendanceData()` - Fetch OT data
- **บรรทัด 251-370:** `renderTable()` - แสดงตาราง OT

#### 2. `/app/wages/page.tsx` (หน้า Wages Overview)
- **บรรทัด 80-150:** UI สำหรับเพิ่มเงินได้/หัก
- **บรรทัด 200-250:** ปุ่มคำนวณค่าจ้างแบบ manual (ตอนนี้ auto แล้ว)

#### 3. `/app/wages/[id]/page.tsx` (หน้ารายละเอียดค่าจ้าง)
- **บรรทัด 40-120:** Fetch wage data, YTD, All-Time
- **บรรทัด 200-450:** Display UI (Period, YTD, All-Time)

#### 4. `/app/liff/employee-ot-viewer/page.tsx` (LIFF)
- **บรรทัด 80-140:** Initialize LIFF, get employee
- **บรรทัด 150-200:** Fetch wage summaries
- **บรรทัด 350-540:** Display wage cards, YTD, All-Time

### 7.2 Backend API Files

#### 5. `/app/api/import-scans/route.ts` (Import & Calculate OT)
- **บรรทัด 5-28:** Receive file, parse
- **บรรทัด 30-60:** Check duplicates
- **บรรทัด 62-113:** Create missing employees
- **บรรทัด 115-138:** Insert scans
- **บรรทัด 140-186:** Get holidays, fetch scans
- **บรรทัด 198-328:** Calculate OT for each employee
- **บรรทัด 329-349:** Upsert to daily_attendance
- **บรรทัด 354-395:** ⭐ Auto-trigger wage calculation
- **บรรทัด 397-412:** Return response

#### 6. `/app/api/wages/calculate/route.ts` (Calculate Wages)
- **บรรทัด 11-40:** Get employees
- **บรรทัด 42-235:** Process both periods, calculate wages
  - Get daily_attendance
  - Calculate daily wages
  - Check attendance bonus
  - Calculate period wage
  - Calculate SSO (monthly, split 2 periods)
  - Calculate tax (Cumulative YTD)
- **บรรทัด 237-256:** Upsert to wage_summary
- **บรรทัด 260-276:** `getPeriodDates()` helper

#### 7. `/app/api/wages/employee/[id]/route.ts` (Get Wage Details)
- Fetch wage summary for specific employee, month, period
- Calculate YTD summary
- Return period wage + YTD data

#### 8. `/app/api/employees/[id]/ytd/route.ts` (Get YTD Summary)
- Query wage_summary for current year
- SUM all fields (base_wage, ot_wage, sso, tax, etc.)
- Return 6 YTD figures

#### 9. `/app/api/employees/[id]/all-time-summary/route.ts` (Get All-Time Summary)
- Query wage_summary for all years
- SUM all fields across entire history
- COUNT total periods
- Return 6 All-Time figures + total periods

### 7.3 Library Files

#### 10. `/lib/otCalculator.ts` (OT Calculation Logic)
- **บรรทัด 455-497:** `parseScanFile()` - Parse .txt file
- **บรรทัด 198-446:** `calculateOTFromScans()` - Main OT calculation
- **บรรทัด 250-344:** `calculateShift1()` - Shift 1 logic
- **บรรทัด 346-445:** `calculateShift2()` - Shift 2 logic
- **บรรทัด 47-65:** `isSpecialDay()` - Check holiday
- **บรรทัด 67-85:** `determineShift()` - Determine shift
- **บรรทัด 42-44:** `roundDownToHalfHour()` - Round OT

#### 11. `/lib/wageCalculations.ts` (Wage Calculation Functions)
- **บรรทัด 30-80:** `calculateDailyWage()` - Daily wage
- **บรรทัด 82-95:** `checkAttendanceBonus()` - Check bonus
- **บรรทัด 97-140:** `calculatePeriodWage()` - Period wage
- **บรรทัด 142-175:** `calculateMonthlySSO()` - SSO calculation
- **บรรทัด 177-280:** `calculateWithholdingTax()` - Tax (Cumulative YTD)
- **บรรทัด 282-320:** `calculateProgressiveTax()` - Progressive tax brackets

#### 12. `/lib/supabase.ts` (Database Client & Types)
- **บรรทัด 1-8:** Supabase client setup
- **บรรทัด 9-54:** TypeScript interfaces (Employee, DailyAttendance, etc.)

---

## 8. สรุปการทำงานแบบสั้น

```
1. User Upload .txt
   ↓
2. Parse File → Extract scan records
   ↓
3. Store to attendance_scans
   ↓
4. Calculate OT Hours
   ├─ Pair IN/OUT scans
   ├─ Determine shift (1 or 2)
   ├─ Check holidays
   └─ Calculate: actual_hours, ot_normal (×1.5), ot_special (×2), ot_premium (×3)
   ↓
5. Store to daily_attendance
   ↓
6. 🆕 Auto Detect Affected Months
   ↓
7. 🆕 For Each Month:
   ├─ Get all employees
   ├─ For each employee:
   │  ├─ Get daily_attendance for period 1 & 2
   │  ├─ Calculate daily wages (base + OT)
   │  ├─ Check attendance bonus (500฿)
   │  ├─ Calculate period wage
   │  ├─ Calculate SSO (5%, monthly, split 2 periods, cap 15,000)
   │  └─ Calculate tax (Cumulative YTD method)
   └─ Store to wage_summary
   ↓
8. Display Results
   ├─ Homepage: OT table
   ├─ /wages/[id]: Period wage + YTD + All-Time
   └─ LIFF: Employee wage viewer + YTD + All-Time
```

---

## 9. ข้อมูลที่เก็บใน Database

### daily_attendance (ผลลัพธ์จากการคำนวณ OT)
```
work_date | actual_hours | ot_normal | ot_special | ot_premium | late
----------|--------------|-----------|------------|------------|-----
2025-11-01| 8.00         | 1.50      | 0.00       | 0.00       | false
2025-11-03| 0.00         | 0.00      | 8.00       | 2.00       | false
```

### wage_summary (ผลลัพธ์จากการคำนวณค่าจ้าง) ⭐
```
year | month | period | base_wage | ot_wage | bonus | total_income | sso    | tax | net_wage
-----|-------|--------|-----------|---------|-------|--------------|--------|-----|----------
2025 | 11    | 1      | 9029.12   | 3315.38 | 0.00  | 12344.50     | 617.23 | 131 | 11596.27
2025 | 11    | 2      | 4523.00   | 1103.82 | 500   | 6126.82      | 131.39 | 68  | 5927.43
```

---

## 10. Migration Files ที่ต้อง Run

1. **`data.sql`** - Core tables (employees, attendance_scans, daily_attendance, special_holidays, leave_records)

2. **`wage_summary_migration.sql`** ⭐ - Table wage_summary (สำคัญ!)

3. **`income_deduction_system_migration.sql`** - Tables income_deduction_master, income_deduction_records (optional)

---

**สร้างเมื่อ:** 20 พฤศจิกายน 2568  
**เวอร์ชัน:** 2.0 (Full Automation)  
**สถานะ:** ✅ Complete Comprehensive Guide

