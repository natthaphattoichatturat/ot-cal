'use client'

import { useState, useEffect } from 'react'
import { format, getDaysInMonth, getDay } from 'date-fns'
import { useLanguage } from '@/contexts/LanguageContext'

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
  employmentType: string
  totalBaseWage: number
  totalOt1Wage: number
  totalOt2Wage: number
  totalOt3Wage: number
  grossWage: number
  attendanceBonus: number
  nightShiftAllowance: number
  additionalIncome: number
  totalIncome: number
  // เงินหัก
  lateMinutes: number
  lateDeduction: number
  leaveDays: number
  leaveDeduction: number
  additionalDeduction: number
  sso: number
  tax: number
  totalDeductions: number
  // เงินสุทธิ
  netWage: number
}

interface MasterItem {
  id: number
  item_name: string
  item_name_th: string
  include_in_sso: boolean
  is_fixed: boolean
  default_amount: number
}

export default function WagesPage() {
  const { t } = useLanguage()
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

  // Income/Deduction Popup State
  const [showIncomeDeductionPopup, setShowIncomeDeductionPopup] = useState(false)
  const [recordType, setRecordType] = useState<'income' | 'deduction'>('income')
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState('')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [masterItems, setMasterItems] = useState<MasterItem[]>([])
  const [savingRecord, setSavingRecord] = useState(false)
  const [message, setMessage] = useState('')
  
  // Calculate wages state
  const [calculating, setCalculating] = useState(false)
  const [calculateMessage, setCalculateMessage] = useState('')

  const thaiDays = [t('days.sunday'), t('days.monday'), t('days.tuesday'), t('days.wednesday'), t('days.thursday'), t('days.friday'), t('days.saturday')]

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
            {t('wages.title')} - {t(`months.${parseInt(selectedMonth)}`)} {parseInt(selectedYear) + 543} ({t('wages.period1')})
          </h3>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '120px' }}>{t('wages.employeeId')}</th>
                <th style={{ minWidth: '180px' }}>{t('wages.employeeName')}</th>
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
                <th className="text-center" style={{ minWidth: '110px', background: 'var(--surface-bg)' }}>{t('wages.baseWage')}</th>
                <th className="text-center" style={{ minWidth: '110px', background: 'var(--surface-bg)' }}>{t('wages.ot1Wage')}</th>
                <th className="text-center" style={{ minWidth: '110px', background: 'var(--surface-bg)' }}>{t('wages.ot2Wage')}</th>
                <th className="text-center" style={{ minWidth: '110px', background: 'var(--surface-bg)' }}>{t('wages.ot3Wage')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredDailyWages.length === 0 ? (
                <tr>
                  <td colSpan={dates.length + 6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    {searchQuery ? t('wages.noData') : t('wages.noData')}
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
                            title={wage ? `${t('common.baht')}: ${wage.daily_total_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ${t('common.baht')}` : ''}
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

  // Fetch master items เมื่อเปิด popup
  const fetchMasterItems = async (type: 'income' | 'deduction') => {
    try {
      const res = await fetch(`/api/income-deduction/master?category=${type}`)
      const data = await res.json()
      if (data.success) {
        setMasterItems(data.data)
      }
    } catch (error) {
      console.error('Error fetching master items:', error)
    }
  }

  const openIncomeDeductionPopup = (type: 'income' | 'deduction') => {
    setRecordType(type)
    setShowIncomeDeductionPopup(true)
    setSelectedEmployees([])
    setSelectedItem('')
    setAmount('')
    setNotes('')
    setMessage('')
    fetchMasterItems(type)
  }

  const closeIncomeDeductionPopup = () => {
    setShowIncomeDeductionPopup(false)
    setSelectedEmployees([])
    setSelectedItem('')
    setAmount('')
    setNotes('')
    setMessage('')
  }

  const toggleEmployee = (employeeId: string) => {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId))
    } else {
      setSelectedEmployees([...selectedEmployees, employeeId])
    }
  }

  const selectAllEmployees = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.employeeId))
    }
  }

  const calculateWages = async () => {
    if (!selectedMonth || !selectedYear) {
      setCalculateMessage(`${t('common.error')}: กรุณาเลือกเดือนและปี`)
      return
    }

    setCalculating(true)
    setCalculateMessage('')

    try {
      // ใช้ API batch ที่เร็วกว่าเดิม 10-50 เท่า!
      const res = await fetch('/api/wages/calculate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: parseInt(selectedMonth),
          year: parseInt(selectedYear)
        })
      })

      const data = await res.json()

      if (data.success) {
        const duration = data.duration_ms ? ` (${(data.duration_ms / 1000).toFixed(1)}s)` : ''
        setCalculateMessage(`${t('common.success')}: คำนวณสำเร็จ ${data.calculated} รายการ${duration}`)
        // Refresh data
        await fetchWageData()
        setTimeout(() => {
          setCalculateMessage('')
        }, 3000)
      } else {
        setCalculateMessage(`${t('common.error')}: ${data.error}`)
      }
    } catch (error) {
      console.error('Error calculating wages:', error)
      setCalculateMessage(`${t('common.error')}: เกิดข้อผิดพลาดในการคำนวณ`)
    } finally {
      setCalculating(false)
    }
  }

  const saveIncomeDeduction = async () => {
    if (selectedEmployees.length === 0) {
      setMessage(`${t('common.error')}: กรุณาเลือกพนักงานอย่างน้อย 1 คน`)
      return
    }

    if (!selectedItem || !amount) {
      setMessage(`${t('common.error')}: กรุณากรอกข้อมูลให้ครบถ้วน`)
      return
    }

    setSavingRecord(true)
    setMessage('')

    try {
      const selectedMasterItem = masterItems.find(item => item.item_name === selectedItem)

      const res = await fetch('/api/income-deduction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeIds: selectedEmployees,
          payPeriodMonth: parseInt(selectedMonth),
          payPeriodYear: parseInt(selectedYear),
          payPeriod: selectedPeriod,
          recordType,
          itemName: selectedItem,
          amount: parseFloat(amount),
          includeInSso: selectedMasterItem?.include_in_sso || false,
          isFixed: selectedMasterItem?.is_fixed || false,
          notes,
          createdBy: 'admin'
        })
      })

      const data = await res.json()

      if (data.success) {
        setMessage(`${t('common.success')}: ${data.message}`)
        setTimeout(() => {
          closeIncomeDeductionPopup()
        }, 1500)
      } else {
        setMessage(`${t('common.error')}: ${data.error}`)
      }
    } catch (error) {
      console.error('Error saving income/deduction:', error)
      setMessage(`${t('common.error')}: เกิดข้อผิดพลาดในการบันทึกข้อมูล`)
    } finally {
      setSavingRecord(false)
    }
  }

  const Pagination = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
      <button
        className="btn btn-secondary"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ← {t('common.previous')}
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
        {t('common.next')} →
      </button>
    </div>
  )

  return (
    <div className="app-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">{t('wages.title')}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              {t('wages.detailTitle')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => openIncomeDeductionPopup('income')}
              className="btn btn-secondary"
            >
              {t('wages.addIncome')}
            </button>
            <button
              onClick={() => openIncomeDeductionPopup('deduction')}
              className="btn btn-secondary"
            >
              {t('wages.addDeduction')}
            </button>
            <a href="/" className="btn btn-secondary">
              ← {t('common.back')}
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
            {t('wages.dailySalary')}
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
            {t('wages.detailTitle')}
          </button>
        </div>
      </div>

      {/* Calculate Wages Button & Message */}
      {calculateMessage && (
        <div className="card" style={{ marginBottom: '24px', padding: '16px', background: calculateMessage.startsWith('สำเร็จ') ? '#F5F5F5' : '#F5F5F5' }}>
          <p style={{ margin: 0, color: calculateMessage.startsWith('สำเร็จ') ? 'var(--text-primary)' : 'var(--text-primary)', fontSize: '14px', fontWeight: '700' }}>
            {calculateMessage}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          {/* Month */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {t('common.month')}
            </label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => {
                const month = (i + 1).toString().padStart(2, '0')
                return (
                  <option key={month} value={month}>
                    {t(`months.${i + 1}`)}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Year */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {t('common.year')}
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
              {t('common.period')}
            </label>
            <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(Number(e.target.value) as 1 | 2)}>
              <option value={1}>{t('wages.period1')} (26-10)</option>
              <option value={2}>{t('wages.period2')} (11-25)</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {t('wages.searchEmployee')}
            </label>
            <input
              type="text"
              placeholder={t('wages.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Calculate Wages Button */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={calculateWages}
            disabled={calculating}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {calculating ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                {t('wages.calculating')}
              </>
            ) : (
              <>
                🧮 {t('wages.calculateWages')}
              </>
            )}
          </button>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            {t('wages.calculateWages')} {t(`months.${parseInt(selectedMonth)}`)} {parseInt(selectedYear) + 543} (ทั้ง 2 {t('common.period')})
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>{t('common.loading')}</p>
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
                    {t('wages.detailTitle')} - {t(`months.${parseInt(selectedMonth)}`)} {parseInt(selectedYear) + 543} ({t('common.period')} {selectedPeriod})
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {t('home.showing')} {startIndex + 1}-{Math.min(endIndex, filteredEmployees.length)} {t('common.people')} {filteredEmployees.length} {t('common.people')}
                  </p>
                </div>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ minWidth: '100px' }}>{t('wages.employeeId')}</th>
                        <th style={{ minWidth: '150px' }}>{t('wages.employeeName')}</th>
                        <th style={{ minWidth: '80px' }}>{t('wages.employeeType')}</th>
                        <th className="text-right" style={{ minWidth: '100px' }}>{t('wages.baseWage')}</th>
                        <th className="text-right" style={{ minWidth: '80px' }}>OT 1.5</th>
                        <th className="text-right" style={{ minWidth: '80px' }}>OT 2</th>
                        <th className="text-right" style={{ minWidth: '80px' }}>OT 3</th>
                        <th className="text-right" style={{ minWidth: '80px' }}>{t('wages.attendanceBonus')}</th>
                        <th className="text-right" style={{ minWidth: '100px', background: '#dcfce7' }}>{t('wages.totalIncome')}</th>
                        <th className="text-right" style={{ minWidth: '80px' }}>{t('wages.lateDeduction')}</th>
                        <th className="text-right" style={{ minWidth: '80px' }}>{t('wages.sso')}</th>
                        <th className="text-right" style={{ minWidth: '80px' }}>{t('wages.tax')}</th>
                        <th className="text-right" style={{ minWidth: '100px', background: '#fee2e2' }}>{t('wages.deductions')}</th>
                        <th className="text-right" style={{ minWidth: '120px', background: 'var(--primary-light)' }}>{t('wages.netWage')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentEmployees.length === 0 ? (
                        <tr>
                          <td colSpan={14} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            {searchQuery ? t('wages.noData') : t('wages.noData')}
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
                            <td>
                              <span style={{ 
                                padding: '2px 6px', 
                                borderRadius: '4px', 
                                fontSize: '11px',
                                background: emp.employmentType === 'รายเดือน' ? '#dbeafe' : '#dcfce7',
                                color: emp.employmentType === 'รายเดือน' ? '#1e40af' : '#16a34a'
                              }}>
                                {emp.employmentType || 'รายวัน'}
                              </span>
                            </td>
                            <td className="text-right">{emp.totalBaseWage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                            <td className="text-right">{emp.totalOt1Wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                            <td className="text-right">{emp.totalOt2Wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                            <td className="text-right">{emp.totalOt3Wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                            <td className="text-right" style={{ color: emp.attendanceBonus > 0 ? '#16a34a' : 'inherit' }}>
                              {emp.attendanceBonus.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="text-right" style={{ fontWeight: '600', background: '#dcfce7', color: '#16a34a' }}>
                              {emp.totalIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="text-right" style={{ color: emp.lateDeduction > 0 ? '#dc2626' : 'inherit' }}>
                              {emp.lateDeduction > 0 ? `-${emp.lateDeduction.toLocaleString('th-TH', { minimumFractionDigits: 2 })}` : '0.00'}
                            </td>
                            <td className="text-right">{emp.sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                            <td className="text-right">{emp.tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                            <td className="text-right" style={{ fontWeight: '600', background: '#fee2e2', color: '#dc2626' }}>
                              {emp.totalDeductions.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="text-right" style={{ fontWeight: '700', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '14px' }}>
                              {emp.netWage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
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

      {/* Income/Deduction Popup */}
      {showIncomeDeductionPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={closeIncomeDeductionPopup}
        >
          <div
            className="card"
            style={{
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '24px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
              {recordType === 'income' ? t('wages.addIncome') : t('wages.addDeduction')}
            </h2>

            {message && (
              <div
                style={{
                  padding: '12px',
                  marginBottom: '16px',
                  borderRadius: '8px',
                  background: '#F5F5F5',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {message}
              </div>
            )}

            {/* งวดที่เลือก */}
            <div style={{ marginBottom: '20px', padding: '12px', background: 'var(--surface-bg)', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{t('wages.selectPeriod')}:</div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginTop: '4px' }}>
                {t(`months.${parseInt(selectedMonth)}`)} {parseInt(selectedYear) + 543} - {t('common.period')} {selectedPeriod}
              </div>
            </div>

            {/* เลือกรายการ */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                {t('wages.category')} <span style={{ color: 'red' }}>{t('wages.required')}</span>
              </label>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">{t('wages.selectCategory')}</option>
                {masterItems.map(item => (
                  <option key={item.id} value={item.item_name}>
                    {item.item_name_th} {item.include_in_sso && '(คำนวณ SSO)'}
                  </option>
                ))}
              </select>
            </div>

            {/* จำนวนเงิน */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                {t('wages.amount')} ({t('common.baht')}) <span style={{ color: 'red' }}>{t('wages.required')}</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t('wages.enterAmount')}
                step="0.01"
                style={{ width: '100%' }}
              />
            </div>

            {/* หมายเหตุ */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                {t('wages.description')}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('wages.enterDescription')}
                rows={3}
                style={{ width: '100%', fontFamily: 'inherit' }}
              />
            </div>

            {/* เลือกพนักงาน */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600' }}>
                  {t('documents.selectEmployee')} <span style={{ color: 'red' }}>{t('wages.required')}</span>
                </label>
                <button
                  onClick={selectAllEmployees}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                >
                  {selectedEmployees.length === filteredEmployees.length ? t('common.cancel') : t('documents.allEmployees')}
                </button>
              </div>

              <div
                style={{
                  maxHeight: '200px',
                  overflow: 'auto',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              >
                {filteredEmployees.map(emp => (
                  <label
                    key={emp.employeeId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px',
                      marginBottom: '4px',
                      background: selectedEmployees.includes(emp.employeeId) ? 'var(--primary-light)' : 'transparent',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(emp.employeeId)}
                      onChange={() => toggleEmployee(emp.employeeId)}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{ fontSize: '14px' }}>
                      <strong>{emp.employeeId}</strong> - {emp.name} ({emp.department})
                    </span>
                  </label>
                ))}
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                {t('documents.selectEmployee')} {selectedEmployees.length} {t('common.people')}
              </div>
            </div>

            {/* ปุ่ม */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeIncomeDeductionPopup}
                className="btn btn-secondary"
                disabled={savingRecord}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={saveIncomeDeduction}
                className="btn btn-primary"
                disabled={savingRecord}
              >
                {savingRecord ? t('wages.saving') : `💾 ${t('common.save')}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
