import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET single employee by ID or employee_id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Try to get by employee_id first (most common case)
    let { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('employee_id', id)
      .single()

    // If not found and id is numeric, try searching by primary key id
    if (error && !isNaN(Number(id))) {
      const result = await supabase
        .from('employees')
        .select('*')
        .eq('id', Number(id))
        .single()

      data = result.data
      error = result.error
    }

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลพนักงาน' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET employee error:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในระบบ' },
      { status: 500 }
    )
  }
}
