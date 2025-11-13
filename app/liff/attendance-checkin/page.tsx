'use client'

import { useEffect, useState } from 'react'
import liff from '@line/liff'
import { LINE_CONFIG } from '@/lib/lineConfig'

export default function AttendanceCheckinPage() {
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [lineUserId, setLineUserId] = useState('')
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    // Initialize LIFF
    const initLiff = async () => {
      try {
        await liff.init({ liffId: LINE_CONFIG.liff.attendanceCheckin })

        if (!liff.isLoggedIn()) {
          liff.login()
          return
        }

        // Get LINE user ID
        const profile = await liff.getProfile()
        setLineUserId(profile.userId)

        // Get GPS location
        getGPSLocation()

        setLoading(false)
      } catch (err) {
        console.error('LIFF initialization failed', err)
        setError('ไม่สามารถเริ่มต้นระบบได้ กรุณาลองใหม่อีกครั้ง')
        setLoading(false)
      }
    }

    initLiff()
  }, [])

  const getGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('GPS error:', error)
          // Continue without GPS if user denies permission
          setGpsLocation(null)
        }
      )
    }
  }

  useEffect(() => {
    // Auto-submit when LINE user ID is ready
    if (lineUserId && !processing) {
      handleCheckin()
    }
  }, [lineUserId])

  const handleCheckin = async () => {
    if (processing) return

    setProcessing(true)
    setMessage('')
    setError('')

    try {
      const gpsString = gpsLocation
        ? `${gpsLocation.lat},${gpsLocation.lng}`
        : null

      const response = await fetch('/api/line/attendance-checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lineUserId,
          gpsLocation: gpsString,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message)

        // Close LIFF window after 2 seconds
        setTimeout(() => {
          liff.closeWindow()
        }, 2000)
      } else {
        setError(result.error || 'เกิดข้อผิดพลาด')
      }
    } catch (err) {
      console.error('Check-in error:', err)
      setError('ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '5px solid rgba(255,255,255,0.2)',
          borderTop: '5px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}></div>
        <p style={{ color: 'white', marginTop: '24px', fontSize: '18px', fontWeight: '500' }}>
          กำลังโหลดระบบ...
        </p>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '8px', fontSize: '14px' }}>
          โปรดรอสักครู่
        </p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '48px 36px',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        textAlign: 'center',
      }}>
        {processing ? (
          <>
            <div style={{
              width: '72px',
              height: '72px',
              border: '5px solid #e5e7eb',
              borderTop: '5px solid #10b981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 24px',
            }}></div>
            <h2 style={{ color: '#1f2937', fontSize: '22px', marginBottom: '12px', fontWeight: '600' }}>
              กำลังดำเนินการ
            </h2>
            <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.6' }}>
              กรุณารอสักครู่ ระบบกำลังบันทึกข้อมูลการเข้างานของท่าน
            </p>
          </>
        ) : message ? (
          <>
            <div style={{
              width: '96px',
              height: '96px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
            }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{ color: '#10b981', fontSize: '24px', marginBottom: '16px', fontWeight: '700' }}>
              บันทึกสำเร็จ
            </h2>
            <div style={{
              background: '#f0fdf4',
              border: '2px solid #bbf7d0',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <p style={{ color: '#166534', fontSize: '15px', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {message}
              </p>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '13px', fontWeight: '500' }}>
              หน้าต่างจะปิดอัตโนมัติในอีกสักครู่
            </p>
          </>
        ) : error ? (
          <>
            <div style={{
              width: '96px',
              height: '96px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)',
            }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6L18 18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 style={{ color: '#ef4444', fontSize: '24px', marginBottom: '16px', fontWeight: '700' }}>
              พบข้อผิดพลาด
            </h2>
            <div style={{
              background: '#fef2f2',
              border: '2px solid #fecaca',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <p style={{ color: '#991b1b', fontSize: '15px', lineHeight: '1.7' }}>
                {error}
              </p>
            </div>
            <button
              onClick={() => liff.closeWindow()}
              style={{
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                transition: 'transform 0.2s ease',
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              ปิดหน้าต่าง
            </button>
          </>
        ) : null}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
