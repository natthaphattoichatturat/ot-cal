'use client'

import { useState, useEffect, useRef } from 'react'
import { format, getDaysInMonth, getDay } from 'date-fns'

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
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ]

  const formatThaiDate = (date: Date): string => {
    const day = thaiDays[date.getDay()]
    const dateNum = date.getDate()
    const month = thaiMonths[date.getMonth()]
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
        setImportMessage(`✓ ${result.message}`)
        setImportFile(null)
        await fetchAttendanceData()
      } else {
        setImportMessage(`✗ ${result.error}`)
      }
    } catch (error) {
      setImportMessage('✗ เกิดข้อผิดพลาดในการนำเข้าข้อมูล')
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
            งวดที่ {period}: {period === 1 ? 'วันที่ 26 (เดือนก่อน) - 10' : 'วันที่ 11 - 25'}
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
                    <th key={date} className="text-center" style={{ minWidth: '70px' }}>
                      <div style={{ fontWeight: '700' }}>{day}</div>
                      <div style={{ fontSize: '11px', fontWeight: '400', opacity: 0.7 }}>{dayOfWeek}</div>
                    </th>
                  )
                })}
                <th className="text-center" style={{ minWidth: '90px' }}>รวม OT</th>
                <th className="text-center" style={{ minWidth: '100px', background: 'var(--surface-bg)' }}>OT ปกติ (×1.5)</th>
                <th className="text-center" style={{ minWidth: '100px', background: 'var(--surface-bg)' }}>OT พิเศษ (×2)</th>
                <th className="text-center" style={{ minWidth: '100px', background: 'var(--surface-bg)' }}>OT ขั้นสูง (×3)</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={dates.length + 6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    {searchQuery ? 'ไม่พบข้อมูลพนักงานที่ค้นหา' : 'ไม่มีข้อมูล OT'}
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
                      <td className="text-center" style={{ fontWeight: '700', fontSize: '15px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        {totalOT.toFixed(2)}
                      </td>
                      <td className="text-center" style={{ fontWeight: '600', fontSize: '14px', background: 'var(--surface-bg)', color: 'var(--text-primary)' }}>
                        {totalNormalOT.toFixed(2)}
                      </td>
                      <td className="text-center" style={{ fontWeight: '600', fontSize: '14px', background: 'var(--surface-bg)', color: 'var(--text-primary)' }}>
                        {totalSpecialOT.toFixed(2)}
                      </td>
                      <td className="text-center" style={{ fontWeight: '600', fontSize: '14px', background: 'var(--surface-bg)', color: 'var(--text-primary)' }}>
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
            <h1 className="page-title">ระบบคำนวณชั่วโมง OT พนักงาน</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }} suppressHydrationWarning>
              {currentDateTime ? formatThaiDate(currentDateTime) : 'กำลังโหลด...'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href="/wages" className="btn btn-primary">
              คำนวณค่าจ้าง
            </a>
            <a href="/employees" className="btn btn-secondary">
              จัดการพนักงาน
            </a>
            <a href="/leave" className="btn btn-secondary">
              บันทึกการลา
            </a>
            <a href="/guide/webapp" className="btn btn-secondary">
              คู่มือ Web App
            </a>
            <a href="/guide/line" className="btn btn-secondary">
              คู่มือระบบ LINE
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
              ค้นหาพนักงาน
            </label>
            <div className="search-wrapper">
              <svg className="search-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="ค้นหาด้วยรหัสหรือชื่อพนักงาน..."
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
        </div>

        {/* Import */}
        <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            นำเข้าข้อมูลการสแกน
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
              {importing ? 'กำลังนำเข้า...' : 'นำเข้าข้อมูล'}
            </button>
          </div>
          {importMessage && (
            <div className={importMessage.startsWith('✓') ? 'message message-success' : 'message message-error'}>
              {importMessage}
            </div>
          )}
        </div>
      </div>

      {/* Tables */}
      {loading ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</p>
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
