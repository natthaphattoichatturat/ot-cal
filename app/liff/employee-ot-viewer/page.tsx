'use client'

import { useEffect, useState } from 'react'
import liff from '@line/liff'
import { LINE_CONFIG } from '@/lib/lineConfig'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

interface AttendanceRecord {
  id: number
  work_date: string
  check_in_time: string | null
  check_out_time: string | null
  actual_hours: number
  ot_hours: number
  is_holiday: boolean
  is_leave: boolean
  late: boolean
  late_hours: number
  notes: string | null
}

interface EmployeeData {
  employee_id: string
  name: string
  department: string
}

export default function EmployeeOTViewerPage() {
  const [loading, setLoading] = useState(true)
  const [lineUserId, setLineUserId] = useState('')
  const [employee, setEmployee] = useState<EmployeeData | null>(null)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')
  const [totalOT, setTotalOT] = useState(0)
  const [totalHours, setTotalHours] = useState(0)

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: LINE_CONFIG.liff.employeeOtViewer })

        if (!liff.isLoggedIn()) {
          liff.login()
          return
        }

        const profile = await liff.getProfile()
        setLineUserId(profile.userId)

        // Set default date range (current month)
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        setStartDate(format(firstDay, 'yyyy-MM-dd'))
        setEndDate(format(lastDay, 'yyyy-MM-dd'))

        // Fetch employee data
        await fetchEmployeeData(profile.userId)

        setLoading(false)
      } catch (err) {
        console.error('LIFF initialization failed', err)
        setError('ไม่สามารถเริ่มต้นระบบได้')
        setLoading(false)
      }
    }

    initLiff()
  }, [])

  const fetchEmployeeData = async (userId: string) => {
    try {
      // Get employee by Employee LINE ID
      const response = await fetch(`/api/employees?search=${userId}&searchBy=line_id_employ`)
      const result = await response.json()

      if (result.success && result.data && result.data.length > 0) {
        const emp = result.data[0]
        setEmployee({
          employee_id: emp.employee_id,
          name: emp.name,
          department: emp.department
        })
      } else {
        setError('ไม่พบข้อมูลพนักงาน กรุณาลงทะเบียนก่อน')
      }
    } catch (err) {
      console.error('Failed to fetch employee:', err)
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล')
    }
  }

  const fetchAttendance = async () => {
    if (!employee || !startDate || !endDate) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/attendance?employee_id=${employee.employee_id}&start_date=${startDate}&end_date=${endDate}`
      )
      const result = await response.json()

      if (result.success) {
        setAttendance(result.data || [])

        // Calculate totals
        const records = result.data || []
        const totalOTHours = records.reduce((sum: number, r: AttendanceRecord) => sum + (r.ot_hours || 0), 0)
        const totalWorkHours = records.reduce((sum: number, r: AttendanceRecord) => sum + (r.actual_hours || 0), 0)
        setTotalOT(totalOTHours)
        setTotalHours(totalWorkHours)
      } else {
        setError(result.error || 'ไม่สามารถดึงข้อมูลได้')
      }
    } catch (err) {
      console.error('Failed to fetch attendance:', err)
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (employee && startDate && endDate) {
      fetchAttendance()
    }
  }, [employee, startDate, endDate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (error && !employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{employee?.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{employee?.name}</h1>
              <p className="text-sm text-gray-600">{employee?.employee_id}</p>
              <p className="text-sm text-gray-600">{employee?.department}</p>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันที่เริ่มต้น</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันที่สิ้นสุด</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium mb-1">ชั่วโมงทำงาน</p>
              <p className="text-3xl font-bold text-blue-900">{totalHours.toFixed(2)}</p>
              <p className="text-xs text-blue-600">ชั่วโมง</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm text-indigo-600 font-medium mb-1">ชั่วโมง OT</p>
              <p className="text-3xl font-bold text-indigo-900">{totalOT.toFixed(2)}</p>
              <p className="text-xs text-indigo-600">ชั่วโมง</p>
            </div>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">รายละเอียดการทำงาน</h2>

          {attendance.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600">ไม่พบข้อมูลการทำงานในช่วงเวลาที่เลือก</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendance.map((record) => (
                <div
                  key={record.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {format(new Date(record.work_date), 'dd MMMM yyyy', { locale: th })}
                      </p>
                      <div className="flex gap-2 mt-1">
                        {record.is_leave && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">ลา</span>
                        )}
                        {record.is_holiday && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">วันหยุด</span>
                        )}
                        {record.late && (
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            สาย {record.late_hours.toFixed(2)} ชม.
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">เวลาทำงาน</p>
                      <p className="font-semibold text-gray-900">{record.actual_hours.toFixed(2)} ชม.</p>
                      {record.ot_hours > 0 && (
                        <p className="text-sm text-indigo-600 font-medium">OT: {record.ot_hours.toFixed(2)} ชม.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">เข้า:</span>{' '}
                      {record.check_in_time || '-'}
                    </div>
                    <div>
                      <span className="font-medium">ออก:</span>{' '}
                      {record.check_out_time || '-'}
                    </div>
                  </div>

                  {record.notes && (
                    <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {record.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>ระบบคำนวณชั่วโมง OT</p>
          <p>© 2025 E-Cloud Technology</p>
        </div>
      </div>
    </div>
  )
}
