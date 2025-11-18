# คู่มือการพัฒนาระบบคำนวณค่าจ้าง

## 📋 สรุปสิ่งที่ทำแล้ว

### ✅ 1. Database Schema
สร้างไฟล์ `wage-system-migration.sql` ที่ประกอบด้วย:

- **7 ตารางหลัก**:
  1. `wage_periods` - งวดจ่ายเงิน
  2. `daily_wages` - ค่าจ้างรายวัน
  3. `attendance_punctuality` - ตรวจสอบเบี้ยขยัน
  4. `period_wages` - สรุปค่าจ้างรายงวด
  5. `sso_monthly_summary` - ประกันสังคมรายเดือน
  6. `tax_calculations` - ภาษีเงินได้
  7. `employee_wage_summary_ytd` - สรุปสะสมรายปี

- **Triggers อัตโนมัติ**: คำนวณค่าจ้างรายวันเมื่อ insert/update
- **Views**: สำหรับ query ข้อมูลง่ายขึ้น
- **Sample Data**: งวดตัวอย่างพฤศจิกายน-ธันวาคม 2567

### ✅ 2. หน้า /wages
สร้างไฟล์ `app/wages/page.tsx` ที่มี:
- **2 Tabs**:
  - Tab 1: ตารางค่าจ้างรายวัน
  - Tab 2: สรุปค่าจ้างพนักงาน (มี pagination, search)
- เลือกเดือน/ปี/งวด
- Real-time search (ชื่อและรหัส)
- Pagination (10 รายการ/หน้า)
- คลิกชื่อพนักงานแล้วไปหน้า wage-detail

### ✅ 3. Utility Functions
สร้างไฟล์ `lib/wageCalculations.ts` ที่มี:
- `calculateDailyWage()` - คำนวณค่าจ้างรายวัน
- `checkAttendanceBonus()` - ตรวจสอบเบี้ยขยัน
- `calculatePeriodWage()` - คำนวณค่าจ้างรายงวด
- `calculateMonthlySSO()` - คำนวณประกันสังคม (รองรับ 2 งวด/เดือน)
- `calculateWithholdingTax()` - คำนวณภาษีเงินได้
- Helper functions อื่นๆ

---

## 🚧 สิ่งที่ต้องทำต่อ

### 1. สร้าง API Routes

#### 1.1 API: ค่าจ้างรายวัน
สร้างไฟล์ `app/api/wages/daily/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPeriodDates, calculateDailyWage } from '@/lib/wageCalculations'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month') // Format: YYYY-MM
    const period = parseInt(searchParams.get('period') || '1') as 1 | 2

    if (!month) {
      return NextResponse.json({ success: false, error: 'Missing month parameter' }, { status: 400 })
    }

    const [year, monthNum] = month.split('-').map(Number)
    const { startDate, endDate } = getPeriodDates(year, monthNum, period)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // ดึงข้อมูลการเข้างานรายวัน
    const { data: attendances, error } = await supabase
      .from('daily_attendance')
      .select(`
        *,
        employees (
          employee_id,
          name,
          perhr_salary
        )
      `)
      .gte('work_date', startDate)
      .lte('work_date', endDate)
      .order('work_date', { ascending: true })

    if (error) throw error

    // คำนวณค่าจ้างรายวัน
    const dailyWages = attendances?.map(att => {
      const perhrSalary = att.employees?.perhr_salary || 0
      return calculateDailyWage(
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
    }) || []

    return NextResponse.json({ success: true, data: dailyWages })
  } catch (error: any) {
    console.error('Error fetching daily wages:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
```

