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

    // Get employee data for employment_type
    const { data: employeesData } = await supabase
      .from('employees')
      .select('employee_id, employment_type')
      .in('employee_id', affectedEmployees)
    
    const employeeDataMap = new Map(
      (employeesData || []).map(emp => [emp.employee_id, { employment_type: emp.employment_type }])
    )

    for (const employeeId of affectedEmployees) {
      const employeeScans = scansByEmployee.get(employeeId) || []

      if (employeeScans.length === 0) continue

      // Calculate OT for this employee
      const workSessions = calculateOTFromScans(employeeScans, holidays || [], employeeDataMap)

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

          // Sum up hours (ชั่วโมงจริง)
          existing.actual_hours += session.actualHours
          existing.ot_hours += session.otHours
          existing.ot_normal_hours += session.otNormalHours
          existing.ot_special_hours += session.otSpecialHours
          existing.ot_premium_hours += session.otPremiumHours
          existing.late_hours += session.lateHours

          // Sum up multiplied hours (ชั่วโมงที่คำนวณแล้ว)
          existing.ot_normal_hours_multiplied += session.otNormalHoursMultiplied
          existing.ot_special_hours_multiplied += session.otSpecialHoursMultiplied
          existing.ot_premium_hours_multiplied += session.otPremiumHoursMultiplied
          existing.ot_hours_multiplied += session.otHoursMultiplied

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
            ot_normal_hours_multiplied: session.otNormalHoursMultiplied,
            ot_special_hours_multiplied: session.otSpecialHoursMultiplied,
            ot_premium_hours_multiplied: session.otPremiumHoursMultiplied,
            ot_hours_multiplied: session.otHoursMultiplied,
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

    // ซิงค์ข้อมูลไป daily_wages
    console.log('Syncing wages...')
    try {
      // หาเดือนและงวดจากวันที่ที่ import
      const importDates = scanDates.map(d => new Date(d))
      const months = new Set(importDates.map(d => `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`))

      for (const monthStr of months) {
        // ซิงค์ทั้ง 2 งวด
        for (const period of [1, 2]) {
          const syncUrl = new URL('/api/wages/sync', request.url)
          const syncResponse = await fetch(syncUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ month: monthStr, period })
          })

          if (syncResponse.ok) {
            const syncData = await syncResponse.json()
            console.log(`Synced wages for ${monthStr} period ${period}: ${syncData.synced} records`)
          }
        }
      }
    } catch (syncError) {
      console.error('Error syncing wages:', syncError)
      // ไม่ throw error เพราะ import สำเร็จแล้ว
    }

    // Count actual new scans inserted (not counting duplicates used for recalculation)
    const actualInserted = newScans.length

    // ⭐ AUTO-CALCULATE WAGES ⭐
    // หาเดือนและปีที่ได้รับผลกระทบจากการ import
    const affectedMonths = new Set<string>()
    allAttendanceRecords.forEach(record => {
      const date = new Date(record.work_date)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      affectedMonths.add(`${year}-${month}`)
    })

    console.log(`Auto-calculating wages for ${affectedMonths.size} affected months:`, Array.from(affectedMonths))

    let wagesCalculated = 0
    const wageResults: string[] = []

    // คำนวณค่าจ้างสำหรับแต่ละเดือนที่ได้รับผลกระทบ
    for (const monthStr of affectedMonths) {
      try {
        const [year, month] = monthStr.split('-').map(Number)
        
        console.log(`Calculating wages for ${month}/${year}...`)

        // เรียก calculate wages API แบบ BATCH (เร็วกว่าเดิม 10-50 เท่า!)
        const calculateUrl = new URL('/api/wages/calculate-batch', request.url)
        const calculateRequest = new NextRequest(calculateUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ month, year })
        })

        // Import และเรียกใช้ฟังก์ชันคำนวณแบบ batch
        const calculateModule = await import('../wages/calculate-batch/route')
        const calculateResponse = await calculateModule.POST(calculateRequest)
        const calculateData = await calculateResponse.json()

        if (calculateData.success) {
          wagesCalculated += calculateData.calculated || 0
          wageResults.push(`${month}/${year}: ${calculateData.calculated} records`)
          console.log(`✅ Calculated ${calculateData.calculated} wage records for ${month}/${year}`)
        } else {
          console.error(`❌ Failed to calculate wages for ${month}/${year}:`, calculateData.error)
          wageResults.push(`${month}/${year}: ERROR - ${calculateData.error}`)
        }
      } catch (err) {
        console.error(`Error calculating wages for ${monthStr}:`, err)
        wageResults.push(`${monthStr}: ERROR`)
      }
    }

    return NextResponse.json({
      success: true,
      inserted: actualInserted,
      duplicates: duplicates,
      recalculated: duplicates > 0 && actualInserted === 0 ? allAttendanceRecords.length : 0,
      wagesCalculated,
      wageDetails: wageResults,
      message: actualInserted > 0
        ? `✅ Imported ${actualInserted} scans. ${duplicates} duplicates skipped. 💰 Auto-calculated ${wagesCalculated} wage records.`
        : `All ${duplicates} scans were duplicates. Recalculated OT for ${allAttendanceRecords.length} records. 💰 Auto-calculated ${wagesCalculated} wages.`
    })

  } catch (error) {
    console.error('Error processing import:', error)
    return NextResponse.json(
      { error: 'Failed to process import' },
      { status: 500 }
    )
  }
}
