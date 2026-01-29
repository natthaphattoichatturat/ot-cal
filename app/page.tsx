'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { format, getDaysInMonth, getDay } from 'date-fns'
import { useLanguage } from '@/contexts/LanguageContext'

interface AttendanceData {
  employeeId: string
  name: string
  department: string
  perhr_salary?: number
  position?: string
  department_code?: string
  section?: string
  totalWorkDays?: number
  personalLeaveDays?: number
  sickLeaveDays?: number
  absentDays?: number
  lateDays?: number
  lateMinutes?: number
  nightShiftDays?: number
  nightShiftAllowance?: number
  specialIncome?: number
  attendance: {
    [date: string]: {
      otHours: number
      otNormalHours: number
      otSpecialHours: number
      otPremiumHours: number
      otHoursMultiplied: number
      otNormalHoursMultiplied: number
      otSpecialHoursMultiplied: number
      otPremiumHoursMultiplied: number
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

  // Multi-select state
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set())

  // Group by state
  const [groupBy, setGroupBy] = useState<'none' | 'position' | 'department_code' | 'section'>('none')
  const [selectedGroup, setSelectedGroup] = useState<string>('')

  // Morning OT Modal state
  const [showMorningOTModal, setShowMorningOTModal] = useState(false)
  const [morningOTData, setMorningOTData] = useState<any[]>([])
  const [loadingMorningOT, setLoadingMorningOT] = useState(false)
  const [savingMorningOT, setSavingMorningOT] = useState(false)
  const [morningOTMessage, setMorningOTMessage] = useState('')
  const [morningOTPeriod, setMorningOTPeriod] = useState<1 | 2>(1)
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set())
  const [selectedDates, setSelectedDates] = useState<Map<string, string[]>>(new Map())
  const [morningOTSelectedEmployees, setMorningOTSelectedEmployees] = useState<Set<string>>(new Set())

  // Special income modal state
  const [showSpecialIncomeModal, setShowSpecialIncomeModal] = useState(false)
  const [specialIncomePeriod, setSpecialIncomePeriod] = useState<1 | 2>(1)
  const [specialIncomeAmount, setSpecialIncomeAmount] = useState('')
  const [specialIncomeDescription, setSpecialIncomeDescription] = useState('')
  const [savingSpecialIncome, setSavingSpecialIncome] = useState(false)
  const [specialIncomeMessage, setSpecialIncomeMessage] = useState('')
  const [specialIncomeEmployeeSearch, setSpecialIncomeEmployeeSearch] = useState('')
  const [specialIncomeSelectedEmployees, setSpecialIncomeSelectedEmployees] = useState<Set<string>>(new Set())

  // Leave modal state
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [leaveType, setLeaveType] = useState('ลากิจ')
  const [leaveEntries, setLeaveEntries] = useState<Array<{ leaveDate: string; leaveHours: number }>>([
    { leaveDate: '', leaveHours: 8 }
  ])
  const [leaveReason, setLeaveReason] = useState('')
  const [leaveDeductWage, setLeaveDeductWage] = useState(false)
  const [leaveDeductDiligence, setLeaveDeductDiligence] = useState(false)
  const [savingLeave, setSavingLeave] = useState(false)
  const [leaveMessage, setLeaveMessage] = useState('')
  const [leaveEmployeeSearch, setLeaveEmployeeSearch] = useState('')
  const [leaveSelectedEmployees, setLeaveSelectedEmployees] = useState<Set<string>>(new Set())

  // Lunch OT modal state
  const [showLunchOTModal, setShowLunchOTModal] = useState(false)
  const [lunchOTPeriod, setLunchOTPeriod] = useState<1 | 2>(1)
  const [lunchOTHours, setLunchOTHours] = useState('1')
  const [savingLunchOT, setSavingLunchOT] = useState(false)
  const [lunchOTMessage, setLunchOTMessage] = useState('')
  const [lunchOTEmployeeSearch, setLunchOTEmployeeSearch] = useState('')
  const [lunchOTSelectedEmployees, setLunchOTSelectedEmployees] = useState<Set<string>>(new Set())

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

  // Filter data when search, selection, or group changes
  useEffect(() => {
    filterData()
  }, [searchQuery, period1Data, period2Data, selectedEmployees, groupBy, selectedGroup])

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

  const getEmployeeHourlyRate = (employeeId: string): number => {
    const emp = period1Data.find(e => e.employeeId === employeeId) ||
      period2Data.find(e => e.employeeId === employeeId)
    return emp?.perhr_salary || 0
  }

  const employeeOptions = useMemo(() => {
    const map = new Map<string, { employeeId: string; name: string; department: string }>()
    ;[...period1Data, ...period2Data].forEach(emp => {
      if (!map.has(emp.employeeId)) {
        map.set(emp.employeeId, {
          employeeId: emp.employeeId,
          name: emp.name,
          department: emp.department
        })
      }
    })
    return Array.from(map.values())
  }, [period1Data, period2Data])

