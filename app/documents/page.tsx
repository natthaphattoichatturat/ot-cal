'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

interface DocumentType {
  id: string
  name: string
  nameTh: string
  description: string
  dataSource: string
  frequency: string
  icon: string
  color: string
}

const documents: DocumentType[] = [
  {
    id: 'payslip',
    name: 'Payslip',
    nameTh: 'สลิปเงินเดือน',
    description: 'สลิปเงินเดือนพนักงานแต่ละคน พร้อมรายละเอียดค่าจ้าง OT เงินได้/เงินหัก และยอดสะสม YTD',
    dataSource: 'ข้อมูลค่าจ้างรายงวด + ยอดสะสม YTD (รายได้, ภาษี, SSO)',
    frequency: 'ทุกงวด (2 ครั้ง/เดือน)',
    icon: '',
    color: '#000000'
  },
  {
    id: 'pnd1',
    name: 'P.N.D.1',
    nameTh: 'ภ.ง.ด.1',
    description: 'แบบรายการภาษีเงินได้หัก ณ ที่จ่าย รวมยอดของพนักงานทั้งหมด',
    dataSource: '∑(รายได้รวม) และ ∑(ภาษีที่หัก) ของพนักงานทุกคนในเดือนนั้น',
    frequency: 'รายเดือน (ส่งภายใน 7 ของเดือนถัดไป)',
    icon: '',
    color: '#000000'
  },
  {
    id: 'sso',
    name: 'SSO Form (SPS. 1-10)',
    nameTh: 'สปส. 1-10',
    description: 'แบบรายงานการส่งเงินสมทบประกันสังคม',
    dataSource: '∑(ค่าจ้างที่จ่ายจริง) และ ∑(SSO ที่หักสะสม) ครบในเดือนนั้น',
    frequency: 'รายเดือน (ส่งภายใน 15 ของเดือนถัดไป)',
    icon: '',
    color: '#000000'
  },
  {
    id: 'cert50',
    name: 'Certificate of Withholding Tax (50 Tawi)',
    nameTh: 'หนังสือรับรองฯ 50 ทวิ',
    description: 'หนังสือรับรองการหักภาษี ณ ที่จ่าย สำหรับพนักงานแต่ละคน',
    dataSource: 'ยอดสะสมรายปี (YTD) ของ รายได้รวม และ ภาษีของแต่ละคน',
    frequency: 'รายปี (ออกให้พนักงานภายใน 15 ก.พ.)',
    icon: '',
    color: '#000000'
  },
  {
    id: 'pnd1kor',
    name: 'P.N.D.1 Kor',
    nameTh: 'ภ.ง.ด.1 ก',
    description: 'แบบยื่นรายการภาษีเงินได้หัก ณ ที่จ่าย รายปี (สรุปรวมทั้งบริษัท)',
    dataSource: '∑(ยอดสะสมรายปีของรายได้) และ ∑(ภาษี) ของพนักงานทุกคน',
    frequency: 'รายปี (ยื่นภายในเดือน ก.พ.)',
    icon: '',
    color: '#000000'
  }
]

