'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { useLanguage } from '@/contexts/LanguageContext'

interface EmployeeInfo {
  employee_id: string
  name: string
  department: string
  perhr_salary: number
  perday_salary: number
  monthly_salary: number
  employment_type: string
}

// ลบ DailyWage interface เพราะ API V2 ไม่ส่ง dailyWages แล้ว

interface WageBreakdown {
  // ข้อมูลพนักงาน
  employment_type: string
  perday_salary: number
  perhr_salary: number
  monthly_salary: number

  // วันทำงาน
  total_days: number
  work_days: number
  holiday_work_days: number
  leave_days: number
  absent_days: number

  // รายได้
  base_wage: number
  ot1_hours: number
  ot2_hours: number
  ot3_hours: number
  ot1_wage: number
  ot2_wage: number
  ot3_wage: number
  total_ot_wage: number
  night_shift_days: number
  night_shift_allowance: number
  attendance_bonus: number
  additional_income: number
  gross_income: number

  // เงินหัก
  late_minutes: number
  late_deduction: number
  leave_deduction: number
  additional_deduction: number
  sso: number
  tax: number

  // รวม
  total_income: number
  total_deduction: number
  net_wage: number
}

interface LeaveRecord {
  id?: number
  leave_date: string
  leave_type: string
  leave_hours: number
  is_paid?: boolean
  reason?: string
  status?: string
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
  const { t } = useLanguage()
  const params = useParams()
  const searchParams = useSearchParams()
  const employeeId = params.id as string
  const month = searchParams.get('month')
  const period = parseInt(searchParams.get('period') || '1')

  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState<EmployeeInfo | null>(null)
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

  // State สำหรับเพิ่มเงินได้/หัก
  const [showAddModal, setShowAddModal] = useState(false)
  const [adjustmentType, setAdjustmentType] = useState<'income' | 'deduction'>('income')
  const [adjustmentCategory, setAdjustmentCategory] = useState('')
  const [adjustmentAmount, setAdjustmentAmount] = useState('')
  const [adjustmentDescription, setAdjustmentDescription] = useState('')
  const [saving, setSaving] = useState(false)


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
        setPeriodWage(data.data.periodWage)
        setLeaveRecords(data.data.leaveRecords || [])
        setAdjustments(data.data.adjustments || [])
        setSSO(data.data.sso)
        setYTD(data.data.ytd)
        setCurrentPeriod(data.data.currentPeriod)

        // ใช้ข้อมูลจาก periodWage V2
        setWorkDays(data.data.periodWage?.work_days || 0)
        setHolidayWorkDays(data.data.periodWage?.holiday_work_days || 0)
        setNightShiftDays(data.data.periodWage?.night_shift_days || 0)
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

