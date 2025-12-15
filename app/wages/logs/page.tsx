'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface AdjustmentLog {
  source_type: 'manual' | 'auto'
  id: number
  employee_id: string
  employee_name: string
  department: string
  year: number
  month: number
  period: number
  adjustment_type: 'income' | 'deduction'
  category: string
  amount: number
  description: string | null
  details: any
  created_at: string
  performed_by: string
  can_edit: boolean
  can_delete: boolean
}

export default function WageLogsPage() {
  const [logs, setLogs] = useState<AdjustmentLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AdjustmentLog[]>([])
  const [loading, setLoading] = useState(false)

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([1, 2])
  const [searchQuery, setSearchQuery] = useState('')
  const [includeAuto, setIncludeAuto] = useState(true) // แสดงรายการอัตโนมัติด้วย
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('') // ค้นหาพนักงาน
  const [searchingEmployees, setSearchingEmployees] = useState(false)

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AdjustmentLog | null>(null)
  const [editCategory, setEditCategory] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [saving, setSaving] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Initialize with current month/year
  useEffect(() => {
    const now = new Date()
    setSelectedMonth((now.getMonth() + 1).toString().padStart(2, '0'))
    setSelectedYear(now.getFullYear().toString())
  }, [])

  // Fetch logs when filters change
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchLogs()
    }
  }, [selectedMonth, selectedYear, selectedPeriods, includeAuto])

  // Filter logs when search query changes
  useEffect(() => {
    filterLogs()
  }, [searchQuery, employeeSearchQuery, logs])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const periodsParam = selectedPeriods.join(',')
      const res = await fetch(
        `/api/wages/adjustments?month=${selectedMonth}&year=${selectedYear}&periods=${periodsParam}&includeAuto=${includeAuto}`
      )
      const data = await res.json()

      if (data.success) {
        setLogs(data.data)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterLogs = () => {
    let filtered = logs

    // Filter by search query (category, description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        log =>
          log.category.toLowerCase().includes(query) ||
          log.description?.toLowerCase().includes(query)
      )
    }

    // Filter by employee search (only if not empty)
    if (employeeSearchQuery.trim()) {
      const query = employeeSearchQuery.toLowerCase()
      filtered = filtered.filter(
        log =>
          log.employee_id.toLowerCase().includes(query) ||
          log.employee_name.toLowerCase().includes(query)
      )
    }

    setFilteredLogs(filtered)
    setCurrentPage(1)
  }

  const togglePeriod = (period: number) => {
    if (selectedPeriods.includes(period)) {
      if (selectedPeriods.length > 1) {
        setSelectedPeriods(selectedPeriods.filter(p => p !== period))
      }
    } else {
      setSelectedPeriods([...selectedPeriods, period].sort())
    }
  }

  const handleEdit = (log: AdjustmentLog) => {
    setSelectedLog(log)
    setEditCategory(log.category)
    setEditAmount(log.amount.toString())
    setEditDescription(log.description || '')
    setShowEditModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) return

    try {
      const res = await fetch(`/api/wages/adjustments?id=${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()

      if (data.success) {
        alert('ลบรายการสำเร็จ')
        fetchLogs()
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.error)
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการลบ')
      console.error('Delete error:', error)
    }
  }

  const handleDuplicate = (log: AdjustmentLog) => {
    setEditCategory(log.category)
    setEditAmount(log.amount.toString())
    setEditDescription(log.description || '')
    setShowAddModal(true)
  }

  const saveEdit = async () => {
    if (!editCategory || !editAmount) {
      alert('กรุณากรอกข้อมูลให้ครบ')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/wages/adjustments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedLog!.id,
          category: editCategory,
          amount: parseFloat(editAmount),
          description: editDescription
        })
      })

      const data = await res.json()

      if (data.success) {
        alert('แก้ไขสำเร็จ')
        setShowEditModal(false)
        fetchLogs()
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.error)
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการแก้ไข')
      console.error('Edit error:', error)
    } finally {
      setSaving(false)
    }
  }

  const saveAdd = async () => {
    if (!editCategory || !editAmount || !selectedLog) {
      alert('กรุณากรอกข้อมูลให้ครบ')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/wages/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: selectedLog.employee_id,
          year: selectedLog.year,
          month: selectedLog.month,
          period: selectedLog.period,
          adjustment_type: selectedLog.adjustment_type,
          category: editCategory,
          amount: parseFloat(editAmount),
          description: editDescription,
          created_by: 'admin'
        })
      })

      const data = await res.json()

      if (data.success) {
        alert('เพิ่มรายการสำเร็จ')
        setShowAddModal(false)
        fetchLogs()
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.error)
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการเพิ่ม')
      console.error('Add error:', error)
    } finally {
      setSaving(false)
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentLogs = filteredLogs.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const Pagination = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
      <button
        className="btn btn-secondary"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ← ก่อนหน้า
      </button>

      <div style={{ display: 'flex', gap: '8px' }}>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum
          if (totalPages <= 5) {
            pageNum = i + 1
          } else if (currentPage <= 3) {
            pageNum = i + 1
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i
          } else {
            pageNum = currentPage - 2 + i
          }

          return (
            <button
              key={pageNum}
              className={currentPage === pageNum ? 'btn btn-primary' : 'btn btn-secondary'}
              onClick={() => goToPage(pageNum)}
              style={{ minWidth: '40px' }}
            >
              {pageNum}
            </button>
          )
        })}
      </div>

      <button
        className="btn btn-secondary"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ถัดไป →
      </button>
    </div>
  )

  return (
    <div className="app-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">ประวัติการปรับเงิน</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              บันทึกการเพิ่มเงินได้และเงินหัก (รายการ Manual และ Auto)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              ➕ เพิ่มรายการใหม่
            </button>
            <a href="/wages" className="btn btn-secondary">
              ← กลับไปหน้าค่าจ้าง
            </a>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            {/* เลือกปี */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                ปี
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">เลือกปี</option>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i
                  return (
                    <option key={year} value={year}>
                      {year + 543}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* เลือกเดือน */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                เดือน
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">เลือกเดือน</option>
                {[
                  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
                ].map((month, index) => (
                  <option key={index + 1} value={(index + 1).toString().padStart(2, '0')}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            {/* Search พนักงาน */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                ค้นหาพนักงาน (รหัส/ชื่อ)
              </label>
              <input
                type="text"
                value={employeeSearchQuery}
                onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                placeholder="ค้นหา..."
                style={{ width: '100%' }}
              />
            </div>

            {/* Search หมวดหมู่/หมายเหตุ */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                ค้นหาหมวดหมู่/หมายเหตุ
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหา..."
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Period & Auto Filters */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Period Filters */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                งวดที่แสดง
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '2px solid',
                    borderColor: selectedPeriods.includes(1) ? 'var(--primary)' : 'var(--border-light)',
                    background: selectedPeriods.includes(1) ? 'var(--primary-light)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedPeriods.includes(1)}
                    onChange={() => togglePeriod(1)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>งวด 1</span>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '2px solid',
                    borderColor: selectedPeriods.includes(2) ? 'var(--primary)' : 'var(--border-light)',
                    background: selectedPeriods.includes(2) ? 'var(--primary-light)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedPeriods.includes(2)}
                    onChange={() => togglePeriod(2)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>งวด 2</span>
                </label>
              </div>
            </div>

            {/* Auto Logs Toggle */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                แสดงรายการ
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '2px solid',
                  borderColor: includeAuto ? 'var(--success)' : 'var(--border-light)',
                  background: includeAuto ? '#dcfce7' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="checkbox"
                  checked={includeAuto}
                  onChange={(e) => setIncludeAuto(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  รายการอัตโนมัติ (มาสาย, เบี้ยขยัน, SSO)
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            แสดง {startIndex + 1}-{Math.min(endIndex, filteredLogs.length)} จาก {filteredLogs.length} รายการ
            {employeeSearchQuery && ` (กรองตามพนักงาน: "${employeeSearchQuery}")`}
            {searchQuery && ` (กรองตามหมวดหมู่: "${searchQuery}")`}
          </div>
          {loading && <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>กำลังโหลด...</div>}
        </div>
      </div>

      {/* Logs Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '100px' }}>ประเภท</th>
                <th style={{ minWidth: '120px' }}>วันที่/เวลา</th>
                <th style={{ minWidth: '60px' }}>งวด</th>
                <th style={{ minWidth: '100px' }}>รหัสพนักงาน</th>
                <th style={{ minWidth: '150px' }}>ชื่อพนักงาน</th>
                <th style={{ minWidth: '100px' }}>แผนก</th>
                <th style={{ minWidth: '80px' }}>ประเภท</th>
                <th style={{ minWidth: '150px' }}>หมวดหมู่</th>
                <th className="text-right" style={{ minWidth: '100px' }}>จำนวนเงิน</th>
                <th style={{ minWidth: '200px' }}>หมายเหตุ</th>
                <th style={{ minWidth: '100px' }}>ผู้บันทึก</th>
                <th style={{ minWidth: '200px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : currentLogs.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    {searchQuery || employeeSearchQuery ? 'ไม่พบข้อมูลที่ค้นหา' : 'ไม่มีประวัติการปรับเงิน'}
                  </td>
                </tr>
              ) : (
                currentLogs.map((log) => (
                  <tr key={`${log.source_type}-${log.id}`}>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: log.source_type === 'auto' ? '#f3f4f6' : '#dbeafe',
                        color: log.source_type === 'auto' ? '#6b7280' : '#1e40af'
                      }}>
                        {log.source_type === 'auto' ? '🤖 Auto' : '👤 Manual'}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: log.period === 1 ? '#dbeafe' : '#dcfce7',
                        color: log.period === 1 ? '#1e40af' : '#16a34a',
                        fontWeight: '600'
                      }}>
                        {log.period}
                      </span>
                    </td>
                    <td>{log.employee_id}</td>
                    <td className="employee-name">{log.employee_name}</td>
                    <td>{log.department}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: log.adjustment_type === 'income' ? '#dcfce7' : '#fee2e2',
                        color: log.adjustment_type === 'income' ? '#16a34a' : '#dc2626'
                      }}>
                        {log.adjustment_type === 'income' ? '+ เพิ่ม' : '- หัก'}
                      </span>
                    </td>
                    <td>{log.category}</td>
                    <td className="text-right" style={{
                      fontWeight: '600',
                      color: log.adjustment_type === 'income' ? '#16a34a' : '#dc2626'
                    }}>
                      {log.adjustment_type === 'income' ? '+' : '-'}{log.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {log.description || '-'}
                    </td>
                    <td>{log.performed_by}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {log.can_edit && (
                          <button
                            onClick={() => handleEdit(log)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            ✏️ แก้ไข
                          </button>
                        )}
                        {log.source_type === 'manual' && (
                          <button
                            onClick={() => {
                              setSelectedLog(log)
                              handleDuplicate(log)
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            📋 ทำซ้ำ
                          </button>
                        )}
                        {log.can_delete && (
                          <button
                            onClick={() => handleDelete(log.id)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '12px', background: '#fee2e2', color: '#dc2626' }}
                          >
                            🗑️ ลบ
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && <Pagination />}

      {/* Edit Modal */}
      {showEditModal && selectedLog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '500px',
              width: '100%',
              padding: '24px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
              ✏️ แก้ไขรายการ
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                พนักงาน
              </label>
              <input
                type="text"
                value={`${selectedLog.employee_id} - ${selectedLog.employee_name}`}
                disabled
                style={{ width: '100%', background: '#f3f4f6', color: '#6b7280' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                หมวดหมู่ *
              </label>
              <input
                type="text"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                placeholder="เช่น โบนัส, ค่าครองชีพ"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                จำนวนเงิน * (บาท)
              </label>
              <input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                หมายเหตุ
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="หมายเหตุเพิ่มเติม..."
                rows={3}
                style={{ width: '100%', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-secondary"
                disabled={saving}
              >
                ยกเลิก
              </button>
              <button
                onClick={saveEdit}
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'กำลังบันทึก...' : '💾 บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Duplicate Modal */}
      {showAddModal && selectedLog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '500px',
              width: '100%',
              padding: '24px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
              ➕ เพิ่มรายการใหม่ (ทำซ้ำ)
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                พนักงาน
              </label>
              <input
                type="text"
                value={`${selectedLog.employee_id} - ${selectedLog.employee_name}`}
                disabled
                style={{ width: '100%', background: '#f3f4f6', color: '#6b7280' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                หมวดหมู่ *
              </label>
              <input
                type="text"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                placeholder="เช่น โบนัส, ค่าครองชีพ"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                จำนวนเงิน * (บาท)
              </label>
              <input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                หมายเหตุ
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="หมายเหตุเพิ่มเติม..."
                rows={3}
                style={{ width: '100%', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-secondary"
                disabled={saving}
              >
                ยกเลิก
              </button>
              <button
                onClick={saveAdd}
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'กำลังบันทึก...' : '➕ เพิ่มรายการ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
