'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Employee {
  id: number
  employee_id: string
  name: string
  department: string
  division_code: string | null
  section_code: string | null
  address: string | null
  identity_id: string | null
  line_id: string | null
  status: string
  created_at: string
}

export default function EmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchName, setSearchName] = useState('')
  const [searchId, setSearchId] = useState('')

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    filterEmployees()
  }, [searchName, searchId, employees])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/employees')
      const result = await response.json()
      if (result.success) {
        setEmployees(result.data)
        setFilteredEmployees(result.data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterEmployees = () => {
    let filtered = employees

    if (searchName) {
      filtered = filtered.filter((emp) =>
        emp.name.toLowerCase().includes(searchName.toLowerCase())
      )
    }

    if (searchId) {
      filtered = filtered.filter((emp) =>
        emp.employee_id.toLowerCase().includes(searchId.toLowerCase())
      )
    }

    setFilteredEmployees(filtered)
  }

  const handleRowClick = (employeeId: string) => {
    router.push(`/employees/${employeeId}`)
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">จัดการข้อมูลพนักงาน</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              รายชื่อพนักงานทั้งหมด {filteredEmployees.length} คน
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <a href="/employees/import" className="btn btn-secondary">
              📥 Import พนักงาน
            </a>
            <a href="/employees/add" className="btn btn-primary">
              ➕ เพิ่มพนักงาน
            </a>
            <a href="/" className="btn btn-secondary">
              กลับหน้าหลัก
            </a>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            ค้นหาพนักงาน
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                ค้นหาจากชื่อ
              </label>
              <input
                type="text"
                placeholder="พิมพ์ชื่อพนักงาน..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                ค้นหาจากรหัส
              </label>
              <input
                type="text"
                placeholder="พิมพ์รหัสพนักงาน..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="table-container">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
            รายชื่อพนักงาน
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            <p style={{ color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1 }}>
                <tr>
                  <th>รหัสพนักงาน</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>แผนก</th>
                  <th>รหัสฝ่าย</th>
                  <th>รหัสแผนก</th>
                  <th>เลขบัตรประชาชน</th>
                  <th>ที่อยู่</th>
                  <th>LINE ID</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      ไม่พบข้อมูลพนักงาน
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      onClick={() => handleRowClick(emp.employee_id)}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = ''
                      }}
                    >
                      <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                        {emp.employee_id}
                      </td>
                      <td>{emp.name}</td>
                      <td>{emp.department}</td>
                      <td style={{ textAlign: 'center' }}>{emp.division_code || '-'}</td>
                      <td style={{ textAlign: 'center' }}>{emp.section_code || '-'}</td>
                      <td style={{ textAlign: 'center' }}>{emp.identity_id || '-'}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {emp.address || '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {emp.line_id ? '✓' : '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`badge ${
                            emp.status === 'active'
                              ? 'badge-success'
                              : emp.status === 'removed'
                              ? 'badge-error'
                              : 'badge-warning'
                          }`}
                        >
                          {emp.status === 'active'
                            ? 'ใช้งาน'
                            : emp.status === 'removed'
                            ? 'ปลด'
                            : 'ระงับ'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
