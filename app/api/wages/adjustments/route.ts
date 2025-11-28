import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * API สำหรับจัดการเงินเพิ่ม/เงินหัก (wage_adjustments)
 */

// GET: ดึงรายการเงินเพิ่ม/หัก
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const employeeId = searchParams.get('employee_id')
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const period = searchParams.get('period')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let query = supabase
      .from('wage_adjustments')
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

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || []
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
        created_by
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Wage adjustment added successfully',
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
      message: 'Wage adjustment deleted successfully'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

