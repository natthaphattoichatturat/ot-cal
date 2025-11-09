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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}></div>
        <p style={{ color: 'white', marginTop: '20px', fontSize: '16px' }}>
          กำลังโหลด...
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px 30px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center',
      }}>
        {processing ? (
          <>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid #e0e0e0',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px',
            }}></div>
            <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '10px' }}>
              กำลังบันทึกข้อมูล...
            </h2>
            <p style={{ color: '#666', fontSize: '14px' }}>
              กรุณารอสักครู่
            </p>
          </>
        ) : message ? (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#4CAF50',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{ color: '#4CAF50', fontSize: '22px', marginBottom: '15px', fontWeight: 'bold' }}>
              สำเร็จ!
            </h2>
            <p style={{ color: '#333', fontSize: '16px', lineHeight: '1.6' }}>
              {message}
            </p>
            <p style={{ color: '#999', fontSize: '13px', marginTop: '15px' }}>
              หน้าต่างจะปิดอัตโนมัติ...
            </p>
          </>
        ) : error ? (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#f44336',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6L18 18" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 style={{ color: '#f44336', fontSize: '22px', marginBottom: '15px', fontWeight: 'bold' }}>
              เกิดข้อผิดพลาด
            </h2>
            <p style={{ color: '#333', fontSize: '16px', lineHeight: '1.6' }}>
              {error}
            </p>
            <button
              onClick={() => liff.closeWindow()}
              style={{
                marginTop: '20px',
                padding: '12px 30px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
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
