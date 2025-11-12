'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddEmployeePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    department: '',
    division_code: '',
    section_code: '',
    address: '',
    identity_id: '',
    line_id: '',
    perday_salary: '',
    perhr_salary: '',
    bank_id: '',
    bank_account: '',
    remarks: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setMessage('✓ เพิ่มพนักงานสำเร็จ')
        setTimeout(() => {
          router.push(`/employees/${result.data.employee_id}`)
        }, 1500)
      } else {
        setMessage(`✗ ${result.error}`)
      }
    } catch (error) {
      setMessage('✗ เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">เพิ่มพนักงานใหม่</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              กรอกข้อมูลพนักงานใหม่
            </p>
          </div>
          <button onClick={() => router.push('/employees')} className="btn btn-secondary">
            กลับหน้ารายชื่อ
          </button>
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

      {/* Form */}
      <div className="card">
        <div style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* รหัสพนักงาน */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  รหัสพนักงาน <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.employee_id}
                  onChange={(e) => handleChange('employee_id', e.target.value)}
                  required
                  placeholder="เช่น EMP001"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
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
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder="ชื่อ นามสกุล"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
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
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  required
                  placeholder="ชื่อแผนก"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
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
                  value={formData.division_code}
                  onChange={(e) => handleChange('division_code', e.target.value)}
                  placeholder="เช่น 001"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
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
                  value={formData.section_code}
                  onChange={(e) => handleChange('section_code', e.target.value)}
                  placeholder="เช่น 001"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
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
                  value={formData.identity_id}
                  onChange={(e) => handleChange('identity_id', e.target.value)}
                  placeholder="1234567890123"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
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
                  value={formData.line_id}
                  onChange={(e) => handleChange('line_id', e.target.value)}
                  placeholder="U1234567890abcdef"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
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
                  value={formData.perday_salary}
                  onChange={(e) => handleChange('perday_salary', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
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
                  value={formData.perhr_salary}
                  onChange={(e) => handleChange('perhr_salary', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
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
                  value={formData.bank_id}
                  onChange={(e) => handleChange('bank_id', e.target.value)}
                  placeholder="เช่น 004 (กสิกร)"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
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
                  value={formData.bank_account}
                  onChange={(e) => handleChange('bank_account', e.target.value)}
                  placeholder="เลขบัญชี 10 หลัก"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                  }}
                />
              </div>

              {/* ที่อยู่ */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  ที่อยู่
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={3}
                  placeholder="ที่อยู่ของพนักงาน"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* หมายเหตุ */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  หมายเหตุ
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleChange('remarks', e.target.value)}
                  rows={2}
                  placeholder="หมายเหตุเพิ่มเติม"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => router.push('/employees')}
                className="btn btn-secondary"
                disabled={saving}
              >
                ยกเลิก
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'กำลังบันทึก...' : '💾 บันทึกพนักงาน'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
