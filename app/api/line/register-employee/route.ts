import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lineUserId, identityId, name, employeeId } = body

    // Validation
    if (!lineUserId || !identityId || !name) {
      return NextResponse.json(
        { success: false, error: 'ข้อมูลไม่ครบถ้วน' },
        { status: 400 }
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

    let employeeRecord = null

    // Case 1: Search by employee_id if provided
    if (employeeId) {
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', employeeId)
        .single()

      employeeRecord = data
    }

    // Case 2: If not found or employeeId not provided, search by identity_id
    if (!employeeRecord) {
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('identity_id', identityId)
        .single()

      employeeRecord = data
    }

    // If employee found, update with LINE ID
    if (employeeRecord) {
      const { error: updateError } = await supabase
        .from('employees')
        .update({
          line_id: lineUserId,
          name: name, // Update name as well
          updated_at: new Date().toISOString(),
        })
        .eq('id', employeeRecord.id)

      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json(
          { success: false, error: 'ไม่สามารถอัพเดทข้อมูลได้' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'ลงทะเบียนสำเร็จ',
        employee: {
          employeeId: employeeRecord.employee_id,
          name: name,
          department: employeeRecord.department,
        },
      })
    } else {
      // Employee not found
      return NextResponse.json(
        {
          success: false,
          error: 'ไม่พบข้อมูลพนักงาน กรุณาตรวจสอบรหัสพนักงานหรือเลขบัตรประชาชนอีกครั้ง',
        },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในระบบ' },
      { status: 500 }
    )
  }
}
