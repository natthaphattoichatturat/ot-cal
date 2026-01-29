'use client'

import React, { forwardRef } from 'react'
import { PayslipData } from '@/types/payslip'
import { formatCurrency } from '@/utils/formatters'

interface PayslipPreviewProps {
  data: PayslipData
}

const PayslipPreview = forwardRef<HTMLDivElement, PayslipPreviewProps>(({ data }, ref) => {
  // คำนวณยอดรวม
  const totalAdditions = data.additions.reduce((acc, item) => acc + item.amount, 0)
  const totalDeductions = data.deductions.reduce((acc, item) => acc + item.amount, 0)
  const totalIncome = data.salary + totalAdditions
  const netIncome = totalIncome - totalDeductions

  // ดึงค่า SSO และภาษีจาก deductions
  const currentTax = data.deductions.find(d => d.name.includes('ภาษี'))?.amount || 0
  const currentSSO = data.deductions.find(d => d.name.includes('ประกันสังคม'))?.amount || 0

  // YTD values (รวมงวดปัจจุบัน)
  const ytdIncome = data.ytd.income + data.salary
  const ytdTax = data.ytd.tax + currentTax
  const ytdSSO = data.ytd.socialSecurity + currentSSO
  const ytdTotalIncome = data.ytd.totalIncome + totalIncome
  const ytdTotalDeduction = data.ytd.totalDeduction + totalDeductions
  const ytdNet = ytdTotalIncome - ytdTotalDeduction

  return (
    <div
      ref={ref}
      id="payslip-content"
      style={{
        width: '277mm',
        minHeight: '190mm',
        backgroundColor: '#ffffff',
        color: '#000000',
        padding: '8mm 10mm',
        fontFamily: '"Sarabun", "Noto Sans Thai", sans-serif',
        fontSize: '11px',
        lineHeight: '1.5',
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      {/* === HEADER === */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderBottom: '1px solid #000',
        paddingBottom: '6px',
        marginBottom: '8px'
      }}>
        <div style={{ width: '33%', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>
          {data.companyName}
        </div>
        <div style={{ width: '34%', textAlign: 'center', fontSize: '18px', fontWeight: '700' }}>
          ใบจ่ายเงินเดือนพนักงาน
        </div>
        <div style={{ width: '33%', textAlign: 'right', fontSize: '11px' }}>
          วันที่: {data.dateRange}
        </div>
      </div>

      {/* === EMPLOYEE INFO === */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '6px',
        marginBottom: '4px',
        fontSize: '11px',
        whiteSpace: 'nowrap'
      }}>
        <div style={{ width: '12%' }}>รหัส: {data.employee.code}</div>
        <div style={{ width: '28%' }}>ชื่อ: {data.employee.name}</div>
        <div style={{ width: '20%' }}>ตำแหน่ง: {data.employee.position}</div>
        <div style={{ width: '40%', textAlign: 'right' }}>
          ฝ่าย: {data.employee.department} &nbsp;&nbsp;&nbsp; แผนก: {data.employee.section}
        </div>
      </div>

      {/* Double Line Separator */}
      <div style={{ borderTop: '1px solid #000', marginBottom: '2px' }}></div>
      <div style={{ borderTop: '1px solid #000', marginBottom: '10px' }}></div>

      {/* === INCOME ROW 1 (เงินเดือน + OT + ค่าตำแหน่ง ฯลฯ) === */}
      {/* Headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(11, 1fr)',
        gap: '4px',
        textAlign: 'center',
        color: '#666',
        fontSize: '10px',
        marginBottom: '4px'
      }}>
        <div style={{ textAlign: 'left' }}>เงินเดือน</div>
        <div>{data.additions[0]?.name || 'OT1'}</div>
        <div>{data.additions[1]?.name || 'OT2'}</div>
        <div>{data.additions[2]?.name || 'OT3'}</div>
        <div>{data.additions[3]?.name || 'OT4'}</div>
        <div>{data.additions[4]?.name || 'ค่าตำแหน่ง'}</div>
        <div>{data.additions[5]?.name || 'เบี้ยขยัน'}</div>
        <div>{data.additions[6]?.name || 'ค่ากะ'}</div>
        <div>{data.additions[7]?.name || 'ค่าโทรศัพท์'}</div>
        <div>{data.additions[8]?.name || 'ค่าครองชีพ'}</div>
        <div>{data.additions[9]?.name || 'ค่าพิเศษ'}</div>
      </div>
      {/* Values */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(11, 1fr)',
        gap: '4px',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: '11px',
        marginBottom: '12px'
      }}>
        <div style={{ textAlign: 'left' }}>{formatCurrency(data.salary)}</div>
        <div>{formatCurrency(data.additions[0]?.amount || 0)}</div>
        <div>{formatCurrency(data.additions[1]?.amount || 0)}</div>
        <div>{formatCurrency(data.additions[2]?.amount || 0)}</div>
        <div>{formatCurrency(data.additions[3]?.amount || 0)}</div>
        <div>{formatCurrency(data.additions[4]?.amount || 0)}</div>
        <div>{formatCurrency(data.additions[5]?.amount || 0)}</div>
        <div>{formatCurrency(data.additions[6]?.amount || 0)}</div>
        <div>{formatCurrency(data.additions[7]?.amount || 0)}</div>
        <div>{formatCurrency(data.additions[8]?.amount || 0)}</div>
        <div>{formatCurrency(data.additions[9]?.amount || 0)}</div>
      </div>

      {/* === INCOME ROW 2 (ค่าอื่นๆ + โบนัส + รวมรายได้) === */}
      {/* Headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 2fr 1fr 1fr 2fr 1fr 3fr',
        gap: '4px',
        textAlign: 'center',
        color: '#666',
        fontSize: '10px',
        marginBottom: '4px'
      }}>
        <div style={{ textAlign: 'left', paddingLeft: '24px' }}>{data.additions[10]?.name || 'ค่าอื่นๆ'}</div>
        <div>{data.additions[11]?.name || 'ค่าอื่นๆ (พิเศษ)'}</div>
        <div>{data.additions[12]?.name || 'คืนเบี้ยขยัน'}</div>
        <div>{data.additions[13]?.name || 'คืนพักร้อน'}</div>
        <div>{data.additions[14]?.name || 'โบนัสรายเดือน'}</div>
        <div>{data.additions[15]?.name || 'โบนัสรายปี'}</div>
        <div style={{ textAlign: 'right' }}>รายได้รวม</div>
      </div>
      {/* Values */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 2fr 1fr 1fr 2fr 1fr 3fr',
        gap: '4px',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: '11px',
        marginBottom: '10px'
      }}>
        <div style={{ textAlign: 'left', paddingLeft: '24px' }}>{formatCurrency(data.additions[10]?.amount || 0)}</div>
        <div>{formatCurrency(data.additions[11]?.amount || 0)}</div>
        <div>{formatCurrency(data.additions[12]?.amount || 0)}</div>
        <div>{formatCurrency(data.additions[13]?.amount || 0)}</div>
        <div>{formatCurrency(data.additions[14]?.amount || 0)}</div>
        <div>{formatCurrency(data.additions[15]?.amount || 0)}</div>
        <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700' }}>{formatCurrency(totalIncome)}</div>
      </div>

      {/* Dotted Separator */}
      <div style={{ borderTop: '1px dotted #888', marginTop: '8px', marginBottom: '10px' }}></div>

      {/* === DEDUCTION ROW 1 (มาสาย, ขาดงาน, ค่าชุด ฯลฯ) === */}
      {/* Headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 2fr 1fr 1fr 1fr 1fr 1fr',
        gap: '4px',
        textAlign: 'center',
        color: '#666',
        fontSize: '10px',
        marginBottom: '4px'
      }}>
        <div style={{ textAlign: 'left', paddingLeft: '24px' }}>{data.deductions[3]?.name || 'มาสาย'}</div>
        <div>{data.deductions[4]?.name || 'ขาดงาน'}</div>
        <div>{data.deductions[5]?.name || 'ลากิจ'}</div>
        <div>{data.deductions[6]?.name || 'ค่าชุดฟอร์ม/หักกยศ.'}</div>
        <div>{data.deductions[7]?.name || 'สหกรณ์'}</div>
        <div>{data.deductions[8]?.name || 'งานเสีย'}</div>
        <div>{data.deductions[9]?.name || 'ค่าฌาปนกิจ'}</div>
        <div>{data.deductions[10]?.name || 'หักค่าพิเศษ'}</div>
        <div>{data.deductions[11]?.name || 'หักค่าอื่นๆ'}</div>
      </div>
      {/* Values */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 2fr 1fr 1fr 1fr 1fr 1fr',
        gap: '4px',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: '11px',
        marginBottom: '12px'
      }}>
        <div style={{ textAlign: 'left', paddingLeft: '24px' }}>{formatCurrency(data.deductions[3]?.amount || 0)}</div>
        <div>{formatCurrency(data.deductions[4]?.amount || 0)}</div>
        <div>{formatCurrency(data.deductions[5]?.amount || 0)}</div>
        <div>{formatCurrency(data.deductions[6]?.amount || 0)}</div>
        <div>{formatCurrency(data.deductions[7]?.amount || 0)}</div>
        <div>{formatCurrency(data.deductions[8]?.amount || 0)}</div>
        <div>{formatCurrency(data.deductions[9]?.amount || 0)}</div>
        <div>{formatCurrency(data.deductions[10]?.amount || 0)}</div>
        <div>{formatCurrency(data.deductions[11]?.amount || 0)}</div>
      </div>

      {/* === DEDUCTION ROW 2 (ภาษี + ประกันสังคม + รวมรายจ่าย) === */}
      {/* Headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 3fr 4fr 3fr',
        gap: '4px',
        textAlign: 'center',
        color: '#666',
        fontSize: '10px',
        marginBottom: '4px'
      }}>
        <div style={{ textAlign: 'left', paddingLeft: '24px' }}>{data.deductions[1]?.name || 'ภาษีเงินได้'}</div>
        <div>{data.deductions[0]?.name || 'ประกันสังคม'}</div>
        <div></div>
        <div style={{ textAlign: 'right' }}>รายจ่ายรวม</div>
      </div>
      {/* Values */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 3fr 4fr 3fr',
        gap: '4px',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: '11px',
        marginBottom: '10px'
      }}>
        <div style={{ textAlign: 'left', paddingLeft: '24px' }}>{formatCurrency(data.deductions[1]?.amount || 0)}</div>
        <div>{formatCurrency(data.deductions[0]?.amount || 0)}</div>
        <div></div>
        <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700' }}>{formatCurrency(totalDeductions)}</div>
      </div>

      {/* === NET PAY SECTION === */}
      <div style={{
        borderTop: '1px solid #000',
        borderBottom: '1px solid #000',
        padding: '10px 0',
        marginTop: '10px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', paddingLeft: '24px' }}>
            ฝากเข้าบัญชี {data.employee.bankName} เลขที่บัญชี {data.employee.accountNumber}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700' }}>เงินได้สุทธิ</span>
            <span style={{ fontSize: '18px', fontWeight: '700' }}>{formatCurrency(netIncome)}</span>
          </div>
        </div>
      </div>

      {/* === FOOTER: YTD ACCUMULATION === */}
      <div style={{
        borderBottom: '1px solid #000',
        paddingBottom: '10px',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '16px',
          textAlign: 'center',
          color: '#666',
          fontSize: '10px',
          marginBottom: '4px'
        }}>
          <div>เงินเดือนสะสม</div>
          <div>ภาษีเงินได้สะสม</div>
          <div>ประกันสังคมสะสม</div>
          <div>รวมเงินได้สะสม</div>
          <div>รวมเงินหักสะสม</div>
          <div>เงินได้สุทธิสะสม</div>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '16px',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '11px'
        }}>
          <div>{formatCurrency(ytdIncome)}</div>
          <div>{formatCurrency(ytdTax)}</div>
          <div>{formatCurrency(ytdSSO)}</div>
          <div>{formatCurrency(ytdTotalIncome)}</div>
          <div>{formatCurrency(ytdTotalDeduction)}</div>
          <div>{formatCurrency(ytdNet)}</div>
        </div>
      </div>

      {/* === SIGNATURE LINE === */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '48px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ borderBottom: '1px solid #000', width: '180px', marginBottom: '8px' }}></div>
          <div style={{ fontSize: '11px' }}>ลงชื่อผู้รับ</div>
        </div>
      </div>
    </div>
  )
})

PayslipPreview.displayName = 'PayslipPreview'

export default PayslipPreview
