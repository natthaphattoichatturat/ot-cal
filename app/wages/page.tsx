'use client'

import { useState, useEffect } from 'react'
import { format, getDaysInMonth, getDay } from 'date-fns'

interface DailyWageData {
  employeeId: string
  name: string
  department: string
  wages: {
    [date: string]: {
      base_wage: number
      ot1_wage: number
      ot2_wage: number
      ot3_wage: number
      daily_total_wage: number
    }
  }
}

interface EmployeeWage {
  employeeId: string
  name: string
  department: string
  totalBaseWage: number
  totalOt1Wage: number
  totalOt2Wage: number
  totalOt3Wage: number
  grossWage: number
  attendanceBonus: number
  totalIncome: number
}

export default function WagesPage() {
  const [activeTab, setActiveTab] = useState<'daily' | 'summary'>('daily')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)

  // Daily wages data (for Tab 1)
  const [dailyWageData, setDailyWageData] = useState<DailyWageData[]>([])
  const [filteredDailyWages, setFilteredDailyWages] = useState<DailyWageData[]>([])

  // Summary data (for Tab 2)
  const [employeeWages, setEmployeeWages] = useState<EmployeeWage[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeWage[]>([])

  // Search & Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const itemsPerPage = 10

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ]

  const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']

  // Initialize with current month/year
  useEffect(() => {
    const now = new Date()
    setSelectedMonth((now.getMonth() + 1).toString().padStart(2, '0'))
    setSelectedYear(now.getFullYear().toString())
  }, [])

  // Fetch data when filters change
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchWageData()
    }
  }, [selectedMonth, selectedYear, selectedPeriod, activeTab])

  // Filter data when search changes
  useEffect(() => {
    filterData()
  }, [searchQuery, dailyWageData, employeeWages])

  const fetchWageData = async () => {
    setLoading(true)
    try {
      const monthStr = `${selectedYear}-${selectedMonth}`

      if (activeTab === 'daily') {
        // Fetch attendance data และแปลงเป็น wage data
        const res = await fetch(`/api/attendance?month=${monthStr}&period=${selectedPeriod}`)
        const data = await res.json()

        if (data.success) {
          // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการ
          const wageData: DailyWageData[] = data.data.map((emp: any) => {
            const wages: { [date: string]: any } = {}

            Object.keys(emp.attendance || {}).forEach(date => {
              const att = emp.attendance[date]
              const perhrSalary = emp.perhr_salary || 0

              // คำนวณค่าจ้างแต่ละประเภท
              // OT Normal: ชั่วโมง × อัตรา × 1.5
              // OT Special: ชั่วโมง × อัตรา × 2
              // OT Premium: ชั่วโมง × อัตรา × 3
              wages[date] = {
                base_wage: (att.actualHours > 0 ? 8 : 0) * perhrSalary,
                ot1_wage: (att.otNormalHours || 0) * perhrSalary * 1.5,
                ot2_wage: (att.otSpecialHours || 0) * perhrSalary * 2,
                ot3_wage: (att.otPremiumHours || 0) * perhrSalary * 3,
                daily_total_wage: 0
              }

              wages[date].daily_total_wage =
                wages[date].base_wage +
                wages[date].ot1_wage +
                wages[date].ot2_wage +
                wages[date].ot3_wage
            })

            return {
              employeeId: emp.employeeId,
              name: emp.name,
              department: emp.department,
              wages
            }
          })

          setDailyWageData(wageData)
        }
      } else {
        // Fetch employee summary
        const res = await fetch(`/api/wages/summary?month=${monthStr}&period=${selectedPeriod}`)
        const data = await res.json()
        if (data.success) {
          setEmployeeWages(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching wage data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterData = () => {
    const query = searchQuery.toLowerCase().trim()

    if (activeTab === 'daily') {
      if (!query) {
        setFilteredDailyWages(dailyWageData)
      } else {
        const filtered = dailyWageData.filter(emp =>
          emp.employeeId.toLowerCase().includes(query) ||
          emp.name.toLowerCase().includes(query)
        )
        setFilteredDailyWages(filtered)
      }
    } else {
      if (!query) {
        setFilteredEmployees(employeeWages)
      } else {
        const filtered = employeeWages.filter(emp =>
          emp.employeeId.toLowerCase().includes(query) ||
          emp.name.toLowerCase().includes(query)
        )
        setFilteredEmployees(filtered)
      }
    }
    setCurrentPage(1)
  }

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getDayColor = (dateStr: string): string => {
    const date = new Date(dateStr)
    const day = getDay(date)

    const colors = [
      'day-sunday',
      'day-monday',
      'day-tuesday',
      'day-wednesday',
      'day-thursday',
      'day-friday',
      'day-saturday'
    ]

    return colors[day]
  }

  const renderDailyWagesTable = () => {
    const year = parseInt(selectedYear)
    const month = parseInt(selectedMonth)
    let dates: string[] = []

    if (selectedPeriod === 1) {
      const prevMonth = month === 1 ? 12 : month - 1
      const prevYear = month === 1 ? year - 1 : year
      const daysInPrevMonth = getDaysInMonth(new Date(prevYear, prevMonth - 1))

      for (let day = 26; day <= daysInPrevMonth; day++) {
        dates.push(`${prevYear}-${prevMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`)
      }

      for (let day = 1; day <= 10; day++) {
        dates.push(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`)
      }
    } else {
      for (let day = 11; day <= 25; day++) {
        dates.push(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`)
      }
    }

    return (
      <div className="table-container">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
            ตารางค่าจ้างรายวัน - {thaiMonths[parseInt(selectedMonth) - 1]} {parseInt(selectedYear) + 543} (งวดที่ {selectedPeriod})
          </h3>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '120px' }}>รหัสพนักงาน</th>
                <th style={{ minWidth: '180px' }}>ชื่อพนักงาน</th>
                {dates.map(date => {
                  const day = parseInt(date.split('-')[2])
                  const dateObj = new Date(date)
                  const dayOfWeek = thaiDays[dateObj.getDay()]
                  return (
                    <th key={date} className="text-center" style={{ minWidth: '90px' }}>
                      <div style={{ fontWeight: '700' }}>{day}</div>
                      <div style={{ fontSize: '11px', fontWeight: '400', opacity: 0.7 }}>{dayOfWeek}</div>
                    </th>
                  )
                })}
                <th className="text-center" style={{ minWidth: '110px', background: 'var(--surface-bg)' }}>ค่าจ้างพื้นฐาน</th>
                <th className="text-center" style={{ minWidth: '110px', background: 'var(--surface-bg)' }}>ค่า OT ปกติ</th>
                <th className="text-center" style={{ minWidth: '110px', background: 'var(--surface-bg)' }}>ค่า OT พิเศษ</th>
                <th className="text-center" style={{ minWidth: '110px', background: 'var(--surface-bg)' }}>ค่า OT ขั้นสูง</th>
              </tr>
            </thead>
            <tbody>
              {filteredDailyWages.length === 0 ? (
                <tr>
                  <td colSpan={dates.length + 6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    {searchQuery ? 'ไม่พบข้อมูลพนักงานที่ค้นหา' : 'ไม่มีข้อมูลค่าจ้าง'}
                  </td>
                </tr>
              ) : (
                filteredDailyWages.map((employee) => {
                  let totalBase = 0
                  let totalOt1 = 0
                  let totalOt2 = 0
                  let totalOt3 = 0

                  dates.forEach(date => {
                    if (employee.wages[date]) {
                      totalBase += employee.wages[date].base_wage
                      totalOt1 += employee.wages[date].ot1_wage
                      totalOt2 += employee.wages[date].ot2_wage
                      totalOt3 += employee.wages[date].ot3_wage
                    }
                  })

                  return (
                    <tr key={employee.employeeId}>
                      <td>{employee.employeeId}</td>
                      <td className="employee-name">{employee.name}</td>
                      {dates.map(date => {
                        const wage = employee.wages[date]
                        const dayColor = getDayColor(date)

                        return (
                          <td
                            key={date}
                            className={`text-center ${dayColor}`}
                            title={wage ? `รวม: ${wage.daily_total_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท` : ''}
                          >
                            {wage ? (
                              <span className="ot-value">
                                {wage.daily_total_wage.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
                              </span>
                            ) : ''}
                          </td>
                        )
                      })}
                      <td className="text-center" style={{ fontWeight: '600', fontSize: '14px', background: 'var(--surface-bg)' }}>
                        {totalBase.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-center" style={{ fontWeight: '600', fontSize: '14px', background: 'var(--surface-bg)' }}>
                        {totalOt1.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-center" style={{ fontWeight: '600', fontSize: '14px', background: 'var(--surface-bg)' }}>
                        {totalOt2.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-center" style={{ fontWeight: '600', fontSize: '14px', background: 'var(--surface-bg)' }}>
                        {totalOt3.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const Pagination = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
      <button
        className="btn btn-secondary"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ← ก่อนหน้า
      </button>

      <div style={{ display: 'flex', gap: '8px' }}>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum
          if (totalPages <= 5) {
            pageNum = i + 1
          } else if (currentPage <= 3) {
            pageNum = i + 1
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i
          } else {
            pageNum = currentPage - 2 + i
          }

          return (
            <button
              key={pageNum}
              className={currentPage === pageNum ? 'btn btn-primary' : 'btn btn-secondary'}
              onClick={() => goToPage(pageNum)}
              style={{ minWidth: '40px' }}
            >
              {pageNum}
            </button>
          )
        })}
      </div>

      <button
        className="btn btn-secondary"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ถัดไป →
      </button>
    </div>
  )

  return (
    <div className="app-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">ระบบคำนวณค่าจ้าง</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              ตรวจสอบค่าจ้างและรายละเอียดการจ่ายเงิน
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href="/" className="btn btn-secondary">
              ← กลับหน้าหลัก
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', borderBottom: '2px solid var(--border-light)' }}>
          <button
            onClick={() => setActiveTab('daily')}
            style={{
              flex: 1,
              padding: '16px 24px',
              background: activeTab === 'daily' ? 'var(--primary-light)' : 'transparent',
              color: activeTab === 'daily' ? 'var(--primary)' : 'var(--text-secondary)',
              border: 'none',
              borderBottom: activeTab === 'daily' ? '3px solid var(--primary)' : 'none',
              fontWeight: activeTab === 'daily' ? '700' : '500',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ค่าจ้างรายวัน
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            style={{
              flex: 1,
              padding: '16px 24px',
              background: activeTab === 'summary' ? 'var(--primary-light)' : 'transparent',
              color: activeTab === 'summary' ? 'var(--primary)' : 'var(--text-secondary)',
              border: 'none',
              borderBottom: activeTab === 'summary' ? '3px solid var(--primary)' : 'none',
              fontWeight: activeTab === 'summary' ? '700' : '500',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            สรุปค่าจ้างพนักงาน
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {/* Month */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              เดือน
            </label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => {
                const month = (i + 1).toString().padStart(2, '0')
                return (
                  <option key={month} value={month}>
                    {thaiMonths[i]}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Year */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              ปี พ.ศ.
            </label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i
                return (
                  <option key={year} value={year}>
                    {year + 543}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Period */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              งวดที่
            </label>
            <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(Number(e.target.value) as 1 | 2)}>
              <option value={1}>งวดที่ 1 (26-10)</option>
              <option value={2}>งวดที่ 2 (11-25)</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              ค้นหาพนักงาน
            </label>
            <input
              type="text"
              placeholder="ค้นหาด้วยรหัสหรือชื่อพนักงาน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <>
          {/* Daily Wages Tab */}
          {activeTab === 'daily' && (
            <div className="card">
              {renderDailyWagesTable()}
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <>
              {/* Pagination Top */}
              {totalPages > 1 && (
                <div style={{ marginBottom: '16px' }}>
                  <Pagination />
                </div>
              )}

              <div className="card">
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                    สรุปค่าจ้างพนักงาน - {thaiMonths[parseInt(selectedMonth) - 1]} {parseInt(selectedYear) + 543} (งวดที่ {selectedPeriod})
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    แสดง {startIndex + 1}-{Math.min(endIndex, filteredEmployees.length)} จากทั้งหมด {filteredEmployees.length} คน
                  </p>
                </div>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ minWidth: '120px' }}>รหัสพนักงาน</th>
                        <th style={{ minWidth: '180px' }}>ชื่อพนักงาน</th>
                        <th style={{ minWidth: '120px' }}>แผนก</th>
                        <th className="text-right" style={{ minWidth: '120px' }}>ค่าจ้างพื้นฐาน</th>
                        <th className="text-right" style={{ minWidth: '120px' }}>ค่า OT 1</th>
                        <th className="text-right" style={{ minWidth: '120px' }}>ค่า OT 2</th>
                        <th className="text-right" style={{ minWidth: '120px' }}>ค่า OT 3</th>
                        <th className="text-right" style={{ minWidth: '120px' }}>เบี้ยขยัน</th>
                        <th className="text-right" style={{ minWidth: '140px', background: 'var(--primary-light)' }}>รวมรายได้</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentEmployees.length === 0 ? (
                        <tr>
                          <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            {searchQuery ? 'ไม่พบข้อมูลพนักงานที่ค้นหา' : 'ไม่มีข้อมูลพนักงาน'}
                          </td>
                        </tr>
                      ) : (
                        currentEmployees.map((emp) => (
                          <tr
                            key={emp.employeeId}
                            style={{ cursor: 'pointer' }}
                            onClick={() => window.location.href = `/wages/${emp.employeeId}?month=${selectedYear}-${selectedMonth}&period=${selectedPeriod}`}
                          >
                            <td>{emp.employeeId}</td>
                            <td className="employee-name">{emp.name}</td>
                            <td>{emp.department}</td>
                            <td className="text-right">{emp.totalBaseWage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                            <td className="text-right">{emp.totalOt1Wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                            <td className="text-right">{emp.totalOt2Wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                            <td className="text-right">{emp.totalOt3Wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                            <td className="text-right">{emp.attendanceBonus.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                            <td className="text-right" style={{ fontWeight: '700', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                              {emp.totalIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination Bottom */}
              {totalPages > 1 && (
                <div style={{ marginTop: '16px' }}>
                  <Pagination />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
