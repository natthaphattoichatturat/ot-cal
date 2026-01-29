import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { format, parseISO, addDays } from 'date-fns'

const SPECIAL_INCOME_CATEGORIES = new Set([
  'เงินพิเศษอื่นๆ',
  'ค่าพิเศษ',
  'ค่าอื่นๆ',
  'ค่าอื่นๆพิเศษ'
])

const getDateRange = (start: string, end: string): string[] => {
  const startDate = parseISO(start)
  const endDate = parseISO(end)
  const dates: string[] = []

  let current = startDate
  while (current <= endDate) {
    dates.push(format(current, 'yyyy-MM-dd'))
    current = addDays(current, 1)
  }

  return dates
}

const isPersonalLeaveType = (type: string): boolean => {
  const normalized = (type || '').toLowerCase()
  return normalized.includes('ลากิจ') || normalized.includes('กิจ') || normalized.includes('personal')
}

const isSickLeaveType = (type: string): boolean => {
  const normalized = (type || '').toLowerCase()
  return normalized.includes('ลาป่วย') || normalized.includes('ป่วย') || normalized.includes('sick')
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month') // Format: YYYY-MM
    const period = searchParams.get('period') // '1' or '2'
    let startDate = searchParams.get('startDate')
    let endDate = searchParams.get('endDate')
    const groupBy = searchParams.get('groupBy') // optional: 'employee'
    let yearNum: number | null = null
    let monthNum: number | null = null
    let periodNum: number | null = null

    // Support both month/period and startDate/endDate formats
    if (startDate && endDate) {
      // Use provided date range (for OT viewer)
      // startDate and endDate already set
    } else if (month && period) {
      // Calculate date range based on period (for attendance page)
      const [year, parsedMonth] = month.split('-').map(Number)
      yearNum = year
      monthNum = parsedMonth
      periodNum = parseInt(period)

      if (period === '1') {
        // Period 1: 26th of previous month to 10th of selected month
        const prevMonth = parsedMonth === 1 ? 12 : parsedMonth - 1
        const prevYear = parsedMonth === 1 ? year - 1 : year

        startDate = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-26`
        endDate = `${year}-${parsedMonth.toString().padStart(2, '0')}-10`
      } else {
        // Period 2: 11th to 25th of selected month
        startDate = `${year}-${parsedMonth.toString().padStart(2, '0')}-11`
        endDate = `${year}-${parsedMonth.toString().padStart(2, '0')}-25`
      }
    } else {
      return NextResponse.json(
        { error: 'Either (month and period) or (startDate and endDate) parameters are required' },
        { status: 400 }
      )
    }

    const dateRange = getDateRange(startDate!, endDate!)

    // Get all daily attendance records for the period
    const { data: attendance, error } = await supabase
      .from('daily_attendance')
      .select(`
        *,
        employees (
          employee_id,
          name,
          department
        )
      `)
      .gte('work_date', startDate)
      .lte('work_date', endDate)
      .order('employee_id', { ascending: true })
      .order('work_date', { ascending: true })

    if (error) {
      throw error
    }

    // Fetch leave records for the period
    const { data: leaveRecords } = await supabase
      .from('leave_records')
      .select('employee_id, leave_date, leave_type')
      .gte('leave_date', startDate)
      .lte('leave_date', endDate)

    const leaveMap = new Map<string, { personal: number; sick: number; dates: Set<string> }>()
    ;(leaveRecords || []).forEach((leave: any) => {
      const empId = leave.employee_id
      if (!empId || !leave.leave_date) return

      if (!leaveMap.has(empId)) {
        leaveMap.set(empId, { personal: 0, sick: 0, dates: new Set() })
      }

      const entry = leaveMap.get(empId)!
      const dateStr = leave.leave_date
      const type = leave.leave_type || ''
      const normalizedType = (type || '').toLowerCase()
      if (normalizedType.includes('ขาดงาน') || normalizedType.includes('absent')) {
        return
      }

      if (entry.dates.has(dateStr)) return
      entry.dates.add(dateStr)

      if (isSickLeaveType(type)) {
        entry.sick += 1
      } else if (isPersonalLeaveType(type)) {
        entry.personal += 1
      }
    })

    // Fetch special holidays for the period
    const { data: specialHolidays } = await supabase
      .from('special_holidays')
      .select('holiday_date')
      .gte('holiday_date', startDate)
      .lte('holiday_date', endDate)

    const holidaySet = new Set((specialHolidays || []).map((h: any) => h.holiday_date))
    const isHolidayDate = (dateStr: string): boolean => {
      const dateObj = parseISO(dateStr)
      return dateObj.getDay() === 0 || holidaySet.has(dateStr)
    }

    // Fetch special income adjustments for the period (if month/period provided)
    const specialIncomeMap = new Map<string, number>()
    if (yearNum && monthNum && periodNum) {
      const { data: adjustments } = await supabase
        .from('wage_adjustments')
        .select('employee_id, adjustment_type, category, amount')
        .eq('year', yearNum)
        .eq('month', monthNum)
        .eq('period', periodNum)

      ;(adjustments || []).forEach((adj: any) => {
        if (adj.adjustment_type !== 'income') return
        if (!SPECIAL_INCOME_CATEGORIES.has(adj.category)) return
        const current = specialIncomeMap.get(adj.employee_id) || 0
        specialIncomeMap.set(adj.employee_id, current + (adj.amount || 0))
      })
    }

    // If groupBy=employee, return detailed records with employee info
    if (groupBy === 'employee') {
      const detailedRecords = attendance?.map((record: any) => ({
        id: record.id,
        employee_id: record.employee_id,
        employee_name: record.employees?.name || 'Unknown',
        work_date: record.work_date,
        check_in_time: record.check_in_time,
        check_out_time: record.check_out_time,
        actual_hours: record.actual_hours || 0,
        ot_hours: record.ot_hours || 0,
        is_holiday: record.is_holiday || false,
        is_leave: record.is_leave || false,
        late: record.late || false,
        late_hours: record.late_hours || 0,
        notes: record.notes,
      })) || []

      return NextResponse.json({
        success: true,
        startDate,
        endDate,
        data: detailedRecords
      })
    }

    // Get all employees
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('employee_id, name, department, perhr_salary, position, department_code, section')
      .order('employee_id', { ascending: true })

    if (empError) {
      throw empError
    }

    // Format data for frontend (original format for attendance page)
    const attendanceMap = new Map()

    const applySummaryFields = (entry: any) => {
      const leaveInfo = leaveMap.get(entry.employeeId) || { personal: 0, sick: 0, dates: new Set<string>() }
      entry.personalLeaveDays = leaveInfo.personal
      entry.sickLeaveDays = leaveInfo.sick
      entry.nightShiftAllowance = entry.nightShiftDays * 40
      entry.specialIncome = specialIncomeMap.get(entry.employeeId) || 0

      const workedDates = new Set<string>()
      Object.entries(entry.attendance).forEach(([date, att]: any) => {
        if (att.actualHours && att.actualHours > 0) {
          workedDates.add(date)
        }
      })

      let absentDays = 0
      dateRange.forEach(date => {
        if (isHolidayDate(date)) return
        if (leaveInfo.dates.has(date)) return
        if (workedDates.has(date)) return
        absentDays += 1
      })

      entry.absentDays = absentDays
      entry.lateMinutes = Math.round(entry.lateMinutes || 0)
      entry.totalWorkDays = entry.regularWorkDays + entry.holidayWorkDays
    }

    attendance?.forEach((record: any) => {
      const empId = record.employee_id
      if (!attendanceMap.has(empId)) {
        // Find employee data to get additional fields
        const empData = employees?.find(e => e.employee_id === empId)
        attendanceMap.set(empId, {
          employeeId: empId,
          name: record.employees?.name || 'Unknown',
          department: record.employees?.department || 'Unknown',
          perhr_salary: empData?.perhr_salary || 0,
          position: empData?.position || '',
          department_code: empData?.department_code || '',
          section: empData?.section || '',
          attendance: {},
          totalWorkDays: 0,
          regularWorkDays: 0,
          holidayWorkDays: 0,
          personalLeaveDays: 0,
          sickLeaveDays: 0,
          absentDays: 0,
          lateDays: 0,
          lateMinutes: 0,
          nightShiftDays: 0,
          nightShiftAllowance: 0,
          specialIncome: 0
        })
      }

      const entry = attendanceMap.get(empId)
      entry.attendance[record.work_date] = {
        actualHours: record.actual_hours,
        otHours: record.ot_hours,
        otNormalHours: record.ot_normal_hours || 0,
        otSpecialHours: record.ot_special_hours || 0,
        otPremiumHours: record.ot_premium_hours || 0,
        otHoursMultiplied: record.ot_hours_multiplied || 0,
        otNormalHoursMultiplied: record.ot_normal_hours_multiplied || 0,
        otSpecialHoursMultiplied: record.ot_special_hours_multiplied || 0,
        otPremiumHoursMultiplied: record.ot_premium_hours_multiplied || 0,
        isHoliday: record.is_holiday,
        late: record.late,
        checkInTime: record.check_in_time,
        checkOutTime: record.check_out_time
      }

      if (record.actual_hours && record.actual_hours > 0) {
        if (record.is_holiday) {
          entry.holidayWorkDays += 1
        } else {
          entry.regularWorkDays += 1
        }
        entry.totalWorkDays += 1
      }

      if (record.late) {
        entry.lateDays += 1
        const lateHours = Number(record.late_hours || 0)
        if (lateHours > 0) {
          entry.lateMinutes += lateHours * 60
        }
      }

      if (record.check_in_time) {
        const checkInHour = parseInt(record.check_in_time.split(':')[0])
        if (checkInHour >= 20 || checkInHour < 6) {
          entry.nightShiftDays += 1
        }
      }
    })

    // Apply summary fields for employees with attendance
    attendanceMap.forEach((entry: any) => {
      applySummaryFields(entry)
    })

    // Convert map to array
    const result = Array.from(attendanceMap.values())

    // Add employees without attendance records
    employees?.forEach(emp => {
      if (!attendanceMap.has(emp.employee_id)) {
        const entry: any = {
          employeeId: emp.employee_id,
          name: emp.name,
          department: emp.department,
          perhr_salary: emp.perhr_salary || 0,
          position: emp.position || '',
          department_code: emp.department_code || '',
          section: emp.section || '',
          attendance: {},
          totalWorkDays: 0,
          regularWorkDays: 0,
          holidayWorkDays: 0,
          personalLeaveDays: 0,
          sickLeaveDays: 0,
          absentDays: 0,
          lateDays: 0,
          lateMinutes: 0,
          nightShiftDays: 0,
          nightShiftAllowance: 0,
          specialIncome: 0
        }
        applySummaryFields(entry)
        result.push(entry)
      }
    })

    return NextResponse.json({
      success: true,
      startDate,
      endDate,
      data: result
    })

  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance data' },
      { status: 500 }
    )
  }
}
