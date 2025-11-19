import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch income/deduction records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const employeeId = searchParams.get('employee_id')
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const category = searchParams.get('category') // 'income' or 'deduction'

    let query = supabase
      .from('income_deduction_records')
      .select('*')
      .order('pay_period_year', { ascending: false })
      .order('pay_period_month', { ascending: false })
      .order('pay_period', { ascending: false })

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    if (year) {
      query = query.eq('pay_period_year', parseInt(year))
    }

    if (month) {
      query = query.eq('pay_period_month', parseInt(month))
    }

    if (category) {
      query = query.eq('record_type', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching income/deduction records:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch records' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in GET /api/income-deduction:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new income/deduction records
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      employee_ids,
      pay_period_month,
      pay_period_year,
      pay_period,
      record_type,
      item_name,
      amount,
      include_in_sso,
      is_fixed,
      notes,
      created_by,
    } = body

    // Validate required fields
    if (
      !employee_ids ||
      !pay_period_month ||
      !pay_period_year ||
      !pay_period ||
      !record_type ||
      !item_name ||
      amount === undefined
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create records for all selected employees
    const records = employee_ids.map((emp_id: string) => ({
      employee_id: emp_id,
      pay_period_month: parseInt(pay_period_month),
      pay_period_year: parseInt(pay_period_year),
      pay_period: parseInt(pay_period),
      record_type,
      item_name,
      amount: parseFloat(amount),
      include_in_sso: include_in_sso || false,
      is_fixed: is_fixed || false,
      notes: notes || null,
      created_by: created_by || null,
    }))

    const { data, error } = await supabase
      .from('income_deduction_records')
      .insert(records)
      .select()

    if (error) {
      console.error('Error creating income/deduction records:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create records' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in POST /api/income-deduction:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove income/deduction record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing record ID' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('income_deduction_records')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      console.error('Error deleting income/deduction record:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete record' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/income-deduction:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
