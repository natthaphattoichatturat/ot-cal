import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendLineMessage } from '@/lib/lineConfig'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employee_id, meeting_date, meeting_time, meeting_topic, meeting_details } = body

    // Validation
    if (!employee_id || !meeting_date || !meeting_time || !meeting_topic) {
      return NextResponse.json(
        { success: false, error: 'ข้อมูลไม่ครบถ้วน' },
        { status: 400 }
      )
    }

    // Get employee data - need line_id_employ to send to Employee LINE OA
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('employee_id', employee_id)
      .single()

    if (empError || !employee) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลพนักงาน' },
        { status: 404 }
      )
    }

    if (!employee.line_id_employ) {
      return NextResponse.json(
        { success: false, error: 'พนักงานยังไม่ได้ลงทะเบียน Employee LINE OA' },
        { status: 400 }
      )
    }

    // Format date and time for display
    const formattedDate = format(new Date(meeting_date), 'dd MMMM yyyy', { locale: th })
    const timeDisplay = meeting_time.substring(0, 5) // HH:MM

    // Send LINE message to employee via Employee LINE OA
    try {
      await sendLineMessage(employee.line_id_employ, [
        {
          type: 'flex',
          altText: 'นัดหมายคุยส่วนตัว',
          contents: {
            type: 'bubble',
            size: 'mega',
            header: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'นัดหมายคุยส่วนตัว',
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
                      text: 'คุณได้รับการนัดหมายจากฝ่ายบุคคล',
                      size: 'sm',
                      color: '#6B7280',
                      wrap: true
                    }
                  ],
                  paddingBottom: '16px'
                },
                {
                  type: 'separator'
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: 'วันที่',
                      size: 'xs',
                      color: '#6B7280',
                      weight: 'bold'
                    },
                    {
                      type: 'text',
                      text: formattedDate,
                      size: 'md',
                      color: '#1E40AF',
                      weight: 'bold',
                      margin: 'xs'
                    }
                  ],
                  paddingTop: '16px',
                  paddingBottom: '12px'
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: 'เวลา',
                      size: 'xs',
                      color: '#6B7280',
                      weight: 'bold'
                    },
                    {
                      type: 'text',
                      text: `${timeDisplay} น.`,
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
                      text: 'หัวข้อ',
                      size: 'xs',
                      color: '#6B7280',
                      weight: 'bold'
                    },
                    {
                      type: 'text',
                      text: meeting_topic,
                      size: 'md',
                      color: '#111827',
                      weight: 'bold',
                      margin: 'xs',
                      wrap: true
                    }
                  ],
                  paddingBottom: meeting_details ? '12px' : '0px'
                },
                ...(meeting_details ? [{
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: 'รายละเอียดเพิ่มเติม',
                      size: 'xs',
                      color: '#6B7280',
                      weight: 'bold'
                    },
                    {
                      type: 'text',
                      text: meeting_details,
                      size: 'sm',
                      color: '#374151',
                      margin: 'xs',
                      wrap: true
                    }
                  ]
                }] : [])
              ],
              backgroundColor: '#FFFFFF',
              paddingAll: '20px'
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: 'กรุณาเตรียมตัวและมาตรงเวลา',
                      size: 'xs',
                      color: '#6B7280',
                      align: 'center'
                    },
                    {
                      type: 'text',
                      text: 'หากไม่สามารถมาได้ กรุณาแจ้งล่วงหน้า',
                      size: 'xs',
                      color: '#6B7280',
                      align: 'center',
                      margin: 'xs'
                    }
                  ]
                }
              ],
              backgroundColor: '#F3F4F6',
              paddingAll: '16px'
            }
          }
        }
      ])

      return NextResponse.json({
        success: true,
        message: 'ส่งนัดหมายเรียบร้อยแล้ว'
      })
    } catch (msgError) {
      console.error('Failed to send LINE message:', msgError)
      return NextResponse.json(
        { success: false, error: 'ไม่สามารถส่งข้อความทาง LINE ได้' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Schedule meeting error:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในระบบ' },
      { status: 500 }
    )
  }
}
