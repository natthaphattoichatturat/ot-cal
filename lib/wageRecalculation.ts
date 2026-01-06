import { createClient } from '@supabase/supabase-js'
import {
  calculateMonthlySSO,
  calculatePeriodWageV2,
  getPeriodDates,
  type DailyAttendanceV2,
  type EmployeeInfoV2,
  type LeaveRecord,
  type PeriodWageDetailV2,
  type WageAdjustment
} from '@/lib/wageCalculationsV2'

export type RecalculateParams = {
  employeeId: string
  year: number
  month: number
  period: 1 | 2
}

export type RecalculateResult = {
  periodWage: PeriodWageDetailV2
}

export async function recalculateEmployeePeriod({
  employeeId,
  year,
  month,
  period
}: RecalculateParams): Promise<RecalculateResult> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('*')
    .eq('employee_id', employeeId)
    .single()

  if (empError || !employee) {
    throw empError || new Error('Employee not found')
  }

  const employmentType = (employee.employment_type || 'รายวัน') as 'รายวัน' | 'รายเดือน'

  let calculatedPerHrSalary: number
  if (employmentType === 'รายเดือน') {
    calculatedPerHrSalary = Number(((employee.monthly_salary || 0) / 15 / 8).toFixed(8))
  } else {
    calculatedPerHrSalary = Number(((employee.perday_salary || 0) / 8).toFixed(8))
  }

  const employeeInfo: EmployeeInfoV2 = {
    employee_id: employee.employee_id,
    name: employee.name,
    department: employee.department || 'ไม่ระบุ',
    employment_type: employmentType,
    perhr_salary: calculatedPerHrSalary,
    perday_salary: employee.perday_salary || 0,
    monthly_salary: employee.monthly_salary || 0
  }

  const buildAttendance = (rows: any[]): DailyAttendanceV2[] => (rows || []).map(att => ({
    work_date: att.work_date,
    actual_hours: att.actual_hours || 0,
    ot_normal_hours: att.ot_normal_hours || 0,
    ot_special_hours: att.ot_special_hours || 0,
    ot_premium_hours: att.ot_premium_hours || 0,
    ot_normal_hours_multiplied: att.ot_normal_hours_multiplied || undefined,
    ot_special_hours_multiplied: att.ot_special_hours_multiplied || undefined,
    ot_premium_hours_multiplied: att.ot_premium_hours_multiplied || undefined,
    scheduled_in_time: att.scheduled_in_time,
    check_in_time: att.check_in_time,
    check_out_time: att.check_out_time,
    is_holiday: att.is_holiday || false,
    is_leave: att.is_leave || false,
    late: att.late || false,
    late_hours: att.late_hours || 0
  }))

  const buildLeaveRecords = (rows: any[]): LeaveRecord[] => (rows || []).map(leave => ({
    leave_date: leave.leave_date,
    leave_type: leave.leave_type,
    leave_hours: leave.leave_hours || 8,
    is_paid: leave.is_paid === true,
    deduct_diligence: leave.deduct_diligence === true
  }))

  const buildAdjustments = (rows: any[]): WageAdjustment[] => (rows || []).map(adj => ({
    adjustment_type: adj.adjustment_type as 'income' | 'deduction',
    category: adj.category,
    amount: adj.amount,
    description: adj.description
  }))

  const { startDate, endDate } = getPeriodDates(year, month, period)
  const otherPeriod = period === 1 ? 2 : 1
  const { startDate: otherStart, endDate: otherEnd } = getPeriodDates(year, month, otherPeriod)

  const [{ data: attendances }, { data: leaveRows }, { data: adjustments }, { data: morningOTData }] = await Promise.all([
    supabase
      .from('daily_attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('work_date', startDate)
      .lte('work_date', endDate)
      .order('work_date', { ascending: true }),
    supabase
      .from('leave_records')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('leave_date', startDate)
      .lte('leave_date', endDate)
      .or('status.eq.approved,leave_able.eq.true'),
    supabase
      .from('wage_adjustments')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('year', year)
      .eq('month', month)
      .eq('period', period),
    supabase
      .from('morning_ot_allowances')
      .select('allowed_hours, selected_dates')
      .eq('employee_id', employeeId)
      .eq('year', year)
      .eq('month', month)
      .eq('period', period)
      .single()
  ])

  const dailyAttendances = buildAttendance(attendances || [])
  const leaveRecords = buildLeaveRecords(leaveRows || [])
  const wageAdjustments = buildAdjustments(adjustments || [])

  const morningOTAllowance = morningOTData?.allowed_hours || 0
  const selectedDates = morningOTData?.selected_dates || null

  const periodWage = calculatePeriodWageV2(
    employeeInfo,
    dailyAttendances,
    leaveRecords,
    wageAdjustments,
    { startDate, endDate },
    morningOTAllowance,
    selectedDates
  )

  const manualTax = wageAdjustments
    .filter(a =>
      a.adjustment_type === 'deduction' &&
      (a.category === 'ภาษี' || a.category === 'ภาษีหัก ณ ที่จ่าย' || a.category === 'ภาษีเงินได้หัก ณ ที่จ่าย')
    )
    .reduce((sum, a) => sum + (a.amount || 0), 0)

  if (manualTax > 0) {
    periodWage.tax = manualTax
  }

  const [{ data: otherAttendances }, { data: otherLeaves }, { data: otherAdjustments }, { data: otherMorningOTData }] = await Promise.all([
    supabase
      .from('daily_attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('work_date', otherStart)
      .lte('work_date', otherEnd),
    supabase
      .from('leave_records')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('leave_date', otherStart)
      .lte('leave_date', otherEnd)
      .or('status.eq.approved,leave_able.eq.true'),
    supabase
      .from('wage_adjustments')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('year', year)
      .eq('month', month)
      .eq('period', otherPeriod),
    supabase
      .from('morning_ot_allowances')
      .select('allowed_hours, selected_dates')
      .eq('employee_id', employeeId)
      .eq('year', year)
      .eq('month', month)
      .eq('period', otherPeriod)
      .single()
  ])

  const otherDailyAttendances = buildAttendance(otherAttendances || [])
  const otherLeaveRecords = buildLeaveRecords(otherLeaves || [])
  const otherWageAdjustments = buildAdjustments(otherAdjustments || [])

  const otherMorningOTAllowance = otherMorningOTData?.allowed_hours || 0
  const otherSelectedDates = otherMorningOTData?.selected_dates || null

  const otherPeriodWage = calculatePeriodWageV2(
    employeeInfo,
    otherDailyAttendances,
    otherLeaveRecords,
    otherWageAdjustments,
    { startDate: otherStart, endDate: otherEnd },
    otherMorningOTAllowance,
    otherSelectedDates
  )

  const period1Income = period === 1 ? periodWage.total_income : otherPeriodWage.total_income
  const period2Income = period === 2 ? periodWage.total_income : otherPeriodWage.total_income
  const ssoCalc = calculateMonthlySSO(period1Income, period2Income)
  const ssoForThisPeriod = period === 1 ? ssoCalc.period1_sso : ssoCalc.period2_sso

  periodWage.sso = ssoForThisPeriod
  periodWage.total_deduction = periodWage.late_deduction + periodWage.leave_deduction +
    periodWage.additional_deduction + ssoForThisPeriod + periodWage.tax
  periodWage.net_wage = periodWage.total_income - periodWage.total_deduction

  const nowIso = new Date().toISOString()

  const wageDetail = {
    employee_id: employeeId,
    year,
    month,
    period,
    employment_type: periodWage.employment_type,
    perday_salary: periodWage.perday_salary,
    perhr_salary: periodWage.perhr_salary,
    monthly_salary: periodWage.monthly_salary,
    total_days: periodWage.total_days,
    work_days: periodWage.work_days,
    holiday_work_days: periodWage.holiday_work_days,
    leave_days: periodWage.leave_days,
    absent_days: periodWage.absent_days,
    base_wage: periodWage.base_wage,
    ot1_hours: periodWage.ot1_hours,
    ot2_hours: periodWage.ot2_hours,
    ot3_hours: periodWage.ot3_hours,
    ot1_wage: periodWage.ot1_wage,
    ot2_wage: periodWage.ot2_wage,
    ot3_wage: periodWage.ot3_wage,
    total_ot_wage: periodWage.total_ot_wage,
    night_shift_days: periodWage.night_shift_days,
    night_shift_allowance: periodWage.night_shift_allowance,
    attendance_bonus: periodWage.attendance_bonus,
    additional_income: periodWage.additional_income,
    late_minutes: periodWage.late_minutes,
    late_deduction: periodWage.late_deduction,
    leave_deduction: periodWage.leave_deduction,
    additional_deduction: periodWage.additional_deduction,
    gross_income: periodWage.gross_income,
    total_income: periodWage.total_income,
    sso: periodWage.sso,
    tax: periodWage.tax,
    total_deduction: periodWage.total_deduction,
    net_wage: periodWage.net_wage,
    updated_at: nowIso
  }

  const wageSummary = {
    employee_id: employeeId,
    year,
    month,
    period,
    base_wage: periodWage.base_wage,
    ot_wage: periodWage.total_ot_wage,
    attendance_bonus: periodWage.attendance_bonus,
    total_income: periodWage.total_income,
    sso: periodWage.sso,
    tax: periodWage.tax,
    total_deduction: periodWage.total_deduction,
    net_wage: periodWage.net_wage,
    work_days: periodWage.work_days,
    leave_days: periodWage.leave_days,
    late_minutes: periodWage.late_minutes,
    late_deduction: periodWage.late_deduction,
    night_shift_days: periodWage.night_shift_days,
    night_shift_allowance: periodWage.night_shift_allowance,
    leave_deduction: periodWage.leave_deduction,
    additional_income: periodWage.additional_income,
    additional_deduction: periodWage.additional_deduction,
    ot1_hours: periodWage.ot1_hours,
    ot2_hours: periodWage.ot2_hours,
    ot3_hours: periodWage.ot3_hours,
    ot1_wage: periodWage.ot1_wage,
    ot2_wage: periodWage.ot2_wage,
    ot3_wage: periodWage.ot3_wage,
    employment_type: periodWage.employment_type,
    updated_at: nowIso
  }

  const [{ error: detailError }, { error: summaryError }] = await Promise.all([
    supabase
      .from('wage_details')
      .upsert(wageDetail, {
        onConflict: 'employee_id,year,month,period'
      }),
    supabase
      .from('wage_summary')
      .upsert(wageSummary, {
        onConflict: 'employee_id,year,month,period'
      })
  ])

  if (detailError) throw detailError
  if (summaryError) throw summaryError

  return { periodWage }
}
