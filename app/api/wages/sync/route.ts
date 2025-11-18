import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * API สำหรับซิงค์ข้อมูลจาก daily_attendance ไปยัง daily_wages
 * จะถูกเรียกหลังจาก import scan หรือบันทึกข้อมูลการเข้างาน
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { month, period } = body // Format: { month: "2024-11", period: 1 }

    if (!month) {
      return NextResponse.json({ success: false, error: 'Missing month parameter' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // คำนวณ date range
    const [year, monthNum] = month.split('-').map(Number)
    let startDate, endDate

    if (period === 1) {
      // งวดที่ 1: 26 (เดือนก่อน) - 10
      const prevMonth = monthNum === 1 ? 12 : monthNum - 1
      const prevYear = monthNum === 1 ? year - 1 : year
      startDate = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-26`
      endDate = `${year}-${monthNum.toString().padStart(2, '0')}-10`
    } else {
      // งวดที่ 2: 11 - 25
      startDate = `${year}-${monthNum.toString().padStart(2, '0')}-11`
      endDate = `${year}-${monthNum.toString().padStart(2, '0')}-25`
    }

    // ดึงข้อมูล wage_period
    const { data: wagePeriods, error: periodError } = await supabase
      .from('wage_periods')
      .select('*')
      .eq('wage_month', `${year}-${monthNum.toString().padStart(2, '0')}-01`)
      .eq('period_number', period)
      .single()

    let wagePeriodId = wagePeriods?.id

    // ถ้ายังไม่มี wage_period ให้สร้าง
    if (!wagePeriodId) {
      const paymentDate = period === 1
        ? `${year}-${monthNum.toString().padStart(2, '0')}-20`
        : `${year}-${(monthNum === 12 ? 1 : monthNum + 1).toString().padStart(2, '0')}-04`

      const ssoDueDate = `${year}-${(monthNum === 12 ? 1 : monthNum + 1).toString().padStart(2, '0')}-15`

      const { data: newPeriod, error: createError } = await supabase
        .from('wage_periods')
        .insert({
          wage_month: `${year}-${monthNum.toString().padStart(2, '0')}-01`,
          period_number: period,
          work_start_date: startDate,
          work_end_date: endDate,
          payment_date: paymentDate,
          sso_due_date: ssoDueDate
        })
        .select()
        .single()

      if (createError) throw createError
      wagePeriodId = newPeriod.id
    }

    // ดึงข้อมูลการเข้างานทั้งหมดในงวดนี้
    const { data: attendances, error: attError } = await supabase
      .from('daily_attendance')
      .select(`
        *,
        employees!fk_daily_employee (
          employee_id,
          perhr_salary,
          perday_salary
        )
      `)
      .gte('work_date', startDate)
      .lte('work_date', endDate)

    if (attError) throw attError

    if (!attendances || attendances.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No attendance data to sync',
        synced: 0
      })
    }

    // เตรียมข้อมูลสำหรับ upsert ลง daily_wages
    const dailyWagesData = attendances.map(att => {
      const employee = Array.isArray(att.employees) ? att.employees[0] : att.employees
      const perhrSalary = employee?.perhr_salary || 0

      // คำนวณค่าจ้าง (ใช้ trigger ใน database แต่เราส่งข้อมูลให้ครบเพื่อให้ trigger ทำงาน)
      return {
        employee_id: att.employee_id,
        work_date: att.work_date,
        wage_period_id: wagePeriodId,
        actual_hours: att.actual_hours || 0,
        ot_normal_hours: att.ot_normal_hours || 0,
        ot_special_hours: att.ot_special_hours || 0,
        ot_premium_hours: att.ot_premium_hours || 0,
        perhr_salary: perhrSalary,
        perday_salary: employee?.perday_salary || 0,
        is_holiday: att.is_holiday || false,
        is_leave: att.is_leave || false,
        late: att.late || false
      }
    })

    // Upsert ลง daily_wages (insert หรือ update ถ้ามีอยู่แล้ว)
    const { error: upsertError } = await supabase
      .from('daily_wages')
      .upsert(dailyWagesData, {
        onConflict: 'employee_id,work_date'
      })

    if (upsertError) {
      console.error('Upsert error:', upsertError)
      throw upsertError
    }

    // ซิงค์ attendance_punctuality ด้วย
    const punctualityData = attendances
      .filter(att => att.scheduled_in_time && att.check_in_time)
      .map(att => {
        const scheduledIn = new Date(`2000-01-01T${att.scheduled_in_time}`)
        const checkIn = new Date(`2000-01-01T${att.check_in_time}`)
        const earlyMinutes = Math.floor((scheduledIn.getTime() - checkIn.getTime()) / (1000 * 60))

        return {
          employee_id: att.employee_id,
          work_date: att.work_date,
          wage_period_id: wagePeriodId,
          scheduled_in_time: att.scheduled_in_time,
          check_in_time: att.check_in_time,
          early_minutes: Math.max(0, earlyMinutes),
          is_punctual: earlyMinutes >= 5
        }
      })

    if (punctualityData.length > 0) {
      const { error: punctualityError } = await supabase
        .from('attendance_punctuality')
        .upsert(punctualityData, {
          onConflict: 'employee_id,work_date'
        })

      if (punctualityError) {
        console.error('Punctuality sync error:', punctualityError)
        // ไม่ throw error เพราะไม่ใช่ critical
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${dailyWagesData.length} daily wages successfully`,
      synced: dailyWagesData.length,
      wagePeriodId
    })
  } catch (error: any) {
    console.error('Error syncing daily wages:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
