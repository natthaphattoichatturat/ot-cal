import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { LINE_CONFIG } from '@/lib/lineConfig'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lineUserId, password, employeeId, name, identityId } = body

    // Validation
    if (!lineUserId || !password || !employeeId || !name || !identityId) {
      return NextResponse.json(
        { success: false, error: 'ข้อมูลไม่ครบถ้วน' },
        { status: 400 }
      )
    }

    // Check password
    if (password !== LINE_CONFIG.adminPassword) {
      return NextResponse.json(
        { success: false, error: 'รหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    // Check if LINE ID already registered
    const { data: existingLineUser } = await supabase
      .from('employees')
      .select('*')
      .eq('line_id', lineUserId)
      .single()

    if (existingLineUser) {
      return NextResponse.json(
        { success: false, error: 'LINE ID นี้ได้ลงทะเบียนแล้ว' },
        { status: 400 }
      )
    }

    // Check if employee_id already exists
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('*')
      .eq('employee_id', employeeId)
      .single()

    if (existingEmployee) {
      return NextResponse.json(
        { success: false, error: 'รหัสพนักงานนี้มีอยู่ในระบบแล้ว' },
        { status: 400 }
      )
    }

    // Create new admin employee
    const { data: newAdmin, error: insertError } = await supabase
      .from('employees')
      .insert({
        employee_id: employeeId,
        name: name,
        department: 'admin_etec',
        identity_id: identityId,
        line_id: lineUserId,
        perday_salary: null,
        perhr_salary: null,
        bank_id: null,
        bank_account: null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { success: false, error: 'ไม่สามารถสร้างบัญชี Admin ได้' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'ลงทะเบียน Admin สำเร็จ',
      admin: {
        employeeId: newAdmin.employee_id,
        name: newAdmin.name,
        department: newAdmin.department,
      },
    })
  } catch (error) {
    console.error('Admin registration error:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในระบบ' },
      { status: 500 }
    )
  }
}
