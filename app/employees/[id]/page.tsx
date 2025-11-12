'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Employee {
  id: number
  employee_id: string
  name: string
  department: string
  division_code: string | null
  section_code: string | null
  address: string | null
  perday_salary: number | null
  perhr_salary: number | null
  bank_id: number | null
  bank_account: number | null
  identity_id: string | null
  line_id: string | null
  status: string
  remarks: string | null
  created_at: string
  updated_at: string
}

export default function EmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState<Partial<Employee>>({})

  useEffect(() => {
    if (params.id) {
      fetchEmployee(params.id as string)
    }
  }, [params.id])

  const fetchEmployee = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/employees/${id}`)
      const result = await response.json()
      if (result.success) {
        setEmployee(result.data)
        setFormData(result.data)
      }
    } catch (error) {
      console.error('Error fetching employee:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
    setMessage('')
  }

  const handleCancel = () => {
    setEditing(false)
    setFormData(employee!)
    setMessage('')
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: employee!.id,
          updates: {
            name: formData.name,
            department: formData.department,
            division_code: formData.division_code,
            section_code: formData.section_code,
            address: formData.address,
            identity_id: formData.identity_id,
            line_id: formData.line_id,
            perday_salary: formData.perday_salary,
            perhr_salary: formData.perhr_salary,
            bank_id: formData.bank_id,
            bank_account: formData.bank_account,
            remarks: formData.remarks,
          },
        }),
      })

      const result = await response.json()

      if (result.success) {
        setEmployee(result.data)
        setFormData(result.data)
        setEditing(false)
        setMessage('✓ บันทึกข้อมูลสำเร็จ')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(`✗ ${result.error}`)
      }
    } catch (error) {
      setMessage('✗ เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Employee, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="app-container">
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="app-container">
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <h2>ไม่พบข้อมูลพนักงาน</h2>
          <button onClick={() => router.push('/employees')} className="btn btn-primary" style={{ marginTop: '20px' }}>
            กลับหน้ารายชื่อ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">ข้อมูลพนักงาน</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              รหัส: {employee.employee_id}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {!editing && (
              <button onClick={handleEdit} className="btn btn-primary">
                ✏️ แก้ไขข้อมูล
              </button>
            )}
            <button onClick={() => router.push('/employees')} className="btn btn-secondary">
              กลับหน้ารายชื่อ
            </button>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`message ${
            message.startsWith('✓') ? 'message-success' : 'message-error'
          }`}
          style={{ marginBottom: '24px' }}
        >
          {message}
        </div>
      )}

      {/* Employee Details */}
      <div className="card">
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* รหัสพนักงาน (ไม่สามารถแก้ไข) */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                รหัสพนักงาน
              </label>
              <input
                type="text"
                value={employee.employee_id}
                disabled
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-muted)',
                }}
              />
            </div>

            {/* ชื่อ-นามสกุล */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                ชื่อ-นามสกุล <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={!editing}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  backgroundColor: editing ? 'white' : 'var(--bg-secondary)',
                }}
              />
            </div>

            {/* แผนก */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                แผนก <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.department || ''}
                onChange={(e) => handleChange('department', e.target.value)}
                disabled={!editing}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  backgroundColor: editing ? 'white' : 'var(--bg-secondary)',
                }}
              />
            </div>

            {/* รหัสฝ่าย */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                รหัสฝ่าย
              </label>
              <input
                type="text"
                value={formData.division_code || ''}
                onChange={(e) => handleChange('division_code', e.target.value)}
                disabled={!editing}
                placeholder="เช่น 001"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  backgroundColor: editing ? 'white' : 'var(--bg-secondary)',
                }}
              />
            </div>

            {/* รหัสแผนก */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                รหัสแผนก
              </label>
              <input
                type="text"
                value={formData.section_code || ''}
                onChange={(e) => handleChange('section_code', e.target.value)}
                disabled={!editing}
                placeholder="เช่น 001"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  backgroundColor: editing ? 'white' : 'var(--bg-secondary)',
                }}
              />
            </div>

            {/* เลขบัตรประชาชน */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                เลขบัตรประชาชน
              </label>
              <input
                type="text"
                value={formData.identity_id || ''}
                onChange={(e) => handleChange('identity_id', e.target.value)}
                disabled={!editing}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  backgroundColor: editing ? 'white' : 'var(--bg-secondary)',
                }}
              />
            </div>

            {/* LINE ID */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                LINE User ID
              </label>
              <input
                type="text"
                value={formData.line_id || ''}
                onChange={(e) => handleChange('line_id', e.target.value)}
                disabled={!editing}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  backgroundColor: editing ? 'white' : 'var(--bg-secondary)',
                }}
              />
            </div>

            {/* ที่อยู่ */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                ที่อยู่
              </label>
              <textarea
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                disabled={!editing}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  backgroundColor: editing ? 'white' : 'var(--bg-secondary)',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* เงินเดือนรายวัน */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                เงินเดือนรายวัน (บาท)
              </label>
              <input
                type="number"
                value={formData.perday_salary || ''}
                onChange={(e) => handleChange('perday_salary', e.target.value ? Number(e.target.value) : null)}
                disabled={!editing}
                placeholder="0.00"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  backgroundColor: editing ? 'white' : 'var(--bg-secondary)',
                }}
              />
            </div>

            {/* เงินเดือนรายชั่วโมง */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                เงินเดือนรายชั่วโมง (บาท)
              </label>
              <input
                type="number"
                value={formData.perhr_salary || ''}
                onChange={(e) => handleChange('perhr_salary', e.target.value ? Number(e.target.value) : null)}
                disabled={!editing}
                placeholder="0.00"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  backgroundColor: editing ? 'white' : 'var(--bg-secondary)',
                }}
              />
            </div>

            {/* รหัสธนาคาร */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                รหัสธนาคาร
              </label>
              <input
                type="number"
                value={formData.bank_id || ''}
                onChange={(e) => handleChange('bank_id', e.target.value ? Number(e.target.value) : null)}
                disabled={!editing}
                placeholder="เช่น 004 (กสิกร)"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  backgroundColor: editing ? 'white' : 'var(--bg-secondary)',
                }}
              />
            </div>

            {/* เลขบัญชีธนาคาร */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                เลขบัญชีธนาคาร
              </label>
              <input
                type="number"
                value={formData.bank_account || ''}
                onChange={(e) => handleChange('bank_account', e.target.value ? Number(e.target.value) : null)}
                disabled={!editing}
                placeholder="เลขบัญชี 10 หลัก"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  backgroundColor: editing ? 'white' : 'var(--bg-secondary)',
                }}
              />
            </div>

            {/* หมายเหตุ */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                หมายเหตุ
              </label>
              <textarea
                value={formData.remarks || ''}
                onChange={(e) => handleChange('remarks', e.target.value)}
                disabled={!editing}
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  backgroundColor: editing ? 'white' : 'var(--bg-secondary)',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          {editing && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={handleCancel} className="btn btn-secondary" disabled={saving}>
                ยกเลิก
              </button>
              <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                {saving ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูล'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
