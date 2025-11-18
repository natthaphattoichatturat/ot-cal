import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  getPeriodDates,
  calculateDailyWage,
  checkAttendanceBonus,
  calculatePeriodWage
} from '@/lib/wageCalculations'

export async function GET(request: NextRequest) {
  try {
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

    // ดึงข้อมูลพนักงานทั้งหมด
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('employee_id, name, department, perhr_salary, perday_salary')
      .order('employee_id')

    if (empError) {
      console.error('Employees fetch error:', empError)
      throw empError
    }

    // ดึงข้อมูลการเข้างานของทุกคน
    const { data: attendances, error: attError } = await supabase
      .from('daily_attendance')
      .select('*')
      .gte('work_date', startDate)
      .lte('work_date', endDate)

    if (attError) {
      console.error('Attendance fetch error:', attError)
      throw attError
    }

    // คำนวณค่าจ้างแต่ละคน
    const employeeWages = employees?.map(emp => {
      // กรองข้อมูลการเข้างานของพนักงานคนนี้
      const empAttendances = attendances?.filter(att => att.employee_id === emp.employee_id) || []

      // คำนวณค่าจ้างรายวัน
      const dailyWages = empAttendances.map(att =>
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
          emp.perhr_salary || 0
        )
      )

      // ตรวจสอบเบี้ยขยัน
      const hasBonus = checkAttendanceBonus(empAttendances.map(att => ({
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
      })))

      // คำนวณค่าจ้างรายงวด
      const periodWage = calculatePeriodWage(
        {
          employee_id: emp.employee_id,
          name: emp.name,
          department: emp.department,
          perhr_salary: emp.perhr_salary || 0,
          perday_salary: emp.perday_salary || 0
        },
        dailyWages,
        hasBonus
      )

      return {
        employeeId: periodWage.employee_id,
        name: periodWage.name,
        department: periodWage.department,
        totalBaseWage: periodWage.total_base_wage,
        totalOt1Wage: periodWage.total_ot1_wage,
        totalOt2Wage: periodWage.total_ot2_wage,
        totalOt3Wage: periodWage.total_ot3_wage,
        grossWage: periodWage.gross_wage,
        attendanceBonus: periodWage.attendance_bonus,
        totalIncome: periodWage.total_income
      }
    }) || []

    return NextResponse.json({ success: true, data: employeeWages })
  } catch (error: any) {
    console.error('Error fetching wage summary:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
