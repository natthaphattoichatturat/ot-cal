'use client'

import { useState } from 'react'

interface DocumentType {
  id: string
  name: string
  description: string
  dataRequired: string
  frequency: string
  icon: string
  color: string
}

export default function DocumentsPage() {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)

  const documents: DocumentType[] = [
    {
      id: 'payslip',
      name: 'สลิปเงินเดือน (Payslip)',
      description: 'สลิปเงินเดือนรายบุคคล แสดงรายละเอียดเงินเดือน OT เงินได้ เงินหัก และยอดสะสม YTD',
      dataRequired: 'ข้อมูลค่าจ้าง, OT, เงินได้, เงินหัก, SSO, ภาษี และยอดสะสม YTD ของรายได้, ภาษี และ SSO',
      frequency: 'ทุกงวด (2 ครั้ง/เดือน)',
      icon: '📄',
      color: '#3B82F6'
    },
    {
      id: 'pnd1',
      name: 'ภ.ง.ด.1 (P.N.D.1)',
      description: 'แบบแสดงรายการภาษีเงินได้หัก ณ ที่จ่าย สำหรับเงินเดือน',
      dataRequired: 'ผลรวมรายได้ทั้งหมดของพนักงานทุกคนในเดือนที่จ่าย และ ผลรวมภาษีที่หักในเดือนนั้น',
      frequency: 'รายเดือน (ส่งภายในวันที่ 7 ของเดือนถัดไป)',
      icon: '📋',
      color: '#EF4444'
    },
    {
      id: 'sso',
      name: 'สปส. 1-10 (SSO Form)',
      description: 'แบบรายการเงินสมทบประกันสังคม',
      dataRequired: 'ผลรวมค่าจ้างที่จ่ายจริงของพนักงานทุกคน และ ผลรวม SSO ที่หักสะสมครบในเดือนนั้น',
      frequency: 'รายเดือน (ส่งภายในวันที่ 15 ของเดือนถัดไป)',
      icon: '🏥',
      color: '#10B981'
    },
    {
      id: 'cert50',
      name: 'หนังสือรับรองฯ 50 ทวิ',
      description: 'หนังสือรับรองการหักภาษี ณ ที่จ่าย สำหรับพนักงานแต่ละคน',
      dataRequired: 'ยอดสะสมรายปี (YTD) ของรายได้รวม และ ยอดสะสมรายปี (YTD) ของภาษี สำหรับพนักงานแต่ละคน',
      frequency: 'รายปี (ออกให้พนักงานภายในวันที่ 15 ก.พ.)',
      icon: '📜',
      color: '#8B5CF6'
    },
    {
      id: 'pnd1kor',
      name: 'ภ.ง.ด.1ก (P.N.D.1 Kor)',
      description: 'แบบรายการเงินได้เพื่อการหักภาษี ณ ที่จ่าย ประจำปี',
      dataRequired: 'ผลรวมยอดสะสมรายปีของรายได้ทั้งหมด และ ผลรวมยอดสะสมรายปีของภาษีที่หัก ของพนักงานทุกคน',
      frequency: 'รายปี (ส่งภายในเดือน ก.พ.)',
      icon: '📊',
      color: '#F59E0B'
    },
  ]

  return (
    <div className="app-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">จัดการเอกสาร HR</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              ระบบจัดการและออกเอกสารทางภาษีและประกันสังคม
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href="/" className="btn btn-secondary">
              ← กลับหน้าหลัก
            </a>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: 'white' }}>
          📌 ระบบจัดการเอกสาร HR
        </h3>
        <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0, opacity: 0.9 }}>
          ระบบนี้ช่วยให้คุณสามารถจัดการและออกเอกสารที่จำเป็นต่อการดำเนินงานด้าน HR ได้อย่างสะดวก
          ทั้งสลิปเงินเดือน เอกสารภาษี และเอกสารประกันสังคม โดยใช้ข้อมูลจากระบบคำนวณค่าจ้างโดยอัตโนมัติ
        </p>
      </div>

      {/* Document Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="card"
            style={{
              padding: '24px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: selectedDoc === doc.id ? `3px solid ${doc.color}` : '1px solid var(--border-light)',
              transform: selectedDoc === doc.id ? 'scale(1.02)' : 'scale(1)',
            }}
            onClick={() => setSelectedDoc(doc.id)}
            onMouseEnter={(e) => {
              if (selectedDoc !== doc.id) {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedDoc !== doc.id) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = ''
              }
            }}
          >
            {/* Icon และชื่อ */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: `${doc.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                }}
              >
                {doc.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: doc.color }}>
                  {doc.name}
                </h3>
              </div>
            </div>

            {/* คำอธิบาย */}
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {doc.description}
            </p>

            {/* ความถี่ */}
            <div style={{ marginBottom: '16px', padding: '8px 12px', background: 'var(--surface-bg)', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>
                ความถี่ในการออกเอกสาร
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600' }}>
                {doc.frequency}
              </div>
            </div>

            {/* ข้อมูลที่ใช้ */}
            <div style={{ padding: '12px', background: `${doc.color}10`, borderRadius: '6px', borderLeft: `4px solid ${doc.color}` }}>
              <div style={{ fontSize: '11px', color: doc.color, fontWeight: '700', marginBottom: '6px' }}>
                📊 ข้อมูลที่ใช้จากระบบ
              </div>
              <div style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                {doc.dataRequired}
              </div>
            </div>

            {/* ปุ่มดำเนินการ (Coming Soon) */}
            <div style={{ marginTop: '16px' }}>
              <button
                className="btn"
                style={{
                  width: '100%',
                  background: doc.color,
                  color: 'white',
                  opacity: 0.6,
                  cursor: 'not-allowed',
                }}
                disabled
              >
                🔒 ฟีเจอร์กำลังจะเปิดใช้งานเร็วๆ นี้
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="card" style={{ marginTop: '32px', padding: '24px', background: '#FEF3C7', border: '1px solid #F59E0B' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#92400E' }}>
          💡 ข้อมูลเพิ่มเติมสำหรับการคำนวณเอกสาร
        </h3>
        <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#78350F' }}>
          <p style={{ marginBottom: '12px' }}>
            <strong>สำหรับการออกเอกสารภาษีและประกันสังคม</strong> ระบบจะใช้ข้อมูลจาก:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>
            <li>ข้อมูลค่าจ้าง OT และเบี้ยขยันจากระบบคำนวณค่าจ้าง</li>
            <li>รายการเงินได้และเงินหักเพิ่มเติมจากระบบจัดการเงินได้/เงินหัก</li>
            <li>ข้อมูลประกันสังคม (SSO) ที่คำนวณแบบรายเดือน</li>
            <li>ภาษีหัก ณ ที่จ่าย ที่คำนวณแบบ YTD (Year-To-Date)</li>
            <li>ข้อมูลส่วนตัวและค่าลดหย่อนของพนักงานจากระบบข้อมูลพนักงาน</li>
          </ul>
          <p style={{ marginBottom: 0 }}>
            <strong>หมายเหตุ:</strong> ฟีเจอร์การออกเอกสารอัตโนมัติจะเปิดให้ใช้งานในเวอร์ชันถัดไป
            ปัจจุบันสามารถส่งออกข้อมูลผ่าน API และนำไปสร้างเอกสารด้วย template ได้
          </p>
        </div>
      </div>
    </div>
  )
}

