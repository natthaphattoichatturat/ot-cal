'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface EmployeeWage {
  employeeId: string
  name: string
  department: string
  employmentType: string
  position: string
  departmentCode: string
  section: string
  // เงินเดือน/ค่าจ้าง
  totalBaseWage: number
  // OT
  totalOt1Wage: number
  totalOt2Wage: number
  totalOt3Wage: number
  totalOt4Wage: number
  grossWage: number
  // เงินเพิ่ม
  attendanceBonus: number
  nightShiftAllowance: number
  positionAllowance: number
  telephoneAllowance: number
  livingAllowance: number
  specialAllowance: number
  otherIncome1: number
  otherIncome2: number
  returnDiligence: number
  returnVacation: number
  bonus1: number
  bonus2: number
  compta: number
  rounding: number
  additionalIncome: number
  totalIncome: number
  // เงินหัก
  lateDeduction: number
  absentDeduction: number
  leaveDeduction: number
  uniformDeduction: number
  studentLoanDeduction: number
  coopDeduction: number
  damagesDeduction: number
  latePenalty: number
  deductSpecial: number
  deductOther: number
  comptaDed: number
  roundingDed: number
  additionalDeduction: number
  sso: number
  tax: number
  totalDeductions: number
  netWage: number
}

// Format number with 2 decimal places
const fmt = (num: number) => {
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const safeNum = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0)

// Categories for adjustments (same as wage detail page)
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

