'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import liff from '@line/liff'
import { LINE_CONFIG } from '@/lib/lineConfig'

interface NewEmployeeForm {
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
}

export default function AddEmployeePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<NewEmployeeForm>({
    employee_id: '',
    name: '',
    department: '',
  })

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

      setLoading(false)
    } catch (err) {
      console.error('LIFF initialization failed', err)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.employee_id || !formData.name || !formData.department) {
      alert('⚠️ กรุณากรอกข้อมูลที่จำเป็น (รหัสพนักงาน, ชื่อ-สกุล, แผนก)')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        alert('✅ เพิ่มพนักงานสำเร็จ')
        setFormData({
          employee_id: '',
          name: '',
          department: '',
        })
        // Optionally redirect back
        // router.push('/liff/hr-admin')
      } else {
        alert(`❌ เกิดข้อผิดพลาด: ${result.error}`)
      }
    } catch (err) {
      console.error('Failed to add employee:', err)
      alert('❌ ไม่สามารถเพิ่มพนักงานได้')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('ต้องการล้างข้อมูลทั้งหมดหรือไม่?')) {
      setFormData({
        employee_id: '',
        name: '',
        department: '',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 shadow-lg">
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
            <h1 className="text-2xl font-bold">เพิ่มพนักงาน</h1>
            <p className="text-sm text-blue-100">เพิ่มพนักงานใหม่เข้าระบบ</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 pb-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-lg space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg mb-6">
            <p className="text-sm text-blue-800">
              <span className="font-medium">หมายเหตุ:</span> กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รหัสพนักงาน <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              placeholder="เช่น E001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อ-สกุล <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น สมชาย ใจดี"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              แผนก <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="เช่น ฝ่ายผลิต"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
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
                placeholder="เช่น 001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                placeholder="เช่น 001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              placeholder="ที่อยู่เต็ม..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เงินเดือน/วัน (บาท)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.perday_salary || ''}
                onChange={(e) => setFormData({ ...formData, perday_salary: parseFloat(e.target.value) || undefined })}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เงินเดือน/ชม. (บาท)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.perhr_salary || ''}
                onChange={(e) => setFormData({ ...formData, perhr_salary: parseFloat(e.target.value) || undefined })}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              placeholder="1234567890123"
              maxLength={13}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                onChange={(e) => setFormData({ ...formData, bank_id: parseInt(e.target.value) || undefined })}
                placeholder="เช่น 004"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เลขบัญชีธนาคาร
              </label>
              <input
                type="number"
                value={formData.bank_account || ''}
                onChange={(e) => setFormData({ ...formData, bank_account: parseInt(e.target.value) || undefined })}
                placeholder="1234567890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              placeholder="หมายเหตุเพิ่มเติม..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              ล้างข้อมูล
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'กำลังบันทึก...' : '➕ เพิ่มพนักงาน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

