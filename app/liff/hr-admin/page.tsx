'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import liff from '@line/liff'
import { LINE_CONFIG } from '@/lib/lineConfig'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function HRAdminLandingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [userName, setUserName] = useState('')

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
      setUserName(profile.displayName)

      // Check authorization - use line_id_hr for HR LINE OA
      const { data: employee } = await supabase
        .from('employees')
        .select('department')
        .eq('line_id_hr', profile.userId)
        .single()

      if (employee && employee.department === 'admin_etec') {
        setAuthorized(true)
      } else {
        setAuthorized(false)
      }

      setLoading(false)
    } catch (err) {
      console.error('LIFF initialization failed', err)
      setLoading(false)
    }
  }

  const navigateTo = (path: string) => {
    router.push(path)
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingBox}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>กำลังโหลด...</p>
        </div>
        <style jsx>{spinnerKeyframes}</style>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <div style={styles.errorIcon}>🚫</div>
          <h2 style={styles.errorTitle}>ไม่มีสิทธิ์เข้าใช้งาน</h2>
          <p style={styles.errorText}>
            คุณไม่มีสิทธิ์ในการเข้าถึงระบบจัดการพนักงาน
            <br />
            กรุณาติดต่อผู้ดูแลระบบ
          </p>
          <button onClick={() => liff.closeWindow()} style={styles.closeButton}>
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>ระบบจัดการพนักงาน</h1>
        <p style={styles.headerSubtitle}>สวัสดี {userName}</p>
      </div>

      {/* Menu Grid */}
      <div style={styles.menuGrid}>
        {/* ดูรายละเอียดพนักงาน */}
        <div style={styles.menuCard} onClick={() => navigateTo('/liff/hr-admin/employees')}>
          <div style={{...styles.menuIcon, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            👥
          </div>
          <h3 style={styles.menuTitle}>ดูรายละเอียดพนักงาน</h3>
          <p style={styles.menuDescription}>ดูข้อมูลและรายชื่อพนักงาน</p>
        </div>

        {/* แก้ไขข้อมูลพนักงาน */}
        <div style={styles.menuCard} onClick={() => navigateTo('/liff/hr-admin/edit')}>
          <div style={{...styles.menuIcon, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
            ✏️
          </div>
          <h3 style={styles.menuTitle}>แก้ไขข้อมูลพนักงาน</h3>
          <p style={styles.menuDescription}>แก้ไขข้อมูลพนักงานที่มีอยู่</p>
        </div>

        {/* เพิ่มพนักงาน */}
        <div style={styles.menuCard} onClick={() => navigateTo('/liff/hr-admin/add')}>
          <div style={{...styles.menuIcon, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
            ➕
          </div>
          <h3 style={styles.menuTitle}>เพิ่มพนักงาน</h3>
          <p style={styles.menuDescription}>เพิ่มพนักงานใหม่เข้าระบบ</p>
        </div>

        {/* ลบพนักงาน */}
        <div style={styles.menuCard} onClick={() => navigateTo('/liff/hr-admin/remove')}>
          <div style={{...styles.menuIcon, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}}>
            🗑️
          </div>
          <h3 style={styles.menuTitle}>ลบพนักงาน</h3>
          <p style={styles.menuDescription}>ลบหรือปลดพนักงานออกจากระบบ</p>
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  loadingBox: {
    background: 'white',
    borderRadius: '20px',
    padding: '60px 40px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e0e0e0',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
  },
  loadingText: {
    color: '#666',
    fontSize: '16px',
  },
  errorBox: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px 30px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  errorIcon: {
    fontSize: '80px',
    marginBottom: '20px',
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '12px',
  },
  errorText: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  closeButton: {
    padding: '12px 30px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    color: 'white',
  },
  headerTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  headerSubtitle: {
    fontSize: '16px',
    opacity: 0.9,
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  menuCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px 16px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  menuIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px',
    margin: '0 auto 12px',
  },
  menuTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '6px',
  },
  menuDescription: {
    fontSize: '13px',
    color: '#999',
    lineHeight: '1.4',
  },
}

const spinnerKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`
