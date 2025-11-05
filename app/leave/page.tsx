'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface LeaveRecord {
  id: number
  employee_id: string
  leave_date: string
  leave_type: string
  reason: string | null
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
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [leaveDate, setLeaveDate] = useState('')
  const [leaveType, setLeaveType] = useState('Personal')
  const [reason, setReason] = useState('')
  const [createdBy, setCreatedBy] = useState('')
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
      const response = await fetch('/api/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          leaveDate,
          leaveType,
          reason: reason || null,
          createdBy: createdBy || null
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessage('✓ บันทึกการลาสำเร็จ')
        // Reset form
        setSelectedEmployee('')
        setLeaveDate('')
        setLeaveType('Personal')
        setReason('')
        setCreatedBy('')
        // Refresh records
        fetchLeaveRecords()
      } else {
        setMessage(`✗ ${result.error}`)
      }
    } catch (error) {
      setMessage('✗ เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                บันทึกการลางานพนักงาน
              </h1>
              <p className="text-gray-600">
                {getCurrentThaiDate()}
              </p>
            </div>
            <a
              href="/"
              className="btn-primary"
            >
              กลับหน้าหลัก
            </a>
          </div>
        </div>

        {/* Leave Form */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">บันทึกการลาใหม่</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  พนักงาน <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  required
                  className="w-full"
                >
                  <option value="">-- เลือกพนักงาน --</option>
                  {employees.map((emp) => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.employee_id} - {emp.name} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันที่ลา <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภทการลา
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full"
                >
                  <option value="Personal">ลากิจ</option>
                  <option value="Sick">ลาป่วย</option>
                  <option value="Vacation">ลาพักร้อน</option>
                  <option value="Other">อื่นๆ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  บันทึกโดย
                </label>
                <input
                  type="text"
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  placeholder="ชื่อผู้บันทึก"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เหตุผลการลา
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="ระบุเหตุผล (ถ้ามี)"
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'กำลังบันทึก...' : 'บันทึกการลา'}
              </button>
              {message && (
                <p className={message.startsWith('✓') ? 'text-green-600' : 'text-red-600'}>
                  {message}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Filter Section */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">ค้นหาประวัติการลา</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                พนักงาน
              </label>
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="w-full"
              >
                <option value="">-- ทั้งหมด --</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.employee_id} - {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Leave Records Table */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">ประวัติการลา</h2>
          {loading ? (
            <p className="text-center py-8 text-gray-600">กำลังโหลดข้อมูล...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="excel-table w-full">
                <thead>
                  <tr>
                    <th>วันที่ลา</th>
                    <th>รหัสพนักงาน</th>
                    <th>ชื่อพนักงาน</th>
                    <th>แผนก</th>
                    <th>ประเภท</th>
                    <th>เหตุผล</th>
                    <th>บันทึกโดย</th>
                    <th>วันที่บันทึก</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        ไม่พบข้อมูลการลา
                      </td>
                    </tr>
                  ) : (
                    leaveRecords.map((record) => (
                      <tr key={record.id}>
                        <td>{formatThaiDate(record.leave_date)}</td>
                        <td className="font-semibold">{record.employee_id}</td>
                        <td className="text-left">{record.employees?.name || '-'}</td>
                        <td>{record.employees?.department || '-'}</td>
                        <td>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {record.leave_type}
                          </span>
                        </td>
                        <td className="text-left">{record.reason || '-'}</td>
                        <td>{record.created_by || '-'}</td>
                        <td>{formatThaiDateTime(record.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
