'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ImportEmployeesPage() {
  const router = useRouter()
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState('')
  const [results, setResults] = useState<any>(null)

  const downloadTemplate = () => {
    const headers = [
      'employee_id',
      'name',
      'department',
      'division_code',
      'section_code',
      'address',
      'identity_id',
      'line_id',
      'remarks',
    ]

    const exampleData = [
      'EMP001,สมชาย ใจดี,ผลิต,001,001,123 ถ.สุขุมวิท กรุงเทพฯ,1234567890123,U1234567890abcdef,',
      'EMP002,สมหญิง รักดี,บัญชี,002,002,456 ถ.พหลโยธิน กรุงเทพฯ,9876543210987,,หมายเหตุ',
    ]

    const csvContent = [headers.join(','), ...exampleData].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', 'employee_import_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setMessage('')
    setResults(null)

    try {
      const text = await file.text()
      const lines = text.split('\n').filter((line) => line.trim())

      if (lines.length < 2) {
        setMessage('✗ ไฟล์ CSV ไม่มีข้อมูล')
        setImporting(false)
        return
      }

      // Parse CSV
      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
      const employees = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
        const employee: any = {}

        headers.forEach((header, index) => {
          employee[header] = values[index] || null
        })

        employees.push(employee)
      }

      // Send to API
      const response = await fetch('/api/employees/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage(`✓ ${result.message}`)
        setResults(result.results)
      } else {
        setMessage(`✗ ${result.error}`)
      }
    } catch (error) {
      setMessage('✗ เกิดข้อผิดพลาดในการอ่านไฟล์')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Import ข้อมูลพนักงาน</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              นำเข้าข้อมูลพนักงานจากไฟล์ CSV/Excel
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

      {/* Instructions */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            📝 วิธีการ Import ข้อมูล
          </h2>
          <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>ดาวน์โหลดไฟล์ Template CSV ด้านล่าง</li>
            <li>เปิดไฟล์ด้วย Excel หรือ Google Sheets</li>
            <li>กรอกข้อมูลพนักงานตามคอลัมน์ที่กำหนด</li>
            <li>
              <strong>คอลัมน์ที่จำเป็น:</strong> employee_id, name, department
            </li>
            <li>บันทึกเป็นไฟล์ CSV</li>
            <li>Upload ไฟล์ในส่วนด้านล่าง</li>
          </ol>

          <div style={{ marginTop: '20px' }}>
            <button onClick={downloadTemplate} className="btn btn-primary">
              📥 ดาวน์โหลด Template CSV
            </button>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            📤 Upload ไฟล์ CSV
          </h2>

          <div
            style={{
              border: '2px dashed var(--border-light)',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              disabled={importing}
              id="file-upload"
              style={{ display: 'none' }}
            />
            <label
              htmlFor="file-upload"
              style={{
                cursor: importing ? 'not-allowed' : 'pointer',
                display: 'inline-block',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                {importing ? 'กำลัง Import...' : 'คลิกเพื่อเลือกไฟล์'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                รองรับไฟล์ CSV, Excel (.xlsx, .xls)
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="card">
          <div style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              📊 ผลการ Import
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div
                style={{
                  padding: '20px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {results.total}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  ทั้งหมด
                </div>
              </div>
              <div
                style={{
                  padding: '20px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>
                  {results.success.length}
                </div>
                <div style={{ fontSize: '14px', color: '#4CAF50', marginTop: '4px' }}>
                  สำเร็จ
                </div>
              </div>
              <div
                style={{
                  padding: '20px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f44336' }}>
                  {results.failed.length}
                </div>
                <div style={{ fontSize: '14px', color: '#f44336', marginTop: '4px' }}>
                  ล้มเหลว
                </div>
              </div>
            </div>

            {/* Failed Records */}
            {results.failed.length > 0 && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#f44336' }}>
                  ❌ รายการที่ Import ไม่สำเร็จ
                </h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>รหัสพนักงาน</th>
                        <th>ชื่อ</th>
                        <th>สาเหตุ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.failed.map((fail: any, index: number) => (
                        <tr key={index}>
                          <td>{fail.data.employee_id || '-'}</td>
                          <td>{fail.data.name || '-'}</td>
                          <td style={{ color: '#f44336' }}>{fail.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => router.push('/employees')} className="btn btn-primary">
                ดูรายชื่อพนักงาน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
