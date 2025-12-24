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

/**
 * API V2 สำหรับคำนวณค่าจ้างแบบละเอียด
 * รองรับพนักงานรายวัน และรายเดือน
 * บันทึกลง wage_details
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

    // Get all active employees
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('status', 'active')

    if (empError) throw empError

    if (!employees || employees.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No employees found'
      }, { status: 404 })
    }

    const wageDetails = []

    // Process both periods
    for (const period of [1, 2]) {
      const { startDate, endDate } = getPeriodDates(year, month, period as 1 | 2)

      console.log(`Processing ${year}-${month} period ${period}: ${startDate} to ${endDate}`)

      // Process each employee
      for (const employee of employees) {
        try {
          const employeeInfo: EmployeeInfoV2 = {
            employee_id: employee.employee_id,
            name: employee.name,
            department: employee.department || 'ไม่ระบุ',
            employment_type: employee.employment_type === 'รายเดือน' ? 'รายเดือน' : 'รายวัน',
            perhr_salary: employee.perhr_salary || 0,
            perday_salary: employee.perday_salary || 0,
            monthly_salary: employee.monthly_salary || 0
          }

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

          // Skip if no attendance
          if (!attendances || attendances.length === 0) {
            console.log(`No attendance for ${employee.employee_id} in period ${period}`)
            continue
          }

          // Convert to DailyAttendanceV2 format
          const dailyAttendances: DailyAttendanceV2[] = attendances.map(att => ({
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

          // Get leave records
          const { data: leaves } = await supabase
            .from('leave_records')
            .select('*')
            .eq('employee_id', employee.employee_id)
            .gte('leave_date', startDate)
            .lte('leave_date', endDate)
            .eq('status', 'approved')

          const leaveRecords: LeaveRecord[] = (leaves || []).map(leave => {
            return {
              leave_date: leave.leave_date,
              leave_type: leave.leave_type,
              leave_hours: leave.leave_hours || 8,
              is_paid: leave.is_paid === true,
              deduct_diligence: leave.deduct_diligence === true
            }
          })

          // Get wage adjustments
          const { data: adjustments } = await supabase
            .from('wage_adjustments')
            .select('*')
            .eq('employee_id', employee.employee_id)
            .eq('year', year)
            .eq('month', month)
            .eq('period', period)

          const wageAdjustments: WageAdjustment[] = (adjustments || []).map(adj => ({
            adjustment_type: adj.adjustment_type as 'income' | 'deduction',
            category: adj.category,
            amount: adj.amount,
            description: adj.description
          }))

          // ดึง Morning OT Allowance ที่ user กำหนด
          const { data: morningOTData } = await supabase
            .from('morning_ot_allowances')
            .select('allowed_hours, selected_dates')
            .eq('employee_id', employee.employee_id)
            .eq('year', year)
            .eq('month', month)
            .eq('period', period)
            .single()

          const morningOTAllowance = morningOTData?.allowed_hours || 0
          const selectedDates = morningOTData?.selected_dates || null

          // Calculate wage for this period
          const periodWage = calculatePeriodWageV2(
            employeeInfo,
            dailyAttendances,
            leaveRecords,
            wageAdjustments,
            { startDate, endDate },
            morningOTAllowance,
            selectedDates
          )

          // Calculate SSO (need both periods)
          const otherPeriod = period === 1 ? 2 : 1
          const { startDate: otherStart, endDate: otherEnd } = getPeriodDates(
            year,
            month,
            otherPeriod as 1 | 2
          )

          // Get other period's attendance to calculate SSO
          const { data: otherAttendances } = await supabase
            .from('daily_attendance')
            .select('*')
            .eq('employee_id', employee.employee_id)
            .gte('work_date', otherStart)
            .lte('work_date', otherEnd)

          const otherDailyAttendances: DailyAttendanceV2[] = (otherAttendances || []).map(att => ({
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

          const { data: otherLeaves } = await supabase
            .from('leave_records')
            .select('*')
            .eq('employee_id', employee.employee_id)
            .gte('leave_date', otherStart)
            .lte('leave_date', otherEnd)
            .eq('status', 'approved')

          const otherLeaveRecords: LeaveRecord[] = (otherLeaves || []).map(leave => {
            return {
              leave_date: leave.leave_date,
              leave_type: leave.leave_type,
              leave_hours: leave.leave_hours || 8,
              is_paid: leave.is_paid === true,
              deduct_diligence: leave.deduct_diligence === true
            }
          })

          const { data: otherAdjustments } = await supabase
            .from('wage_adjustments')
            .select('*')
            .eq('employee_id', employee.employee_id)
            .eq('year', year)
            .eq('month', month)
            .eq('period', otherPeriod)

          const otherWageAdjustments: WageAdjustment[] = (otherAdjustments || []).map(adj => ({
            adjustment_type: adj.adjustment_type as 'income' | 'deduction',
            category: adj.category,
            amount: adj.amount,
            description: adj.description
          }))

          // ดึง Morning OT Allowance สำหรับงวดอื่น
          const { data: otherMorningOTData } = await supabase
            .from('morning_ot_allowances')
            .select('allowed_hours, selected_dates')
            .eq('employee_id', employee.employee_id)
            .eq('year', year)
            .eq('month', month)
            .eq('period', otherPeriod)
            .single()

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

          // Calculate monthly SSO
          const period1Income = period === 1 ? periodWage.total_income : otherPeriodWage.total_income
          const period2Income = period === 2 ? periodWage.total_income : otherPeriodWage.total_income
          const ssoCalc = calculateMonthlySSO(period1Income, period2Income)

          const ssoForThisPeriod = period === 1 ? ssoCalc.period1_sso : ssoCalc.period2_sso

          // Update wage detail with SSO
          periodWage.sso = ssoForThisPeriod
          periodWage.total_deduction = periodWage.late_deduction + periodWage.leave_deduction + 
                                       periodWage.additional_deduction + ssoForThisPeriod + periodWage.tax
          periodWage.net_wage = periodWage.total_income - periodWage.additional_deduction - 
                               ssoForThisPeriod - periodWage.tax

          // Create wage detail record
          const wageDetail = {
            employee_id: employee.employee_id,
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
            updated_at: new Date().toISOString()
          }

          wageDetails.push(wageDetail)

          // สร้าง auto adjustment logs
          const calculationRunId = `calc_${Date.now()}_${employee.employee_id}`
          const autoLogs = []

          // หักเงินมาสาย
          if (periodWage.late_deduction > 0) {
            autoLogs.push({
              employee_id: employee.employee_id,
              year,
              month,
              period,
              adjustment_type: 'deduction',
              category: 'หักเงินมาสาย',
              amount: periodWage.late_deduction,
              details: {
                late_minutes: periodWage.late_minutes,
                per_minute_rate: (employee.perhr_salary || 0) / 60
              },
              calculation_run_id: calculationRunId
            })
          }

          // เบี้ยขยัน
          if (periodWage.attendance_bonus > 0) {
            autoLogs.push({
              employee_id: employee.employee_id,
              year,
              month,
              period,
              adjustment_type: 'income',
              category: 'เบี้ยขยัน',
              amount: periodWage.attendance_bonus,
              details: {
                bonus_type: 'attendance',
                qualified: true
              },
              calculation_run_id: calculationRunId
            })
          }

          // ค่ากะดึก
          if (periodWage.night_shift_allowance > 0) {
            autoLogs.push({
              employee_id: employee.employee_id,
              year,
              month,
              period,
              adjustment_type: 'income',
              category: 'ค่ากะดึก',
              amount: periodWage.night_shift_allowance,
              details: {
                night_shift_days: periodWage.night_shift_days,
                rate_per_day: 40
              },
              calculation_run_id: calculationRunId
            })
          }

          // ประกันสังคม (SSO)
          if (periodWage.sso > 0) {
            autoLogs.push({
              employee_id: employee.employee_id,
              year,
              month,
              period,
              adjustment_type: 'deduction',
              category: 'ประกันสังคม (SSO)',
              amount: periodWage.sso,
              details: {
                income: periodWage.total_income,
                sso_rate: 0.05,
                max_sso: 750,
                period1_income: period1Income,
                period2_income: period2Income
              },
              calculation_run_id: calculationRunId
            })
          }

          // ภาษีหัก ณ ที่จ่าย
          if (periodWage.tax > 0) {
            autoLogs.push({
              employee_id: employee.employee_id,
              year,
              month,
              period,
              adjustment_type: 'deduction',
              category: 'ภาษีหัก ณ ที่จ่าย',
              amount: periodWage.tax,
              details: {
                taxable_income: periodWage.total_income,
                tax_rate: 0
              },
              calculation_run_id: calculationRunId
            })
          }

          // หักเงินค่าลา (ถ้ามี)
          if (periodWage.leave_deduction > 0) {
            autoLogs.push({
              employee_id: employee.employee_id,
              year,
              month,
              period,
              adjustment_type: 'deduction',
              category: 'หักเงินค่าลา',
              amount: periodWage.leave_deduction,
              details: {
                leave_days: periodWage.leave_days,
                employment_type: periodWage.employment_type
              },
              calculation_run_id: calculationRunId
            })
          }

          // บันทึก auto logs ถ้ามี
          if (autoLogs.length > 0) {
            const { error: autoLogError } = await supabase
              .from('auto_adjustment_logs')
              .upsert(autoLogs, {
                onConflict: 'employee_id,year,month,period,category'
              })

            if (autoLogError) {
              console.error(`Error saving auto logs for ${employee.employee_id}:`, autoLogError)
            }
          }
        } catch (err) {
          console.error(`Error processing employee ${employee.employee_id}:`, err)
          continue
        }
      }
    }

    if (wageDetails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No wage data to calculate',
        calculated: 0
      })
    }

    // Upsert to wage_details
    const { error: upsertError } = await supabase
      .from('wage_details')
      .upsert(wageDetails, {
        onConflict: 'employee_id,year,month,period'
      })

    if (upsertError) {
      console.error('Upsert error:', upsertError)
      throw upsertError
    }

    return NextResponse.json({
      success: true,
      message: `Calculated and saved ${wageDetails.length} wage detail records`,
      calculated: wageDetails.length
    })
  } catch (error: any) {
    console.error('Error calculating wages:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

