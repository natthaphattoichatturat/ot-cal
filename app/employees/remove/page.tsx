'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Employee {
  id: number
  employee_id: string
  name: string
  department: string
  status: string
  identity_id: string | null
  line_id: string | null
}

export default function RemoveEmployeePage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [removedBy, setRemovedBy] = useState('')
  const [removing, setRemoving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    filterEmployees()
  }, [searchText, employees])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/employees')
      const result = await response.json()
      if (result.success) {
        // Only show active employees
        const activeEmployees = result.data.filter((emp: Employee) => emp.status === 'active')
        setEmployees(activeEmployees)
        setFilteredEmployees(activeEmployees)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterEmployees = () => {
    if (!searchText) {
      setFilteredEmployees(employees)
      return
    }

    const filtered = employees.filter((emp) =>
      emp.name.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchText.toLowerCase())
    )

    setFilteredEmployees(filtered)
  }

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp)
    setShowConfirmModal(true)
    setMessage('')
  }

  const handleCancelRemove = () => {
    setShowConfirmModal(false)
    setSelectedEmployee(null)
    setRemovedBy('')
  }

  const handleConfirmRemove = async () => {
    if (!selectedEmployee) return

    setRemoving(true)
    setMessage('')

    try {
      const response = await fetch('/api/employees', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: selectedEmployee.employee_id,
          removed_by: removedBy || 'System',
          permanent: false, // Soft delete
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage('✓ ปลดพนักงานสำเร็จ')
        // Refresh list
        await fetchEmployees()
        // Close modal after delay
        setTimeout(() => {
          handleCancelRemove()
          setMessage('')
        }, 2000)
      } else {
        setMessage(`✗ ${result.error}`)
      }
    } catch (error) {
      setMessage('✗ เกิดข้อผิดพลาดในการปลดพนักงาน')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">ลบ/ปลดพนักงาน</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              เลือกพนักงานที่ต้องการปลดออกจากระบบ
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => router.push('/employees')} className="btn btn-secondary">
              กลับหน้ารายชื่อ
            </button>
          </div>
        </div>
      </div>

      {/* Warning Alert */}
      <div style={{
        padding: '16px 20px',
        background: 'rgba(244, 67, 54, 0.1)',
        border: '2px solid rgba(244, 67, 54, 0.3)',
        borderRadius: '8px',
        marginBottom: '24px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}>
        <div style={{ fontSize: '24px' }}>⚠️</div>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#d32f2f', marginBottom: '4px' }}>
            คำเตือน
          </h3>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
            การปลดพนักงานจะเปลี่ยนสถานะเป็น "ปลด" แต่ข้อมูลจะยังอยู่ในระบบ (Soft Delete)
            <br />
            ข้อมูลประวัติการทำงานและ OT ของพนักงานจะยังคงสามารถดูได้
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ padding: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            🔍 ค้นหาพนักงาน (ชื่อ, รหัส, หรือแผนก)
          </label>
          <input
            type="text"
            placeholder="พิมพ์เพื่อค้นหา..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid var(--border-light)',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
            }}
          />
          <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
            พบ {filteredEmployees.length} คน (เฉพาะที่ยังทำงานอยู่)
          </p>
        </div>
      </div>

      {/* Employee Cards */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>
            ไม่พบพนักงาน
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            ลองค้นหาด้วยคำอื่นหรือไม่มีพนักงานที่ยังทำงานอยู่
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="card"
              style={{
                padding: '20px',
                border: '2px solid var(--border-light)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                  }}
                >
                  {emp.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {emp.name}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--primary)', marginBottom: '4px', fontWeight: '500' }}>
                    {emp.employee_id}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {emp.department}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleSelectEmployee(emp)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#d32f2f'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f44336'}
              >
                🗑️ ปลดพนักงาน
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedEmployee && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={handleCancelRemove}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#d32f2f', marginBottom: '8px' }}>
                ยืนยันการปลดพนักงาน
              </h2>
              <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>
                คุณต้องการปลดพนักงานคนนี้ออกจากระบบใช่หรือไม่?
              </p>
            </div>

            {/* Employee Info */}
            <div style={{
              padding: '16px',
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
              marginBottom: '24px',
            }}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>ชื่อ:</span>
                <span style={{ fontSize: '16px', fontWeight: '600', marginLeft: '8px' }}>
                  {selectedEmployee.name}
                </span>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>รหัสพนักงาน:</span>
                <span style={{ fontSize: '16px', fontWeight: '600', marginLeft: '8px', color: 'var(--primary)' }}>
                  {selectedEmployee.employee_id}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>แผนก:</span>
                <span style={{ fontSize: '16px', fontWeight: '600', marginLeft: '8px' }}>
                  {selectedEmployee.department}
                </span>
              </div>
            </div>

            {/* Removed By Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                ผู้ดำเนินการ (ไม่บังคับ)
              </label>
              <input
                type="text"
                placeholder="ชื่อผู้ดำเนินการ"
                value={removedBy}
                onChange={(e) => setRemovedBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              />
            </div>

            {/* Message */}
            {message && (
              <div
                className={`message ${message.startsWith('✓') ? 'message-success' : 'message-error'}`}
                style={{ marginBottom: '16px' }}
              >
                {message}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleCancelRemove}
                disabled={removing}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmRemove}
                disabled={removing}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  opacity: removing ? 0.6 : 1,
                }}
              >
                {removing ? 'กำลังดำเนินการ...' : '✓ ยืนยันปลดพนักงาน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
