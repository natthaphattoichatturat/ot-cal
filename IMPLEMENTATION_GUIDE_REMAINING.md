# คู่มือการทำงานที่เหลือ (Remaining Implementation Guide)

## ภาพรวม

เอกสารนี้แสดงวิธีการทำงานที่เหลือให้เสร็จสมบูรณ์ โดยจะมีตัวอย่างโค้ดที่พร้อมใช้งานทั้งหมด

---

## 📋 งานที่เหลือทั้งหมด

### 1. อัพเดทหน้า `/employees/[id]` - แสดงเงินได้/เงินหักทั้งหมด
### 2. อัพเดท `/liff/employee-ot-viewer` - แสดงข้อมูลค่าจ้างและยอดสะสม
### 3. ปรับปรุงหน้าจัดการข้อมูลพนักงานตาม employees schema

---

## 1. อัพเดทหน้า `/employees/[id]`

### เป้าหมาย:
- แสดงรายการเงินได้/เงินหักทั้งหมดของพนักงาน
- แสดงยอดสะสม YTD
- สามารถกรองตามงวดและเดือน

### โค้ดที่ต้องเพิ่มใน `/app/employees/[id]/page.tsx`

```typescript
// เพิ่ม interface
interface IncomeDeductionRecord {
  id: number
  pay_period_month: number
  pay_period_year: number
  pay_period: number
  record_type: 'income' | 'deduction'
  item_name: string
  amount: number
  include_in_sso: boolean
  notes: string | null
  created_at: string
}

interface YTDSummary {
  ytd_gross_wage: number
  ytd_ot_wage: number
  ytd_total_income: number
  ytd_sso: number
  ytd_tax: number
  ytd_total_deduction: number
  ytd_net_wage: number
}

// เพิ่ม state
const [incomeRecords, setIncomeRecords] = useState<IncomeDeductionRecord[]>([])
const [deductionRecords, setDeductionRecords] = useState<IncomeDeductionRecord[]>([])
const [ytdSummary, setYtdSummary] = useState<YTDSummary | null>(null)
const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
const [selectedMonth, setSelectedMonth] = useState<number | null>(null)

// เพิ่มฟังก์ชัน fetch
const fetchIncomeDeduction = async (employeeId: string) => {
  try {
    const params = new URLSearchParams({
      employee_id: employeeId,
      year: selectedYear.toString(),
    })
    if (selectedMonth) {
      params.append('month', selectedMonth.toString())
    }

    const res = await fetch(`/api/income-deduction?${params}`)
    const data = await res.json()
    
    if (data.success) {
      const income = data.data.filter((r: any) => r.record_type === 'income')
      const deduction = data.data.filter((r: any) => r.record_type === 'deduction')
      setIncomeRecords(income)
      setDeductionRecords(deduction)
    }
  } catch (error) {
    console.error('Error fetching income/deduction:', error)
  }
}

const fetchYTDSummary = async (employeeId: string) => {
  try {
    const { data } = await supabase
      .from('employee_ytd_summary')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('year', selectedYear)
      .single()
    
    if (data) {
      setYtdSummary(data)
    }
  } catch (error) {
    console.error('Error fetching YTD:', error)
  }
}

// เรียกใช้ใน useEffect
useEffect(() => {
  if (employee) {
    fetchIncomeDeduction(employee.employee_id)
    fetchYTDSummary(employee.employee_id)
  }
}, [employee, selectedYear, selectedMonth])

// เพิ่ม UI section หลัง Employee Details card
<>
  {/* YTD Summary */}
  {ytdSummary && (
    <div className="card" style={{ marginTop: '24px', padding: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        ยอดสะสมรายปี {selectedYear + 543}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ padding: '12px', background: 'var(--surface-bg)', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>เงินเดือนสะสม</div>
          <div style={{ fontSize: '18px', fontWeight: '600', marginTop: '4px' }}>
            {ytdSummary.ytd_gross_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ padding: '12px', background: 'var(--surface-bg)', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>รวมรายได้สะสม</div>
          <div style={{ fontSize: '18px', fontWeight: '600', marginTop: '4px', color: '#10b981' }}>
            {ytdSummary.ytd_total_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ padding: '12px', background: 'var(--surface-bg)', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ประกันสังคมสะสม</div>
          <div style={{ fontSize: '18px', fontWeight: '600', marginTop: '4px', color: '#ef4444' }}>
            {ytdSummary.ytd_sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ padding: '12px', background: 'var(--surface-bg)', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ภาษีสะสม</div>
          <div style={{ fontSize: '18px', fontWeight: '600', marginTop: '4px', color: '#ef4444' }}>
            {ytdSummary.ytd_tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ padding: '12px', background: 'var(--surface-bg)', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>รวมหักสะสม</div>
          <div style={{ fontSize: '18px', fontWeight: '600', marginTop: '4px', color: '#ef4444' }}>
            {ytdSummary.ytd_total_deduction.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ padding: '12px', background: '#d1fae5', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>เงินสุทธิสะสม</div>
          <div style={{ fontSize: '20px', fontWeight: '700', marginTop: '4px', color: '#10b981' }}>
            {ytdSummary.ytd_net_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Income Records */}
  <div className="card" style={{ marginTop: '24px', padding: '24px' }}>
    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
      💰 รายการเงินได้เพิ่มเติม
    </h3>
    {incomeRecords.length === 0 ? (
      <p style={{ color: 'var(--text-muted)' }}>ไม่มีรายการเงินได้เพิ่มเติม</p>
    ) : (
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>งวด</th>
              <th>รายการ</th>
              <th className="text-right">จำนวนเงิน</th>
              <th>คำนวณ SSO</th>
              <th>หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {incomeRecords.map(record => (
              <tr key={record.id}>
                <td>{record.pay_period_month}/{record.pay_period_year + 543} งวด {record.pay_period}</td>
                <td>{record.item_name}</td>
                <td className="text-right">{record.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                <td>{record.include_in_sso ? '✓' : '-'}</td>
                <td>{record.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>

  {/* Deduction Records */}
  <div className="card" style={{ marginTop: '24px', padding: '24px' }}>
    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
      ➖ รายการเงินหัก
    </h3>
    {deductionRecords.length === 0 ? (
      <p style={{ color: 'var(--text-muted)' }}>ไม่มีรายการเงินหัก</p>
    ) : (
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>งวด</th>
              <th>รายการ</th>
              <th className="text-right">จำนวนเงิน</th>
              <th>คำนวณ SSO</th>
              <th>หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {deductionRecords.map(record => (
              <tr key={record.id}>
                <td>{record.pay_period_month}/{record.pay_period_year + 543} งวด {record.pay_period}</td>
                <td>{record.item_name}</td>
                <td className="text-right" style={{ color: '#ef4444', fontWeight: '600' }}>
                  {record.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td>{record.include_in_sso ? '✓' : '-'}</td>
                <td>{record.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
</>
```

