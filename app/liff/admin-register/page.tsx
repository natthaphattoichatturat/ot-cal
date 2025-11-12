'use client'

import { useState, useEffect } from 'react'
import liff from '@line/liff'
import { LINE_CONFIG } from '@/lib/lineConfig'

export default function AdminRegisterPage() {
  const [liffReady, setLiffReady] = useState(false)
  const [lineUserId, setLineUserId] = useState('')
  const [displayName, setDisplayName] = useState('')

  const [step, setStep] = useState<'password' | 'register'>('password')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const [employeeId, setEmployeeId] = useState('')
  const [name, setName] = useState('')
  const [identityId, setIdentityId] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    initializeLiff()
  }, [])

  const initializeLiff = async () => {
    try {
      // Use HR LINE OA LIFF ID
      await liff.init({ liffId: LINE_CONFIG.liff.adminRegistration })

      if (!liff.isLoggedIn()) {
        liff.login()
        return
      }

      const profile = await liff.getProfile()
      setLineUserId(profile.userId)
      setDisplayName(profile.displayName)
      setName(profile.displayName) // Pre-fill name
      setLiffReady(true)
    } catch (error) {
      console.error('LIFF initialization failed:', error)
      setMessage('ไม่สามารถเชื่อมต่อกับ LINE ได้')
    }
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    // Hard-coded password check
    if (password === 'ecloude_tecHR2025!') {
      setStep('register')
      setPassword('')
    } else {
      setPasswordError('❌ รหัสผ่านไม่ถูกต้อง')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/line/register-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lineUserId,
          password: 'ecloude_tecHR2025!', // Send verified password
          employeeId,
          name,
          identityId,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        setMessage(`✅ ${result.message}\n\nยินดีต้อนรับคุณ ${result.admin.name}!\n\nคุณสามารถรับการแจ้งเตือนการลาจากพนักงานได้แล้ว`)
        // Clear form
        setEmployeeId('')
        setName(displayName)
        setIdentityId('')
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

  if (step === 'password') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🔐</div>
              <h1 className="text-3xl font-bold text-red-600 mb-2">
                Admin Registration
              </h1>
              <p className="text-gray-600 text-sm">
                กรุณาใส่รหัสผ่านเพื่อเข้าสู่หน้าลงทะเบียน
              </p>
            </div>

            {passwordError && (
              <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รหัสผ่าน Admin
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                🔓 ยืนยัน
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">👔</div>
            <h1 className="text-3xl font-bold text-purple-600 mb-2">
              ลงทะเบียน Admin/HR
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
                รหัสพนักงาน <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="กรอกรหัสพนักงาน"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'กำลังลงทะเบียน...' : '✅ ยืนยันลงทะเบียน Admin'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>หมายเหตุ:</strong> Admin จะได้รับการแจ้งเตือนคำขอลางานจากพนักงาน และสามารถอนุมัติหรือปฏิเสธได้
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>ระบบคำนวณชั่วโมง OT</p>
            <p>© 2025 E-Cloud Technology</p>
          </div>
        </div>
      </div>
    </div>
  )
}
