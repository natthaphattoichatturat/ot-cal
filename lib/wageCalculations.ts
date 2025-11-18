/**
 * Wage Calculation Utilities
 * ฟังก์ชันสำหรับคำนวณค่าจ้าง, ประกันสังคม, และภาษี
 */

export interface DailyAttendance {
  work_date: string
  actual_hours: number
  ot_normal_hours: number
  ot_special_hours: number
  ot_premium_hours: number
  scheduled_in_time?: string
  check_in_time?: string
  is_holiday: boolean
  is_leave: boolean
  late: boolean
}

export interface EmployeeInfo {
  employee_id: string
  name: string
  department: string
  perhr_salary: number
  perday_salary: number
}

export interface DailyWageCalculation {
  work_date: string
  perhr_salary: number
  actual_hours: number
  ot_normal_hours: number
  ot_special_hours: number
  ot_premium_hours: number
  base_wage: number
  ot1_wage: number
  ot2_wage: number
  ot3_wage: number
  daily_total_wage: number
  is_holiday: boolean
  is_leave: boolean
  late: boolean
}

export interface PeriodWageCalculation {
  employee_id: string
  name: string
  department: string
  total_base_wage: number
  total_ot1_wage: number
  total_ot2_wage: number
  total_ot3_wage: number
  gross_wage: number
  attendance_bonus: number
  total_income: number
  sso_employee: number
  tax_withholding: number
  total_deductions: number
  net_wage: number
}

export interface SSOCalculation {
  period1_income: number
  period2_income: number
  total_monthly_income: number
  sso_base: number
  period1_sso: number
  period2_sso: number
  total_monthly_sso: number
  employer_sso: number
}

/**
 * คำนวณค่าจ้างรายวัน
 */
export function calculateDailyWage(
  attendance: DailyAttendance,
  perhrSalary: number
): DailyWageCalculation {
  // ค่าจ้างพื้นฐาน = 8 ชม. × perhr_salary (ถ้ามีการทำงาน)
  const baseWage = attendance.actual_hours > 0 ? 8 * perhrSalary : 0

  // ค่า OT แต่ละระดับ (ชั่วโมงที่บันทึกคูณด้วย multiplier แล้ว)
  const ot1Wage = attendance.ot_normal_hours * perhrSalary
  const ot2Wage = attendance.ot_special_hours * perhrSalary
  const ot3Wage = attendance.ot_premium_hours * perhrSalary

  // รวมค่าจ้างของวัน
  const dailyTotalWage = baseWage + ot1Wage + ot2Wage + ot3Wage

  return {
    work_date: attendance.work_date,
    perhr_salary: perhrSalary,
    actual_hours: attendance.actual_hours,
    ot_normal_hours: attendance.ot_normal_hours,
    ot_special_hours: attendance.ot_special_hours,
    ot_premium_hours: attendance.ot_premium_hours,
    base_wage: baseWage,
    ot1_wage: ot1Wage,
    ot2_wage: ot2Wage,
    ot3_wage: ot3Wage,
    daily_total_wage: dailyTotalWage,
    is_holiday: attendance.is_holiday,
    is_leave: attendance.is_leave,
    late: attendance.late
  }
}

/**
 * ตรวจสอบว่ามีสิทธิ์ได้เบี้ยขยันหรือไม่
 * เงื่อนไข: มาก่อนเวลา >= 5 นาที ทุกวันในงวด
 */
export function checkAttendanceBonus(attendances: DailyAttendance[]): boolean {
  if (attendances.length === 0) return false

  // กรองเฉพาะวันทำงาน (ไม่ใช่วันหยุด ไม่ใช่วันลา)
  const workDays = attendances.filter(att => !att.is_holiday && !att.is_leave && att.actual_hours > 0)

  if (workDays.length === 0) return false

  // ตรวจสอบว่าทุกวันทำงานมาก่อนเวลา >= 5 นาที
  return workDays.every(att => {
    if (!att.scheduled_in_time || !att.check_in_time) return false

    const scheduled = parseTime(att.scheduled_in_time)
    const checkIn = parseTime(att.check_in_time)

    if (!scheduled || !checkIn) return false

    const earlyMinutes = (scheduled - checkIn) / (1000 * 60)
    return earlyMinutes >= 5
  })
}

/**
 * คำนวณค่าจ้างรายงวด
 */
