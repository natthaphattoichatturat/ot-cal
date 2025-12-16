/**
 * Tax Calculation Utilities
 * คำนวณภาษีหัก ณ ที่จ่ายแบบ Cumulative YTD (ประมาณการรายปี)
 */

// ค่าลดหย่อนเริ่มต้น (สามารถเพิ่มเติมได้ในอนาคต)
export interface TaxDeductions {
  personalAllowance: number      // ค่าลดหย่อนส่วนตัว (60,000)
  spouseAllowance: number        // ค่าลดหย่อนคู่สมรส (60,000)
  childAllowance: number         // ค่าลดหย่อนบุตร (30,000 ต่อคน)
  parentAllowance: number        // ค่าลดหย่อนบิดามารดา (30,000 ต่อคน)
  insuranceAllowance: number     // ค่าลดหย่อนประกันชีวิต (สูงสุด 100,000)
  ssoAllowance: number           // เงินสมทบประกันสังคม (หักจากเงินได้)
  providentFund: number          // กองทุนสำรองเลี้ยงชีพ
  homeLoanInterest: number       // ดอกเบี้ยเงินกู้บ้าน (สูงสุด 100,000)
  otherAllowance: number         // ค่าลดหย่อนอื่นๆ
}

// ค่าลดหย่อนเริ่มต้น (สำหรับพนักงานทั่วไป)
export const DEFAULT_TAX_DEDUCTIONS: TaxDeductions = {
  personalAllowance: 60000,      // ค่าลดหย่อนส่วนตัว
  spouseAllowance: 0,            // ค่าลดหย่อนคู่สมรส
  childAllowance: 0,             // ค่าลดหย่อนบุตร
  parentAllowance: 0,            // ค่าลดหย่อนบิดามารดา
  insuranceAllowance: 0,         // ค่าลดหย่อนประกันชีวิต
  ssoAllowance: 0,               // ประกันสังคม (คำนวณจากรายได้จริง)
  providentFund: 0,              // กองทุนสำรองเลี้ยงชีพ
  homeLoanInterest: 0,           // ดอกเบี้ยเงินกู้บ้าน
  otherAllowance: 0              // ค่าลดหย่อนอื่นๆ
}

// อัตราภาษีขั้นบันได ปี 2567-2568
export const TAX_BRACKETS = [
  { min: 0, max: 150000, rate: 0 },           // ยกเว้น
  { min: 150001, max: 300000, rate: 0.05 },   // 5%
  { min: 300001, max: 500000, rate: 0.10 },   // 10%
  { min: 500001, max: 750000, rate: 0.15 },   // 15%
  { min: 750001, max: 1000000, rate: 0.20 },  // 20%
  { min: 1000001, max: 2000000, rate: 0.25 }, // 25%
  { min: 2000001, max: 5000000, rate: 0.30 }, // 30%
  { min: 5000001, max: Infinity, rate: 0.35 } // 35%
]

// ค่าใช้จ่ายหักเหมา (50% แต่ไม่เกิน 100,000 บาท)
export const EXPENSE_DEDUCTION_RATE = 0.5
export const EXPENSE_DEDUCTION_MAX = 100000

export interface TaxCalculationInput {
  currentPeriodIncome: number    // รายได้งวดปัจจุบัน
  ytdIncome: number              // รายได้สะสม YTD (ก่อนงวดนี้)
  ytdTaxPaid: number             // ภาษีที่หักไปแล้ว YTD
  remainingPeriods: number       // จำนวนงวดที่เหลือในปี (รวมงวดนี้)
  deductions?: Partial<TaxDeductions>  // ค่าลดหย่อน (optional)
  ytdSSO?: number                // SSO สะสม (ถ้ามี)
}

export interface TaxCalculationResult {
  estimatedYearlyIncome: number    // ประมาณการเงินได้ทั้งปี
  expenseDeduction: number         // หักค่าใช้จ่าย
  totalAllowances: number          // ค่าลดหย่อนทั้งหมด
  netTaxableIncome: number         // เงินได้สุทธิ (หลังหักค่าใช้จ่ายและลดหย่อน)
  estimatedYearlyTax: number       // ภาษีที่ต้องเสียทั้งปี
  currentPeriodTax: number         // ภาษีที่หักในงวดนี้
  effectiveTaxRate: number         // อัตราภาษีเฉลี่ย (%)
}

/**
 * คำนวณภาษีแบบ Cumulative YTD (ประมาณการรายปี)
 *
 * ขั้นตอน:
 * 1. ประมาณการเงินได้ทั้งปี = รายได้สะสม YTD + รายได้งวดนี้ + (รายได้งวดนี้ × จำนวนงวดที่เหลือ)
 * 2. เงินได้สุทธิ = ประมาณการเงินได้ทั้งปี - ค่าใช้จ่าย (สูงสุด 100,000) - ค่าลดหย่อนทั้งหมด
 * 3. ภาษีที่ต้องเสียทั้งปี = เงินได้สุทธิ → เทียบอัตราภาษีขั้นบันได
 * 4. หักภาษีในงวดนี้ = (ภาษีที่ต้องเสียทั้งปี - ภาษีที่หักไปแล้ว YTD) / จำนวนงวดที่เหลือ (รวมงวดนี้)
 */
