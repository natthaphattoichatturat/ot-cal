# สรุปการแก้ไขหน้า /wages และเพิ่มฟีเจอร์ Logging

## 🎯 ปัญหาที่พบ

### 1. ปัญหาในหน้า `/wages/[id]`
- ✅ **ยอดสะสมรายปี (YTD) แสดง 0.00 ทั้งหมด**
  - สาเหตุ: ดึงข้อมูลจาก `wage_details` แต่ยังไม่มีข้อมูลในตาราง
  - แก้ไข: ต้องรัน `/api/wages/calculate-v2` ก่อนเพื่อสร้างข้อมูลใน `wage_details`

### 2. ปัญหาในหน้า `/wages`
- ❌ **แสดงค่าจ้างพนักงานรายเดือนผิด**
  - พนักงานรายเดือน (ID: 20051185) ควรแสดง 11,551.33 บาท
  - แต่ในหน้า `/wages` แสดง 5,612 บาท (คำนวณแบบรายวัน)
  - สาเหตุ: API `/api/wages/summary` คำนวณผิด

### 3. ฟีเจอร์ที่ต้องเพิ่ม/แก้ไข
- ❌ **ลบแท็บ "ค่าจ้างรายวัน" ออก** - เหลือแค่ "รายละเอียดค่าจ้างพนักงาน"
- ❌ **เพิ่ม Search สำหรับเลือกพนักงาน** ในส่วนเพิ่มเงินได้/หัก
- ❌ **สร้างหน้า Logging** สำหรับดูประวัติการปรับเงิน
- ❌ **เพิ่มปุ่มไปหน้า Logging** ในหน้า /wages

---

## 📋 TODO List

### ✅ เสร็จแล้ว
1. ✅ แก้หน้า `/wages/page.tsx` - ลบแท็บค่าจ้างรายวัน
2. ✅ แก้ fetch logic ให้ดึงแค่ summary
3. ✅ แก้ filter logic

### ⏳ กำลังทำ/ต้องทำต่อ
4. ⏳ **ตรวจสอบและแก้ API `/api/wages/summary`** ให้คำนวณพนักงานรายเดือนถูกต้อง
5. ⏳ **เพิ่ม Employee Search Component** สำหรับส่วนเพิ่มเงินได้/หัก
6. ⏳ **สร้างหน้า `/wages/logs`** สำหรับดู logging
7. ⏳ **สร้าง API `/api/wages/logs`** สำหรับดึงประวัติการปรับเงิน
8. ⏳ **เพิ่มปุ่มไปหน้า Logging** ใน `/wages/page.tsx`

---

## 🔧 การแก้ไข

### 1. แก้ API `/api/wages/summary` ให้ใช้ wage_details V2

**ไฟล์:** `/app/api/wages/summary/route.ts`

**ปัญหา:** API นี้คำนวณค่าจ้างเองแทนที่จะดึงจาก `wage_details`

**วิธีแก้:**
```typescript
// เปลี่ยนจาก: คำนวณเอง
// เป็น: ดึงจาก wage_details ที่คำนวณแล้ว

const { data: wageDetails, error } = await supabase
  .from('wage_details')
  .select('*')
  .eq('year', year)
  .eq('month', month)
  .eq('period', period)

// แปลงเป็น EmployeeWage format
const employeeWages = wageDetails.map(wd => ({
  employeeId: wd.employee_id,
  employmentType: wd.employment_type,
  totalBaseWage: wd.base_wage,
  totalOt1Wage: wd.ot1_wage,
  totalOt2Wage: wd.ot2_wage,
  totalOt3Wage: wd.ot3_wage,
  grossWage: wd.base_wage + wd.total_ot_wage,
  attendanceBonus: wd.attendance_bonus,
  nightShiftAllowance: wd.night_shift_allowance,
  additionalIncome: wd.additional_income,
  totalIncome: wd.total_income,
  lateMinutes: wd.late_minutes,
  lateDeduction: wd.late_deduction,
  leaveDays: wd.leave_days,
  leaveDeduction: wd.leave_deduction,
  additionalDeduction: wd.additional_deduction,
  sso: wd.sso,
  tax: wd.tax,
  totalDeductions: wd.total_deduction,
  netWage: wd.net_wage
}))
```

