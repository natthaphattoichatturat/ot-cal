import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month') // Format: YYYY-MM
    const period = searchParams.get('period') // '1' or '2'

    if (!month || !period) {
      return NextResponse.json(
        { error: 'Month and period parameters are required' },
        { status: 400 }
      )
    }

    const [year, monthNum] = month.split('-').map(Number)

    // Calculate date range based on period
    let startDate: string
    let endDate: string

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

    // Get all employees
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('employee_id, name, department')
      .order('employee_id', { ascending: true })

    if (empError) {
      throw empError
    }

    // Format data for frontend
    const attendanceMap = new Map()

    attendance?.forEach((record: any) => {
      const empId = record.employee_id
      if (!attendanceMap.has(empId)) {
        attendanceMap.set(empId, {
          employeeId: empId,
          name: record.employees?.name || 'Unknown',
          department: record.employees?.department || 'Unknown',
          attendance: {}
        })
      }

      attendanceMap.get(empId).attendance[record.work_date] = {
        actualHours: record.actual_hours,
        otHours: record.ot_hours,
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