export function calculateWithholdingTax(input: TaxCalculationInput): TaxCalculationResult {
  const {
    currentPeriodIncome,
    ytdIncome,
    ytdTaxPaid,
    remainingPeriods,
    deductions = {},
    ytdSSO = 0
  } = input

  // รวมค่าลดหย่อนกับค่าเริ่มต้น
  const taxDeductions: TaxDeductions = {
    ...DEFAULT_TAX_DEDUCTIONS,
    ...deductions,
    ssoAllowance: ytdSSO + (currentPeriodIncome > 0 ? Math.min(currentPeriodIncome * 0.05, 750) : 0)
  }

  // 1. ประมาณการเงินได้ทั้งปี
  // สูตร: รายได้สะสม YTD + รายได้งวดนี้ + (รายได้งวดนี้ × จำนวนงวดที่เหลือ - 1)
  const periodsAfterThis = Math.max(0, remainingPeriods - 1)
  const estimatedYearlyIncome = ytdIncome + currentPeriodIncome + (currentPeriodIncome * periodsAfterThis)

  // 2. หักค่าใช้จ่าย (50% แต่ไม่เกิน 100,000)
  const expenseDeduction = Math.min(estimatedYearlyIncome * EXPENSE_DEDUCTION_RATE, EXPENSE_DEDUCTION_MAX)

  // 3. รวมค่าลดหย่อนทั้งหมด
  const totalAllowances =
    taxDeductions.personalAllowance +
    taxDeductions.spouseAllowance +
    taxDeductions.childAllowance +
    taxDeductions.parentAllowance +
    taxDeductions.insuranceAllowance +
    (taxDeductions.ssoAllowance * (24 / (24 - remainingPeriods + 1))) + // ประมาณการ SSO ทั้งปี
    taxDeductions.providentFund +
    taxDeductions.homeLoanInterest +
    taxDeductions.otherAllowance

  // 4. เงินได้สุทธิ
  const netTaxableIncome = Math.max(0, estimatedYearlyIncome - expenseDeduction - totalAllowances)

  // 5. คำนวณภาษีที่ต้องเสียทั้งปี (อัตราขั้นบันได)
  const estimatedYearlyTax = calculateProgressiveTax(netTaxableIncome)

  // 6. ภาษีที่หักในงวดนี้
  // สูตร: (ภาษีทั้งปี - ภาษีที่หักไปแล้ว) / จำนวนงวดที่เหลือ
  const remainingTax = Math.max(0, estimatedYearlyTax - ytdTaxPaid)
  const currentPeriodTax = remainingPeriods > 0
    ? Math.round(remainingTax / remainingPeriods * 100) / 100
    : 0

  // 7. อัตราภาษีเฉลี่ย
  const effectiveTaxRate = estimatedYearlyIncome > 0
    ? (estimatedYearlyTax / estimatedYearlyIncome) * 100
    : 0

  return {
    estimatedYearlyIncome: Math.round(estimatedYearlyIncome * 100) / 100,
    expenseDeduction: Math.round(expenseDeduction * 100) / 100,
    totalAllowances: Math.round(totalAllowances * 100) / 100,
    netTaxableIncome: Math.round(netTaxableIncome * 100) / 100,
    estimatedYearlyTax: Math.round(estimatedYearlyTax * 100) / 100,
    currentPeriodTax: Math.round(currentPeriodTax * 100) / 100,
    effectiveTaxRate: Math.round(effectiveTaxRate * 100) / 100
  }
}

/**
 * คำนวณภาษีแบบขั้นบันได
 */
export function calculateProgressiveTax(netIncome: number): number {
  if (netIncome <= 0) return 0

  let tax = 0
  let remainingIncome = netIncome

  for (const bracket of TAX_BRACKETS) {
    if (remainingIncome <= 0) break

    const taxableInBracket = Math.min(
      remainingIncome,
      bracket.max - bracket.min + 1
    )

    if (taxableInBracket > 0 && netIncome >= bracket.min) {
      const incomeInBracket = Math.min(
        netIncome - bracket.min + 1,
        bracket.max - bracket.min + 1
      )

      if (incomeInBracket > 0) {
        tax += Math.max(0, incomeInBracket) * bracket.rate
      }
    }

    remainingIncome -= (bracket.max - bracket.min + 1)
  }

  // คำนวณใหม่แบบถูกต้อง
  tax = 0
  for (const bracket of TAX_BRACKETS) {
    if (netIncome > bracket.min) {
      const taxableAmount = Math.min(netIncome, bracket.max) - bracket.min
      tax += taxableAmount * bracket.rate
    }
  }

  return Math.round(tax * 100) / 100
}

/**
 * คำนวณจำนวนงวดที่เหลือในปี
 * ระบบมี 24 งวดต่อปี (งวดที่ 1: 26-10, งวดที่ 2: 11-25)
 */
export function getRemainingPeriods(currentMonth: number, currentPeriod: 1 | 2): number {
  // งวดปัจจุบัน (1-24)
  const currentPeriodNum = (currentMonth - 1) * 2 + currentPeriod

  // จำนวนงวดที่เหลือ (รวมงวดนี้)
  return 24 - currentPeriodNum + 1
}

/**
 * คำนวณภาษีสำหรับพนักงาน
 */
export function calculateEmployeeTax(
  currentPeriodIncome: number,
  ytdIncome: number,
  ytdTaxPaid: number,
  currentMonth: number,
  currentPeriod: 1 | 2,
  ytdSSO: number = 0,
  customDeductions?: Partial<TaxDeductions>
): TaxCalculationResult {
  const remainingPeriods = getRemainingPeriods(currentMonth, currentPeriod)

  return calculateWithholdingTax({
    currentPeriodIncome,
    ytdIncome,
    ytdTaxPaid,
    remainingPeriods,
    deductions: customDeductions,
    ytdSSO
  })
}
