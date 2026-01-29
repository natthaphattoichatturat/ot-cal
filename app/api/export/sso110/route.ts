import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'
import { SSO110Data, SSO110Employee, DEFAULT_COMPANY_INFO } from '@/types/documents'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const employeeIds = searchParams.get('employeeIds')?.split(',').filter(id => id) || []
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

    // ดึงข้อมูลพนักงาน - ถ้ามี employeeIds ให้ใช้ตัวกรอง ถ้าไม่มีให้ดึงทั้งหมด
    let query = supabase
      .from('employees')
      .select('*')
      .eq('status', 'active')

    if (employeeIds.length > 0) {
      query = query.in('employee_id', employeeIds)
    }

    const { data: employees, error: empError } = await query

    if (empError) {
      throw empError
    }

    if (!employees || employees.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No active employees found'
      }, { status: 404 })
    }

    const ssoEmployees: SSO110Employee[] = []
    let totalWages = 0
    let totalEmployeeContribution = 0

    // คำนวณ SSO สำหรับแต่ละพนักงาน
    for (const employee of employees) {
      const employmentType = (employee.employment_type || 'รายวัน') as 'รายวัน' | 'รายเดือน'

      // ⭐ คำนวณฐานเงินเดือนตามประเภทพนักงาน
      // - พนักงานรายเดือน: ใช้ monthly_salary
      // - พนักงานรายวัน: ใช้ perday_salary * 30
      let salaryBase: number
      if (employmentType === 'รายเดือน') {
        salaryBase = employee.monthly_salary || 0
      } else {
        salaryBase = (employee.perday_salary || 0) * 30
      }

      // ข้ามพนักงานที่ไม่มีฐานเงินเดือน
      if (salaryBase <= 0) continue

      // ⭐ คำนวณเงินสมทบประกันสังคม
      // - ถ้าเงินเดือน < 17,500: คูณ 5%
      // - ถ้าเงินเดือน >= 17,500: จ่าย 875 บาท
      const SSO_MAX_BASE = 17500
      const SSO_MAX_CONTRIBUTION = 875
      const SSO_RATE = 0.05

      let contribution: number
      if (salaryBase < SSO_MAX_BASE) {
        contribution = Math.round(salaryBase * SSO_RATE * 100) / 100
      } else {
        contribution = SSO_MAX_CONTRIBUTION
      }

      // แยกชื่อและนามสกุล
      const nameParts = employee.name?.split(' ') || ['', '']
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      ssoEmployees.push({
        sequence: ssoEmployees.length + 1,
        idNumber: employee.id_card_number || '',
        titleName: employee.title_name || '',
        firstName,
        lastName,
        actualWages: Math.round(salaryBase * 100) / 100,
        contribution: contribution
      })

      totalWages += salaryBase
      totalEmployeeContribution += contribution
    }

    const ssoData: SSO110Data = {
      companyName: DEFAULT_COMPANY_INFO.companyName,
      companyAddress: DEFAULT_COMPANY_INFO.companyAddress,
      postalCode: DEFAULT_COMPANY_INFO.postalCode,
      phone: DEFAULT_COMPANY_INFO.phone,
      fax: DEFAULT_COMPANY_INFO.fax,
      accountNumber: DEFAULT_COMPANY_INFO.accountNumber,
      branchNumber: DEFAULT_COMPANY_INFO.branchNumber,
      contributionMonth: monthNum,
      contributionYear: year + 543, // แปลงเป็น พ.ศ.
      ssoRate: 5.00,
      summary: {
        totalWages: Math.round(totalWages * 100) / 100,
        employeeContribution: totalEmployeeContribution,
        employerContribution: totalEmployeeContribution, // นายจ้างจ่ายเท่ากัน
        totalContribution: totalEmployeeContribution * 2,
        employeeCount: ssoEmployees.length
      },
      employees: ssoEmployees
    }

    return NextResponse.json({
      success: true,
      data: ssoData
    })

  } catch (error: any) {
    console.error('Error generating SSO 1-10 data:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