#### 1.2 API: สรุปค่าจ้างพนักงาน
สร้างไฟล์ `app/api/wages/summary/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  getPeriodDates,
  calculateDailyWage,
  checkAttendanceBonus,
  calculatePeriodWage
} from '@/lib/wageCalculations'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month')
    const period = parseInt(searchParams.get('period') || '1') as 1 | 2

    if (!month) {
      return NextResponse.json({ success: false, error: 'Missing month parameter' }, { status: 400 })
    }

    const [year, monthNum] = month.split('-').map(Number)
    const { startDate, endDate } = getPeriodDates(year, monthNum, period)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // ดึงข้อมูลพนักงานทั้งหมด
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('employee_id, name, department, perhr_salary, perday_salary')

    if (empError) throw empError

    // ดึงข้อมูลการเข้างานของทุกคน
    const { data: attendances, error: attError } = await supabase
      .from('daily_attendance')
      .select('*')
      .gte('work_date', startDate)
      .lte('work_date', endDate)

    if (attError) throw attError

    // คำนวณค่าจ้างแต่ละคน
    const employeeWages = employees?.map(emp => {
      // กรองข้อมูลการเข้างานของพนักงานคนนี้
      const empAttendances = attendances?.filter(att => att.employee_id === emp.employee_id) || []

      // คำนวณค่าจ้างรายวัน
      const dailyWages = empAttendances.map(att =>
        calculateDailyWage(
          {
            work_date: att.work_date,
            actual_hours: att.actual_hours || 0,
            ot_normal_hours: att.ot_normal_hours || 0,
            ot_special_hours: att.ot_special_hours || 0,
            ot_premium_hours: att.ot_premium_hours || 0,
            scheduled_in_time: att.scheduled_in_time,
            check_in_time: att.check_in_time,
            is_holiday: att.is_holiday || false,
            is_leave: att.is_leave || false,
            late: att.late || false
          },
          emp.perhr_salary || 0
        )
      )

      // ตรวจสอบเบี้ยขยัน
      const hasBonus = checkAttendanceBonus(empAttendances.map(att => ({
        work_date: att.work_date,
        actual_hours: att.actual_hours || 0,
        ot_normal_hours: att.ot_normal_hours || 0,
        ot_special_hours: att.ot_special_hours || 0,
        ot_premium_hours: att.ot_premium_hours || 0,
        scheduled_in_time: att.scheduled_in_time,
        check_in_time: att.check_in_time,
        is_holiday: att.is_holiday || false,
        is_leave: att.is_leave || false,
        late: att.late || false
      })))

      // คำนวณค่าจ้างรายงวด
      return calculatePeriodWage(
        {
          employee_id: emp.employee_id,
          name: emp.name,
          department: emp.department,
          perhr_salary: emp.perhr_salary || 0,
          perday_salary: emp.perday_salary || 0
        },
        dailyWages,
        hasBonus
      )
    }) || []

    return NextResponse.json({ success: true, data: employeeWages })
  } catch (error: any) {
    console.error('Error fetching wage summary:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
```

