import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * API สำหรับดึงประวัติการปรับเงิน (wage adjustments logs)
 * รองรับการ filter ตามงวดหลายงวดพร้อมกัน
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month')
    const year = parseInt(searchParams.get('year') || '0')
    const periods = searchParams.get('periods') // Format: "1,2" or "1" or "2"

    if (!month || !year) {
      return NextResponse.json(
        { success: false, error: 'Missing month or year parameter' },
        { status: 400 }
      )
    }

    const [yearNum, monthNum] = month.includes('-')
      ? month.split('-').map(Number)
      : [year, parseInt(month)]

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let query = supabase
      .from('wage_adjustments')
      .select(`
        *,
        employees (
          name,
          department
        )
      `)
      .eq('year', yearNum)
      .eq('month', monthNum)

    // Filter by periods if specified
    if (periods) {
      const periodArray = periods.split(',').map(p => parseInt(p.trim()))
      query = query.in('period', periodArray)
    }

    query = query.order('created_at', { ascending: false })

    const { data: adjustments, error } = await query

    if (error) {
      console.error('Error fetching wage logs:', error)
      throw error
    }

    // Map ข้อมูลเป็น format ที่ frontend ต้องการ
    const logs = (adjustments || []).map(adj => {
      const employee = Array.isArray(adj.employees) ? adj.employees[0] : adj.employees

      return {
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
        created_at: adj.created_at,
        created_by: adj.created_by || 'Unknown'
      }
    })

    return NextResponse.json({ success: true, data: logs })
  } catch (error: any) {
    console.error('Error fetching wage logs:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