---

### 2. เพิ่ม Employee Search Component

**ไฟล์:** `/app/wages/page.tsx`

**สิ่งที่ต้องเพิ่ม:**
```typescript
// State สำหรับ search พนักงาน
const [employeeSearchQuery, setEmployeeSearchQuery] = useState('')
const [filteredEmployeesForSelection, setFilteredEmployeesForSelection] = useState<any[]>([])

// Filter พนักงานแบบ realtime
useEffect(() => {
  if (!employeeSearchQuery.trim()) {
    setFilteredEmployeesForSelection(employeeWages)
  } else {
    const query = employeeSearchQuery.toLowerCase()
    const filtered = employeeWages.filter(emp =>
      emp.name.toLowerCase().includes(query) ||
      emp.employeeId.toLowerCase().includes(query)
    )
    setFilteredEmployeesForSelection(filtered)
  }
}, [employeeSearchQuery, employeeWages])

// UI ใน Modal
<div>
  <label>เลือกพนักงาน</label>
  <input
    type="text"
    placeholder="ค้นหาจากชื่อหรือรหัสพนักงาน..."
    value={employeeSearchQuery}
    onChange={(e) => setEmployeeSearchQuery(e.target.value)}
  />
  <div style={{ maxHeight: '200px', overflow: 'auto' }}>
    {filteredEmployeesForSelection.map(emp => (
      <label key={emp.employeeId}>
        <input
          type="checkbox"
          checked={selectedEmployees.includes(emp.employeeId)}
          onChange={() => toggleEmployeeSelection(emp.employeeId)}
        />
        {emp.name} ({emp.employeeId})
      </label>
    ))}
  </div>
</div>
```

---

### 3. สร้างหน้า Logging

