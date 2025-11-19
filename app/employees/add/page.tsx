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
    // ข้อมูลส่วนตัว
    section: '',
    position: '',
    gender: '',
    nationality: '',
    citizenship: '',
    religion: '',
    birth_date: '',
    start_date: '',
    // ข้อมูลภาษีและประกัน
    tax_id: '',
    social_security: '',
    // กองทุนต่างๆ
    provident_fund: '',
    company_provident_fund: '',
    life_insurance: '',
    teacher_fund: '',
    housing_loan: '',
    rmf_fund: '',
    // เงินเดือนคงที่
    position_allowance: '',
    phone_allowance: '',
    other_allowance: '',
    defective_work_deduction: '',
    // ค่าลดหย่อนภาษี
    tax_allowance: '60000',
    spouse_allowance: '',
    child_allowance: '',
    number_of_children: '0',
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

            {/* Section 1: ข้อมูลส่วนตัว */}
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}>
                ข้อมูลส่วนตัว
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    แผนก/ฝ่าย
                  </label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => handleChange('section', e.target.value)}
                    placeholder="เช่น ฝ่ายผลิต"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    ตำแหน่ง
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleChange('position', e.target.value)}
                    placeholder="เช่น พนักงานทั่วไป"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    เพศ
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  >
                    <option value="">-- เลือก --</option>
                    <option value="male">ชาย</option>
                    <option value="female">หญิง</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    สัญชาติ
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => handleChange('nationality', e.target.value)}
                    placeholder="เช่น ไทย"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    เชื้อชาติ
                  </label>
                  <input
                    type="text"
                    value={formData.citizenship}
                    onChange={(e) => handleChange('citizenship', e.target.value)}
                    placeholder="เช่น ไทย"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    ศาสนา
                  </label>
                  <input
                    type="text"
                    value={formData.religion}
                    onChange={(e) => handleChange('religion', e.target.value)}
                    placeholder="เช่น พุทธ"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    วันเกิด
                  </label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => handleChange('birth_date', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    วันเริ่มงาน
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: ข้อมูลภาษีและประกัน */}
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}>
                ข้อมูลภาษีและประกันสังคม
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    เลขประจำตัวผู้เสียภาษี
                  </label>
                  <input
                    type="text"
                    value={formData.tax_id}
                    onChange={(e) => handleChange('tax_id', e.target.value)}
                    maxLength={13}
                    placeholder="1234567890123"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    เลขประกันสังคม
                  </label>
                  <input
                    type="text"
                    value={formData.social_security}
                    onChange={(e) => handleChange('social_security', e.target.value)}
                    maxLength={20}
                    placeholder="เลขประกันสังคม"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: เงินเดือนและค่าตอบแทนคงที่ */}
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}>
                เงินเดือนและค่าตอบแทนคงที่
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    ค่าตำแหน่ง (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.position_allowance}
                    onChange={(e) => handleChange('position_allowance', e.target.value)}
                    step="0.01"
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    ค่าโทรศัพท์ (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.phone_allowance}
                    onChange={(e) => handleChange('phone_allowance', e.target.value)}
                    step="0.01"
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    ค่าอื่นๆคงที่ (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.other_allowance}
                    onChange={(e) => handleChange('other_allowance', e.target.value)}
                    step="0.01"
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    หักงานเสีย (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.defective_work_deduction}
                    onChange={(e) => handleChange('defective_work_deduction', e.target.value)}
                    step="0.01"
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: กองทุนต่างๆ */}
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}>
                กองทุนและการหักเงิน
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    กองทุนสำรองเลี้ยงชีพ - ลูกจ้าง (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.provident_fund}
                    onChange={(e) => handleChange('provident_fund', e.target.value)}
                    step="0.01"
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    กองทุนสำรองเลี้ยงชีพ - บริษัท (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.company_provident_fund}
                    onChange={(e) => handleChange('company_provident_fund', e.target.value)}
                    step="0.01"
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    ประกันชีวิต (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.life_insurance}
                    onChange={(e) => handleChange('life_insurance', e.target.value)}
                    step="0.01"
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    กองทุนครู (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.teacher_fund}
                    onChange={(e) => handleChange('teacher_fund', e.target.value)}
                    step="0.01"
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    เงินกู้บ้าน (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.housing_loan}
                    onChange={(e) => handleChange('housing_loan', e.target.value)}
                    step="0.01"
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    กองทุน RMF (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.rmf_fund}
                    onChange={(e) => handleChange('rmf_fund', e.target.value)}
                    step="0.01"
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section 5: ค่าลดหย่อนภาษี */}
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}>
                ค่าลดหย่อนภาษี
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    ค่าลดหย่อนส่วนตัว (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.tax_allowance}
                    onChange={(e) => handleChange('tax_allowance', e.target.value)}
                    step="0.01"
                    placeholder="60000"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                  <small style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    ค่าเริ่มต้น 60,000 บาท/ปี
                  </small>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    ค่าลดหย่อนคู่สมรส (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.spouse_allowance}
                    onChange={(e) => handleChange('spouse_allowance', e.target.value)}
                    step="0.01"
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    จำนวนบุตร
                  </label>
                  <input
                    type="number"
                    value={formData.number_of_children}
                    onChange={(e) => handleChange('number_of_children', e.target.value)}
                    min="0"
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    ค่าลดหย่อนบุตร (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.child_allowance}
                    onChange={(e) => handleChange('child_allowance', e.target.value)}
                    step="0.01"
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                    }}
                  />
                  <small style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    30,000 บาท/คน
                  </small>
                </div>
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