  const filterEmployees = (query: string) => {
    const q = query.trim().toLowerCase()
    if (!q) return employeeOptions
    return employeeOptions.filter(emp =>
      emp.employeeId.toLowerCase().includes(q) ||
      emp.name.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q)
    )
  }

  const filterData = () => {
    const query = searchQuery.toLowerCase().trim()

    let filtered1 = [...period1Data]
    let filtered2 = [...period2Data]

    // Filter by search query
    if (query) {
      filtered1 = filtered1.filter(emp =>
        emp.employeeId.toLowerCase().includes(query) ||
        emp.name.toLowerCase().includes(query)
      )
      filtered2 = filtered2.filter(emp =>
        emp.employeeId.toLowerCase().includes(query) ||
        emp.name.toLowerCase().includes(query)
      )
      setShowAutocomplete(true)
    } else {
      setShowAutocomplete(false)
    }

    // Filter by selected employees (multi-select)
    if (selectedEmployees.size > 0) {
      filtered1 = filtered1.filter(emp => selectedEmployees.has(emp.employeeId))
      filtered2 = filtered2.filter(emp => selectedEmployees.has(emp.employeeId))
    }

    // Filter by group
    if (groupBy !== 'none' && selectedGroup) {
      filtered1 = filtered1.filter(emp => {
        const value = emp[groupBy] || ''
        return value === selectedGroup
      })
      filtered2 = filtered2.filter(emp => {
        const value = emp[groupBy] || ''
        return value === selectedGroup
      })
    }

    setFilteredPeriod1(filtered1)
    setFilteredPeriod2(filtered2)
  }

  // Get unique group values
  const getGroupOptions = () => {
    if (groupBy === 'none') return []
    const allEmployees = [...period1Data, ...period2Data]
    const values = new Set<string>()
    allEmployees.forEach(emp => {
      const value = emp[groupBy]
      if (value) values.add(value)
    })
    return Array.from(values).sort()
  }

  // Toggle employee selection
  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees(prev => {
      const newSet = new Set(prev)
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId)
      } else {
        newSet.add(employeeId)
      }
      return newSet
    })
  }

  // Select all visible employees
  const selectAllEmployees = () => {
    const allIds = new Set(period1Data.map(emp => emp.employeeId))
    setSelectedEmployees(allIds)
  }

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedEmployees(new Set())
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
    // Toggle selection instead of replacing search
    toggleEmployeeSelection(emp.employeeId)
    setShowAutocomplete(false)
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

  // ========== Morning OT Functions ==========
  const openMorningOTModal = async (period: 1 | 2) => {
    setMorningOTPeriod(period)
    setShowMorningOTModal(true)
    setMorningOTMessage('')
    setExpandedEmployees(new Set())
    await fetchMorningOTData(period)
  }

  const fetchMorningOTData = async (period: 1 | 2) => {
    setLoadingMorningOT(true)
    try {
      const year = parseInt(selectedYear)
      const month = parseInt(selectedMonth)

      const res = await fetch(`/api/morning-ot/calculated?year=${year}&month=${month}&period=${period}`)
      const data = await res.json()

      if (data.success) {
        const initialSelected = new Set<string>()
        const dataWithInput = data.data.map((emp: any) => {
          const allowedHours = emp.allowed_hours || 0
          const calculatedHours = emp.total_morning_ot || 0
          const shouldSelect = allowedHours > 0

          if (shouldSelect) {
            initialSelected.add(emp.employee_id)
          }

          let inputValue = allowedHours > 0 ? String(allowedHours) : ''

          return {
            ...emp,
            input_hours: inputValue
          }
        })

        setMorningOTData(dataWithInput)
        setMorningOTSelectedEmployees(initialSelected)

        // ตั้งค่า selected dates จาก database
        const newSelectedDates = new Map<string, string[]>()
        data.data.forEach((emp: any) => {
          if (emp.selected_dates && Array.isArray(emp.selected_dates)) {
            newSelectedDates.set(emp.employee_id, emp.selected_dates)
          } else {
            // ถ้าไม่มี selected_dates หมายถึงเลือกทุกวัน
            const allDates = emp.details.map((d: any) => d.date)
            newSelectedDates.set(emp.employee_id, allDates)
          }
        })
        setSelectedDates(newSelectedDates)
      }
    } catch (error) {
      console.error('Error fetching morning OT:', error)
    } finally {
      setLoadingMorningOT(false)
    }
  }

  const handleMorningOTInputChange = (employeeId: string, value: string) => {
    setMorningOTData(prev => prev.map(emp =>
      emp.employee_id === employeeId
        ? { ...emp, input_hours: value }
        : emp
    ))

    const numericValue = parseFloat(value)
    setMorningOTSelectedEmployees(prev => {
      const newSet = new Set(prev)
      if (!Number.isNaN(numericValue) && numericValue > 0) {
        newSet.add(employeeId)
      } else {
        newSet.delete(employeeId)
      }
      return newSet
    })
  }

  const toggleMorningOTSelection = (employeeId: string, calculatedHours: number) => {
    setMorningOTSelectedEmployees(prev => {
      const newSet = new Set(prev)
      const isSelected = newSet.has(employeeId)

      if (isSelected) {
        newSet.delete(employeeId)
        setMorningOTData(prevData => prevData.map(emp =>
          emp.employee_id === employeeId ? { ...emp, input_hours: '' } : emp
        ))
      } else {
        newSet.add(employeeId)
        setMorningOTData(prevData => prevData.map(emp => {
          if (emp.employee_id !== employeeId) return emp
          const currentInput = emp.input_hours
          const hasInput = currentInput !== '' && parseFloat(currentInput) > 0
          const nextInput = hasInput ? currentInput : (calculatedHours > 0 ? String(calculatedHours) : '')
          return { ...emp, input_hours: nextInput }
        }))
      }

      return newSet
    })
  }

  const selectAllMorningOTEmployees = () => {
    const allIds = new Set(morningOTData.map(emp => emp.employee_id))
    setMorningOTSelectedEmployees(allIds)
    setMorningOTData(prevData => prevData.map(emp => {
      const currentInput = emp.input_hours
      const hasInput = currentInput !== '' && parseFloat(currentInput) > 0
      const nextInput = hasInput ? currentInput : String(emp.total_morning_ot || 0)
      return { ...emp, input_hours: nextInput }
    }))
  }

  const deselectAllMorningOTEmployees = () => {
    setMorningOTSelectedEmployees(new Set())
    setMorningOTData(prevData => prevData.map(emp => ({ ...emp, input_hours: '' })))
  }


  const toggleEmployeeExpanded = (employeeId: string) => {
    setExpandedEmployees(prev => {
      const newSet = new Set(prev)
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId)
      } else {
        newSet.add(employeeId)
      }
      return newSet
    })
  }

  const toggleDateSelection = (employeeId: string, date: string) => {
    setSelectedDates(prev => {
      const newMap = new Map(prev)
      const currentDates = newMap.get(employeeId) || []

      if (currentDates.includes(date)) {
        // ลบออก
        newMap.set(employeeId, currentDates.filter(d => d !== date))
      } else {
        // เพิ่มเข้า
        newMap.set(employeeId, [...currentDates, date])
      }

      return newMap
    })
  }

  const selectAllDates = (employeeId: string, allDates: string[]) => {
    setSelectedDates(prev => {
      const newMap = new Map(prev)
      newMap.set(employeeId, allDates)
      return newMap
    })
  }

  const deselectAllDates = (employeeId: string) => {
    setSelectedDates(prev => {
      const newMap = new Map(prev)
      newMap.set(employeeId, [])
      return newMap
    })
  }

  const saveMorningOT = async () => {
    setSavingMorningOT(true)
    setMorningOTMessage('')

    try {
      const year = parseInt(selectedYear)
      const month = parseInt(selectedMonth)

      const selectedSet = morningOTSelectedEmployees

      const allowances = morningOTData
        .filter(emp => selectedSet.has(emp.employee_id))
        .map(emp => {
          const inputHours = parseFloat(emp.input_hours) || 0
          const calculatedHours = emp.total_morning_ot || 0
          if (inputHours <= 0) return null

          // ใช้ค่าที่น้อยกว่า (ไม่ให้เกินที่ระบบคำนวณได้)
          const actualHours = Math.min(inputHours, calculatedHours)

          // ดึง selected dates สำหรับพนักงานคนนี้
          const empSelectedDates = selectedDates.get(emp.employee_id) || []
          const allDates = emp.details.map((d: any) => d.date)

          // ถ้าเลือกทุกวัน ให้ส่ง null, ถ้าไม่ใช่ ให้ส่ง array
          const finalSelectedDates = empSelectedDates.length === allDates.length &&
            allDates.every((d: string) => empSelectedDates.includes(d))
            ? null
            : empSelectedDates

          return {
            employee_id: emp.employee_id,
            allowed_hours: actualHours,
            calculated_hours: calculatedHours,
            selected_dates: finalSelectedDates,
            notes: inputHours > calculatedHours
              ? `ขอ ${inputHours} ชม. แต่ได้แค่ ${calculatedHours} ชม. (ตามที่ระบบคำนวณ)`
              : null
          }
        })
        .filter(Boolean) as Array<{
          employee_id: string
          allowed_hours: number
          calculated_hours: number
          selected_dates: string[] | null
          notes: string | null
        }>

      const removals = morningOTData
        .filter(emp => !selectedSet.has(emp.employee_id) && (emp.allowed_hours || 0) > 0)
        .map(emp => ({
          employee_id: emp.employee_id,
          allowed_hours: 0,
          calculated_hours: 0,
          selected_dates: null,
          notes: 'ยกเลิก OT เช้า'
        }))

      const records = [...allowances, ...removals]

      if (records.length === 0) {
        setMorningOTMessage('ไม่มีข้อมูลที่ต้องบันทึก')
        setSavingMorningOT(false)
        return
      }

      const res = await fetch('/api/morning-ot', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year,
          month,
          period: morningOTPeriod,
          allowances: records
        })
      })

      const data = await res.json()

      if (data.success) {
        const savedCount = allowances.length
        const removedCount = removals.length
        const messageParts = []
        if (savedCount > 0) messageParts.push(`บันทึก ${savedCount} รายการ`)
        if (removedCount > 0) messageParts.push(`ยกเลิก ${removedCount} รายการ`)
        setMorningOTMessage(messageParts.length > 0 ? `สำเร็จ: ${messageParts.join(' / ')}` : 'บันทึกสำเร็จ')
        // Refresh data
        await fetchMorningOTData(morningOTPeriod)
      } else {
        setMorningOTMessage(`ผิดพลาด: ${data.error}`)
      }
    } catch (error) {
      console.error('Error saving morning OT:', error)
      setMorningOTMessage('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setSavingMorningOT(false)
    }
  }

  // ========== Special Income Functions ==========
  const openSpecialIncomeModal = (period: 1 | 2) => {
    setSpecialIncomePeriod(period)
    setSpecialIncomeAmount('')
    setSpecialIncomeDescription('')
    setSpecialIncomeMessage('')
    setSpecialIncomeEmployeeSearch('')
    setSpecialIncomeSelectedEmployees(new Set())
    setShowSpecialIncomeModal(true)
  }

  const saveSpecialIncome = async () => {
    setSavingSpecialIncome(true)
    setSpecialIncomeMessage('')

    try {
      if (specialIncomeSelectedEmployees.size === 0) {
        setSpecialIncomeMessage('กรุณาเลือกพนักงานอย่างน้อย 1 คน')
        setSavingSpecialIncome(false)
        return
      }

      const amount = parseFloat(specialIncomeAmount)
      if (!Number.isFinite(amount) || amount <= 0) {
        setSpecialIncomeMessage('กรุณากรอกจำนวนเงินที่ถูกต้อง')
        setSavingSpecialIncome(false)
        return
      }

      const year = parseInt(selectedYear)
      const month = parseInt(selectedMonth)
      const employeeIds = Array.from(specialIncomeSelectedEmployees)

      const results = await Promise.allSettled(
        employeeIds.map(empId =>
          fetch('/api/wages/adjustments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employee_id: empId,
              year,
              month,
              period: specialIncomePeriod,
              adjustment_type: 'income',
              category: 'เงินพิเศษอื่นๆ',
              amount,
              description: specialIncomeDescription || null,
              created_by: 'admin'
            })
          }).then(r => r.json())
        )
      )

      const failed = results.filter(r => r.status === 'rejected').length +
        results.filter(r => r.status === 'fulfilled' && !(r.value as any)?.success).length

      if (failed > 0) {
        setSpecialIncomeMessage(`บันทึกสำเร็จบางส่วน (ล้มเหลว ${failed} รายการ)`)
      } else {
        setSpecialIncomeMessage('บันทึกสำเร็จ')
        setShowSpecialIncomeModal(false)
      }

      await fetchAttendanceData()
    } catch (error) {
      console.error('Error saving special income:', error)
      setSpecialIncomeMessage('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setSavingSpecialIncome(false)
    }
  }

  // ========== Leave Functions ==========
  const openLeaveModal = () => {
    setLeaveType('ลากิจ')
    setLeaveEntries([{ leaveDate: '', leaveHours: 8 }])
    setLeaveReason('')
    setLeaveDeductWage(false)
    setLeaveDeductDiligence(false)
    setLeaveMessage('')
    setLeaveEmployeeSearch('')
    setLeaveSelectedEmployees(new Set())
    setShowLeaveModal(true)
  }

  const updateLeaveEntry = (index: number, field: 'leaveDate' | 'leaveHours', value: string) => {
    setLeaveEntries(prev => prev.map((entry, i) => {
      if (i !== index) return entry
      if (field === 'leaveHours') {
        return { ...entry, leaveHours: Number(value) }
      }
      return { ...entry, leaveDate: value }
    }))
  }

  const addLeaveEntry = () => {
    setLeaveEntries(prev => [...prev, { leaveDate: '', leaveHours: 8 }])
  }

  const removeLeaveEntry = (index: number) => {
    setLeaveEntries(prev => prev.filter((_, i) => i !== index))
  }

  const saveLeave = async () => {
    setSavingLeave(true)
    setLeaveMessage('')

    try {
      if (leaveSelectedEmployees.size === 0) {
        setLeaveMessage('กรุณาเลือกพนักงานอย่างน้อย 1 คน')
        setSavingLeave(false)
        return
      }

      const leaves = leaveEntries
        .filter(l => l.leaveDate)
        .map(l => ({ leaveDate: l.leaveDate, leaveHours: Number(l.leaveHours) }))

      if (leaves.length === 0) {
        setLeaveMessage('กรุณาเลือกวันที่ลาอย่างน้อย 1 วัน')
        setSavingLeave(false)
        return
      }

      if (leaves.some(l => !Number.isFinite(l.leaveHours) || l.leaveHours < 1 || l.leaveHours > 24)) {
        setLeaveMessage('ชั่วโมงการลาต้องอยู่ระหว่าง 1 ถึง 24')
        setSavingLeave(false)
        return
      }

      const response = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveType,
          reason: leaveReason || null,
          createdBy: 'admin',
          employeeIds: Array.from(leaveSelectedEmployees),
          leaves,
          deductWage: leaveDeductWage,
          deductDiligence: leaveDeductDiligence,
          status: 'approved',
          leaveAble: true
        })
      })

      const result = await response.json()

      if (result.success) {
        setLeaveMessage('บันทึกการลาสำเร็จ')
        setShowLeaveModal(false)
        await fetchAttendanceData()
      } else {
        setLeaveMessage(`ผิดพลาด: ${result.error}`)
      }
    } catch (error) {
      console.error('Error saving leave:', error)
      setLeaveMessage('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setSavingLeave(false)
    }
  }

  // ========== Lunch OT Functions ==========
  const openLunchOTModal = (period: 1 | 2) => {
    setLunchOTPeriod(period)
    setLunchOTHours('1')
    setLunchOTMessage('')
    setLunchOTEmployeeSearch('')
    setLunchOTSelectedEmployees(new Set())
    setShowLunchOTModal(true)
  }

  const saveLunchOT = async () => {
    setSavingLunchOT(true)
    setLunchOTMessage('')

    try {
      if (lunchOTSelectedEmployees.size === 0) {
        setLunchOTMessage('กรุณาเลือกพนักงานอย่างน้อย 1 คน')
        setSavingLunchOT(false)
        return
      }

      const hours = parseFloat(lunchOTHours)
      if (!Number.isFinite(hours) || hours <= 0) {
        setLunchOTMessage('กรุณากรอกจำนวนชั่วโมงที่ถูกต้อง')
        setSavingLunchOT(false)
        return
      }

      const year = parseInt(selectedYear)
      const month = parseInt(selectedMonth)
      const employeeIds = Array.from(lunchOTSelectedEmployees)

      const results = await Promise.allSettled(
        employeeIds.map(empId => {
          const hourlyRate = getEmployeeHourlyRate(empId)
          const amount = hourlyRate * hours * 1.5

          return fetch('/api/wages/adjustments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employee_id: empId,
              year,
              month,
              period: lunchOTPeriod,
              adjustment_type: 'income',
              category: 'OT พักเที่ยง',
              amount,
              description: `OT พักเที่ยง ${hours} ชม. (×1.5)`,
              created_by: 'admin'
            })
          }).then(r => r.json())
        })
      )

      const failed = results.filter(r => r.status === 'rejected').length +
        results.filter(r => r.status === 'fulfilled' && !(r.value as any)?.success).length

      if (failed > 0) {
        setLunchOTMessage(`บันทึกสำเร็จบางส่วน (ล้มเหลว ${failed} รายการ)`)
      } else {
        setLunchOTMessage('บันทึกสำเร็จ')
        setShowLunchOTModal(false)
      }

      await fetchAttendanceData()
    } catch (error) {
      console.error('Error saving lunch OT:', error)
      setLunchOTMessage('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setSavingLunchOT(false)
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

    // คำนวณผลรวมทั้งหมดของทุกพนักงาน
    let grandTotalOT = 0
    let grandTotalNormalOT = 0
    let grandTotalSpecialOT = 0
    let grandTotalPremiumOT = 0
    let grandTotalOTMultiplied = 0
    let grandTotalNormalOTMultiplied = 0
    let grandTotalSpecialOTMultiplied = 0
    let grandTotalPremiumOTMultiplied = 0
    const dailyTotals: { [date: string]: number } = {}

    dates.forEach(date => {
      dailyTotals[date] = 0
    })

    // คำนวณสำหรับแต่ละพนักงานและรวมทั้งหมด
    const employeeStats = data.map((employee) => {
      let totalOT = 0
      let totalNormalOT = 0
      let totalSpecialOT = 0
      let totalPremiumOT = 0
      let totalOTMultiplied = 0
      let totalNormalOTMultiplied = 0
      let totalSpecialOTMultiplied = 0
      let totalPremiumOTMultiplied = 0

      dates.forEach(date => {
        if (employee.attendance[date]) {
          const otHours = employee.attendance[date].otHours
          totalOT += otHours
          totalNormalOT += employee.attendance[date].otNormalHours || 0
          totalSpecialOT += employee.attendance[date].otSpecialHours || 0
          totalPremiumOT += employee.attendance[date].otPremiumHours || 0
          totalOTMultiplied += employee.attendance[date].otHoursMultiplied || 0
          totalNormalOTMultiplied += employee.attendance[date].otNormalHoursMultiplied || 0
          totalSpecialOTMultiplied += employee.attendance[date].otSpecialHoursMultiplied || 0
          totalPremiumOTMultiplied += employee.attendance[date].otPremiumHoursMultiplied || 0
          dailyTotals[date] += otHours
        }
      })

      grandTotalOT += totalOT
      grandTotalNormalOT += totalNormalOT
      grandTotalSpecialOT += totalSpecialOT
      grandTotalPremiumOT += totalPremiumOT
      grandTotalOTMultiplied += totalOTMultiplied
      grandTotalNormalOTMultiplied += totalNormalOTMultiplied
      grandTotalSpecialOTMultiplied += totalSpecialOTMultiplied
      grandTotalPremiumOTMultiplied += totalPremiumOTMultiplied

      return {
        employee,
        totalOT,
        totalNormalOT,
        totalSpecialOT,
        totalPremiumOT,
        totalOTMultiplied,
        totalNormalOTMultiplied,
        totalSpecialOTMultiplied,
        totalPremiumOTMultiplied
      }
    })

    // Check if all visible employees are selected
    const allVisibleIds = data.map(emp => emp.employeeId)
    const allSelected = allVisibleIds.length > 0 && allVisibleIds.every(id => selectedEmployees.has(id))

    const toggleSelectAll = () => {
      if (allSelected) {
        // Deselect all visible
        setSelectedEmployees(prev => {
          const newSet = new Set(prev)
          allVisibleIds.forEach(id => newSet.delete(id))
          return newSet
        })
      } else {
        // Select all visible
        setSelectedEmployees(prev => {
          const newSet = new Set(prev)
          allVisibleIds.forEach(id => newSet.add(id))
          return newSet
        })
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
                {/* Checkbox column */}
                <th style={{ minWidth: '50px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    title={allSelected ? 'ยกเลิกเลือกทั้งหมด' : 'เลือกทั้งหมด'}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                </th>
                <th style={{ minWidth: '120px' }}>{t('home.employeeId')}</th>
                <th style={{ minWidth: '180px' }}>{t('home.employeeName')}</th>

                {/* 8 คอลัมน์สรุป - เปลี่ยนชื่อ */}
                <th className="text-center" style={{ minWidth: '90px', background: '#e3f2fd', fontWeight: '700' }}>รวม OT</th>
                <th className="text-center" style={{ minWidth: '90px', background: '#e3f2fd' }}>OT 1.5</th>
                <th className="text-center" style={{ minWidth: '90px', background: '#e3f2fd' }}>OT 2</th>
                <th className="text-center" style={{ minWidth: '90px', background: '#e3f2fd' }}>OT 3</th>

                <th className="text-center" style={{ minWidth: '100px', background: '#fff3e0', fontWeight: '700' }}>รวม OT (คำนวณ)</th>
                <th className="text-center" style={{ minWidth: '110px', background: '#fff3e0' }}>OT 1.5 (×1.5)</th>
                <th className="text-center" style={{ minWidth: '110px', background: '#fff3e0' }}>OT 2 (×2)</th>
                <th className="text-center" style={{ minWidth: '110px', background: '#fff3e0' }}>OT 3 (×3)</th>

                {/* สรุปการทำงาน/การลา */}
                <th className="text-center" style={{ minWidth: '90px', background: '#e8f5e9', fontWeight: '700' }}>รวมวันทำงาน</th>
                <th className="text-center" style={{ minWidth: '70px', background: '#e8f5e9' }}>ลากิจ</th>
                <th className="text-center" style={{ minWidth: '70px', background: '#e8f5e9' }}>ลาป่วย</th>
                <th className="text-center" style={{ minWidth: '70px', background: '#e8f5e9' }}>ขาดงาน</th>
                <th className="text-center" style={{ minWidth: '70px', background: '#e8f5e9' }}>มาสาย</th>
                <th className="text-center" style={{ minWidth: '90px', background: '#f3e5f5' }}>ค่ากะ</th>
                <th className="text-center" style={{ minWidth: '100px', background: '#f3e5f5' }}>ค่าอื่นๆ</th>

                {/* คอลัมน์วัน */}
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
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={dates.length + 18} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    {searchQuery ? t('home.noData') : t('home.noData')}
                  </td>
                </tr>
              ) : (
                <>
                  {employeeStats.map(({ employee, totalOT, totalNormalOT, totalSpecialOT, totalPremiumOT, totalOTMultiplied, totalNormalOTMultiplied, totalSpecialOTMultiplied, totalPremiumOTMultiplied }) => {
                    const isChecked = selectedEmployees.has(employee.employeeId)

                    return (
                      <tr key={employee.employeeId}>
                        {/* Checkbox */}
                        <td className="text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleEmployeeSelection(employee.employeeId)}
                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                          />
                        </td>
                        <td>{employee.employeeId}</td>
                        <td className="employee-name">{employee.name}</td>

                        {/* 8 คอลัมน์สรุป */}
                        <td className="text-center" style={{ fontWeight: '700', fontSize: '14px', background: '#e3f2fd', color: 'var(--text-primary)' }}>
                          {totalOT.toFixed(2)}
                        </td>
                        <td className="text-center" style={{ fontSize: '14px', background: '#e3f2fd', color: 'var(--text-primary)' }}>
                          {totalNormalOT.toFixed(2)}
                        </td>
                        <td className="text-center" style={{ fontSize: '14px', background: '#e3f2fd', color: 'var(--text-primary)' }}>
                          {totalSpecialOT.toFixed(2)}
                        </td>
                        <td className="text-center" style={{ fontSize: '14px', background: '#e3f2fd', color: 'var(--text-primary)' }}>
                          {totalPremiumOT.toFixed(2)}
                        </td>

                        <td className="text-center" style={{ fontWeight: '700', fontSize: '14px', background: '#fff3e0', color: '#e65100' }}>
                          {totalOTMultiplied.toFixed(2)}
                        </td>
                        <td className="text-center" style={{ fontSize: '14px', background: '#fff3e0', color: '#e65100' }}>
                          {totalNormalOTMultiplied.toFixed(2)}
                        </td>
                        <td className="text-center" style={{ fontSize: '14px', background: '#fff3e0', color: '#e65100' }}>
                          {totalSpecialOTMultiplied.toFixed(2)}
                        </td>
                        <td className="text-center" style={{ fontSize: '14px', background: '#fff3e0', color: '#e65100' }}>
                          {totalPremiumOTMultiplied.toFixed(2)}
                        </td>

                        {/* สรุปการทำงาน/การลา */}
                        <td className="text-center" style={{ fontWeight: '600', background: '#e8f5e9' }}>
                          {(employee.totalWorkDays || 0).toString()}
                        </td>
                        <td className="text-center" style={{ background: '#e8f5e9' }}>
                          {(employee.personalLeaveDays || 0).toString()}
                        </td>
                        <td className="text-center" style={{ background: '#e8f5e9' }}>
                          {(employee.sickLeaveDays || 0).toString()}
                        </td>
                        <td className="text-center" style={{ background: '#e8f5e9' }}>
                          {(employee.absentDays || 0).toString()}
                        </td>
                        <td
                          className="text-center"
                          style={{ background: '#e8f5e9' }}
                          title={employee.lateMinutes && employee.lateMinutes > 0 ? `รวม ${employee.lateMinutes} นาที` : ''}
                        >
                          {(employee.lateDays || 0).toString()}
                        </td>
                        <td
                          className="text-center"
                          style={{ background: '#f3e5f5' }}
                          title={employee.nightShiftDays && employee.nightShiftDays > 0 ? `${employee.nightShiftDays} วัน` : ''}
                        >
                          {(employee.nightShiftAllowance || 0).toFixed(2)}
                        </td>
                        <td className="text-center" style={{ background: '#f3e5f5' }}>
                          {(employee.specialIncome || 0).toFixed(2)}
                        </td>

                        {/* คอลัมน์วัน */}
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
                      </tr>
                    )
                  })}

                </>
              )}
            </tbody>
          </table>
        </div>

        {/* แถวสรุปรวม - แยกออกมาจากตาราง (Fixed Position) */}
        {data.length > 0 && (
          <div style={{
            background: '#f5f5f5',
            padding: '12px 16px',
            borderRadius: '0 0 8px 8px',
            boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
            borderTop: '2px solid #e0e0e0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              color: '#333',
              overflowX: 'auto',
              paddingBottom: '4px'
            }}>
              <div style={{ fontWeight: '700', fontSize: '14px', minWidth: '120px', flexShrink: 0 }}>
                สรุปรวม ({data.length} คน)
              </div>

              {/* กลุ่ม OT ดิบ */}
              <div style={{ display: 'flex', gap: '12px', background: '#e3f2fd', padding: '8px 12px', borderRadius: '6px', flexShrink: 0 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>รวม OT</div>
                  <div style={{ fontWeight: '700', fontSize: '18px', color: '#1976d2' }}>{grandTotalOT.toFixed(2)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>OT 1.5</div>
                  <div style={{ fontWeight: '600', fontSize: '16px', color: '#333' }}>{grandTotalNormalOT.toFixed(2)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>OT 2</div>
                  <div style={{ fontWeight: '600', fontSize: '16px', color: '#333' }}>{grandTotalSpecialOT.toFixed(2)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>OT 3</div>
                  <div style={{ fontWeight: '600', fontSize: '16px', color: '#333' }}>{grandTotalPremiumOT.toFixed(2)}</div>
                </div>
              </div>

              {/* กลุ่ม OT คำนวณแล้ว */}
              <div style={{ display: 'flex', gap: '12px', background: '#fff3e0', padding: '8px 12px', borderRadius: '6px', flexShrink: 0 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>รวม (คำนวณ)</div>
                  <div style={{ fontWeight: '700', fontSize: '18px', color: '#e65100' }}>{grandTotalOTMultiplied.toFixed(2)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>×1.5</div>
                  <div style={{ fontWeight: '600', fontSize: '16px', color: '#333' }}>{grandTotalNormalOTMultiplied.toFixed(2)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>×2</div>
                  <div style={{ fontWeight: '600', fontSize: '16px', color: '#333' }}>{grandTotalSpecialOTMultiplied.toFixed(2)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>×3</div>
                  <div style={{ fontWeight: '600', fontSize: '16px', color: '#333' }}>{grandTotalPremiumOTMultiplied.toFixed(2)}</div>
                </div>
              </div>

              {/* สรุปรายวัน - แสดงทุกวัน scroll ได้ */}
              <div style={{
                display: 'flex',
                gap: '6px',
                background: '#fafafa',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e0e0e0',
                flexShrink: 0
              }}>
                {dates.map(date => {
                  const day = parseInt(date.split('-')[2])
                  const dateObj = new Date(date)
                  const isSunday = dateObj.getDay() === 0
                  return (
                    <div key={date} style={{ textAlign: 'center', minWidth: '45px' }}>
                      <div style={{ fontSize: '10px', color: isSunday ? '#e53935' : '#666' }}>{day}</div>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>{dailyTotals[date].toFixed(2)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
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
            <a href="/export" className="btn btn-secondary">
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

        {/* Group By Controls */}
        <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border-light)', marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            จัดกลุ่มพนักงาน (Group By)
          </label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setGroupBy('none'); setSelectedGroup(''); }}
              className={`btn ${groupBy === 'none' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px' }}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => { setGroupBy('position'); setSelectedGroup(''); }}
              className={`btn ${groupBy === 'position' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px' }}
            >
              ตำแหน่ง
            </button>
            <button
              onClick={() => { setGroupBy('department_code'); setSelectedGroup(''); }}
              className={`btn ${groupBy === 'department_code' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px' }}
            >
              ฝ่าย
            </button>
            <button
              onClick={() => { setGroupBy('section'); setSelectedGroup(''); }}
              className={`btn ${groupBy === 'section' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px' }}
            >
              แผนก
            </button>

            {/* Dropdown เลือกกลุ่มย่อย */}
            {groupBy !== 'none' && (
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                style={{ padding: '8px 12px', minWidth: '200px' }}
              >
                <option value="">-- เลือก{groupBy === 'position' ? 'ตำแหน่ง' : groupBy === 'department_code' ? 'ฝ่าย' : 'แผนก'} --</option>
                {getGroupOptions().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Selected Employees Display */}
        {selectedEmployees.size > 0 && (
          <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border-light)', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                พนักงานที่เลือก ({selectedEmployees.size} คน)
              </label>
              <button
                onClick={clearAllSelections}
                className="btn btn-secondary"
                style={{ padding: '4px 12px', fontSize: '12px' }}
              >
                ล้างทั้งหมด
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Array.from(selectedEmployees).slice(0, 10).map(empId => {
                const emp = period1Data.find(e => e.employeeId === empId)
                return (
                  <span
                    key={empId}
                    style={{
                      padding: '4px 8px',
                      background: '#e3f2fd',
                      borderRadius: '4px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {emp?.name || empId}
                    <button
                      onClick={() => toggleEmployeeSelection(empId)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: '14px' }}
                    >
                      ×
                    </button>
                  </span>
                )
              })}
              {selectedEmployees.size > 10 && (
                <span style={{ padding: '4px 8px', background: '#f5f5f5', borderRadius: '4px', fontSize: '12px' }}>
                  +{selectedEmployees.size - 10} คน
                </span>
              )}
            </div>
          </div>
        )}

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

        {/* Morning OT Buttons */}
        <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            จัดการ OT เช้า (เข้างานก่อนเวลา)
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => openMorningOTModal(1)}
              className="btn btn-secondary"
              disabled={!selectedMonth || !selectedYear}
            >
              OT เช้า งวดที่ 1
            </button>
            <button
              onClick={() => openMorningOTModal(2)}
              className="btn btn-secondary"
              disabled={!selectedMonth || !selectedYear}
            >
              OT เช้า งวดที่ 2
            </button>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            * เลือกพนักงานที่จะได้รับ OT เช้า และกำหนดจำนวนชั่วโมง (ไม่เกินที่ระบบคำนวณได้)
          </p>
        </div>

        {/* Additional Adjustments */}
        <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            เพิ่มรายการพิเศษ (ค่าอื่นๆ / การลา / OT พักเที่ยง)
          </label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => openSpecialIncomeModal(1)}
              className="btn btn-secondary"
              disabled={!selectedMonth || !selectedYear}
            >
              เพิ่มค่าอื่นๆ (งวด 1)
            </button>
            <button
              onClick={() => openSpecialIncomeModal(2)}
              className="btn btn-secondary"
              disabled={!selectedMonth || !selectedYear}
            >
              เพิ่มค่าอื่นๆ (งวด 2)
            </button>
            <button
              onClick={openLeaveModal}
              className="btn btn-secondary"
              disabled={!selectedMonth || !selectedYear}
            >
              เพิ่มการลา
            </button>
            <button
              onClick={() => openLunchOTModal(1)}
              className="btn btn-secondary"
              disabled={!selectedMonth || !selectedYear}
            >
              OT พักเที่ยง (งวด 1)
            </button>
            <button
              onClick={() => openLunchOTModal(2)}
              className="btn btn-secondary"
              disabled={!selectedMonth || !selectedYear}
            >
              OT พักเที่ยง (งวด 2)
            </button>
          </div>
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

      {/* Morning OT Modal */}
      {showMorningOTModal && (
        <div className="modal-overlay" onClick={() => setShowMorningOTModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '900px', maxHeight: '80vh', overflow: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>
                จัดการ OT เช้า - {t(`months.${parseInt(selectedMonth)}`)} {parseInt(selectedYear) + 543} งวดที่ {morningOTPeriod}
              </h2>
              <button
                onClick={() => setShowMorningOTModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            {loadingMorningOT ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                <p>กำลังโหลดข้อมูล...</p>
              </div>
            ) : morningOTData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                ไม่พบพนักงานที่มี OT เช้าในงวดนี้
              </div>
            ) : (
              <>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  * กรอกจำนวนชั่วโมง OT เช้าที่ต้องการให้แต่ละคน (หากกรอกเกินจะได้รับเท่าที่ระบบคำนวณ)
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    เลือกแล้ว {morningOTSelectedEmployees.size} คน จาก {morningOTData.length} คน
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={selectAllMorningOTEmployees}
                      className="btn btn-sm"
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                      เลือกทั้งหมด
                    </button>
                    <button
                      onClick={deselectAllMorningOTEmployees}
                      className="btn btn-sm btn-secondary"
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                      ยกเลิกทั้งหมด
                    </button>
                  </div>
                </div>

                <div className="table-wrapper" style={{ maxHeight: '50vh', overflow: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="text-center" style={{ width: '50px' }}>เลือก</th>
                        <th style={{ width: '40px' }}></th>
                        <th style={{ minWidth: '100px' }}>รหัส</th>
                        <th style={{ minWidth: '150px' }}>ชื่อ-นามสกุล</th>
                        <th style={{ minWidth: '100px' }}>แผนก</th>
                        <th className="text-center" style={{ minWidth: '100px' }}>OT เช้าที่คำนวณ</th>
                        <th className="text-center" style={{ minWidth: '80px' }}>วันที่เลือก</th>
                        <th className="text-center" style={{ minWidth: '120px' }}>OT เช้าที่ให้</th>
                        <th className="text-center" style={{ minWidth: '100px' }}>สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {morningOTData.map((emp) => {
                        const inputHours = parseFloat(emp.input_hours) || 0
                        const calculatedHours = emp.total_morning_ot || 0
                        const isOverLimit = inputHours > calculatedHours && emp.input_hours !== ''
                        const isExpanded = expandedEmployees.has(emp.employee_id)
                        const isEmployeeSelected = morningOTSelectedEmployees.has(emp.employee_id)
                        const hasSavedAllowance = (emp.allowed_hours || 0) > 0
                        const empSelectedDates = selectedDates.get(emp.employee_id) || []
                        const allDates = emp.details.map((d: any) => d.date)

                        return (
                          <>
                            <tr key={emp.employee_id} style={{ backgroundColor: isEmployeeSelected ? '#f1f8e9' : 'transparent' }}>
                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  checked={isEmployeeSelected}
                                  onChange={() => toggleMorningOTSelection(emp.employee_id, calculatedHours)}
                                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                />
                              </td>
                              <td className="text-center">
                                <button
                                  onClick={() => toggleEmployeeExpanded(emp.employee_id)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    padding: '4px'
                                  }}
                                >
                                  {isExpanded ? '▼' : '▶'}
                                </button>
                              </td>
                              <td>{emp.employee_id}</td>
                              <td>{emp.name}</td>
                              <td>{emp.department}</td>
                              <td className="text-center" style={{ fontWeight: '600', color: '#1976d2' }}>
                                {calculatedHours.toFixed(2)} ชม.
                              </td>
                              <td className="text-center">
                                {empSelectedDates.length} / {allDates.length} วัน
                              </td>
                              <td className="text-center">
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  max={calculatedHours}
                                  value={emp.input_hours}
                                  onChange={(e) => handleMorningOTInputChange(emp.employee_id, e.target.value)}
                                  placeholder="0"
                                  disabled={!isEmployeeSelected}
                                  style={{
                                    width: '80px',
                                    textAlign: 'center',
                                    padding: '6px',
                                    border: isOverLimit ? '2px solid #f44336' : '1px solid var(--border-color)',
                                    backgroundColor: isEmployeeSelected ? 'white' : '#f5f5f5',
                                    cursor: isEmployeeSelected ? 'text' : 'not-allowed'
                                  }}
                                />
                              </td>
                              <td className="text-center">
                                {hasSavedAllowance ? (
                                  <span style={{ color: '#4caf50', fontWeight: '600' }}>
                                    ✓ {emp.allowed_hours} ชม.
                                  </span>
                                ) : isEmployeeSelected ? (
                                  <span style={{ color: '#ff9800', fontWeight: '600' }}>รอกรอกชั่วโมง</span>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)' }}>ไม่เลือก</span>
                                )}
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr key={`${emp.employee_id}-details`}>
                                <td colSpan={9} style={{ padding: '12px 20px', backgroundColor: '#f8f9fa' }}>
                                  <div style={{ marginBottom: '8px' }}>
                                    <button
                                      onClick={() => selectAllDates(emp.employee_id, allDates)}
                                      className="btn btn-sm"
                                      style={{ marginRight: '8px', fontSize: '12px', padding: '4px 8px' }}
                                      disabled={!isEmployeeSelected}
                                    >
                                      เลือกทั้งหมด
                                    </button>
                                    <button
                                      onClick={() => deselectAllDates(emp.employee_id)}
                                      className="btn btn-sm btn-secondary"
                                      style={{ fontSize: '12px', padding: '4px 8px' }}
                                      disabled={!isEmployeeSelected}
                                    >
                                      ยกเลิกทั้งหมด
                                    </button>
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                                    {emp.details.map((detail: any) => {
                                      const isSelected = empSelectedDates.includes(detail.date)
                                      const dayOfWeek = new Date(detail.date).getDay()
                                      const dayColor = dayOfWeek === 0 ? '#e53935' : dayOfWeek === 6 ? '#1976d2' : '#666'

                                      return (
                                        <label
                                          key={detail.date}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '6px',
                                            border: `1px solid ${isSelected ? '#4caf50' : '#ddd'}`,
                                            borderRadius: '4px',
                                            backgroundColor: isSelected ? '#e8f5e9' : 'white',
                                            cursor: isEmployeeSelected ? 'pointer' : 'not-allowed',
                                            fontSize: '13px'
                                          }}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleDateSelection(emp.employee_id, detail.date)}
                                            disabled={!isEmployeeSelected}
                                            style={{ marginRight: '8px' }}
                                          />
                                          <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', color: dayColor }}>
                                              {detail.date}
                                              {detail.is_holiday && <span style={{ marginLeft: '4px', color: '#e53935' }}>🏖️</span>}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#999' }}>
                                              {detail.check_in} → OT {detail.morning_ot_hours.toFixed(2)} ชม.
                                            </div>
                                          </div>
                                        </label>
                                      )
                                    })}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {morningOTMessage && (
                  <div
                    className={morningOTMessage.includes('สำเร็จ') ? 'message message-success' : 'message message-error'}
                    style={{ marginTop: '16px' }}
                  >
                    {morningOTMessage}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                  <button
                    onClick={() => setShowMorningOTModal(false)}
                    className="btn btn-secondary"
                  >
                    ปิด
                  </button>
                  <button
                    onClick={saveMorningOT}
                    disabled={savingMorningOT}
                    className="btn btn-primary"
                  >
                    {savingMorningOT ? 'กำลังบันทึก...' : 'บันทึก OT เช้า'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Special Income Modal */}
      {showSpecialIncomeModal && (
        <div className="modal-overlay" onClick={() => setShowSpecialIncomeModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px', maxHeight: '80vh', overflow: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>เพิ่มเงินพิเศษอื่นๆ</h2>
              <button
                onClick={() => setShowSpecialIncomeModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              เลือกพนักงานแล้ว {specialIncomeSelectedEmployees.size} คน
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>ค้นหา/เลือกพนักงาน</label>
              <input
                type="text"
                value={specialIncomeEmployeeSearch}
                onChange={(e) => setSpecialIncomeEmployeeSearch(e.target.value)}
                placeholder="พิมพ์รหัสพนักงาน, ชื่อ หรือแผนก"
              />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    const list = filterEmployees(specialIncomeEmployeeSearch)
                    setSpecialIncomeSelectedEmployees(new Set(list.map(e => e.employeeId)))
                  }}
                  className="btn btn-sm"
                >
                  เลือกทั้งหมด
                </button>
                <button
                  onClick={() => setSpecialIncomeSelectedEmployees(new Set())}
                  className="btn btn-sm btn-secondary"
                >
                  ล้างทั้งหมด
                </button>
              </div>
              <div style={{ maxHeight: '200px', overflow: 'auto', border: '1px solid var(--border-light)', borderRadius: '6px', padding: '8px' }}>
                {filterEmployees(specialIncomeEmployeeSearch).map(emp => {
                  const isChecked = specialIncomeSelectedEmployees.has(emp.employeeId)
                  return (
                    <label key={emp.employeeId} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '13px' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSpecialIncomeSelectedEmployees(prev => {
                            const next = new Set(prev)
                            if (next.has(emp.employeeId)) next.delete(emp.employeeId)
                            else next.add(emp.employeeId)
                            return next
                          })
                        }}
                      />
                      <span style={{ minWidth: '90px' }}>{emp.employeeId}</span>
                      <span style={{ flex: 1 }}>{emp.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{emp.department}</span>
                    </label>
                  )
                })}
              </div>

              <label style={{ fontSize: '13px', fontWeight: '600' }}>งวด</label>
              <select value={specialIncomePeriod} onChange={(e) => setSpecialIncomePeriod(Number(e.target.value) as 1 | 2)}>
                <option value={1}>งวดที่ 1</option>
                <option value={2}>งวดที่ 2</option>
              </select>

              <label style={{ fontSize: '13px', fontWeight: '600' }}>จำนวนเงิน (บาท)</label>
              <input
                type="number"
                value={specialIncomeAmount}
                onChange={(e) => setSpecialIncomeAmount(e.target.value)}
                placeholder="เช่น 200"
              />

              <label style={{ fontSize: '13px', fontWeight: '600' }}>หมายเหตุ (ถ้ามี)</label>
              <input
                type="text"
                value={specialIncomeDescription}
                onChange={(e) => setSpecialIncomeDescription(e.target.value)}
                placeholder="เช่น เงินพิเศษอื่นๆ"
              />
            </div>

            {specialIncomeMessage && (
              <div
                className={specialIncomeMessage.includes('สำเร็จ') ? 'message message-success' : 'message message-error'}
                style={{ marginTop: '16px' }}
              >
                {specialIncomeMessage}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button onClick={() => setShowSpecialIncomeModal(false)} className="btn btn-secondary">
                ปิด
              </button>
              <button onClick={saveSpecialIncome} disabled={savingSpecialIncome} className="btn btn-primary">
                {savingSpecialIncome ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '700px', maxHeight: '80vh', overflow: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>เพิ่มการลา</h2>
              <button
                onClick={() => setShowLeaveModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              เลือกพนักงานแล้ว {leaveSelectedEmployees.size} คน
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>ค้นหา/เลือกพนักงาน</label>
              <input
                type="text"
                value={leaveEmployeeSearch}
                onChange={(e) => setLeaveEmployeeSearch(e.target.value)}
                placeholder="พิมพ์รหัสพนักงาน, ชื่อ หรือแผนก"
              />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    const list = filterEmployees(leaveEmployeeSearch)
                    setLeaveSelectedEmployees(new Set(list.map(e => e.employeeId)))
                  }}
                  className="btn btn-sm"
                >
                  เลือกทั้งหมด
                </button>
                <button
                  onClick={() => setLeaveSelectedEmployees(new Set())}
                  className="btn btn-sm btn-secondary"
                >
                  ล้างทั้งหมด
                </button>
              </div>
              <div style={{ maxHeight: '200px', overflow: 'auto', border: '1px solid var(--border-light)', borderRadius: '6px', padding: '8px' }}>
                {filterEmployees(leaveEmployeeSearch).map(emp => {
                  const isChecked = leaveSelectedEmployees.has(emp.employeeId)
                  return (
                    <label key={emp.employeeId} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '13px' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setLeaveSelectedEmployees(prev => {
                            const next = new Set(prev)
                            if (next.has(emp.employeeId)) next.delete(emp.employeeId)
                            else next.add(emp.employeeId)
                            return next
                          })
                        }}
                      />
                      <span style={{ minWidth: '90px' }}>{emp.employeeId}</span>
                      <span style={{ flex: 1 }}>{emp.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{emp.department}</span>
                    </label>
                  )
                })}
              </div>

              <label style={{ fontSize: '13px', fontWeight: '600' }}>ประเภทการลา</label>
              <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                <option value="ลากิจ">ลากิจ</option>
                <option value="ลาป่วย">ลาป่วย</option>
                <option value="ลาพักร้อน">ลาพักร้อน</option>
                <option value="ลากิจพิเศษ">ลากิจพิเศษ</option>
              </select>

              <label style={{ fontSize: '13px', fontWeight: '600' }}>วันที่ลา</label>
              <div style={{ display: 'grid', gap: '8px' }}>
                {leaveEntries.map((entry, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="date"
                      value={entry.leaveDate}
                      onChange={(e) => updateLeaveEntry(index, 'leaveDate', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={entry.leaveHours}
                      onChange={(e) => updateLeaveEntry(index, 'leaveHours', e.target.value)}
                      style={{ width: '100px' }}
                    />
                    <button
                      onClick={() => removeLeaveEntry(index)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px' }}
                      disabled={leaveEntries.length === 1}
                    >
                      ลบ
                    </button>
                  </div>
                ))}
                <button onClick={addLeaveEntry} className="btn btn-sm" style={{ width: 'fit-content' }}>
                  + เพิ่มวันที่ลา
                </button>
              </div>

              <label style={{ fontSize: '13px', fontWeight: '600' }}>หมายเหตุ (ถ้ามี)</label>
              <input
                type="text"
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="เช่น ลาป่วย"
              />

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input type="checkbox" checked={leaveDeductWage} onChange={(e) => setLeaveDeductWage(e.target.checked)} />
                  หักค่าแรง
                </label>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input type="checkbox" checked={leaveDeductDiligence} onChange={(e) => setLeaveDeductDiligence(e.target.checked)} />
                  หักเบี้ยขยัน
                </label>
              </div>
            </div>

            {leaveMessage && (
              <div
                className={leaveMessage.includes('สำเร็จ') ? 'message message-success' : 'message message-error'}
                style={{ marginTop: '16px' }}
              >
                {leaveMessage}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button onClick={() => setShowLeaveModal(false)} className="btn btn-secondary">
                ปิด
              </button>
              <button onClick={saveLeave} disabled={savingLeave} className="btn btn-primary">
                {savingLeave ? 'กำลังบันทึก...' : 'บันทึกการลา'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lunch OT Modal */}
      {showLunchOTModal && (
        <div className="modal-overlay" onClick={() => setShowLunchOTModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px', maxHeight: '80vh', overflow: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>เพิ่ม OT พักเที่ยง</h2>
              <button
                onClick={() => setShowLunchOTModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              เลือกพนักงานแล้ว {lunchOTSelectedEmployees.size} คน
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>ค้นหา/เลือกพนักงาน</label>
              <input
                type="text"
                value={lunchOTEmployeeSearch}
                onChange={(e) => setLunchOTEmployeeSearch(e.target.value)}
                placeholder="พิมพ์รหัสพนักงาน, ชื่อ หรือแผนก"
              />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    const list = filterEmployees(lunchOTEmployeeSearch)
                    setLunchOTSelectedEmployees(new Set(list.map(e => e.employeeId)))
                  }}
                  className="btn btn-sm"
                >
                  เลือกทั้งหมด
                </button>
                <button
                  onClick={() => setLunchOTSelectedEmployees(new Set())}
                  className="btn btn-sm btn-secondary"
                >
                  ล้างทั้งหมด
                </button>
              </div>
              <div style={{ maxHeight: '200px', overflow: 'auto', border: '1px solid var(--border-light)', borderRadius: '6px', padding: '8px' }}>
                {filterEmployees(lunchOTEmployeeSearch).map(emp => {
                  const isChecked = lunchOTSelectedEmployees.has(emp.employeeId)
                  return (
                    <label key={emp.employeeId} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '13px' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setLunchOTSelectedEmployees(prev => {
                            const next = new Set(prev)
                            if (next.has(emp.employeeId)) next.delete(emp.employeeId)
                            else next.add(emp.employeeId)
                            return next
                          })
                        }}
                      />
                      <span style={{ minWidth: '90px' }}>{emp.employeeId}</span>
                      <span style={{ flex: 1 }}>{emp.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{emp.department}</span>
                    </label>
                  )
                })}
              </div>

              <label style={{ fontSize: '13px', fontWeight: '600' }}>งวด</label>
              <select value={lunchOTPeriod} onChange={(e) => setLunchOTPeriod(Number(e.target.value) as 1 | 2)}>
                <option value={1}>งวดที่ 1</option>
                <option value={2}>งวดที่ 2</option>
              </select>

              <label style={{ fontSize: '13px', fontWeight: '600' }}>จำนวนชั่วโมง OT ที่เพิ่ม (ต่อคน)</label>
              <input
                type="number"
                step="0.5"
                min={0.5}
                value={lunchOTHours}
                onChange={(e) => setLunchOTHours(e.target.value)}
                placeholder="1"
              />

              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                * ระบบจะคำนวณเป็นเงิน OT อัตรา 1.5 เท่าของค่าแรงต่อชั่วโมง
              </div>
            </div>

            {lunchOTMessage && (
              <div
                className={lunchOTMessage.includes('สำเร็จ') ? 'message message-success' : 'message message-error'}
                style={{ marginTop: '16px' }}
              >
                {lunchOTMessage}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button onClick={() => setShowLunchOTModal(false)} className="btn btn-secondary">
                ปิด
              </button>
              <button onClick={saveLunchOT} disabled={savingLunchOT} className="btn btn-primary">
                {savingLunchOT ? 'กำลังบันทึก...' : 'บันทึก OT พักเที่ยง'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
