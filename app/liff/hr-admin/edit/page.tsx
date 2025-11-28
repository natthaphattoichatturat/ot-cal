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
  address?: string
  perday_salary?: number
  perhr_salary?: number
  bank_id?: number
  bank_account?: number
  identity_id?: string
  remarks?: string
  status: string
  // ข้อมูลส่วนตัว
  section?: string
  position?: string
  gender?: string
  nationality?: string
  citizenship?: string
  religion?: string
  birth_date?: string
  start_date?: string
  // ข้อมูลภาษีและประกัน
  tax_id?: string
  social_security?: string
  // กองทุนต่างๆ
  provident_fund?: number
  company_provident_fund?: number
  life_insurance?: number
  teacher_fund?: number
  housing_loan?: number
  rmf_fund?: number
  // เงินเดือนคงที่
  position_allowance?: number
  phone_allowance?: number
  other_allowance?: number
  defective_work_deduction?: number
  // ค่าลดหย่อนภาษี
  tax_allowance?: number
  spouse_allowance?: number
  child_allowance?: number
  number_of_children?: number
}

export default function EditEmployeePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [searchText, setSearchText] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState<Partial<Employee>>({})

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

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp)
    setFormData({
      name: emp.name,
      department: emp.department,
      division_code: emp.division_code,
      section_code: emp.section_code,
      address: emp.address,
      perday_salary: emp.perday_salary,
      perhr_salary: emp.perhr_salary,
      bank_id: emp.bank_id,
      bank_account: emp.bank_account,
      identity_id: emp.identity_id,
      remarks: emp.remarks,
    })
  }

  const handleSave = async () => {
    if (!selectedEmployee) return

    setSaving(true)
    try {
      const response = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedEmployee.id,
          updates: {
            ...formData,
            updated_at: new Date().toISOString(),
          },
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('สำเร็จ: บันทึกข้อมูลสำเร็จ')
        setSelectedEmployee(null)
        await fetchEmployees()
      } else {
        alert(`ผิดพลาด: เกิดข้อผิดพลาด: ${result.error}`)
      }
    } catch (err) {
      console.error('Failed to update employee:', err)
      alert('ผิดพลาด: ไม่สามารถบันทึกข้อมูลได้')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-6 shadow-lg">
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
            <h1 className="text-2xl font-bold">แก้ไขข้อมูลพนักงาน</h1>
            <p className="text-sm text-pink-100">เลือกพนักงานเพื่อแก้ไขข้อมูล</p>
          </div>
        </div>
      </div>

      {!selectedEmployee ? (
        <>
          {/* Search */}
          <div className="p-4">
            <input
              type="text"
              placeholder="ค้นหาชื่อหรือรหัสพนักงาน..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                  onClick={() => handleSelectEmployee(emp)}
                  className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{emp.name}</h3>
                      <p className="text-sm text-gray-600">รหัส: {emp.employee_id}</p>
                      <p className="text-sm text-gray-600">แผนก: {emp.department}</p>
                    </div>
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="p-4 pb-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                แก้ไข: {selectedEmployee.name}
              </h2>
              <button
                onClick={() => {
                  setSelectedEmployee(null)
                  setFormData({})
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสพนักงาน
                </label>
                <input
                  type="text"
                  value={selectedEmployee.employee_id}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อ-สกุล *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  แผนก *
                </label>
                <input
                  type="text"
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รหัสฝ่าย
                  </label>
                  <input
                    type="text"
                    value={formData.division_code || ''}
                    onChange={(e) => setFormData({ ...formData, division_code: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รหัสแผนก
                  </label>
                  <input
                    type="text"
                    value={formData.section_code || ''}
                    onChange={(e) => setFormData({ ...formData, section_code: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ที่อยู่
                </label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เงินเดือน/วัน
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.perday_salary || ''}
                    onChange={(e) => setFormData({ ...formData, perday_salary: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เงินเดือน/ชม.
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.perhr_salary || ''}
                    onChange={(e) => setFormData({ ...formData, perhr_salary: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เลขบัตรประชาชน
                </label>
                <input
                  type="text"
                  value={formData.identity_id || ''}
                  onChange={(e) => setFormData({ ...formData, identity_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รหัสธนาคาร
                  </label>
                  <input
                    type="number"
                    value={formData.bank_id || ''}
                    onChange={(e) => setFormData({ ...formData, bank_id: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เลขบัญชี
                  </label>
                  <input
                    type="number"
                    value={formData.bank_account || ''}
                    onChange={(e) => setFormData({ ...formData, bank_account: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หมายเหตุ
                </label>
                <textarea
                  value={formData.remarks || ''}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* ส่วนเพิ่มเติม - Collapsible */}
              <div className="border-t-2 border-gray-200 pt-4 mt-4">
                <details className="group">
                  <summary className="font-medium text-gray-900 cursor-pointer list-none flex items-center justify-between p-3 bg-pink-50 rounded-lg hover:bg-pink-100">
                    <span>ข้อมูลเพิ่มเติม (คลิกเพื่อเปิด/ปิด)</span>
                    <span className="transition group-open:rotate-180">⌄</span>
                  </summary>
                  
                  <div className="mt-4 space-y-4">
                    {/* Section 1: ข้อมูลส่วนตัว */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-3">ข้อมูลส่วนตัว</h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">แผนก/ฝ่าย</label>
                            <input type="text" value={formData.section || ''} onChange={(e) => setFormData({ ...formData, section: e.target.value })} placeholder="เช่น ฝ่ายผลิต" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง</label>
                            <input type="text" value={formData.position || ''} onChange={(e) => setFormData({ ...formData, position: e.target.value })} placeholder="เช่น พนักงาน" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">เพศ</label>
                          <select value={formData.gender || ''} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                            <option value="">-- เลือก --</option>
                            <option value="male">ชาย</option>
                            <option value="female">หญิง</option>
                            <option value="other">อื่นๆ</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">สัญชาติ</label>
                            <input type="text" value={formData.nationality || ''} onChange={(e) => setFormData({ ...formData, nationality: e.target.value })} placeholder="ไทย" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ศาสนา</label>
                            <input type="text" value={formData.religion || ''} onChange={(e) => setFormData({ ...formData, religion: e.target.value })} placeholder="พุทธ" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">วันเกิด</label>
                            <input type="date" value={formData.birth_date || ''} onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">วันเริ่มงาน</label>
                            <input type="date" value={formData.start_date || ''} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: ภาษีและประกัน */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-3">ภาษีและประกันสังคม</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">เลขประจำตัวผู้เสียภาษี</label>
                          <input type="text" maxLength={13} value={formData.tax_id || ''} onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })} placeholder="1234567890123" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">เลขประกันสังคม</label>
                          <input type="text" maxLength={20} value={formData.social_security || ''} onChange={(e) => setFormData({ ...formData, social_security: e.target.value })} placeholder="เลขประกันสังคม" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: ค่าตอบแทนคงที่ */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-3">ค่าตอบแทนคงที่</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ค่าตำแหน่ง</label>
                          <input type="number" step="0.01" value={formData.position_allowance || ''} onChange={(e) => setFormData({ ...formData, position_allowance: parseFloat(e.target.value) })} placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ค่าโทรศัพท์</label>
                          <input type="number" step="0.01" value={formData.phone_allowance || ''} onChange={(e) => setFormData({ ...formData, phone_allowance: parseFloat(e.target.value) })} placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                        </div>
                      </div>
                    </div>

                    {/* Section 4: กองทุน */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-3">กองทุนต่างๆ</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">กองทุนสำรองเลี้ยงชีพ</label>
                          <input type="number" step="0.01" value={formData.provident_fund || ''} onChange={(e) => setFormData({ ...formData, provident_fund: parseFloat(e.target.value) })} placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ประกันชีวิต</label>
                          <input type="number" step="0.01" value={formData.life_insurance || ''} onChange={(e) => setFormData({ ...formData, life_insurance: parseFloat(e.target.value) })} placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                        </div>
                      </div>
                    </div>

                    {/* Section 5: ค่าลดหย่อนภาษี */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-3">ค่าลดหย่อนภาษี</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ค่าลดหย่อนส่วนตัว</label>
                          <input type="number" step="0.01" value={formData.tax_allowance || 60000} onChange={(e) => setFormData({ ...formData, tax_allowance: parseFloat(e.target.value) })} placeholder="60000" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                          <small className="text-xs text-gray-600">ค่าเริ่มต้น 60,000 บาท/ปี</small>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนบุตร</label>
                            <input type="number" min="0" value={formData.number_of_children || 0} onChange={(e) => setFormData({ ...formData, number_of_children: parseInt(e.target.value) })} placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ค่าลดหย่อนบุตร</label>
                            <input type="number" step="0.01" value={formData.child_allowance || ''} onChange={(e) => setFormData({ ...formData, child_allowance: parseFloat(e.target.value) })} placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                            <small className="text-xs text-gray-600">30,000 บาท/คน</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setSelectedEmployee(null)
                  setFormData({})
                }}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.name || !formData.department}
                className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-medium hover:from-pink-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

