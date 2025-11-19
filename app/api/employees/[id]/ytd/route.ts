import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = request.nextUrl
    const year = searchParams.get('year') || new Date().getFullYear().toString()
    const employeeId = params.id

    // Fetch all wage summary records for the employee in this year
    const { data: wageRecords, error: wageError } = await supabase
      .from('wage_summary')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('year', parseInt(year))
      .order('month', { ascending: true })
      .order('period', { ascending: true })

    if (wageError) {
      console.error('Error fetching wage records:', wageError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch wage records' },
        { status: 500 }
      )
    }

    // Calculate YTD totals
    let ytd_gross_wage = 0
    let ytd_ot_wage = 0
    let ytd_total_income = 0
    let ytd_sso = 0
    let ytd_tax = 0
    let ytd_total_deduction = 0
    let ytd_net_wage = 0

    if (wageRecords && wageRecords.length > 0) {
      wageRecords.forEach((record: any) => {
        ytd_gross_wage += record.base_wage || 0
        ytd_ot_wage += record.ot_wage || 0
        ytd_total_income += record.total_income || 0
        ytd_sso += record.sso || 0
        ytd_tax += record.tax || 0
        ytd_total_deduction += record.total_deduction || 0
        ytd_net_wage += record.net_wage || 0
      })
    }

    const ytdData = {
      employee_id: employeeId,
      year: parseInt(year),
      ytd_gross_wage,
      ytd_ot_wage,
      ytd_total_income,
      ytd_sso,
      ytd_tax,
      ytd_total_deduction,
      ytd_net_wage,
      last_updated: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, data: ytdData })
  } catch (error) {
    console.error('Error in GET /api/employees/[id]/ytd:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