  // ลบ toggleDate function เพราะไม่มี dailyWages แล้ว

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
          <p style={{ color: 'var(--text-muted)' }}>{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!employee || !periodWage) {
    return (
      <div className="app-container">
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>{t('wages.noData')}</p>
          <a href="/wages" className="btn btn-primary" style={{ marginTop: '16px' }}>
            {t('wages.backToList')}
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
            <h1 className="page-title">{t('wages.detailTitle')}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              {t(`months.${monthNum}`)} {year + 543} - {t('common.period')} {currentPeriod}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setAdjustmentType('income')
                setShowAddModal(true)
              }}
            >
              {t('wages.addIncome')}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setAdjustmentType('deduction')
                setShowAddModal(true)
              }}
            >
              {t('wages.addDeduction')}
            </button>
            <a href={`/wages?month=${month}&period=${period}`} className="btn btn-secondary">
              {t('wages.backToList')}
            </a>
          </div>
        </div>
      </div>

      {/* ข้อมูลพนักงาน */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
          {t('wages.employeeInfo')}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('wages.employeeId')}</div>
            <div style={{ fontSize: '15px', fontWeight: '600' }}>{employee.employee_id}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('wages.employeeName')}</div>
            <div style={{ fontSize: '15px', fontWeight: '600' }}>{employee.name}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('wages.department')}</div>
            <div style={{ fontSize: '15px', fontWeight: '600' }}>{employee.department}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('wages.employeeType')}</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {employee.employment_type || 'รายวัน'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('wages.dailySalary')}</div>
            <div style={{ fontSize: '15px', fontWeight: '600' }}>
              {employee.perday_salary?.toLocaleString('th-TH', { minimumFractionDigits: 2 })} {t('common.baht')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('common.hour')}</div>
            <div style={{ fontSize: '15px', fontWeight: '600' }}>
              {employee.perhr_salary?.toLocaleString('th-TH', { minimumFractionDigits: 2 })} {t('common.baht')}
            </div>
          </div>
          {employee.employment_type === 'รายเดือน' && (
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('wages.monthlySalary')}</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>
                {employee.monthly_salary?.toLocaleString('th-TH', { minimumFractionDigits: 2 })} {t('common.baht')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* สรุปวันทำงาน */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
          สรุปวันทำงาน (งวดที่ {currentPeriod})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>วันทำงานปกติ</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{workDays}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>วัน</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ทำงานวันหยุด</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{holidayWorkDays}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>วัน</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ทำกะดึก</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{nightShiftDays}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>วัน</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>วันลา</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{periodWage.leave_days}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>วัน</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>มาสาย</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{periodWage.late_minutes}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>นาที</div>
          </div>
        </div>
      </div>

      {/* รายได้รวม */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
          รายได้ (งวดที่ {currentPeriod})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ค่าจ้างพื้นฐาน</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {periodWage.base_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ค่า OT ปกติ (×1.5)</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {periodWage.ot1_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ค่า OT พิเศษ (×2)</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {periodWage.ot2_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ค่า OT ขั้นสูง (×3)</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {periodWage.ot3_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: periodWage.attendance_bonus > 0 ? '700' : '400' }}>
              เบี้ยขยัน
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {periodWage.attendance_bonus.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              ค่ากะดึก (40฿/วัน)
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {periodWage.night_shift_allowance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* รายการเงินเพิ่มพิเศษ */}
        {incomeAdjustments.length > 0 && (
          <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
              เงินเพิ่มพิเศษ
            </div>
            {incomeAdjustments.map(adj => (
              <div key={adj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontWeight: '500' }}>{adj.category}</div>
                  {adj.description && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{adj.description}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    +{adj.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                  <button
                    onClick={() => handleDeleteAdjustment(adj.id)}
                    style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--text-primary)', background: 'white', border: '1px solid var(--border-light)', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '8px', fontWeight: '700' }}>
              <span>รวมเงินเพิ่มพิเศษ</span>
              <span style={{ color: 'var(--text-primary)' }}>
                +{periodWage.additional_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* รวมรายได้ */}
        <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>รวมรายได้ทั้งหมด</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {periodWage.total_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
            </div>
          </div>
        </div>
      </div>

      {/* เงินหัก */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
          เงินหัก (งวดที่ {currentPeriod})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: periodWage.late_deduction > 0 ? '700' : '400' }}>
              หักค่ามาสาย ({periodWage.late_minutes} นาที)
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
              -{periodWage.late_deduction.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: periodWage.leave_deduction > 0 ? '700' : '400' }}>
              หักค่าลา ({periodWage.leave_days} วัน)
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
              -{periodWage.leave_deduction.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ประกันสังคม (SSO)</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              -{periodWage.sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ภาษีเงินได้หัก ณ ที่จ่าย</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
              -{periodWage.tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* รายการเงินหักพิเศษ */}
        {deductionAdjustments.length > 0 && (
          <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
              เงินหักพิเศษ
            </div>
            {deductionAdjustments.map(adj => (
              <div key={adj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontWeight: '500' }}>{adj.category}</div>
                  {adj.description && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{adj.description}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    -{adj.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                  <button
                    onClick={() => handleDeleteAdjustment(adj.id)}
                    style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--text-primary)', background: 'white', border: '1px solid var(--border-light)', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '8px', fontWeight: '700' }}>
              <span>รวมเงินหักพิเศษ</span>
              <span style={{ color: 'var(--text-primary)' }}>
                -{periodWage.additional_deduction.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* รวมเงินหัก */}
        <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>รวมเงินหักทั้งหมด</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
              -{periodWage.total_deduction.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
            </div>
          </div>
        </div>
      </div>

      {/* รายละเอียดการลา */}
      {leaveRecords.length > 0 && (
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
            รายละเอียดการลา
          </h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>วันที่</th>
                  <th>ประเภทการลา</th>
                  <th>จำนวนชั่วโมง</th>
                  <th>การหักเงิน</th>
                  <th>เหตุผล</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {leaveRecords.map((leave, index) => (
                  <tr key={leave.id || index}>
                    <td>{format(new Date(leave.leave_date), 'dd/MM/yyyy')}</td>
                    <td>{leave.leave_type}</td>
                    <td className="text-center">{leave.leave_hours} ชม.</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: leave.is_paid ? 'var(--success-light)' : 'var(--warning-light)',
                        color: leave.is_paid ? 'var(--success-dark)' : 'var(--warning-dark)',
                        fontWeight: '600'
                      }}>
                        {leave.is_paid ? '✓ ไม่หักเงิน' : '✗ หักเงิน'}
                      </span>
                    </td>
                    <td>{leave.reason || '-'}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-light)',
                        fontWeight: '700'
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
      <div className="card" style={{ marginBottom: '24px', padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: '700' }}>เงินสุทธิที่ได้รับ</div>
          <div style={{ fontSize: '48px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {periodWage.net_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '18px', color: 'var(--text-muted)' }}>บาท</div>
          <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
            รายได้ {periodWage.total_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })} -
            เงินหัก {periodWage.total_deduction.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* ชั่วโมง OT */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
          จำนวนชั่วโมง OT
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>OT ปกติ (×1.5)</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {periodWage?.ot1_hours?.toFixed(2) || '0.00'} ชม.
            </div>
          </div>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>OT พิเศษ (รายวัน ×2, รายเดือน ×1)</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {periodWage?.ot2_hours?.toFixed(2) || '0.00'} ชม.
            </div>
          </div>
          <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>OT ขั้นสูง (×3)</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {periodWage?.ot3_hours?.toFixed(2) || '0.00'} ชม.
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '4px', fontWeight: '700' }}>รวม OT ทั้งหมด</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {((periodWage?.ot1_hours || 0) + (periodWage?.ot2_hours || 0) + (periodWage?.ot3_hours || 0)).toFixed(2)} ชม. (คูณ multiplier แล้ว)
            </div>
          </div>
        </div>

        {/* ลบส่วนเลือกดูรายวันออก เพราะ API V2 ไม่ส่ง dailyWages มาแล้ว ใช้ summary data แทน */}
      </div>

      {/* ประกันสังคม */}
      {sso && (
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
            {t('wages.ssoDetails')} - {t(`months.${monthNum}`)} {year + 543}
          </h3>
          <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '6px', marginBottom: '16px', border: '1px solid var(--border-light)' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0, fontWeight: '700' }}>
              ประกันสังคมคำนวณแบบรายเดือน (2 งวดรวมกัน) โดยหักสูงสุดไม่เกิน 750 บาท/เดือน
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
            <div style={{ background: 'var(--surface-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>SSO งวดที่ 1</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>
                {sso.period1_sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </div>
            </div>
            <div style={{ background: 'var(--surface-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>SSO งวดที่ 2</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>
                {sso.period2_sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </div>
            </div>
            <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '4px', fontWeight: '700' }}>SSO รวมทั้งเดือน</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
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
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            ยอดสะสมรายปี {year + 543}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>1. เงินเดือนสะสมทั้งปี</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {ytd.ytd_gross_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>2. ภาษีเงินได้สะสมทั้งปี</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {ytd.ytd_tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>3. ประกันสังคมสะสมทั้งปี</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {ytd.ytd_sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>4. รวมเงินได้สะสมทั้งปี</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {ytd.ytd_total_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>5. รวมหักสะสมทั้งปี</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {ytd.ytd_total_deductions.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>6. เงินได้สุทธิสะสมทั้งปี</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {ytd.ytd_net_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All-Time Summary */}
      {allTimeData && (
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            ยอดสะสมทั้งหมด (ตั้งแต่เริ่มทำงาน)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>1. เงินเดือนสะสมทั้งหมด</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {allTimeData.total_gross_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>2. ภาษีเงินได้สะสมทั้งหมด</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {allTimeData.total_tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>3. ประกันสังคมสะสมทั้งหมด</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {allTimeData.total_sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>4. รวมเงินได้สะสมทั้งหมด</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {allTimeData.total_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>5. รวมหักสะสมทั้งหมด</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {allTimeData.total_deduction.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>6. เงินได้สุทธิสะสมทั้งหมด</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {allTimeData.total_net_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '12px', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '14px', color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}>
              ทำงานมาแล้ว: <strong style={{ color: 'var(--text-primary)' }}>{allTimeData.total_periods} งวด</strong>
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
            overflow: 'auto',
            border: '1px solid var(--border-light)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '20px',
              color: 'var(--text-primary)'
            }}>
              {adjustmentType === 'income' ? 'เพิ่มเงินได้' : 'เพิ่มเงินหัก'}
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                ประเภท <span style={{ color: 'var(--text-primary)' }}>*</span>
              </label>
              <select
                value={adjustmentCategory}
                onChange={(e) => setAdjustmentCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-light)',
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
                จำนวนเงิน (บาท) <span style={{ color: 'var(--text-primary)' }}>*</span>
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
                  border: '1px solid var(--border-light)',
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
                  border: '1px solid var(--border-light)',
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

