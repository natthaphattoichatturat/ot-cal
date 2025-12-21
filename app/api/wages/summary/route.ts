import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * API สำหรับดึงสรุปค่าจ้างพนักงานทั้งหมด
 * ดึงข้อมูลจาก wage_details ที่คำนวณโดย calculate-v2 API
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month')
    const period = parseInt(searchParams.get('period') || '1') as 1 | 2

    if (!month) {
      return NextResponse.json({ success: false, error: 'Missing month parameter' }, { status: 400 })
    }

    const [year, monthNum] = month.split('-').map(Number)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ดึงข้อมูลค่าจ้างจาก wage_summary ที่คำนวณไว้แล้ว
    const { data: wageDetails, error: wageError } = await supabase
      .from('wage_summary')
      .select(`
        *,
        employees!fk_wage_employee (
          name,
          department,
          employment_type
        )
      `)
      .eq('year', year)
      .eq('month', monthNum)
      .eq('period', period)
      .order('employee_id')

    if (wageError) {
      console.error('Wage details fetch error:', wageError)
      throw wageError
    }

    // Map ข้อมูลเป็น format ที่ frontend ต้องการ
    const employeeWages = (wageDetails || []).map(wd => {
      const employee = Array.isArray(wd.employees) ? wd.employees[0] : wd.employees

      // ใช้ OT wages ที่แยกไว้แล้วใน database (ถ้ามี) หรือแบ่งสัดส่วน (สำหรับ backward compatibility)
      const ot1Wage = wd.ot1_wage || (wd.ot_wage ? wd.ot_wage * 0.5 : 0)
      const ot2Wage = wd.ot2_wage || (wd.ot_wage ? wd.ot_wage * 0.3 : 0)
      const ot3Wage = wd.ot3_wage || (wd.ot_wage ? wd.ot_wage * 0.2 : 0)

      // คำนวณ gross wage (base + ot รวม)
      const totalOtWage = ot1Wage + ot2Wage + ot3Wage
      const grossWage = (wd.base_wage || 0) + totalOtWage

      return {
        employeeId: wd.employee_id,
        name: employee?.name || 'Unknown',
        department: employee?.department || 'ไม่ระบุ',
        employmentType: employee?.employment_type || 'รายวัน',
        totalBaseWage: wd.base_wage || 0,
        totalOt1Wage: ot1Wage,
        totalOt2Wage: ot2Wage,
        totalOt3Wage: ot3Wage,
        grossWage: grossWage,
        attendanceBonus: wd.attendance_bonus || 0,
        nightShiftAllowance: 0, // ไม่มีใน wage_summary
        additionalIncome: 0, // ไม่มีใน wage_summary
        totalIncome: wd.total_income || 0,
        // เงินหัก
        lateMinutes: 0, // ไม่มีใน wage_summary
        lateDeduction: 0, // ไม่มีใน wage_summary
        leaveDays: 0, // ไม่มีใน wage_summary
        leaveDeduction: 0, // ไม่มีใน wage_summary
        additionalDeduction: 0, // ไม่มีใน wage_summary
        sso: wd.sso || 0,
        tax: wd.tax || 0,
        totalDeductions: wd.total_deduction || 0,
        // เงินสุทธิ
        netWage: wd.net_wage || 0
      }
    })

    return NextResponse.json({ success: true, data: employeeWages })
  } catch (error: any) {
    console.error('Error fetching wage summary:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
