import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendLineMessage } from '@/lib/lineConfig'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Determine shift based on current time
function determineShift(currentHour: number, currentMinute: number): number {
  const timeInMinutes = currentHour * 60 + currentMinute

  // Shift 1 (08:00-17:00): Check-in between 05:00-08:00 or 12:00-13:00
  if (
    (timeInMinutes >= 5 * 60 && timeInMinutes < 8 * 60) || // 05:00-08:00
    (timeInMinutes >= 12 * 60 && timeInMinutes < 13 * 60)  // 12:00-13:00
  ) {
    return 1
  }

  // Shift 2 (20:00-05:00): Check-in between 17:30-20:00
  if (timeInMinutes >= 17 * 60 + 30 && timeInMinutes < 20 * 60) { // 17:30-20:00
    return 2
  }

  // Default to shift 1 for any other time
  return 1
}

// Format time in Thai
function formatThaiTime(date: Date): string {
  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

// Format date in Thai
function formatThaiDate(date: Date): string {
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  const day = date.getDate()
  const month = thaiMonths[date.getMonth()]
  const year = date.getFullYear() + 543
  return `${day} ${month} ${year}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lineUserId, gpsLocation } = body

    if (!lineUserId) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูล LINE User ID' },
        { status: 400 }
      )
    }

    // Find employee by LINE ID
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('employee_id, name')
      .eq('line_id', lineUserId)
      .single()

    if (employeeError || !employee) {
      return NextResponse.json(
        {
          success: false,
          error: 'ไม่พบข้อมูลพนักงาน กรุณาลงทะเบียนก่อนใช้งาน'
        },
        { status: 404 }
      )
    }

    // Get current date and time in Thailand timezone (UTC+7)
    const now = new Date()
    const thailandTime = new Date(now.getTime() + (7 * 60 * 60 * 1000))
    const currentDate = thailandTime.toISOString().split('T')[0] // YYYY-MM-DD
    const currentHour = thailandTime.getUTCHours()
    const currentMinute = thailandTime.getUTCMinutes()

    // Check if there's already a record for today
    const { data: existingRecord, error: fetchError } = await supabase
      .from('attendance_checkin')
      .select('*')
      .eq('employee_id', employee.employee_id)
      .eq('work_date', currentDate)
      .single()

    let result
    let messageText = ''
    let isCheckIn = false

    if (!existingRecord) {
      // No record exists - this is a CHECK-IN
      isCheckIn = true
      const shift = determineShift(currentHour, currentMinute)

      const { data, error } = await supabase
        .from('attendance_checkin')
        .insert({
          employee_id: employee.employee_id,
          employee_name: employee.name,
          work_date: currentDate,
          check_in_time: thailandTime.toISOString(),
          shift: shift,
          gps_location_in: gpsLocation,
          is_checked_in: true,
          is_checked_out: false,
        })
        .select()
        .single()

      if (error) {
        console.error('Database insert error:', error)
        return NextResponse.json(
          { success: false, error: 'ไม่สามารถบันทึกข้อมูล Check-in ได้' },
          { status: 500 }
        )
      }

      result = data

      const shiftText = shift === 1 ? 'กะเช้า (08:00-17:00)' : 'กะดึก (20:00-05:00)'
      messageText = `✅ บันทึก Check-in สำเร็จ\n\nชื่อ: ${employee.name}\nรหัสพนักงาน: ${employee.employee_id}\nวันที่: ${formatThaiDate(thailandTime)}\nเวลา Check-in: ${formatThaiTime(thailandTime)}\nกะการทำงาน: ${shiftText}`

      // Send LINE notification
      try {
        await sendLineMessage(lineUserId, [
          {
            type: 'text',
            text: messageText,
          },
        ])
      } catch (lineError) {
        console.error('Failed to send LINE message:', lineError)
        // Continue anyway, the database record was created
      }

    } else if (!existingRecord.is_checked_out) {
      // Record exists but not checked out - this is a CHECK-OUT
      isCheckIn = false

      const { data, error } = await supabase
        .from('attendance_checkin')
        .update({
          check_out_time: thailandTime.toISOString(),
          gps_location_out: gpsLocation,
          is_checked_out: true,
        })
        .eq('id', existingRecord.id)
        .select()
        .single()

      if (error) {
        console.error('Database update error:', error)
        return NextResponse.json(
          { success: false, error: 'ไม่สามารถบันทึกข้อมูล Check-out ได้' },
          { status: 500 }
        )
      }

      result = data

      // Calculate work duration
      const checkInTime = new Date(existingRecord.check_in_time)
      const checkOutTime = thailandTime
      const durationMs = checkOutTime.getTime() - checkInTime.getTime()
      const hours = Math.floor(durationMs / (1000 * 60 * 60))
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

      const shiftText = existingRecord.shift === 1 ? 'กะเช้า (08:00-17:00)' : 'กะดึก (20:00-05:00)'
      messageText = `✅ บันทึก Check-out สำเร็จ\n\nชื่อ: ${employee.name}\nรหัสพนักงาน: ${employee.employee_id}\nวันที่: ${formatThaiDate(thailandTime)}\nเวลา Check-out: ${formatThaiTime(thailandTime)}\nกะการทำงาน: ${shiftText}\nระยะเวลาทำงาน: ${hours} ชั่วโมง ${minutes} นาที`

      // Send LINE notification
      try {
        await sendLineMessage(lineUserId, [
          {
            type: 'text',
            text: messageText,
          },
        ])
      } catch (lineError) {
        console.error('Failed to send LINE message:', lineError)
        // Continue anyway, the database record was updated
      }

    } else {
      // Already checked out today
      return NextResponse.json(
        {
          success: false,
          error: 'คุณได้ Check-out เรียบร้อยแล้ววันนี้\nกรุณารอถึงวันพรุ่งนี้สำหรับการ Check-in ครั้งถัดไป'
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: messageText,
      data: result,
      action: isCheckIn ? 'check-in' : 'check-out',
    })

  } catch (error) {
    console.error('Attendance check-in error:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    )
  }
}
