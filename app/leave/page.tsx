'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useLanguage } from '@/contexts/LanguageContext'

interface LeaveRecord {
  id: number
  employee_id: string
  leave_date: string
  leave_type: string
  reason: string | null
  leave_hours?: number
  deduct_wage?: boolean
  deduct_diligence?: boolean
  is_paid?: boolean
  created_by: string | null
  created_at: string
  employees: {
    name: string
    department: string
  }
}

interface Employee {
  employee_id: string
  name: string
  department: string
}

export default function LeavePage() {
  const { t } = useLanguage()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set())
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [leaveEntries, setLeaveEntries] = useState<Array<{ leaveDate: string; leaveHours: number }>>([
    { leaveDate: '', leaveHours: 8 }
  ])
  const [leaveType, setLeaveType] = useState('ลากิจ')
  const [reason, setReason] = useState('')
  const [createdBy, setCreatedBy] = useState('')
  const [deductWage, setDeductWage] = useState(false)
  const [deductDiligence, setDeductDiligence] = useState(false)
  const [message, setMessage] = useState('')

  // Filter state
  const [filterEmployee, setFilterEmployee] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')

  // Thai date formatting
  const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ]
  const thaiMonthsFull = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ]

  const formatThaiDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    const day = date.getDate()
    const month = thaiMonths[date.getMonth()]
    const year = date.getFullYear() + 543
    return `${day} ${month} ${year}`
  }

  const formatThaiDateTime = (dateStr: string): string => {
    const date = new Date(dateStr)
    const day = date.getDate()
    const month = thaiMonths[date.getMonth()]
    const year = date.getFullYear() + 543
    const time = format(date, 'HH:mm')
    return `${day} ${month} ${year} ${time}`
  }

  const getCurrentThaiDate = (): string => {
    const date = new Date()
    const dayName = thaiDays[date.getDay()]
    const day = date.getDate()
    const month = thaiMonthsFull[date.getMonth()]
    const year = date.getFullYear() + 543
    return `วัน${dayName}ที่ ${day} ${month} ${year}`
  }

  useEffect(() => {
    fetchEmployees()
    fetchLeaveRecords()
  }, [])

  useEffect(() => {
    fetchLeaveRecords()
  }, [filterEmployee, filterStartDate, filterEndDate])

  const fetchEmployees = async () => {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('employees')
        .select('employee_id, name, department')
        .order('employee_id')

      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchLeaveRecords = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterEmployee) params.append('employeeId', filterEmployee)
      if (filterStartDate) params.append('startDate', filterStartDate)
      if (filterEndDate) params.append('endDate', filterEndDate)

      const response = await fetch(`/api/leave?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setLeaveRecords(result.data)
      }
    } catch (error) {
      console.error('Error fetching leave records:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      const leaves = leaveEntries
        .filter(l => l.leaveDate)
        .map(l => ({ leaveDate: l.leaveDate, leaveHours: Number(l.leaveHours) }))

      if (selectedEmployeeIds.size === 0) {
        setMessage(`${t('common.error')}: กรุณาเลือกพนักงานอย่างน้อย 1 คน`)
        setSubmitting(false)
        return
      }
      if (leaves.length === 0) {
        setMessage(`${t('common.error')}: กรุณาเลือกวันที่ลาอย่างน้อย 1 วัน`)
        setSubmitting(false)
        return
      }
      if (leaves.some(l => !Number.isFinite(l.leaveHours) || l.leaveHours < 1 || l.leaveHours > 24)) {
        setMessage(`${t('common.error')}: ชั่วโมงการลาต้องอยู่ระหว่าง 1 ถึง 24`)
        setSubmitting(false)
        return
      }

      const response = await fetch('/api/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leaveType,
          reason: reason || null,
          createdBy: createdBy || null,
          employeeIds: Array.from(selectedEmployeeIds),
          leaves,
          deductWage,
          deductDiligence
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessage(`${t('common.success')}: ${t('leave.successMessage')}`)
        // Reset form
        setSelectedEmployeeIds(new Set())
        setEmployeeSearch('')
        setLeaveEntries([{ leaveDate: '', leaveHours: 8 }])
        setLeaveType('ลากิจ')
        setReason('')
        setCreatedBy('')
        setDeductWage(false)
        setDeductDiligence(false)
        // Refresh records
        fetchLeaveRecords()
      } else {
        setMessage(`${t('common.error')}: ${result.error}`)
      }
    } catch (error) {
      setMessage(`${t('common.error')}: เกิดข้อผิดพลาดในการบันทึกข้อมูล`)
    } finally {
      setSubmitting(false)
    }
  }

  const getLeaveTypeStyle = (type: string) => {
    switch (type) {
      case 'ลาป่วย':
        return 'bg-red-50 text-red-700 border border-red-200'
      case 'ลาพักร้อน':
        return 'bg-green-50 text-green-700 border border-green-200'
      case 'ลากิจ':
        return 'bg-blue-50 text-blue-700 border border-blue-200'
      case 'ขาดงาน':
        return 'bg-amber-50 text-amber-800 border border-amber-200'
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {t('leave.title')}
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                {getCurrentThaiDate()}
              </p>
            </div>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('common.back')}
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Leave Request Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">{t('leave.saveLeave')}</h2>
            <p className="text-sm text-gray-600 mt-1">กรุณากรอกข้อมูลการลาของพนักงาน</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Employee Selection (Search + Multiple) */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('leave.employeeName')} <span className="text-red-600">*</span>
                  <span className="ml-2 text-xs text-gray-500">({selectedEmployeeIds.size} คน)</span>
                </label>

                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    placeholder="ค้นหาพนักงาน (ชื่อหรือรหัส)..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedEmployeeIds(new Set(employees.map(e => e.employee_id)))}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      เลือกพนักงานทั้งหมด
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedEmployeeIds(new Set())}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      ล้างการเลือก
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg max-h-56 overflow-auto bg-white">
                    {employees
                      .filter(emp => {
                        const q = employeeSearch.trim().toLowerCase()
                        if (!q) return true
                        return emp.employee_id.toLowerCase().includes(q) || emp.name.toLowerCase().includes(q)
                      })
                      .map(emp => {
                        const checked = selectedEmployeeIds.has(emp.employee_id)
                        return (
                          <label
                            key={emp.employee_id}
                            className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setSelectedEmployeeIds(prev => {
                                  const next = new Set(prev)
                                  if (next.has(emp.employee_id)) next.delete(emp.employee_id)
                                  else next.add(emp.employee_id)
                                  return next
                                })
                              }}
                              className="h-4 w-4"
                            />
                            <div className="text-sm font-semibold text-gray-900">{emp.employee_id}</div>
                            <div className="text-sm text-gray-700">
                              - {emp.name} <span className="text-gray-500">({emp.department})</span>
                            </div>
                          </label>
                        )
                      })}
                  </div>
                </div>
              </div>

              {/* Leave Dates (Multiple) */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('leave.leaveDate')} <span className="text-red-600">*</span>
                </label>

                <div className="space-y-3">
                  {leaveEntries.map((entry, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                      <div className="md:col-span-7">
                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                          วันที่ลา
                        </label>
                        <input
                          type="date"
                          value={entry.leaveDate}
                          onChange={(e) => {
                            const v = e.target.value
                            setLeaveEntries(prev => prev.map((p, i) => (i === idx ? { ...p, leaveDate: v } : p)))
                          }}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                          ชั่วโมง (1-24)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={24}
                          value={entry.leaveHours}
                          onChange={(e) => {
                            const hours = Number(e.target.value)
                            setLeaveEntries(prev => prev.map((p, i) => (i === idx ? { ...p, leaveHours: hours } : p)))
                          }}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div className="md:col-span-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setLeaveEntries(prev => [...prev, { leaveDate: '', leaveHours: 8 }])}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                          title="เพิ่มวันลา"
                        >
                          + เพิ่ม
                        </button>
                        <button
                          type="button"
                          onClick={() => setLeaveEntries(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                          disabled={leaveEntries.length === 1}
                          title="ลบวันลา"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leave Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('leave.leaveType')} <span className="text-red-600">*</span>
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="ลากิจ">ลากิจ</option>
                  <option value="ลาป่วย">ลาป่วย</option>
                  <option value="ลาพักร้อน">ลาพักร้อน</option>
                  <option value="ลากิจพิเศษ">ลากิจพิเศษ</option>
                  <option value="ลาคลอด">ลาคลอด</option>
                  <option value="ลาบวช">ลาบวช</option>
                  <option value="ขาดงาน">ขาดงาน</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              {/* Deduction flags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  การหักเงิน
                </label>
                <label className="flex items-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg">
                  <input
                    type="checkbox"
                    checked={deductWage}
                    onChange={(e) => setDeductWage(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-gray-700">หักเงิน (ถ้าไม่ติ๊ก = ไม่หักเงิน)</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  การหักเบี้ยขยัน
                </label>
                <label className="flex items-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg">
                  <input
                    type="checkbox"
                    checked={deductDiligence}
                    onChange={(e) => setDeductDiligence(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-gray-700">หักเบี้ยขยัน (ถ้ามีในงวดนั้น เบี้ยขยันเป็น 0)</span>
                </label>
              </div>

              {/* Created By */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  บันทึกโดย
                </label>
                <input
                  type="text"
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  placeholder="ชื่อผู้บันทึกข้อมูล"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Reason */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('leave.reason')}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="ระบุเหตุผลในการลา (ถ้ามี)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>

            {/* Submit Button & Message */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('leave.saving')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('leave.saveLeave')}
                  </>
                )}
              </button>
              {message && (
                <div className={`flex items-center px-4 py-2 rounded-lg ${
                  message.startsWith(t('common.success')) 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    {message.startsWith(t('common.success')) ? (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    )}
                  </svg>
                  <span className="text-sm font-medium">{message}</span>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Leave Records Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">{t('leave.leaveHistory')}</h2>
            <p className="text-sm text-gray-600 mt-1">ประวัติการลาของพนักงานทั้งหมด</p>
          </div>

          {/* Filter Section */}
          <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  พนักงาน
                </label>
                <select
                  value={filterEmployee}
                  onChange={(e) => setFilterEmployee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">ทั้งหมด</option>
                  {employees.map((emp) => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.employee_id} - {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  วันที่เริ่มต้น
                </label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  วันที่สิ้นสุด
                </label>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600 font-medium">{t('common.loading')}</p>
              </div>
            ) : leaveRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 font-medium">{t('leave.noHistory')}</p>
                <p className="text-gray-400 text-sm mt-1">ยังไม่มีข้อมูลการลาในระบบ</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('leave.leaveDate')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('leave.employeeId')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('leave.employeeName')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('leave.department')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('leave.type')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      ชั่วโมง
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      หักเงิน
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      หักเบี้ยขยัน
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('leave.reason')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      บันทึกโดย
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('leave.date')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaveRecords.map((record, index) => (
                    <tr 
                      key={record.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatThaiDate(record.leave_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {record.employee_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.employees?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {record.employees?.department || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getLeaveTypeStyle(record.leave_type)}`}>
                          {record.leave_type}
                        </span>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(record.leave_hours ?? 8).toString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        record.deduct_wage ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                      }`}>
                        {record.deduct_wage ? 'หัก' : 'ไม่หัก'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        record.deduct_diligence ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                      }`}>
                        {record.deduct_diligence ? 'หัก' : 'ไม่หัก'}
                      </span>
                    </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {record.reason || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {record.created_by || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500">
                          {formatThaiDateTime(record.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Records Count */}
          {!loading && leaveRecords.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                แสดงทั้งหมด <span className="font-semibold text-gray-900">{leaveRecords.length}</span> รายการ
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
