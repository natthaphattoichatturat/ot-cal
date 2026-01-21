import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  getPeriodDates,
  calculateDailyWage,
  checkAttendanceBonus,
  calculatePeriodWage,
  calculateMonthlySSO,
  applyMorningOtAllowance
} from '@/lib/wageCalculations'

/**
 * API สำหรับคำนวณและบันทึกข้อมูลค่าจ้างลง wage_summary
 * เรียกใช้หลังจาก import attendance เสร็จแล้ว
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { month, year } = body // Format: { month: 11, year: 2025 }

    if (!month || !year) {
      return NextResponse.json(
        { success: false, error: 'Missing month or year parameter' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all employees
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('*')

    if (empError) throw empError

    if (!employees || employees.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No employees found'
      }, { status: 404 })
    }

    const { data: morningAllowances, error: morningError } = await supabase
      .from('morning_ot_allowances')
      .select('employee_id, period, allowed_hours, selected_dates')
      .eq('year', year)
      .eq('month', month)

    if (morningError) {
      console.warn('Failed to fetch morning OT allowances:', morningError)
    }

    const morningAllowanceMap = new Map<string, { allowed_hours: number; selected_dates: string[] | null }>()
    ;(morningAllowances || []).forEach(item => {
      morningAllowanceMap.set(`${item.employee_id}-${item.period}`, {
        allowed_hours: item.allowed_hours || 0,
        selected_dates: item.selected_dates ?? null
      })
    })

    const wageRecords = []

    // Process both periods
    for (const period of [1, 2]) {
      const { startDate, endDate } = getPeriodDates(year, month, period as 1 | 2)

      // Process each employee
      for (const employee of employees) {
        try {
          // Get attendance for this period
          const { data: attendances, error: attError } = await supabase
            .from('daily_attendance')
            .select('*')
            .eq('employee_id', employee.employee_id)
            .gte('work_date', startDate)
            .lte('work_date', endDate)
            .order('work_date', { ascending: true })

          if (attError) {
            console.error(`Error fetching attendance for ${employee.employee_id}:`, attError)
            continue
          }

          if (!attendances || attendances.length === 0) {
            continue // Skip if no attendance
          }

          const morningAllowance = morningAllowanceMap.get(`${employee.employee_id}-${period}`) || {
            allowed_hours: 0,
            selected_dates: null
          }

          // Calculate daily wages
          const attendanceInput = attendances.map(att => ({
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
          }))

          const adjustedAttendances = applyMorningOtAllowance(attendanceInput, {
            allowedHours: morningAllowance.allowed_hours || 0,
            selectedDates: morningAllowance.selected_dates ?? null
          })

          const dailyWages = adjustedAttendances.map(att =>
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
          )

          // Check attendance bonus
          const hasBonus = checkAttendanceBonus(attendanceInput)

          // Calculate period wage
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

          // Calculate SSO (need both periods for monthly calculation)
          const otherPeriod = period === 1 ? 2 : 1
          const { startDate: otherStart, endDate: otherEnd } = getPeriodDates(
            year,
            month,
            otherPeriod as 1 | 2
          )

          const { data: otherAttendances } = await supabase
            .from('daily_attendance')
            .select('*')
            .eq('employee_id', employee.employee_id)
            .gte('work_date', otherStart)
            .lte('work_date', otherEnd)

          const otherMorningAllowance = morningAllowanceMap.get(`${employee.employee_id}-${otherPeriod}`) || {
            allowed_hours: 0,
            selected_dates: null
          }

          const otherAttendanceInput = (otherAttendances || []).map(att => ({
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
          }))

          const otherAdjustedAttendances = applyMorningOtAllowance(otherAttendanceInput, {
            allowedHours: otherMorningAllowance.allowed_hours || 0,
            selectedDates: otherMorningAllowance.selected_dates ?? null
          })

          const otherDailyWages = otherAdjustedAttendances.map(att =>
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
          )

          const otherHasBonus = checkAttendanceBonus(otherAttendanceInput)

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

          // Calculate monthly SSO
          const period1Income = period === 1 ? periodWage.total_income : otherPeriodWage.total_income
          const period2Income = period === 2 ? periodWage.total_income : otherPeriodWage.total_income
          const ssoCalc = calculateMonthlySSO(period1Income, period2Income)

          const ssoForThisPeriod = period === 1 ? ssoCalc.period1_sso : ssoCalc.period2_sso

          // Create wage record
          const wageRecord = {
            employee_id: employee.employee_id,
            year,
            month,
            period,
            base_wage: periodWage.total_base_wage,
            ot_wage: periodWage.total_ot1_wage + periodWage.total_ot2_wage + periodWage.total_ot3_wage,
            attendance_bonus: periodWage.attendance_bonus,
            total_income: periodWage.total_income,
            sso: ssoForThisPeriod,
            tax: periodWage.tax_withholding,
            total_deduction: ssoForThisPeriod + periodWage.tax_withholding,
            net_wage: periodWage.total_income - ssoForThisPeriod - periodWage.tax_withholding,
            updated_at: new Date().toISOString()
          }

          wageRecords.push(wageRecord)
        } catch (err) {
          console.error(`Error processing employee ${employee.employee_id}:`, err)
          continue
        }
      }
    }

    if (wageRecords.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No wage data to calculate',
        calculated: 0
      })
    }

    // Upsert to wage_summary
    const { error: upsertError } = await supabase
      .from('wage_summary')
      .upsert(wageRecords, {
        onConflict: 'employee_id,year,month,period'
      })

    if (upsertError) {
      if (upsertError.code === '42P10') {
        console.warn('Missing unique constraint on wage_summary. Falling back to delete + insert.')
        const periods = Array.from(new Set(wageRecords.map(record => record.period)))

        const { error: deleteError } = await supabase
          .from('wage_summary')
          .delete()
          .eq('year', year)
          .eq('month', month)
          .in('period', periods)

        if (deleteError) {
          console.error('Delete error:', deleteError)
          throw deleteError
        }

        const { error: insertError } = await supabase
          .from('wage_summary')
          .insert(wageRecords)

        if (insertError) {
          console.error('Insert error:', insertError)
          throw insertError
        }
      } else {
        console.error('Upsert error:', upsertError)
        throw upsertError
      }
    }

    return NextResponse.json({
      success: true,
      message: `Calculated and saved ${wageRecords.length} wage records`,
      calculated: wageRecords.length
    })
  } catch (error: any) {
    console.error('Error calculating wages:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

/**
 * GET: คำนวณข้อมูลค่าจ้างโดยไม่บันทึก (preview)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const monthStr = searchParams.get('month') // Format: YYYY-MM
    const employeeId = searchParams.get('employee_id')

    if (!monthStr) {
      return NextResponse.json(
        { success: false, error: 'Missing month parameter' },
        { status: 400 }
      )
    }

    const [year, month] = monthStr.split('-').map(Number)

    // Call POST internally but with preview flag
    const response = await POST(
      new NextRequest(request.url, {
        method: 'POST',
        body: JSON.stringify({ month, year, preview: true, employee_id: employeeId })
      })
    )

    return response
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