#### 1.3 API: รายละเอียดค่าจ้างพนักงาน
สร้างไฟล์ `app/api/wages/employee/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  getPeriodDates,
  calculateDailyWage,
  checkAttendanceBonus,
  calculatePeriodWage,
  calculateMonthlySSO
} from '@/lib/wageCalculations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month')
    const period = parseInt(searchParams.get('period') || '1') as 1 | 2

    if (!month) {
      return NextResponse.json({ success: false, error: 'Missing month parameter' }, { status: 400 })
    }

    const [year, monthNum] = month.split('-').map(Number)
    const { startDate, endDate } = getPeriodDates(year, monthNum, period)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // ดึงข้อมูลพนักงาน
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('employee_id', employeeId)
      .single()

    if (empError) throw empError

    // ดึงข้อมูลการเข้างาน
    const { data: attendances, error: attError } = await supabase
      .from('daily_attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('work_date', startDate)
      .lte('work_date', endDate)
      .order('work_date', { ascending: true })

    if (attError) throw attError

    // คำนวณค่าจ้างรายวัน
    const dailyWages = attendances?.map(att =>
      calculateDailyWage(
        {
          work_date: att.work_date,
          actual_hours: att.actual_hours || 0,
          ot_normal_hours: att.ot_normal_hours || 0,
          ot_special_hours: att.ot_special_hours || 0,
          ot_premium_hours: att.ot_premium_hours || 0,
          scheduled_in_time: att.scheduled_in_time,
          check_in_time: att.check_in_time,
          is_holiday: att.is_holiday || false,
          is_leave: att.is_leave || false,
          late: att.late || false
        },
        employee.perhr_salary || 0
      )
    ) || []

    // ตรวจสอบเบี้ยขยัน
    const hasBonus = checkAttendanceBonus(attendances?.map(att => ({
      work_date: att.work_date,
      actual_hours: att.actual_hours || 0,
      ot_normal_hours: att.ot_normal_hours || 0,
      ot_special_hours: att.ot_special_hours || 0,
      ot_premium_hours: att.ot_premium_hours || 0,
      scheduled_in_time: att.scheduled_in_time,
      check_in_time: att.check_in_time,
      is_holiday: att.is_holiday || false,
      is_leave: att.is_leave || false,
      late: att.late || false
    })) || [])

    // คำนวณค่าจ้างรายงวด
    const periodWage = calculatePeriodWage(
      {
        employee_id: employee.employee_id,
        name: employee.name,
        department: employee.department,
        perhr_salary: employee.perhr_salary || 0,
        perday_salary: employee.perday_salary || 0
      },
      dailyWages,
      hasBonus
    )

    // ดึงข้อมูลงวดอื่นของเดือนเดียวกันเพื่อคำนวณ SSO
    const otherPeriod = period === 1 ? 2 : 1
    const { startDate: otherStart, endDate: otherEnd } = getPeriodDates(year, monthNum, otherPeriod)

    const { data: otherAttendances } = await supabase
      .from('daily_attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('work_date', otherStart)
      .lte('work_date', otherEnd)

    const otherDailyWages = otherAttendances?.map(att =>
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
    ) || []

    const otherHasBonus = checkAttendanceBonus(otherAttendances?.map(att => ({
      work_date: att.work_date,
      actual_hours: att.actual_hours || 0,
      ot_normal_hours: att.ot_normal_hours || 0,
      ot_special_hours: att.ot_special_hours || 0,
      ot_premium_hours: att.ot_premium_hours || 0,
      scheduled_in_time: att.scheduled_in_time,
      check_in_time: att.check_in_time,
      is_holiday: att.is_holiday || false,
      is_leave: att.is_leave || false,
      late: att.late || false
    })) || [])

    const otherPeriodWage = calculatePeriodWage(
      {
        employee_id: employee.employee_id,
        name: employee.name,
        department: employee.department,
        perhr_salary: employee.perhr_salary || 0,
        perday_salary: employee.perday_salary || 0
      },
      otherDailyWages,
      otherHasBonus
    )

    // คำนวณประกันสังคม
    const period1Income = period === 1 ? periodWage.total_income : otherPeriodWage.total_income
    const period2Income = period === 2 ? periodWage.total_income : otherPeriodWage.total_income
    const ssoCalc = calculateMonthlySSO(period1Income, period2Income)

    // ดึงข้อมูล YTD
    const { data: ytdData } = await supabase
      .from('employee_wage_summary_ytd')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('year', year)
      .single()

    return NextResponse.json({
      success: true,
      data: {
        employee,
        dailyWages,
        periodWage,
        sso: ssoCalc,
        ytd: ytdData || null
      }
    })
  } catch (error: any) {
    console.error('Error fetching employee wage detail:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
```

### 2. สร้างหน้า wage-detail