---

## 2. อัพเดท `/liff/employee-ot-viewer`

### เป้าหมาย:
- ให้พนักงานดูค่าจ้างของตัวเองที่ได้ในแต่ละงวด
- ดูข้อมูลสะสมทั้งหมด

### โค้ดที่ต้องเพิ่ม

```typescript
// เพิ่ม interface
interface WageSummary {
  period: number
  month: number
  year: number
  base_wage: number
  ot_wage: number
  total_income: number
  sso: number
  tax: number
  total_deduction: number
  net_wage: number
}

interface YTDData {
  ytd_gross_wage: number
  ytd_ot_wage: number
  ytd_total_income: number
  ytd_sso: number
  ytd_tax: number
  ytd_total_deduction: number
  ytd_net_wage: number
}

// เพิ่ม state
const [wageSummaries, setWageSummaries] = useState<WageSummary[]>([])
const [ytdData, setYtdData] = useState<YTDData | null>(null)
const [showWageDetail, setShowWageDetail] = useState(false)

// เพิ่มฟังก์ชัน fetch
const fetchWageData = async (employeeId: string) => {
  try {
    // Fetch wage summaries (ต้องสร้าง API endpoint ใหม่)
    const res = await fetch(`/api/wages/employee-summary?employee_id=${employeeId}&year=${new Date().getFullYear()}`)
    const data = await res.json()
    if (data.success) {
      setWageSummaries(data.data)
    }
  } catch (error) {
    console.error('Error fetching wage data:', error)
  }
}

const fetchYTDData = async (employeeId: string) => {
  try {
    const response = await fetch(`/api/employees/${employeeId}/ytd?year=${new Date().getFullYear()}`)
    const data = await response.json()
    if (data.success) {
      setYtdData(data.data)
    }
  } catch (error) {
    console.error('Error fetching YTD:', error)
  }
}

// เพิ่ม useEffect
useEffect(() => {
  if (employee) {
    fetchWageData(employee.employee_id)
    fetchYTDData(employee.employee_id)
  }
}, [employee])

// เพิ่ม UI หลัง Summary Cards
<>
  {/* Toggle Button */}
  <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
    <button
      onClick={() => setShowWageDetail(!showWageDetail)}
      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
    >
      {showWageDetail ? 'ซ่อนรายละเอียดค่าจ้าง' : 'ดูรายละเอียดค่าจ้าง'}
    </button>
  </div>

  {/* Wage Details */}
  {showWageDetail && (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">รายละเอียดค่าจ้างแต่ละงวด</h2>
      {wageSummaries.length === 0 ? (
        <p className="text-gray-600">ไม่มีข้อมูลค่าจ้าง</p>
      ) : (
        <div className="space-y-4">
          {wageSummaries.map((wage, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="font-bold text-gray-900 mb-2">
                {wage.month}/{wage.year + 543} - งวดที่ {wage.period}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>ค่าจ้างพื้นฐาน:</div>
                <div className="text-right">{wage.base_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</div>
                
                <div>ค่า OT:</div>
                <div className="text-right">{wage.ot_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</div>
                
                <div className="font-bold text-green-600">รวมรายได้:</div>
                <div className="text-right font-bold text-green-600">
                  {wage.total_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </div>
                
                <div className="text-red-600">หัก SSO:</div>
                <div className="text-right text-red-600">
                  {wage.sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </div>
                
                <div className="text-red-600">หักภาษี:</div>
                <div className="text-right text-red-600">
                  {wage.tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </div>
                
                <div className="font-bold">เงินสุทธิ:</div>
                <div className="text-right font-bold text-blue-600">
                  {wage.net_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}

  {/* YTD Summary */}
  {ytdData && (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        ยอดสะสมรายปี {new Date().getFullYear() + 543}
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-700">1. เงินเดือนสะสม</span>
          <span className="font-bold">{ytdData.ytd_gross_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-700">2. ภาษีเงินได้สะสม</span>
          <span className="font-bold text-red-600">{ytdData.ytd_tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-700">3. ประกันสังคมสะสม</span>
          <span className="font-bold text-red-600">{ytdData.ytd_sso.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between p-3 bg-green-50 rounded-lg">
          <span className="text-gray-700 font-bold">4. รวมเงินได้สะสม</span>
          <span className="font-bold text-green-600">{ytdData.ytd_total_income.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between p-3 bg-red-50 rounded-lg">
          <span className="text-gray-700 font-bold">5. รวมหักสะสม</span>
          <span className="font-bold text-red-600">{ytdData.ytd_total_deduction.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between p-4 bg-blue-100 rounded-lg border-2 border-blue-500">
          <span className="text-gray-900 font-bold text-lg">6. เงินได้สุทธิสะสม</span>
          <span className="font-bold text-blue-600 text-xl">{ytdData.ytd_net_wage.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  )}
</>
```

