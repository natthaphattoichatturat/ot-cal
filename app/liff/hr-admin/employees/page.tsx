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
  perday_salary?: number
  perhr_salary?: number
  bank_id?: number
  bank_account?: number
  identity_id?: string
  line_id_employ?: string
  line_id_hr?: string
  status: string
  created_at: string
}

export default function EmployeesListPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [searchText, setSearchText] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

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

      // Fetch employees
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
          emp.employee_id.toLowerCase().includes(searchText.toLowerCase()) ||
          emp.department.toLowerCase().includes(searchText.toLowerCase())
      )
      setFilteredEmployees(filtered)
    }
  }, [searchText, employees])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 shadow-lg">
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
            <h1 className="text-2xl font-bold">รายชื่อพนักงาน</h1>
            <p className="text-sm text-purple-100">ดูรายละเอียดพนักงานทั้งหมด</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <input
          type="text"
          placeholder="ค้นหาชื่อ, รหัส หรือแผนก..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Employee Count */}
      <div className="px-4 pb-2">
        <p className="text-sm text-gray-600">
          พบ {filteredEmployees.length} คน {searchText && `จากทั้งหมด ${employees.length} คน`}
        </p>
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
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{emp.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">รหัส: {emp.employee_id}</p>
                  <p className="text-sm text-gray-600">แผนก: {emp.department}</p>
                  {emp.division_code && (
                    <p className="text-xs text-gray-500 mt-1">
                      ฝ่าย: {emp.division_code} {emp.section_code && `| แผนก: ${emp.section_code}`}
                    </p>
                  )}
                </div>
                <div className="ml-3">
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      emp.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {emp.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedEmployee && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
          onClick={() => setSelectedEmployee(null)}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">ข้อมูลพนักงาน</h2>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">รหัสพนักงาน</p>
                  <p className="font-medium">{selectedEmployee.employee_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ชื่อ-สกุล</p>
                  <p className="font-medium">{selectedEmployee.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">แผนก</p>
                  <p className="font-medium">{selectedEmployee.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">สถานะ</p>
                  <p className="font-medium">{selectedEmployee.status}</p>
                </div>
                {selectedEmployee.division_code && (
                  <div>
                    <p className="text-sm text-gray-500">รหัสฝ่าย</p>
                    <p className="font-medium">{selectedEmployee.division_code}</p>
                  </div>
                )}
                {selectedEmployee.section_code && (
                  <div>
                    <p className="text-sm text-gray-500">รหัสแผนก</p>
                    <p className="font-medium">{selectedEmployee.section_code}</p>
                  </div>
                )}
                {selectedEmployee.perday_salary && (
                  <div>
                    <p className="text-sm text-gray-500">เงินเดือน/วัน</p>
                    <p className="font-medium">{selectedEmployee.perday_salary.toFixed(2)} บาท</p>
                  </div>
                )}
                {selectedEmployee.perhr_salary && (
                  <div>
                    <p className="text-sm text-gray-500">เงินเดือน/ชม.</p>
                    <p className="font-medium">{selectedEmployee.perhr_salary.toFixed(2)} บาท</p>
                  </div>
                )}
                {selectedEmployee.identity_id && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">เลขบัตรประชาชน</p>
                    <p className="font-medium">{selectedEmployee.identity_id}</p>
                  </div>
                )}
                {selectedEmployee.bank_id && (
                  <div>
                    <p className="text-sm text-gray-500">รหัสธนาคาร</p>
                    <p className="font-medium">{selectedEmployee.bank_id}</p>
                  </div>
                )}
                {selectedEmployee.bank_account && (
                  <div>
                    <p className="text-sm text-gray-500">เลขบัญชี</p>
                    <p className="font-medium">{selectedEmployee.bank_account}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">LINE ID (พนักงาน)</p>
                <p className="font-mono text-sm">
                  {selectedEmployee.line_id_employ || 'ยังไม่ได้ลงทะเบียน'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">LINE ID (HR)</p>
                <p className="font-mono text-sm">
                  {selectedEmployee.line_id_hr || 'ยังไม่ได้ลงทะเบียน'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">วันที่เพิ่มข้อมูล</p>
                <p className="text-sm">
                  {new Date(selectedEmployee.created_at).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedEmployee(null)}
              className="w-full mt-6 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

