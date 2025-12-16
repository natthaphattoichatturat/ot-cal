import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * API สำหรับจัดการเงินเพิ่ม/เงินหัก (wage_adjustments)
 * รองรับ CRUD และแสดง auto adjustments
 */

// GET: ดึงรายการเงินเพิ่ม/เงินหัก (รองรับ includeAuto และ periods)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const employeeId = searchParams.get('employee_id')
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const period = searchParams.get('period')
    const periods = searchParams.get('periods') // "1,2"
    const includeAuto = searchParams.get('includeAuto') === 'true'

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ถ้า includeAuto = true ให้ใช้ view wage_adjustments_combined
    if (includeAuto) {
      try {
        let query = supabase
          .from('wage_adjustments_combined')
          .select('*')
          .order('created_at', { ascending: false })

        if (employeeId) {
          query = query.eq('employee_id', employeeId)
        }
        if (year) {
          query = query.eq('year', parseInt(year))
        }
        if (month) {
          query = query.eq('month', parseInt(month))
        }
        if (period) {
          query = query.eq('period', parseInt(period))
        }
        if (periods) {
          const periodArray = periods.split(',').map(p => parseInt(p.trim()))
          query = query.in('period', periodArray)
        }

        const { data, error } = await query

        if (error) {
          // ถ้า view ไม่มี ให้ fallback เป็น manual adjustments เฉยๆ
          console.warn('wage_adjustments_combined view not found, falling back to manual adjustments only:', error.message)
        } else {
          return NextResponse.json({
            success: true,
            data: data || []
          })
        }
      } catch (error) {
        console.warn('Error accessing wage_adjustments_combined view, falling back to manual adjustments only:', error instanceof Error ? error.message : String(error))
      }
    }

    // ถ้าไม่ includeAuto ให้ดึงแค่ manual adjustments พร้อมข้อมูลพนักงาน
    let query = supabase
      .from('wage_adjustments')
      .select(`
        *,
        employees (
          name,
          department
        )
      `)
      .order('created_at', { ascending: false })

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }
    if (year) {
      query = query.eq('year', parseInt(year))
    }
    if (month) {
      query = query.eq('month', parseInt(month))
    }
    if (period) {
      query = query.eq('period', parseInt(period))
    }
    if (periods) {
      const periodArray = periods.split(',').map(p => parseInt(p.trim()))
      query = query.in('period', periodArray)
    }

    const { data: adjustments, error } = await query

    if (error) throw error

    // Map ข้อมูลให้มี format เดียวกับ view
    const mapped = (adjustments || []).map(adj => {
      const employee = Array.isArray(adj.employees) ? adj.employees[0] : adj.employees

      return {
        source_type: 'manual',
        id: adj.id,
        employee_id: adj.employee_id,
        employee_name: employee?.name || 'Unknown',
        department: employee?.department || 'ไม่ระบุ',
        year: adj.year,
        month: adj.month,
        period: adj.period,
        adjustment_type: adj.adjustment_type,
        category: adj.category,
        amount: adj.amount,
        description: adj.description,
        details: null,
        created_at: adj.created_at,
        performed_by: adj.created_by || 'Unknown',
        can_edit: true,
        can_delete: true
      }
    })

    return NextResponse.json({
      success: true,
      data: mapped
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// POST: เพิ่มเงินเพิ่ม/เงินหัก
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      employee_id,
      year,
      month,
      period,
      adjustment_type, // 'income' หรือ 'deduction'
      category,
      amount,
      description,
      created_by
    } = body

    // Validation
    if (!employee_id || !year || !month || !period || !adjustment_type || !category || amount === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    if (!['income', 'deduction'].includes(adjustment_type)) {
      return NextResponse.json({
        success: false,
        error: 'adjustment_type must be "income" or "deduction"'
      }, { status: 400 })
    }

    if (![1, 2].includes(period)) {
      return NextResponse.json({
        success: false,
        error: 'period must be 1 or 2'
      }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('wage_adjustments')
      .insert({
        employee_id,
        year,
        month,
        period,
        adjustment_type,
        category,
        amount: parseFloat(amount),
        description,
        created_by: created_by || 'admin'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'เพิ่มรายการสำเร็จ',
      data
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// PUT: แก้ไขเงินเพิ่ม/เงินหัก
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      category,
      amount,
      description
    } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing adjustment ID'
      }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const updateData: any = {}
    if (category !== undefined) updateData.category = category
    if (amount !== undefined) updateData.amount = parseFloat(amount)
    if (description !== undefined) updateData.description = description

    const { data, error } = await supabase
      .from('wage_adjustments')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'แก้ไขรายการสำเร็จ',
      data
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// DELETE: ลบเงินเพิ่ม/เงินหัก
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing id parameter'
      }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase
      .from('wage_adjustments')
      .delete()
      .eq('id', parseInt(id))

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'ลบรายการสำเร็จ'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
