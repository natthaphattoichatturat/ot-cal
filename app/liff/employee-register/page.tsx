'use client'

import { useState, useEffect } from 'react'

declare global {
  interface Window {
    liff: any
  }
}

export default function EmployeeRegisterPage() {
  const [liffReady, setLiffReady] = useState(false)
  const [lineUserId, setLineUserId] = useState('')
  const [displayName, setDisplayName] = useState('')

  const [identityId, setIdentityId] = useState('')
  const [name, setName] = useState('')
  const [employeeId, setEmployeeId] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Load LIFF SDK
    const script = document.createElement('script')
    script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js'
    script.async = true
    script.onload = initializeLiff
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const initializeLiff = async () => {
    try {
      await window.liff.init({ liffId: '2008436560-GMZNa4OA' })

      if (!window.liff.isLoggedIn()) {
        window.liff.login()
        return
      }

      const profile = await window.liff.getProfile()
      setLineUserId(profile.userId)
      setDisplayName(profile.displayName)
      setName(profile.displayName) // Pre-fill name
      setLiffReady(true)
    } catch (error) {
      console.error('LIFF initialization failed:', error)
      setMessage('ไม่สามารถเชื่อมต่อกับ LINE ได้')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/line/register-employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lineUserId,
          identityId,
          name,
          employeeId: employeeId || undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        setMessage(`✅ ${result.message}\n\nยินดีต้อนรับคุณ ${result.employee.name}!`)
        // Clear form
        setIdentityId('')
        setName(displayName)
        setEmployeeId('')
      } else {
        setSuccess(false)
        setMessage(`❌ ${result.error}`)
      }
    } catch (error) {
      console.error('Registration error:', error)
      setSuccess(false)
      setMessage('❌ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  if (!liffReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">
              📝 ลงทะเบียนพนักงาน
            </h1>
            <p className="text-gray-600 text-sm">
              สวัสดี {displayName}!
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                success
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <p className="whitespace-pre-line">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลขบัตรประชาชน <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={identityId}
                onChange={(e) => setIdentityId(e.target.value)}
                placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
                required
                maxLength={13}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อ-นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="กรอกชื่อ-นามสกุล"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รหัสพนักงาน <span className="text-gray-400">(ถ้ามี)</span>
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="กรอกรหัสพนักงาน (ไม่บังคับ)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                หากไม่ทราบรหัส ระบบจะค้นหาจากเลขบัตรประชาชน
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'กำลังลงทะเบียน...' : '✅ ยืนยันลงทะเบียน'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>ระบบคำนวณชั่วโมง OT</p>
            <p>© 2025 E-Cloud Technology</p>
          </div>
        </div>
      </div>
    </div>
  )
}
