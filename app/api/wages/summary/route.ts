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
          employment_type,
          position,
          department_code,
          section
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

    // ดึง wage_adjustments สำหรับงวดนี้
    const { data: adjustments } = await supabase
      .from('wage_adjustments')
      .select('*')
      .eq('year', year)
      .eq('month', monthNum)
      .eq('period', period)

    // สร้าง Map ของ adjustments ต่อพนักงาน
    const adjustmentMap = new Map<string, { income: any[], deduction: any[] }>()
    ;(adjustments || []).forEach(adj => {
      if (!adjustmentMap.has(adj.employee_id)) {
        adjustmentMap.set(adj.employee_id, { income: [], deduction: [] })
      }
      const empAdj = adjustmentMap.get(adj.employee_id)!
      if (adj.adjustment_type === 'income') {
        empAdj.income.push(adj)
      } else {
        empAdj.deduction.push(adj)
      }
    })

    // Map ข้อมูลเป็น format ที่ frontend ต้องการ
    const employeeWages = (wageDetails || []).map(wd => {
      const employee = Array.isArray(wd.employees) ? wd.employees[0] : wd.employees
      const empAdjustments = adjustmentMap.get(wd.employee_id) || { income: [], deduction: [] }

      // ใช้ OT wages ที่แยกไว้แล้วใน database (ถ้ามี) หรือแบ่งสัดส่วน (สำหรับ backward compatibility)
      const ot1Wage = wd.ot1_wage || (wd.ot_wage ? wd.ot_wage * 0.5 : 0)
      const ot2Wage = wd.ot2_wage || (wd.ot_wage ? wd.ot_wage * 0.3 : 0)
      const ot3Wage = wd.ot3_wage || (wd.ot_wage ? wd.ot_wage * 0.2 : 0)
      const ot4Wage = 0 // OT4 สำหรับ future use

      // คำนวณ gross wage (base + ot รวม)
      const totalOtWage = ot1Wage + ot2Wage + ot3Wage + ot4Wage
      const grossWage = (wd.base_wage || 0) + totalOtWage

      // แยกรายการเงินเพิ่มตาม category
      const incomeByCategory: { [key: string]: number } = {}
      empAdjustments.income.forEach(inc => {
        const cat = inc.category || 'อื่นๆ'
        incomeByCategory[cat] = (incomeByCategory[cat] || 0) + (inc.amount || 0)
      })

      // แยกรายการเงินหักตาม category
      const deductionByCategory: { [key: string]: number } = {}
      empAdjustments.deduction.forEach(ded => {
        const cat = ded.category || 'อื่นๆ'
        deductionByCategory[cat] = (deductionByCategory[cat] || 0) + (ded.amount || 0)
      })

      // ถ้ามีการกำหนดภาษีแบบ manual ให้ใช้ค่านั้นแทนภาษีที่คำนวณไว้ใน wage_summary
      const manualTax =
        deductionByCategory['ภาษี'] ||
        deductionByCategory['ภาษีหัก ณ ที่จ่าย'] ||
        deductionByCategory['ภาษีเงินได้หัก ณ ที่จ่าย'] ||
        0

      // คำนวณรวมเงินเพิ่มและเงินหักจาก adjustments
      const additionalIncome = empAdjustments.income.reduce((sum, inc) => sum + (inc.amount || 0), 0)
      const additionalDeduction = empAdjustments.deduction.reduce((sum, ded) => sum + (ded.amount || 0), 0)

      const baseTax = wd.tax || 0
      const effectiveTax = manualTax > 0 ? manualTax : baseTax
      const baseTotalDeductions = wd.total_deduction || 0
      const effectiveTotalDeductions = manualTax > 0 ? (baseTotalDeductions - baseTax + manualTax) : baseTotalDeductions
      const baseNetWage = wd.net_wage || 0
      const effectiveNetWage = manualTax > 0 ? (baseNetWage + baseTax - manualTax) : baseNetWage

      return {
        employeeId: wd.employee_id,
        name: employee?.name || 'Unknown',
        department: employee?.department || 'ไม่ระบุ',
        employmentType: employee?.employment_type || 'รายวัน',
        position: employee?.position || '',
        departmentCode: employee?.department_code || '',
        section: employee?.section || '',
        // เงินเดือน/ค่าจ้าง
        totalBaseWage: wd.base_wage || 0,
        // OT
        totalOt1Wage: ot1Wage,
        totalOt2Wage: ot2Wage,
        totalOt3Wage: ot3Wage,
        totalOt4Wage: ot4Wage,
        grossWage: grossWage,
        // เงินเพิ่ม
        attendanceBonus: wd.attendance_bonus || 0, // เบี้ยขยัน
        nightShiftAllowance: wd.night_shift_allowance || 0, // ค่ากะ
        positionAllowance: incomeByCategory['ค่าตำแหน่ง'] || 0,
        telephoneAllowance: incomeByCategory['ค่าโทรศัพท์'] || 0,
        livingAllowance: incomeByCategory['ค่าครองชีพ'] || 0,
        specialAllowance: incomeByCategory['ค่าพิเศษ'] || 0,
        otherIncome1: incomeByCategory['ค่าอื่นๆ'] || 0,
        otherIncome2: incomeByCategory['ค่าอื่นๆ (ขาดงาน)'] || 0,
        returnDiligence: incomeByCategory['คืนเบี้ยขยัน'] || 0,
        returnVacation: incomeByCategory['คืนพักร้อน'] || incomeByCategory['คืนค่าพักร้อน'] || 0,
        bonus1: incomeByCategory['โบนัสรายได้'] || incomeByCategory['โบนัส'] || 0,
        bonus2: incomeByCategory['โบนัสสหกรณ์'] || 0,
        compta: 0, // Compta
        rounding: 0, // ปัดเศษ
        additionalIncome: additionalIncome,
        totalIncome: wd.total_income || 0,
        // เงินหัก
        lateDeduction: wd.late_deduction || deductionByCategory['มาสาย'] || 0,
        absentDeduction: deductionByCategory['ขาดงาน'] || 0,
        leaveDeduction: wd.leave_deduction || deductionByCategory['ลากิจ'] || 0,
        uniformDeduction: deductionByCategory['ค่าชุดฟอร์ม'] || deductionByCategory['ค่าชุด'] || 0,
        studentLoanDeduction: deductionByCategory['หักกยศ.'] || deductionByCategory['กยศ'] || 0,
        coopDeduction: deductionByCategory['สหกรณ์'] || 0,
        damagesDeduction: deductionByCategory['งานเสีย'] || 0,
        latePenalty: deductionByCategory['ค่ามาสาย'] || deductionByCategory['ค่าปรับมาสาย'] || 0,
        deductSpecial: deductionByCategory['หักค่าพิเศษ'] || 0,
        deductOther: deductionByCategory['หักค่าอื่นๆ'] || 0,
        comptaDed: 0,
        roundingDed: 0,
        additionalDeduction: additionalDeduction,
        sso: wd.sso || 0,
        tax: effectiveTax,
        totalDeductions: effectiveTotalDeductions,
        // เงินสุทธิ
        netWage: effectiveNetWage
      }
    })

    return NextResponse.json({
      success: true,
      data: employeeWages,
      period: { year, month: monthNum, period }
    })
  } catch (error: any) {
    console.error('Error fetching wage summary:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
