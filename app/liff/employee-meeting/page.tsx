'use client'

import { useEffect, useState } from 'react'
import liff from '@line/liff'
import { LINE_CONFIG } from '@/lib/lineConfig'

interface Employee {
  id: number
  employee_id: string
  name: string
  department: string
  line_id_employ: string | null
  status?: string
}

export default function EmployeeMeetingPage() {
  const [loading, setLoading] = useState(true)
  const [permissionError, setPermissionError] = useState<string>('')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [searchText, setSearchText] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingTime, setMeetingTime] = useState('')
  const [meetingTopic, setMeetingTopic] = useState('')
  const [meetingDetails, setMeetingDetails] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: LINE_CONFIG.liff.employeeMeeting })

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

        await fetchEmployees()
        setLoading(false)
      } catch (err) {
        console.error('LIFF initialization failed', err)
        setLoading(false)
      }
    }

    initLiff()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      const result = await response.json()

      if (result.success) {
        // Only show active employees
        const activeEmps = result.data.filter((emp: Employee) => emp.status === 'active')
        setEmployees(activeEmps)
        setFilteredEmployees(activeEmps)
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err)
    }
  }

  const filterEmployees = (text: string) => {
    setSearchText(text)
    if (!text) {
      setFilteredEmployees(employees)
      return
    }

    const filtered = employees.filter((emp) =>
      emp.name.toLowerCase().includes(text.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(text.toLowerCase()) ||
      emp.department.toLowerCase().includes(text.toLowerCase())
    )
    setFilteredEmployees(filtered)
  }

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp)
    setShowModal(true)
    setMessage('')
    setMeetingDate('')
    setMeetingTime('')
    setMeetingTopic('')
    setMeetingDetails('')
  }

  const handleSendMeeting = async () => {
    if (!selectedEmployee || !meetingDate || !meetingTime || !meetingTopic) {
      setMessage('กรุณากรอกข้อมูลให้ครบถ้วน')
      setSuccess(false)
      return
    }

    if (!selectedEmployee.line_id_employ) {
      setMessage('พนักงานคนนี้ยังไม่ได้ลงทะเบียน Employee LINE OA')
      setSuccess(false)
      return
    }

    setSending(true)
    setMessage('')

    try {
      const response = await fetch('/api/line/schedule-meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: selectedEmployee.employee_id,
          meeting_date: meetingDate,
          meeting_time: meetingTime,
          meeting_topic: meetingTopic,
          meeting_details: meetingDetails,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        setMessage('ส่งนัดหมายเรียบร้อยแล้ว')
        setTimeout(() => {
          setShowModal(false)
          setSelectedEmployee(null)
        }, 2000)
      } else {
        setSuccess(false)
        setMessage(result.error || 'เกิดข้อผิดพลาด')
      }
    } catch (err) {
      console.error('Failed to send meeting:', err)
      setSuccess(false)
      setMessage('เกิดข้อผิดพลาดในการส่งนัดหมาย')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '6px solid rgba(255,255,255,0.2)',
            borderTop: '6px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }}></div>
          <p style={{ color: 'white', fontSize: '18px', fontWeight: '500' }}>กำลังโหลดระบบ...</p>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '8px', fontSize: '14px' }}>โปรดรอสักครู่</p>
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">นัดหมายพนักงาน</h1>
              <p className="text-sm text-gray-600">เลือกพนักงานเพื่อนัดหมายคุยส่วนตัว</p>
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ค้นหาพนักงาน</label>
            <input
              type="text"
              value={searchText}
              onChange={(e) => filterEmployees(e.target.value)}
              placeholder="ชื่อ, รหัส, หรือแผนก"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-500">พบ {filteredEmployees.length} คน</p>
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">รายชื่อพนักงาน</h2>

          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">ไม่พบพนักงาน</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => handleSelectEmployee(emp)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {emp.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{emp.name}</p>
                      <p className="text-sm text-gray-600">{emp.employee_id}</p>
                      <p className="text-xs text-gray-500">{emp.department}</p>
                      {!emp.line_id_employ && (
                        <p className="text-xs text-red-500 mt-1">ยังไม่ได้ลงทะเบียน Employee LINE OA</p>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>ระบบนัดหมายพนักงาน</p>
          <p>© 2025 E-Cloud Technology</p>
        </div>
      </div>

      {/* Meeting Modal */}
      {showModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">นัดหมายพนักงาน</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedEmployee.name}</p>
                <p className="text-xs text-gray-500">{selectedEmployee.employee_id} - {selectedEmployee.department}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-lg ${success ? 'bg-blue-50 text-blue-900' : 'bg-red-50 text-red-900'}`}>
                <p className="text-sm">{message}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">วันที่นัดหมาย</label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เวลานัดหมาย</label>
                <input
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">หัวข้อที่ต้องการคุย</label>
                <input
                  type="text"
                  value={meetingTopic}
                  onChange={(e) => setMeetingTopic(e.target.value)}
                  placeholder="เช่น ปรับปรุงผลงาน, อบรม, โบนัส"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียดเพิ่มเติม (ถ้ามี)</label>
                <textarea
                  value={meetingDetails}
                  onChange={(e) => setMeetingDetails(e.target.value)}
                  placeholder="ระบุรายละเอียดหรือเอกสารที่ต้องเตรียม"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSendMeeting}
                  disabled={sending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {sending ? 'กำลังดำเนินการ...' : 'ส่งนัดหมาย'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
