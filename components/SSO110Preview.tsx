'use client'

import React, { forwardRef } from 'react'
import { SSO110Data } from '@/types/documents'
import { formatCurrency } from '@/utils/formatters'

interface SSO110PreviewProps {
  data: SSO110Data
  page?: 'summary' | 'detail'
  pageNumber?: number
  totalPages?: number
}

// แปลงตัวเลขเป็นตัวอักษรไทย
const numberToThaiText = (num: number): string => {
  const units = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
  const tens = ['', 'สิบ', 'ยี่สิบ', 'สามสิบ', 'สี่สิบ', 'ห้าสิบ', 'หกสิบ', 'เจ็ดสิบ', 'แปดสิบ', 'เก้าสิบ']
  const positions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน']

  if (num === 0) return 'ศูนย์'

  const intPart = Math.floor(num)
  const decPart = Math.round((num - intPart) * 100)

  const numToText = (n: number): string => {
    if (n === 0) return ''
    if (n < 10) return units[n]
    if (n < 100) {
      const t = Math.floor(n / 10)
      const u = n % 10
      let text = tens[t]
      if (u === 1) text += 'เอ็ด'
      else if (u > 0) text += units[u]
      return text
    }

    let text = ''
    let remaining = n
    let pos = 0

    while (remaining > 0) {
      const digit = remaining % 10
      if (digit > 0) {
        if (pos === 0) {
          text = units[digit] + text
        } else if (pos === 1) {
          if (digit === 1) text = 'สิบ' + text
          else if (digit === 2) text = 'ยี่สิบ' + text
          else text = units[digit] + 'สิบ' + text
        } else {
          text = units[digit] + positions[pos] + text
        }
      }
      remaining = Math.floor(remaining / 10)
      pos++
    }
    return text
  }

  let result = numToText(intPart) + 'บาท'
  if (decPart > 0) {
    result += numToText(decPart) + 'สตางค์'
  } else {
    result += 'ถ้วน'
  }

  return `(${result})`
}

// เดือนภาษาไทย
const THAI_MONTHS = [
  '', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
]

