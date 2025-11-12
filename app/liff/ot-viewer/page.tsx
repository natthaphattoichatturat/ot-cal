'use client'

import { useEffect, useState } from 'react'
import liff from '@line/liff'
import { LINE_CONFIG } from '@/lib/lineConfig'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

interface AttendanceRecord {
  id: number
  employee_id: string
  employee_name: string
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

interface EmployeeOTSummary {
  employee_id: string
  employee_name: string
  total_ot_hours: number
  total_work_days: number
}

export default function OTViewerPage() {
  const [loading, setLoading] = useState(true)
  const [permissionError, setPermissionError] = useState<string>('')
  const [viewMode, setViewMode] = useState<'summary' | 'detail'>('summary')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [summaryData, setSummaryData] = useState<EmployeeOTSummary[]>([])
  const [detailData, setDetailData] = useState<AttendanceRecord[]>([])
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: LINE_CONFIG.liff.otViewer })

        if (!liff.isLoggedIn()) {
          liff.login()
          return
        }

        // Check HR permission
        const profile = await liff.getProfile()
        const permissionCheck = await fetch('/api/check-hr-permission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lineUserId: profile.userId }),
        })
        const permissionResult = await permissionCheck.json()

        if (!permissionResult.allowed) {
          setPermissionError(permissionResult.error || 'คุณไม่มีสิทธิ์เข้าถึงระบบนี้')
          setLoading(false)
          return
        }

        // Set default date range (current month)
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        setStartDate(format(firstDay, 'yyyy-MM-dd'))
        setEndDate(format(lastDay, 'yyyy-MM-dd'))

        setLoading(false)
      } catch (err) {
        console.error('LIFF initialization failed', err)
        setLoading(false)
      }
    }

    initLiff()
  }, [])

  const fetchSummaryData = async () => {
    if (!startDate || !endDate) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/attendance?startDate=${startDate}&endDate=${endDate}&groupBy=employee`
      )
      const result = await response.json()

      if (result.success) {
        // Calculate summary
        const summaryMap = new Map<string, EmployeeOTSummary>()

        result.data.forEach((record: AttendanceRecord) => {
          const key = record.employee_id
          if (!summaryMap.has(key)) {
            summaryMap.set(key, {
              employee_id: record.employee_id,
              employee_name: record.employee_name,
              total_ot_hours: 0,
              total_work_days: 0,
            })
          }

          const summary = summaryMap.get(key)!
          summary.total_ot_hours += record.ot_hours || 0
          summary.total_work_days += 1
        })

        setSummaryData(Array.from(summaryMap.values()).sort((a, b) =>
          b.total_ot_hours - a.total_ot_hours
        ))
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDetailData = async () => {
    if (!startDate || !endDate) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/attendance?startDate=${startDate}&endDate=${endDate}`
      )
      const result = await response.json()

      if (result.success) {
        setDetailData(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch detail:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (startDate && endDate) {
      if (viewMode === 'summary') {
        fetchSummaryData()
      } else {
        fetchDetailData()
      }
    }
  }, [startDate, endDate, viewMode])

  const filteredSummary = summaryData.filter(
    (emp) =>
      emp.employee_name.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchText.toLowerCase())
  )

  const filteredDetail = detailData.filter(
    (record) =>
      record.employee_name.toLowerCase().includes(searchText.toLowerCase()) ||
      record.employee_id.toLowerCase().includes(searchText.toLowerCase())
  )

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

  if (permissionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-gray-600 mb-6">{permissionError}</p>
          <button
            onClick={() => liff.closeWindow()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-1">ดูข้อมูล OT พนักงาน</h1>
        <p className="text-blue-100 text-sm">HR Management System</p>
      </div>

      {/* Controls */}
      <div className="px-4 py-4 space-y-4">
        {/* View Mode Toggle */}
        <div className="flex gap-2 bg-white rounded-xl p-2 shadow-md">
          <button
            onClick={() => setViewMode('summary')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              viewMode === 'summary'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            สรุปรายคน
          </button>
          <button
            onClick={() => setViewMode('detail')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              viewMode === 'detail'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            รายละเอียด
          </button>
        </div>

        {/* Date Range */}
        <div className="bg-white rounded-xl p-4 shadow-md space-y-3">
          <label className="block text-sm font-medium text-gray-700">ช่วงเวลา</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">จาก</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">ถึง</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <input
            type="text"
            placeholder="ค้นหาชื่อหรือรหัสพนักงาน..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {viewMode === 'summary' ? (
          <div className="space-y-3">
            {filteredSummary.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-md">
                <p className="text-gray-500">ไม่พบข้อมูล</p>
              </div>
            ) : (
              filteredSummary.map((emp) => (
                <div key={emp.employee_id} className="bg-white rounded-xl p-4 shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{emp.employee_name}</h3>
                      <p className="text-sm text-gray-600">รหัส: {emp.employee_id}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        ทำงาน: {emp.total_work_days} วัน
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {emp.total_ot_hours.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">ชั่วโมง OT</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDetail.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-md">
                <p className="text-gray-500">ไม่พบข้อมูล</p>
              </div>
            ) : (
              filteredDetail.map((record) => (
                <div key={record.id} className="bg-white rounded-xl p-4 shadow-md">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{record.employee_name}</h3>
                      <p className="text-xs text-gray-600">รหัส: {record.employee_id}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {record.ot_hours.toFixed(1)} ชม.
                      </div>
                      <div className="text-xs text-gray-500">OT</div>
                    </div>
                  </div>
                  <div className="border-t pt-2 mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">วันที่:</span>
                      <span className="font-medium">
                        {format(new Date(record.work_date), 'dd MMM yyyy', { locale: th })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">เวลาทำงาน:</span>
                      <span className="font-medium">{record.actual_hours.toFixed(1)} ชม.</span>
                    </div>
                    {record.late && (
                      <div className="flex justify-between text-sm text-red-600">
                        <span>สาย:</span>
                        <span className="font-medium">{record.late_hours.toFixed(1)} ชม.</span>
                      </div>
                    )}
                    {record.is_leave && (
                      <div className="text-sm text-orange-600 font-medium">ลางาน</div>
                    )}
                    {record.is_holiday && (
                      <div className="text-sm text-purple-600 font-medium">วันหยุด</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
