import { NextRequest, NextResponse } from 'next/server'
import { recalculateEmployeePeriod } from '@/lib/wageRecalculation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const employeeId = body.employee_id || body.employeeId

    if (!employeeId) {
      return NextResponse.json({ success: false, error: 'Missing employee_id' }, { status: 400 })
    }

    let year = Number(body.year)
    let month = Number(body.month)
    if ((!year || !month) && typeof body.month === 'string' && body.month.includes('-')) {
      const [parsedYear, parsedMonth] = body.month.split('-').map((v: string) => Number(v))
      year = parsedYear
      month = parsedMonth
    }

    const period = Number(body.period) as 1 | 2

    if (!Number.isFinite(year) || !Number.isFinite(month) || ![1, 2].includes(period)) {
      return NextResponse.json({ success: false, error: 'Invalid year/month/period' }, { status: 400 })
    }

    const result = await recalculateEmployeePeriod({
      employeeId,
      year,
      month,
      period
    })

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error('Error recalculating wage:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
