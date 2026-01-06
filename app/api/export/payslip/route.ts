import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
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
import {
  PayslipData,
  DEFAULT_ADDITIONS,
  DEFAULT_DEDUCTIONS,
  getBankName
} from '@/types/payslip'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const employeeIds = searchParams.get('employeeIds')?.split(',') || []
    const month = searchParams.get('month') // format: "2025-10"
    const period = parseInt(searchParams.get('period') || '1') as 1 | 2

    if (!month || employeeIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: employeeIds, month'
      }, { status: 400 })
    }

    const [year, monthNum] = month.split('-').map(Number)
    const { startDate, endDate } = getPeriodDates(year, monthNum, period)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ดึงข้อมูลบริษัท (ใช้ค่าเริ่มต้น)
    const companyName = 'บริษัท ฟงซัน พริ้นติ้ง จำกัด'

    // ดึงข้อมูลพนักงานทั้งหมดที่เลือก
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('*')
      .in('employee_id', employeeIds)

    if (empError) {
      throw empError
    }

    if (!employees || employees.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No employees found'
      }, { status: 404 })
    }

    const payslips: PayslipData[] = []

    for (const employee of employees) {
      // ดึงข้อมูลการเข้างาน
      const { data: attendances } = await supabase
        .from('daily_attendance')
        .select('*')
        .eq('employee_id', employee.employee_id)
        .gte('work_date', startDate)
        .lte('work_date', endDate)
        .order('work_date', { ascending: true })

      // ดึงข้อมูลการลา
      const { data: leaveRecords } = await supabase
        .from('leave_records')
        .select('*')
        .eq('employee_id', employee.employee_id)
        .gte('leave_date', startDate)
        .lte('leave_date', endDate)
        .or('status.eq.approved,leave_able.eq.true')

      // ดึงข้อมูลเงินเพิ่ม/หัก
      const { data: adjustments } = await supabase
        .from('wage_adjustments')
        .select('*')
        .eq('employee_id', employee.employee_id)
        .eq('year', year)
        .eq('month', monthNum)
        .eq('period', period)

      const employmentType = (employee.employment_type || 'รายวัน') as 'รายวัน' | 'รายเดือน'

      // แปลง attendances เป็น V2 format
      const dailyAttendances: DailyAttendanceV2[] = (attendances || []).map(att => ({
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

      // แปลง leave records
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
        perhr_salary: employee.perhr_salary || 0,
        perday_salary: employee.perday_salary || 0,
        monthly_salary: employee.monthly_salary || 0
      }

      // ดึง Morning OT Allowance ที่ user กำหนด
      const { data: morningOTData } = await supabase
        .from('morning_ot_allowances')
        .select('allowed_hours, selected_dates')
        .eq('employee_id', employee.employee_id)
        .eq('year', year)
        .eq('month', monthNum)
        .eq('period', period)
        .single()

      const morningOTAllowance = morningOTData?.allowed_hours || 0
      const selectedDates = morningOTData?.selected_dates || null

      // คำนวณค่าจ้าง
      const periodWage = calculatePeriodWageV2(
        employeeInfo,
        dailyAttendances,
        leaveRecordsV2,
        wageAdjustments,
        { startDate, endDate },
        morningOTAllowance,
        selectedDates
      )

      // คำนวณ SSO (ต้องดึงข้อมูลงวดอื่นมาด้วย)
      const otherPeriod = period === 1 ? 2 : 1
      const { startDate: otherStart, endDate: otherEnd } = getPeriodDates(year, monthNum, otherPeriod)

      const { data: otherAttendances } = await supabase
        .from('daily_attendance')
        .select('*')
        .eq('employee_id', employee.employee_id)
        .gte('work_date', otherStart)
        .lte('work_date', otherEnd)

      const { data: otherLeaves } = await supabase
        .from('leave_records')
        .select('*')
        .eq('employee_id', employee.employee_id)
        .gte('leave_date', otherStart)
        .lte('leave_date', otherEnd)
        .or('status.eq.approved,leave_able.eq.true')

      const { data: otherAdjustments } = await supabase
        .from('wage_adjustments')
        .select('*')
        .eq('employee_id', employee.employee_id)
        .eq('year', year)
        .eq('month', monthNum)
        .eq('period', otherPeriod)

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

      // ดึง Morning OT Allowance สำหรับงวดอื่น
      const { data: otherMorningOTData } = await supabase
        .from('morning_ot_allowances')
        .select('allowed_hours, selected_dates')
        .eq('employee_id', employee.employee_id)
        .eq('year', year)
        .eq('month', monthNum)
        .eq('period', otherPeriod)
        .single()

      const otherMorningOTAllowance = otherMorningOTData?.allowed_hours || 0
      const otherSelectedDates = otherMorningOTData?.selected_dates || null

      const otherPeriodWage = calculatePeriodWageV2(
        employeeInfo,
        otherDailyAttendances,
        otherLeaveRecordsV2,
        otherWageAdjustments,
        { startDate: otherStart, endDate: otherEnd },
        otherMorningOTAllowance,
        otherSelectedDates
      )

      // คำนวณ SSO
      const period1Income = period === 1 ? periodWage.total_income : otherPeriodWage.total_income
      const period2Income = period === 2 ? periodWage.total_income : otherPeriodWage.total_income
      const ssoCalc = calculateMonthlySSO(period1Income, period2Income)
      const ssoForThisPeriod = period === 1 ? ssoCalc.period1_sso : ssoCalc.period2_sso

      // ดึงข้อมูล YTD
      const { data: ytdRecords } = await supabase
        .from('wage_summary')
        .select('*')
        .eq('employee_id', employee.employee_id)
        .eq('year', year)

      let ytd_income = 0
      let ytd_tax = 0
      let ytd_sso = 0
      let ytd_total_income = 0
      let ytd_total_deduction = 0
      let ytd_net = 0

      if (ytdRecords && ytdRecords.length > 0) {
        ytdRecords.forEach((record: any) => {
          ytd_income += (record.base_wage || 0) + (record.ot_wage || 0)
          ytd_tax += record.tax || 0
          ytd_sso += record.sso || 0
          ytd_total_income += record.total_income || 0
          ytd_total_deduction += record.total_deduction || 0
          ytd_net += record.net_wage || 0
        })
      }

      // สร้าง additions array ตาม template
      const additions = DEFAULT_ADDITIONS.map(item => {
        let amount = 0
        switch (item.name) {
          case 'OT1':
            amount = periodWage.ot1_wage
            break
          case 'OT2':
            amount = periodWage.ot2_wage
            break
          case 'OT3':
            amount = periodWage.ot3_wage
            break
          case 'เบี้ยขยัน':
            amount = periodWage.attendance_bonus
            break
          case 'ค่ากะ':
            amount = periodWage.night_shift_allowance
            break
          default:
            // ดึงจาก adjustments ถ้ามี
            const adj = wageAdjustments.find(
              a => a.adjustment_type === 'income' && a.category === item.name
            )
            if (adj) amount = adj.amount
        }
        return { ...item, amount }
      })

      // สร้าง deductions array ตาม template
      const deductions = DEFAULT_DEDUCTIONS.map(item => {
        let amount = 0
        switch (item.name) {
          case 'ประกันสังคม':
            amount = ssoForThisPeriod
            break
          case 'ภาษีเงินได้':
            amount = periodWage.tax
            break
          case 'มาสาย':
            amount = periodWage.late_deduction
            break
          case 'ลากิจ':
            amount = periodWage.leave_deduction
            break
          default:
            // ดึงจาก adjustments ถ้ามี
            const adj = wageAdjustments.find(
              a => a.adjustment_type === 'deduction' && a.category === item.name
            )
            if (adj) amount = adj.amount
        }
        return { ...item, amount }
      })

      // Format วันที่
      const startDay = parseInt(startDate.split('-')[2])
      const endDay = parseInt(endDate.split('-')[2])
      const startMonth = parseInt(startDate.split('-')[1])
      const endMonth = parseInt(endDate.split('-')[1])
      const dateRange = `${startDay}/${startMonth}/${year} - ${endDay}/${endMonth}/${year}`

      // สร้าง payslip data
      const payslip: PayslipData = {
        companyName,
        dateRange,
        employee: {
          code: employee.employee_id,
          name: employee.name,
          position: employee.position || 'พนักงาน',
          department: employee.division_code || '001',
          section: employee.section_code || '001',
          bankName: getBankName(employee.bank_id),
          accountNumber: employee.bank_account?.toString() || '-'
        },
        salary: periodWage.base_wage,
        additions,
        deductions,
        ytd: {
          income: ytd_income,
          tax: ytd_tax,
          socialSecurity: ytd_sso,
          fund: 0,
          totalIncome: ytd_total_income,
          totalDeduction: ytd_total_deduction,
          netIncome: ytd_net
        }
      }

      payslips.push(payslip)
    }

    return NextResponse.json({
      success: true,
      data: payslips
    })

  } catch (error: any) {
    console.error('Error generating payslip data:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
