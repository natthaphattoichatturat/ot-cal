import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendLineMessage, LINE_CONFIG } from '@/lib/lineConfig'
import crypto from 'crypto'

// Verify LINE signature
function verifySignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('SHA256', LINE_CONFIG.channelSecret)
    .update(body)
    .digest('base64')
  return hash === signature
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-line-signature')
    const bodyText = await request.text()

    // Verify signature
    if (!signature || !verifySignature(bodyText, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(bodyText)
    const events = body.events || []

    for (const event of events) {
      if (event.type === 'postback') {
        await handlePostback(event)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handlePostback(event: any) {
  const data = event.postback.data
  const params = new URLSearchParams(data)
  const action = params.get('action')
  const leaveId = params.get('leaveId')
  const employeeId = params.get('employeeId')

  if (!action || !leaveId || !employeeId) {
    console.error('Invalid postback data:', data)
    return
  }

  // Get leave record
  const { data: leaveRecord, error: leaveError } = await supabase
    .from('leave_records')
    .select('*')
    .eq('id', leaveId)
    .single()

  if (leaveError || !leaveRecord) {
    console.error('Leave record not found:', leaveId)
    return
  }

  // Get employee info
  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('*')
    .eq('employee_id', employeeId)
    .single()

  if (empError || !employee || !employee.line_id) {
    console.error('Employee not found or no LINE ID:', employeeId)
    return
  }

  if (action === 'approve') {
    // Update leave record to approved
    const { error: updateError } = await supabase
      .from('leave_records')
      .update({
        leave_able: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leaveId)

    if (updateError) {
      console.error('Failed to update leave record:', updateError)
      return
    }

    // Update daily_attendance to mark as leave
    const { error: attendanceError } = await supabase
      .from('daily_attendance')
      .upsert({
        employee_id: employeeId,
        work_date: leaveRecord.leave_date,
        is_leave: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'employee_id,work_date'
      })

    if (attendanceError) {
      console.error('Failed to update attendance:', attendanceError)
    }

    // Send approval notification to employee
    try {
      await sendLineMessage(employee.line_id, [
        {
          type: 'text',
          text: `✅ การลาของคุณได้รับการอนุมัติแล้ว\n\nวันที่: ${leaveRecord.leave_date}\nประเภท: ${leaveRecord.leave_type}\n\nขอให้มีความสุขในวันลา!`
        }
      ])
    } catch (msgError) {
      console.error('Failed to send approval message:', msgError)
    }

  } else if (action === 'reject') {
    // For rejection, we need to get the reason from the admin
    // Since LINE postback doesn't support text input, we'll send a simple rejection
    const { error: updateError } = await supabase
      .from('leave_records')
      .update({
        leave_able: false,
        rejected_reason: 'ไม่อนุมัติโดยผู้จัดการ',
        updated_at: new Date().toISOString(),
      })
      .eq('id', leaveId)

    if (updateError) {
      console.error('Failed to update leave record:', updateError)
      return
    }

    // Send rejection notification to employee
    try {
      await sendLineMessage(employee.line_id, [
        {
          type: 'text',
          text: `❌ ขออภัย การลาของคุณไม่ได้รับการอนุมัติ\n\nวันที่: ${leaveRecord.leave_date}\nประเภท: ${leaveRecord.leave_type}\n\nหากต้องการลา กรุณากรอกแบบฟอร์มใหม่อีกครั้ง`
        }
      ])
    } catch (msgError) {
      console.error('Failed to send rejection message:', msgError)
    }
  }
}
