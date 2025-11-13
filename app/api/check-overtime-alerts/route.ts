import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendLineMessage } from '@/lib/lineConfig'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// API Route to check and send alerts for employees who haven't checked out after 12 hours
export async function GET() {
  try {
    // Get current Thailand time
    const now = new Date()
    const thailandTime = new Date(now.getTime() + (7 * 60 * 60 * 1000))
    const currentDate = thailandTime.toISOString().split('T')[0]

    // Get all check-ins from today that haven't been checked out yet
    const { data: activeCheckIns, error } = await supabase
      .from('attendance_checkin')
      .select('*, employees!inner(name, line_id_employ)')
      .eq('work_date', currentDate)
      .eq('is_checked_out', false)

    if (error) {
      console.error('Error fetching active check-ins:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (!activeCheckIns || activeCheckIns.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active check-ins found',
        alerts_sent: 0
      })
    }

    const alerts = []

    for (const checkIn of activeCheckIns) {
      const checkInTime = new Date(checkIn.check_in_time)
      const hoursSinceCheckIn = (thailandTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)

      // If more than 12 hours and employee has LINE ID
      if (hoursSinceCheckIn > 12 && checkIn.employees?.line_id_employ) {
        try {
          const hoursWorked = Math.floor(hoursSinceCheckIn)
          const minutesWorked = Math.floor((hoursSinceCheckIn % 1) * 60)

          // Send professional notification
          await sendLineMessage(checkIn.employees.line_id_employ, [
            {
              type: 'flex',
              altText: 'แจ้งเตือน: กรุณาบันทึกเวลาออกงาน',
              contents: {
                type: 'bubble',
                size: 'mega',
                header: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: 'ATTENDANCE ALERT',
                      weight: 'bold',
                      size: 'lg',
                      color: '#FFFFFF',
                      align: 'center'
                    },
                    {
                      type: 'text',
                      text: 'แจ้งเตือนการบันทึกเวลา',
                      size: 'sm',
                      color: '#FFFFFF',
                      align: 'center',
                      margin: 'xs'
                    }
                  ],
                  backgroundColor: '#EF4444',
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
                          text: 'เรียน คุณ' + checkIn.employees.name,
                          size: 'md',
                          color: '#1F2937',
                          weight: 'bold'
                        },
                        {
                          type: 'text',
                          text: 'พนักงานหมายเลข: ' + checkIn.employee_id,
                          size: 'sm',
                          color: '#6B7280',
                          margin: 'xs'
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
                          text: 'ระบบตรวจพบว่าท่านได้บันทึกเวลาเข้างานแล้ว',
                          size: 'sm',
                          color: '#374151',
                          wrap: true
                        },
                        {
                          type: 'text',
                          text: 'แต่ยังไม่ได้บันทึกเวลาออกงาน',
                          size: 'sm',
                          color: '#EF4444',
                          weight: 'bold',
                          wrap: true,
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
                          type: 'box',
                          layout: 'horizontal',
                          contents: [
                            {
                              type: 'text',
                              text: 'เวลาเข้างาน',
                              size: 'xs',
                              color: '#6B7280',
                              flex: 0
                            },
                            {
                              type: 'text',
                              text: formatThaiTime(checkInTime),
                              size: 'sm',
                              color: '#1F2937',
                              weight: 'bold',
                              align: 'end'
                            }
                          ],
                          margin: 'md'
                        },
                        {
                          type: 'box',
                          layout: 'horizontal',
                          contents: [
                            {
                              type: 'text',
                              text: 'ระยะเวลาทำงาน',
                              size: 'xs',
                              color: '#6B7280',
                              flex: 0
                            },
                            {
                              type: 'text',
                              text: `${hoursWorked} ชั่วโมง ${minutesWorked} นาที`,
                              size: 'sm',
                              color: '#EF4444',
                              weight: 'bold',
                              align: 'end'
                            }
                          ],
                          margin: 'sm'
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
                      type: 'box',
                      layout: 'vertical',
                      contents: [
                        {
                          type: 'text',
                          text: 'กรุณาบันทึกเวลาออกงานโดยเร็วที่สุด',
                          size: 'sm',
                          color: '#374151',
                          align: 'center',
                          weight: 'bold'
                        },
                        {
                          type: 'text',
                          text: 'เพื่อความถูกต้องของข้อมูลการทำงาน',
                          size: 'xs',
                          color: '#6B7280',
                          align: 'center',
                          margin: 'xs'
                        }
                      ]
                    }
                  ],
                  backgroundColor: '#FEF3C7',
                  paddingAll: '16px'
                }
              }
            }
          ])

          alerts.push({
            employee_id: checkIn.employee_id,
            employee_name: checkIn.employees.name,
            hours_since_checkin: hoursSinceCheckIn.toFixed(2),
            alert_sent: true
          })
        } catch (msgError) {
          console.error(`Failed to send alert to ${checkIn.employee_id}:`, msgError)
          alerts.push({
            employee_id: checkIn.employee_id,
            employee_name: checkIn.employees?.name,
            hours_since_checkin: hoursSinceCheckIn.toFixed(2),
            alert_sent: false,
            error: (msgError as Error).message
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Checked ${activeCheckIns.length} active check-ins, sent ${alerts.length} alerts`,
      alerts: alerts,
      alerts_sent: alerts.filter(a => a.alert_sent).length
    })
  } catch (error) {
    console.error('Check overtime alerts error:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในระบบ' },
      { status: 500 }
    )
  }
}

function formatThaiTime(date: Date): string {
  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}
