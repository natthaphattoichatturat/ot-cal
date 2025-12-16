import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'
import { PND1KorData, PND1KorEmployee, DEFAULT_COMPANY_INFO } from '@/types/documents'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year') // format: "2025"

    if (!year) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: year'
      }, { status: 400 })
    }

    const yearNum = parseInt(year)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ดึงข้อมูลพนักงานทั้งหมด (รวมที่ลาออกไปแล้วด้วย เพราะต้องออก 50 ทวิ ให้)
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('*')

    if (empError) {
      throw empError
    }

    if (!employees || employees.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No employees found'
      }, { status: 404 })
    }

    const pnd1korEmployees: PND1KorEmployee[] = []
    let totalIncome = 0
    let totalTax = 0

    // ดึงข้อมูลสรุปรายปีของแต่ละพนักงาน
    for (const employee of employees) {
      // ดึงข้อมูล wage_summary ทั้งปี
      const { data: yearRecords } = await supabase
        .from('wage_summary')
        .select('*')
        .eq('employee_id', employee.employee_id)
        .eq('year', yearNum)

      if (!yearRecords || yearRecords.length === 0) continue

      let yearlyIncome = 0
      let yearlyTax = 0

      yearRecords.forEach((record: any) => {
        yearlyIncome += (record.total_income || 0)
        yearlyTax += (record.tax || 0)
      })

      // ข้ามพนักงานที่ไม่มีรายได้
      if (yearlyIncome <= 0) continue

      // แยกชื่อและนามสกุล
      const nameParts = employee.name?.split(' ') || ['', '']
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      pnd1korEmployees.push({
        sequence: pnd1korEmployees.length + 1,
        idNumber: employee.id_card_number || '',
        titleName: employee.title_name || '',
        firstName,
        lastName,
        totalIncome: Math.round(yearlyIncome * 100) / 100,
        totalTax: Math.round(yearlyTax * 100) / 100,
        incomeType: '40(1)' as const
      })

      totalIncome += yearlyIncome
      totalTax += yearlyTax
    }

    const pnd1korData: PND1KorData = {
      companyTaxId: DEFAULT_COMPANY_INFO.companyTaxId,
      companyName: DEFAULT_COMPANY_INFO.companyName,
      companyBranch: DEFAULT_COMPANY_INFO.companyBranch,
      companyAddress: DEFAULT_COMPANY_INFO.companyAddress,
      postalCode: DEFAULT_COMPANY_INFO.postalCode,
      phone: DEFAULT_COMPANY_INFO.phone,
      taxYear: yearNum + 543, // แปลงเป็น พ.ศ.
      summary: {
        employeeCount: pnd1korEmployees.length,
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalTax: Math.round(totalTax * 100) / 100
      },
      employees: pnd1korEmployees
    }

    return NextResponse.json({
      success: true,
      data: pnd1korData
    })

  } catch (error: any) {
    console.error('Error generating PND1Kor data:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
