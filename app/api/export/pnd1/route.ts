import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'
import {
  getPeriodDates,
  calculatePeriodWageV2,
  type DailyAttendanceV2,
  type EmployeeInfoV2,
  type LeaveRecord,
  type WageAdjustment
} from '@/lib/wageCalculationsV2'
import { calculateEmployeeTax } from '@/lib/taxCalculations'
import { PND1Data, PND1Employee, DEFAULT_COMPANY_INFO } from '@/types/documents'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month') // format: "2025-10"

    if (!month) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: month'
      }, { status: 400 })
    }

    const [year, monthNum] = month.split('-').map(Number)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ดึงข้อมูลพนักงานที่ใช้งานอยู่ทั้งหมด
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('status', 'active')

    if (empError) {
      throw empError
    }

    if (!employees || employees.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No active employees found'
      }, { status: 404 })
    }

    const pnd1Employees: PND1Employee[] = []
    let totalIncome = 0
    let totalTax = 0

    // คำนวณภาษีสำหรับแต่ละพนักงาน
    for (const employee of employees) {
      // ดึงข้อมูลทั้ง 2 งวดในเดือนนี้
      const { startDate: start1, endDate: end1 } = getPeriodDates(year, monthNum, 1)
      const { startDate: start2, endDate: end2 } = getPeriodDates(year, monthNum, 2)

      const employmentType = (employee.employment_type || 'รายวัน') as 'รายวัน' | 'รายเดือน'

      const employeeInfo: EmployeeInfoV2 = {
        employee_id: employee.employee_id,
        name: employee.name,
        department: employee.department || 'ไม่ระบุ',
        employment_type: employmentType,
        perhr_salary: employee.perhr_salary || 0,
        perday_salary: employee.perday_salary || 0,
        monthly_salary: employee.monthly_salary || 0
      }

      // Helper functions
      const convertAttendances = (attendances: any[]): DailyAttendanceV2[] => {
        return (attendances || []).map(att => ({
          work_date: att.work_date,
          actual_hours: att.actual_hours || 0,
          ot_normal_hours: att.ot_normal_hours || 0,
          ot_special_hours: att.ot_special_hours || 0,
          ot_premium_hours: att.ot_premium_hours || 0,
          ot_normal_hours_multiplied: att.ot_normal_hours_multiplied || undefined,
          ot_special_hours_multiplied: att.ot_special_hours_multiplied || undefined,
          ot_premium_hours_multiplied: att.ot_premium_hours_multiplied || undefined,
          scheduled_in_time: att.scheduled_in_time,
          check_in_time: att.check_in_time,
          check_out_time: att.check_out_time,
          is_holiday: att.is_holiday || false,
          is_leave: att.is_leave || false,
          late: att.late || false,
          late_hours: att.late_hours || 0
        }))
      }

      const convertLeaves = (leaves: any[]): LeaveRecord[] => {
        const paidLeaveTypes = ['ลาป่วย', 'ลาพักร้อน', 'sick_leave', 'annual_leave']
        return (leaves || []).map(leave => ({
          leave_date: leave.leave_date,
          leave_type: leave.leave_type,
          leave_hours: leave.leave_hours || 8,
          is_paid: paidLeaveTypes.includes(leave.leave_type?.toLowerCase() || '')
        }))
      }

      const convertAdjustments = (adjustments: any[]): WageAdjustment[] => {
        return (adjustments || []).map(adj => ({
          adjustment_type: adj.adjustment_type as 'income' | 'deduction',
          category: adj.category,
          amount: adj.amount,
          description: adj.description
        }))
      }

      // ดึงข้อมูลงวดที่ 1
      const { data: att1 } = await supabase
        .from('daily_attendance')
        .select('*')
        .eq('employee_id', employee.employee_id)
        .gte('work_date', start1)
        .lte('work_date', end1)

      const { data: leave1 } = await supabase
        .from('leave_records')
        .select('*')
        .eq('employee_id', employee.employee_id)
        .gte('leave_date', start1)
        .lte('leave_date', end1)
        .eq('status', 'approved')

      const { data: adj1 } = await supabase
        .from('wage_adjustments')
        .select('*')
        .eq('employee_id', employee.employee_id)
        .eq('year', year)
        .eq('month', monthNum)
        .eq('period', 1)

      // ดึงข้อมูลงวดที่ 2
      const { data: att2 } = await supabase
        .from('daily_attendance')
        .select('*')
        .eq('employee_id', employee.employee_id)
        .gte('work_date', start2)
        .lte('work_date', end2)

      const { data: leave2 } = await supabase
        .from('leave_records')
        .select('*')
        .eq('employee_id', employee.employee_id)
        .gte('leave_date', start2)
        .lte('leave_date', end2)
        .eq('status', 'approved')

      const { data: adj2 } = await supabase
        .from('wage_adjustments')
        .select('*')
        .eq('employee_id', employee.employee_id)
        .eq('year', year)
        .eq('month', monthNum)
        .eq('period', 2)

      // คำนวณค่าจ้างทั้ง 2 งวด
      const wage1 = calculatePeriodWageV2(
        employeeInfo,
        convertAttendances(att1 || []),
        convertLeaves(leave1 || []),
        convertAdjustments(adj1 || []),
        { startDate: start1, endDate: end1 }
      )

      const wage2 = calculatePeriodWageV2(
        employeeInfo,
        convertAttendances(att2 || []),
        convertLeaves(leave2 || []),
        convertAdjustments(adj2 || []),
        { startDate: start2, endDate: end2 }
      )

      // รายได้รวมทั้งเดือน
      const monthlyIncome = wage1.total_income + wage2.total_income

      // ข้ามพนักงานที่ไม่มีรายได้
      if (monthlyIncome <= 0) continue

      // ดึงข้อมูล YTD (ก่อนเดือนนี้)
      const { data: ytdRecords } = await supabase
        .from('wage_summary')
        .select('*')
        .eq('employee_id', employee.employee_id)
        .eq('year', year)
        .lt('month', monthNum)

      let ytdIncome = 0
      let ytdTax = 0
      let ytdSSO = 0

      if (ytdRecords && ytdRecords.length > 0) {
        ytdRecords.forEach((record: any) => {
          ytdIncome += (record.base_wage || 0) + (record.ot_wage || 0)
          ytdTax += record.tax || 0
          ytdSSO += record.sso || 0
        })
      }

      // คำนวณภาษี Cumulative YTD
      const taxCalc1 = calculateEmployeeTax(
        wage1.total_income,
        ytdIncome,
        ytdTax,
        monthNum,
        1,
        ytdSSO
      )

      const taxCalc2 = calculateEmployeeTax(
        wage2.total_income,
        ytdIncome + wage1.total_income,
        ytdTax + taxCalc1.currentPeriodTax,
        monthNum,
        2,
        ytdSSO + Math.min(wage1.total_income * 0.05, 750)
      )

      const monthlyTax = taxCalc1.currentPeriodTax + taxCalc2.currentPeriodTax

      // แยกชื่อและนามสกุล
      const nameParts = employee.name?.split(' ') || ['', '']
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      pnd1Employees.push({
        sequence: pnd1Employees.length + 1,
        idNumber: employee.id_card_number || '',
        titleName: employee.title_name || '',
        firstName,
        lastName,
        incomeAmount: Math.round(monthlyIncome * 100) / 100,
        taxAmount: Math.round(monthlyTax * 100) / 100,
        incomeType: '40(1)' as const
      })

      totalIncome += monthlyIncome
      totalTax += monthlyTax
    }

    const pnd1Data: PND1Data = {
      companyTaxId: DEFAULT_COMPANY_INFO.companyTaxId,
      companyName: DEFAULT_COMPANY_INFO.companyName,
      companyBranch: DEFAULT_COMPANY_INFO.companyBranch,
      companyAddress: DEFAULT_COMPANY_INFO.companyAddress,
      postalCode: DEFAULT_COMPANY_INFO.postalCode,
      phone: DEFAULT_COMPANY_INFO.phone,
      taxMonth: monthNum,
      taxYear: year + 543, // แปลงเป็น พ.ศ.
      submissionType: 'normal',
      summary: {
        employeeCount: pnd1Employees.length,
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalTax: Math.round(totalTax * 100) / 100
      },
      employees: pnd1Employees
    }

    return NextResponse.json({
      success: true,
      data: pnd1Data
    })

  } catch (error: any) {
    console.error('Error generating PND1 data:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
