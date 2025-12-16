import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'
import { WithholdingCertData, DEFAULT_COMPANY_INFO } from '@/types/documents'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const employeeIds = searchParams.get('employeeIds')?.split(',') || []
    const year = searchParams.get('year') // format: "2025"

    if (!year || employeeIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: employeeIds, year'
      }, { status: 400 })
    }

    const yearNum = parseInt(year)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ดึงข้อมูลพนักงานที่เลือก
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('*')
      .in('employee_id', employeeIds)

    if (empError) {
      throw empError
    }

    if (!employees || employees.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No employees found'
      }, { status: 404 })
    }

    const certificates: WithholdingCertData[] = []

    // สร้างหนังสือรับรองฯ สำหรับแต่ละพนักงาน
    for (const employee of employees) {
      // ดึงข้อมูล wage_summary ทั้งปี
      const { data: yearRecords } = await supabase
        .from('wage_summary')
        .select('*')
        .eq('employee_id', employee.employee_id)
        .eq('year', yearNum)

      let yearlyIncome = 0
      let yearlyTax = 0

      if (yearRecords && yearRecords.length > 0) {
        yearRecords.forEach((record: any) => {
          yearlyIncome += (record.total_income || 0)
          yearlyTax += (record.tax || 0)
        })
      }

      // แยกชื่อและนามสกุล
      const nameParts = employee.name?.split(' ') || ['', '']
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      // วันที่ออกหนังสือ (ใช้วันที่ปัจจุบัน)
      const now = new Date()
      const issueDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear() + 543}`

      const cert: WithholdingCertData = {
        companyTaxId: DEFAULT_COMPANY_INFO.companyTaxId,
        companyName: DEFAULT_COMPANY_INFO.companyName,
        companyAddress: DEFAULT_COMPANY_INFO.companyAddress,
        employee: {
          idNumber: employee.id_card_number || '',
          titleName: employee.title_name || '',
          firstName,
          lastName,
          address: employee.address || '-'
        },
        taxYear: yearNum + 543, // แปลงเป็น พ.ศ.
        issueDate,
        incomeDetails: [
          {
            incomeType: '40(1)',
            totalIncome: Math.round(yearlyIncome * 100) / 100,
            totalTax: Math.round(yearlyTax * 100) / 100
          }
        ],
        grandTotalIncome: Math.round(yearlyIncome * 100) / 100,
        grandTotalTax: Math.round(yearlyTax * 100) / 100
      }

      certificates.push(cert)
    }

    return NextResponse.json({
      success: true,
      data: certificates
    })

  } catch (error: any) {
    console.error('Error generating withholding certificate data:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
