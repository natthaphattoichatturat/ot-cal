import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendHRLineMessage } from '@/lib/lineConfig'

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
        created_by: employee.line_id_employ,
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

    // Get all department heads (หัวหน้าแผนก) - need line_id_employ for Employee LINE OA
    const { data: departmentHeads, error: headError} = await supabase
      .from('employees')
      .select('line_id_employ, name, employee_id')
      .eq('department', 'หัวหน้าแผนก')
      .not('line_id_employ', 'is', null)

    // Get all HR admins for notification only
    const { data: hrAdmins } = await supabase
      .from('employees')
      .select('line_id_hr, name')
      .eq('department', 'admin_etec')
      .not('line_id_hr', 'is', null)

    const leaveTypeMap: any = {
      'sick': 'ลาป่วย',
      'vacation': 'ลาพักร้อน',
      'personal': 'ลากิจ',
      'other': 'อื่นๆ'
    }

    const leaveTypeColor: any = {
      'sick': '#EF4444',
      'vacation': '#3B82F6',
      'personal': '#F59E0B',
      'other': '#6B7280'
    }

    // Send approval request to department heads via Employee LINE OA
    if (!headError && departmentHeads && departmentHeads.length > 0) {
      const { sendEmployeeLineMessage } = await import('@/lib/lineConfig')

      for (const head of departmentHeads) {
        try {
          await sendEmployeeLineMessage(head.line_id_employ, [
            {
              type: 'flex',
              altText: 'คำขออนุมัติการลางาน',
              contents: {
                type: 'bubble',
                size: 'mega',
                header: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: '📋 คำขออนุมัติการลางาน',
                      weight: 'bold',
                      size: 'xl',
                      color: '#FFFFFF',
                      align: 'center'
                    }
                  ],
                  backgroundColor: '#1E40AF',
                  paddingAll: '20px'
                },
                body: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'box',
                      layout: 'vertical',
                      contents: [
                        {
                          type: 'text',
                          text: 'รหัสพนักงาน',
                          size: 'xs',
                          color: '#6B7280',
                          weight: 'bold'
                        },
                        {
                          type: 'text',
                          text: employeeId,
                          size: 'md',
                          color: '#1E40AF',
                          weight: 'bold',
                          margin: 'xs'
                        }
                      ],
                      paddingBottom: '12px'
                    },
                    {
                      type: 'box',
                      layout: 'vertical',
                      contents: [
                        {
                          type: 'text',
                          text: 'ชื่อพนักงาน',
                          size: 'xs',
                          color: '#6B7280',
                          weight: 'bold'
                        },
                        {
                          type: 'text',
                          text: employee.name,
                          size: 'md',
                          color: '#111827',
                          weight: 'bold',
                          margin: 'xs'
                        }
                      ],
                      paddingBottom: '12px'
                    },
                    {
                      type: 'separator',
                      margin: 'md'
                    },
                    {
                      type: 'box',
                      layout: 'vertical',
                      contents: [
                        {
                          type: 'text',
                          text: 'วันที่ลา',
                          size: 'xs',
                          color: '#6B7280',
                          weight: 'bold'
                        },
                        {
                          type: 'text',
                          text: leaveDate,
                          size: 'lg',
                          color: '#1E40AF',
                          weight: 'bold',
                          margin: 'xs'
                        }
                      ],
                      paddingTop: '12px',
                      paddingBottom: '12px'
                    },
                    {
                      type: 'box',
                      layout: 'vertical',
                      contents: [
                        {
                          type: 'text',
                          text: 'ประเภทการลา',
                          size: 'xs',
                          color: '#6B7280',
                          weight: 'bold'
                        },
                        {
                          type: 'text',
                          text: leaveTypeMap[leaveType] || leaveType,
                          size: 'md',
                          color: leaveTypeColor[leaveType] || '#6B7280',
                          weight: 'bold',
                          margin: 'xs'
                        }
                      ],
                      paddingBottom: '12px'
                    },
                    {
                      type: 'box',
                      layout: 'vertical',
                      contents: [
                        {
                          type: 'text',
                          text: 'เหตุผลการลา',
                          size: 'xs',
                          color: '#6B7280',
                          weight: 'bold'
                        },
                        {
                          type: 'text',
                          text: reason || 'ไม่ระบุ',
                          size: 'sm',
                          color: '#374151',
                          margin: 'xs',
                          wrap: true
                        }
                      ]
                    }
                  ],
                  backgroundColor: '#FFFFFF',
                  paddingAll: '20px'
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
                        data: `action=approve&leaveId=${leaveRecord.id}&employeeId=${employeeId}&approver=${head.employee_id}`,
                        displayText: 'อนุมัติการลา'
                      },
                      style: 'primary',
                      color: '#10B981',
                      height: 'sm'
                    },
                    {
                      type: 'button',
                      action: {
                        type: 'postback',
                        label: '❌ ไม่อนุมัติ',
                        data: `action=reject&leaveId=${leaveRecord.id}&employeeId=${employeeId}&approver=${head.employee_id}`,
                        displayText: 'ไม่อนุมัติการลา'
                      },
                      style: 'primary',
                      color: '#EF4444',
                      height: 'sm',
                      margin: 'sm'
                    }
                  ],
                  spacing: 'sm',
                  backgroundColor: '#F3F4F6',
                  paddingAll: '16px'
                }
              }
            }
          ])
        } catch (msgError) {
          console.error(`Failed to send message to department head ${head.line_id_employ}:`, msgError)
        }
      }
    }

    // Send notification to HR admins (information only, no approval buttons)
    if (hrAdmins && hrAdmins.length > 0) {
      for (const admin of hrAdmins) {
        try {
          await sendHRLineMessage(admin.line_id_hr, [
            {
              type: 'flex',
              altText: 'แจ้งเตือนการลางาน',
              contents: {
                type: 'bubble',
                size: 'mega',
                header: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: '🔔 แจ้งเตือนการลางาน',
                      weight: 'bold',
                      size: 'xl',
                      color: '#FFFFFF',
                      align: 'center'
                    }
                  ],
                  backgroundColor: '#3B82F6',
                  paddingAll: '20px'
                },
                body: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: 'มีการขอลางานใหม่',
                      size: 'md',
                      weight: 'bold',
                      color: '#111827',
                      margin: 'none'
                    },
                    {
                      type: 'separator',
                      margin: 'md'
                    },
                    {
                      type: 'box',
                      layout: 'vertical',
                      contents: [
                        {
                          type: 'text',
                          text: 'รหัสพนักงาน',
                          size: 'xs',
                          color: '#6B7280',
                          weight: 'bold'
                        },
                        {
                          type: 'text',
                          text: employeeId,
                          size: 'md',
                          color: '#1E40AF',
                          weight: 'bold',
                          margin: 'xs'
                        }
                      ],
                      paddingTop: '12px',
                      paddingBottom: '12px'
                    },
                    {
                      type: 'box',
                      layout: 'vertical',
                      contents: [
                        {
                          type: 'text',
                          text: 'ชื่อพนักงาน',
                          size: 'xs',
                          color: '#6B7280',
                          weight: 'bold'
                        },
                        {
                          type: 'text',
                          text: employee.name,
                          size: 'md',
                          color: '#111827',
                          weight: 'bold',
                          margin: 'xs'
                        }
                      ],
                      paddingBottom: '12px'
                    },
                    {
                      type: 'box',
                      layout: 'vertical',
                      contents: [
                        {
                          type: 'text',
                          text: 'วันที่ลา',
                          size: 'xs',
                          color: '#6B7280',
                          weight: 'bold'
                        },
                        {
                          type: 'text',
                          text: leaveDate,
                          size: 'md',
                          color: '#111827',
                          margin: 'xs'
                        }
                      ],
                      paddingBottom: '12px'
                    },
                    {
                      type: 'box',
                      layout: 'vertical',
                      contents: [
                        {
                          type: 'text',
                          text: 'ประเภทการลา',
                          size: 'xs',
                          color: '#6B7280',
                          weight: 'bold'
                        },
                        {
                          type: 'text',
                          text: leaveTypeMap[leaveType] || leaveType,
                          size: 'md',
                          color: leaveTypeColor[leaveType] || '#6B7280',
                          margin: 'xs'
                        }
                      ],
                      paddingBottom: '12px'
                    },
                    {
                      type: 'box',
                      layout: 'vertical',
                      contents: [
                        {
                          type: 'text',
                          text: 'เหตุผล',
                          size: 'xs',
                          color: '#6B7280',
                          weight: 'bold'
                        },
                        {
                          type: 'text',
                          text: reason || 'ไม่ระบุ',
                          size: 'sm',
                          color: '#374151',
                          margin: 'xs',
                          wrap: true
                        }
                      ],
                      paddingBottom: '12px'
                    },
                    {
                      type: 'box',
                      layout: 'vertical',
                      contents: [
                        {
                          type: 'text',
                          text: 'สถานะ',
                          size: 'xs',
                          color: '#6B7280',
                          weight: 'bold'
                        },
                        {
                          type: 'text',
                          text: 'รออนุมัติจากหัวหน้าแผนก',
                          size: 'sm',
                          color: '#F59E0B',
                          margin: 'xs',
                          weight: 'bold'
                        }
                      ]
                    }
                  ],
                  backgroundColor: '#FFFFFF',
                  paddingAll: '20px'
                }
              }
            }
          ])
        } catch (msgError) {
          console.error(`Failed to send notification to HR ${admin.line_id_hr}:`, msgError)
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
