import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  getPeriodDates,
  calculateDailyWage,
  checkAttendanceBonus,
  calculatePeriodWage,
  calculateMonthlySSO
} from '@/lib/wageCalculations'

/**
 * API สำหรับคำนวณค่าจ้างแบบ BATCH (เร็วกว่าเดิม 10-50 เท่า!)
 * แก้ปัญหา N+1 query โดยดึงข้อมูลทั้งหมดครั้งเดียว
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const { month, year } = body

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

    console.log(`[BATCH] Starting wage calculation for ${month}/${year}...`)

    // ========== BATCH FETCH: ดึงข้อมูลทั้งหมดครั้งเดียว ==========
    
    // 1. ดึงพนักงานทั้งหมด
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('employee_id, name, department, perhr_salary, perday_salary, monthly_salary, employment_type')
      .eq('status', 'active')

    if (empError) throw empError
    if (!employees || employees.length === 0) {
      return NextResponse.json({ success: false, error: 'No employees found' }, { status: 404 })
    }

    console.log(`[BATCH] Found ${employees.length} employees`)

    // 2. คำนวณ date range สำหรับทั้ง 2 งวด
    const period1Dates = getPeriodDates(year, month, 1)
    const period2Dates = getPeriodDates(year, month, 2)
    
    // หา min/max date ที่ครอบคลุมทั้ง 2 งวด
    const allDates = [period1Dates.startDate, period1Dates.endDate, period2Dates.startDate, period2Dates.endDate]
    const minDate = allDates.sort()[0]
    const maxDate = allDates.sort()[allDates.length - 1]

    console.log(`[BATCH] Date range: ${minDate} to ${maxDate}`)

    // 3. ดึง attendance ทั้งหมดในช่วงนี้ (ครั้งเดียว!)
    const { data: allAttendances, error: attError } = await supabase
      .from('daily_attendance')
      .select('*')
      .gte('work_date', minDate)
      .lte('work_date', maxDate)
      .order('employee_id')
      .order('work_date')

    if (attError) throw attError

    console.log(`[BATCH] Fetched ${allAttendances?.length || 0} attendance records`)

    // 4. จัดกลุ่ม attendance ตาม employee_id
    const attendanceByEmployee = new Map<string, any[]>()
    allAttendances?.forEach(att => {
      if (!attendanceByEmployee.has(att.employee_id)) {
        attendanceByEmployee.set(att.employee_id, [])
      }
      attendanceByEmployee.get(att.employee_id)!.push(att)
    })

    // ========== BATCH CALCULATE: คำนวณค่าจ้างทุกคน ==========
    
    const wageRecords: any[] = []
    let processedCount = 0

    for (const employee of employees) {
      const empAttendances = attendanceByEmployee.get(employee.employee_id) || []
      
      if (empAttendances.length === 0) continue

      // แยก attendance ตามงวด
      const period1Attendances = empAttendances.filter(att => 
        att.work_date >= period1Dates.startDate && att.work_date <= period1Dates.endDate
      )
      const period2Attendances = empAttendances.filter(att => 
        att.work_date >= period2Dates.startDate && att.work_date <= period2Dates.endDate
      )

      const employmentType = (employee.employment_type || 'รายวัน') as 'รายวัน' | 'รายเดือน'

      // คำนวณทั้ง 2 งวด
      for (const period of [1, 2] as const) {
        const attendances = period === 1 ? period1Attendances : period2Attendances
        const otherAttendances = period === 1 ? period2Attendances : period1Attendances

        if (attendances.length === 0) continue

        // Calculate daily wages
        const dailyWages = attendances.map(att =>
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
        )

        // Check attendance bonus
        const hasBonus = checkAttendanceBonus(attendances.map(att => ({
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

        // Calculate period wage
        const periodWage = calculatePeriodWage(
          {
            employee_id: employee.employee_id,
            name: employee.name,
            department: employee.department,
            perhr_salary: employee.perhr_salary || 0,
            perday_salary: employee.perday_salary || 0,
            monthly_salary: employee.monthly_salary || 0,
            employment_type: (employee.employment_type || 'รายวัน') as 'รายวัน' | 'รายเดือน'
          },
          dailyWages,
          hasBonus
        )

        // Calculate other period for SSO
        const otherDailyWages = otherAttendances.map(att =>
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
        )

        const otherHasBonus = checkAttendanceBonus(otherAttendances.map(att => ({
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
        wageRecords.push({
          employee_id: employee.employee_id,
          year,
          month,
          period,
          base_wage: periodWage.total_base_wage,
          ot1_wage: periodWage.total_ot1_wage,
          ot2_wage: periodWage.total_ot2_wage,
          ot3_wage: periodWage.total_ot3_wage,
          ot_wage: periodWage.total_ot1_wage + periodWage.total_ot2_wage + periodWage.total_ot3_wage,
          attendance_bonus: periodWage.attendance_bonus,
          total_income: periodWage.total_income,
          sso: ssoForThisPeriod,
          tax: periodWage.tax_withholding,
          total_deduction: ssoForThisPeriod + periodWage.tax_withholding,
          net_wage: periodWage.total_income - ssoForThisPeriod - periodWage.tax_withholding,
          updated_at: new Date().toISOString()
        })
      }

      processedCount++
    }

    console.log(`[BATCH] Calculated ${wageRecords.length} wage records for ${processedCount} employees`)

    if (wageRecords.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No wage data to calculate',
        calculated: 0,
        duration_ms: Date.now() - startTime
      })
    }

    // ========== BATCH UPSERT: บันทึกทั้งหมดครั้งเดียว ==========
    
    const { error: upsertError } = await supabase
      .from('wage_summary')
      .upsert(wageRecords, {
        onConflict: 'employee_id,year,month,period'
      })

    if (upsertError) {
      console.error('[BATCH] Upsert error:', upsertError)
      throw upsertError
    }

    const duration = Date.now() - startTime
    console.log(`[BATCH] ✅ Completed in ${duration}ms`)

    return NextResponse.json({
      success: true,
      message: `Calculated and saved ${wageRecords.length} wage records`,
      calculated: wageRecords.length,
      employees_processed: processedCount,
      duration_ms: duration
    })
  } catch (error: any) {
    console.error('[BATCH] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      duration_ms: Date.now() - startTime
    }, { status: 500 })
  }
}

