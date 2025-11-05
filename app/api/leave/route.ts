import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeId, leaveDate, leaveType, reason, createdBy } = body

    if (!employeeId || !leaveDate) {
      return NextResponse.json(
        { error: 'Employee ID and leave date are required' },
        { status: 400 }
      )
    }

    // Check if employee exists
    const { data: employee } = await supabase
      .from('employees')
      .select('employee_id')
      .eq('employee_id', employeeId)
      .single()

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Insert leave record
    const { data, error } = await supabase
      .from('leave_records')
      .insert({
        employee_id: employeeId,
        leave_date: leaveDate,
        leave_type: leaveType || 'Personal',
        reason: reason || null,
        created_by: createdBy || null
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Leave record already exists for this date' },
          { status: 409 }
        )
      }
      throw error
    }

    // Update daily attendance to mark as leave
    await supabase
      .from('daily_attendance')
      .upsert({
        employee_id: employeeId,
        work_date: leaveDate,
        is_leave: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'employee_id,work_date'
      })

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Error creating leave record:', error)
    return NextResponse.json(
      { error: 'Failed to create leave record' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const employeeId = searchParams.get('employeeId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query = supabase
      .from('leave_records')
      .select(`
        *,
        employees (
          employee_id,
          name,
          department
        )
      `)
      .order('leave_date', { ascending: false })

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    if (startDate) {
      query = query.gte('leave_date', startDate)
    }

    if (endDate) {
      query = query.lte('leave_date', endDate)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Error fetching leave records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leave records' },
      { status: 500 }
    )
  }
}
