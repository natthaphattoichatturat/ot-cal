'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import PayslipPreview from '@/components/PayslipPreview'
import SSO110Preview from '@/components/SSO110Preview'
import PND1Preview from '@/components/PND1Preview'
import PND1KorPreview from '@/components/PND1KorPreview'
import WithholdingCertPreview from '@/components/WithholdingCertPreview'
import { PayslipData } from '@/types/payslip'
import { SSO110Data, PND1Data, PND1KorData, WithholdingCertData } from '@/types/documents'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface Employee {
  employee_id: string
  name: string
  department: string
}

type DocumentType = 'payslip' | 'sso110' | 'pnd1' | 'pnd1kor' | 'withholding-cert'
type FrequencyType = 'period' | 'monthly' | 'yearly'

interface DocumentTypeInfo {
  id: DocumentType
  name: string
  description: string
  icon: string
  frequency: FrequencyType
  needsEmployeeSelection: boolean
}

export default function ExportPage() {
  const { t } = useLanguage()

  // Selection states
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState<1 | 2>(1)

  // Employee selection
  const [searchQuery, setSearchQuery] = useState('')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [searching, setSearching] = useState(false)

  // Preview & Export states
  const [showPreview, setShowPreview] = useState(false)
  const [payslips, setPayslips] = useState<PayslipData[]>([])
  const [sso110Data, setSSO110Data] = useState<SSO110Data | null>(null)
  const [pnd1Data, setPND1Data] = useState<PND1Data | null>(null)
  const [pnd1KorData, setPND1KorData] = useState<PND1KorData | null>(null)
  const [withholdingCerts, setWithholdingCerts] = useState<WithholdingCertData[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState('')

  const payslipRefs = useRef<(HTMLDivElement | null)[]>([])
  const sso110SummaryRef = useRef<HTMLDivElement | null>(null)
  const sso110DetailRef = useRef<HTMLDivElement | null>(null)
  const pnd1Ref = useRef<HTMLDivElement | null>(null)
  const pnd1KorRef = useRef<HTMLDivElement | null>(null)
  const withholdingCertRefs = useRef<(HTMLDivElement | null)[]>([])

  // Document types configuration
  const documentTypes: DocumentTypeInfo[] = [
    {
      id: 'payslip',
      name: t('export.payslip') || 'สลิปเงินเดือน',
      description: t('export.payslipDesc') || 'ใบจ่ายเงินเดือนพนักงาน',
      icon: 'Ⅰ',
      frequency: 'period',
      needsEmployeeSelection: true
    },
    {
      id: 'sso110',
      name: t('export.sso110') || 'สปส. 1-10',
      description: t('export.sso110Desc') || 'แบบส่งเงินสมทบประกันสังคม',
      icon: 'Ⅱ',
      frequency: 'monthly',
      needsEmployeeSelection: false
    },
    {
      id: 'pnd1',
      name: t('export.pnd1') || 'ภ.ง.ด.1',
      description: t('export.pnd1Desc') || 'แบบยื่นภาษีเงินได้หัก ณ ที่จ่าย รายเดือน',
      icon: 'Ⅲ',
      frequency: 'monthly',
      needsEmployeeSelection: false
    },
    {
      id: 'pnd1kor',
      name: t('export.pnd1kor') || 'ภ.ง.ด.1ก',
      description: t('export.pnd1korDesc') || 'แบบยื่นภาษีเงินได้หัก ณ ที่จ่าย รายปี',
      icon: 'Ⅳ',
      frequency: 'yearly',
      needsEmployeeSelection: false
    },
    {
      id: 'withholding-cert',
      name: t('export.withholdingCert') || '50 ทวิ',
      description: t('export.withholdingCertDesc') || 'หนังสือรับรองการหักภาษี ณ ที่จ่าย',
      icon: 'Ⅴ',
      frequency: 'yearly',
      needsEmployeeSelection: true
    }
  ]

  const selectedDocTypeInfo = documentTypes.find(d => d.id === selectedDocType)

  // Initialize with current month/year
  useEffect(() => {
    const now = new Date()
    setSelectedMonth((now.getMonth() + 1).toString().padStart(2, '0'))
    setSelectedYear(now.getFullYear().toString())
  }, [])

  // Search employees
  useEffect(() => {
    const searchEmployees = async () => {
      if (!searchQuery.trim()) {
        setFilteredEmployees(employees)
        return
      }

      setSearching(true)
      try {
        const query = searchQuery.trim()
        let searchBy = 'name'
        if (/^\d/.test(query) || /^[A-Za-z]/.test(query)) {
          searchBy = 'employee_id'
        }

        const res = await fetch(`/api/employees?search=${encodeURIComponent(query)}&searchBy=${searchBy}&status=active`)
        const data = await res.json()

        if (data.success) {
          setFilteredEmployees(data.data || [])
        } else {
          setFilteredEmployees([])
        }
      } catch (error) {
        console.error('Error searching employees:', error)
        setFilteredEmployees([])
      } finally {
        setSearching(false)
      }
    }

    const timeoutId = setTimeout(searchEmployees, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, employees])

  // Fetch all employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/api/employees?status=active&limit=1000')
        const data = await res.json()
        if (data.success) {
          setEmployees(data.data || [])
          setFilteredEmployees(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching employees:', error)
      }
    }
    fetchEmployees()
  }, [])

  // Reset states when changing document type
  useEffect(() => {
    setShowPreview(false)
    setSelectedEmployees([])
    setPayslips([])
    setSSO110Data(null)
    setPND1Data(null)
    setPND1KorData(null)
    setWithholdingCerts([])
    setMessage('')
  }, [selectedDocType])

  const toggleEmployee = (employeeId: string) => {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId))
    } else {
      setSelectedEmployees([...selectedEmployees, employeeId])
    }
  }

  const selectAllEmployees = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.employee_id))
    }
  }

  const handleGeneratePreview = async () => {
    if (selectedDocTypeInfo?.needsEmployeeSelection && selectedEmployees.length === 0) {
      setMessage(t('export.selectAtLeastOne') || 'กรุณาเลือกพนักงานอย่างน้อย 1 คน')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const monthStr = `${selectedYear}-${selectedMonth}`

      switch (selectedDocType) {
        case 'payslip': {
          const res = await fetch(
            `/api/export/payslip?employeeIds=${selectedEmployees.join(',')}&month=${monthStr}&period=${selectedPeriod}`
          )
          const data = await res.json()
          if (data.success) {
            setPayslips(data.data)
            setShowPreview(true)
          } else {
            setMessage(`${t('common.error')}: ${data.error}`)
          }
          break
        }

        case 'sso110': {
          const res = await fetch(`/api/export/sso110?month=${monthStr}`)
          const data = await res.json()
          if (data.success) {
            setSSO110Data(data.data)
            setShowPreview(true)
          } else {
            setMessage(`${t('common.error')}: ${data.error}`)
          }
          break
        }

        case 'pnd1': {
          const res = await fetch(`/api/export/pnd1?month=${monthStr}`)
          const data = await res.json()
          if (data.success) {
            setPND1Data(data.data)
            setShowPreview(true)
          } else {
            setMessage(`${t('common.error')}: ${data.error}`)
          }
          break
        }

        case 'pnd1kor': {
          const res = await fetch(`/api/export/pnd1kor?year=${selectedYear}`)
          const data = await res.json()
          if (data.success) {
            setPND1KorData(data.data)
            setShowPreview(true)
          } else {
            setMessage(`${t('common.error')}: ${data.error}`)
          }
          break
        }

        case 'withholding-cert': {
          const res = await fetch(
            `/api/export/withholding-cert?employeeIds=${selectedEmployees.join(',')}&year=${selectedYear}`
          )
          const data = await res.json()
          if (data.success) {
            setWithholdingCerts(data.data)
            setShowPreview(true)
          } else {
            setMessage(`${t('common.error')}: ${data.error}`)
          }
          break
        }
      }
    } catch (error) {
      console.error('Error generating preview:', error)
      setMessage(`${t('common.error')}: ${t('export.generateError') || 'เกิดข้อผิดพลาดในการสร้างเอกสาร'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    setExporting(true)
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const margin = 5

      const captureElement = async (element: HTMLElement | null): Promise<string | null> => {
        if (!element) return null
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true
        })
        return canvas.toDataURL('image/png')
      }

      let pageAdded = false

      switch (selectedDocType) {
        case 'payslip': {
          const landscapePdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
          })

          const landscapeWidth = landscapePdf.internal.pageSize.getWidth()

          for (let i = 0; i < payslips.length; i++) {
            const element = payslipRefs.current[i]
            if (!element) continue

            const imgData = await captureElement(element)
            if (!imgData) continue

            if (i > 0) landscapePdf.addPage()

            const canvas = await html2canvas(element, { scale: 2 })
            const ratio = (landscapeWidth - margin * 2) / canvas.width
            const imgHeight = canvas.height * ratio

            landscapePdf.addImage(imgData, 'PNG', margin, 10, landscapeWidth - margin * 2, imgHeight)
          }

          const monthName = t(`months.${parseInt(selectedMonth)}`)
          const yearThai = parseInt(selectedYear) + 543
          landscapePdf.save(`payslips_${monthName}_${yearThai}_period${selectedPeriod}.pdf`)
          setExporting(false)
          return
        }

        case 'sso110': {
          // Summary page
          const summaryImg = await captureElement(sso110SummaryRef.current)
          if (summaryImg) {
            const canvas = await html2canvas(sso110SummaryRef.current!)
            const ratio = (pdfWidth - margin * 2) / canvas.width
            const imgHeight = canvas.height * ratio
            pdf.addImage(summaryImg, 'PNG', margin, margin, pdfWidth - margin * 2, imgHeight)
            pageAdded = true
          }

          // Detail page
          const detailImg = await captureElement(sso110DetailRef.current)
          if (detailImg) {
            if (pageAdded) pdf.addPage()
            const canvas = await html2canvas(sso110DetailRef.current!)
            const ratio = (pdfWidth - margin * 2) / canvas.width
            const imgHeight = canvas.height * ratio
            pdf.addImage(detailImg, 'PNG', margin, margin, pdfWidth - margin * 2, imgHeight)
          }

          const monthName = t(`months.${parseInt(selectedMonth)}`)
          const yearThai = parseInt(selectedYear) + 543
          pdf.save(`sso110_${monthName}_${yearThai}.pdf`)
          break
        }

        case 'pnd1': {
          const img = await captureElement(pnd1Ref.current)
          if (img) {
            const canvas = await html2canvas(pnd1Ref.current!)
            const ratio = (pdfWidth - margin * 2) / canvas.width
            const imgHeight = canvas.height * ratio
            pdf.addImage(img, 'PNG', margin, margin, pdfWidth - margin * 2, imgHeight)
          }

          const monthName = t(`months.${parseInt(selectedMonth)}`)
          const yearThai = parseInt(selectedYear) + 543
          pdf.save(`pnd1_${monthName}_${yearThai}.pdf`)
          break
        }

        case 'pnd1kor': {
          const img = await captureElement(pnd1KorRef.current)
          if (img) {
            const canvas = await html2canvas(pnd1KorRef.current!)
            const ratio = (pdfWidth - margin * 2) / canvas.width
            const imgHeight = canvas.height * ratio
            pdf.addImage(img, 'PNG', margin, margin, pdfWidth - margin * 2, imgHeight)
          }

          const yearThai = parseInt(selectedYear) + 543
          pdf.save(`pnd1kor_${yearThai}.pdf`)
          break
        }

        case 'withholding-cert': {
          for (let i = 0; i < withholdingCerts.length; i++) {
            const element = withholdingCertRefs.current[i]
            if (!element) continue

            const imgData = await captureElement(element)
            if (!imgData) continue

            if (i > 0) pdf.addPage()

            const canvas = await html2canvas(element, { scale: 2 })
            const ratio = (pdfWidth - margin * 2) / canvas.width
            const imgHeight = canvas.height * ratio

            pdf.addImage(imgData, 'PNG', margin, margin, pdfWidth - margin * 2, imgHeight)
          }

          const yearThai = parseInt(selectedYear) + 543
          pdf.save(`withholding_cert_50tawi_${yearThai}.pdf`)
          break
        }
      }

    } catch (error) {
      console.error('Error generating PDF:', error)
      setMessage(`${t('common.error')}: ${t('export.pdfError') || 'เกิดข้อผิดพลาดในการสร้าง PDF'}`)
    } finally {
      setExporting(false)
    }
  }

  const renderPeriodSelector = () => {
    if (!selectedDocTypeInfo) return null

    const showMonth = selectedDocTypeInfo.frequency === 'period' || selectedDocTypeInfo.frequency === 'monthly'
    const showPeriod = selectedDocTypeInfo.frequency === 'period'

    return (
      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
          {t('export.step2') || 'ขั้นตอนที่ 2: เลือกงวดการจ่าย'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          {/* Month */}
          {showMonth && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                {t('common.month') || 'เดือน'}
              </label>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = (i + 1).toString().padStart(2, '0')
                  return (
                    <option key={month} value={month}>
                      {t(`months.${i + 1}`)}
                    </option>
                  )
                })}
              </select>
            </div>
          )}

          {/* Year */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {t('common.year') || 'ปี'}
            </label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i
                return (
                  <option key={year} value={year}>
                    {year + 543}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Period */}
          {showPeriod && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                {t('common.period') || 'งวด'}
              </label>
              <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(Number(e.target.value) as 1 | 2)}>
                <option value={1}>{t('export.period1') || 'งวดที่ 1 (26 - 10)'}</option>
                <option value={2}>{t('export.period2') || 'งวดที่ 2 (11 - 25)'}</option>
              </select>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderEmployeeSelector = () => {
    if (!selectedDocTypeInfo?.needsEmployeeSelection) return null

    return (
      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
          {t('export.step3') || 'ขั้นตอนที่ 3: เลือกพนักงาน'}
        </h2>

        {/* Search Box */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('export.searchPlaceholder') || 'ค้นหาพนักงาน (รหัสหรือชื่อ)...'}
              style={{ flex: 1, padding: '10px 14px', fontSize: '14px' }}
            />
            <button
              onClick={selectAllEmployees}
              className="btn btn-secondary"
              style={{ whiteSpace: 'nowrap' }}
            >
              {selectedEmployees.length === filteredEmployees.length ? t('common.cancel') : t('export.selectAll') || 'เลือกทั้งหมด'}
            </button>
          </div>
          {(searchQuery || searching) && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {searching ? (t('export.searching') || 'กำลังค้นหา...') : `${t('export.found') || 'พบ'} ${filteredEmployees.length} ${t('common.people') || 'คน'}`}
            </div>
          )}
        </div>

        {/* Employee List */}
        <div
          style={{
            maxHeight: '300px',
            overflow: 'auto',
            border: '1px solid var(--border-light)',
            borderRadius: '8px',
            padding: '12px'
          }}
        >
          {filteredEmployees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
              {t('export.noEmployees') || 'ไม่พบพนักงาน'}
            </div>
          ) : (
            filteredEmployees.map(emp => (
              <label
                key={emp.employee_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  marginBottom: '4px',
                  background: selectedEmployees.includes(emp.employee_id) ? 'var(--primary-light)' : 'transparent',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(emp.employee_id)}
                  onChange={() => toggleEmployee(emp.employee_id)}
                  style={{ marginRight: '12px', width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '14px' }}>
                  <strong>{emp.employee_id}</strong> - {emp.name}
                  <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>({emp.department || '-'})</span>
                </span>
              </label>
            ))
          )}
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '12px' }}>
          {t('export.selected') || 'เลือกแล้ว'}: {selectedEmployees.length} {t('common.people') || 'คน'}
        </div>
      </div>
    )
  }

  const renderPreview = () => {
    switch (selectedDocType) {
      case 'payslip':
        return payslips.map((payslip, index) => (
          <div
            key={index}
            style={{
              marginBottom: index < payslips.length - 1 ? '24px' : 0,
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <div style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <PayslipPreview
                ref={(el) => { payslipRefs.current[index] = el }}
                data={payslip}
              />
            </div>
          </div>
        ))

      case 'sso110':
        return sso110Data && (
          <>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                <SSO110Preview
                  ref={sso110SummaryRef}
                  data={sso110Data}
                  page="summary"
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                <SSO110Preview
                  ref={sso110DetailRef}
                  data={sso110Data}
                  page="detail"
                  pageNumber={1}
                  totalPages={1}
                />
              </div>
            </div>
          </>
        )

      case 'pnd1':
        return pnd1Data && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <PND1Preview
                ref={pnd1Ref}
                data={pnd1Data}
              />
            </div>
          </div>
        )

      case 'pnd1kor':
        return pnd1KorData && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <PND1KorPreview
                ref={pnd1KorRef}
                data={pnd1KorData}
              />
            </div>
          </div>
        )

      case 'withholding-cert':
        return withholdingCerts.map((cert, index) => (
          <div
            key={index}
            style={{
              marginBottom: index < withholdingCerts.length - 1 ? '24px' : 0,
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <div style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <WithholdingCertPreview
                ref={(el) => { withholdingCertRefs.current[index] = el }}
                data={cert}
              />
            </div>
          </div>
        ))

      default:
        return null
    }
  }

  const getPreviewCount = () => {
    switch (selectedDocType) {
      case 'payslip':
        return payslips.length
      case 'sso110':
        return sso110Data ? 1 : 0
      case 'pnd1':
        return pnd1Data ? 1 : 0
      case 'pnd1kor':
        return pnd1KorData ? 1 : 0
      case 'withholding-cert':
        return withholdingCerts.length
      default:
        return 0
    }
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">{t('export.title') || 'ส่งออกเอกสาร'}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              {t('export.subtitle') || 'สร้างและดาวน์โหลดเอกสาร PDF'}
            </p>
          </div>
          <a href="/" className="btn btn-secondary">
            ← {t('common.back') || 'กลับ'}
          </a>
        </div>
      </div>

      {!showPreview ? (
        <>
          {/* Step 1: Select Document Type */}
          <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
              {t('export.step1') || 'ขั้นตอนที่ 1: เลือกประเภทเอกสาร'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              {documentTypes.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocType(doc.id)}
                  style={{
                    padding: '16px',
                    border: selectedDocType === doc.id ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: selectedDocType === doc.id ? 'var(--primary-light)' : 'var(--surface-bg)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{doc.icon}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{doc.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>{doc.description}</div>
                  <div style={{
                    fontSize: '10px',
                    padding: '3px 8px',
                    background: 'var(--bg-muted)',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    {doc.frequency === 'period' && (t('export.everyPeriod') || 'ทุกงวด')}
                    {doc.frequency === 'monthly' && (t('export.monthly') || 'รายเดือน')}
                    {doc.frequency === 'yearly' && (t('export.yearly') || 'รายปี')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Select Period */}
          {selectedDocType && renderPeriodSelector()}

          {/* Step 3: Select Employees (if needed) */}
          {selectedDocType && renderEmployeeSelector()}

          {/* Message */}
          {message && (
            <div className="card" style={{ marginBottom: '24px', padding: '16px', background: '#fff3cd' }}>
              <p style={{ margin: 0, color: '#856404', fontSize: '14px' }}>{message}</p>
            </div>
          )}

          {/* Generate Button */}
          {selectedDocType && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <button
                onClick={handleGeneratePreview}
                disabled={loading || (selectedDocTypeInfo?.needsEmployeeSelection && selectedEmployees.length === 0)}
                className="btn btn-primary"
                style={{ padding: '14px 48px', fontSize: '16px' }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></span>
                    {t('export.generating') || 'กำลังสร้างเอกสาร...'}
                  </>
                ) : (
                  <>
                    {t('export.preview') || 'ดูตัวอย่างเอกสาร'}
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Preview Mode */}
          <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>
                  {t('export.previewTitle') || 'ตัวอย่างเอกสาร'} - {selectedDocTypeInfo?.name} ({getPreviewCount()} {selectedDocType === 'sso110' || selectedDocType === 'pnd1' || selectedDocType === 'pnd1kor' ? 'ชุด' : t('common.people') || 'คน'})
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {selectedDocTypeInfo?.frequency === 'yearly'
                    ? `${t('common.year') || 'ปี'} ${parseInt(selectedYear) + 543}`
                    : `${t(`months.${parseInt(selectedMonth)}`)} ${parseInt(selectedYear) + 543}${selectedDocTypeInfo?.frequency === 'period' ? ` - ${t('common.period') || 'งวด'} ${selectedPeriod}` : ''}`
                  }
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowPreview(false)}
                  className="btn btn-secondary"
                >
                  ← {t('export.backToSelect') || 'กลับไปเลือก'}
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={exporting}
                  className="btn btn-primary"
                >
                  {exporting ? (
                    <>
                      <span className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></span>
                      {t('export.exporting') || 'กำลังสร้าง PDF...'}
                    </>
                  ) : (
                    <>
                      📥 {t('export.downloadPDF') || 'ดาวน์โหลด PDF'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Document Previews */}
          <div style={{ background: '#555', padding: '24px', borderRadius: '8px', overflow: 'auto' }}>
            {renderPreview()}
          </div>
        </>
      )}
    </div>
  )
}
