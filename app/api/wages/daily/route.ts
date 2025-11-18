import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPeriodDates, calculateDailyWage } from '@/lib/wageCalculations'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month') // Format: YYYY-MM
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

    // ดึงข้อมูลการเข้างานรายวัน
    const { data: attendances, error } = await supabase
      .from('daily_attendance')
      .select(`
        *,
        employees!fk_daily_employee (
          employee_id,
          name,
          perhr_salary
        )
      `)
      .gte('work_date', startDate)
      .lte('work_date', endDate)
      .order('work_date', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // คำนวณค่าจ้างรายวัน
    const dailyWages = attendances?.map(att => {
      const employee = Array.isArray(att.employees) ? att.employees[0] : att.employees
      const perhrSalary = employee?.perhr_salary || 0

      return calculateDailyWage(
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
        perhrSalary
      )
    }) || []

    return NextResponse.json({ success: true, data: dailyWages })
  } catch (error: any) {
    console.error('Error fetching daily wages:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
