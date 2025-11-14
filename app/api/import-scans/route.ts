import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { parseScanFile, calculateOTFromScans } from '@/lib/otCalculator'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('Reading file...')
    const content = await file.text()

    console.log('Parsing scans...')
    const scans = parseScanFile(content)

    if (scans.length === 0) {
      return NextResponse.json(
        { error: 'No valid scan data found in file' },
        { status: 400 }
      )
    }

    console.log(`Parsed ${scans.length} scans, checking for duplicates...`)

    // Get ALL existing scans in one query using date range
    const dates = [...new Set(scans.map(s => s.scan_date))].sort()
    const minDate = dates[0]
    const maxDate = dates[dates.length - 1]

    const { data: existingScans } = await supabase
      .from('attendance_scans')
      .select('machine_id, scan_date, scan_time, employee_id, scan_type')
      .gte('scan_date', minDate)
      .lte('scan_date', maxDate)

    console.log(`Found ${existingScans?.length || 0} existing scans in database`)

    // Create a Set for fast duplicate checking
    const existingSet = new Set(
      (existingScans || []).map(s =>
        `${s.machine_id}|${s.scan_date}|${s.scan_time}|${s.employee_id}|${s.scan_type}`
      )
    )

    // Filter out duplicates
    const newScans = scans.filter(scan => {
      const key = `${scan.machine_id}|${scan.scan_date}|${scan.scan_time}|${scan.employee_id}|${scan.scan_type}`
      return !existingSet.has(key)
    })

    const duplicates = scans.length - newScans.length

    console.log(`New scans to insert: ${newScans.length}, Duplicates: ${duplicates}`)

    if (newScans.length === 0) {
      return NextResponse.json({
        success: true,
        inserted: 0,
        duplicates: duplicates,
        message: `No new scans to import. ${duplicates} duplicates skipped.`
      })
    }

    // Check for missing employees and create them with default values
    console.log('Checking for missing employees...')
    const uniqueEmployeeIds = [...new Set(newScans.map(s => s.employee_id))]

    const { data: existingEmployees } = await supabase
      .from('employees')
      .select('employee_id')
      .in('employee_id', uniqueEmployeeIds)

    const existingEmployeeIds = new Set((existingEmployees || []).map(e => e.employee_id))
    const missingEmployeeIds = uniqueEmployeeIds.filter(id => !existingEmployeeIds.has(id))

    if (missingEmployeeIds.length > 0) {
      console.log(`Creating ${missingEmployeeIds.length} missing employees with default values...`)

      const { error: employeeInsertError } = await supabase
        .from('employees')
        .insert(missingEmployeeIds.map(empId => ({
          employee_id: empId,
          name: `พนักงาน ${empId}`,
          department: 'ไม่ระบุ',
          perday_salary: 0,
          perhr_salary: 0,
          bank_id: null,
          bank_account: null,
          identity_id: null
        })))

      if (employeeInsertError) {
        console.error('Error creating missing employees:', employeeInsertError)
        return NextResponse.json(
          { error: `Failed to create missing employees: ${employeeInsertError.message}` },
          { status: 500 }
        )
      }

      console.log(`Created ${missingEmployeeIds.length} new employees`)
    }

    // BATCH INSERT - all at once
    console.log('Batch inserting scans...')
    const { data: insertedScans, error: insertError } = await supabase
      .from('attendance_scans')
      .insert(newScans.map(s => ({
        machine_id: s.machine_id,
        scan_date: s.scan_date,
        scan_time: s.scan_time,
        employee_id: s.employee_id,
        scan_type: s.scan_type
      })))
      .select()

    if (insertError) {
      console.error('Batch insert error:', insertError)
      return NextResponse.json(
        { error: `Failed to insert scans: ${insertError.message}` },
        { status: 500 }
      )
    }

    console.log(`Inserted ${insertedScans?.length || 0} scans`)

    // Get holidays once
    const { data: holidays } = await supabase
      .from('special_holidays')
      .select('*')

    // Get unique employee IDs
    const affectedEmployees = [...new Set(insertedScans?.map(s => s.employee_id) || [])]

    console.log(`Calculating OT for ${affectedEmployees.length} employees...`)

    // Get min/max dates for batch query
    const scanDates = (insertedScans || []).map(s => s.scan_date).sort()
    const empMinDate = scanDates[0]
    const empMaxDate = scanDates[scanDates.length - 1]

    // BATCH FETCH - get all employee scans in ONE query
    const { data: allEmployeeScans } = await supabase
      .from('attendance_scans')
      .select('*')
      .in('employee_id', affectedEmployees)
      .gte('scan_date', empMinDate)
      .lte('scan_date', empMaxDate)
      .order('employee_id', { ascending: true })
      .order('scan_date', { ascending: true })
      .order('scan_time', { ascending: true })

    console.log(`Fetched ${allEmployeeScans?.length || 0} total scans for calculation`)

    // Group scans by employee
    const scansByEmployee = new Map<string, any[]>()
    allEmployeeScans?.forEach(scan => {
      if (!scansByEmployee.has(scan.employee_id)) {
        scansByEmployee.set(scan.employee_id, [])
      }
      scansByEmployee.get(scan.employee_id)!.push(scan)
    })

    // Calculate OT for all employees and collect all attendance records
    const allAttendanceRecords: any[] = []

    for (const employeeId of affectedEmployees) {
      const employeeScans = scansByEmployee.get(employeeId) || []

      if (employeeScans.length === 0) continue

      // Calculate OT for this employee
      const workSessions = calculateOTFromScans(employeeScans, holidays || [])

      // Add to batch
      workSessions.forEach(session => {
        const scheduledInTime = session.shift === 1 ? '08:00:00' : '20:00:00'
        const scheduledOutTime = session.shift === 1 ? '17:00:00' : '05:00:00'

        allAttendanceRecords.push({
          employee_id: employeeId,
          work_date: session.workDate,
          check_in_time: session.checkInTime,
          check_out_time: session.checkOutTime,
          scheduled_in_time: scheduledInTime,
          scheduled_out_time: scheduledOutTime,
          actual_hours: session.actualHours,
          ot_hours: session.otHours,
          ot_normal_hours: session.otNormalHours,
          ot_special_hours: session.otSpecialHours,
          ot_premium_hours: session.otPremiumHours,
          is_holiday: session.isHoliday,
          late: session.late,
          late_hours: session.lateHours,
          updated_at: new Date().toISOString()
        })
      })
    }

    console.log(`Batch upserting ${allAttendanceRecords.length} attendance records...`)

    // BATCH UPSERT - all attendance records at once
    if (allAttendanceRecords.length > 0) {
      const { error: upsertError } = await supabase
        .from('daily_attendance')
        .upsert(allAttendanceRecords, {
          onConflict: 'employee_id,work_date'
        })

      if (upsertError) {
        console.error('Batch upsert error:', upsertError)
      } else {
        console.log('Attendance records upserted successfully')
      }
    }

    console.log('Import completed successfully')

    return NextResponse.json({
      success: true,
      inserted: insertedScans?.length || 0,
      duplicates: duplicates,
      message: `Successfully imported ${insertedScans?.length || 0} scans. ${duplicates} duplicates skipped.`
    })

  } catch (error) {
    console.error('Error processing import:', error)
    return NextResponse.json(
      { error: 'Failed to process import' },
      { status: 500 }
    )
  }
}
