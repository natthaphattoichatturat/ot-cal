'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import PayslipPreview from '@/components/PayslipPreview'
import { PayslipData } from '@/types/payslip'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface Employee {
  employee_id: string
  name: string
  department: string
}

export default function ExportPage() {
  const { t } = useLanguage()

  // Selection states
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null)
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
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState('')

  const payslipRefs = useRef<(HTMLDivElement | null)[]>([])

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
    if (selectedEmployees.length === 0) {
      setMessage(t('export.selectAtLeastOne'))
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const monthStr = `${selectedYear}-${selectedMonth}`
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
    } catch (error) {
      console.error('Error generating preview:', error)
      setMessage(`${t('common.error')}: ${t('export.generateError')}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (payslips.length === 0) return

    setExporting(true)
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const margin = 10
      const contentWidth = pdfWidth - (margin * 2)

      for (let i = 0; i < payslips.length; i++) {
        const element = payslipRefs.current[i]
        if (!element) continue

        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true
        })

        const imgData = canvas.toDataURL('image/png')
        const imgWidth = canvas.width
        const imgHeight = canvas.height
        const ratio = contentWidth / imgWidth
        const imgHeightScaled = imgHeight * ratio

        if (i > 0) {
          pdf.addPage()
        }

        pdf.addImage(imgData, 'PNG', margin, 15, contentWidth, imgHeightScaled)
      }

      const monthName = t(`months.${parseInt(selectedMonth)}`)
      const yearThai = parseInt(selectedYear) + 543
      pdf.save(`payslips_${monthName}_${yearThai}_period${selectedPeriod}.pdf`)

    } catch (error) {
      console.error('Error generating PDF:', error)
      setMessage(`${t('common.error')}: ${t('export.pdfError')}`)
    } finally {
      setExporting(false)
    }
  }

  const documentTypes = [
    {
      id: 'payslip',
      name: t('export.payslip'),
      description: t('export.payslipDesc'),
      icon: '📄'
    }
    // สามารถเพิ่มประเภทเอกสารอื่นได้ในอนาคต
  ]

  return (
    <div className="app-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">{t('export.title')}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              {t('export.subtitle')}
            </p>
          </div>
          <a href="/" className="btn btn-secondary">
            ← {t('common.back')}
          </a>
        </div>
      </div>

      {!showPreview ? (
        <>
          {/* Step 1: Select Document Type */}
          <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
              {t('export.step1')}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {documentTypes.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocType(doc.id)}
                  style={{
                    padding: '20px',
                    border: selectedDocType === doc.id ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: selectedDocType === doc.id ? 'var(--primary-light)' : 'var(--surface-bg)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>{doc.icon}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{doc.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{doc.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Select Period (only if document type selected) */}
          {selectedDocType && (
            <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
                {t('export.step2')}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                {/* Month */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    {t('common.month')}
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

                {/* Year */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    {t('common.year')}
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
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    {t('common.period')}
                  </label>
                  <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(Number(e.target.value) as 1 | 2)}>
                    <option value={1}>{t('export.period1')}</option>
                    <option value={2}>{t('export.period2')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Select Employees */}
          {selectedDocType && (
            <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
                {t('export.step3')}
              </h2>

              {/* Search Box */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('export.searchPlaceholder')}
                    style={{ flex: 1, padding: '10px 14px', fontSize: '14px' }}
                  />
                  <button
                    onClick={selectAllEmployees}
                    className="btn btn-secondary"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {selectedEmployees.length === filteredEmployees.length ? t('common.cancel') : t('export.selectAll')}
                  </button>
                </div>
                {(searchQuery || searching) && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {searching ? t('export.searching') : `${t('export.found')} ${filteredEmployees.length} ${t('common.people')}`}
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
                    {t('export.noEmployees')}
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
                {t('export.selected')}: {selectedEmployees.length} {t('common.people')}
              </div>
            </div>
          )}

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
                disabled={loading || selectedEmployees.length === 0}
                className="btn btn-primary"
                style={{ padding: '14px 48px', fontSize: '16px' }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></span>
                    {t('export.generating')}
                  </>
                ) : (
                  <>
                    📄 {t('export.preview')}
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
                  {t('export.previewTitle')} ({payslips.length} {t('common.people')})
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {t(`months.${parseInt(selectedMonth)}`)} {parseInt(selectedYear) + 543} - {t('common.period')} {selectedPeriod}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowPreview(false)}
                  className="btn btn-secondary"
                >
                  ← {t('export.backToSelect')}
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={exporting}
                  className="btn btn-primary"
                >
                  {exporting ? (
                    <>
                      <span className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></span>
                      {t('export.exporting')}
                    </>
                  ) : (
                    <>
                      📥 {t('export.downloadPDF')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Payslip Previews */}
          <div style={{ background: '#555', padding: '24px', borderRadius: '8px' }}>
            {payslips.map((payslip, index) => (
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
            ))}
          </div>
        </>
      )}
    </div>
  )
}