const SSO110Preview = forwardRef<HTMLDivElement, SSO110PreviewProps>(({ data, page = 'summary', pageNumber = 1, totalPages = 1 }, ref) => {
  const commonStyles = {
    fontFamily: '"TH Sarabun New", "Sarabun", sans-serif',
    fontSize: '14px',
    lineHeight: '1.4',
    color: '#000'
  }

  // แปลงเลขบัญชีเป็น array
  const accountDigits = data.accountNumber.split('')
  const branchDigits = data.branchNumber.split('')

  if (page === 'summary') {
    return (
      <div
        ref={ref}
        style={{
          width: '210mm',
          minHeight: '297mm',
          backgroundColor: '#ffffff',
          padding: '15mm 20mm',
          boxSizing: 'border-box',
          ...commonStyles
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ width: '80px' }}>
            {/* Logo placeholder */}
            <div style={{
              width: '60px',
              height: '60px',
              border: '1px solid #ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: '#666'
            }}>
              สำนักงาน<br/>ประกันสังคม
            </div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
              แบบรายการแสดงการส่งเงินสมทบ
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '14px' }}>
            สปส. 1-10 (ส่วนที่ 1)
          </div>
        </div>

        {/* Company Info */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', marginBottom: '5px' }}>
            <div style={{ width: '120px' }}>ชื่อสถานประกอบการ</div>
            <div style={{ flex: 1, borderBottom: '1px dotted #000', paddingLeft: '5px' }}>{data.companyName}</div>
            <div style={{ width: '80px', textAlign: 'right' }}>เลขที่บัญชี</div>
            <div style={{ display: 'flex', marginLeft: '10px' }}>
              {accountDigits.map((digit, i) => (
                <div key={i} style={{
                  width: '20px',
                  height: '24px',
                  border: '1px solid #000',
                  textAlign: 'center',
                  lineHeight: '24px',
                  marginLeft: i === 2 || i === 7 ? '5px' : '0'
                }}>{digit}</div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', marginBottom: '5px' }}>
            <div style={{ width: '120px' }}>ชื่อสาขา (ถ้ามี)</div>
            <div style={{ flex: 1, borderBottom: '1px dotted #000' }}></div>
            <div style={{ width: '80px', textAlign: 'right' }}>ลำดับที่สาขา</div>
            <div style={{ display: 'flex', marginLeft: '10px' }}>
              {branchDigits.map((digit, i) => (
                <div key={i} style={{
                  width: '20px',
                  height: '24px',
                  border: '1px solid #000',
                  textAlign: 'center',
                  lineHeight: '24px'
                }}>{digit}</div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', marginBottom: '5px' }}>
            <div style={{ width: '150px' }}>ที่ตั้งสำนักงานใหญ่/สาขา</div>
            <div style={{ flex: 1, borderBottom: '1px dotted #000', paddingLeft: '5px' }}>{data.companyAddress}</div>
          </div>

          <div style={{ display: 'flex', marginBottom: '5px' }}>
            <div style={{ width: '80px' }}>รหัสไปรษณีย์</div>
            <div style={{ width: '80px', borderBottom: '1px dotted #000', textAlign: 'center' }}>{data.postalCode}</div>
            <div style={{ width: '60px', marginLeft: '20px' }}>โทรศัพท์</div>
            <div style={{ width: '120px', borderBottom: '1px dotted #000', textAlign: 'center' }}>{data.phone}</div>
            <div style={{ width: '60px', marginLeft: '20px' }}>โทรสาร</div>
            <div style={{ flex: 1, borderBottom: '1px dotted #000', textAlign: 'center' }}>{data.fax}</div>
            <div style={{ marginLeft: '20px' }}>อัตราเงินสมทบร้อยละ</div>
            <div style={{ width: '60px', borderBottom: '1px dotted #000', textAlign: 'center' }}>{data.ssoRate.toFixed(2)}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <div>การนำส่งเงินสมทบสำหรับค่าจ้างเดือน</div>
            <div style={{
              marginLeft: '10px',
              borderBottom: '1px dotted #000',
              padding: '0 20px',
              fontWeight: 'bold'
            }}>
              {THAI_MONTHS[data.contributionMonth]}
            </div>
            <div style={{ marginLeft: '10px' }}>พ.ศ.</div>
            <div style={{
              marginLeft: '10px',
              borderBottom: '1px dotted #000',
              padding: '0 20px',
              fontWeight: 'bold'
            }}>
              {data.contributionYear}
            </div>
          </div>
        </div>

        {/* Summary Table */}
        <table style={{ width: '60%', borderCollapse: 'collapse', marginBottom: '15px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '50px' }}></th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>รายการ</th>
              <th colSpan={2} style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>จำนวนเงิน</th>
            </tr>
            <tr>
              <th style={{ border: '1px solid #000', padding: '4px' }}></th>
              <th style={{ border: '1px solid #000', padding: '4px' }}></th>
              <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', width: '100px' }}>บาท</th>
              <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', width: '50px' }}>สต.</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>1.</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>เงินค่าจ้างทั้งสิ้น</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{formatCurrency(data.summary.totalWages).split('.')[0]}</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>00</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>2.</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>เงินสมทบผู้ประกันตน</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{formatCurrency(data.summary.employeeContribution).split('.')[0]}</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>00</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>3.</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>เงินสมทบนายจ้าง</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{formatCurrency(data.summary.employerContribution).split('.')[0]}</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>00</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>4.</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>รวมเงินสมทบที่นำส่งทั้งสิ้น</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(data.summary.totalContribution).split('.')[0]}</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>00</td>
            </tr>
            <tr>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontSize: '12px' }}>
                {numberToThaiText(data.summary.totalContribution)}
              </td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '8px' }}></td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>5.</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>จำนวนผู้ประกันตนที่ส่งเงินสมทบ</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{data.summary.employeeCount}</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>คน</td>
            </tr>
          </tbody>
        </table>

        {/* Declaration */}
        <div style={{ marginBottom: '20px', fontSize: '13px' }}>
          <p style={{ marginBottom: '10px' }}>
            ข้าพเจ้าขอรับรองว่ารายการที่แจ้งไว้เป็นรายการที่ถูกต้องครบถ้วนและเป็นจริงทุกประการ พร้อมนี้ได้แนบ
          </p>
          <div style={{ display: 'flex', gap: '30px', marginLeft: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input type="checkbox" checked readOnly style={{ width: '15px', height: '15px' }} />
              รายละเอียดการนำส่งเงินสมทบ
              <span style={{ marginLeft: '10px' }}>จำนวน........1........แผ่น</span>
            </label>
          </div>
        </div>

        {/* Signature Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
          <div style={{
            border: '1px solid #000',
            width: '100px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            textAlign: 'center'
          }}>
            ประทับตรา<br/>นิติบุคคล<br/>(ถ้ามี)
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '5px' }}>
              ลงชื่อ.................................................................นายจ้าง/ผู้รับมอบอำนาจ
            </div>
            <div style={{ marginBottom: '5px' }}>
              (..................................................................)
            </div>
            <div style={{ marginBottom: '5px' }}>
              ตำแหน่ง....................................................................
            </div>
            <div>
              ยื่นแบบวันที่.........เดือน.......................พ.ศ..............
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Page 2: Detail
  return (
    <div
      ref={ref}
      style={{
        width: '210mm',
        minHeight: '297mm',
        backgroundColor: '#ffffff',
        padding: '10mm 15mm',
        boxSizing: 'border-box',
        ...commonStyles
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
          รายละเอียดการนำส่งเงินสมทบ
        </div>
        <div style={{ textAlign: 'right', fontSize: '12px' }}>
          <div>สปส. 1-10 (ส่วนที่ 2)</div>
          <div>แผ่นที่......{pageNumber}......ในจำนวน......{totalPages}......แผ่น</div>
        </div>
      </div>

      {/* Company Info */}
      <div style={{ display: 'flex', marginBottom: '10px', fontSize: '13px' }}>
        <div>สำหรับค่าจ้างเดือน</div>
        <div style={{ borderBottom: '1px dotted #000', width: '100px', textAlign: 'center', margin: '0 10px' }}>
          {THAI_MONTHS[data.contributionMonth]}
        </div>
        <div>พ.ศ.</div>
        <div style={{ borderBottom: '1px dotted #000', width: '60px', textAlign: 'center', margin: '0 10px' }}>
          {data.contributionYear}
        </div>
        <div style={{ marginLeft: '20px' }}>เลขที่บัญชี</div>
        <div style={{ display: 'flex', marginLeft: '10px' }}>
          {accountDigits.map((digit, i) => (
            <div key={i} style={{
              width: '16px',
              height: '20px',
              border: '1px solid #000',
              textAlign: 'center',
              lineHeight: '20px',
              fontSize: '12px',
              marginLeft: i === 2 || i === 7 ? '3px' : '0'
            }}>{digit}</div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', marginBottom: '10px', fontSize: '13px' }}>
        <div>ชื่อสถานประกอบการ</div>
        <div style={{ borderBottom: '1px dotted #000', flex: 1, marginLeft: '10px', paddingLeft: '5px' }}>
          {data.companyName}
        </div>
        <div style={{ marginLeft: '20px' }}>ลำดับที่สาขา</div>
        <div style={{ display: 'flex', marginLeft: '10px' }}>
          {branchDigits.map((digit, i) => (
            <div key={i} style={{
              width: '16px',
              height: '20px',
              border: '1px solid #000',
              textAlign: 'center',
              lineHeight: '20px',
              fontSize: '12px'
            }}>{digit}</div>
          ))}
        </div>
      </div>

      {/* Detail Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', width: '30px' }}>1</th>
            <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>2</th>
            <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>3</th>
            <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>4</th>
            <th colSpan={2} style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>5</th>
          </tr>
          <tr>
            <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', fontSize: '11px' }}>ลำดับที่</th>
            <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', fontSize: '11px', width: '150px' }}>
              เลขประจำตัวประชาชน<br/>
              <span style={{ fontSize: '10px' }}>(สำหรับคนต่างด้าวให้กรอกเลขที่บัตรประกันสังคม)</span>
            </th>
            <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', fontSize: '11px' }}>
              คำนำหน้านาม- ชื่อ - ชื่อสกุลผู้ประกันตน
            </th>
            <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', fontSize: '11px' }}>ค่าจ้างที่จ่ายจริง</th>
            <th colSpan={2} style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', fontSize: '10px' }}>
              เงินสมทบผู้ประกันตน<br/>
              (ค่าจ้างที่ใช้ในการคำนวณไม่ต่ำกว่า<br/>
              1,650 บาท และไม่เกิน 15,000 บาท)
            </th>
          </tr>
        </thead>
        <tbody>
          {data.employees.map((emp, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>{emp.sequence}</td>
              <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>
                {emp.idNumber.split('').map((d, i) => (
                  <span key={i}>{d}{i === 0 || i === 4 || i === 9 || i === 11 ? ' - ' : ''}</span>
                ))}
              </td>
              <td style={{ border: '1px solid #000', padding: '4px' }}>
                {emp.titleName} {emp.firstName} {emp.lastName}
              </td>
              <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>
                {formatCurrency(emp.actualWages).split('.')[0]}
                <span style={{ marginLeft: '10px' }}>00</span>
              </td>
              <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>
                {formatCurrency(emp.contribution).split('.')[0]}
              </td>
              <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', width: '30px' }}>00</td>
            </tr>
          ))}
          {/* Empty rows */}
          {Array.from({ length: Math.max(0, 10 - data.employees.length) }).map((_, i) => (
            <tr key={`empty-${i}`}>
              <td style={{ border: '1px solid #000', padding: '4px', height: '24px' }}></td>
              <td style={{ border: '1px solid #000', padding: '4px' }}></td>
              <td style={{ border: '1px solid #000', padding: '4px' }}></td>
              <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>
                <span style={{ marginLeft: '10px' }}>00</span>
              </td>
              <td style={{ border: '1px solid #000', padding: '4px' }}></td>
              <td style={{ border: '1px solid #000', padding: '4px' }}>00</td>
            </tr>
          ))}
          {/* Total row */}
          <tr>
            <td colSpan={3} style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>
              รวม
            </td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>
              {formatCurrency(data.summary.totalWages).split('.')[0]}
              <span style={{ marginLeft: '10px' }}>00</span>
            </td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>
              {formatCurrency(data.summary.employeeContribution).split('.')[0]}
            </td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>00</td>
          </tr>
        </tbody>
      </table>

      {/* Signature */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <div style={{ textAlign: 'center', fontSize: '13px' }}>
          <div>ลงชื่อ.........................................................นายจ้าง/ผู้รับมอบอำนาจ</div>
          <div style={{ marginTop: '15px' }}>
            ยื่นแบบวันที่.........เดือน.......................พ.ศ...............
          </div>
        </div>
      </div>
    </div>
  )
})

SSO110Preview.displayName = 'SSO110Preview'

export default SSO110Preview
