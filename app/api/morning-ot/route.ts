import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET - ดึงข้อมูล OT เช้าของพนักงานในงวดที่เลือก
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const year = parseInt(searchParams.get('year') || '0')
    const month = parseInt(searchParams.get('month') || '0')
    const period = parseInt(searchParams.get('period') || '1')
    const employeeId = searchParams.get('employee_id')

    if (!year || !month) {
      return NextResponse.json(
        { success: false, error: 'Missing year or month parameter' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('morning_ot_allowances')
      .select(`
        *,
        employees!morning_ot_allowances_employee_id_fkey (
          employee_id,
          name,
          department
        )
      `)
      .eq('year', year)
      .eq('month', month)
      .eq('period', period)
      .order('employee_id')

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching morning OT:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error in GET /api/morning-ot:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST - บันทึก OT เช้าให้พนักงาน
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      employee_id,
      year,
      month,
      period,
      allowed_hours,
      calculated_hours,
      selected_dates,
      notes,
      created_by
    } = body

    if (!employee_id || !year || !month || !period) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Upsert: ถ้ามีอยู่แล้วให้ update ถ้าไม่มีให้ insert
    const { data, error } = await supabase
      .from('morning_ot_allowances')
      .upsert({
        employee_id,
        year,
        month,
        period,
        allowed_hours: parseFloat(allowed_hours) || 0,
        calculated_hours: parseFloat(calculated_hours) || 0,
        selected_dates: selected_dates || null, // วันที่ที่ user เลือก (null = ทุกวัน)
        notes,
        created_by
      }, {
        onConflict: 'employee_id,year,month,period'
      })
      .select()

    if (error) {
      console.error('Error saving morning OT:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error in POST /api/morning-ot:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT - อัพเดท OT เช้าหลายคนพร้อมกัน (batch update)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { year, month, period, allowances } = body

    if (!year || !month || !period || !allowances || !Array.isArray(allowances)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Prepare records for upsert
    const records = allowances.map((item: any) => ({
      employee_id: item.employee_id,
      year,
      month,
      period,
      allowed_hours: parseFloat(item.allowed_hours) || 0,
      calculated_hours: parseFloat(item.calculated_hours) || 0,
      selected_dates: item.selected_dates || null, // วันที่ที่ user เลือก (null = ทุกวัน)
      notes: item.notes || null,
      created_by: item.created_by || 'admin'
    }))

    const { data, error } = await supabase
      .from('morning_ot_allowances')
      .upsert(records, {
        onConflict: 'employee_id,year,month,period'
      })
      .select()

    if (error) {
      console.error('Error batch updating morning OT:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: `อัพเดท OT เช้าสำเร็จ ${records.length} รายการ`
    })
  } catch (error: any) {
    console.error('Error in PUT /api/morning-ot:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE - ลบ OT เช้า
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const id = searchParams.get('id')
    const employeeId = searchParams.get('employee_id')
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const period = searchParams.get('period')

    if (id) {
      // ลบตาม ID
      const { error } = await supabase
        .from('morning_ot_allowances')
        .delete()
        .eq('id', parseInt(id))

      if (error) throw error
    } else if (employeeId && year && month && period) {
      // ลบตาม composite key
      const { error } = await supabase
        .from('morning_ot_allowances')
        .delete()
        .eq('employee_id', employeeId)
        .eq('year', parseInt(year))
        .eq('month', parseInt(month))
        .eq('period', parseInt(period))

      if (error) throw error
    } else {
      return NextResponse.json(
        { success: false, error: 'Missing id or composite key' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/morning-ot:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
