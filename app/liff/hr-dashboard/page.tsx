'use client'

import { useEffect, useState } from 'react'
import liff from '@line/liff'
import { LINE_CONFIG } from '@/lib/lineConfig'

interface DepartmentStats {
  name: string
  employees: number
  avgAttendance: number
  avgOT: number
  performanceScore: number
}

interface EmployeePerformance {
  employee_id: string
  name: string
  department: string
  attendance: number
  otHours: number
  performance: number
}

export default function HRDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [permissionError, setPermissionError] = useState<string>('')
  const [selectedView, setSelectedView] = useState<'overview' | 'department' | 'employee'>('overview')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')
  const [departments, setDepartments] = useState<DepartmentStats[]>([])
  const [topPerformers, setTopPerformers] = useState<EmployeePerformance[]>([])
  const [needsAttention, setNeedsAttention] = useState<EmployeePerformance[]>([])

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: LINE_CONFIG.liff.hrDashboard })

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

        // Generate mock data
        generateMockData()
        setLoading(false)
      } catch (err) {
        console.error('LIFF initialization failed', err)
        setLoading(false)
      }
    }

    initLiff()
  }, [])

  const generateMockData = () => {
    // Mock department stats
    const mockDepts: DepartmentStats[] = [
      { name: 'ผลิต', employees: 45, avgAttendance: 94, avgOT: 12.5, performanceScore: 88 },
      { name: 'บัญชี', employees: 12, avgAttendance: 96, avgOT: 8.2, performanceScore: 92 },
      { name: 'ขาย', employees: 20, avgAttendance: 89, avgOT: 15.3, performanceScore: 85 },
      { name: 'IT', employees: 8, avgAttendance: 92, avgOT: 18.7, performanceScore: 90 },
      { name: 'admin_etec', employees: 5, avgAttendance: 98, avgOT: 5.1, performanceScore: 95 }
    ]
    setDepartments(mockDepts)

    // Mock top performers
    const mockTop: EmployeePerformance[] = [
      { employee_id: 'EMP001', name: 'สมชาย ใจดี', department: 'บัญชี', attendance: 100, otHours: 8.5, performance: 95 },
      { employee_id: 'EMP002', name: 'สมหญิง รักดี', department: 'IT', attendance: 98, otHours: 20.2, performance: 93 },
      { employee_id: 'EMP003', name: 'นพดล สมศรี', department: 'admin_etec', attendance: 100, otHours: 5.0, performance: 92 }
    ]
    setTopPerformers(mockTop)

    // Mock needs attention
    const mockAttention: EmployeePerformance[] = [
      { employee_id: 'EMP025', name: 'สมศักดิ์ น้อยใจ', department: 'ขาย', attendance: 78, otHours: 2.1, performance: 68 },
      { employee_id: 'EMP033', name: 'พิมพ์ใจ สายเกิน', department: 'ผลิต', attendance: 82, otHours: 15.8, performance: 72 }
    ]
    setNeedsAttention(mockAttention)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-50'
    if (score >= 80) return 'bg-blue-50'
    if (score >= 70) return 'bg-yellow-50'
    return 'bg-red-50'
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

  if (permissionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-gray-600 mb-4">{permissionError}</p>
          <p className="text-sm text-gray-500">
            ระบบนี้เฉพาะพนักงานแผนก admin_etec เท่านั้น
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard HR</h1>
              <p className="text-sm text-gray-600">รายงานการทำงานของพนักงานโดยรวม</p>
              <p className="text-xs text-gray-500">วิเคราะห์โดย AI</p>
            </div>
          </div>

          {/* View Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedView === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ภาพรวม
            </button>
            <button
              onClick={() => setSelectedView('department')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedView === 'department'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              แยกตามแผนก
            </button>
            <button
              onClick={() => setSelectedView('employee')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedView === 'employee'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              รายบุคคล
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        {selectedView === 'overview' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-4">
                <p className="text-sm text-gray-600 mb-1">พนักงานทั้งหมด</p>
                <p className="text-3xl font-bold text-blue-900">
                  {departments.reduce((sum, d) => sum + d.employees, 0)}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <p className="text-sm text-gray-600 mb-1">การเข้างานเฉลี่ย</p>
                <p className="text-3xl font-bold text-green-600">
                  {(departments.reduce((sum, d) => sum + d.avgAttendance, 0) / departments.length).toFixed(1)}%
                </p>
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <p className="text-sm text-gray-600 mb-1">OT เฉลี่ย</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {(departments.reduce((sum, d) => sum + d.avgOT, 0) / departments.length).toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">ชม./คน</p>
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <p className="text-sm text-gray-600 mb-1">Performance</p>
                <p className="text-3xl font-bold text-blue-600">
                  {(departments.reduce((sum, d) => sum + d.performanceScore, 0) / departments.length).toFixed(1)}
                </p>
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">พนักงานยอดเยี่ยม</h2>
              </div>
              <div className="space-y-3">
                {topPerformers.map((emp, index) => (
                  <div key={emp.employee_id} className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{emp.name}</p>
                      <p className="text-sm text-gray-600">{emp.employee_id} - {emp.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{emp.performance}</p>
                      <p className="text-xs text-gray-500">คะแนน</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Needs Attention */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">ควรติดตามเป็นพิเศษ</h2>
              </div>
              <div className="space-y-3">
                {needsAttention.map((emp) => (
                  <div key={emp.employee_id} className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{emp.name}</p>
                      <p className="text-sm text-gray-600">{emp.employee_id} - {emp.department}</p>
                      <p className="text-xs text-gray-500">การเข้างาน: {emp.attendance}%</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-600">{emp.performance}</p>
                      <p className="text-xs text-gray-500">คะแนน</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Department View */}
        {selectedView === 'department' && (
          <div className="space-y-4">
            {departments.map((dept) => (
              <div key={dept.name} className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{dept.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`${getScoreBg(dept.avgAttendance)} rounded-lg p-4`}>
                    <p className="text-sm text-gray-600 mb-1">พนักงาน</p>
                    <p className="text-2xl font-bold text-gray-900">{dept.employees}</p>
                    <p className="text-xs text-gray-500">คน</p>
                  </div>
                  <div className={`${getScoreBg(dept.avgAttendance)} rounded-lg p-4`}>
                    <p className="text-sm text-gray-600 mb-1">การเข้างาน</p>
                    <p className={`text-2xl font-bold ${getScoreColor(dept.avgAttendance)}`}>
                      {dept.avgAttendance}%
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">OT เฉลี่ย</p>
                    <p className="text-2xl font-bold text-indigo-600">{dept.avgOT}</p>
                    <p className="text-xs text-gray-500">ชม./คน</p>
                  </div>
                  <div className={`${getScoreBg(dept.performanceScore)} rounded-lg p-4`}>
                    <p className="text-sm text-gray-600 mb-1">Performance</p>
                    <p className={`text-2xl font-bold ${getScoreColor(dept.performanceScore)}`}>
                      {dept.performanceScore}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Employee View */}
        {selectedView === 'employee' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ข้อมูลรายบุคคล</h2>
            <p className="text-gray-600 mb-4">เลือกแผนกเพื่อดูรายละเอียดพนักงาน</p>
            <div className="space-y-2">
              {departments.map((dept) => (
                <button
                  key={dept.name}
                  onClick={() => setSelectedDepartment(dept.name)}
                  className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">{dept.name}</span>
                    <span className="text-sm text-gray-600">{dept.employees} คน</span>
                  </div>
                </button>
              ))}
            </div>
            {selectedDepartment && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  กำลังแสดงข้อมูลแผนก {selectedDepartment} - ในเวอร์ชันเต็ม จะแสดงรายละเอียดพนักงานแต่ละคน
                </p>
              </div>
            )}
          </div>
        )}

        {/* AI Insights */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">AI Insights</h2>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="font-medium text-purple-900 mb-2">แนวโน้มการทำงาน</p>
              <p className="text-sm text-gray-700">
                การเข้างานในเดือนนี้ดีขึ้น 3% เมื่อเทียบกับเดือนที่แล้ว โดยเฉพาะแผนกบัญชีและ IT
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="font-medium text-purple-900 mb-2">คำแนะนำ</p>
              <p className="text-sm text-gray-700">
                พนักงานแผนกขายมี OT สูง (15.3 ชม./คน) แนะนำให้พิจารณาเพิ่มกำลังคนหรือปรับโครงสร้างงาน
              </p>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>หมายเหตุ:</strong> ข้อมูลนี้เป็นการวิเคราะห์โดยระบบ AI เพื่อให้ภาพรวมการทำงานของพนักงาน
            สำหรับการตัดสินใจที่สำคัญ ควรพิจารณาร่วมกับข้อมูลอื่นๆ ประกอบ
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>ระบบรายงานการทำงาน HR</p>
          <p>© 2025 E-Cloud Technology</p>
        </div>
      </div>
    </div>
  )
}
