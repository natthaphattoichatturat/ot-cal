import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employees } = body

    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลพนักงานที่ต้องการ import' },
        { status: 400 }
      )
    }

    const results: {
      success: any[]
      failed: { data: any; error: string }[]
      total: number
    } = {
      success: [],
      failed: [],
      total: employees.length,
    }

    for (const emp of employees) {
      try {
        // Validate required fields
        if (!emp.employee_id || !emp.name || !emp.department) {
          results.failed.push({
            data: emp,
            error: 'ข้อมูลไม่ครบ (จำเป็น: รหัสพนักงาน, ชื่อ, แผนก)',
          })
          continue
        }

        // Check if employee already exists
        const { data: existing } = await supabase
          .from('employees')
          .select('employee_id')
          .eq('employee_id', emp.employee_id)
          .single()

        if (existing) {
          results.failed.push({
            data: emp,
            error: 'รหัสพนักงานซ้ำ',
          })
          continue
        }

        // Insert employee
        const { data, error } = await supabase
          .from('employees')
          .insert({
            employee_id: emp.employee_id,
            name: emp.name,
            department: emp.department,
            division_code: emp.division_code || null,
            section_code: emp.section_code || null,
            address: emp.address || null,
            perday_salary: emp.perday_salary || null,
            perhr_salary: emp.perhr_salary || null,
            bank_id: emp.bank_id || null,
            bank_account: emp.bank_account || null,
            identity_id: emp.identity_id || null,
            line_id: emp.line_id || null,
            remarks: emp.remarks || null,
            status: 'active',
          })
          .select()
          .single()

        if (error) {
          results.failed.push({
            data: emp,
            error: error.message,
          })
        } else {
          results.success.push(data)
        }
      } catch (err: any) {
        results.failed.push({
          data: emp,
          error: err.message || 'เกิดข้อผิดพลาด',
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `สำเร็จ ${results.success.length}/${results.total} รายการ`,
    })
  } catch (error) {
    console.error('Import employees error:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในระบบ' },
      { status: 500 }
    )
  }
}
