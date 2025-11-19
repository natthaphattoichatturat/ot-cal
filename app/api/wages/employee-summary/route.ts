import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const employeeId = searchParams.get('employee_id')
    const year = searchParams.get('year') || new Date().getFullYear().toString()

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: 'Missing employee_id parameter' },
        { status: 400 }
      )
    }

    // Fetch wage summary records for the employee
    const { data: wageRecords, error } = await supabase
      .from('wage_summary')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('year', parseInt(year))
      .order('month', { ascending: true })
      .order('period', { ascending: true })

    if (error) {
      console.error('Error fetching wage summary:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch wage summary' },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const summaries = (wageRecords || []).map((record: any) => ({
      period: record.period,
      month: record.month,
      year: record.year,
      base_wage: record.base_wage || 0,
      ot_wage: record.ot_wage || 0,
      total_income: record.total_income || 0,
      sso: record.sso || 0,
      tax: record.tax || 0,
      total_deduction: record.total_deduction || 0,
      net_wage: record.net_wage || 0,
    }))

    return NextResponse.json({ success: true, data: summaries })
  } catch (error) {
    console.error('Error in GET /api/wages/employee-summary:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