export default function DocumentsPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    period: 1
  })
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')
  const [exporting, setExporting] = useState<string | null>(null)

  const handleExport = async (docId: string) => {
    setExporting(docId)
    
    // TODO: Implement actual export functionality
    setTimeout(() => {
      const doc = documents.find(d => d.id === docId)
      alert(`กำลังสร้าง ${doc?.nameTh}...\n\n` +
        `งวด: ${selectedPeriod.month}/${selectedPeriod.year + 543} งวดที่ ${selectedPeriod.period}\n` +
        `พนักงาน: ${selectedEmployee === 'all' ? 'ทุกคน' : selectedEmployee}\n\n` +
        `(ฟังก์ชันนี้ยังไม่ได้เชื่อมต่อ API - กำลังพัฒนา)`)
      setExporting(null)
    }, 1500)
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">{t('documents.title')}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              {t('documents.subtitle')}
            </p>
          </div>
          <button onClick={() => router.push('/')} className="btn btn-secondary">
            ← {t('common.back')}
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '32px' }}>📋</div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: 'white' }}>
              ระบบจัดการและ Export เอกสาร HR
            </h3>
            <p style={{ fontSize: '13px', margin: 0, opacity: 0.9 }}>
              สร้างเอกสารภาษีและประกันสังคมอัตโนมัติจากข้อมูลในระบบ - ครบถ้วนตามมาตรฐานกรมสรรพากร
            </p>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            🗓️ {t('documents.selectMonth')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                {t('common.year')}
              </label>
              <select
                value={selectedPeriod.year}
                onChange={(e) => setSelectedPeriod({ ...selectedPeriod, year: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px'
                }}
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - i
                  return <option key={year} value={year}>{year + 543}</option>
                })}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                {t('common.month')}
              </label>
              <select
                value={selectedPeriod.month}
                onChange={(e) => setSelectedPeriod({ ...selectedPeriod, month: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px'
                }}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {t(`months.${i + 1}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                {t('common.period')}
              </label>
              <select
                value={selectedPeriod.period}
                onChange={(e) => setSelectedPeriod({ ...selectedPeriod, period: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px'
                }}
              >
                <option value={1}>{t('documents.period1')}</option>
                <option value={2}>{t('documents.period2')}</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                {t('documents.selectEmployee')}
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px'
                }}
              >
                <option value="all">{t('documents.allEmployees')}</option>
                <option value="individual">{t('documents.searchEmployee')}...</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="card"
            style={{
              padding: '24px',
              transition: 'all 0.2s',
              border: `2px solid ${doc.color}20`,
              background: `linear-gradient(to bottom, ${doc.color}08, white)`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '48px', marginRight: '16px' }}>{doc.icon}</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px', color: doc.color }}>
                  {doc.nameTh}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                  {doc.name}
                </p>
              </div>
            </div>
            
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '16px', lineHeight: '1.6' }}>
              {doc.description}
            </p>
            
            <div style={{ marginBottom: '16px', padding: '14px', background: 'white', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-primary)', fontWeight: '700' }}>ข้อมูลที่ใช้:</strong><br/>
                <span style={{ fontSize: '13px' }}>{doc.dataSource}</span>
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                <strong style={{ color: 'var(--text-primary)', fontWeight: '700' }}>ความถี่:</strong><br/>
                <span style={{ fontSize: '13px' }}>{doc.frequency}</span>
              </p>
            </div>

            <button
              onClick={() => handleExport(doc.id)}
              disabled={exporting === doc.id}
              className="btn btn-primary"
              style={{
                width: '100%',
                opacity: exporting === doc.id ? 0.7 : 1,
                cursor: exporting === doc.id ? 'wait' : 'pointer'
              }}
            >
              {exporting === doc.id ? t('documents.generating') : t('documents.downloadPDF')}
            </button>
          </div>
        ))}
      </div>

      {/* Detailed Info Box */}
      <div className="card" style={{ marginTop: '24px', padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}>
        <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
          รายละเอียดข้อมูลในเอกสารแต่ละประเภท
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', fontSize: '13px', lineHeight: '1.8', color: 'var(--text-primary)' }}>
          <div>
            <strong>1. สลิปเงินเดือน:</strong>
            <ul style={{ marginLeft: '20px', marginTop: '8px', marginBottom: 0 }}>
              <li>ข้อมูลพนักงาน (ชื่อ, รหัส, แผนก)</li>
              <li>ค่าจ้างพื้นฐาน + OT (1.5x, 2x, 3x)</li>
              <li>เงินได้เพิ่มเติมทั้งหมด</li>
              <li>เงินหักทั้งหมด (SSO, ภาษี, อื่นๆ)</li>
              <li>ยอดสะสม YTD (รายได้, ภาษี, SSO)</li>
            </ul>
          </div>
          <div>
            <strong>2. ภ.ง.ด.1:</strong>
            <ul style={{ marginLeft: '20px', marginTop: '8px', marginBottom: 0 }}>
              <li>รายชื่อพนักงานทั้งหมด</li>
              <li>รายได้แต่ละคนในเดือนนั้น</li>
              <li>ภาษีที่หักแต่ละคน</li>
              <li>ยอดรวมทั้งหมด</li>
            </ul>
          </div>
          <div>
            <strong>3. สปส. 1-10:</strong>
            <ul style={{ marginLeft: '20px', marginTop: '8px', marginBottom: 0 }}>
              <li>รายชื่อพนักงานทั้งหมด</li>
              <li>ค่าจ้างที่ใช้คำนวณ SSO</li>
              <li>SSO ที่หัก (5%)</li>
              <li>SSO ที่บริษัทจ่าย (5%)</li>
              <li>ยอดรวมทั้งหมด</li>
            </ul>
          </div>
          <div>
            <strong>4. หนังสือรับรอง 50 ทวิ:</strong>
            <ul style={{ marginLeft: '20px', marginTop: '8px', marginBottom: 0 }}>
              <li>ข้อมูลพนักงานแต่ละคน</li>
              <li>รายได้รวมตลอดปี</li>
              <li>ภาษีที่หักตลอดปี</li>
              <li>ค่าลดหย่อนต่างๆ</li>
            </ul>
          </div>
          <div>
            <strong>5. ภ.ง.ด.1 ก:</strong>
            <ul style={{ marginLeft: '20px', marginTop: '8px', marginBottom: 0 }}>
              <li>สรุปรวมทั้งบริษัท</li>
              <li>รายได้รวมตลอดปี</li>
              <li>ภาษีรวมตลอดปี</li>
              <li>จำนวนพนักงานทั้งหมด</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '16px', background: '#f0fdf4', border: '2px solid #10b981' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
          <div style={{ fontSize: '14px', color: '#059669', fontWeight: '600' }}>เอกสารทั้งหมด</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>5 ประเภท</div>
        </div>
        <div className="card" style={{ padding: '16px', background: '#eff6ff', border: '2px solid #3b82f6' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🗓️</div>
          <div style={{ fontSize: '14px', color: '#2563eb', fontWeight: '600' }}>งวดที่เลือก</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>
            {selectedPeriod.month}/{selectedPeriod.year + 543} งวด {selectedPeriod.period}
          </div>
        </div>
        <div className="card" style={{ padding: '16px', background: '#fef3c7', border: '2px solid #f59e0b' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
          <div style={{ fontSize: '14px', color: '#d97706', fontWeight: '600' }}>สถานะ</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#f59e0b' }}>UI พร้อมใช้งาน</div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="card" style={{ marginTop: '24px', padding: '20px', background: '#fef2f2', border: '2px solid #ef4444' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ fontSize: '24px' }}>⚠️</div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#991b1b' }}>
              หมายเหตุสำคัญ
            </h4>
            <p style={{ fontSize: '13px', color: '#991b1b', margin: 0, lineHeight: '1.6' }}>
              <strong>ฟังก์ชัน Export PDF กำลังอยู่ระหว่างการพัฒนา</strong> - ปัจจุบันเป็นเพียง UI Demo เท่านั้น 
              ระบบจะดึงข้อมูลจาก Database ตามงวดที่เลือกและสร้างไฟล์ PDF อัตโนมัติในอนาคต
              ข้อมูลทั้งหมดจะครบถ้วนตามมาตรฐานกรมสรรพากรและสำนักงานประกันสังคม
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
