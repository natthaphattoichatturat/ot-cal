'use client'

import React, { forwardRef } from 'react'
import { PND1Data } from '@/types/documents'
import { formatCurrency } from '@/utils/formatters'

interface PND1PreviewProps {
  data: PND1Data
}

// เดือนภาษาไทย
const THAI_MONTHS = [
  '', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
]

const PND1Preview = forwardRef<HTMLDivElement, PND1PreviewProps>(({ data }, ref) => {
  const commonStyles = {
    fontFamily: '"TH Sarabun New", "Sarabun", sans-serif',
    fontSize: '14px',
    lineHeight: '1.4',
    color: '#000'
  }

  // แปลงเลข Tax ID เป็น array
  const taxIdDigits = data.companyTaxId.split('')

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
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            textAlign: 'center'
          }}>
            กรมสรรพากร
          </div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '3px' }}>
            แบบยื่นรายการภาษีเงินได้หัก ณ ที่จ่าย
          </div>
          <div style={{ fontSize: '14px', marginBottom: '3px' }}>
            ตามมาตรา 59 แห่งประมวลรัษฎากร
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            สำหรับการหักภาษี ณ ที่จ่ายตามมาตรา 50(1) กรณีจ่ายเงินได้พึงประเมินตามมาตรา 40(1)(2) แห่งประมวลรัษฎากร
          </div>
        </div>
        <div style={{
          textAlign: 'right',
          fontSize: '28px',
          fontWeight: 'bold',
          border: '2px solid #000',
          padding: '5px 15px'
        }}>
          ภ.ง.ด.1
        </div>
      </div>

      {/* Tax ID and Month Selection */}
      <div style={{ marginBottom: '15px', fontSize: '13px' }}>
        <div style={{ display: 'flex', marginBottom: '8px' }}>
          <div style={{ fontWeight: 'bold' }}>เลขประจำตัวผู้เสียภาษีอากร (13หลัก)</div>
          <div style={{ display: 'flex', marginLeft: '15px' }}>
            {taxIdDigits.map((digit, i) => (
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
          <div style={{ marginLeft: '30px' }}>เดือนที่จ่ายเงินได้พึงประเมิน</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '8px' }}>
          <div style={{ fontSize: '12px', color: '#666' }}>(ของผู้มีหน้าที่หักภาษี ณ ที่จ่าย)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginLeft: 'auto', maxWidth: '350px' }}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <label key={m} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '12px',
                width: '80px'
              }}>
                <input
                  type="checkbox"
                  checked={m === data.taxMonth}
                  readOnly
                  style={{ width: '12px', height: '12px' }}
                />
                ({m}) {THAI_MONTHS[m].substring(0, 3)}.
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', marginBottom: '5px' }}>
          <div style={{ width: '200px' }}>
            <span style={{ fontWeight: 'bold' }}>ชื่อผู้มีหน้าที่หักภาษี ณ ที่จ่าย</span>
            <span style={{ fontSize: '11px', marginLeft: '5px' }}>(บริษัท/งาน)</span>
          </div>
          <div style={{ marginLeft: '20px' }}>สาขาที่</div>
          <div style={{
            marginLeft: '10px',
            width: '80px',
            borderBottom: '1px dotted #000',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>{data.companyBranch}</div>
        </div>

        <div style={{
          borderBottom: '1px dotted #000',
          padding: '5px 0',
          fontWeight: 'bold',
          marginBottom: '5px'
        }}>
          {data.companyName}
        </div>

        <div style={{ display: 'flex', marginBottom: '5px' }}>
          <div style={{ fontWeight: 'bold' }}>ที่ตั้งสำนักงาน :</div>
          <div style={{
            marginLeft: '10px',
            borderBottom: '1px dotted #000',
            flex: 1,
            paddingLeft: '5px'
          }}>{data.companyAddress}</div>
        </div>

        <div style={{ display: 'flex', marginBottom: '10px' }}>
          <div>รหัสไปรษณีย์</div>
          <div style={{
            marginLeft: '10px',
            width: '80px',
            borderBottom: '1px dotted #000',
            textAlign: 'center'
          }}>{data.postalCode}</div>
          <div style={{ marginLeft: '30px' }}>โทรศัพท์</div>
          <div style={{
            marginLeft: '10px',
            width: '150px',
            borderBottom: '1px dotted #000',
            textAlign: 'center'
          }}>{data.phone}</div>
        </div>

        <div style={{ display: 'flex', gap: '30px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={data.submissionType === 'normal'}
              readOnly
              style={{ width: '15px', height: '15px' }}
            />
            (1) ยื่นปกติ
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={data.submissionType === 'additional'}
              readOnly
              style={{ width: '15px', height: '15px' }}
            />
            (2) ยื่นเพิ่มเติมครั้งที่..........
          </label>
        </div>
      </div>

      {/* Attachment Info */}
      <div style={{ marginBottom: '15px', fontSize: '13px' }}>
        <div style={{ marginBottom: '5px' }}>
          มีรายละเอียดการหักเป็นรายผู้มีเงินได้ ปรากฏตาม
        </div>
        <div style={{ marginLeft: '20px', marginBottom: '5px' }}>
          (ให้แสดงรายละเอียดในใบแนบ ภ.ง.ด.1 หรือในสื่อบันทึก
          <br/>ในระบบคอมพิวเตอร์อย่างใดอย่างหนึ่งเท่านั้น)
        </div>
        <div style={{ display: 'flex', gap: '20px', marginLeft: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input type="checkbox" checked readOnly style={{ width: '14px', height: '14px' }} />
            <span style={{ fontWeight: 'bold' }}>ใบแนบ ภ.ง.ด.1</span>
            <span style={{ marginLeft: '10px' }}>ที่แนบมาพร้อมนี้ :</span>
            <span style={{ marginLeft: '10px' }}>จำนวน.......1.......แผ่น</span>
          </label>
        </div>
      </div>

      {/* Summary Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px' }}>
        <thead>
          <tr>
            <th colSpan={2} style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
              สรุปรายการภาษีที่นำส่ง
            </th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>จำนวนราย</th>
            <th colSpan={2} style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>เงินได้ทั้งสิ้น</th>
            <th colSpan={2} style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>ภาษีที่นำส่งทั้งสิ้น</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px', width: '30px', textAlign: 'center' }}>1.</td>
            <td style={{ border: '1px solid #000', padding: '6px', fontSize: '12px' }}>
              เงินได้ตามมาตรา 40 (1) เงินเดือน ค่าจ้าง ฯลฯ กรณีทั่วไป
            </td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{data.summary.employeeCount}</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(data.summary.totalIncome).split('.')[0]}</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', width: '40px' }}>{formatCurrency(data.summary.totalIncome).split('.')[1] || '00'}</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(data.summary.totalTax).split('.')[0]}</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', width: '40px' }}>{formatCurrency(data.summary.totalTax).split('.')[1] || '00'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>2.</td>
            <td style={{ border: '1px solid #000', padding: '6px', fontSize: '12px' }}>
              เงินได้ตามมาตรา 40 (1) เงินเดือน ค่าจ้าง ฯลฯ กรณีได้รับ<br/>
              อนุมัติจากกรมสรรพากรให้หักอัตรา 1 ร้อยละ 3<br/>
              <span style={{ fontSize: '11px' }}>(ตามหนังสือที่.......................................ลงวันที่...............................)</span>
            </td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}></td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>3.</td>
            <td style={{ border: '1px solid #000', padding: '6px', fontSize: '12px' }}>
              เงินได้ตามมาตรา 40 (1) (2) กรณีนายจ้างจ่ายให้ครั้งเดียว<br/>
              เพราะเหตุออกจากงาน
            </td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}></td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>4.</td>
            <td style={{ border: '1px solid #000', padding: '6px', fontSize: '12px' }}>
              เงินได้ตามมาตรา 40 (2) กรณีผู้รับเงินได้เป็นผู้อยู่ในประเทศไทย
            </td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}></td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>5.</td>
            <td style={{ border: '1px solid #000', padding: '6px', fontSize: '12px' }}>
              เงินได้ตามมาตรา 40 (2) กรณีผู้รับเงินได้มิได้เป็นผู้อยู่ในประเทศไทย
            </td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}></td>
          </tr>
          <tr style={{ fontWeight: 'bold' }}>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>6.</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>รวม</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{data.summary.employeeCount}</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(data.summary.totalIncome).split('.')[0]}</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{formatCurrency(data.summary.totalIncome).split('.')[1] || '00'}</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(data.summary.totalTax).split('.')[0]}</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{formatCurrency(data.summary.totalTax).split('.')[1] || '00'}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>7.</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>เงินเพิ่ม (ถ้ามี)</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
          </tr>
          <tr style={{ fontWeight: 'bold' }}>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>8.</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}>รวมยอดภาษีที่นำส่งทั้งสิ้น และเงินเพิ่ม (6. + 7.)</td>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px' }}></td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{formatCurrency(data.summary.totalTax).split('.')[0]}</td>
            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{formatCurrency(data.summary.totalTax).split('.')[1] || '00'}</td>
          </tr>
        </tbody>
      </table>

      {/* Declaration */}
      <div style={{ marginBottom: '20px', fontSize: '13px', textAlign: 'center' }}>
        <p>ข้าพเจ้าขอรับรองว่า รายการที่แจ้งไว้ข้างต้นนี้ เป็นรายการที่ถูกต้องและครบถ้วนทุกประการ</p>
      </div>

      {/* Signature Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px' }}>
        <div style={{ textAlign: 'center', fontSize: '13px' }}>
          <div>ลงชื่อ.............................................................ผู้จ่ายเงิน</div>
          <div style={{ marginTop: '5px' }}>(.............................................................)</div>
          <div style={{ marginTop: '5px' }}>ตำแหน่ง..................................................................</div>
          <div style={{ marginTop: '5px' }}>ยื่นวันที่.........เดือน.......................พ.ศ..............</div>
        </div>
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
      </div>

      {/* Footer note */}
      <div style={{ marginTop: '20px', textAlign: 'right', fontSize: '11px', color: '#666' }}>
        (ก่อนกรอกรายการ ดูคำชี้แจงด้านหลัง)
      </div>
    </div>
  )
})

PND1Preview.displayName = 'PND1Preview'

export default PND1Preview