export default function WagesPage() {
  const { t } = useLanguage()
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [recalculating, setRecalculating] = useState(false)
  const [employeeWages, setEmployeeWages] = useState<EmployeeWage[]>([])

  // Multi-select and Group By
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set())
  const [groupBy, setGroupBy] = useState<'none' | 'position' | 'departmentCode' | 'section'>('none')
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)

  const printRef = useRef<HTMLDivElement>(null)

  // Add income/deduction/tax modal state
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [adjustmentMode, setAdjustmentMode] = useState<'income' | 'deduction' | 'tax'>('income')
  const [adjustmentType, setAdjustmentType] = useState<'income' | 'deduction'>('income')
  const [adjustmentCategory, setAdjustmentCategory] = useState('')
  const [adjustmentAmount, setAdjustmentAmount] = useState('')
  const [adjustmentDescription, setAdjustmentDescription] = useState('')
  const [adjustmentEmployeeSearch, setAdjustmentEmployeeSearch] = useState('')
  const [adjustmentEmployeeIds, setAdjustmentEmployeeIds] = useState<Set<string>>(new Set())
  const [savingAdjustment, setSavingAdjustment] = useState(false)

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
  }, [selectedMonth, selectedYear, selectedPeriod])

  const fetchWageData = async () => {
    if (!selectedMonth || !selectedYear) return

    setLoading(true)
    try {
      const monthStr = `${selectedYear}-${selectedMonth}`
      const res = await fetch(`/api/wages/summary?month=${monthStr}&period=${selectedPeriod}`)
      const data = await res.json()

      if (data.success) {
        setEmployeeWages(data.data || [])
      } else {
        console.error('Failed to fetch wage summary:', data.error)
        setEmployeeWages([])
      }
    } catch (error) {
      console.error('Error fetching wage data:', error)
      setEmployeeWages([])
    } finally {
      setLoading(false)
    }
  }

  const handleRecalculateSelected = async () => {
    if (!selectedYear || !selectedMonth) {
      alert('กรุณาเลือกเดือนและปีก่อน')
      return
    }

    if (selectedEmployees.size === 0) {
      alert('กรุณาเลือกพนักงานอย่างน้อย 1 คน')
      return
    }

    const yearNum = parseInt(selectedYear)
    const monthNum = parseInt(selectedMonth)
    if (!Number.isFinite(yearNum) || !Number.isFinite(monthNum)) {
      alert('ข้อมูลเดือน/ปีไม่ถูกต้อง')
      return
    }

    setRecalculating(true)
    try {
      const employeeIds = Array.from(selectedEmployees)
      const results = await Promise.allSettled(
        employeeIds.map(empId =>
          fetch('/api/wages/recalculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employee_id: empId,
              year: yearNum,
              month: monthNum,
              period: selectedPeriod
            })
          }).then(r => r.json())
        )
      )

      const failed = results.filter(r => r.status === 'rejected').length +
        results.filter(r => r.status === 'fulfilled' && !(r.value as any)?.success).length

      if (failed > 0) {
        alert(`คำนวณใหม่สำเร็จบางส่วน (ล้มเหลว ${failed} รายการ)`)
      } else {
        alert('คำนวณใหม่สำเร็จ')
      }

      await fetchWageData()
    } catch (error) {
      console.error('Error recalculating wages:', error)
      alert('เกิดข้อผิดพลาดในการคำนวณใหม่')
    } finally {
      setRecalculating(false)
    }
  }

  const openAdjustmentModal = (type: 'income' | 'deduction') => {
    setAdjustmentMode(type)
    setAdjustmentType(type)
    setAdjustmentCategory('')
    setAdjustmentAmount('')
    setAdjustmentDescription('')
    setAdjustmentEmployeeSearch('')
    // default to currently selected employees (if any), otherwise empty (user can choose)
    setAdjustmentEmployeeIds(new Set(selectedEmployees))
    setShowAdjustmentModal(true)
  }

  const openTaxModal = () => {
    setAdjustmentMode('tax')
    setAdjustmentType('deduction')
    setAdjustmentCategory('ภาษี')
    setAdjustmentAmount('')
    setAdjustmentDescription('')
    setAdjustmentEmployeeSearch('')
    setAdjustmentEmployeeIds(new Set(selectedEmployees))
    setShowAdjustmentModal(true)
  }

  const closeAdjustmentModal = () => {
    setShowAdjustmentModal(false)
    setAdjustmentMode('income')
    setAdjustmentCategory('')
    setAdjustmentAmount('')
    setAdjustmentDescription('')
    setAdjustmentEmployeeSearch('')
    setAdjustmentEmployeeIds(new Set())
  }

  const toggleAdjustmentEmployee = (employeeId: string) => {
    setAdjustmentEmployeeIds(prev => {
      const next = new Set(prev)
      if (next.has(employeeId)) next.delete(employeeId)
      else next.add(employeeId)
      return next
    })
  }

  const selectAllAdjustmentEmployees = (ids: string[]) => {
    setAdjustmentEmployeeIds(new Set(ids))
  }

  const saveAdjustment = async () => {
    if (!selectedYear || !selectedMonth) {
      alert('กรุณาเลือกเดือนและปี')
      return
    }
    const effectiveType: 'income' | 'deduction' = adjustmentMode === 'tax' ? 'deduction' : adjustmentType
    const effectiveCategory = adjustmentMode === 'tax' ? 'ภาษี' : adjustmentCategory

    if (!effectiveCategory || !adjustmentAmount) {
      alert('กรุณากรอกข้อมูลให้ครบ')
      return
    }
    if (adjustmentEmployeeIds.size === 0) {
      alert('กรุณาเลือกพนักงานอย่างน้อย 1 คน')
      return
    }

    const yearNum = parseInt(selectedYear)
    const monthNum = parseInt(selectedMonth)
    const amountNum = parseFloat(adjustmentAmount)

    if (!Number.isFinite(yearNum) || !Number.isFinite(monthNum) || !Number.isFinite(amountNum)) {
      alert('ข้อมูลเดือน/ปี/จำนวนเงินไม่ถูกต้อง')
      return
    }

    setSavingAdjustment(true)
    try {
      const employeeIds = Array.from(adjustmentEmployeeIds)
      const results = await Promise.allSettled(
        employeeIds.map(empId =>
          fetch('/api/wages/adjustments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employee_id: empId,
              year: yearNum,
              month: monthNum,
              period: selectedPeriod,
              adjustment_type: effectiveType,
              category: effectiveCategory,
              amount: amountNum,
              description: adjustmentDescription || null,
              created_by: 'admin'
            })
          }).then(r => r.json())
        )
      )

      const failed = results.filter(r => r.status === 'rejected').length +
        results.filter(r => r.status === 'fulfilled' && !(r.value as any)?.success).length

      if (failed > 0) {
        alert(`บันทึกสำเร็จบางส่วน (ล้มเหลว ${failed} รายการ)`)
      } else {
        alert('บันทึกสำเร็จ')
      }

      closeAdjustmentModal()
      await fetchWageData()
    } catch (error) {
      console.error('Error saving adjustment:', error)
      alert('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setSavingAdjustment(false)
    }
  }

  // Filter base data based on search + group (NOT selection; selection is a separate view mode)
  const baseFilteredData = useMemo((): EmployeeWage[] => {
    let filtered = [...employeeWages]

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(emp =>
        emp.employeeId.toLowerCase().includes(query) ||
        emp.name.toLowerCase().includes(query)
      )
    }

    // Filter by group
    if (groupBy !== 'none' && selectedGroup) {
      filtered = filtered.filter(emp => {
        if (groupBy === 'position') return emp.position === selectedGroup
        if (groupBy === 'departmentCode') return emp.departmentCode === selectedGroup
        if (groupBy === 'section') return emp.section === selectedGroup
        return true
      })
    }

    return filtered
  }, [employeeWages, groupBy, searchQuery, selectedGroup])

  const filteredData = useMemo(() => {
    if (!showSelectedOnly) return baseFilteredData
    if (selectedEmployees.size === 0) return baseFilteredData
    return baseFilteredData.filter(emp => selectedEmployees.has(emp.employeeId))
  }, [baseFilteredData, selectedEmployees, showSelectedOnly])

  // Get unique options for Group By dropdown
  const getGroupOptions = (): string[] => {
    const options = new Set<string>()
    employeeWages.forEach(emp => {
      if (groupBy === 'position' && emp.position) options.add(emp.position)
      if (groupBy === 'departmentCode' && emp.departmentCode) options.add(emp.departmentCode)
      if (groupBy === 'section' && emp.section) options.add(emp.section)
    })
    return Array.from(options).sort()
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

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedEmployees(new Set())
  }

  // Calculate totals
  const calculateTotals = (data: EmployeeWage[]) => {
    return data.reduce((acc, emp) => ({
      count: acc.count + 1,
      totalBaseWage: acc.totalBaseWage + emp.totalBaseWage,
      totalOt1Wage: acc.totalOt1Wage + emp.totalOt1Wage,
      totalOt2Wage: acc.totalOt2Wage + emp.totalOt2Wage,
      totalOt3Wage: acc.totalOt3Wage + emp.totalOt3Wage,
      totalOt4Wage: acc.totalOt4Wage + emp.totalOt4Wage,
      positionAllowance: acc.positionAllowance + emp.positionAllowance,
      attendanceBonus: acc.attendanceBonus + emp.attendanceBonus,
      nightShiftAllowance: acc.nightShiftAllowance + emp.nightShiftAllowance,
      telephoneAllowance: acc.telephoneAllowance + emp.telephoneAllowance,
      livingAllowance: acc.livingAllowance + emp.livingAllowance,
      specialAllowance: acc.specialAllowance + emp.specialAllowance,
      compta: acc.compta + emp.compta,
      rounding: acc.rounding + emp.rounding,
      totalIncome: acc.totalIncome + emp.totalIncome,
      // Row 2 totals
      otherIncome1: acc.otherIncome1 + emp.otherIncome1,
      otherIncome2: acc.otherIncome2 + emp.otherIncome2,
      returnDiligence: acc.returnDiligence + emp.returnDiligence,
      returnVacation: acc.returnVacation + emp.returnVacation,
      bonus1: acc.bonus1 + emp.bonus1,
      bonus2: acc.bonus2 + emp.bonus2,
      // Row 3 totals (deductions)
      lateDeduction: acc.lateDeduction + emp.lateDeduction,
      absentDeduction: acc.absentDeduction + emp.absentDeduction,
      leaveDeduction: acc.leaveDeduction + emp.leaveDeduction,
      uniformDeduction: acc.uniformDeduction + emp.uniformDeduction,
      studentLoanDeduction: acc.studentLoanDeduction + emp.studentLoanDeduction,
      coopDeduction: acc.coopDeduction + emp.coopDeduction,
      damagesDeduction: acc.damagesDeduction + emp.damagesDeduction,
      latePenalty: acc.latePenalty + emp.latePenalty,
      deductSpecial: acc.deductSpecial + emp.deductSpecial,
      deductOther: acc.deductOther + emp.deductOther,
      sso: acc.sso + emp.sso,
      tax: acc.tax + emp.tax,
      totalDeductions: acc.totalDeductions + emp.totalDeductions,
      netWage: acc.netWage + emp.netWage
    }), {
      count: 0,
      totalBaseWage: 0, totalOt1Wage: 0, totalOt2Wage: 0, totalOt3Wage: 0, totalOt4Wage: 0,
      positionAllowance: 0, attendanceBonus: 0, nightShiftAllowance: 0,
      telephoneAllowance: 0, livingAllowance: 0, specialAllowance: 0,
      compta: 0, rounding: 0, totalIncome: 0,
      otherIncome1: 0, otherIncome2: 0, returnDiligence: 0, returnVacation: 0,
      bonus1: 0, bonus2: 0,
      lateDeduction: 0, absentDeduction: 0, leaveDeduction: 0, uniformDeduction: 0,
      studentLoanDeduction: 0, coopDeduction: 0, damagesDeduction: 0, latePenalty: 0,
      deductSpecial: 0, deductOther: 0, sso: 0, tax: 0, totalDeductions: 0, netWage: 0
    })
  }

  // Print handler
  const handlePrint = () => {
    window.print()
  }

  const totals = calculateTotals(filteredData)

  // Check if all visible employees are selected
  const allVisibleIds = filteredData.map(emp => emp.employeeId)
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every(id => selectedEmployees.has(id))

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedEmployees(prev => {
        const newSet = new Set(prev)
        allVisibleIds.forEach(id => newSet.delete(id))
        return newSet
      })
    } else {
      setSelectedEmployees(prev => {
        const newSet = new Set(prev)
        allVisibleIds.forEach(id => newSet.add(id))
        return newSet
      })
    }
  }

  // Get current date/time for report footer
  const now = new Date()
  const reportDateTime = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear() + 543} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

  // Get group info for footer
  const groupInfo = groupBy !== 'none' && selectedGroup
    ? `${groupBy === 'position' ? 'ตำแหน่ง' : groupBy === 'departmentCode' ? 'ฝ่าย' : 'แผนก'}${selectedGroup}`
    : ''

  return (
    <div className="app-container">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .wages-select-col {
            display: none !important;
            width: 0 !important;
            padding: 0 !important;
          }
          @page {
            size: landscape;
            margin: 10mm;
          }
        }
      `}</style>

      {/* Header - No Print */}
      <div className="page-header no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">Payroll System</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              รายงานการจ่ายเงินเดือนรายงวด
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => openAdjustmentModal('income')}
              className="btn btn-primary"
              type="button"
              title="เพิ่มเงินได้ (เงินเพิ่ม) ให้พนักงาน"
            >
              เพิ่มเงินได้
            </button>
            <button
              onClick={() => openAdjustmentModal('deduction')}
              className="btn btn-secondary"
              type="button"
              title="เพิ่มเงินหัก ให้พนักงาน"
            >
              เพิ่มเงินหัก
            </button>
            <button
              onClick={openTaxModal}
              className="btn btn-secondary"
              type="button"
              title="กำหนดภาษีหัก ณ ที่จ่าย ให้พนักงาน"
            >
              ภาษี
            </button>
            <button
              onClick={handleRecalculateSelected}
              className="btn btn-secondary"
              type="button"
              disabled={recalculating}
              title="คำนวณใหม่เฉพาะพนักงานที่เลือกในงวดนี้"
            >
              {recalculating ? 'กำลังคำนวณ...' : 'คำนวณใหม่ (ที่เลือก)'}
            </button>
            <button onClick={handlePrint} className="btn btn-primary">
              Print Report
            </button>
            <a href="/wages/logs" className="btn btn-secondary">
              ประวัติการปรับเงิน
            </a>
            <a href="/" className="btn btn-secondary">
              {t('common.back')}
            </a>
          </div>
        </div>
      </div>

      {/* Filters - No Print */}
      <div className="card no-print" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '16px' }}>
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
              ค้นหาพนักงาน
            </label>
            <input
              type="text"
              placeholder="ค้นหาชื่อหรือรหัส..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Group By Controls */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-light)', marginBottom: '16px' }}>
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
              onClick={() => { setGroupBy('departmentCode'); setSelectedGroup(''); }}
              className={`btn ${groupBy === 'departmentCode' ? 'btn-primary' : 'btn-secondary'}`}
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

            {groupBy !== 'none' && (
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                style={{ padding: '8px 12px', minWidth: '200px' }}
              >
                <option value="">-- เลือก{groupBy === 'position' ? 'ตำแหน่ง' : groupBy === 'departmentCode' ? 'ฝ่าย' : 'แผนก'} --</option>
                {getGroupOptions().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* View Mode */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-light)', marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            รูปแบบการแสดงผล
          </label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowSelectedOnly(false)}
              className={`btn ${!showSelectedOnly ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px' }}
              type="button"
            >
              แสดงทั้งหมด
            </button>
            <button
              onClick={() => setShowSelectedOnly(true)}
              className={`btn ${showSelectedOnly ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px' }}
              type="button"
              disabled={selectedEmployees.size === 0}
              title={selectedEmployees.size === 0 ? 'เลือกพนักงานอย่างน้อย 1 คนก่อน' : 'แสดงเฉพาะพนักงานที่เลือก'}
            >
              แสดงเฉพาะที่เลือก
            </button>
          </div>
        </div>

        {/* Selected Employees Display */}
        {selectedEmployees.size > 0 && (
          <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
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
                const emp = employeeWages.find(e => e.employeeId === empId)
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
                      type="button"
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
      </div>

      {/* Content */}
      {loading ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>{t('common.loading')}</p>
        </div>
      ) : (
        <div className="print-area" ref={printRef}>
          <div style={{ background: '#fff', padding: '24px', minWidth: '1200px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {/* Report Title */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: 0 }}>
                รายงานการจ่ายเงินเดือนรายงวด
              </h2>
            </div>

            {/* Payroll Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', tableLayout: 'fixed' }}>
                <colgroup>
                  <col className="no-print wages-select-col" style={{ width: '46px' }} />
                  <col style={{ width: '180px' }} />
                  <col style={{ width: '80px' }} />
                  <col style={{ width: '60px' }} />
                  <col style={{ width: '60px' }} />
                  <col style={{ width: '60px' }} />
                  <col style={{ width: '60px' }} />
                  <col style={{ width: '60px' }} />
                  <col style={{ width: '60px' }} />
                  <col style={{ width: '60px' }} />
                  <col style={{ width: '60px' }} />
                  <col style={{ width: '60px' }} />
                  <col style={{ width: '60px' }} />
                  <col style={{ width: '50px' }} />
                  <col style={{ width: '50px' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: '100px' }} />
                </colgroup>
                <thead>
                  {/* Header Row 1 - ตามรูปต้นแบบ */}
                  <tr style={{ borderBottom: '1px solid #000' }}>
                    <th style={{ padding: '4px 8px', textAlign: 'center', fontWeight: '500' }} className="no-print wages-select-col">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: '500' }}>รหัส</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>เงินเดือน</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>OT1</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>OT2</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>OT3</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>OT4</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>ค่าตำแหน่ง</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>เบี้ยขยัน</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>ค่ากะ</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>ค่าโทรศัพท์</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>ค่าครองชีพ</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>ค่าพิเศษ</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>Compta</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>ปัดเศษ</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>เงินได้</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>สุทธิ</th>
                  </tr>

                  {/* Header Row 2 */}
                  <tr style={{ borderBottom: '1px solid #000' }}>
                    <th style={{ padding: '4px 8px' }} className="no-print wages-select-col"></th>
                    <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: '500' }}>ตำแหน่ง</th>
                    <th style={{ padding: '4px 8px' }}></th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>ค่าอื่นๆ</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>ค่าอื่นๆ (</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>คืนเบี้ยขยัน</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>คืนพักร้อน</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>โบนัสรายได้</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>โบนัสสหกรณ์</th>
                    <th style={{ padding: '4px 8px' }}></th>
                    <th style={{ padding: '4px 8px' }}></th>
                    <th style={{ padding: '4px 8px' }}></th>
                    <th style={{ padding: '4px 8px' }}></th>
                    <th style={{ padding: '4px 8px' }}></th>
                    <th style={{ padding: '4px 8px' }}></th>
                    <th style={{ padding: '4px 8px' }}></th>
                    <th style={{ padding: '4px 8px' }}></th>
                  </tr>

                  {/* Header Row 3 */}
                  <tr style={{ borderBottom: '1px solid #000' }}>
                    <th style={{ padding: '4px 8px' }} className="no-print wages-select-col"></th>
                    <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: '500' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>งวด</span>
                        <span>วันที่</span>
                      </div>
                    </th>
                    <th style={{ padding: '4px 8px' }}></th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>มาสาย</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>ขาดงาน</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>ลากิจ</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>ค่าชุดฟอร์ม</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>หักกยศ.</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>สหกรณ์</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>งานเสีย</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>ค่ามาสาย</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>หักค่าพิเศษ</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>หักค่าอื่นๆ</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>Compta</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>ปัดเศษ</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: '500' }}>ค่าใช้จ่าย</th>
                    <th style={{ padding: '4px 8px' }}></th>
                  </tr>

                  {/* Header Row 4 - SSO/Tax */}
                  <tr style={{ borderBottom: '1px solid #000' }}>
                    <th style={{ padding: '0' }} className="no-print wages-select-col"></th>
                    {/* span up to column before SSO */}
                    <th colSpan={10} style={{ padding: '0' }}></th>
                    <th style={{ padding: '4px 8px', textAlign: 'center', fontSize: '10px', fontWeight: '500' }}>สปส.</th>
                    <th style={{ padding: '0' }}></th>
                    <th style={{ padding: '4px 8px', textAlign: 'center', fontSize: '10px', fontWeight: '500' }}>ภาษี</th>
                    <th colSpan={3} style={{ padding: '0' }}></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={17} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        ไม่พบข้อมูล
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((emp) => {
                      const isChecked = selectedEmployees.has(emp.employeeId)
                      const periodDate = `25/${selectedMonth}/${parseInt(selectedYear) + 543}`

                      return (
                        <>
                          {/* Row 1: Main Income */}
                          <tr>
                            <td style={{ padding: '4px 8px', verticalAlign: 'top' }} rowSpan={4} className="no-print">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleEmployeeSelection(emp.employeeId)}
                                style={{ cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ padding: '4px 8px', fontWeight: '600' }}>{emp.employeeId}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.totalBaseWage)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.totalOt1Wage)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.totalOt2Wage)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.totalOt3Wage)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.totalOt4Wage)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.positionAllowance)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.attendanceBonus)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.nightShiftAllowance)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.telephoneAllowance)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.livingAllowance)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.specialAllowance)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.compta)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.rounding)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.totalIncome)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.netWage)}</td>
                          </tr>

                          {/* Row 2: Name + Other Income */}
                          <tr>
                            <td style={{ padding: '4px 8px', fontWeight: '500' }}>{emp.name}</td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.otherIncome1)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.otherIncome2)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.returnDiligence)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.returnVacation)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.bonus1)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.bonus2)}</td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px' }}></td>
                          </tr>

                          {/* Row 3: Position + Deductions */}
                          <tr>
                            <td style={{ padding: '4px 8px' }}>{emp.position}</td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.lateDeduction)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.absentDeduction)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.leaveDeduction)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.uniformDeduction)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.studentLoanDeduction)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.coopDeduction)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.damagesDeduction)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.latePenalty)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.deductSpecial)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.deductOther)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.comptaDed)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(emp.roundingDed)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>
                              {fmt(emp.totalDeductions)}
                            </td>
                            <td style={{ padding: '4px 8px' }}></td>
                          </tr>

                          {/* Row 4: Period/Date + SSO/Tax */}
                          <tr>
                            <td style={{ padding: '4px 8px', textAlign: 'left' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{selectedPeriod === 1 ? '22' : '22'}</span>
                                <span>{periodDate}</span>
                              </div>
                            </td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(safeNum(emp.sso))}</td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(safeNum(emp.tax))}</td>
                            <td style={{ padding: '4px 8px' }}></td>
                            <td style={{ padding: '4px 8px' }}></td>
                          </tr>
                        </>
                      )
                    })
                  )}
                </tbody>

                {/* Footer / Total Row */}
                {filteredData.length > 0 && (
                  <tfoot style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', background: '#fafafa' }}>
                    {/* Total Row 1 */}
                    <tr>
                      <td style={{ padding: '4px 8px' }} className="no-print wages-select-col"></td>
                      <td style={{ padding: '4px 8px', fontWeight: '700' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>พนักงาน:</span>
                          <span style={{ borderBottom: '1px solid #000', marginRight: '16px' }}>{totals.count}</span>
                        </div>
                      </td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.totalBaseWage)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.totalOt1Wage)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.totalOt2Wage)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.totalOt3Wage)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.totalOt4Wage)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.positionAllowance)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.attendanceBonus)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.nightShiftAllowance)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.telephoneAllowance)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.livingAllowance)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.specialAllowance)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.compta)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.rounding)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.totalIncome)}</td>
                      <td style={{ padding: '4px 8px' }}></td>
                    </tr>

                    {/* Total Row 2 */}
                    <tr>
                      <td style={{ padding: '4px 8px' }} className="no-print wages-select-col"></td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.otherIncome1)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.otherIncome2)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.returnDiligence)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.returnVacation)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.bonus1)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.bonus2)}</td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px' }}></td>
                    </tr>

                    {/* Total Row 3 */}
                    <tr>
                      <td style={{ padding: '4px 8px' }} className="no-print wages-select-col"></td>
                      <td style={{ padding: '4px 8px', color: '#666', fontSize: '11px' }}>{groupInfo}</td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.lateDeduction)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.absentDeduction)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.leaveDeduction)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.uniformDeduction)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.studentLoanDeduction)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.coopDeduction)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.damagesDeduction)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.latePenalty)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.deductSpecial)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.deductOther)}</td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.totalDeductions)}</td>
                      <td style={{ padding: '4px 8px' }}></td>
                    </tr>

                    {/* Total Row 4 - SSO/Tax totals */}
                    <tr>
                      <td style={{ padding: '4px 8px' }} className="no-print wages-select-col"></td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.sso)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmt(totals.tax)}</td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px' }}></td>
                      <td style={{ padding: '4px 8px' }}></td>
                    </tr>

                    {/* Grand Total Row - รวมสปส ภาษี และแสดงวันที่ */}
                    <tr style={{ borderTop: '1px solid #000' }}>
                      <td style={{ padding: '12px 8px' }} className="no-print wages-select-col"></td>
                      <td colSpan={9} style={{ padding: '12px 8px', textAlign: 'left', color: '#666', fontSize: '11px' }}>
                        {reportDateTime}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '600' }}>{fmt(totals.sso)}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '600' }}>{fmt(totals.tax)}</td>
                      <td style={{ padding: '12px 8px' }}></td>
                      <td style={{ padding: '12px 8px' }}></td>
                      <td style={{ padding: '12px 8px' }}></td>
                      <td style={{ padding: '12px 8px' }}></td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '11px' }}>
                        หน้า:
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Print Note */}
          <div className="no-print" style={{ marginTop: '16px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
            <p>Recommended: Print in Landscape mode with minimal margins for best results.</p>
          </div>
        </div>
      )}

      {/* Modal เพิ่มเงินได้/เพิ่มเงินหัก */}
      {showAdjustmentModal && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={closeAdjustmentModal}
        >
          <div
            className="card"
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                {adjustmentMode === 'tax' ? 'ภาษี' : adjustmentType === 'income' ? 'เพิ่มเงินได้' : 'เพิ่มเงินหัก'}
              </h2>
              <button className="btn btn-secondary" type="button" onClick={closeAdjustmentModal}>
                ปิด
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  เลือกงวด
                </label>
                <div style={{ padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-surface)' }}>
                  {selectedMonth && selectedYear
                    ? `${['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'][Math.max(0, parseInt(selectedMonth) - 1)]} ${parseInt(selectedYear) + 543} - งวด ${selectedPeriod}`
                    : 'กรุณาเลือกเดือน/ปี'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  ประเภท <span style={{ color: '#dc2626' }}>*</span>
                </label>
                {adjustmentMode === 'tax' ? (
                  <div style={{ padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-surface)' }}>
                    ภาษี
                  </div>
                ) : (
                  <select
                    value={adjustmentCategory}
                    onChange={(e) => setAdjustmentCategory(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="">-- เลือกประเภท --</option>
                    {(adjustmentType === 'income' ? incomeCategories : deductionCategories).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  จำนวนเงิน (บาท) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="number"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  รายละเอียด/หมายเหตุ
                </label>
                <input
                  type="text"
                  value={adjustmentDescription}
                  onChange={(e) => setAdjustmentDescription(e.target.value)}
                  placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <div style={{ fontWeight: 700 }}>
                  เลือกพนักงาน <span style={{ color: '#dc2626' }}>*</span> ({adjustmentEmployeeIds.size} คน)
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => selectAllAdjustmentEmployees(baseFilteredData.map(e => e.employeeId))}
                  >
                    พนักงานทั้งหมด
                  </button>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => setAdjustmentEmployeeIds(new Set())}
                  >
                    ล้างการเลือก
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="ค้นหาพนักงาน (ชื่อหรือรหัส)..."
                  value={adjustmentEmployeeSearch}
                  onChange={(e) => setAdjustmentEmployeeSearch(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ border: '1px solid var(--border-light)', borderRadius: '8px', maxHeight: '260px', overflow: 'auto' }}>
                {baseFilteredData
                  .filter(emp => {
                    const q = adjustmentEmployeeSearch.trim().toLowerCase()
                    if (!q) return true
                    return emp.employeeId.toLowerCase().includes(q) || emp.name.toLowerCase().includes(q)
                  })
                  .map(emp => {
                    const checked = adjustmentEmployeeIds.has(emp.employeeId)
                    return (
                      <label
                        key={emp.employeeId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderBottom: '1px solid var(--border-light)',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAdjustmentEmployee(emp.employeeId)}
                        />
                        <div style={{ fontWeight: 700 }}>{emp.employeeId}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>
                          - {emp.name} {emp.position ? `(${emp.position})` : ''}
                        </div>
                      </label>
                    )
                  })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '18px' }}>
              <button className="btn btn-secondary" type="button" onClick={closeAdjustmentModal} disabled={savingAdjustment}>
                ยกเลิก
              </button>
              <button className="btn btn-primary" type="button" onClick={saveAdjustment} disabled={savingAdjustment}>
                {savingAdjustment ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