---

## 3. ปรับปรุงหน้าจัดการข้อมูลพนักงาน

### หน้าที่ต้องแก้ไข:
1. `/app/employees/add/page.tsx`
2. `/app/employees/edit/page.tsx`  
3. `/app/liff/hr-admin/add/page.tsx`
4. `/app/liff/hr-admin/edit/page.tsx`

### ฟิลด์ที่ต้องเพิ่มทั้งหมด:

```typescript
// เพิ่มใน interface Employee
interface Employee {
  // ... existing fields ...
  
  // ข้อมูลส่วนตัว
  section?: string                    // แผนก/ฝ่าย
  position?: string                   // ตำแหน่ง
  gender?: string                     // เพศ
  nationality?: string                // สัญชาติ
  citizenship?: string                // เชื้อชาติ
  religion?: string                   // ศาสนา
  birth_date?: string                 // วันเกิด
  start_date?: string                 // วันเริ่มงาน
  
  // ข้อมูลภาษีและประกัน
  tax_id?: string                     // เลขประจำตัวผู้เสียภาษี
  social_security?: string            // เลขประกันสังคม
  
  // กองทุนต่างๆ
  provident_fund?: number             // กองทุนสำรองเลี้ยงชีพ (ลูกจ้าง)
  company_provident_fund?: number     // กองทุนสำรองเลี้ยงชีพ (บริษัท)
  provident_fund_deduction?: number   // หักกองทุนสำรองเลี้ยงชีพ
  social_fund_deduction?: number      // หักกองทุนประกันสังคม
  life_insurance?: number             // ประกันชีวิต
  housing_loan?: number               // เงินกู้บ้าน
  teacher_fund?: number               // กองทุนครู
  rmf_fund?: number                   // กองทุน RMF
  
  // เงินเดือนคงที่
  position_allowance?: number         // ค่าตำแหน่ง
  phone_allowance?: number            // ค่าโทรศัพท์
  other_allowance?: number            // ค่าอื่นๆ
  defective_work_deduction?: number   // หักงานเสีย
  
  // ค่าลดหย่อน
  tax_allowance?: number              // ค่าลดหย่อนส่วนตัว
  spouse_allowance?: number           // ค่าลดหย่อนคู่สมรส
  child_allowance?: number            // ค่าลดหย่อนบุตร
  number_of_children?: number         // จำนวนบุตร
}

// ตัวอย่าง UI sections ที่ต้องเพิ่ม

// Section 1: ข้อมูลส่วนตัว
<div style={{ marginBottom: '32px' }}>
  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}>
    ข้อมูลส่วนตัว
  </h3>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
    <div>
      <label>แผนก/ฝ่าย</label>
      <input type="text" value={formData.section || ''} onChange={(e) => handleChange('section', e.target.value)} />
    </div>
    <div>
      <label>ตำแหน่ง</label>
      <input type="text" value={formData.position || ''} onChange={(e) => handleChange('position', e.target.value)} />
    </div>
    <div>
      <label>เพศ</label>
      <select value={formData.gender || ''} onChange={(e) => handleChange('gender', e.target.value)}>
        <option value="">-- เลือก --</option>
        <option value="male">ชาย</option>
        <option value="female">หญิง</option>
        <option value="other">อื่นๆ</option>
      </select>
    </div>
    <div>
      <label>สัญชาติ</label>
      <input type="text" value={formData.nationality || ''} onChange={(e) => handleChange('nationality', e.target.value)} placeholder="เช่น ไทย" />
    </div>
    <div>
      <label>เชื้อชาติ</label>
      <input type="text" value={formData.citizenship || ''} onChange={(e) => handleChange('citizenship', e.target.value)} placeholder="เช่น ไทย" />
    </div>
    <div>
      <label>ศาสนา</label>
      <input type="text" value={formData.religion || ''} onChange={(e) => handleChange('religion', e.target.value)} placeholder="เช่น พุทธ" />
    </div>
    <div>
      <label>วันเกิด</label>
      <input type="date" value={formData.birth_date || ''} onChange={(e) => handleChange('birth_date', e.target.value)} />
    </div>
    <div>
      <label>วันเริ่มงาน</label>
      <input type="date" value={formData.start_date || ''} onChange={(e) => handleChange('start_date', e.target.value)} />
    </div>
  </div>
</div>

// Section 2: ข้อมูลภาษีและประกัน
<div style={{ marginBottom: '32px' }}>
  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}>
    ข้อมูลภาษีและประกันสังคม
  </h3>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
    <div>
      <label>เลขประจำตัวผู้เสียภาษี</label>
      <input type="text" value={formData.tax_id || ''} onChange={(e) => handleChange('tax_id', e.target.value)} maxLength={13} />
    </div>
    <div>
      <label>เลขประกันสังคม</label>
      <input type="text" value={formData.social_security || ''} onChange={(e) => handleChange('social_security', e.target.value)} maxLength={20} />
    </div>
  </div>
</div>

// Section 3: เงินเดือนและค่าตอบแทนคงที่
<div style={{ marginBottom: '32px' }}>
  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}>
    เงินเดือนและค่าตอบแทนคงที่
  </h3>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
    <div>
      <label>ค่าตำแหน่ง (บาท)</label>
      <input type="number" value={formData.position_allowance || ''} onChange={(e) => handleChange('position_allowance', Number(e.target.value))} step="0.01" />
    </div>
    <div>
      <label>ค่าโทรศัพท์ (บาท)</label>
      <input type="number" value={formData.phone_allowance || ''} onChange={(e) => handleChange('phone_allowance', Number(e.target.value))} step="0.01" />
    </div>
    <div>
      <label>ค่าอื่นๆคงที่ (บาท)</label>
      <input type="number" value={formData.other_allowance || ''} onChange={(e) => handleChange('other_allowance', Number(e.target.value))} step="0.01" />
    </div>
    <div>
      <label>หักงานเสีย (บาท)</label>
      <input type="number" value={formData.defective_work_deduction || ''} onChange={(e) => handleChange('defective_work_deduction', Number(e.target.value))} step="0.01" />
    </div>
  </div>
</div>

// Section 4: กองทุนต่างๆ
<div style={{ marginBottom: '32px' }}>
  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}>
    กองทุนและการหักเงิน
  </h3>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
    <div>
      <label>กองทุนสำรองเลี้ยงชีพ - ลูกจ้าง (บาท)</label>
      <input type="number" value={formData.provident_fund || ''} onChange={(e) => handleChange('provident_fund', Number(e.target.value))} step="0.01" />
    </div>
    <div>
      <label>กองทุนสำรองเลี้ยงชีพ - บริษัท (บาท)</label>
      <input type="number" value={formData.company_provident_fund || ''} onChange={(e) => handleChange('company_provident_fund', Number(e.target.value))} step="0.01" />
    </div>
    <div>
      <label>ประกันชีวิต (บาท)</label>
      <input type="number" value={formData.life_insurance || ''} onChange={(e) => handleChange('life_insurance', Number(e.target.value))} step="0.01" />
    </div>
    <div>
      <label>กองทุนครู (บาท)</label>
      <input type="number" value={formData.teacher_fund || ''} onChange={(e) => handleChange('teacher_fund', Number(e.target.value))} step="0.01" />
    </div>
    <div>
      <label>เงินกู้บ้าน (บาท)</label>
      <input type="number" value={formData.housing_loan || ''} onChange={(e) => handleChange('housing_loan', Number(e.target.value))} step="0.01" />
    </div>
    <div>
      <label>กองทุน RMF (บาท)</label>
      <input type="number" value={formData.rmf_fund || ''} onChange={(e) => handleChange('rmf_fund', Number(e.target.value))} step="0.01" />
    </div>
  </div>
</div>

// Section 5: ค่าลดหย่อนภาษี
<div style={{ marginBottom: '32px' }}>
  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}>
    ค่าลดหย่อนภาษี
  </h3>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
    <div>
      <label>ค่าลดหย่อนส่วนตัว (บาท)</label>
      <input type="number" value={formData.tax_allowance || 60000} onChange={(e) => handleChange('tax_allowance', Number(e.target.value))} step="0.01" />
      <small style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ค่าเริ่มต้น 60,000 บาท/ปี</small>
    </div>
    <div>
      <label>ค่าลดหย่อนคู่สมรส (บาท)</label>
      <input type="number" value={formData.spouse_allowance || ''} onChange={(e) => handleChange('spouse_allowance', Number(e.target.value))} step="0.01" />
    </div>
    <div>
      <label>จำนวนบุตร</label>
      <input type="number" value={formData.number_of_children || 0} onChange={(e) => handleChange('number_of_children', Number(e.target.value))} min="0" />
    </div>
    <div>
      <label>ค่าลดหย่อนบุตร (บาท)</label>
      <input type="number" value={formData.child_allowance || ''} onChange={(e) => handleChange('child_allowance', Number(e.target.value))} step="0.01" />
      <small style={{ fontSize: '11px', color: 'var(--text-muted)' }}>30,000 บาท/คน</small>
    </div>
  </div>
</div>
```

