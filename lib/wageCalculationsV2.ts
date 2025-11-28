/**
 * Wage Calculation Utilities V2
 * รองรับการคำนวณค่าจ้างแบบละเอียด สำหรับพนักงานรายวัน และรายเดือน
 */

export interface DailyAttendanceV2 {
  work_date: string
  actual_hours: number
  ot_normal_hours: number // OT ปกติ x1.5
  ot_special_hours: number // OT วันหยุด 8 ชม.แรก (x2 รายวัน, x1 รายเดือน)
  ot_premium_hours: number // OT วันหยุดเกิน 8 ชม. x3
  scheduled_in_time?: string
  check_in_time?: string
  check_out_time?: string
  is_holiday: boolean
  is_leave: boolean
  late: boolean
  late_hours: number
}

export interface EmployeeInfoV2 {
  employee_id: string
  name: string
  department: string
  employment_type: 'รายวัน' | 'รายเดือน'
  perhr_salary: number
  perday_salary: number
  monthly_salary: number // เงินเดือนต่องวด (สำหรับรายเดือน)
}

export interface LeaveRecord {
  leave_date: string
  leave_type: string
  leave_hours: number
}

export interface WageAdjustment {
  adjustment_type: 'income' | 'deduction'
  category: string
  amount: number
  description?: string
}

export interface PeriodWageDetailV2 {
  employee_id: string
  name: string
  department: string
  employment_type: 'รายวัน' | 'รายเดือน'
  
  // ข้อมูลพื้นฐาน
  perday_salary: number
  perhr_salary: number
  monthly_salary: number
  
  // วันทำงาน
  total_days: number
  work_days: number // วันที่มาทำงาน (ไม่นับวันหยุด)
  holiday_work_days: number // วันที่ทำงานในวันหยุด
  leave_days: number
  absent_days: number
  
  // ค่าแรงพื้นฐาน
  base_wage: number
  
  // OT
  ot1_hours: number
  ot2_hours: number
  ot3_hours: number
  ot1_wage: number
  ot2_wage: number
  ot3_wage: number
  total_ot_wage: number
  
  // เงินเพิ่ม
  night_shift_days: number
  night_shift_allowance: number
  attendance_bonus: number
  additional_income: number
  
  // เงินหัก
  late_minutes: number
  late_deduction: number
  leave_deduction: number
  additional_deduction: number
  
  // รวม
  gross_income: number
  total_income: number
  sso: number
  tax: number
  total_deduction: number
  net_wage: number
}

/**
 * คำนวณค่าจ้างรายงวดแบบละเอียด
 */
