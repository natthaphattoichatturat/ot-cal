'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'

interface EmployeeInfo {
  employee_id: string
  name: string
  department: string
  perhr_salary: number
  perday_salary: number
  monthly_salary: number
  employment_type: string
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

interface WageBreakdown {
  // รายได้
  base_wage: number
  ot1_wage: number
  ot2_wage: number
  ot3_wage: number
  attendance_bonus: number
  night_shift_allowance: number
  additional_income: number
  gross_income: number
  
  // เงินหัก
  late_minutes: number
  late_deduction: number
  leave_days: number
  leave_deduction: number
  additional_deduction: number
  sso: number
  tax: number
  
  // รวม
  total_income: number
  total_deductions: number
  net_wage: number
}

interface LeaveRecord {
  id: number
  leave_date: string
  leave_type: string
  leave_hours: number
  reason: string
  status: string
}

interface Adjustment {
  id: number
  adjustment_type: 'income' | 'deduction'
  category: string
  amount: number
  description: string
  created_at: string
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

interface AllTimeData {
  total_gross_wage: number
  total_ot_wage: number
  total_income: number
  total_sso: number
  total_tax: number
  total_deduction: number
  total_net_wage: number
  total_periods: number
}

// Categories for adjustments
const incomeCategories = [
  'โบนัส',
  'ค่าตำแหน่ง',
  'ค่าโทรศัพท์',
  'ค่าเดินทาง',
  'ค่าอาหาร',
  'เงินพิเศษอื่นๆ'
]

const deductionCategories = [
  'หักค่าปรับ',
  'หักค่าเสียหาย',
  'หักเงินกู้',
  'หักค่าสวัสดิการ',
  'หักอื่นๆ'
]

export default function WageDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const employeeId = params.id as string
  const month = searchParams.get('month')
  const period = parseInt(searchParams.get('period') || '1')

  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState<EmployeeInfo | null>(null)
  const [dailyWages, setDailyWages] = useState<DailyWage[]>([])
  const [periodWage, setPeriodWage] = useState<WageBreakdown | null>(null)
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([])
  const [adjustments, setAdjustments] = useState<Adjustment[]>([])
  const [sso, setSSO] = useState<SSOData | null>(null)
  const [ytd, setYTD] = useState<YTDData | null>(null)
  const [allTimeData, setAllTimeData] = useState<AllTimeData | null>(null)
  const [currentPeriod, setCurrentPeriod] = useState(1)
  const [workDays, setWorkDays] = useState(0)
  const [holidayWorkDays, setHolidayWorkDays] = useState(0)
  const [nightShiftDays, setNightShiftDays] = useState(0)

  // State สำหรับเลือกดูรายวัน
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [showDailyDetail, setShowDailyDetail] = useState(false)

  // State สำหรับเพิ่มเงินได้/หัก
  const [showAddModal, setShowAddModal] = useState(false)
  const [adjustmentType, setAdjustmentType] = useState<'income' | 'deduction'>('income')
  const [adjustmentCategory, setAdjustmentCategory] = useState('')
  const [adjustmentAmount, setAdjustmentAmount] = useState('')
  const [adjustmentDescription, setAdjustmentDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ]

