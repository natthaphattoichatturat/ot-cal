import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  getPeriodDates,
  calculateDailyWage,
  checkAttendanceBonus,
  calculatePeriodWage,
  calculateMonthlySSO
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
    const otherPeriod = period === 1 ? 2 : 1
    const { startDate: otherStart, endDate: otherEnd } = getPeriodDates(year, monthNum, otherPeriod)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ดึงข้อมูลพนักงานทั้งหมด
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('employee_id, name, department, perhr_salary, perday_salary, monthly_salary, employment_type')
      .order('employee_id')

    if (empError) {
      console.error('Employees fetch error:', empError)
      throw empError
    }

    // ดึงข้อมูลการเข้างานของทุกคน (ทั้ง 2 งวด)
    const { data: attendances, error: attError } = await supabase
      .from('daily_attendance')
      .select('*')
      .or(`and(work_date.gte.${startDate},work_date.lte.${endDate}),and(work_date.gte.${otherStart},work_date.lte.${otherEnd})`)

    if (attError) {
      console.error('Attendance fetch error:', attError)
      throw attError
    }

    // ดึงข้อมูลการลา
    const { data: leaveRecords, error: leaveError } = await supabase
      .from('leave_records')
      .select('*')
      .gte('leave_date', startDate)
      .lte('leave_date', endDate)
      .eq('status', 'approved')

    if (leaveError) {
      console.error('Leave records fetch error:', leaveError)
    }

    // ดึงข้อมูลเงินเพิ่ม/หัก
    const { data: adjustments, error: adjError } = await supabase
      .from('wage_adjustments')
      .select('*')
      .eq('year', year)
      .eq('month', monthNum)
      .eq('period', period)

    if (adjError) {
      console.error('Adjustments fetch error:', adjError)
    }

    // คำนวณค่าจ้างแต่ละคน
    const employeeWages = employees?.map(emp => {
      const employmentType = (emp.employment_type || 'รายวัน') as 'รายวัน' | 'รายเดือน'
      
      // กรองข้อมูลการเข้างานของพนักงานคนนี้ (งวดปัจจุบัน)
      const empAttendances = attendances?.filter(att => 
        att.employee_id === emp.employee_id &&
        att.work_date >= startDate && 
        att.work_date <= endDate
      ) || []

      // กรองข้อมูลการเข้างานงวดอื่น
      const otherAttendances = attendances?.filter(att => 
        att.employee_id === emp.employee_id &&
        att.work_date >= otherStart && 
        att.work_date <= otherEnd
      ) || []

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
          emp.perhr_salary || 0,
          employmentType
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

      // คำนวณค่ากะดึก (40 บาท/วัน)
      const nightShiftDays = empAttendances.filter(att => {
        const checkIn = att.scheduled_in_time || att.check_in_time
        if (checkIn) {
          const hour = parseInt(checkIn.split(':')[0])
          return hour >= 20 || hour < 5
        }
        return false
      }).length
      const nightShiftAllowance = nightShiftDays * 40

      // คำนวณนาทีมาสายรวม
      const totalLateMinutes = empAttendances.reduce((sum, att) => {
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
      }, 0)

      // คำนวณเงินหักค่ามาสาย
      const perMinuteSalary = (emp.perhr_salary || 0) / 60
      const lateDeduction = totalLateMinutes * perMinuteSalary

      // คำนวณวันลาและเงินหักค่าลา
      const empLeaveRecords = leaveRecords?.filter(l => l.employee_id === emp.employee_id) || []
      const leaveDays = empLeaveRecords.length
      let leaveDeduction = 0
      if (employmentType === 'รายเดือน' && leaveDays > 0) {
        const dailySalary = (emp.monthly_salary || 0) / 15
        leaveDeduction = dailySalary * leaveDays
      }

      // คำนวณเงินเพิ่ม/หักจาก adjustments
      const empAdjustments = adjustments?.filter(a => a.employee_id === emp.employee_id) || []
      const additionalIncome = empAdjustments
        .filter(a => a.adjustment_type === 'income')
        .reduce((sum, a) => sum + parseFloat(a.amount), 0)
      const additionalDeduction = empAdjustments
        .filter(a => a.adjustment_type === 'deduction')
        .reduce((sum, a) => sum + parseFloat(a.amount), 0)

      // คำนวณ SSO
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
          emp.perhr_salary || 0,
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
          employee_id: emp.employee_id,
          name: emp.name,
          department: emp.department,
          perhr_salary: emp.perhr_salary || 0,
          perday_salary: emp.perday_salary || 0
        },
        otherDailyWages,
        otherHasBonus
      )

      const period1Income = period === 1 ? periodWage.total_income : otherPeriodWage.total_income
      const period2Income = period === 2 ? periodWage.total_income : otherPeriodWage.total_income
      const ssoCalc = calculateMonthlySSO(period1Income, period2Income)
      const ssoForThisPeriod = period === 1 ? ssoCalc.period1_sso : ssoCalc.period2_sso

      // คำนวณรายได้รวม
      const totalIncome = periodWage.total_income + nightShiftAllowance + additionalIncome

      // คำนวณเงินหักรวม
      const totalDeductions = lateDeduction + leaveDeduction + additionalDeduction + ssoForThisPeriod + periodWage.tax_withholding

      // คำนวณเงินสุทธิ
      const netWage = totalIncome - totalDeductions

      return {
        employeeId: periodWage.employee_id,
        name: periodWage.name,
        department: periodWage.department,
        employmentType,
        totalBaseWage: periodWage.total_base_wage,
        totalOt1Wage: periodWage.total_ot1_wage,
        totalOt2Wage: periodWage.total_ot2_wage,
        totalOt3Wage: periodWage.total_ot3_wage,
        grossWage: periodWage.gross_wage,
        attendanceBonus: periodWage.attendance_bonus,
        nightShiftAllowance,
        additionalIncome,
        totalIncome,
        // เงินหัก
        lateMinutes: totalLateMinutes,
        lateDeduction,
        leaveDays,
        leaveDeduction,
        additionalDeduction,
        sso: ssoForThisPeriod,
        tax: periodWage.tax_withholding,
        totalDeductions,
        // เงินสุทธิ
        netWage
      }
    }) || []

    return NextResponse.json({ success: true, data: employeeWages })
  } catch (error: any) {
    console.error('Error fetching wage summary:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