export function calculatePeriodWageV2(
  employee: EmployeeInfoV2,
  attendances: DailyAttendanceV2[],
  leaveRecords: LeaveRecord[],
  adjustments: WageAdjustment[],
  periodDates: { startDate: string; endDate: string }
): PeriodWageDetailV2 {
  
  const isDaily = employee.employment_type === 'รายวัน'
  
  // นับจำนวนวันต่างๆ
  const allDates = getDateRange(periodDates.startDate, periodDates.endDate)
  const totalDays = allDates.length
  
  // วันที่มาทำงาน (ไม่นับวันหยุด)
  const workDays = attendances.filter(att => !att.is_holiday && att.actual_hours > 0).length
  
  // วันที่ทำงานในวันหยุด/อาทิตย์
  const holidayWorkDays = attendances.filter(att => att.is_holiday && att.actual_hours > 0).length
  
  // วันลา
  const leaveDays = leaveRecords.length
  
  // วันขาดงาน (วันที่ไม่มาทำงาน ไม่ลา ไม่ใช่วันหยุด)
  const absentDays = Math.max(0, totalDays - workDays - holidayWorkDays - leaveDays)
  
  // ========== คำนวณค่าแรงพื้นฐาน ==========
  let baseWage = 0
  if (isDaily) {
    // พนักงานรายวัน: คูณจำนวนวันที่มาทำงาน (ไม่นับวันหยุด)
    baseWage = workDays * employee.perday_salary
  } else {
    // พนักงานรายเดือน: เงินเดือนเต็ม หักวันลา
    baseWage = employee.monthly_salary
  }
  
  // ========== คำนวณ OT ==========
  let ot1_hours = 0
  let ot2_hours = 0
  let ot3_hours = 0
  
  attendances.forEach(att => {
    ot1_hours += att.ot_normal_hours || 0
    ot2_hours += att.ot_special_hours || 0
    ot3_hours += att.ot_premium_hours || 0
  })
  
  // คำนวณค่า OT
  // OT1: ปกติ x1.5 (คูณไว้แล้วใน ot_hours)
  const ot1_wage = ot1_hours * employee.perhr_salary
  
  // OT2: วันหยุด 8 ชม.แรก (คูณไว้แล้วใน ot_hours)
  const ot2_wage = ot2_hours * employee.perhr_salary
  
  // OT3: วันหยุดเกิน 8 ชม. (คูณไว้แล้วใน ot_hours)
  const ot3_wage = ot3_hours * employee.perhr_salary
  
  const total_ot_wage = ot1_wage + ot2_wage + ot3_wage
  
  // ========== คำนวณค่ากะ ==========
  // นับจำนวนวันที่ทำกะดึก (check_in_time >= 19:00)
  const nightShiftDays = attendances.filter(att => {
    if (!att.check_in_time) return false
    const checkInHour = parseInt(att.check_in_time.split(':')[0])
    return checkInHour >= 19 || checkInHour < 6
  }).length
  
  const nightShiftAllowance = nightShiftDays * 40 // 40 บาทต่อวัน
  
  // ========== เบี้ยขยัน ==========
  const hasAttendanceBonus = checkAttendanceBonusV2(attendances)
  const attendanceBonus = hasAttendanceBonus ? 300 : 0
  
  // ========== เงินเพิ่มจาก adjustments ==========
  const additionalIncome = adjustments
    .filter(adj => adj.adjustment_type === 'income')
    .reduce((sum, adj) => sum + adj.amount, 0)
  
  // ========== หักมาสาย ==========
  const lateMinutes = attendances.reduce((sum, att) => {
    if (att.late && att.late_hours > 0) {
      return sum + (att.late_hours * 60)
    }
    return sum
  }, 0)
  
  // คำนวณเงินหักมาสาย: นาที × (ค่าแรงต่อชั่วโมง / 60)
  const lateDeduction = (lateMinutes / 60) * employee.perhr_salary
  
  // ========== หักค่าลา (สำหรับรายเดือน) ==========
  let leaveDeduction = 0
  if (!isDaily && leaveDays > 0) {
    // คำนวณค่าแรงต่อวัน = เงินเดือน / 15
    const dailyRate = employee.monthly_salary / 15
    leaveDeduction = leaveDays * dailyRate
  }
  
  // ========== เงินหักจาก adjustments ==========
  const additionalDeduction = adjustments
    .filter(adj => adj.adjustment_type === 'deduction')
    .reduce((sum, adj) => sum + adj.amount, 0)
  
  // ========== คำนวณรายได้รวม ==========
  const grossIncome = baseWage + total_ot_wage + nightShiftAllowance + attendanceBonus + additionalIncome
  
  // รายได้หลังหักมาสายและลา
  const totalIncome = grossIncome - lateDeduction - leaveDeduction
  
  // ========== คำนวณประกันสังคมและภาษี ==========
  // (จะคำนวณใน API เพราะต้องดูรายได้ทั้งเดือน)
  const sso = 0
  const tax = 0
  
  // รวมเงินหักทั้งหมด
  const totalDeduction = lateDeduction + leaveDeduction + additionalDeduction + sso + tax
  
  // เงินสุทธิ
  const netWage = totalIncome - additionalDeduction - sso - tax
  
  return {
    employee_id: employee.employee_id,
    name: employee.name,
    department: employee.department,
    employment_type: employee.employment_type,
    
    perday_salary: employee.perday_salary,
    perhr_salary: employee.perhr_salary,
    monthly_salary: employee.monthly_salary,
    
    total_days: totalDays,
    work_days: workDays,
    holiday_work_days: holidayWorkDays,
    leave_days: leaveDays,
    absent_days: absentDays,
    
    base_wage: Math.round(baseWage * 100) / 100,
    
    ot1_hours: Math.round(ot1_hours * 100) / 100,
    ot2_hours: Math.round(ot2_hours * 100) / 100,
    ot3_hours: Math.round(ot3_hours * 100) / 100,
    ot1_wage: Math.round(ot1_wage * 100) / 100,
    ot2_wage: Math.round(ot2_wage * 100) / 100,
    ot3_wage: Math.round(ot3_wage * 100) / 100,
    total_ot_wage: Math.round(total_ot_wage * 100) / 100,
    
    night_shift_days: nightShiftDays,
    night_shift_allowance: Math.round(nightShiftAllowance * 100) / 100,
    attendance_bonus: attendanceBonus,
    additional_income: Math.round(additionalIncome * 100) / 100,
    
    late_minutes: Math.round(lateMinutes),
    late_deduction: Math.round(lateDeduction * 100) / 100,
    leave_deduction: Math.round(leaveDeduction * 100) / 100,
    additional_deduction: Math.round(additionalDeduction * 100) / 100,
    
    gross_income: Math.round(grossIncome * 100) / 100,
    total_income: Math.round(totalIncome * 100) / 100,
    sso: Math.round(sso * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total_deduction: Math.round(totalDeduction * 100) / 100,
    net_wage: Math.round(netWage * 100) / 100
  }
}

/**
 * ตรวจสอบว่ามีสิทธิ์ได้เบี้ยขยันหรือไม่
 * เงื่อนไข: มาก่อนเวลา >= 5 นาที ทุกวันในงวด (ไม่นับวันหยุด)
 */
export function checkAttendanceBonusV2(attendances: DailyAttendanceV2[]): boolean {
  if (attendances.length === 0) return false

  // กรองเฉพาะวันทำงานปกติ (ไม่ใช่วันหยุด ไม่ใช่วันลา)
  const workDays = attendances.filter(att => !att.is_holiday && !att.is_leave && att.actual_hours > 0)

  if (workDays.length === 0) return false

  // ตรวจสอบว่าทุกวันทำงานมาก่อนเวลา >= 5 นาที
  return workDays.every(att => {
    if (!att.scheduled_in_time || !att.check_in_time) return false

    const scheduled = parseTime(att.scheduled_in_time)
    const checkIn = parseTime(att.check_in_time)

    if (!scheduled || !checkIn) return false

    const earlyMinutes = (scheduled.getTime() - checkIn.getTime()) / (1000 * 60)
    return earlyMinutes >= 5
  })
}

/**
 * คำนวณประกันสังคม (SSO) แบบรายเดือน
 */
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
    period1_sso: Math.round(period1Sso * 100) / 100,
    period2_sso: Math.round(period2Sso * 100) / 100,
    total_monthly_sso: Math.round(totalMonthlySso * 100) / 100,
    employer_sso: Math.round(employerSso * 100) / 100
  }
}

/**
 * Helper: แปลงเวลาเป็น Date object
 */
function parseTime(timeStr: string): Date | null {
  if (!timeStr) return null
  try {
    const parts = timeStr.split(':')
    const hours = parseInt(parts[0])
    const minutes = parseInt(parts[1])
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date
  } catch {
    return null
  }
}

/**
 * Helper: สร้าง array ของวันที่ในช่วง
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

