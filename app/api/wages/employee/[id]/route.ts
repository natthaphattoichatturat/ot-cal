import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  getPeriodDates,
  calculatePeriodWageV2,
  calculateMonthlySSO,
  type DailyAttendanceV2,
  type EmployeeInfoV2,
  type LeaveRecord,
  type WageAdjustment
} from '@/lib/wageCalculationsV2'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month')
    const period = parseInt(searchParams.get('period') || '1') as 1 | 2

    if (!month) {
      return NextResponse.json({ success: false, error: 'Missing month parameter' }, { status: 400 })
    }

    const [year, monthNum] = month.split('-').map(Number)
    const { startDate, endDate } = getPeriodDates(year, monthNum, period)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ดึงข้อมูลพนักงาน
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('employee_id', employeeId)
      .single()

    if (empError) {
      console.error('Employee fetch error:', empError)
      throw empError
    }

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 })
    }

    // ดึงข้อมูลการเข้างาน (งวดปัจจุบัน)
    const { data: attendances, error: attError } = await supabase
      .from('daily_attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('work_date', startDate)
      .lte('work_date', endDate)
      .order('work_date', { ascending: true })

    if (attError) {
      console.error('Attendance fetch error:', attError)
      throw attError
    }

    // ดึงข้อมูลการลาในงวดนี้
    const { data: leaveRecords, error: leaveError } = await supabase
      .from('leave_records')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('leave_date', startDate)
      .lte('leave_date', endDate)
      .eq('status', 'approved')
      .order('leave_date', { ascending: true })

    if (leaveError) {
      console.error('Leave records fetch error:', leaveError)
    }

    // ดึงข้อมูลเงินเพิ่ม/เงินหักในงวดนี้
    const { data: adjustments, error: adjError } = await supabase
      .from('wage_adjustments')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('year', year)
      .eq('month', monthNum)
      .eq('period', period)
      .order('created_at', { ascending: false })

    if (adjError) {
      console.error('Adjustments fetch error:', adjError)
    }

    // ดึงข้อมูล Morning OT Allowance ที่ user กำหนด
    const { data: morningOTData } = await supabase
      .from('morning_ot_allowances')
      .select('allowed_hours, calculated_hours, actual_hours, selected_dates')
      .eq('employee_id', employeeId)
      .eq('year', year)
      .eq('month', monthNum)
      .eq('period', period)
      .single()

    // ใช้ allowed_hours ที่ user กำหนด (ถ้าไม่มี = 0)
    const morningOTAllowance = morningOTData?.allowed_hours || 0
    const selectedDates = morningOTData?.selected_dates || null

    const employmentType = (employee.employment_type || 'รายวัน') as 'รายวัน' | 'รายเดือน'

    // คำนวณเงินรายชั่วโมงใหม่ตาม logic ที่ถูกต้อง (ใช้ทศนิยม 8 หลัก)
    let calculatedPerHrSalary: number
    if (employmentType === 'รายเดือน') {
      // พนักงานรายเดือน: (เงินเดือน ÷ 15) ÷ 8
      calculatedPerHrSalary = Number(((employee.monthly_salary || 0) / 15 / 8).toFixed(8))
    } else {
      // พนักงานรายวัน: เงินรายวัน ÷ 8
      calculatedPerHrSalary = Number(((employee.perday_salary || 0) / 8).toFixed(8))
    }

    // ใช้ perhr_salary ที่คำนวณใหม่ แทน perhr_salary จาก database
    const actualPerHrSalary = calculatedPerHrSalary

    // แปลง attendances เป็น DailyAttendanceV2 format
    const dailyAttendances: DailyAttendanceV2[] = (attendances || []).map(att => ({
      work_date: att.work_date,
      actual_hours: att.actual_hours || 0,

      // ชั่วโมง OT จริง (ยังไม่คูณ)
      ot_normal_hours: att.ot_normal_hours || 0,
      ot_special_hours: att.ot_special_hours || 0,
      ot_premium_hours: att.ot_premium_hours || 0,

      // ชั่วโมง OT ที่คูณแล้ว (ใช้ในการคำนวณค่าจ้าง)
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

    // แปลง leave records และกำหนด is_paid
    const leaveRecordsV2: LeaveRecord[] = (leaveRecords || []).map(leave => {
      const paidLeaveTypes = ['ลาป่วย', 'ลาพักร้อน', 'sick_leave', 'annual_leave']
      const isPaid = paidLeaveTypes.includes(leave.leave_type?.toLowerCase() || '')

      return {
        leave_date: leave.leave_date,
        leave_type: leave.leave_type,
        leave_hours: leave.leave_hours || 8,
        is_paid: isPaid
      }
    })

    // แปลง wage adjustments
    const wageAdjustments: WageAdjustment[] = (adjustments || []).map(adj => ({
      adjustment_type: adj.adjustment_type as 'income' | 'deduction',
      category: adj.category,
      amount: adj.amount,
      description: adj.description
    }))

    // ข้อมูลพนักงาน
    const employeeInfo: EmployeeInfoV2 = {
      employee_id: employee.employee_id,
      name: employee.name,
      department: employee.department || 'ไม่ระบุ',
      employment_type: employmentType,
      perhr_salary: actualPerHrSalary, // ใช้ที่คำนวณใหม่แล้ว
      perday_salary: employee.perday_salary || 0,
      monthly_salary: employee.monthly_salary || 0
    }

    // คำนวณค่าจ้างรายงวด (งวดปัจจุบัน) โดยใช้ V2
    // ส่ง morningOTAllowance เพื่อใช้แทน OT เช้าอัตโนมัติ
    const periodWage = calculatePeriodWageV2(
      employeeInfo,
      dailyAttendances,
      leaveRecordsV2,
      wageAdjustments,
      { startDate, endDate },
      morningOTAllowance,
      selectedDates
    )

    // ดึงข้อมูลงวดอื่นของเดือนเดียวกันเพื่อคำนวณ SSO
    const otherPeriod = period === 1 ? 2 : 1
    const { startDate: otherStart, endDate: otherEnd } = getPeriodDates(year, monthNum, otherPeriod)

    const { data: otherAttendances } = await supabase
      .from('daily_attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('work_date', otherStart)
      .lte('work_date', otherEnd)

    const { data: otherLeaves } = await supabase
      .from('leave_records')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('leave_date', otherStart)
      .lte('leave_date', otherEnd)
      .eq('status', 'approved')

    const { data: otherAdjustments } = await supabase
      .from('wage_adjustments')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('year', year)
      .eq('month', monthNum)
      .eq('period', otherPeriod)

    // ดึง Morning OT Allowance สำหรับงวดอื่น
    const { data: otherMorningOTData } = await supabase
      .from('morning_ot_allowances')
      .select('allowed_hours, selected_dates')
      .eq('employee_id', employeeId)
      .eq('year', year)
      .eq('month', monthNum)
      .eq('period', otherPeriod)
      .single()

    const otherMorningOTAllowance = otherMorningOTData?.allowed_hours || 0
    const otherSelectedDates = otherMorningOTData?.selected_dates || null

    // แปลงงวดอื่นเป็น V2 format
    const otherDailyAttendances: DailyAttendanceV2[] = (otherAttendances || []).map(att => ({
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

    const otherLeaveRecordsV2: LeaveRecord[] = (otherLeaves || []).map(leave => {
      const paidLeaveTypes = ['ลาป่วย', 'ลาพักร้อน', 'sick_leave', 'annual_leave']
      const isPaid = paidLeaveTypes.includes(leave.leave_type?.toLowerCase() || '')

      return {
        leave_date: leave.leave_date,
        leave_type: leave.leave_type,
        leave_hours: leave.leave_hours || 8,
        is_paid: isPaid
      }
    })

    const otherWageAdjustments: WageAdjustment[] = (otherAdjustments || []).map(adj => ({
      adjustment_type: adj.adjustment_type as 'income' | 'deduction',
      category: adj.category,
      amount: adj.amount,
      description: adj.description
    }))

    const otherPeriodWage = calculatePeriodWageV2(
      employeeInfo,
      otherDailyAttendances,
      otherLeaveRecordsV2,
      otherWageAdjustments,
      { startDate: otherStart, endDate: otherEnd },
      otherMorningOTAllowance,
      otherSelectedDates
    )

    // คำนวณประกันสังคม
    const period1Income = period === 1 ? periodWage.total_income : otherPeriodWage.total_income
    const period2Income = period === 2 ? periodWage.total_income : otherPeriodWage.total_income
    const ssoCalc = calculateMonthlySSO(period1Income, period2Income)

    // อัพเดท SSO ใน periodWage
    const ssoForThisPeriod = period === 1 ? ssoCalc.period1_sso : ssoCalc.period2_sso
    periodWage.sso = ssoForThisPeriod
    periodWage.total_deduction = periodWage.late_deduction + periodWage.leave_deduction +
                                 periodWage.additional_deduction + ssoForThisPeriod + periodWage.tax
    periodWage.net_wage = periodWage.total_income - periodWage.total_deduction

    // ดึงข้อมูล YTD จาก wage_summary
    const { data: ytdRecords } = await supabase
      .from('wage_summary')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('year', year)

    // คำนวณยอดสะสมรายปี (YTD)
    let ytd_gross_wage = 0
    let ytd_attendance_bonus = 0
    let ytd_total_income = 0
    let ytd_sso = 0
    let ytd_tax = 0
    let ytd_other_deductions = 0
    let ytd_total_deductions = 0
    let ytd_net_wage = 0

    if (ytdRecords && ytdRecords.length > 0) {
      ytdRecords.forEach((record: any) => {
        ytd_gross_wage += (record.base_wage || 0) + (record.ot_wage || 0)
        ytd_attendance_bonus += record.attendance_bonus || 0
        ytd_total_income += record.total_income || 0
        ytd_sso += record.sso || 0
        ytd_tax += record.tax || 0
        ytd_total_deductions += record.total_deduction || 0
        ytd_net_wage += record.net_wage || 0
      })
      ytd_other_deductions = ytd_total_deductions - ytd_sso - ytd_tax
    }

    const ytdData = {
      ytd_gross_wage,
      ytd_attendance_bonus,
      ytd_total_income,
      ytd_sso,
      ytd_tax,
      ytd_other_deductions,
      ytd_total_deductions,
      ytd_net_wage
    }

    // สรุปรายละเอียดค่าจ้าง (ใช้ข้อมูลจาก V2)
    const wageBreakdown = {
      // ข้อมูลพนักงาน
      employment_type: periodWage.employment_type,
      perday_salary: periodWage.perday_salary,
      perhr_salary: periodWage.perhr_salary,
      monthly_salary: periodWage.monthly_salary,

      // วันทำงาน
      total_days: periodWage.total_days,
      work_days: periodWage.work_days,
      holiday_work_days: periodWage.holiday_work_days,
      leave_days: periodWage.leave_days,
      absent_days: periodWage.absent_days,

      // รายได้
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
      gross_income: periodWage.gross_income,

      // เงินหัก
      late_minutes: periodWage.late_minutes,
      late_deduction: periodWage.late_deduction,
      leave_deduction: periodWage.leave_deduction,
      additional_deduction: periodWage.additional_deduction,
      sso: periodWage.sso,
      tax: periodWage.tax,

      // รวม
      total_income: periodWage.total_income,
      total_deduction: periodWage.total_deduction,
      net_wage: periodWage.net_wage
    }

    return NextResponse.json({
      success: true,
      data: {
        employee,
        periodWage: wageBreakdown,
        leaveRecords: leaveRecordsV2 || [],
        adjustments: adjustments || [],
        sso: ssoCalc,
        ytd: ytdData,
        currentPeriod: period
      }
    })
  } catch (error: any) {
    console.error('Error fetching employee wage detail:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
