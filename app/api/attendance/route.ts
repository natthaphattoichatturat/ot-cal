import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month') // Format: YYYY-MM
    const period = searchParams.get('period') // '1' or '2'
    let startDate = searchParams.get('startDate')
    let endDate = searchParams.get('endDate')
    const groupBy = searchParams.get('groupBy') // optional: 'employee'

    // Support both month/period and startDate/endDate formats
    if (startDate && endDate) {
      // Use provided date range (for OT viewer)
      // startDate and endDate already set
    } else if (month && period) {
      // Calculate date range based on period (for attendance page)
      const [year, monthNum] = month.split('-').map(Number)

      if (period === '1') {
        // Period 1: 26th of previous month to 10th of selected month
        const prevMonth = monthNum === 1 ? 12 : monthNum - 1
        const prevYear = monthNum === 1 ? year - 1 : year

        startDate = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-26`
        endDate = `${year}-${monthNum.toString().padStart(2, '0')}-10`
      } else {
        // Period 2: 11th to 25th of selected month
        startDate = `${year}-${monthNum.toString().padStart(2, '0')}-11`
        endDate = `${year}-${monthNum.toString().padStart(2, '0')}-25`
      }
    } else {
      return NextResponse.json(
        { error: 'Either (month and period) or (startDate and endDate) parameters are required' },
        { status: 400 }
      )
    }

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
      .select('employee_id, name, department, perhr_salary')
      .order('employee_id', { ascending: true })

    if (empError) {
      throw empError
    }

    // Format data for frontend (original format for attendance page)
    const attendanceMap = new Map()

    attendance?.forEach((record: any) => {
      const empId = record.employee_id
      if (!attendanceMap.has(empId)) {
        // Find employee data to get perhr_salary
        const empData = employees?.find(e => e.employee_id === empId)
        attendanceMap.set(empId, {
          employeeId: empId,
          name: record.employees?.name || 'Unknown',
          department: record.employees?.department || 'Unknown',
          perhr_salary: empData?.perhr_salary || 0,
          attendance: {}
        })
      }

      attendanceMap.get(empId).attendance[record.work_date] = {
        actualHours: record.actual_hours,
        otHours: record.ot_hours,
        otNormalHours: record.ot_normal_hours || 0,
        otSpecialHours: record.ot_special_hours || 0,
        otPremiumHours: record.ot_premium_hours || 0,
        isHoliday: record.is_holiday,
        late: record.late,
        checkInTime: record.check_in_time,
        checkOutTime: record.check_out_time
      }
    })

    // Convert map to array
    const result = Array.from(attendanceMap.values())

    // Add employees without attendance records
    employees?.forEach(emp => {
      if (!attendanceMap.has(emp.employee_id)) {
        result.push({
          employeeId: emp.employee_id,
          name: emp.name,
          department: emp.department,
          perhr_salary: emp.perhr_salary || 0,
          attendance: {}
        })
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
