import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Backward compatible single mode:
    // { employeeId, leaveDate, leaveType, reason, createdBy }
    // New batch mode:
    // {
    //   employeeIds: string[],
    //   leaves: { leaveDate: string, leaveHours: number }[],
    //   leaveType: string,
    //   reason?: string|null,
    //   createdBy?: string|null,
    //   deductWage?: boolean,
    //   deductDiligence?: boolean
    // }
    const { employeeId, leaveDate, leaveType, reason, createdBy } = body
    const employeeIds: string[] | undefined = body.employeeIds
    const leaves: Array<{ leaveDate: string; leaveHours: number }> | undefined = body.leaves
    const deductWage: boolean = body.deductWage === true
    const deductDiligence: boolean = body.deductDiligence === true

    const isBatch = Array.isArray(employeeIds) && Array.isArray(leaves)

    if (!isBatch) {
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

      // Upsert leave record (single)
      const { data, error } = await supabase
        .from('leave_records')
        .upsert({
          employee_id: employeeId,
          leave_date: leaveDate,
          leave_type: leaveType || 'Personal',
          reason: reason || null,
          created_by: createdBy || null,
          // new fields (if column exists)
          leave_hours: body.leaveHours ?? 8,
          is_paid: body.deductWage === true ? false : true,
          deduct_wage: body.deductWage === true,
          deduct_diligence: body.deductDiligence === true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'employee_id,leave_date'
        })
        .select()
        .single()

      if (error) {
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
        data,
        mode: 'single'
      })
    }

    // ===== Batch mode =====
    if (!employeeIds || employeeIds.length === 0 || !leaves || leaves.length === 0) {
      return NextResponse.json(
        { error: 'employeeIds and leaves are required' },
        { status: 400 }
      )
    }

    // Basic validation
    for (const l of leaves) {
      const hours = Number(l.leaveHours)
      if (!l.leaveDate || !Number.isFinite(hours) || hours < 1 || hours > 24) {
        return NextResponse.json(
          { error: 'Invalid leaveDate/leaveHours (leaveHours must be 1-24)' },
          { status: 400 }
        )
      }
    }

    // Check employees exist
    const { data: empRows, error: empErr } = await supabase
      .from('employees')
      .select('employee_id')
      .in('employee_id', employeeIds)

    if (empErr) throw empErr
    const existing = new Set((empRows || []).map((e: any) => e.employee_id))
    const missing = employeeIds.filter(id => !existing.has(id))
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Employee not found: ${missing.join(', ')}` },
        { status: 404 }
      )
    }

    // Build upsert payload
    const rows = employeeIds.flatMap(empId =>
      leaves.map(l => ({
        employee_id: empId,
        leave_date: l.leaveDate,
        leave_type: leaveType || 'Personal',
        reason: reason || null,
        created_by: createdBy || null,
        leave_hours: l.leaveHours,
        is_paid: deductWage ? false : true,
        deduct_wage: deductWage,
        deduct_diligence: deductDiligence,
        updated_at: new Date().toISOString()
      }))
    )

    const { data: upserted, error: upsertErr } = await supabase
      .from('leave_records')
      .upsert(rows, { onConflict: 'employee_id,leave_date' })
      .select()

    if (upsertErr) throw upsertErr

    // Mark daily attendance is_leave for each (employee_id, date)
    const attendanceRows = employeeIds.flatMap(empId =>
      leaves.map(l => ({
        employee_id: empId,
        work_date: l.leaveDate,
        is_leave: true,
        updated_at: new Date().toISOString()
      }))
    )
    await supabase
      .from('daily_attendance')
      .upsert(attendanceRows, { onConflict: 'employee_id,work_date' })

    return NextResponse.json({
      success: true,
      data: upserted || [],
      mode: 'batch',
      counts: { employees: employeeIds.length, dates: leaves.length, records: rows.length }
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
