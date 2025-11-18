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
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
        employee.perhr_salary || 0
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
        employee.perhr_salary || 0
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

    // ดึงข้อมูล YTD
    const { data: ytdData } = await supabase
      .from('employee_wage_summary_ytd')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('year', year)
      .single()

    return NextResponse.json({
      success: true,
      data: {
        employee,
        dailyWages,
        periodWage,
        sso: ssoCalc,
        ytd: ytdData || null,
        currentPeriod: period
      }
    })
  } catch (error: any) {
    console.error('Error fetching employee wage detail:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