**ไฟล์ใหม่:** `/app/wages/logs/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface AdjustmentLog {
  id: number
  employee_id: string
  employee_name: string
  year: number
  month: number
  period: number
  adjustment_type: 'income' | 'deduction'
  category: string
  amount: number
  description: string
  created_at: string
  created_by?: string
}

export default function WageLogsPage() {
  const [logs, setLogs] = useState<AdjustmentLog[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([1, 2])

  useEffect(() => {
    const now = new Date()
    setSelectedMonth((now.getMonth() + 1).toString().padStart(2, '0'))
    setSelectedYear(now.getFullYear().toString())
  }, [])

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchLogs()
    }
  }, [selectedMonth, selectedYear, selectedPeriods])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const periods = selectedPeriods.join(',')
      const res = await fetch(
        `/api/wages/logs?year=${selectedYear}&month=${selectedMonth}&periods=${periods}`
      )
      const data = await res.json()
      if (data.success) {
        setLogs(data.data)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePeriod = (period: number) => {
    if (selectedPeriods.includes(period)) {
      setSelectedPeriods(selectedPeriods.filter(p => p !== period))
    } else {
      setSelectedPeriods([...selectedPeriods, period])
    }
  }

  return (
    <div className="container">
      <h1>ประวัติการปรับเงิน (Adjustment Logs)</h1>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label>เดือน</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>ปี</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i
                return <option key={year} value={year}>{year}</option>
              })}
            </select>
          </div>
          <div>
            <label>งวด</label>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={selectedPeriods.includes(1)}
                  onChange={() => togglePeriod(1)}
                />
                งวด 1
              </label>
              <label style={{ marginLeft: '16px' }}>
                <input
                  type="checkbox"
                  checked={selectedPeriods.includes(2)}
                  onChange={() => togglePeriod(2)}
                />
                งวด 2
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>กำลังโหลด...</div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>ไม่พบข้อมูล</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>วันที่/เวลา</th>
                  <th>รหัสพนักงาน</th>
                  <th>ชื่อ</th>
                  <th>งวด</th>
                  <th>ประเภท</th>
                  <th>หมวดหมู่</th>
                  <th className="text-right">จำนวนเงิน</th>
                  <th>หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>{format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}</td>
                    <td>{log.employee_id}</td>
                    <td>{log.employee_name}</td>
                    <td className="text-center">{log.period}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: log.adjustment_type === 'income' ? 'var(--success-light)' : 'var(--warning-light)',
                        color: log.adjustment_type === 'income' ? 'var(--success-dark)' : 'var(--warning-dark)',
                        fontWeight: '600'
                      }}>
                        {log.adjustment_type === 'income' ? '+ เพิ่มเงิน' : '- หักเงิน'}
                      </span>
                    </td>
                    <td>{log.category}</td>
                    <td className="text-right">
                      {log.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
                    </td>
                    <td>{log.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

### 4. สร้าง API Logs

**ไฟล์ใหม่:** `/app/api/wages/logs/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const periods = searchParams.get('periods') // "1,2"

    if (!year || !month) {
      return NextResponse.json(
        { success: false, error: 'Missing parameters' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const periodArray = periods ? periods.split(',').map(Number) : [1, 2]

    const { data: adjustments, error } = await supabase
      .from('wage_adjustments')
      .select(`
        *,
        employees (
          name
        )
      `)
      .eq('year', parseInt(year))
      .eq('month', parseInt(month))
      .in('period', periodArray)
      .order('created_at', { ascending: false })

    if (error) throw error

    const logs = adjustments.map((adj: any) => ({
      ...adj,
      employee_name: adj.employees?.name || 'Unknown'
    }))

    return NextResponse.json({
      success: true,
      data: logs
    })
  } catch (error: any) {
    console.error('Error fetching adjustment logs:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
```

---

### 5. เพิ่มปุ่มไปหน้า Logging

**ไฟล์:** `/app/wages/page.tsx`

```typescript
// เพิ่มใน header section
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
  <h1>ค่าจ้างพนักงาน</h1>
  <button
    className="btn btn-secondary"
    onClick={() => window.location.href = '/wages/logs'}
    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
  >
    <span>📋</span>
    ดูประวัติการปรับเงิน
  </button>
</div>
```

---

## 🧪 การทดสอบ

### 1. ทดสอบหน้า /wages
```bash
# 1. รัน calculate-v2 ก่อนเพื่อสร้างข้อมูลใน wage_details
curl -X POST http://localhost:3000/api/wages/calculate-v2 \
  -H "Content-Type: application/json" \
  -d '{"month": 11, "year": 2025}'

# 2. เปิดหน้า /wages
# Expected: แสดงพนักงานรายเดือน 11,551.33 บาท (ไม่ใช่ 5,612)
```

### 2. ทดสอบ Employee Search
```bash
# 1. คลิก "เพิ่มเงินได้" หรือ "เพิ่มเงินหัก"
# 2. พิมพ์ชื่อหรือรหัสพนักงานใน search box
# Expected: แสดงผลแบบ realtime, filter ได้ทั้งชื่อและรหัส
```

### 3. ทดสอบหน้า Logging
```bash
# 1. เปิด http://localhost:3000/wages/logs
# 2. เลือกเดือน, ปี, งวด
# Expected: แสดงประวัติการปรับเงินทั้งหมด
```

---

## ✅ Checklist

- [ ] แก้ API `/api/wages/summary` ให้ดึงจาก `wage_details`
- [ ] เพิ่ม Employee Search ในส่วนเพิ่มเงินได้/หัก
- [ ] สร้างหน้า `/wages/logs`
- [ ] สร้าง API `/api/wages/logs`
- [ ] เพิ่มปุ่มไปหน้า Logging
- [ ] ทดสอบทุกฟีเจอร์
- [ ] ตรวจสอบค่าจ้างพนักงานรายเดือนถูกต้อง
