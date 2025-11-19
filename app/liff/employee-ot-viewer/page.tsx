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

interface WageSummary {
  period: number
  month: number
  year: number
  base_wage: number
  ot_wage: number
  total_income: number
  sso: number
  tax: number
  total_deduction: number
  net_wage: number
}

interface YTDData {
  ytd_gross_wage: number
  ytd_ot_wage: number
  ytd_total_income: number
  ytd_sso: number
  ytd_tax: number
  ytd_total_deduction: number
  ytd_net_wage: number
}

interface AllTimeData {
  total_gross_wage: number
  total_ot_wage: number
  total_income: number
  total_sso: number
  total_tax: number
  total_deduction: number
  total_net_wage: number
  total_periods: number
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
  const [wageSummaries, setWageSummaries] = useState<WageSummary[]>([])
  const [ytdData, setYtdData] = useState<YTDData | null>(null)
  const [allTimeData, setAllTimeData] = useState<AllTimeData | null>(null)
  const [showWageDetail, setShowWageDetail] = useState(false)

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

  useEffect(() => {
    if (employee && startDate) {
      fetchWageData(employee.employee_id)
      fetchYTDData(employee.employee_id)
      fetchAllTimeData(employee.employee_id)
    }
  }, [employee, startDate])

  const fetchWageData = async (employeeId: string) => {
    try {
      // ดึงปีจาก startDate ที่เลือก
      const selectedYear = startDate ? new Date(startDate).getFullYear() : new Date().getFullYear()
      const res = await fetch(`/api/wages/employee-summary?employee_id=${employeeId}&year=${selectedYear}`)
      const data = await res.json()
      if (data.success) {
        setWageSummaries(data.data)
      }
    } catch (error) {
      console.error('Error fetching wage data:', error)
    }
  }

  const fetchYTDData = async (employeeId: string) => {
    try {
      // ดึงปีจาก startDate ที่เลือก
      const selectedYear = startDate ? new Date(startDate).getFullYear() : new Date().getFullYear()
      const response = await fetch(`/api/employees/${employeeId}/ytd?year=${selectedYear}`)
      const data = await response.json()
      if (data.success) {
        setYtdData(data.data)
      }
    } catch (error) {
      console.error('Error fetching YTD:', error)
    }
  }

