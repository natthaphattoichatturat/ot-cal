'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import liff from '@line/liff'
import { LINE_CONFIG } from '@/lib/lineConfig'

interface Employee {
  id: number
  employee_id: string
  name: string
  department: string
  division_code?: string
  section_code?: string
  status: string
  created_at: string
}

export default function RemoveEmployeePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [searchText, setSearchText] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [currentUserName, setCurrentUserName] = useState('')

  useEffect(() => {
    initLiff()
  }, [])

  const initLiff = async () => {
    try {
      await liff.init({ liffId: LINE_CONFIG.liff.hrAdmin })

      if (!liff.isLoggedIn()) {
        liff.login()
        return
      }

      const profile = await liff.getProfile()
      setCurrentUserName(profile.displayName)

      // Check authorization
      const response = await fetch('/api/check-hr-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineUserId: profile.userId }),
      })
      const result = await response.json()

      if (!result.allowed) {
        alert('คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้')
        router.push('/liff/hr-admin')
        return
      }

      await fetchEmployees()
      setLoading(false)
    } catch (err) {
      console.error('LIFF initialization failed', err)
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      const result = await response.json()

      if (result.success) {
        setEmployees(result.data)
        setFilteredEmployees(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err)
    }
  }

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredEmployees(employees)
    } else {
      const filtered = employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchText.toLowerCase()) ||
          emp.employee_id.toLowerCase().includes(searchText.toLowerCase())
      )
      setFilteredEmployees(filtered)
    }
  }, [searchText, employees])

  const handleRemove = async (permanent: boolean = false) => {
    if (!selectedEmployee) return

    const confirmMessage = permanent
      ? `คำเตือน: ต้องการลบพนักงาน "${selectedEmployee.name}" ออกจากระบบถาวรหรือไม่?\n\nการกระทำนี้ไม่สามารถย้อนกลับได้!`
      : `ต้องการปลดพนักงาน "${selectedEmployee.name}" ออกจากระบบหรือไม่?\n\n(สามารถเปิดใช้งานอีกครั้งได้ในภายหลัง)`

    if (!confirm(confirmMessage)) return

    setProcessing(true)
    try {
      const response = await fetch('/api/employees', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: selectedEmployee.employee_id,
          removed_by: currentUserName,
          permanent,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert(permanent ? 'สำเร็จ: ลบพนักงานสำเร็จ' : 'สำเร็จ: ปลดพนักงานสำเร็จ')
        setSelectedEmployee(null)
        await fetchEmployees()
      } else {
        alert(`ผิดพลาด: เกิดข้อผิดพลาด: ${result.error}`)
      }
    } catch (err) {
      console.error('Failed to remove employee:', err)
      alert('ผิดพลาด: ไม่สามารถดำเนินการได้')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 shadow-lg">
        <div className="flex items-center mb-2">
          <button
            onClick={() => router.push('/liff/hr-admin')}
            className="mr-3 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold">ลบ/ปลดพนักงาน</h1>
            <p className="text-sm text-red-100">เลือกพนักงานที่ต้องการลบหรือปลด</p>
          </div>
        </div>
      </div>

      {!selectedEmployee ? (
        <>
          {/* Warning Notice */}
          <div className="p-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">คำเตือน:</span> การลบหรือปลดพนักงานเป็นการกระทำที่สำคัญ กรุณาตรวจสอบให้แน่ใจก่อนดำเนินการ
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 pb-4">
            <input
              type="text"
              placeholder="ค้นหาชื่อหรือรหัสพนักงาน..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Employee List */}
          <div className="px-4 pb-6 space-y-3">
            {filteredEmployees.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-md">
                <p className="text-gray-500">ไม่พบข้อมูลพนักงาน</p>
              </div>
            ) : (
              filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{emp.name}</h3>
                      <p className="text-sm text-gray-600">รหัส: {emp.employee_id}</p>
                      <p className="text-sm text-gray-600">แผนก: {emp.department}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          emp.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {emp.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                      </span>
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="p-4 pb-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                ยืนยันการลบ/ปลดพนักงาน
              </h2>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Employee Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">ชื่อ-สกุล</p>
                  <p className="font-semibold text-lg">{selectedEmployee.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">รหัสพนักงาน</p>
                    <p className="font-medium">{selectedEmployee.employee_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">แผนก</p>
                    <p className="font-medium">{selectedEmployee.department}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">สถานะปัจจุบัน</p>
                  <p className="font-medium">{selectedEmployee.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}</p>
                </div>
              </div>
            </div>

            {/* Action Info */}
            <div className="space-y-4 mb-6">
              <div className="border border-orange-300 bg-orange-50 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-orange-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-orange-900">ปลดพนักงาน (Soft Delete)</h3>
                    <p className="text-sm text-orange-700 mt-1">
                      เปลี่ยนสถานะเป็น "removed" แต่ยังคงข้อมูลไว้ในระบบ สามารถเปิดใช้งานอีกครั้งได้
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-red-300 bg-red-50 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-900">ลบถาวร (Permanent Delete)</h3>
                    <p className="text-sm text-red-700 mt-1">
                      ลบข้อมูลออกจากระบบอย่างถาวร <span className="font-semibold">ไม่สามารถกู้คืนได้</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleRemove(false)}
                disabled={processing}
                className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'กำลังดำเนินการ...' : 'ปลดพนักงาน (Soft Delete)'}
              </button>

              <button
                onClick={() => handleRemove(true)}
                disabled={processing}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'กำลังดำเนินการ...' : 'ลบถาวร (Permanent Delete)'}
              </button>

              <button
                onClick={() => setSelectedEmployee(null)}
                disabled={processing}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

