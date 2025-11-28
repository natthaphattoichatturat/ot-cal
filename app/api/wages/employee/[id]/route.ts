import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  getPeriodDates,
  calculateDailyWage,
  checkAttendanceBonus,
  calculatePeriodWage,
  calculateMonthlySSO
} from '@/lib/wageCalculations'

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

    const employmentType = (employee.employment_type || 'รายวัน') as 'รายวัน' | 'รายเดือน'

    // คำนวณค่าจ้างรายวัน (งวดปัจจุบัน)
    const dailyWages = attendances?.map(att =>
      calculateDailyWage(
        {
          work_date: att.work_date,
          actual_hours: att.actual_hours || 0,
          ot_normal_hours: att.ot_normal_hours || 0,
          ot_special_hours: att.ot_special_hours || 0,
          ot_premium_hours: att.ot_premium_hours || 0,
          scheduled_in_time: att.scheduled_in_time,
          check_in_time: att.check_in_time,
          is_holiday: att.is_holiday || false,
          is_leave: att.is_leave || false,
          late: att.late || false
        },
        employee.perhr_salary || 0,
        employmentType
      )
    ) || []

    // ตรวจสอบเบี้ยขยัน (งวดปัจจุบัน)
    const hasBonus = checkAttendanceBonus(attendances?.map(att => ({
      work_date: att.work_date,
      actual_hours: att.actual_hours || 0,
      ot_normal_hours: att.ot_normal_hours || 0,
      ot_special_hours: att.ot_special_hours || 0,
      ot_premium_hours: att.ot_premium_hours || 0,
      scheduled_in_time: att.scheduled_in_time,
      check_in_time: att.check_in_time,
      is_holiday: att.is_holiday || false,
      is_leave: att.is_leave || false,
      late: att.late || false
    })) || [])

    // คำนวณค่าจ้างรายงวด (งวดปัจจุบัน)
    const periodWage = calculatePeriodWage(
      {
        employee_id: employee.employee_id,
        name: employee.name,
        department: employee.department,
        perhr_salary: employee.perhr_salary || 0,
        perday_salary: employee.perday_salary || 0
      },
      dailyWages,
      hasBonus
    )

    // คำนวณเงินเพิ่ม/หักจาก adjustments
    const additionalIncome = (adjustments || [])
      .filter(adj => adj.adjustment_type === 'income')
      .reduce((sum, adj) => sum + parseFloat(adj.amount), 0)

    const additionalDeduction = (adjustments || [])
      .filter(adj => adj.adjustment_type === 'deduction')
      .reduce((sum, adj) => sum + parseFloat(adj.amount), 0)

    // คำนวณวันลาและเงินหักค่าลา (สำหรับพนักงานรายเดือน)
    const leaveDays = leaveRecords?.length || 0
    let leaveDeduction = 0
    if (employmentType === 'รายเดือน' && leaveDays > 0) {
      const dailySalary = (employee.monthly_salary || 0) / 15 // แบ่งเป็น 15 วันต่องวด
      leaveDeduction = dailySalary * leaveDays
    }

    // คำนวณนาทีมาสายรวม
    const totalLateMinutes = attendances?.reduce((sum, att) => {
      if (att.late && att.check_in_time && att.scheduled_in_time) {
        const checkIn = att.check_in_time.split(':').map(Number)
        const scheduled = att.scheduled_in_time.split(':').map(Number)
        const checkInMinutes = checkIn[0] * 60 + checkIn[1]
        const scheduledMinutes = scheduled[0] * 60 + scheduled[1]
        if (checkInMinutes > scheduledMinutes) {
          return sum + (checkInMinutes - scheduledMinutes)
        }
      }
      return sum
    }, 0) || 0

    // คำนวณเงินหักค่ามาสาย
    const perMinuteSalary = (employee.perhr_salary || 0) / 60
    const lateDeduction = totalLateMinutes * perMinuteSalary

    // คำนวณค่ากะดึก
    const nightShiftDays = attendances?.filter(att => {
      const checkIn = att.scheduled_in_time || att.check_in_time
      if (checkIn) {
        const hour = parseInt(checkIn.split(':')[0])
        return hour >= 20 || hour < 5
      }
      return false
    }).length || 0
    const nightShiftAllowance = nightShiftDays * 40

    // ดึงข้อมูลงวดอื่นของเดือนเดียวกันเพื่อคำนวณ SSO
    const otherPeriod = period === 1 ? 2 : 1
    const { startDate: otherStart, endDate: otherEnd } = getPeriodDates(year, monthNum, otherPeriod)

    const { data: otherAttendances } = await supabase
      .from('daily_attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('work_date', otherStart)
      .lte('work_date', otherEnd)

    const otherDailyWages = otherAttendances?.map(att =>
      calculateDailyWage(
        {
          work_date: att.work_date,
          actual_hours: att.actual_hours || 0,
          ot_normal_hours: att.ot_normal_hours || 0,
          ot_special_hours: att.ot_special_hours || 0,
          ot_premium_hours: att.ot_premium_hours || 0,
          is_holiday: att.is_holiday || false,
          is_leave: att.is_leave || false,
          late: att.late || false
        },
        employee.perhr_salary || 0,
        employmentType
      )
    ) || []

    const otherHasBonus = checkAttendanceBonus(otherAttendances?.map(att => ({
      work_date: att.work_date,
      actual_hours: att.actual_hours || 0,
      ot_normal_hours: att.ot_normal_hours || 0,
      ot_special_hours: att.ot_special_hours || 0,
      ot_premium_hours: att.ot_premium_hours || 0,
      scheduled_in_time: att.scheduled_in_time,
      check_in_time: att.check_in_time,
      is_holiday: att.is_holiday || false,
      is_leave: att.is_leave || false,
      late: att.late || false
    })) || [])

    const otherPeriodWage = calculatePeriodWage(
      {
        employee_id: employee.employee_id,
        name: employee.name,
        department: employee.department,
        perhr_salary: employee.perhr_salary || 0,
        perday_salary: employee.perday_salary || 0
      },
      otherDailyWages,
      otherHasBonus
    )

    // คำนวณประกันสังคม
    const period1Income = period === 1 ? periodWage.total_income : otherPeriodWage.total_income
    const period2Income = period === 2 ? periodWage.total_income : otherPeriodWage.total_income
    const ssoCalc = calculateMonthlySSO(period1Income, period2Income)

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

    // สรุปรายละเอียดค่าจ้าง
    const wageBreakdown = {
      // รายได้
      base_wage: periodWage.total_base_wage,
      ot1_wage: periodWage.total_ot1_wage,
      ot2_wage: periodWage.total_ot2_wage,
      ot3_wage: periodWage.total_ot3_wage,
      attendance_bonus: periodWage.attendance_bonus,
      night_shift_allowance: nightShiftAllowance,
      additional_income: additionalIncome,
      gross_income: periodWage.total_income + nightShiftAllowance + additionalIncome,
      
      // เงินหัก
      late_minutes: totalLateMinutes,
      late_deduction: lateDeduction,
      leave_days: leaveDays,
      leave_deduction: leaveDeduction,
      additional_deduction: additionalDeduction,
      sso: period === 1 ? ssoCalc.period1_sso : ssoCalc.period2_sso,
      tax: periodWage.tax_withholding,
      
      // รวม
      total_income: periodWage.total_income + nightShiftAllowance + additionalIncome,
      total_deductions: lateDeduction + leaveDeduction + additionalDeduction + 
        (period === 1 ? ssoCalc.period1_sso : ssoCalc.period2_sso) + periodWage.tax_withholding,
      net_wage: (periodWage.total_income + nightShiftAllowance + additionalIncome) - 
        (lateDeduction + leaveDeduction + additionalDeduction + 
        (period === 1 ? ssoCalc.period1_sso : ssoCalc.period2_sso) + periodWage.tax_withholding)
    }

    return NextResponse.json({
      success: true,
      data: {
        employee,
        dailyWages,
        periodWage: wageBreakdown,
        leaveRecords: leaveRecords || [],
        adjustments: adjustments || [],
        sso: ssoCalc,
        ytd: ytdData,
        currentPeriod: period,
        // ข้อมูลเพิ่มเติม
        workDays: attendances?.filter(a => !a.is_holiday && !a.is_leave).length || 0,
        holidayWorkDays: attendances?.filter(a => a.is_holiday).length || 0,
        nightShiftDays
      }
    })
  } catch (error: any) {
    console.error('Error fetching employee wage detail:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
