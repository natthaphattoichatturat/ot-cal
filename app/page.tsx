'use client'

import { useState, useEffect, useRef } from 'react'
import { format, getDaysInMonth, getDay } from 'date-fns'
import { useLanguage } from '@/contexts/LanguageContext'

interface AttendanceData {
  employeeId: string
  name: string
  department: string
  attendance: {
    [date: string]: {
      otHours: number
      otNormalHours: number
      otSpecialHours: number
      otPremiumHours: number
      actualHours: number
      isHoliday: boolean
      late: boolean
      checkInTime: string
      checkOutTime: string
    }
  }
}

export default function Home() {
  const { t } = useLanguage()
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [period1Data, setPeriod1Data] = useState<AttendanceData[]>([])
  const [period2Data, setPeriod2Data] = useState<AttendanceData[]>([])
  const [filteredPeriod1, setFilteredPeriod1] = useState<AttendanceData[]>([])
  const [filteredPeriod2, setFilteredPeriod2] = useState<AttendanceData[]>([])
  const [loading, setLoading] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState('')

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)

  // Thai day names
  const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']

  const formatThaiDate = (date: Date): string => {
    const day = thaiDays[date.getDay()]
    const dateNum = date.getDate()
    const monthNum = date.getMonth() + 1
    const month = t(`months.${monthNum}`)
    const year = date.getFullYear() + 543
    const time = format(date, 'HH:mm:ss')
    return `วัน${day}ที่ ${dateNum} ${month} ${year} เวลา ${time} น.`
  }

  // Update current time every second - only on client
  useEffect(() => {
    // Set initial time on mount
    setCurrentDateTime(new Date())

    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Initialize with current month/year
  useEffect(() => {
    const now = new Date()
    setSelectedMonth((now.getMonth() + 1).toString().padStart(2, '0'))
    setSelectedYear(now.getFullYear().toString())
  }, [])

  // Fetch data when month/year changes
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchAttendanceData()
    }
  }, [selectedMonth, selectedYear])

  // Filter data when search changes
  useEffect(() => {
    filterData()
  }, [searchQuery, period1Data, period2Data])

  // Close autocomplete when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchAttendanceData = async () => {
    setLoading(true)
    try {
      const monthStr = `${selectedYear}-${selectedMonth}`

      const res1 = await fetch(`/api/attendance?month=${monthStr}&period=1`)
      const data1 = await res1.json()
      if (data1.success) {
        setPeriod1Data(data1.data)
      }

      const res2 = await fetch(`/api/attendance?month=${monthStr}&period=2`)
      const data2 = await res2.json()
      if (data2.success) {
        setPeriod2Data(data2.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterData = () => {
    const query = searchQuery.toLowerCase().trim()

    if (!query) {
      setFilteredPeriod1(period1Data)
      setFilteredPeriod2(period2Data)
      setShowAutocomplete(false)
      return
    }

    const filtered1 = period1Data.filter(emp =>
      emp.employeeId.toLowerCase().includes(query) ||
      emp.name.toLowerCase().includes(query)
    )

    const filtered2 = period2Data.filter(emp =>
      emp.employeeId.toLowerCase().includes(query) ||
      emp.name.toLowerCase().includes(query)
    )

    setFilteredPeriod1(filtered1)
    setFilteredPeriod2(filtered2)
    setShowAutocomplete(true)
  }

  const getAutocompleteOptions = () => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return []

    const allEmployees = [...period1Data]
    const unique = allEmployees.filter((emp, index, self) =>
      index === self.findIndex(e => e.employeeId === emp.employeeId)
    )

    return unique.filter(emp =>
      emp.employeeId.toLowerCase().includes(query) ||
      emp.name.toLowerCase().includes(query)
    ).slice(0, 10)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setSelectedIndex(-1)
  }

  const handleSelectEmployee = (emp: AttendanceData) => {
    setSearchQuery(`${emp.employeeId} - ${emp.name}`)
    setShowAutocomplete(false)
    filterData()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const options = getAutocompleteOptions()

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < options.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSelectEmployee(options[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false)
    }
  }

  const handleImport = async () => {
    if (!importFile) return

    setImporting(true)
    setImportMessage('')

    try {
      const formData = new FormData()
      formData.append('file', importFile)

      const response = await fetch('/api/import-scans', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        // แสดงผลรวมทั้ง OT และค่าจ้าง
        let message = `สำเร็จ: ${result.message}`

        // เพิ่มรายละเอียดค่าจ้างถ้ามี
        if (result.wagesCalculated > 0) {
          message += `\n\nคำนวณค่าจ้างอัตโนมัติ: ${result.wagesCalculated} รายการ`
          if (result.wageDetails && result.wageDetails.length > 0) {
            message += `\n${result.wageDetails.join(', ')}`
          }
        }

        setImportMessage(message)
        setImportFile(null)
        await fetchAttendanceData()
      } else {
        setImportMessage(`ผิดพลาด: ${result.error}`)
      }
    } catch (error) {
      setImportMessage('ผิดพลาด: เกิดข้อผิดพลาดในการนำเข้าข้อมูล')
    } finally {
      setImporting(false)
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

  const renderTable = (data: AttendanceData[], period: number) => {
    const year = parseInt(selectedYear)
    const month = parseInt(selectedMonth)
    let dates: string[] = []

    if (period === 1) {
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
      <div className="table-container" style={{ marginBottom: '24px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
            {period === 1 ? t('home.period1') : t('home.period2')}
          </h3>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '120px' }}>{t('home.employeeId')}</th>
                <th style={{ minWidth: '180px' }}>{t('home.employeeName')}</th>
                {dates.map(date => {
                  const day = parseInt(date.split('-')[2])
                  const dateObj = new Date(date)
                  const dayOfWeek = thaiDays[dateObj.getDay()]
                  return (
                    <th key={date} className="text-center" style={{ minWidth: '70px' }}>
                      <div style={{ fontWeight: '700' }}>{day}</div>
                      <div style={{ fontSize: '11px', fontWeight: '400', opacity: 0.7 }}>{dayOfWeek}</div>
                    </th>
                  )
                })}
                <th className="text-center" style={{ minWidth: '90px' }}>{t('home.totalOT')}</th>
                <th className="text-center" style={{ minWidth: '100px', background: 'var(--surface-bg)' }}>{t('home.normalOT')}</th>
                <th className="text-center" style={{ minWidth: '100px', background: 'var(--surface-bg)' }}>{t('home.specialOT')}</th>
                <th className="text-center" style={{ minWidth: '100px', background: 'var(--surface-bg)' }}>{t('home.premiumOT')}</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={dates.length + 6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    {searchQuery ? t('home.noData') : t('home.noData')}
                  </td>
                </tr>
              ) : (
                data.map((employee) => {
                  let totalOT = 0
                  let totalNormalOT = 0
                  let totalSpecialOT = 0
                  let totalPremiumOT = 0

                  dates.forEach(date => {
                    if (employee.attendance[date]) {
                      totalOT += employee.attendance[date].otHours
                      totalNormalOT += employee.attendance[date].otNormalHours || 0
                      totalSpecialOT += employee.attendance[date].otSpecialHours || 0
                      totalPremiumOT += employee.attendance[date].otPremiumHours || 0
                    }
                  })

                  return (
                    <tr key={employee.employeeId}>
                      <td>{employee.employeeId}</td>
                      <td className="employee-name">{employee.name}</td>
                      {dates.map(date => {
                        const att = employee.attendance[date]
                        const dayColor = getDayColor(date)

                        return (
                          <td
                            key={date}
                            className={`text-center ${dayColor}`}
                            title={att ? `เข้า: ${att.checkInTime} / ออก: ${att.checkOutTime}\nชั่วโมงจริง: ${att.actualHours}` : ''}
                          >
                            {att ? (
                              <span className="ot-value">
                                {att.otHours.toFixed(2)}
                              </span>
                            ) : ''}
                          </td>
                        )
                      })}
                      <td className="text-center" style={{ fontWeight: '700', fontSize: '15px', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                        {totalOT.toFixed(2)}
                      </td>
                      <td className="text-center" style={{ fontWeight: '700', fontSize: '14px', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                        {totalNormalOT.toFixed(2)}
                      </td>
                      <td className="text-center" style={{ fontWeight: '700', fontSize: '14px', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                        {totalSpecialOT.toFixed(2)}
                      </td>
                      <td className="text-center" style={{ fontWeight: '700', fontSize: '14px', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                        {totalPremiumOT.toFixed(2)}
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

  const autocompleteOptions = getAutocompleteOptions()

  return (
    <div className="app-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">{t('home.title')}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }} suppressHydrationWarning>
              {currentDateTime ? formatThaiDate(currentDateTime) : t('common.loading')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href="/wages" className="btn btn-primary">
              {t('nav.wages')}
            </a>
            <a href="/documents" className="btn btn-secondary">
              {t('nav.documents')}
            </a>
            <a href="/employees" className="btn btn-secondary">
              {t('nav.employees')}
            </a>
            <a href="/dashboard" className="btn btn-secondary">
              {t('nav.dashboard')}
            </a>
            <a href="/leave" className="btn btn-secondary">
              {t('nav.leave')}
            </a>
            <a href="/guide/webapp" className="btn btn-secondary">
              {t('nav.guide')}
            </a>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {/* Search */}
          <div ref={searchRef} style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {t('home.searchEmployee')}
            </label>
            <div className="search-wrapper">
              <svg className="search-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder={t('home.searchPlaceholder')}
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => searchQuery && setShowAutocomplete(true)}
              />
            </div>
            {showAutocomplete && autocompleteOptions.length > 0 && (
              <div className="autocomplete-dropdown">
                {autocompleteOptions.map((emp, index) => (
                  <div
                    key={emp.employeeId}
                    className={`autocomplete-item ${index === selectedIndex ? 'active' : ''}`}
                    onClick={() => handleSelectEmployee(emp)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="autocomplete-item-id">{emp.employeeId}</div>
                    <div className="autocomplete-item-name">{emp.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Month */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {t('home.selectMonth')}
            </label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => {
                const month = (i + 1).toString().padStart(2, '0')
                const monthNum = i + 1
                return (
                  <option key={month} value={month}>
                    {t(`months.${monthNum}`)}
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
        </div>

        {/* Import */}
        <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            {t('home.importData')}
          </label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <input
              type="file"
              accept=".txt"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              disabled={importing}
              style={{ flex: 1 }}
            />
            <button
              onClick={handleImport}
              disabled={!importFile || importing}
              className="btn btn-primary"
            >
              {importing ? t('home.importing') : t('home.importButton')}
            </button>
          </div>
          {importMessage && (
            <div className={importMessage.startsWith('สำเร็จ') ? 'message message-success' : 'message message-error'}>
              {importMessage}
            </div>
          )}
        </div>
      </div>

      {/* Tables */}
      {loading ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>{t('common.loading')}</p>
        </div>
      ) : (
        <>
          {renderTable(filteredPeriod1, 1)}
          {renderTable(filteredPeriod2, 2)}
        </>
      )}
    </div>
  )
}
