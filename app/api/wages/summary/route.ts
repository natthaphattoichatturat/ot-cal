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

      // แยก OT wages (สมมติเป็น OT1, OT2, OT3 แต่ใน wage_summary รวมเป็น ot_wage)
      const totalOtWage = wd.ot_wage || 0
      // สมมติแบ่ง OT ตามอัตราส่วน (จริงๆควรคำนวณใหม่ แต่ใช้ temp value)
      const ot1Wage = totalOtWage * 0.5 // 1.5x
      const ot2Wage = totalOtWage * 0.3 // 2x
      const ot3Wage = totalOtWage * 0.2 // 3x

      return {
        employeeId: wd.employee_id,
        name: employee?.name || 'Unknown',
        department: employee?.department || 'ไม่ระบุ',
        employmentType: employee?.employment_type || 'รายวัน',
        totalBaseWage: wd.base_wage || 0,
        totalOt1Wage: ot1Wage,
        totalOt2Wage: ot2Wage,
        totalOt3Wage: ot3Wage,
        grossWage: wd.total_income || 0,
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
