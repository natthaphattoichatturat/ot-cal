'use client'

import React, { forwardRef } from 'react'
import { WithholdingCertData } from '@/types/documents'
import { formatCurrency } from '@/utils/formatters'

interface WithholdingCertPreviewProps {
  data: WithholdingCertData
}

const WithholdingCertPreview = forwardRef<HTMLDivElement, WithholdingCertPreviewProps>(({ data }, ref) => {
  const commonStyles = {
    fontFamily: '"TH Sarabun New", "Sarabun", sans-serif',
    fontSize: '14px',
    lineHeight: '1.4',
    color: '#000'
  }

  // แปลงเลข Tax ID เป็น array
  const companyTaxIdDigits = data.companyTaxId.split('')
  const employeeIdDigits = data.employee.idNumber.split('')

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
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
          หนังสือรับรองการหักภาษี ณ ที่จ่าย
        </div>
        <div style={{ fontSize: '14px', marginBottom: '3px' }}>
          ตามมาตรา 50 ทวิ แห่งประมวลรัษฎากร
        </div>
      </div>

      {/* Form Number */}
      <div style={{ textAlign: 'right', marginBottom: '15px' }}>
        <span style={{
          border: '2px solid #000',
          padding: '5px 15px',
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          50 ทวิ
        </span>
      </div>

      {/* Section 1: Payer Info */}
      <div style={{ marginBottom: '20px', border: '1px solid #000', padding: '15px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '15px' }}>
          1. ข้อมูลผู้มีหน้าที่หักภาษี ณ ที่จ่าย (ผู้จ่ายเงิน)
        </div>

        <div style={{ display: 'flex', marginBottom: '8px' }}>
          <div style={{ width: '200px' }}>เลขประจำตัวผู้เสียภาษีอากร</div>
          <div style={{ display: 'flex' }}>
            {companyTaxIdDigits.map((digit, i) => (
              <div key={i} style={{
                width: '22px',
                height: '26px',
                border: '1px solid #000',
                textAlign: 'center',
                lineHeight: '26px',
                fontWeight: 'bold',
                marginLeft: i === 1 || i === 5 || i === 10 || i === 12 ? '5px' : '0'
              }}>{digit}</div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', marginBottom: '5px' }}>
          <div style={{ width: '50px' }}>ชื่อ</div>
          <div style={{
            flex: 1,
            borderBottom: '1px dotted #000',
            paddingLeft: '5px',
            fontWeight: 'bold'
          }}>{data.companyName}</div>
        </div>

        <div style={{ display: 'flex', marginBottom: '5px' }}>
          <div style={{ width: '50px' }}>ที่อยู่</div>
          <div style={{
            flex: 1,
            borderBottom: '1px dotted #000',
            paddingLeft: '5px'
          }}>{data.companyAddress}</div>
        </div>
      </div>

      {/* Section 2: Employee Info */}
      <div style={{ marginBottom: '20px', border: '1px solid #000', padding: '15px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '15px' }}>
          2. ข้อมูลผู้ถูกหักภาษี ณ ที่จ่าย (ผู้มีเงินได้)
        </div>

        <div style={{ display: 'flex', marginBottom: '8px' }}>
          <div style={{ width: '200px' }}>เลขประจำตัวประชาชน</div>
          <div style={{ display: 'flex' }}>
            {employeeIdDigits.length > 0 ? employeeIdDigits.map((digit, i) => (
              <div key={i} style={{
                width: '22px',
                height: '26px',
                border: '1px solid #000',
                textAlign: 'center',
                lineHeight: '26px',
                fontWeight: 'bold',
                marginLeft: i === 1 || i === 5 || i === 10 || i === 12 ? '5px' : '0'
              }}>{digit}</div>
            )) : (
              Array.from({ length: 13 }).map((_, i) => (
                <div key={i} style={{
                  width: '22px',
                  height: '26px',
                  border: '1px solid #000',
                  marginLeft: i === 1 || i === 5 || i === 10 || i === 12 ? '5px' : '0'
                }}></div>
              ))
            )}
          </div>
        </div>

        <div style={{ display: 'flex', marginBottom: '5px' }}>
          <div style={{ width: '80px' }}>คำนำหน้าชื่อ</div>
          <div style={{
            width: '80px',
            borderBottom: '1px dotted #000',
            textAlign: 'center'
          }}>{data.employee.titleName}</div>
          <div style={{ width: '40px', marginLeft: '20px' }}>ชื่อ</div>
          <div style={{
            width: '150px',
            borderBottom: '1px dotted #000',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>{data.employee.firstName}</div>
          <div style={{ width: '60px', marginLeft: '20px' }}>นามสกุล</div>
          <div style={{
            flex: 1,
            borderBottom: '1px dotted #000',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>{data.employee.lastName}</div>
        </div>

        <div style={{ display: 'flex', marginBottom: '5px' }}>
          <div style={{ width: '50px' }}>ที่อยู่</div>
          <div style={{
            flex: 1,
            borderBottom: '1px dotted #000',
            paddingLeft: '5px'
          }}>{data.employee.address}</div>
        </div>
      </div>

      {/* Section 3: Income Details */}
      <div style={{ marginBottom: '20px', border: '1px solid #000', padding: '15px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '15px' }}>
          3. รายละเอียดเงินได้และภาษีที่หัก ณ ที่จ่าย
        </div>

        <div style={{ marginBottom: '10px' }}>
          <span>ประจำปีภาษี </span>
          <span style={{
            borderBottom: '1px dotted #000',
            padding: '0 30px',
            fontWeight: 'bold'
          }}>{data.taxYear}</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>ประเภทเงินได้</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
                จำนวนเงินที่จ่าย<br/>(บาท)
              </th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
                ภาษีที่หักไว้<br/>(บาท)
              </th>
            </tr>
          </thead>
          <tbody>
            {data.incomeDetails.map((detail, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #000', padding: '8px' }}>
                  เงินได้ตามมาตรา {detail.incomeType}
                  {detail.incomeType === '40(1)' && ' (เงินเดือน ค่าจ้าง บำนาญ ฯลฯ)'}
                  {detail.incomeType === '40(2)' && ' (ค่าธรรมเนียม ค่านายหน้า ฯลฯ)'}
                </td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                  {formatCurrency(detail.totalIncome)}
                </td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                  {formatCurrency(detail.totalTax)}
                </td>
              </tr>
            ))}
            <tr style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
                รวมทั้งสิ้น
              </td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>
                {formatCurrency(data.grandTotalIncome)}
              </td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>
                {formatCurrency(data.grandTotalTax)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 4: Certification */}
      <div style={{ marginBottom: '20px', border: '1px solid #000', padding: '15px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '15px' }}>
          4. การรับรอง
        </div>

        <div style={{ marginBottom: '15px', fontSize: '13px' }}>
          ข้าพเจ้าขอรับรองว่า ข้อความข้างต้นนี้ถูกต้องตามความเป็นจริงทุกประการ
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
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

          <div style={{ textAlign: 'center', fontSize: '13px' }}>
            <div>ลงชื่อ.............................................................ผู้จ่ายเงิน</div>
            <div style={{ marginTop: '5px' }}>(.............................................................)</div>
            <div style={{ marginTop: '5px' }}>ตำแหน่ง..................................................................</div>
            <div style={{ marginTop: '5px' }}>
              วันที่ออกหนังสือรับรอง
              <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>{data.issueDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      <div style={{ fontSize: '12px', color: '#666' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>หมายเหตุ:</div>
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          <li>ผู้จ่ายเงินต้องออกหนังสือรับรองการหักภาษี ณ ที่จ่าย ให้แก่ผู้ถูกหักภาษี ณ ที่จ่าย 2 ฉบับ มีข้อความตรงกัน</li>
          <li>ผู้ถูกหักภาษี ณ ที่จ่าย ต้องแนบหนังสือรับรองนี้ไปพร้อมกับแบบแสดงรายการภาษีเงินได้</li>
          <li>หนังสือรับรองนี้ต้องออกภายในวันที่ 15 กุมภาพันธ์ ของปีถัดไป</li>
        </ol>
      </div>

      {/* Copy indicator */}
      <div style={{
        position: 'absolute',
        bottom: '20mm',
        right: '20mm',
        fontSize: '12px',
        color: '#666'
      }}>
        (สำหรับผู้ถูกหักภาษี ณ ที่จ่าย)
      </div>
    </div>
  )
})

WithholdingCertPreview.displayName = 'WithholdingCertPreview'

export default WithholdingCertPreview