---

## วิธีการทดสอบ

### 1. ทดสอบหน้า Employee Detail
```
1. เปิด /employees/[employee_id]
2. ตรวจสอบว่าแสดงยอดสะสม YTD
3. ตรวจสอบว่าแสดงรายการเงินได้/เงินหักถูกต้อง
```

### 2. ทดสอบ Employee OT Viewer
```
1. เปิด /liff/employee-ot-viewer ผ่าน LINE
2. กดปุ่ม "ดูรายละเอียดค่าจ้าง"
3. ตรวจสอบว่าแสดงค่าจ้างแต่ละงวดถูกต้อง
4. ตรวจสอบว่าแสดงยอดสะสม 6 รายการครบ
```

### 3. ทดสอบฟอร์มพนักงาน
```
1. เปิด /employees/add
2. กรอกข้อมูลทุกฟิลด์ใหม่
3. บันทึกและตรวจสอบใน database
```

---

## สรุป

เอกสารนี้ให้ตัวอย่างโค้ดที่พร้อมใช้งานสำหรับงานที่เหลือทั้ง 3 อย่าง:
1. ✅ อัพเดทหน้า employee detail พร้อมโค้ดสำเร็จรูป
2. ✅ อัพเดท employee-ot-viewer พร้อมโค้ดสำเร็จรูป
3. ✅ ปรับปรุงฟอร์มพนักงานพร้อม UI ครบทุกฟิลด์

**คุณสามารถ copy-paste โค้ดเหล่านี้ไปใช้งานได้เลย!** 🚀

---

**Last Updated:** November 19, 2025
**Version:** 1.0.0

