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

    let insertedScans = []

    // If all scans are duplicates, still calculate OT for the date range
    if (newScans.length === 0) {
      console.log('All scans are duplicates. Will recalculate OT for the date range in the file.')
      // Use original scans to get the date range and employee IDs for recalculation
      insertedScans = scans.map(s => ({
        employee_id: s.employee_id,
        scan_date: s.scan_date,
        scan_time: s.scan_time,
        scan_type: s.scan_type,
        machine_id: s.machine_id
      }))
    } else {
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
      const { data: insertedData, error: insertError } = await supabase
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

      insertedScans = insertedData || []
      console.log(`Inserted ${insertedScans.length} scans`)
    }

    // Get holidays once
    const { data: holidays } = await supabase
      .from('special_holidays')
      .select('*')

    // Get unique employee IDs
    const affectedEmployees = [...new Set(insertedScans?.map(s => s.employee_id) || [])]

    console.log(`Calculating OT for ${affectedEmployees.length} employees...`)

    // Get min/max dates for batch query with buffer
    const scanDates = (insertedScans || []).map(s => s.scan_date).sort()
    const minDateObj = new Date(scanDates[0])
    const maxDateObj = new Date(scanDates[scanDates.length - 1])

    // Add buffer to handle edge cases and overlapping scans
    // -2 days for minDate: to catch check-in scans from previous day(s) that pair with check-out on first day
    // +1 day for maxDate: to catch check-out scans from next day that pair with check-in on last day
    minDateObj.setDate(minDateObj.getDate() - 2)
    maxDateObj.setDate(maxDateObj.getDate() + 1)

    const empMinDate = minDateObj.toISOString().split('T')[0]
    const empMaxDate = maxDateObj.toISOString().split('T')[0]

    console.log(`Calculating OT for date range: ${empMinDate} to ${empMaxDate} (original: ${scanDates[0]} to ${scanDates[scanDates.length - 1]})`)

    // BATCH FETCH - get all employee scans in the date range (±1 day)
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

    // Calculate target date range for upsert (original dates ±1 day, not the fetch range)
    const targetMinDateObj = new Date(scanDates[0])
    const targetMaxDateObj = new Date(scanDates[scanDates.length - 1])
    targetMinDateObj.setDate(targetMinDateObj.getDate() - 1)
    targetMaxDateObj.setDate(targetMaxDateObj.getDate() + 1)
    const targetMinDate = targetMinDateObj.toISOString().split('T')[0]
    const targetMaxDate = targetMaxDateObj.toISOString().split('T')[0]

    console.log(`Will upsert attendance records for dates: ${targetMinDate} to ${targetMaxDate}`)

    // Calculate OT for all employees and collect all attendance records
    // Use a Map to merge multiple sessions for the same employee on the same date
    const attendanceMap = new Map<string, any>()

    for (const employeeId of affectedEmployees) {
      const employeeScans = scansByEmployee.get(employeeId) || []

      if (employeeScans.length === 0) continue

      // Calculate OT for this employee
      const workSessions = calculateOTFromScans(employeeScans, holidays || [])

      // Process sessions and merge if same employee + same date
      workSessions.forEach(session => {
        // Only process records within the target date range (uploaded dates ±1 day)
        if (session.workDate < targetMinDate || session.workDate > targetMaxDate) {
          console.log(`Skipping upsert for ${session.workDate} (outside target range)`)
          return
        }

        const key = `${employeeId}-${session.workDate}`

        if (attendanceMap.has(key)) {
          // Merge with existing record for same employee + date
          const existing = attendanceMap.get(key)

          // Sum up hours
          existing.actual_hours += session.actualHours
          existing.ot_hours += session.otHours
          existing.ot_normal_hours += session.otNormalHours
          existing.ot_special_hours += session.otSpecialHours
          existing.ot_premium_hours += session.otPremiumHours
          existing.late_hours += session.lateHours

          // Keep earliest check-in and latest check-out
          if (session.checkInTime < existing.check_in_time) {
            existing.check_in_time = session.checkInTime
          }
          if (session.checkOutTime > existing.check_out_time) {
            existing.check_out_time = session.checkOutTime
          }

          // Mark as late if any session was late
          existing.late = existing.late || session.late

          console.log(`Merged session for employee ${employeeId} on ${session.workDate}`)
        } else {
          // First session for this employee + date
          const scheduledInTime = session.shift === 1 ? '08:00:00' : '20:00:00'
          const scheduledOutTime = session.shift === 1 ? '17:00:00' : '05:00:00'

          attendanceMap.set(key, {
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
        }
      })
    }

    // Convert map to array for upsert
    const allAttendanceRecords = Array.from(attendanceMap.values())

    // Debug: Check for duplicates in the array (should not happen with Map)
    const checkDuplicates = new Set<string>()
    const foundDuplicates: string[] = []
    allAttendanceRecords.forEach(record => {
      const key = `${record.employee_id}-${record.work_date}`
      if (checkDuplicates.has(key)) {
        foundDuplicates.push(key)
      }
      checkDuplicates.add(key)
    })

    if (foundDuplicates.length > 0) {
      console.error(`Found ${foundDuplicates.length} duplicate employee_id+work_date combinations in batch:`, foundDuplicates.slice(0, 10))
      return NextResponse.json(
        {
          error: `Internal error: Found duplicate records in batch (${foundDuplicates.length} duplicates). This should not happen.`,
          duplicateKeys: foundDuplicates.slice(0, 20)
        },
        { status: 500 }
      )
    }

    console.log(`Batch upserting ${allAttendanceRecords.length} unique attendance records (from ${attendanceMap.size} map entries)...`)

    // BATCH UPSERT - all attendance records at once
    if (allAttendanceRecords.length > 0) {
      const { error: upsertError } = await supabase
        .from('daily_attendance')
        .upsert(allAttendanceRecords, {
          onConflict: 'employee_id,work_date'
        })

      if (upsertError) {
        console.error('Batch upsert error:', upsertError)
        return NextResponse.json(
          {
            error: `Failed to save attendance records: ${upsertError.message}`,
            details: upsertError,
            inserted: insertedScans?.length || 0,
            duplicates: duplicates
          },
          { status: 500 }
        )
      } else {
        console.log('Attendance records upserted successfully')
      }
    } else {
      console.log('No attendance records to upsert (no valid work sessions generated)')
    }

    console.log('Import completed successfully')

    // Count actual new scans inserted (not counting duplicates used for recalculation)
    const actualInserted = newScans.length

    return NextResponse.json({
      success: true,
      inserted: actualInserted,
      duplicates: duplicates,
      recalculated: duplicates > 0 && actualInserted === 0 ? allAttendanceRecords.length : 0,
      message: actualInserted > 0
        ? `Successfully imported ${actualInserted} scans. ${duplicates} duplicates skipped.`
        : `All ${duplicates} scans were duplicates. Recalculated OT for ${allAttendanceRecords.length} attendance records.`
    })

  } catch (error) {
    console.error('Error processing import:', error)
    return NextResponse.json(
      { error: 'Failed to process import' },
      { status: 500 }
    )
  }
}
