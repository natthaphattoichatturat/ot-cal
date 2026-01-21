import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET - คำนวณ OT เช้าของพนักงานทั้งหมดในงวดที่เลือก
 * (จากการเข้างานก่อนเวลา 06:00 - 08:00)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const year = parseInt(searchParams.get('year') || '0')
    const month = parseInt(searchParams.get('month') || '0')
    const period = parseInt(searchParams.get('period') || '1')

    if (!year || !month) {
      return NextResponse.json(
        { success: false, error: 'Missing year or month parameter' },
        { status: 400 }
      )
    }

    // คำนวณ date range ของงวด
    let startDate: string
    let endDate: string

    if (period === 1) {
      // งวดที่ 1: 26 (เดือนก่อน) - 10
      const prevMonth = month === 1 ? 12 : month - 1
      const prevYear = month === 1 ? year - 1 : year
      startDate = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-26`
      endDate = `${year}-${month.toString().padStart(2, '0')}-10`
    } else {
      // งวดที่ 2: 11 - 25
      startDate = `${year}-${month.toString().padStart(2, '0')}-11`
      endDate = `${year}-${month.toString().padStart(2, '0')}-25`
    }

    const baseSelect = `
      employee_id,
      work_date,
      check_in_time,
      scheduled_in_time,
      is_holiday,
      employees!fk_daily_employee (
        name,
        department
      )
    `
    const selectWithMorning = `
      employee_id,
      work_date,
      check_in_time,
      scheduled_in_time,
      morning_ot_hours,
      is_holiday,
      employees!fk_daily_employee (
        name,
        department
      )
    `

    const buildQuery = (selectClause: string) => (
      supabase
        .from('daily_attendance')
        .select(selectClause)
        .gte('work_date', startDate)
        .lte('work_date', endDate)
        .not('check_in_time', 'is', null)
        .order('employee_id')
        .order('work_date')
    )

    // ดึง attendance ที่มี morning OT (fallback ถ้าคอลัมน์ไม่มี)
    let { data: attendances, error: attError } = await buildQuery(selectWithMorning)
    if (attError && attError.code === '42703') {
      const retry = await buildQuery(baseSelect)
      attendances = retry.data
      attError = retry.error
    }

    if (attError) {
      console.error('Error fetching attendance:', attError)
      throw attError
    }

    // คำนวณ morning OT สำหรับแต่ละ record
    const employeeOT = new Map<string, {
      employee_id: string
      name: string
      department: string
      total_morning_ot: number
      days_with_morning_ot: number
      details: Array<{
        date: string
        check_in: string
        scheduled_in: string
        morning_ot_hours: number
        is_holiday: boolean
      }>
    }>()

    attendances?.forEach(att => {
      if (!att.check_in_time) return

      // คำนวณ morning OT (เข้าก่อน scheduled_in_time)
      const checkInMinutes = timeToMinutes(att.check_in_time)
      const scheduledInMinutes = timeToMinutes(att.scheduled_in_time || '08:00')

      let morningOT = 0

      // OT เช้า: เข้าก่อน scheduled_in_time และหลัง 06:00
      // สูงสุด 2 ชั่วโมง (120 นาที)
      if (scheduledInMinutes <= 540 && checkInMinutes < scheduledInMinutes && checkInMinutes >= 360) { // 360 = 06:00
        const otMinutes = scheduledInMinutes - checkInMinutes
        morningOT = roundDownToHalfHour(Math.min(otMinutes, 120)) / 60 // แปลงเป็นชั่วโมง
      }

      // ใช้ค่าจาก database ถ้ามี หรือคำนวณเอง
      const finalMorningOT = att.morning_ot_hours ?? morningOT

      if (finalMorningOT > 0) {
        const empId = att.employee_id
        const employee = Array.isArray(att.employees) ? att.employees[0] : att.employees

        if (!employeeOT.has(empId)) {
          employeeOT.set(empId, {
            employee_id: empId,
            name: employee?.name || 'Unknown',
            department: employee?.department || 'ไม่ระบุ',
            total_morning_ot: 0,
            days_with_morning_ot: 0,
            details: []
          })
        }

        const emp = employeeOT.get(empId)!
        emp.total_morning_ot += finalMorningOT
        emp.days_with_morning_ot += 1
        emp.details.push({
          date: att.work_date,
          check_in: att.check_in_time,
          scheduled_in: att.scheduled_in_time || '08:00',
          morning_ot_hours: finalMorningOT,
          is_holiday: att.is_holiday || false
        })
      }
    })

    // แปลงเป็น array และ sort ตาม total_morning_ot
    const result = Array.from(employeeOT.values())
      .sort((a, b) => b.total_morning_ot - a.total_morning_ot)

    // ดึง OT เช้าที่ user กำหนดไว้แล้ว (ถ้ามี)
    const { data: existingAllowances } = await supabase
      .from('morning_ot_allowances')
      .select('employee_id, allowed_hours, selected_dates')
      .eq('year', year)
      .eq('month', month)
      .eq('period', period)

    const allowanceMap = new Map(
      (existingAllowances || []).map(a => [a.employee_id, { allowed_hours: a.allowed_hours, selected_dates: a.selected_dates }])
    )

    // เพิ่ม allowed_hours และ selected_dates ลงใน result
    const resultWithAllowance = result.map(emp => ({
      ...emp,
      allowed_hours: allowanceMap.get(emp.employee_id)?.allowed_hours ?? null,
      selected_dates: allowanceMap.get(emp.employee_id)?.selected_dates ?? null
    }))

    return NextResponse.json({
      success: true,
      data: resultWithAllowance,
      period: { year, month, period, startDate, endDate },
      summary: {
        total_employees: result.length,
        total_morning_ot_hours: result.reduce((sum, e) => sum + e.total_morning_ot, 0)
      }
    })
  } catch (error: any) {
    console.error('Error in GET /api/morning-ot/calculated:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

function timeToMinutes(time: string): number {
  if (!time) return 0
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function roundDownToHalfHour(minutes: number): number {
  return Math.floor(minutes / 30) * 30
}
