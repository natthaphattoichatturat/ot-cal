'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface DashboardStats {
  totalEmployees: number
  activeEmployees: number
  totalWages: number
  lastMonthWages: number
  totalOTHours: number
  lastMonthOTHours: number
  avgOTPerEmployee: number
  topDepartment: { name: string; count: number; percentage: number }
  monthlyTrend: Array<{ month: string; wages: number; otHours: number }>
  departmentStats: Array<{ name: string; nameKey: string; employees: number; wages: number; percentage: number }>
  otDistribution: { normal: number; special: number; premium: number }
}

export default function DashboardPage() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth')

  useEffect(() => {
    // Mock data - will be replaced with API calls
    setTimeout(() => {
      setStats({
        totalEmployees: 248,
        activeEmployees: 235,
        totalWages: 4250000,
        lastMonthWages: 4040000,
        totalOTHours: 1834.5,
        lastMonthOTHours: 1638.0,
        avgOTPerEmployee: 7.8,
        topDepartment: { name: 'Production', count: 125, percentage: 50.4 },
        monthlyTrend: [
          { month: '1', wages: 3800000, otHours: 1520 },
          { month: '2', wages: 3950000, otHours: 1590 },
          { month: '3', wages: 4100000, otHours: 1680 },
          { month: '4', wages: 3850000, otHours: 1550 },
          { month: '5', wages: 4200000, otHours: 1780 },
          { month: '6', wages: 4250000, otHours: 1835 },
        ],
        departmentStats: [
          { name: 'Production', nameKey: 'deptProduction', employees: 125, wages: 2100000, percentage: 50.4 },
          { name: 'Quality Control', nameKey: 'deptQC', employees: 45, wages: 850000, percentage: 18.1 },
          { name: 'Warehouse', nameKey: 'deptWarehouse', employees: 35, wages: 650000, percentage: 14.1 },
          { name: 'Maintenance', nameKey: 'deptMaintenance', employees: 20, wages: 380000, percentage: 8.1 },
          { name: 'Administration', nameKey: 'deptAdmin', employees: 15, wages: 270000, percentage: 6.0 },
        ],
        otDistribution: { normal: 1245.5, special: 428.3, premium: 160.7 },
      })
      setLoading(false)
    }, 1000)
  }, [selectedPeriod])

  if (loading || !stats) {
    return (
      <div className="app-container">
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  const wageChange = ((stats.totalWages - stats.lastMonthWages) / stats.lastMonthWages * 100).toFixed(1)
  const otChange = ((stats.totalOTHours - stats.lastMonthOTHours) / stats.lastMonthOTHours * 100).toFixed(1)
  const maxWage = Math.max(...stats.monthlyTrend.map(m => m.wages))
  const maxOT = Math.max(...stats.monthlyTrend.map(m => m.otHours))
  const totalOT = stats.otDistribution.normal + stats.otDistribution.special + stats.otDistribution.premium

  return (
    <div className="app-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">{t('dashboard.title')}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              {t('dashboard.subtitle')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '14px' }}
            >
              <option value="thisMonth">{t('dashboard.thisMonth')}</option>
              <option value="lastMonth">{t('dashboard.lastMonth')}</option>
              <option value="thisQuarter">{t('dashboard.thisQuarter')}</option>
              <option value="thisYear">{t('dashboard.thisYear')}</option>
            </select>
            <a href="/" className="btn btn-secondary">
              {t('dashboard.backToHome')}
            </a>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Total Employees */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>
                {t('dashboard.totalEmployees')}
              </p>
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                {stats.totalEmployees}
              </h2>
              <p style={{ fontSize: '12px', color: '#059669', marginTop: '8px', fontWeight: '600' }}>
                ↑ {t('dashboard.activeEmployees')} {stats.activeEmployees} {t('common.people')}
              </p>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Total Wages */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>
                {t('dashboard.totalWages')}
              </p>
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                {(stats.totalWages / 1000000).toFixed(2)}M
              </h2>
              <p style={{ fontSize: '12px', color: parseFloat(wageChange) >= 0 ? '#059669' : '#dc2626', marginTop: '8px', fontWeight: '600' }}>
                {parseFloat(wageChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(wageChange))}% {t('dashboard.vsLastMonth')}
              </p>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Total OT Hours */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>
                {t('dashboard.totalOTHours')}
              </p>
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                {stats.totalOTHours.toLocaleString()}
              </h2>
              <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '8px', fontWeight: '600' }}>
                ≈ {stats.avgOTPerEmployee} {t('dashboard.avgPerEmployee')}
              </p>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Top Department */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>
                {t('dashboard.topDepartment')}
              </p>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, lineHeight: '1.2' }}>
                {t('dashboard.deptProduction')}
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: '600' }}>
                {stats.topDepartment.count} {t('dashboard.employeesCount')} ({stats.topDepartment.percentage}%)
              </p>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Line Chart & Pie Chart Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Line Chart - Wage & OT Trend */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
            {t('dashboard.wageTrend')}
          </h3>
          <div style={{ height: '280px', position: 'relative' }}>
            {/* Y-axis labels */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '8px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{(maxWage / 1000000).toFixed(1)}M</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{(maxWage / 2000000).toFixed(1)}M</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>0</div>
            </div>

            {/* Chart area */}
            <div style={{ marginLeft: '45px', height: '100%', position: 'relative' }}>
              {/* Grid lines */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} style={{ width: '100%', height: '1px', background: '#e5e7eb' }} />
                ))}
              </div>

              {/* Line chart - Lines Layer */}
              <svg width="100%" height="240" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
                {/* Wage line (green) */}
                <polyline
                  points={stats.monthlyTrend.map((item, index) => {
                    const x = (index / (stats.monthlyTrend.length - 1)) * 100
                    const y = 100 - (item.wages / maxWage) * 100
                    return `${x},${y}`
                  }).join(' ')}
                  fill="none"
                  stroke="#047857"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  style={{ opacity: 0.9 }}
                />
                {/* OT line (orange) */}
                <polyline
                  points={stats.monthlyTrend.map((item, index) => {
                    const x = (index / (stats.monthlyTrend.length - 1)) * 100
                    const y = 100 - (item.otHours / maxOT) * 100
                    return `${x},${y}`
                  }).join(' ')}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="4"
                  strokeDasharray="8,8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  style={{ opacity: 0.9 }}
                />
              </svg>

              {/* Line chart - Points Layer */}
              <svg width="100%" height="240" style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
                {/* Wage points */}
                {stats.monthlyTrend.map((item, index) => {
                  const x = (index / (stats.monthlyTrend.length - 1)) * 100
                  const y = 100 - (item.wages / maxWage) * 100
                  return (
                    <circle
                      key={`wage-${index}`}
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="5"
                      fill="#059669"
                      stroke="white"
                      strokeWidth="2"
                    />
                  )
                })}

                {/* OT points */}
                {stats.monthlyTrend.map((item, index) => {
                  const x = (index / (stats.monthlyTrend.length - 1)) * 100
                  const y = 100 - (item.otHours / maxOT) * 100
                  return (
                    <circle
                      key={`ot-${index}`}
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="5"
                      fill="#f59e0b"
                      stroke="white"
                      strokeWidth="2"
                    />
                  )
                })}
              </svg>

              {/* X-axis labels */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
                {stats.monthlyTrend.map((item, index) => (
                  <div key={index} style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center', flex: 1 }}>
                    {t(`dashboard.monthShort${item.month}`)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '24px', marginTop: '16px', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '24px', height: '3px', background: '#059669', borderRadius: '2px' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t('dashboard.wages')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '24px', height: '3px', background: '#f59e0b', borderRadius: '2px' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t('dashboard.otHours')}</span>
            </div>
          </div>
        </div>

        {/* Pie Chart - Department Breakdown */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
            {t('dashboard.departmentBreakdown')}
          </h3>

          {/* Pie Chart */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="70" fill="none" stroke="#e5e7eb" strokeWidth="40" />

              {/* Pie slices */}
              {(() => {
                let currentAngle = -90 // Start from top
                const colors = ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe']
                return stats.departmentStats.map((dept, index) => {
                  const angle = (dept.percentage / 100) * 360
                  const startAngle = currentAngle
                  const endAngle = currentAngle + angle
                  currentAngle = endAngle

                  // Calculate arc path
                  const startRad = (startAngle * Math.PI) / 180
                  const endRad = (endAngle * Math.PI) / 180
                  const x1 = 90 + 70 * Math.cos(startRad)
                  const y1 = 90 + 70 * Math.sin(startRad)
                  const x2 = 90 + 70 * Math.cos(endRad)
                  const y2 = 90 + 70 * Math.sin(endRad)
                  const largeArc = angle > 180 ? 1 : 0

                  return (
                    <path
                      key={index}
                      d={`M 90 90 L ${x1} ${y1} A 70 70 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={colors[index]}
                    />
                  )
                })
              })()}

              {/* Center circle */}
              <circle cx="90" cy="90" r="45" fill="var(--bg-surface)" />
              <text x="90" y="85" textAnchor="middle" style={{ fontSize: '24px', fontWeight: '700', fill: 'var(--text-primary)' }}>
                {stats.totalEmployees}
              </text>
              <text x="90" y="100" textAnchor="middle" style={{ fontSize: '11px', fill: 'var(--text-muted)' }}>
                {t('common.people')}
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.departmentStats.map((dept, index) => {
              const colors = ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe']
              return (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: colors[index], flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t(`dashboard.${dept.nameKey}`)}</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {dept.employees}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bar Chart & Insights Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* OT Distribution Bar Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
            {t('dashboard.otDistribution')}
          </h3>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '20px', height: '220px', paddingBottom: '40px' }}>
            {/* Normal OT Bar */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                {stats.otDistribution.normal}
              </div>
              <div
                style={{
                  width: '100%',
                  maxWidth: '80px',
                  background: 'linear-gradient(180deg, #3b82f6 0%, #60a5fa 100%)',
                  borderRadius: '8px 8px 0 0',
                  height: `${(stats.otDistribution.normal / totalOT) * 100}%`,
                  minHeight: '20px',
                  boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
                {t('dashboard.normalOT')}
              </div>
              <div style={{ fontSize: '10px', color: '#3b82f6', fontWeight: '600', marginTop: '2px' }}>
                {((stats.otDistribution.normal / totalOT) * 100).toFixed(1)}%
              </div>
            </div>

            {/* Special OT Bar */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                {stats.otDistribution.special}
              </div>
              <div
                style={{
                  width: '100%',
                  maxWidth: '80px',
                  background: 'linear-gradient(180deg, #f59e0b 0%, #fbbf24 100%)',
                  borderRadius: '8px 8px 0 0',
                  height: `${(stats.otDistribution.special / totalOT) * 100}%`,
                  minHeight: '20px',
                  boxShadow: '0 4px 6px rgba(245, 158, 11, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
                {t('dashboard.specialOT')}
              </div>
              <div style={{ fontSize: '10px', color: '#f59e0b', fontWeight: '600', marginTop: '2px' }}>
                {((stats.otDistribution.special / totalOT) * 100).toFixed(1)}%
              </div>
            </div>

            {/* Premium OT Bar */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                {stats.otDistribution.premium}
              </div>
              <div
                style={{
                  width: '100%',
                  maxWidth: '80px',
                  background: 'linear-gradient(180deg, #059669 0%, #10b981 100%)',
                  borderRadius: '8px 8px 0 0',
                  height: `${(stats.otDistribution.premium / totalOT) * 100}%`,
                  minHeight: '20px',
                  boxShadow: '0 4px 6px rgba(5, 150, 105, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
                {t('dashboard.premiumOT')}
              </div>
              <div style={{ fontSize: '10px', color: '#059669', fontWeight: '600', marginTop: '2px' }}>
                {((stats.otDistribution.premium / totalOT) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('dashboard.totalOT')}</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {totalOT.toLocaleString()} {t('common.hours')}
            </div>
          </div>
        </div>

        {/* Insights & Alerts */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
            {t('dashboard.insights')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* High OT Alert */}
            <div
              style={{
                padding: '14px',
                background: '#fef3c7',
                borderRadius: '8px',
                borderLeft: '4px solid #f59e0b'
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#78350f', marginBottom: '4px' }}>
                {t('dashboard.highOTAlert')}
              </div>
              <div style={{ fontSize: '11px', color: '#92400e', lineHeight: '1.5' }}>
                {t('dashboard.currentMonth')}: {stats.totalOTHours.toFixed(0)} {t('common.hours')} | {t('dashboard.lastMonthData')}: {stats.lastMonthOTHours.toFixed(0)} {t('common.hours')}
              </div>
            </div>

            {/* Wage Growth */}
            <div
              style={{
                padding: '14px',
                background: '#d1fae5',
                borderRadius: '8px',
                borderLeft: '4px solid #059669'
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#064e3b', marginBottom: '4px' }}>
                {t('dashboard.wageGrowth')}
              </div>
              <div style={{ fontSize: '11px', color: '#065f46', lineHeight: '1.5' }}>
                ฿{(stats.totalWages / 1000000).toFixed(2)}M ({wageChange >= '0' ? '+' : ''}{wageChange}%)
              </div>
            </div>

            {/* Top Performer */}
            <div
              style={{
                padding: '14px',
                background: '#dbeafe',
                borderRadius: '8px',
                borderLeft: '4px solid #3b82f6'
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e3a8a', marginBottom: '4px' }}>
                {t('dashboard.topPerformer')}
              </div>
              <div style={{ fontSize: '11px', color: '#1e40af', lineHeight: '1.5' }}>
                {stats.topDepartment.count} {t('common.people')} • {stats.topDepartment.percentage}% {t('dashboard.totalEmployees').toLowerCase()}
              </div>
            </div>

            {/* Cost Optimization */}
            <div
              style={{
                padding: '14px',
                background: '#f3e8ff',
                borderRadius: '8px',
                borderLeft: '4px solid #8b5cf6'
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#5b21b6', marginBottom: '4px' }}>
                {t('dashboard.costOptimization')}
              </div>
              <div style={{ fontSize: '11px', color: '#6b21a8', lineHeight: '1.5' }}>
                {t('dashboard.premiumOT')}: {stats.otDistribution.premium} {t('common.hours')} ({((stats.otDistribution.premium / totalOT) * 100).toFixed(1)}%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Statistics & Monthly Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px', marginBottom: '24px' }}>
        {/* Department Statistics Table */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
            {t('dashboard.departmentStats')}
          </h3>
          <div className="table-wrapper" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('dashboard.deptName')}</th>
                  <th className="text-center">{t('dashboard.deptEmployees')}</th>
                  <th className="text-center">{t('dashboard.deptWages')}</th>
                  <th className="text-center">{t('dashboard.deptAvgPerPerson')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.departmentStats.map((dept, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: '600' }}>{t(`dashboard.${dept.nameKey}`)}</td>
                    <td className="text-center">{dept.employees}</td>
                    <td className="text-center">{dept.wages.toLocaleString()}</td>
                    <td className="text-center" style={{ fontWeight: '600', color: 'var(--primary)' }}>
                      {Math.round(dept.wages / dept.employees).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
            {t('dashboard.monthlyComparison')}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Wages Comparison */}
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>
                {t('dashboard.wages')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('dashboard.currentMonth')}</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    ฿{(stats.totalWages / 1000000).toFixed(2)}M
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('dashboard.change')}</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: parseFloat(wageChange) >= 0 ? '#059669' : '#dc2626' }}>
                    {parseFloat(wageChange) >= 0 ? '+' : ''}{wageChange}%
                  </div>
                </div>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(stats.totalWages / (stats.totalWages + stats.lastMonthWages)) * 100}%`,
                  height: '100%',
                  background: parseFloat(wageChange) >= 0 ? 'linear-gradient(90deg, #059669 0%, #10b981 100%)' : 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)'
                }} />
              </div>
            </div>

            {/* OT Hours Comparison */}
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>
                {t('dashboard.otHours')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('dashboard.currentMonth')}</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {stats.totalOTHours.toFixed(0)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('dashboard.change')}</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: parseFloat(otChange) >= 0 ? '#f59e0b' : '#059669' }}>
                    {parseFloat(otChange) >= 0 ? '+' : ''}{otChange}%
                  </div>
                </div>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(stats.totalOTHours / (stats.totalOTHours + stats.lastMonthOTHours)) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)'
                }} />
              </div>
            </div>

            {/* Summary Box */}
            <div style={{ marginTop: '12px', padding: '14px', background: 'var(--bg-surface)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {t('dashboard.lastMonthData')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span>{t('dashboard.wages')}: ฿{(stats.lastMonthWages / 1000000).toFixed(2)}M</span>
                <span>{t('dashboard.otHours')}: {stats.lastMonthOTHours.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
