import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lineUserId, employeeId, identityId } = body

    // Validation
    if (!lineUserId || !employeeId) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุ LINE User ID และรหัสพนักงาน' },
        { status: 400 }
      )
    }

    // Check if Employee LINE ID already registered
    const { data: existingLineUser } = await supabase
      .from('employees')
      .select('*')
      .eq('line_id_employ', lineUserId)
      .single()

    if (existingLineUser) {
      return NextResponse.json(
        { success: false, error: 'LINE ID นี้ได้ลงทะเบียนแล้ว' },
        { status: 400 }
      )
    }

    // Search by employee_id (primary method)
    const { data: employeeRecord } = await supabase
      .from('employees')
      .select('*')
      .eq('employee_id', employeeId)
      .single()

    // If employee found, update with Employee LINE ID
    if (employeeRecord) {
      const updateData: any = {
        line_id_employ: lineUserId,
        updated_at: new Date().toISOString(),
      }

      // อัพเดท identity_id ถ้ามีการระบุมา
      if (identityId) {
        updateData.identity_id = identityId
      }

      const { error: updateError } = await supabase
        .from('employees')
        .update(updateData)
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
          name: employeeRecord.name,
          department: employeeRecord.department,
        },
      })
    } else {
      // Employee not found
      return NextResponse.json(
        {
          success: false,
          error: 'ไม่พบข้อมูลพนักงานตามรหัสที่ระบุ กรุณาตรวจสอบรหัสพนักงานอีกครั้ง',
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