export function calculatePeriodWage(
  employee: EmployeeInfo,
  dailyWages: DailyWageCalculation[],
  hasAttendanceBonus: boolean
): PeriodWageCalculation {
  // สรุปค่าจ้างแต่ละประเภท
  const totalBaseWage = dailyWages.reduce((sum, dw) => sum + dw.base_wage, 0)
  const totalOt1Wage = dailyWages.reduce((sum, dw) => sum + dw.ot1_wage, 0)
  const totalOt2Wage = dailyWages.reduce((sum, dw) => sum + dw.ot2_wage, 0)
  const totalOt3Wage = dailyWages.reduce((sum, dw) => sum + dw.ot3_wage, 0)

  // รวมค่าจ้าง (ไม่รวมเบี้ยขยัน)
  const grossWage = totalBaseWage + totalOt1Wage + totalOt2Wage + totalOt3Wage

  // เบี้ยขยัน
  const attendanceBonus = hasAttendanceBonus ? 300 : 0

  // รวมรายได้
  const totalIncome = grossWage + attendanceBonus

  // คำนวณการหัก (ยังไม่ได้คำนวณจริง จะคำนวณใน API)
  const ssoEmployee = 0
  const taxWithholding = 0
  const totalDeductions = ssoEmployee + taxWithholding

  // เงินสุทธิ
  const netWage = totalIncome - totalDeductions

  return {
    employee_id: employee.employee_id,
    name: employee.name,
    department: employee.department,
    total_base_wage: totalBaseWage,
    total_ot1_wage: totalOt1Wage,
    total_ot2_wage: totalOt2Wage,
    total_ot3_wage: totalOt3Wage,
    gross_wage: grossWage,
    attendance_bonus: attendanceBonus,
    total_income: totalIncome,
    sso_employee: ssoEmployee,
    tax_withholding: taxWithholding,
    total_deductions: totalDeductions,
    net_wage: netWage
  }
}

/**
 * คำนวณประกันสังคม (SSO) แบบรายเดือน
 * รองรับการจ่ายเงิน 2 งวด/เดือน
 */
export function calculateMonthlySSO(
  period1Income: number,
  period2Income: number
): SSOCalculation {
  const SSO_RATE = 0.05 // 5%
  const SSO_MAX_BASE = 15000 // ฐานสูงสุด 15,000 บาท
  const SSO_MAX_AMOUNT = 750 // หักสูงสุด 750 บาท/เดือน

  // รายได้รวมทั้งเดือน
  const totalMonthlyIncome = period1Income + period2Income

  // ฐานคำนวณ SSO (สูงสุด 15,000)
  const ssoBase = Math.min(totalMonthlyIncome, SSO_MAX_BASE)

  // SSO ทั้งเดือน
  const totalMonthlySso = Math.min(ssoBase * SSO_RATE, SSO_MAX_AMOUNT)

  // SSO งวดที่ 1
  const period1Sso = Math.min(period1Income * SSO_RATE, SSO_MAX_AMOUNT)

  // SSO งวดที่ 2 = ยอดเต็มเดือน - ที่หักไปงวดที่ 1
  const period2Sso = Math.max(0, totalMonthlySso - period1Sso)

  // SSO ส่วนบริษัท (5%)
  const employerSso = totalMonthlySso

  return {
    period1_income: period1Income,
    period2_income: period2Income,
    total_monthly_income: totalMonthlyIncome,
    sso_base: ssoBase,
    period1_sso: period1Sso,
    period2_sso: period2Sso,
    total_monthly_sso: totalMonthlySso,
    employer_sso: employerSso
  }
}

/**
 * คำนวณภาษีเงินได้หัก ณ ที่จ่าย (แบบง่าย)
 * สำหรับรายได้ต่อปี
 */
export function calculateWithholdingTax(yearlyIncome: number): number {
  // ค่าลดหย่อนส่วนตัว
  const PERSONAL_ALLOWANCE = 60000

  // รายได้หลังหักค่าลดหย่อน
  const taxableIncome = Math.max(0, yearlyIncome - PERSONAL_ALLOWANCE)

  // คำนวณภาษีตามขั้นบันได
  let tax = 0

  if (taxableIncome <= 150000) {
    tax = 0
  } else if (taxableIncome <= 300000) {
    tax = (taxableIncome - 150000) * 0.05
  } else if (taxableIncome <= 500000) {
    tax = 7500 + (taxableIncome - 300000) * 0.10
  } else if (taxableIncome <= 750000) {
    tax = 27500 + (taxableIncome - 500000) * 0.15
  } else if (taxableIncome <= 1000000) {
    tax = 65000 + (taxableIncome - 750000) * 0.20
  } else if (taxableIncome <= 2000000) {
    tax = 115000 + (taxableIncome - 1000000) * 0.25
  } else if (taxableIncome <= 5000000) {
    tax = 365000 + (taxableIncome - 2000000) * 0.30
  } else {
    tax = 1265000 + (taxableIncome - 5000000) * 0.35
  }

  return tax
}

/**
 * Helper: แปลงเวลาเป็น Date object
 */
function parseTime(timeStr: string): Date | null {
  if (!timeStr) return null
  try {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date
  } catch {
    return null
  }
}

/**
 * Helper: คำนวณระยะห่างระหว่างวันที่
 */
export function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0])
  }

  return dates
}

/**
 * Helper: คำนวณวันที่ของงวด
 */
export function getPeriodDates(year: number, month: number, period: 1 | 2): { startDate: string; endDate: string } {
  if (period === 1) {
    // งวดที่ 1: 26 (เดือนก่อน) - 10
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year

    const startDate = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-26`
    const endDate = `${year}-${month.toString().padStart(2, '0')}-10`

    return { startDate, endDate }
  } else {
    // งวดที่ 2: 11 - 25
    const startDate = `${year}-${month.toString().padStart(2, '0')}-11`
    const endDate = `${year}-${month.toString().padStart(2, '0')}-25`

    return { startDate, endDate }
  }
}
