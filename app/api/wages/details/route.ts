import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * API สำหรับดึงข้อมูล wage_details
 */
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

    // Build query
    let query = supabase
      .from('wage_details')
      .select(`
        *,
        employees:employee_id (
          name,
          department,
          position,
          section
        )
      `)
      .order('employee_id', { ascending: true })

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

