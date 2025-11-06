import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendLineMessage } from '@/lib/lineConfig'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lineUserId, employeeId, leaveDate, leaveType, reason } = body

    // Validation
    if (!lineUserId || !employeeId || !leaveDate || !leaveType) {
      return NextResponse.json(
        { success: false, error: 'ข้อมูลไม่ครบถ้วน' },
        { status: 400 }
      )
    }

    // Verify employee exists
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('employee_id', employeeId)
      .single()

    if (empError || !employee) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลพนักงาน' },
        { status: 404 }
      )
    }

    // Check if leave request already exists for this date
    const { data: existingLeave } = await supabase
      .from('leave_records')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('leave_date', leaveDate)
      .single()

    if (existingLeave) {
      return NextResponse.json(
        { success: false, error: 'มีการขอลาสำหรับวันที่นี้แล้ว' },
        { status: 400 }
      )
    }

    // Insert leave request
    const { data: leaveRecord, error: insertError } = await supabase
      .from('leave_records')
      .insert({
        employee_id: employeeId,
        leave_date: leaveDate,
        leave_type: leaveType,
        reason: reason || null,
        leave_able: false, // Default to not approved
        created_by: employee.line_id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert leave error:', insertError)
      return NextResponse.json(
        { success: false, error: 'ไม่สามารถบันทึกการลาได้' },
        { status: 500 }
      )
    }

    // Get all admins
    const { data: admins, error: adminError } = await supabase
      .from('employees')
      .select('line_id, name')
      .eq('department', 'admin_etec')
      .not('line_id', 'is', null)

    if (!adminError && admins && admins.length > 0) {
      // Send approval request to all admins
      const leaveTypeMap: any = {
        'sick': 'ลาป่วย',
        'vacation': 'ลาพักร้อน',
        'personal': 'ลากิจ',
        'other': 'อื่นๆ'
      }

      for (const admin of admins) {
        try {
          await sendLineMessage(admin.line_id, [
            {
              type: 'flex',
              altText: 'คำขอลางาน',
              contents: {
                type: 'bubble',
                header: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: '📋 คำขอลางาน',
                      weight: 'bold',
                      size: 'xl',
                      color: '#ffffff'
                    }
                  ],
                  backgroundColor: '#2C5AA0'
                },
                body: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: `รหัสพนักงาน: ${employeeId}`,
                      size: 'sm',
                      margin: 'md'
                    },
                    {
                      type: 'text',
                      text: `ชื่อ: ${employee.name}`,
                      size: 'sm',
                      margin: 'md'
                    },
                    {
                      type: 'text',
                      text: `วันที่ลา: ${leaveDate}`,
                      size: 'sm',
                      margin: 'md',
                      weight: 'bold'
                    },
                    {
                      type: 'text',
                      text: `ประเภท: ${leaveTypeMap[leaveType] || leaveType}`,
                      size: 'sm',
                      margin: 'md'
                    },
                    {
                      type: 'text',
                      text: `เหตุผล: ${reason || '-'}`,
                      size: 'sm',
                      margin: 'md',
                      wrap: true
                    }
                  ]
                },
                footer: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'button',
                      action: {
                        type: 'postback',
                        label: '✅ อนุมัติ',
                        data: `action=approve&leaveId=${leaveRecord.id}&employeeId=${employeeId}`,
                        displayText: 'อนุมัติการลา'
                      },
                      style: 'primary',
                      color: '#48BB78'
                    },
                    {
                      type: 'button',
                      action: {
                        type: 'postback',
                        label: '❌ ไม่อนุมัติ',
                        data: `action=reject&leaveId=${leaveRecord.id}&employeeId=${employeeId}`,
                        displayText: 'ไม่อนุมัติการลา'
                      },
                      style: 'primary',
                      color: '#F56565',
                      margin: 'sm'
                    }
                  ]
                }
              }
            }
          ])
        } catch (msgError) {
          console.error(`Failed to send message to admin ${admin.line_id}:`, msgError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'ส่งคำขอลาสำเร็จ รอการอนุมัติจากผู้จัดการ',
      leaveRecord: {
        id: leaveRecord.id,
        employeeId: leaveRecord.employee_id,
        leaveDate: leaveRecord.leave_date,
        leaveType: leaveRecord.leave_type,
      },
    })
  } catch (error) {
    console.error('Submit leave error:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในระบบ' },
      { status: 500 }
    )
  }
}
