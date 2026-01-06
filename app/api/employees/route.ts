import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPayrollPeriodFromDate } from '@/lib/payrollPeriod'
import { recalculateEmployeePeriod } from '@/lib/wageRecalculation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET all employees or search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const searchBy = searchParams.get('searchBy') // 'name' or 'employee_id'
    const status = searchParams.get('status') || 'active'
    const includeInactive = searchParams.get('includeInactive') === 'true'

    let query = supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by status
    if (!includeInactive) {
      query = query.eq('status', status)
    }

    // Search functionality
    if (search && searchBy) {
      if (searchBy === 'name') {
        query = query.ilike('name', `%${search}%`)
      } else if (searchBy === 'employee_id') {
        query = query.ilike('employee_id', `%${search}%`)
      } else if (searchBy === 'line_id_employ') {
        query = query.eq('line_id_employ', search)
      } else if (searchBy === 'line_id_hr') {
        query = query.eq('line_id_hr', search)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'ไม่สามารถดึงข้อมูลพนักงานได้' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET employees error:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในระบบ' },
      { status: 500 }
    )
  }
}

// POST - Add new employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      employee_id,
      name,
      department,
      division_code,
      section_code,
      address,
      perday_salary,
      perhr_salary,
      bank_id,
      bank_account,
      identity_id,
      line_id_employ,
      line_id_hr,
      remarks,
    } = body

    if (!employee_id || !name || !department) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกข้อมูลที่จำเป็น (รหัส, ชื่อ, แผนก)' },
        { status: 400 }
      )
    }

    // Check if employee_id already exists
    const { data: existing } = await supabase
      .from('employees')
      .select('employee_id')
      .eq('employee_id', employee_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'รหัสพนักงานนี้มีอยู่ในระบบแล้ว' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('employees')
      .insert({
        employee_id,
        name,
        department,
        division_code,
        section_code,
        address,
        perday_salary,
        perhr_salary,
        bank_id,
        bank_account,
        identity_id,
        line_id_employ,
        line_id_hr,
        remarks,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      return NextResponse.json(
        { success: false, error: 'ไม่สามารถเพิ่มพนักงานได้' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('POST employee error:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในระบบ' },
      { status: 500 }
    )
  }
}

// PUT - Update employee
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, employee_id, updates, recalc } = body

    if (!id && !employee_id) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุ ID หรือรหัสพนักงาน' },
        { status: 400 }
      )
    }

    let query = supabase.from('employees').update(updates)

    if (id) {
      query = query.eq('id', id)
    } else {
      query = query.eq('employee_id', employee_id)
    }

    const { data, error } = await query.select().single()

    if (error) {
      console.error('Database update error:', error)
      return NextResponse.json(
        { success: false, error: 'ไม่สามารถอัพเดทข้อมูลได้' },
        { status: 500 }
      )
    }

    let recalcError: string | null = null
    const wageFields = ['perday_salary', 'perhr_salary', 'monthly_salary', 'employment_type']
    const shouldRecalc = updates && wageFields.some(field => Object.prototype.hasOwnProperty.call(updates, field))

    if (shouldRecalc) {
      try {
        let targetYear: number | null = null
        let targetMonth: number | null = null
        let targetPeriod: 1 | 2 | null = null

        if (recalc && recalc.year && recalc.month && recalc.period) {
          targetYear = Number(recalc.year)
          targetMonth = Number(recalc.month)
          targetPeriod = Number(recalc.period) as 1 | 2
        } else {
          const currentPeriod = getPayrollPeriodFromDate(new Date())
          targetYear = currentPeriod.year
          targetMonth = currentPeriod.month
          targetPeriod = currentPeriod.period
        }

        if (targetYear && targetMonth && targetPeriod) {
          await recalculateEmployeePeriod({
            employeeId: data.employee_id,
            year: targetYear,
            month: targetMonth,
            period: targetPeriod
          })
        }
      } catch (err: any) {
        recalcError = err?.message || 'Failed to recalculate wages'
        console.error('Employee recalc error:', err)
      }
    }

    return NextResponse.json({ success: true, data, recalc_error: recalcError })
  } catch (error) {
    console.error('PUT employee error:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในระบบ' },
      { status: 500 }
    )
  }
}

// DELETE - Remove/Deactivate employee
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { employee_id, removed_by, permanent = false } = body

    if (!employee_id) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุรหัสพนักงาน' },
        { status: 400 }
      )
    }

    if (permanent) {
      // Permanent delete
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('employee_id', employee_id)

      if (error) {
        console.error('Database delete error:', error)
        return NextResponse.json(
          { success: false, error: 'ไม่สามารถลบพนักงานได้' },
          { status: 500 }
        )
      }
    } else {
      // Soft delete - mark as removed
      const { data, error } = await supabase
        .from('employees')
        .update({
          status: 'removed',
          removed_at: new Date().toISOString(),
          removed_by,
        })
        .eq('employee_id', employee_id)
        .select()
        .single()

      if (error) {
        console.error('Database update error:', error)
        return NextResponse.json(
          { success: false, error: 'ไม่สามารถปลดพนักงานได้' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE employee error:', error)
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในระบบ' },
      { status: 500 }
    )
  }
}
