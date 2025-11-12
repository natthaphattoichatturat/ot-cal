import { NextRequest, NextResponse } from 'next/server'
import { checkHRPermission } from '@/lib/hrPermission'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lineUserId } = body

    if (!lineUserId) {
      return NextResponse.json(
        { allowed: false, error: 'ไม่พบ LINE User ID' },
        { status: 400 }
      )
    }

    const result = await checkHRPermission(lineUserId)

    return NextResponse.json({
      allowed: result.allowed,
      error: result.error,
      employee: result.employee ? {
        employee_id: result.employee.employee_id,
        name: result.employee.name,
        department: result.employee.department,
      } : undefined,
    })
  } catch (error) {
    console.error('Permission check error:', error)
    return NextResponse.json(
      { allowed: false, error: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์' },
      { status: 500 }
    )
  }
}
