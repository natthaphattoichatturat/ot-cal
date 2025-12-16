// Types สำหรับสลิปเงินเดือน (Payslip)

export interface PayslipEmployee {
  code: string           // รหัสพนักงาน
  name: string           // ชื่อ-สกุล
  position: string       // ตำแหน่ง
  department: string     // ฝ่าย (รหัส)
  section: string        // แผนก (รหัส)
  bankName: string       // ชื่อธนาคาร
  accountNumber: string  // เลขที่บัญชี
}

export interface FinancialItem {
  id: string
  name: string
  amount: number
}

export interface YTDData {
  income: number           // เงินเดือนสะสม
  tax: number              // ภาษีเงินได้สะสม
  socialSecurity: number   // ประกันสังคมสะสม
  fund: number             // กองทุนสะสม
  totalIncome: number      // รวมเงินได้สะสม
  totalDeduction: number   // รวมเงินหักสะสม
  netIncome: number        // เงินได้สุทธิสะสม
}

export interface PayslipData {
  companyName: string      // ชื่อบริษัท
  dateRange: string        // งวดวันที่ เช่น "11/10/2025 - 25/10/2025"
  issueDate?: string       // วันที่ออกสลิป
  employee: PayslipEmployee
  salary: number           // เงินเดือน/ค่าจ้างพื้นฐาน

  // รายได้ (16 รายการตาม template)
  additions: FinancialItem[]

  // รายจ่าย (12 รายการตาม template)
  deductions: FinancialItem[]

  // ยอดสะสม
  ytd: YTDData
}

// Default additions template ตาม slip.pdf
export const DEFAULT_ADDITIONS: FinancialItem[] = [
  { id: '1', name: 'OT1', amount: 0 },           // OT ปกติ (×1.5)
  { id: '2', name: 'OT2', amount: 0 },           // OT พิเศษ (×2)
  { id: '3', name: 'OT3', amount: 0 },           // OT ขั้นสูง (×3)
  { id: '4', name: 'OT4', amount: 0 },           // OT อื่นๆ
  { id: '5', name: 'ค่าตำแหน่ง', amount: 0 },
  { id: '6', name: 'เบี้ยขยัน', amount: 0 },
  { id: '7', name: 'ค่ากะ', amount: 0 },
  { id: '8', name: 'ค่าโทรศัพท์', amount: 0 },
  { id: '9', name: 'ค่าครองชีพ', amount: 0 },
  { id: '10', name: 'ค่าพิเศษ', amount: 0 },
  { id: '11', name: 'ค่าอื่นๆ', amount: 0 },
  { id: '12', name: 'ค่าอื่นๆ (พิเศษ)', amount: 0 },
  { id: '13', name: 'คืนเบี้ยขยัน', amount: 0 },
  { id: '14', name: 'คืนพักร้อน', amount: 0 },
  { id: '15', name: 'โบนัสรายเดือน', amount: 0 },
  { id: '16', name: 'โบนัสรายปี', amount: 0 },
]

// Default deductions template ตาม slip.pdf
export const DEFAULT_DEDUCTIONS: FinancialItem[] = [
  { id: '1', name: 'ประกันสังคม', amount: 0 },
  { id: '2', name: 'ภาษีเงินได้', amount: 0 },
  { id: '3', name: 'กองทุน', amount: 0 },
  { id: '4', name: 'มาสาย', amount: 0 },
  { id: '5', name: 'ขาดงาน', amount: 0 },
  { id: '6', name: 'ลากิจ', amount: 0 },
  { id: '7', name: 'ค่าชุดฟอร์ม/หักกยศ.', amount: 0 },
  { id: '8', name: 'สหกรณ์', amount: 0 },
  { id: '9', name: 'งานเสีย', amount: 0 },
  { id: '10', name: 'ค่าฌาปนกิจ', amount: 0 },
  { id: '11', name: 'หักค่าพิเศษ', amount: 0 },
  { id: '12', name: 'หักค่าอื่นๆ', amount: 0 },
]

// Bank ID to name mapping
export const BANK_NAMES: { [key: number]: string } = {
  1: 'ธนาคารกรุงเทพ',
  2: 'ธนาคารกสิกรไทย',
  3: 'ธนาคารกรุงไทย',
  4: 'ธนาคารไทยพาณิชย์',
  5: 'ธนาคารทหารไทยธนชาต',
  6: 'ธนาคารกรุงศรีอยุธยา',
  7: 'ธนาคารออมสิน',
  8: 'ธนาคารเพื่อการเกษตรฯ',
}

export function getBankName(bankId: number | null): string {
  if (!bankId) return 'ธนาคาร 004'
  return BANK_NAMES[bankId] || `ธนาคาร ${bankId.toString().padStart(3, '0')}`
}
