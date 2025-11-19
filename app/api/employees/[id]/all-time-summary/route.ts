import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/employees/[id]/all-time-summary
 * ดึงยอดสะสมทั้งหมดตั้งแต่เริ่มทำงาน (All-Time Summary)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id

    // Fetch ALL wage summary records for the employee (all years)
    const { data: wageRecords, error: wageError } = await supabase
      .from('wage_summary')
      .select('*')
      .eq('employee_id', employeeId)
      .order('year', { ascending: true })
      .order('month', { ascending: true })
      .order('period', { ascending: true })

    if (wageError) {
      console.error('Error fetching wage records:', wageError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch wage records' },
        { status: 500 }
      )
    }

    // Calculate ALL-TIME totals
    let total_gross_wage = 0
    let total_ot_wage = 0
    let total_income = 0
    let total_sso = 0
    let total_tax = 0
    let total_deduction = 0
    let total_net_wage = 0

    if (wageRecords && wageRecords.length > 0) {
      wageRecords.forEach((record: any) => {
        total_gross_wage += record.base_wage || 0
        total_ot_wage += record.ot_wage || 0
        total_income += record.total_income || 0
        total_sso += record.sso || 0
        total_tax += record.tax || 0
        total_deduction += record.total_deduction || 0
        total_net_wage += record.net_wage || 0
      })
    }

    const allTimeData = {
      employee_id: employeeId,
      total_gross_wage,
      total_ot_wage,
      total_income,
      total_sso,
      total_tax,
      total_deduction,
      total_net_wage,
      total_periods: wageRecords?.length || 0,
      first_period: wageRecords && wageRecords.length > 0 
        ? `${wageRecords[0].month}/${wageRecords[0].year} งวด ${wageRecords[0].period}`
        : null,
      last_updated: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, data: allTimeData })
  } catch (error) {
    console.error('Error in GET /api/employees/[id]/all-time-summary:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

