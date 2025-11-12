'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Employee {
  id: number
  employee_id: string
  name: string
  department: string
  status: string
}

export default function SelectEmployeeToEditPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')

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

  const handleSelectEmployee = (employeeId: string) => {
    router.push(`/employees/${employeeId}`)
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">เลือกพนักงานที่ต้องการแก้ไข</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              คลิกที่พนักงานเพื่อแก้ไขข้อมูล
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => router.push('/employees')} className="btn btn-secondary">
              กลับหน้ารายชื่อ
            </button>
          </div>
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
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
          />
          <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
            พบ {filteredEmployees.length} คน
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
            ลองค้นหาด้วยคำอื่นหรือล้างช่องค้นหา
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              onClick={() => handleSelectEmployee(emp.employee_id)}
              className="card"
              style={{
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '2px solid var(--border-light)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = ''
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                <div style={{ fontSize: '24px', color: 'var(--text-muted)' }}>
                  →
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
