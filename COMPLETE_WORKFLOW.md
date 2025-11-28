# 🔄 Complete Workflow: จาก Import ไฟล์ .txt จนจบระบบ

## 📋 สารบัญ
1. [Frontend: Upload File](#1-frontend-upload-file)
2. [API: Parse & Validate](#2-api-parse--validate)
3. [Database: Store Scans](#3-database-store-scans)
4. [Calculate OT Hours](#4-calculate-ot-hours)
5. [Store Daily Attendance](#5-store-daily-attendance)
6. [Auto Calculate Wages](#6-auto-calculate-wages)
7. [Display Results](#7-display-results)

---

## 1. Frontend: Upload File

### 📁 ไฟล์: `/app/page.tsx`

#### Step 1.1: User Action
```typescript
// บรรทัด 192-221
const handleImport = async () => {
  if (!importFile) return
  
  setImporting(true)
  setImportMessage('')
  
  // 1. สร้าง FormData
  const formData = new FormData()
  formData.append('file', importFile)
  
  // 2. ส่งไปยัง API
  const response = await fetch('/api/import-scans', {
    method: 'POST',
    body: formData
  })
  
  const result = await response.json()
  
  // 3. แสดงผลลัพธ์
  if (result.success) {
    let message = `✅ ${result.message}`
    
    // เพิ่มข้อมูลค่าจ้างถ้ามี
    if (result.wagesCalculated > 0) {
      message += `\n\n💰 คำนวณค่าจ้างอัตโนมัติ: ${result.wagesCalculated} รายการ`
      message += `\n📊 ${result.wageDetails.join(', ')}`
    }
    
    setImportMessage(message)
    await fetchAttendanceData() // Refresh table
  }
}
```

**Input:** `File` object (scan_data.txt)  
**Output:** POST request to `/api/import-scans`

---

## 2. API: Parse & Validate

### 📁 ไฟล์: `/app/api/import-scans/route.ts`

#### Step 2.1: Receive File
```typescript
// บรรทัด 5-28
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  
  // อ่านเนื้อหาไฟล์
  const content = await file.text()
  
  // Parse ไฟล์ → แปลงเป็น scan records
  const scans = parseScanFile(content)
}
```

**Input:** FormData with file  
**Output:** Array of scan records

---

#### Step 2.2: Parse File Content

### 📁 ไฟล์: `/lib/otCalculator.ts`

```typescript
// บรรทัด 455-497
export function parseScanFile(content: string): any[] {
  const lines = content.split('\n')
  const scans: any[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    
    // Format: NO.  Machine Code  Date       Time       Name  Card number
    // Example: 1    1            2024-10-26 06:00:00  ...   20051185    1
    
    const match = trimmed.match(
      /^(\d+)\s+(\d+)\s+(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+.+?\s+(\d{8})\s+([12])\s*$/
    )
    
    if (match) {
      const [_, __, machineId, scanDate, scanTime, employeeId, scanType] = match
      
      scans.push({
        machine_id: machineId,
        scan_date: scanDate,
        scan_time: scanTime,
        employee_id: employeeId,
        scan_type: parseInt(scanType) // 1 = IN, 2 = OUT
      })
    }
  }
  
  return scans
}
```

**Input:** Raw text content  
**Output:** 
```javascript
[
  {
    machine_id: "1",
    scan_date: "2025-11-01",
    scan_time: "08:00:00",
    employee_id: "20051185",
    scan_type: 1  // 1 = Check-in, 2 = Check-out
  },
  ...
]
```

---

## 3. Database: Store Scans

### 📁 ไฟล์: `/app/api/import-scans/route.ts`

#### Step 3.1: Check Duplicates
```typescript
// บรรทัด 30-60
// Get existing scans in date range
const dates = [...new Set(scans.map(s => s.scan_date))].sort()
const minDate = dates[0]
const maxDate = dates[dates.length - 1]

const { data: existingScans } = await supabase
  .from('attendance_scans')
  .select('machine_id, scan_date, scan_time, employee_id, scan_type')
  .gte('scan_date', minDate)
  .lte('scan_date', maxDate)

// Create Set for fast duplicate checking
const existingSet = new Set(
  (existingScans || []).map(s =>
    `${s.machine_id}|${s.scan_date}|${s.scan_time}|${s.employee_id}|${s.scan_type}`
  )
)

// Filter out duplicates
const newScans = scans.filter(scan => {
  const key = `${scan.machine_id}|${scan.scan_date}|${scan.scan_time}|${scan.employee_id}|${scan.scan_type}`
  return !existingSet.has(key)
})

console.log(`New scans: ${newScans.length}, Duplicates: ${scans.length - newScans.length}`)
```

---

#### Step 3.2: Create Missing Employees
```typescript
// บรรทัด 62-113
// Get employee IDs from scans
const employeeIds = [...new Set(scans.map(s => s.employee_id))]

// Check which employees don't exist
const { data: existingEmployees } = await supabase
  .from('employees')
  .select('employee_id')
  .in('employee_id', employeeIds)

const existingIds = new Set(existingEmployees?.map(e => e.employee_id) || [])
const missingEmployeeIds = employeeIds.filter(id => !existingIds.has(id))

if (missingEmployeeIds.length > 0) {
  // Create new employees with default data
  const newEmployees = missingEmployeeIds.map(id => ({
    employee_id: id,
    name: `พนักงาน ${id}`,
    department: 'Uncategorized',
    perday_salary: 560,
    perhr_salary: 70
  }))
  
  await supabase.from('employees').insert(newEmployees)
  console.log(`Created ${missingEmployeeIds.length} new employees`)
}
```

**ผลลัพธ์:**  
✅ ตาราง `employees` มีข้อมูลครบทุกคนที่อยู่ในไฟล์

---

#### Step 3.3: Insert Scans
```typescript
// บรรทัด 115-138
if (newScans.length > 0) {
  const { data: insertedData, error: insertError } = await supabase
    .from('attendance_scans')
    .insert(newScans.map(s => ({
      machine_id: s.machine_id,
      scan_date: s.scan_date,
      scan_time: s.scan_time,
      employee_id: s.employee_id,
      scan_type: s.scan_type
    })))
    .select()
  
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }
  
  insertedScans = insertedData || []
  console.log(`Inserted ${insertedScans.length} scans`)
}
```

**ผลลัพธ์:**  
✅ ตาราง `attendance_scans` มีข้อมูล scan ทั้งหมด

---

## 4. Calculate OT Hours

### 📁 ไฟล์: `/app/api/import-scans/route.ts`

#### Step 4.1: Get Holidays
```typescript
// บรรทัด 140-143
const { data: holidays } = await supabase
  .from('special_holidays')
  .select('*')
```

---

#### Step 4.2: Fetch All Scans for Affected Employees
```typescript
// บรรทัด 145-186
const affectedEmployees = [...new Set(insertedScans?.map(s => s.employee_id) || [])]

// Add buffer (±1-2 days) to handle cross-day shifts
const scanDates = insertedScans.map(s => s.scan_date).sort()
const minDateObj = new Date(scanDates[0])
const maxDateObj = new Date(scanDates[scanDates.length - 1])

minDateObj.setDate(minDateObj.getDate() - 2)  // -2 days buffer
maxDateObj.setDate(maxDateObj.getDate() + 1)  // +1 day buffer

const empMinDate = minDateObj.toISOString().split('T')[0]
const empMaxDate = maxDateObj.toISOString().split('T')[0]

// Fetch all scans for these employees in date range
const { data: allEmployeeScans } = await supabase
  .from('attendance_scans')
  .select('*')
  .in('employee_id', affectedEmployees)
  .gte('scan_date', empMinDate)
  .lte('scan_date', empMaxDate)
  .order('employee_id', { ascending: true })
  .order('scan_date', { ascending: true })
  .order('scan_time', { ascending: true })

// Group by employee
const scansByEmployee = new Map<string, any[]>()
allEmployeeScans?.forEach(scan => {
  if (!scansByEmployee.has(scan.employee_id)) {
    scansByEmployee.set(scan.employee_id, [])
  }
  scansByEmployee.get(scan.employee_id)!.push(scan)
})
```

---

#### Step 4.3: Calculate OT for Each Employee

### 📁 ไฟล์: `/lib/otCalculator.ts`

```typescript
// บรรทัด 198-446
export function calculateOTFromScans(
  scans: AttendanceScan[],
  holidays: SpecialHoliday[]
): WorkSession[] {
  
  const sessions: WorkSession[] = []
  
  // 1. Pair scans (IN → OUT)
  let i = 0
  while (i < scans.length) {
    const checkIn = scans[i]
    
    // Skip if not check-in
    if (checkIn.scan_type !== 1) {
      i++
      continue
    }
    
    // Find matching check-out
    let checkOut: AttendanceScan | null = null
    for (let j = i + 1; j < scans.length; j++) {
      if (scans[j].scan_type === 2) {
        checkOut = scans[j]
        i = j + 1
        break
      }
    }
    
    if (!checkOut) {
      i++
      continue
    }
    
    // 2. Determine shift (1 or 2)
    const shift = determineShift(checkIn.scan_time)
    
    // 3. Calculate hours
    const workDate = checkIn.scan_date
    const isHoliday = isSpecialDay(parseISO(workDate), holidays)
    
    let actualHours = 0
    let otHours = 0
    let otNormalHours = 0
    let otSpecialHours = 0
    let otPremiumHours = 0
    let late = false
    let lateHours = 0
    
    if (shift === 1) {
      // Shift 1: 08:00-17:00
      const result = calculateShift1(
        checkIn.scan_time,
        checkOut.scan_time,
        checkOut.scan_date,
        isHoliday
      )
      actualHours = result.actualHours
      otHours = result.otHours
      otNormalHours = result.otNormalHours
      otSpecialHours = result.otSpecialHours
      otPremiumHours = result.otPremiumHours
      late = result.late
      lateHours = result.lateHours
    } else {
      // Shift 2: 20:00-05:00
      const result = calculateShift2(
        checkIn.scan_date,
        checkIn.scan_time,
        checkOut.scan_date,
        checkOut.scan_time,
        isHoliday
      )
      actualHours = result.actualHours
      otHours = result.otHours
      otNormalHours = result.otNormalHours
      otSpecialHours = result.otSpecialHours
      otPremiumHours = result.otPremiumHours
    }
    
    sessions.push({
      workDate,
      checkInTime: checkIn.scan_time,
      checkOutTime: checkOut.scan_time,
      actualHours,
      otHours,
      otNormalHours,
      otSpecialHours,
      otPremiumHours,
      isHoliday,
      shift,
      late,
      lateHours,
      allowLateNextDay: false
    })
  }
  
  return sessions
}
```

**ผลลัพธ์:**  
```javascript
[
  {
    workDate: "2025-11-01",
    checkInTime: "08:00:00",
    checkOutTime: "18:30:00",
    actualHours: 8,
    otHours: 1.0,
    otNormalHours: 1.0,
    otSpecialHours: 0,
    otPremiumHours: 0,
    isHoliday: false,
    shift: 1,
    late: false,
    lateHours: 0
  },
  ...
]
```

---

## 5. Store Daily Attendance

### 📁 ไฟล์: `/app/api/import-scans/route.ts`

#### Step 5.1: Process Each Employee
```typescript
// บรรทัด 198-349
const attendanceMap = new Map<string, any>()

for (const employeeId of affectedEmployees) {
  const employeeScans = scansByEmployee.get(employeeId) || []
  
  if (employeeScans.length === 0) continue
  
  // Calculate OT
  const workSessions = calculateOTFromScans(employeeScans, holidays || [])
  
  // Merge sessions for same date (if multiple shifts in one day)
  for (const session of workSessions) {
    const key = `${employeeId}|${session.workDate}`
    
    if (!attendanceMap.has(key)) {
      // First session for this date
      attendanceMap.set(key, {
        employee_id: employeeId,
        work_date: session.workDate,
        check_in_time: session.checkInTime,
        check_out_time: session.checkOutTime,
        scheduled_in_time: session.shift === 1 ? '08:00:00' : '20:00:00',
        scheduled_out_time: session.shift === 1 ? '17:00:00' : '05:00:00',
        actual_hours: session.actualHours,
        ot_hours: session.otHours,
        ot_normal_hours: session.otNormalHours,
        ot_special_hours: session.otSpecialHours,
        ot_premium_hours: session.otPremiumHours,
        is_holiday: session.isHoliday,
        late: session.late,
        late_hours: session.lateHours
      })
    } else {
      // Merge with existing session
      const existing = attendanceMap.get(key)
      existing.actual_hours += session.actualHours
      existing.ot_hours += session.otHours
      existing.ot_normal_hours += session.otNormalHours
      existing.ot_special_hours += session.otSpecialHours
      existing.ot_premium_hours += session.otPremiumHours
      existing.check_out_time = session.checkOutTime // Update to latest
    }
  }
}

const allAttendanceRecords = Array.from(attendanceMap.values())
```

---

#### Step 5.2: Upsert to Database
```typescript
// บรรทัด 329-349
if (allAttendanceRecords.length > 0) {
  const { error: attendanceError } = await supabase
    .from('daily_attendance')
    .upsert(allAttendanceRecords, {
      onConflict: 'employee_id,work_date'  // Update if exists
    })
  
  if (attendanceError) {
    console.error('Failed to upsert attendance:', attendanceError)
    throw attendanceError
  }
  
  console.log(`✅ Upserted ${allAttendanceRecords.length} attendance records`)
}
```

**ผลลัพธ์:**  
✅ ตาราง `daily_attendance` มีข้อมูลการทำงานรายวัน พร้อม OT hours

---

## 6. Auto Calculate Wages

### 📁 ไฟล์: `/app/api/import-scans/route.ts`

#### Step 6.1: Detect Affected Months
```typescript
// บรรทัด 354-364
// หาเดือนที่ได้รับผลกระทบ
const affectedMonths = new Set<string>()
allAttendanceRecords.forEach(record => {
  const date = new Date(record.work_date)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  affectedMonths.add(`${year}-${month}`)
})

console.log(`Auto-calculating wages for ${affectedMonths.size} affected months:`, 
  Array.from(affectedMonths))
```

**ตัวอย่าง:**  
```javascript
affectedMonths = Set(["2025-11"])
```

---

#### Step 6.2: Calculate Wages for Each Month

```typescript
// บรรทัด 366-395
let wagesCalculated = 0
const wageResults: string[] = []

for (const monthStr of affectedMonths) {
  try {
    const [year, month] = monthStr.split('-').map(Number)
    
    console.log(`Calculating wages for ${month}/${year}...`)
    
    // เรียก calculate wages API แบบ internal
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
      console.log(`✅ Calculated ${calculateData.calculated} wage records`)
    } else {
      console.error(`❌ Failed to calculate wages:`, calculateData.error)
      wageResults.push(`${month}/${year}: ERROR`)
    }
  } catch (err) {
    console.error(`Error calculating wages for ${monthStr}:`, err)
    wageResults.push(`${monthStr}: ERROR`)
  }
}
```

---

### 📁 ไฟล์: `/app/api/wages/calculate/route.ts`

#### Step 6.3: Wage Calculation Logic
```typescript
// บรรทัด 11-235
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { month, year } = body
  
  // 1. Get all employees
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
  
  const wageRecords = []
  
  // 2. Process both periods (1 and 2)
  for (const period of [1, 2]) {
    const { startDate, endDate } = getPeriodDates(year, month, period)
    
    // 3. For each employee
    for (const employee of employees) {
      // 3.1 Get attendance for this period
      const { data: attendances } = await supabase
        .from('daily_attendance')
        .select('*')
        .eq('employee_id', employee.employee_id)
        .gte('work_date', startDate)
        .lte('work_date', endDate)
      
      if (!attendances || attendances.length === 0) continue
      
      // 3.2 Calculate daily wages
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
          employee.perhr_salary || 0
        )
      )
      
      // 3.3 Check attendance bonus (no leave, no late)
      const hasBonus = checkAttendanceBonus(attendances)
      
      // 3.4 Calculate period wage
      const periodWage = calculatePeriodWage(
        employee,
        dailyWages,
        hasBonus
      )
      
      // 3.5 Calculate SSO (monthly, split between 2 periods)
      const ssoCalc = calculateMonthlySSO(period1Income, period2Income)
      const ssoForThisPeriod = period === 1 ? ssoCalc.period1_sso : ssoCalc.period2_sso
      
      // 3.6 Create wage record
      const wageRecord = {
        employee_id: employee.employee_id,
        year,
        month,
        period,
        base_wage: periodWage.total_base_wage,
        ot_wage: periodWage.total_ot1_wage + periodWage.total_ot2_wage + periodWage.total_ot3_wage,
        attendance_bonus: periodWage.attendance_bonus,
        total_income: periodWage.total_income,
        sso: ssoForThisPeriod,
        tax: periodWage.tax_withholding,
        total_deduction: ssoForThisPeriod + periodWage.tax_withholding,
        net_wage: periodWage.total_income - ssoForThisPeriod - periodWage.tax_withholding,
        updated_at: new Date().toISOString()
      }
      
      wageRecords.push(wageRecord)
    }
  }
  
  // 4. Upsert to wage_summary
  const { error: upsertError } = await supabase
    .from('wage_summary')
    .upsert(wageRecords, {
      onConflict: 'employee_id,year,month,period'
    })
  
  if (upsertError) throw upsertError
  
  return NextResponse.json({
    success: true,
    message: `Calculated and saved ${wageRecords.length} wage records`,
    calculated: wageRecords.length
  })
}
```

**ผลลัพธ์:**  
✅ ตาราง `wage_summary` มีข้อมูลค่าจ้างครบทุกคน ทุกงวด

---

### 📁 ไฟล์: `/lib/wageCalculations.ts`

#### Wage Calculation Functions

```typescript
// calculateDailyWage
export function calculateDailyWage(
  attendance: DailyAttendance,
  perhrSalary: number
): DailyWage {
  return {
    base_wage: (attendance.actual_hours || 0) * perhrSalary,
    ot1_wage: (attendance.ot_normal_hours || 0) * perhrSalary * 1.5,
    ot2_wage: (attendance.ot_special_hours || 0) * perhrSalary * 2.0,
    ot3_wage: (attendance.ot_premium_hours || 0) * perhrSalary * 3.0
  }
}

// checkAttendanceBonus
export function checkAttendanceBonus(attendances: DailyAttendance[]): boolean {
  // เงื่อนไข: ไม่ลางาน, ไม่มาสาย
  return attendances.every(att => !att.is_leave && !att.late)
}

// calculateMonthlySSO
export function calculateMonthlySSO(
  period1Income: number,
  period2Income: number
): { period1_sso: number; period2_sso: number; monthly_total: number } {
  const totalIncome = period1Income + period2Income
  const ssoBase = Math.min(totalIncome, 15000)  // เพดาน 15,000
  const monthlySSO = ssoBase * 0.05              // อัตรา 5%
  
  // แบ่งตามสัดส่วนรายได้
  const period1_sso = period1Income >= period2Income 
    ? monthlySSO 
    : Math.floor(monthlySSO * (period1Income / totalIncome))
  const period2_sso = monthlySSO - period1_sso
  
  return {
    period1_sso,
    period2_sso,
    monthly_total: monthlySSO
  }
}

// calculateWithholdingTax (Cumulative YTD)
export function calculateWithholdingTax(input: TaxCalculationInput): TaxCalculationResult {
  // 1. ประมาณการรายได้ทั้งปี
  const estimatedYearlyIncome = input.ytd_income_before_this_period +
    input.current_period_income +
    (input.current_period_income * input.remaining_periods_excluding_current)
  
  // 2. หักค่าใช้จ่าย (สูงสุด 100,000)
  const expenseDeduction = Math.min(
    estimatedYearlyIncome * 0.5,
    input.max_expense_deduction
  )
  
  // 3. หักค่าลดหย่อน
  const taxableIncome = Math.max(
    0,
    estimatedYearlyIncome - expenseDeduction - input.tax_allowance
  )
  
  // 4. คำนวณภาษีตามขั้นบันได
  const yearlyTax = calculateProgressiveTax(taxableIncome)
  
  // 5. ภาษีที่ต้องหักงวดนี้
  const remainingTax = Math.max(0, yearlyTax - input.ytd_tax_before_this_period)
  const periodsLeft = input.remaining_periods_including_current
  const taxThisPeriod = periodsLeft > 0 ? Math.floor(remainingTax / periodsLeft) : 0
  
  return {
    estimated_yearly_income: estimatedYearlyIncome,
    expense_deduction: expenseDeduction,
    taxable_income: taxableIncome,
    yearly_tax: yearlyTax,
    tax_this_period: taxThisPeriod
  }
}
```

---

#### Step 6.4: Return to Import API
```typescript
// บรรทัด 397-412 ใน /app/api/import-scans/route.ts
return NextResponse.json({
  success: true,
  inserted: actualInserted,
  duplicates: duplicates,
  recalculated: duplicates > 0 && actualInserted === 0 ? allAttendanceRecords.length : 0,
  wagesCalculated,          // ⭐ จำนวนค่าจ้างที่คำนวณ
  wageDetails: wageResults, // ⭐ รายละเอียดแต่ละเดือน
  message: actualInserted > 0
    ? `✅ Imported ${actualInserted} scans. ${duplicates} duplicates skipped. 💰 Auto-calculated ${wagesCalculated} wage records.`
    : `All ${duplicates} scans were duplicates. Recalculated OT for ${allAttendanceRecords.length} records. 💰 Auto-calculated ${wagesCalculated} wages.`
})
```

---

## 7. Display Results

### 7.1 Frontend: Show Message

### 📁 ไฟล์: `/app/page.tsx`

```typescript
// บรรทัด 209-226
if (result.success) {
  let message = `✅ ${result.message}`
  
  if (result.wagesCalculated > 0) {
    message += `\n\n💰 คำนวณค่าจ้างอัตโนมัติ: ${result.wagesCalculated} รายการ`
    message += `\n📊 ${result.wageDetails.join(', ')}`
  }
  
  setImportMessage(message)
  setImportFile(null)
  await fetchAttendanceData() // Refresh OT table
}
```

**ตัวอย่างข้อความ:**
```
✅ Imported 150 scans. 0 duplicates skipped.
💰 Auto-calculated 20 wage records.
📊 11/2025: 20 records
```

---

### 7.2 Display OT Hours

### 📁 ไฟล์: `/app/page.tsx`

```typescript
// บรรทัด 101-122
const fetchAttendanceData = async () => {
  setLoading(true)
  const monthStr = `${selectedYear}-${selectedMonth}`
  
  // Fetch period 1
  const res1 = await fetch(`/api/attendance?month=${monthStr}&period=1`)
  const data1 = await res1.json()
  if (data1.success) {
    setPeriod1Data(data1.data)
  }
  
  // Fetch period 2
  const res2 = await fetch(`/api/attendance?month=${monthStr}&period=2`)
  const data2 = await res2.json()
  if (data2.success) {
    setPeriod2Data(data2.data)
  }
  
  setLoading(false)
}
```

**แสดงในตาราง:**
- วันที่
- ชั่วโมง OT แต่ละวัน
- รวม OT (ปกติ, พิเศษ, ขั้นสูง)

---

### 7.3 Display Wages

### 📁 ไฟล์: `/app/wages/[id]/page.tsx`

```typescript
// Fetch wage data
useEffect(() => {
  const fetchWageData = async () => {
    // 1. Get period wage
    const res = await fetch(`/api/wages/employee/${employeeId}?month=${month}&period=${period}`)
    const data = await res.json()
    
    // 2. Get YTD summary
    const ytdRes = await fetch(`/api/employees/${employeeId}/ytd?year=${year}`)
    const ytdData = await ytdRes.json()
    
    // 3. Get All-Time summary
    const allTimeRes = await fetch(`/api/employees/${employeeId}/all-time-summary`)
    const allTimeData = await allTimeRes.json()
    
    // Display all data
    setPeriodWage(data.data.periodWage)
    setYtd(ytdData.data)
    setAllTimeData(allTimeData.data)
  }
  
  fetchWageData()
}, [employeeId, month, period])
```

**แสดงข้อมูล:**
- รายได้งวดนี้ (base, OT, bonus, รวม)
- ยอดสะสมรายปี (YTD) 6 รายการ
- ยอดสะสมทั้งหมด (All-Time) 6 รายการ

---

### 7.4 Display in LIFF

### 📁 ไฟล์: `/app/liff/employee-ot-viewer/page.tsx`

```typescript
// Fetch data for logged-in user
useEffect(() => {
  const fetchData = async () => {
    // 1. Get employee from LINE ID
    const profile = await liff.getProfile()
    const { data: employee } = await fetch(`/api/employees?line_id=${profile.userId}`)
    
    // 2. Get wage summaries
    const wageRes = await fetch(
      `/api/wages/employee-summary?employee_id=${employee.employee_id}&year=${selectedYear}`
    )
    const wageSummaries = await wageRes.json()
    
    // 3. Get YTD
    const ytdRes = await fetch(`/api/employees/${employee.employee_id}/ytd?year=${selectedYear}`)
    const ytdData = await ytdRes.json()
    
    // 4. Get All-Time
    const allTimeRes = await fetch(`/api/employees/${employee.employee_id}/all-time-summary`)
    const allTimeData = await allTimeRes.json()
    
    // Display
    setWageSummaries(wageSummaries.data)
    setYtdData(ytdData.data)
    setAllTimeData(allTimeData.data)
  }
  
  fetchData()
}, [selectedYear])
```

**แสดงข้อมูล:**
- รายละเอียดค่าจ้างแต่ละงวด
- ยอดสะสมรายปี 6 รายการ
- ยอดสะสมทั้งหมด 6 รายการ

---

## 📊 สรุป Database Tables

### ตารางที่ได้รับผลกระทบ (ตามลำดับ):

```
1. attendance_scans          ← Insert raw scans
2. employees                 ← Create missing employees
3. daily_attendance          ← Upsert OT hours
4. wage_summary              ← Upsert wage calculations
```

---

## 🔄 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ACTION (Frontend)                                   │
│    /app/page.tsx                                            │
│    - Select file                                            │
│    - Click "นำเข้าข้อมูล"                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. PARSE FILE                                               │
│    /app/api/import-scans/route.ts                          │
│    /lib/otCalculator.ts → parseScanFile()                  │
│    - Read .txt file                                         │
│    - Extract scan records                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. CHECK DUPLICATES & CREATE EMPLOYEES                      │
│    /app/api/import-scans/route.ts                          │
│    - Query existing scans                                   │
│    - Filter duplicates                                      │
│    - Create missing employees in DB                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. STORE SCANS                                              │
│    INSERT INTO attendance_scans ✅                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. CALCULATE OT HOURS                                       │
│    /lib/otCalculator.ts → calculateOTFromScans()           │
│    - Pair IN/OUT scans                                      │
│    - Determine shift (1 or 2)                               │
│    - Calculate actual hours                                 │
│    - Calculate OT (Normal/Special/Premium)                  │
│    - Check late/holiday                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. STORE DAILY ATTENDANCE                                   │
│    UPSERT INTO daily_attendance ✅                          │
│    - work_date                                              │
│    - actual_hours                                           │
│    - ot_normal_hours, ot_special_hours, ot_premium_hours   │
│    - is_holiday, late, late_hours                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. AUTO DETECT AFFECTED MONTHS                              │
│    /app/api/import-scans/route.ts                          │
│    - Extract year/month from work_date                      │
│    - Create Set of unique months                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. CALCULATE WAGES (For Each Month)                         │
│    /app/api/wages/calculate/route.ts                       │
│    /lib/wageCalculations.ts                                │
│                                                             │
│    For each employee:                                       │
│    ├─ Get daily_attendance for period 1 & 2                │
│    ├─ Calculate daily wages (base + OT)                    │
│    ├─ Check attendance bonus                                │
│    ├─ Calculate period wage                                 │
│    ├─ Calculate SSO (monthly, split 2 periods)             │
│    └─ Calculate withholding tax (Cumulative YTD)           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. STORE WAGE SUMMARY                                       │
│    UPSERT INTO wage_summary ✅                              │
│    - year, month, period                                    │
│    - base_wage, ot_wage, attendance_bonus                   │
│    - total_income                                           │
│    - sso, tax                                               │
│    - total_deduction, net_wage                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. RETURN SUCCESS MESSAGE                                  │
│     /app/api/import-scans/route.ts                         │
│     {                                                       │
│       success: true,                                        │
│       inserted: 150,                                        │
│       wagesCalculated: 20,                                  │
│       wageDetails: ["11/2025: 20 records"]                 │
│     }                                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 11. FRONTEND DISPLAY                                        │
│     /app/page.tsx                                           │
│     - Show success message                                  │
│     - Refresh OT table                                      │
│                                                             │
│     User can now view:                                      │
│     ├─ OT hours in / (homepage)                            │
│     ├─ Wages in /wages/[id]                                │
│     └─ Summary in /liff/employee-ot-viewer                 │
└─────────────────────────────────────────────────────────────┘
```

---

## ⏱️ ประมาณเวลาแต่ละขั้น

| ขั้นตอน | เวลา | หมายเหตุ |
|--------|------|---------|
| 1-3: Parse & Validate | 1-2 วินาที | ขึ้นกับขนาดไฟล์ |
| 4: Store Scans | 2-3 วินาที | Batch insert |
| 5: Calculate OT | 3-5 วินาที | 100-200 scans |
| 6: Store Attendance | 2-3 วินาที | Upsert |
| 7-9: Calculate Wages | 5-15 วินาที | ขึ้นกับจำนวนพนักงาน |
| **รวม** | **15-30 วินาที** | สำหรับ 10-20 คน |

---

## ✅ สรุปไฟล์ที่เกี่ยวข้องทั้งหมด

### Backend API:
1. `/app/api/import-scans/route.ts` - Main import logic ⭐
2. `/app/api/wages/calculate/route.ts` - Wage calculation ⭐
3. `/app/api/attendance/route.ts` - Fetch attendance data
4. `/app/api/wages/employee/[id]/route.ts` - Fetch wage details
5. `/app/api/employees/[id]/ytd/route.ts` - Fetch YTD summary
6. `/app/api/employees/[id]/all-time-summary/route.ts` - Fetch All-Time summary

### Libraries:
7. `/lib/otCalculator.ts` - OT calculation logic ⭐
8. `/lib/wageCalculations.ts` - Wage calculation functions ⭐
9. `/lib/supabase.ts` - Database client

### Frontend:
10. `/app/page.tsx` - Homepage (Import UI) ⭐
11. `/app/wages/page.tsx` - Wages overview
12. `/app/wages/[id]/page.tsx` - Wage details
13. `/app/liff/employee-ot-viewer/page.tsx` - LIFF wage viewer

### Database:
14. `wage_summary_migration.sql` - Create wage_summary table ⭐

---

**สร้างเมื่อ:** 20 พฤศจิกายน 2568  
**เวอร์ชัน:** 2.0 (Full Automation)  
**สถานะ:** ✅ Complete Workflow Documentation