  useEffect(() => {
    if (employeeId && month && period) {
      fetchWageDetail()
      fetchAllTimeData()
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
        setLeaveRecords(data.data.leaveRecords || [])
        setAdjustments(data.data.adjustments || [])
        setSSO(data.data.sso)
        setYTD(data.data.ytd)
        setCurrentPeriod(data.data.currentPeriod)
        setWorkDays(data.data.workDays || 0)
        setHolidayWorkDays(data.data.holidayWorkDays || 0)
        setNightShiftDays(data.data.nightShiftDays || 0)
      }
    } catch (error) {
      console.error('Error fetching wage detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllTimeData = async () => {
    try {
      const response = await fetch(`/api/employees/${employeeId}/all-time-summary`)
      const data = await response.json()
      
      if (data.success) {
        setAllTimeData(data.data)
      }
    } catch (error) {
      console.error('Error fetching All-Time Data:', error)
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

  const handleAddAdjustment = async () => {
    if (!adjustmentCategory || !adjustmentAmount) {
      alert('กรุณากรอกข้อมูลให้ครบ')
      return
    }

    setSaving(true)
    try {
      const [year, monthNum] = (month || '').split('-').map(Number)
      
      const res = await fetch('/api/wages/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: employeeId,
          year,
          month: monthNum,
          period: currentPeriod,
          adjustment_type: adjustmentType,
          category: adjustmentCategory,
          amount: parseFloat(adjustmentAmount),
          description: adjustmentDescription,
          created_by: 'HR Admin'
        })
      })

      const data = await res.json()
      
      if (data.success) {
        // รีเฟรชข้อมูล
        await fetchWageDetail()
        // ปิด modal และ reset form
        setShowAddModal(false)
        setAdjustmentCategory('')
        setAdjustmentAmount('')
        setAdjustmentDescription('')
        alert('บันทึกสำเร็จ')
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.error)
      }
    } catch (error) {
      console.error('Error adding adjustment:', error)
      alert('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAdjustment = async (id: number) => {
    if (!confirm('ต้องการลบรายการนี้ใช่หรือไม่?')) return

    try {
      const res = await fetch(`/api/wages/adjustments?id=${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()
      
      if (data.success) {
        await fetchWageDetail()
        alert('ลบสำเร็จ')
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting adjustment:', error)
      alert('เกิดข้อผิดพลาดในการลบ')
    }
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

  // แยกรายการเงินเพิ่มและเงินหัก
  const incomeAdjustments = adjustments.filter(a => a.adjustment_type === 'income')
  const deductionAdjustments = adjustments.filter(a => a.adjustment_type === 'deduction')

  return (
    <div className="app-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">รายละเอียดค่าจ้างพนักงาน</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              {thaiMonths[monthNum - 1]} {year + 543} - งวดที่ {currentPeriod}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setAdjustmentType('income')
                setShowAddModal(true)
              }}
            >
              ➕ เพิ่มเงินได้
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setAdjustmentType('deduction')
                setShowAddModal(true)
              }}
              style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}
            >
              ➖ เพิ่มเงินหัก
            </button>
            <a href={`/wages?month=${month}&period=${period}`} className="btn btn-secondary">
              ← กลับหน้ารายการ
            </a>
          </div>
        </div>
      </div>

      {/* ข้อมูลพนักงาน */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
          ข้อมูลพนักงาน
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
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
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ประเภทพนักงาน</div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: employee.employment_type === 'รายเดือน' ? '#2563eb' : '#16a34a' }}>
              {employee.employment_type || 'รายวัน'}
            </div>
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
          {employee.employment_type === 'รายเดือน' && (
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>เงินเดือน</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>
                {employee.monthly_salary?.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </div>
            </div>
          )}
        </div>
      </div>

      {/* สรุปวันทำงาน */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
          📅 สรุปวันทำงาน (งวดที่ {currentPeriod})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>วันทำงานปกติ</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{workDays}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>วัน</div>
          </div>
          <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#b45309', marginBottom: '4px' }}>ทำงานวันหยุด</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#b45309' }}>{holidayWorkDays}</div>
            <div style={{ fontSize: '12px', color: '#b45309' }}>วัน</div>
          </div>
          <div style={{ background: '#dbeafe', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#1e40af', marginBottom: '4px' }}>ทำกะดึก</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>{nightShiftDays}</div>
            <div style={{ fontSize: '12px', color: '#1e40af' }}>วัน</div>
          </div>
          <div style={{ background: '#fee2e2', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#dc2626', marginBottom: '4px' }}>วันลา</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>{periodWage.leave_days}</div>
            <div style={{ fontSize: '12px', color: '#dc2626' }}>วัน</div>
          </div>
          <div style={{ background: '#fce7f3', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#be185d', marginBottom: '4px' }}>มาสาย</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#be185d' }}>{periodWage.late_minutes}</div>
            <div style={{ fontSize: '12px', color: '#be185d' }}>นาที</div>
          </div>
        </div>
      </div>

      {/* รายได้รวม */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#16a34a' }}>
          💰 รายได้ (งวดที่ {currentPeriod})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ค่าจ้างพื้นฐาน</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {periodWage.base_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ค่า OT ปกติ (×1.5)</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {periodWage.ot1_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ค่า OT พิเศษ (×2)</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {periodWage.ot2_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ค่า OT ขั้นสูง (×3)</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {periodWage.ot3_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: periodWage.attendance_bonus > 0 ? '#dcfce7' : 'var(--surface-bg)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: periodWage.attendance_bonus > 0 ? '#16a34a' : 'var(--text-muted)', marginBottom: '4px' }}>
              เบี้ยขยัน {periodWage.attendance_bonus > 0 ? '✓' : ''}
            </div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: periodWage.attendance_bonus > 0 ? '#16a34a' : 'var(--text-primary)' }}>
              {periodWage.attendance_bonus.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: periodWage.night_shift_allowance > 0 ? '#dbeafe' : 'var(--surface-bg)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: periodWage.night_shift_allowance > 0 ? '#1e40af' : 'var(--text-muted)', marginBottom: '4px' }}>
              ค่ากะดึก (40฿/วัน)
            </div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: periodWage.night_shift_allowance > 0 ? '#1e40af' : 'var(--text-primary)' }}>
              {periodWage.night_shift_allowance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* รายการเงินเพิ่มพิเศษ */}
        {incomeAdjustments.length > 0 && (
          <div style={{ marginTop: '16px', padding: '16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#16a34a', marginBottom: '12px' }}>
              ➕ เงินเพิ่มพิเศษ
            </div>
            {incomeAdjustments.map(adj => (
              <div key={adj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #bbf7d0' }}>
                <div>
                  <div style={{ fontWeight: '500' }}>{adj.category}</div>
                  {adj.description && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{adj.description}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: '600', color: '#16a34a' }}>
                    +{adj.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                  <button 
                    onClick={() => handleDeleteAdjustment(adj.id)}
                    style={{ padding: '4px 8px', fontSize: '12px', color: '#dc2626', background: 'white', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '8px', fontWeight: '600' }}>
              <span>รวมเงินเพิ่มพิเศษ</span>
              <span style={{ color: '#16a34a' }}>
                +{periodWage.additional_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* รวมรายได้ */}
        <div style={{ marginTop: '16px', padding: '16px', background: '#dcfce7', borderRadius: '8px', border: '2px solid #16a34a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#16a34a' }}>รวมรายได้ทั้งหมด</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#16a34a' }}>
              {periodWage.total_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
            </div>
          </div>
        </div>
      </div>

      {/* เงินหัก */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#dc2626' }}>
          📉 เงินหัก (งวดที่ {currentPeriod})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div style={{ background: periodWage.late_deduction > 0 ? '#fef2f2' : 'var(--surface-bg)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: periodWage.late_deduction > 0 ? '#dc2626' : 'var(--text-muted)', marginBottom: '4px' }}>
              หักค่ามาสาย ({periodWage.late_minutes} นาที)
            </div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: periodWage.late_deduction > 0 ? '#dc2626' : 'var(--text-primary)' }}>
              -{periodWage.late_deduction.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: periodWage.leave_deduction > 0 ? '#fef2f2' : 'var(--surface-bg)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: periodWage.leave_deduction > 0 ? '#dc2626' : 'var(--text-muted)', marginBottom: '4px' }}>
              หักค่าลา ({periodWage.leave_days} วัน)
            </div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: periodWage.leave_deduction > 0 ? '#dc2626' : 'var(--text-primary)' }}>
              -{periodWage.leave_deduction.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ประกันสังคม (SSO)</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              -{periodWage.sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#b45309', marginBottom: '4px' }}>ภาษีเงินได้หัก ณ ที่จ่าย</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#b45309' }}>
              -{periodWage.tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* รายการเงินหักพิเศษ */}
        {deductionAdjustments.length > 0 && (
          <div style={{ marginTop: '16px', padding: '16px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '12px' }}>
              ➖ เงินหักพิเศษ
            </div>
            {deductionAdjustments.map(adj => (
              <div key={adj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #fecaca' }}>
                <div>
                  <div style={{ fontWeight: '500' }}>{adj.category}</div>
                  {adj.description && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{adj.description}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: '600', color: '#dc2626' }}>
                    -{adj.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                  <button 
                    onClick={() => handleDeleteAdjustment(adj.id)}
                    style={{ padding: '4px 8px', fontSize: '12px', color: '#dc2626', background: 'white', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '8px', fontWeight: '600' }}>
              <span>รวมเงินหักพิเศษ</span>
              <span style={{ color: '#dc2626' }}>
                -{periodWage.additional_deduction.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* รวมเงินหัก */}
        <div style={{ marginTop: '16px', padding: '16px', background: '#fee2e2', borderRadius: '8px', border: '2px solid #dc2626' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#dc2626' }}>รวมเงินหักทั้งหมด</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#dc2626' }}>
              -{periodWage.total_deductions.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
            </div>
          </div>
        </div>
      </div>

      {/* รายละเอียดการลา */}
      {leaveRecords.length > 0 && (
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
            📋 รายละเอียดการลา
          </h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>วันที่</th>
                  <th>ประเภทการลา</th>
                  <th>จำนวนชั่วโมง</th>
                  <th>เหตุผล</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {leaveRecords.map(leave => (
                  <tr key={leave.id}>
                    <td>{format(new Date(leave.leave_date), 'dd/MM/yyyy')}</td>
                    <td>{leave.leave_type}</td>
                    <td className="text-center">{leave.leave_hours} ชม.</td>
                    <td>{leave.reason || '-'}</td>
                    <td>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        background: leave.status === 'approved' ? '#dcfce7' : '#fef3c7',
                        color: leave.status === 'approved' ? '#16a34a' : '#b45309'
                      }}>
                        {leave.status === 'approved' ? 'อนุมัติ' : leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* เงินสุทธิ */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '16px', marginBottom: '8px', opacity: 0.9 }}>💰 เงินสุทธิที่ได้รับ</div>
          <div style={{ fontSize: '48px', fontWeight: '900' }}>
            {periodWage.net_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '18px', opacity: 0.9 }}>บาท</div>
          <div style={{ marginTop: '16px', fontSize: '13px', opacity: 0.8 }}>
            รายได้ {periodWage.total_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })} - 
            เงินหัก {periodWage.total_deductions.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* ชั่วโมง OT */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
          ⏰ จำนวนชั่วโมง OT
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

        {/* เลือกดูรายวัน */}
        <div style={{ marginTop: '24px' }}>
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
                    {format(new Date(dw.work_date), 'dd/MM')}
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
                          <td>{format(new Date(dw.work_date), 'dd/MM/yyyy')}</td>
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

      {/* ประกันสังคม */}
      {sso && (
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
            🏥 ประกันสังคม (SSO) - {thaiMonths[monthNum - 1]} {year + 543}
          </h3>
          <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #f59e0b' }}>
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
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>SSO งวดที่ 1</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>
                {sso.period1_sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </div>
            </div>
            <div style={{ background: 'var(--surface-bg)', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>SSO งวดที่ 2</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>
                {sso.period2_sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </div>
            </div>
            <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: '#ef4444', marginBottom: '4px', fontWeight: '600' }}>SSO รวมทั้งเดือน</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444' }}>
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
        </div>
      )}

      {/* YTD Summary */}
      {ytd && (
        <div className="card" style={{ marginTop: '24px', marginBottom: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            📊 ยอดสะสมรายปี {year + 543}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '14px', color: '#64748b' }}>1. เงินเดือนสะสมทั้งปี</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                {ytd.ytd_gross_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '14px', color: '#64748b' }}>2. ภาษีเงินได้สะสมทั้งปี</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                {ytd.ytd_tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '14px', color: '#64748b' }}>3. ประกันสังคมสะสมทั้งปี</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                {ytd.ytd_sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #dbeafe' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>4. รวมเงินได้สะสมทั้งปี</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a8a' }}>
                {ytd.ytd_total_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fee2e2' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#991b1b' }}>5. รวมหักสะสมทั้งปี</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#7f1d1d' }}>
                {ytd.ytd_total_deductions.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#1e3a8a', borderRadius: '8px', color: 'white' }}>
              <div style={{ fontSize: '16px', fontWeight: '700' }}>6. เงินได้สุทธิสะสมทั้งปี</div>
              <div style={{ fontSize: '20px', fontWeight: '900' }}>
                {ytd.ytd_net_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All-Time Summary */}
      {allTimeData && (
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: '#312e81', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            🌟 ยอดสะสมทั้งหมด (ตั้งแต่เริ่มทำงาน)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '14px', color: '#64748b' }}>1. เงินเดือนสะสมทั้งหมด</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                {allTimeData.total_gross_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '14px', color: '#64748b' }}>2. ภาษีเงินได้สะสมทั้งหมด</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                {allTimeData.total_tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '14px', color: '#64748b' }}>3. ประกันสังคมสะสมทั้งหมด</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                {allTimeData.total_sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#eef2ff', borderRadius: '8px', border: '1px solid #e0e7ff' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#3730a3' }}>4. รวมเงินได้สะสมทั้งหมด</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#312e81' }}>
                {allTimeData.total_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fee2e2' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#991b1b' }}>5. รวมหักสะสมทั้งหมด</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#7f1d1d' }}>
                {allTimeData.total_deduction.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#312e81', borderRadius: '8px', color: 'white' }}>
              <div style={{ fontSize: '16px', fontWeight: '700' }}>6. เงินได้สุทธิสะสมทั้งหมด</div>
              <div style={{ fontSize: '20px', fontWeight: '900' }}>
                {allTimeData.total_net_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '12px', background: '#f1f5f9', borderRadius: '8px', fontSize: '14px', color: '#475569' }}>
              📌 ทำงานมาแล้ว: <strong style={{ color: '#0f172a' }}>{allTimeData.total_periods} งวด</strong>
            </div>
          </div>
        </div>
      )}

      {/* Modal เพิ่มเงินได้/หัก */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              marginBottom: '20px',
              color: adjustmentType === 'income' ? '#16a34a' : '#dc2626'
            }}>
              {adjustmentType === 'income' ? '➕ เพิ่มเงินได้' : '➖ เพิ่มเงินหัก'}
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                ประเภท <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                value={adjustmentCategory}
                onChange={(e) => setAdjustmentCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              >
                <option value="">-- เลือกประเภท --</option>
                {(adjustmentType === 'income' ? incomeCategories : deductionCategories).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                จำนวนเงิน (บาท) <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="number"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                รายละเอียด/หมายเหตุ
              </label>
              <textarea
                value={adjustmentDescription}
                onChange={(e) => setAdjustmentDescription(e.target.value)}
                placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setAdjustmentCategory('')
                  setAdjustmentAmount('')
                  setAdjustmentDescription('')
                }}
                className="btn btn-secondary"
                disabled={saving}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddAdjustment}
                className="btn btn-primary"
                disabled={saving}
                style={{ 
                  background: adjustmentType === 'income' ? '#16a34a' : '#dc2626',
                  borderColor: adjustmentType === 'income' ? '#16a34a' : '#dc2626'
                }}
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

