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
  const [currentPeriod, setCurrentPeriod] = useState(1)

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
        setCurrentPeriod(data.data.currentPeriod)
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">รายละเอียดค่าจ้างพนักงาน</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              {thaiMonths[monthNum - 1]} {year + 543} - งวดที่ {currentPeriod}
            </p>
          </div>
          <a href={`/wages?month=${month}&period=${period}`} className="btn btn-secondary">
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
          รายได้รวม (งวดที่ {currentPeriod})
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
            <div style={{ fontSize: '18px', fontWeight: '600', color: periodWage.attendance_bonus > 0 ? '#10b981' : 'var(--text-primary)' }}>
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
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>SSO งวดที่ 1 (หักแล้ว)</div>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>
                {sso.period1_sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </div>
            </div>
            <div style={{ background: 'var(--surface-bg)', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                SSO งวดที่ 2 {currentPeriod === 2 ? '(หักงวดนี้)' : ''}
              </div>
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
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#10b981' }}>
                {ytd.ytd_total_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ประกันสังคมสะสม</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#ef4444' }}>
                {ytd.ytd_sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ภาษีสะสม</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#ef4444' }}>
                {ytd.ytd_tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>รวมหักสะสม</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#ef4444' }}>
                {ytd.ytd_total_deductions.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ background: '#d1fae5', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: '#10b981', marginBottom: '4px', fontWeight: '600' }}>เงินสุทธิสะสม</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
                {ytd.ytd_net_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
