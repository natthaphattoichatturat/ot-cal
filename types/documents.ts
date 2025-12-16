// Types สำหรับเอกสาร HR ทั้งหมด

// ========== สลิปเงินเดือน (Payslip) ==========
// Types are defined in ./payslip.ts - import directly from there

// ========== ภ.ง.ด.1 (P.N.D.1) - รายเดือน ==========
export interface PND1Data {
  // ข้อมูลบริษัท
  companyTaxId: string           // เลขประจำตัวผู้เสียภาษี (13 หลัก)
  companyName: string            // ชื่อบริษัท
  companyBranch: string          // สาขา
  companyAddress: string         // ที่ตั้งสำนักงาน
  postalCode: string             // รหัสไปรษณีย์
  phone: string                  // โทรศัพท์

  // ข้อมูลงวด
  taxMonth: number               // เดือนที่จ่ายเงินได้
  taxYear: number                // ปี พ.ศ.
  submissionType: 'normal' | 'additional'  // ยื่นปกติ/ยื่นเพิ่มเติม

  // สรุปรายการภาษีที่นำส่ง
  summary: {
    employeeCount: number        // จำนวนราย
    totalIncome: number          // เงินได้ทั้งสิ้น
    totalTax: number             // ภาษีที่นำส่งทั้งสิ้น
  }

  // รายละเอียดพนักงาน (แนบ ก.ง.ด.1 ใบแนบ)
  employees: PND1Employee[]
}

export interface PND1Employee {
  sequence: number               // ลำดับที่
  idNumber: string               // เลขประจำตัวประชาชน (13 หลัก)
  titleName: string              // คำนำหน้า
  firstName: string              // ชื่อ
  lastName: string               // นามสกุล
  incomeAmount: number           // จำนวนเงินที่จ่าย
  taxAmount: number              // ภาษีที่หัก
  incomeType: '40(1)' | '40(2)'  // ประเภทเงินได้
}

// ========== ภ.ง.ด.1ก (P.N.D.1 Kor) - รายปี ==========
export interface PND1KorData {
  // ข้อมูลบริษัท
  companyTaxId: string
  companyName: string
  companyBranch: string
  companyAddress: string
  postalCode: string
  phone: string

  // ข้อมูลปี
  taxYear: number                // ปี พ.ศ.

  // สรุปรายการภาษีที่นำส่ง
  summary: {
    employeeCount: number
    totalIncome: number
    totalTax: number
  }

  // รายละเอียดพนักงาน
  employees: PND1KorEmployee[]
}

export interface PND1KorEmployee {
  sequence: number
  idNumber: string
  titleName: string
  firstName: string
  lastName: string
  totalIncome: number            // รายได้รวมทั้งปี
  totalTax: number               // ภาษีรวมทั้งปี
  incomeType: '40(1)' | '40(2)'
}

// ========== สปส. 1-10 (SSO Form) ==========
export interface SSO110Data {
  // ข้อมูลบริษัท
  companyName: string
  companyAddress: string
  postalCode: string
  phone: string
  fax: string
  accountNumber: string          // เลขที่บัญชี (15 หลัก)
  branchNumber: string           // ลำดับที่สาขา (6 หลัก)

  // ข้อมูลงวด
  contributionMonth: number      // เดือนที่นำส่ง
  contributionYear: number       // ปี พ.ศ.
  ssoRate: number                // อัตราเงินสมทบร้อยละ (5.00)

  // สรุปรายการ
  summary: {
    totalWages: number           // เงินค่าจ้างทั้งสิ้น
    employeeContribution: number // เงินสมทบผู้ประกันตน
    employerContribution: number // เงินสมทบนายจ้าง
    totalContribution: number    // รวมเงินสมทบที่นำส่งทั้งสิ้น
    employeeCount: number        // จำนวนผู้ประกันตนที่ส่งเงินสมทบ
  }

  // รายละเอียดพนักงาน
  employees: SSO110Employee[]
}

export interface SSO110Employee {
  sequence: number               // ลำดับที่
  idNumber: string               // เลขประจำตัวประชาชน (13 หลัก)
  titleName: string              // คำนำหน้านาม
  firstName: string              // ชื่อ
  lastName: string               // ชื่อสกุล
  actualWages: number            // ค่าจ้างที่จ่ายจริง
  contribution: number           // เงินสมทบผู้ประกันตน
}

// ========== หนังสือรับรองฯ 50 ทวิ ==========
export interface WithholdingCertData {
  // ข้อมูลบริษัท (ผู้จ่ายเงิน)
  companyTaxId: string
  companyName: string
  companyAddress: string

  // ข้อมูลพนักงาน (ผู้มีเงินได้)
  employee: {
    idNumber: string
    titleName: string
    firstName: string
    lastName: string
    address: string
  }

  // ข้อมูลปี
  taxYear: number                // ปี พ.ศ.
  issueDate: string              // วันที่ออกหนังสือ

  // สรุปรายได้และภาษี
  incomeDetails: {
    incomeType: '40(1)' | '40(2)'
    totalIncome: number          // รายได้รวมทั้งปี
    totalTax: number             // ภาษีที่หักรวมทั้งปี
  }[]

  // รวมทั้งสิ้น
  grandTotalIncome: number
  grandTotalTax: number
}

// ========== ข้อมูลบริษัทเริ่มต้น ==========
export const DEFAULT_COMPANY_INFO = {
  companyTaxId: '0745536000938',
  companyName: 'บริษัท ฟงซัน พริ้นติ้ง จำกัด',
  companyBranch: '00000',
  companyAddress: '78 ม.2 ถ.จรัลยานนท์ ต.บางวัว อ.บางปะกง จ.ฉะเชิงเทรา',
  postalCode: '24180',
  phone: '038-540299',
  fax: '038-540297-8',
  accountNumber: '1100041745',
  branchNumber: '000000'
}