สร้างไฟล์ `app/wages/[id]/page.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

interface EmployeeInfo {
  employee_id: string
  name: string
  department: string
  perhr_salary: number
  perday_salary: number
}

interface DailyWage {
  work_date: string
  base_wage: number
  ot1_wage: number
  ot2_wage: number
  ot3_wage: number
  daily_total_wage: number
  ot_normal_hours: number
  ot_special_hours: number
  ot_premium_hours: number
}

interface PeriodWage {
  total_base_wage: number
  total_ot1_wage: number
  total_ot2_wage: number
  total_ot3_wage: number
  gross_wage: number
  attendance_bonus: number
  total_income: number
  sso_employee: number
  tax_withholding: number
  total_deductions: number
  net_wage: number
}

interface SSOData {
  period1_income: number
  period2_income: number
  total_monthly_income: number
  sso_base: number
  period1_sso: number
  period2_sso: number
  total_monthly_sso: number
  employer_sso: number
}

interface YTDData {
  ytd_gross_wage: number
  ytd_attendance_bonus: number
  ytd_total_income: number
  ytd_sso: number
  ytd_tax: number
  ytd_other_deductions: number
  ytd_total_deductions: number
  ytd_net_wage: number
}

export default function WageDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const employeeId = params.id as string
  const month = searchParams.get('month')
  const period = parseInt(searchParams.get('period') || '1')

  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState<EmployeeInfo | null>(null)
  const [dailyWages, setDailyWages] = useState<DailyWage[]>([])
  const [periodWage, setPeriodWage] = useState<PeriodWage | null>(null)
  const [sso, setSSO] = useState<SSOData | null>(null)
  const [ytd, setYTD] = useState<YTDData | null>(null)

  // State สำหรับเลือกดูรายวัน
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [showDailyDetail, setShowDailyDetail] = useState(false)

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ]

  useEffect(() => {
    if (employeeId && month && period) {
      fetchWageDetail()
    }
  }, [employeeId, month, period])

  const fetchWageDetail = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/wages/employee/${employeeId}?month=${month}&period=${period}`)
      const data = await res.json()

      if (data.success) {
        setEmployee(data.data.employee)
        setDailyWages(data.data.dailyWages)
        setPeriodWage(data.data.periodWage)
        setSSO(data.data.sso)
        setYTD(data.data.ytd)
      }
    } catch (error) {
      console.error('Error fetching wage detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleDate = (date: string) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter(d => d !== date))
    } else {
      setSelectedDates([...selectedDates, date])
    }
  }

  const getSelectedDailyWages = () => {
    return dailyWages.filter(dw => selectedDates.includes(dw.work_date))
  }

  if (loading) {
    return (
      <div className="app-container">
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (!employee || !periodWage) {
    return (
      <div className="app-container">
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>ไม่พบข้อมูลพนักงาน</p>
          <a href="/wages" className="btn btn-primary" style={{ marginTop: '16px' }}>
            กลับหน้ารายการ
          </a>
        </div>
      </div>
    )
  }

  const [year, monthNum] = (month || '').split('-').map(Number)

  return (
    <div className="app-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">รายละเอียดค่าจ้างพนักงาน</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              {thaiMonths[monthNum - 1]} {year + 543} - งวดที่ {period}
            </p>
          </div>
          <a href="/wages" className="btn btn-secondary">
            ← กลับหน้ารายการ
          </a>
        </div>
      </div>

      {/* ข้อมูลพนักงาน */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
          ข้อมูลพนักงาน
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>รหัสพนักงาน</div>
            <div style={{ fontSize: '15px', fontWeight: '600' }}>{employee.employee_id}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ชื่อพนักงาน</div>
            <div style={{ fontSize: '15px', fontWeight: '600' }}>{employee.name}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>แผนก</div>
            <div style={{ fontSize: '15px', fontWeight: '600' }}>{employee.department}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ค่าจ้างรายวัน</div>
            <div style={{ fontSize: '15px', fontWeight: '600' }}>
              {employee.perday_salary?.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ค่าจ้างรายชั่วโมง</div>
            <div style={{ fontSize: '15px', fontWeight: '600' }}>
              {employee.perhr_salary?.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
            </div>
          </div>
        </div>
      </div>

      {/* รายได้รวม */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
          รายได้รวม (งวดที่ {period})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ค่าจ้างพื้นฐาน</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {periodWage.total_base_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ค่า OT ปกติ (×1.5)</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {periodWage.total_ot1_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ค่า OT พิเศษ (×2)</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {periodWage.total_ot2_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ค่า OT ขั้นสูง (×3)</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {periodWage.total_ot3_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>เบี้ยขยัน</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: periodWage.attendance_bonus > 0 ? 'var(--success)' : 'var(--text-primary)' }}>
              {periodWage.attendance_bonus.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'var(--primary-light)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--primary)', marginBottom: '4px', fontWeight: '600' }}>รวมรายได้</div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--primary)' }}>
              {periodWage.total_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* เลือกดูรายวัน */}
        <div>
          <button
            className="btn btn-secondary"
            onClick={() => setShowDailyDetail(!showDailyDetail)}
            style={{ marginBottom: '16px' }}
          >
            {showDailyDetail ? 'ซ่อนรายละเอียดรายวัน' : 'ดูรายละเอียดรายวัน'}
          </button>

          {showDailyDetail && (
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                เลือกวันที่ต้องการดู:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {dailyWages.map(dw => (
                  <label
                    key={dw.work_date}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      background: selectedDates.includes(dw.work_date) ? 'var(--primary-light)' : 'var(--surface-bg)',
                      border: selectedDates.includes(dw.work_date) ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDates.includes(dw.work_date)}
                      onChange={() => toggleDate(dw.work_date)}
                    />
                    {new Date(dw.work_date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })}
                  </label>
                ))}
              </div>

              {selectedDates.length > 0 && (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>วันที่</th>
                        <th className="text-right">ค่าจ้างพื้นฐาน</th>
                        <th className="text-right">ค่า OT 1</th>
                        <th className="text-right">ค่า OT 2</th>
                        <th className="text-right">ค่า OT 3</th>
                        <th className="text-right">รวม</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSelectedDailyWages().map(dw => (
                        <tr key={dw.work_date}>
                          <td>{new Date(dw.work_date).toLocaleDateString('th-TH')}</td>
                          <td className="text-right">{dw.base_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                          <td className="text-right">{dw.ot1_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                          <td className="text-right">{dw.ot2_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                          <td className="text-right">{dw.ot3_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                          <td className="text-right" style={{ fontWeight: '700' }}>
                            {dw.daily_total_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ชั่วโมง OT */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
          จำนวนชั่วโมง OT
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>OT ปกติ (×1.5)</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {dailyWages.reduce((sum, dw) => sum + dw.ot_normal_hours, 0).toFixed(2)} ชม.
            </div>
          </div>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>OT พิเศษ (×2)</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {dailyWages.reduce((sum, dw) => sum + dw.ot_special_hours, 0).toFixed(2)} ชม.
            </div>
          </div>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>OT ขั้นสูง (×3)</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {dailyWages.reduce((sum, dw) => sum + dw.ot_premium_hours, 0).toFixed(2)} ชม.
            </div>
          </div>
          <div style={{ background: 'var(--primary-light)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--primary)', marginBottom: '4px', fontWeight: '600' }}>รวม OT ทั้งหมด</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>
              {dailyWages.reduce((sum, dw) => sum + dw.ot_normal_hours + dw.ot_special_hours + dw.ot_premium_hours, 0).toFixed(2)} ชม.
            </div>
          </div>
        </div>
      </div>

      {/* ประกันสังคม */}
      {sso && (
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
            ประกันสังคม (SSO) - {thaiMonths[monthNum - 1]} {year + 543}
          </h3>
          <div style={{ background: 'var(--bg-warning)', padding: '12px', borderRadius: '6px', marginBottom: '16px', border: '1px solid var(--warning)' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0 }}>
              ⚠️ ประกันสังคมคำนวณแบบรายเดือน (2 งวดรวมกัน) โดยหักสูงสุดไม่เกิน 750 บาท/เดือน
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>รายได้งวดที่ 1</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>
                {sso.period1_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>รายได้งวดที่ 2</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>
                {sso.period2_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>รายได้รวมทั้งเดือน</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>
                {sso.total_monthly_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ฐานคำนวณ SSO</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>
                {sso.sso_base.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </div>
            </div>
            <div style={{ background: 'var(--surface-bg)', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>SSO งวดที่ 1 (หักแล้ว)</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>
                {sso.period1_sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </div>
            </div>
            <div style={{ background: 'var(--surface-bg)', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                SSO งวดที่ 2 {period === 2 ? '(หักงวดนี้)' : ''}
              </div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>
                {sso.period2_sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </div>
            </div>
            <div style={{ background: 'var(--error-light)', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: 'var(--error)', marginBottom: '4px', fontWeight: '600' }}>SSO รวมทั้งเดือน</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--error)' }}>
                {sso.total_monthly_sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>SSO ส่วนบริษัท</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>
                {sso.employer_sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </div>
            </div>
          </div>
          <div style={{ marginTop: '16px', padding: '12px', background: 'var(--surface-bg)', borderRadius: '6px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              📅 วันที่นำส่ง SSO: <strong>15 {thaiMonths[monthNum]} {year + 543}</strong>
            </p>
          </div>
        </div>
      )}

      {/* สรุปสะสมรายปี (YTD) */}
      {ytd && (
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
            สรุปสะสมตั้งแต่ต้นปี (YTD) - {year + 543}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>เงินเดือนสะสม</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {ytd.ytd_gross_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>รวมรายได้สะสม</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--success)' }}>
                {ytd.ytd_total_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ประกันสังคมสะสม</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--error)' }}>
                {ytd.ytd_sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ภาษีสะสม</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--error)' }}>
                {ytd.ytd_tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>รวมหักสะสม</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--error)' }}>
                {ytd.ytd_total_deductions.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ background: 'var(--success-light)', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: 'var(--success)', marginBottom: '4px', fontWeight: '600' }}>เงินสุทธิสะสม</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--success)' }}>
                {ytd.ytd_net_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 3. ขั้นตอนการ Deploy

1. **Run Migration**:
   ```bash
   # เชื่อมต่อกับ Supabase และรัน wage-system-migration.sql
   psql -h <your-supabase-host> -U postgres -d postgres -f wage-system-migration.sql
   ```

2. **ตรวจสอบ Environment Variables**:
   ```bash
   # ต้องมี .env.local หรือ .env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **สร้างข้อมูลตัวอย่าง** (Optional):
   - ใช้ฟังก์ชัน `calculateDailyWage()` เพื่อคำนวณและบันทึกข้อมูลลง `daily_wages`
   - ใช้ฟังก์ชัน `calculatePeriodWage()` เพื่อสรุปและบันทึกข้อมูลลง `period_wages`

4. **ทดสอบระบบ**:
   ```bash
   npm run dev
   # เปิด http://localhost:3000/wages
   ```

---

## 📝 หมายเหตุสำคัญ

### การคำนวณประกันสังคม (SSO)
ระบบรองรับการคำนวณ SSO แบบ 2 งวด/เดือนตามตัวอย่างที่คุณให้มา:

```
งวดที่ 1: SSO = MIN(period1_income × 5%, 750)
งวดที่ 2: SSO = (total_monthly_sso - period1_sso)
โดยที่ total_monthly_sso = MIN(sso_base × 5%, 750)
     และ sso_base = MIN(total_monthly_income, 15000)
```

### การคำนวณเบี้ยขยัน
เงื่อนไข: เข้างานก่อนเวลา >= 5 นาที **ทุกวัน** ในงวดนั้น จึงจะได้เบี้ยขยัน 300 บาท

### ส่วนที่ยังไม่ได้ทำ
- ✨ ฟังก์ชันคำนวณภาษีเงินได้แบบละเอียด (ตอนนี้ใช้แบบง่าย)
- ✨ ระบบ Sync ข้อมูลจาก `daily_attendance` ไป `daily_wages` อัตโนมัติ
- ✨ ระบบแจ้งเตือนวันครบกำหนดส่ง SSO
- ✨ Export รายงานเป็น PDF/Excel

---

## 🎨 การปรับแต่ง UI

สามารถปรับแต่ง CSS ใน `app/globals.css` เพิ่มเติมได้:

```css
/* สีเพิ่มเติมสำหรับระบบค่าจ้าง */
:root {
  --success: #10b981;
  --success-light: #d1fae5;
  --warning: #f59e0b;
  --bg-warning: #fef3c7;
  --error: #ef4444;
  --error-light: #fee2e2;
}
```

---

## 📞 ติดต่อ/ช่วยเหลือ

หากมีปัญหาหรือต้องการความช่วยเหลือ:
1. ตรวจสอบ Console (F12) หาข้อผิดพลาด
2. ตรวจสอบ Network Tab เพื่อดู API Response
3. ตรวจสอบ Database logs ใน Supabase Dashboard