  const fetchAllTimeData = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}/all-time-summary`)
      const data = await response.json()
      if (data.success) {
        setAllTimeData(data.data)
      }
    } catch (error) {
      console.error('Error fetching All-Time Data:', error)
    }
  }

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

        {/* Toggle Button for Wage Details */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <button
            onClick={() => setShowWageDetail(!showWageDetail)}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {showWageDetail ? 'ซ่อนรายละเอียดค่าจ้าง' : 'ดูรายละเอียดค่าจ้าง'}
          </button>
        </div>

        {/* Wage Details */}
        {showWageDetail && (
          <>
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">รายละเอียดค่าจ้างแต่ละงวด</h2>
              {wageSummaries.length === 0 ? (
                <p className="text-gray-600">ไม่มีข้อมูลค่าจ้าง</p>
              ) : (
                <div className="space-y-4">
                  {wageSummaries.map((wage, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="font-bold text-gray-900 mb-2">
                        {wage.month}/{wage.year + 543} - งวดที่ {wage.period}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>ค่าจ้างพื้นฐาน:</div>
                        <div className="text-right">{wage.base_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</div>
                        
                        <div>ค่า OT:</div>
                        <div className="text-right">{wage.ot_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</div>
                        
                        <div className="font-bold text-green-600">รวมรายได้:</div>
                        <div className="text-right font-bold text-green-600">
                          {wage.total_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
                        </div>
                        
                        <div className="text-red-600">หัก SSO:</div>
                        <div className="text-right text-red-600">
                          {wage.sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
                        </div>
                        
                        <div className="text-red-600 font-semibold">🏦 ภาษีเงินได้งวดนี้:</div>
                        <div className="text-right text-red-600 font-semibold">
                          {wage.tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
                        </div>
                        
                        <div className="font-bold text-gray-700">รวมหักทั้งหมด:</div>
                        <div className="text-right font-bold text-red-600">
                          {wage.total_deduction.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
                        </div>
                        
                        <div className="font-bold text-gray-900 border-t-2 border-gray-300 pt-2">เงินสุทธิ:</div>
                        <div className="text-right font-bold text-blue-600 text-lg border-t-2 border-gray-300 pt-2">
                          {wage.net_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* YTD Summary - ยอดสะสมทั้งปี */}
            {ytdData && (
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-2xl p-6 mb-6 text-white">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  📊 ยอดสะสมรายปี {new Date().getFullYear() + 543}
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg">
                    <span className="text-white">1. เงินเดือนสะสมทั้งปี</span>
                    <span className="font-bold">{ytdData.ytd_gross_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg">
                    <span className="text-white">2. ภาษีเงินได้สะสมทั้งปี</span>
                    <span className="font-bold">{ytdData.ytd_tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg">
                    <span className="text-white">3. ประกันสังคมสะสมทั้งปี</span>
                    <span className="font-bold">{ytdData.ytd_sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
                  </div>
                  <div className="flex justify-between p-3 bg-green-400 bg-opacity-40 backdrop-blur-sm rounded-lg border-2 border-green-300">
                    <span className="text-white font-bold">4. รวมเงินได้สะสมทั้งปี</span>
                    <span className="font-bold text-white">{ytdData.ytd_total_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
                  </div>
                  <div className="flex justify-between p-3 bg-red-400 bg-opacity-40 backdrop-blur-sm rounded-lg border-2 border-red-300">
                    <span className="text-white font-bold">5. รวมหักสะสมทั้งปี</span>
                    <span className="font-bold text-white">{ytdData.ytd_total_deduction.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
                  </div>
                  <div className="flex justify-between p-4 bg-yellow-300 rounded-lg border-3 border-yellow-400">
                    <span className="text-gray-900 font-bold text-lg">6. เงินได้สุทธิสะสมทั้งปี</span>
                    <span className="font-bold text-gray-900 text-xl">{ytdData.ytd_net_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
                  </div>
                </div>
              </div>
            )}

            {/* All-Time Summary - ยอดสะสมทั้งหมด */}
            {allTimeData && (
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-2xl p-6 mb-6 text-white">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  🌟 ยอดสะสมทั้งหมด (ตั้งแต่เริ่มทำงาน)
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg">
                    <span className="text-white">1. เงินเดือนสะสมทั้งหมด</span>
                    <span className="font-bold">{allTimeData.total_gross_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg">
                    <span className="text-white">2. ภาษีเงินได้สะสมทั้งหมด</span>
                    <span className="font-bold">{allTimeData.total_tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg">
                    <span className="text-white">3. ประกันสังคมสะสมทั้งหมด</span>
                    <span className="font-bold">{allTimeData.total_sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
                  </div>
                  <div className="flex justify-between p-3 bg-green-400 bg-opacity-40 backdrop-blur-sm rounded-lg border-2 border-green-300">
                    <span className="text-white font-bold">4. รวมเงินได้สะสมทั้งหมด</span>
                    <span className="font-bold text-white">{allTimeData.total_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
                  </div>
                  <div className="flex justify-between p-3 bg-red-400 bg-opacity-40 backdrop-blur-sm rounded-lg border-2 border-red-300">
                    <span className="text-white font-bold">5. รวมหักสะสมทั้งหมด</span>
                    <span className="font-bold text-white">{allTimeData.total_deduction.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
                  </div>
                  <div className="flex justify-between p-4 bg-green-300 rounded-lg border-3 border-green-400">
                    <span className="text-gray-900 font-bold text-lg">6. เงินได้สุทธิสะสมทั้งหมด</span>
                    <span className="font-bold text-gray-900 text-xl">{allTimeData.total_net_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
                  </div>
                  <div className="mt-4 p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg text-center">
                    <span className="text-sm">📌 ทำงานมาแล้ว: <strong className="text-lg">{allTimeData.total_periods} งวด</strong></span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

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
