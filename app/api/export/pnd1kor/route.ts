import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import {
  getPeriodDates,
  calculatePeriodWageV2,
  type DailyAttendanceV2,
  type EmployeeInfoV2,
  type LeaveRecord,
  type WageAdjustment,
} from "@/lib/wageCalculationsV2";
import { calculateEmployeeTax } from "@/lib/taxCalculations";
import {
  PND1GorData,
  PND1GorEmployee,
  DEFAULT_COMPANY_INFO,
} from "@/types/documents";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeIds =
      searchParams
        .get("employeeIds")
        ?.split(",")
        .filter((id) => id) || [];
    const year = searchParams.get("year"); // format: "2025"

    if (!year) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameter: year",
        },
        { status: 400 }
      );
    }

    const yearNum = parseInt(year);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ดึงข้อมูลพนักงาน - ถ้ามี employeeIds ให้ใช้ตัวกรอง ถ้าไม่มีให้ดึงทั้งหมด
    let query = supabase.from("employees").select("*").eq("status", "active");

    if (employeeIds.length > 0) {
      query = query.in("employee_id", employeeIds);
    }

    const { data: employees, error: empError } = await query;

    if (empError) {
      throw empError;
    }

    if (!employees || employees.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No active employees found",
        },
        { status: 404 }
      );
    }

    const pnd1GorEmployees: PND1GorEmployee[] = [];
    let totalIncome = 0;
    let totalTax = 0;

    // คำนวณภาษีสำหรับแต่ละพนักงานทั้งปี
    for (const employee of employees) {
      const employmentType = (employee.employment_type || "รายวัน") as
        | "รายวัน"
        | "รายเดือน";

      const employeeInfo: EmployeeInfoV2 = {
        employee_id: employee.employee_id,
        name: employee.name,
        department: employee.department || "ไม่ระบุ",
        employment_type: employmentType,
        perhr_salary: employee.perhr_salary || 0,
        perday_salary: employee.perday_salary || 0,
        monthly_salary: employee.monthly_salary || 0,
      };

      // Helper functions
      const convertAttendances = (attendances: any[]): DailyAttendanceV2[] => {
        return (attendances || []).map((att) => ({
          work_date: att.work_date,
          actual_hours: att.actual_hours || 0,
          ot_normal_hours: att.ot_normal_hours || 0,
          ot_special_hours: att.ot_special_hours || 0,
          ot_premium_hours: att.ot_premium_hours || 0,
          ot_normal_hours_multiplied:
            att.ot_normal_hours_multiplied || undefined,
          ot_special_hours_multiplied:
            att.ot_special_hours_multiplied || undefined,
          ot_premium_hours_multiplied:
            att.ot_premium_hours_multiplied || undefined,
          scheduled_in_time: att.scheduled_in_time,
          check_in_time: att.check_in_time,
          check_out_time: att.check_out_time,
          is_holiday: att.is_holiday || false,
          is_leave: att.is_leave || false,
          late: att.late || false,
          late_hours: att.late_hours || 0,
        }));
      };

      const convertLeaves = (leaves: any[]): LeaveRecord[] => {
        const paidLeaveTypes = [
          "ลาป่วย",
          "ลาพักร้อน",
          "sick_leave",
          "annual_leave",
        ];
        return (leaves || []).map((leave) => ({
          leave_date: leave.leave_date,
          leave_type: leave.leave_type,
          leave_hours: leave.leave_hours || 8,
          is_paid: paidLeaveTypes.includes(
            leave.leave_type?.toLowerCase() || ""
          ),
        }));
      };

      const convertAdjustments = (adjustments: any[]): WageAdjustment[] => {
        return (adjustments || []).map((adj) => ({
          adjustment_type: adj.adjustment_type as "income" | "deduction",
          category: adj.category,
          amount: adj.amount,
          description: adj.description,
        }));
      };

      let yearlyIncome = 0;
      let yearlyTax = 0;
      let ytdIncome = 0;
      let ytdTax = 0;
      let ytdSSO = 0;

      // วนลูปทุกเดือนในปี
      for (let monthNum = 1; monthNum <= 12; monthNum++) {
        // ดึงข้อมูลทั้ง 2 งวดในเดือนนี้
        const { startDate: start1, endDate: end1 } = getPeriodDates(
          yearNum,
          monthNum,
          1
        );
        const { startDate: start2, endDate: end2 } = getPeriodDates(
          yearNum,
          monthNum,
          2
        );

        // ดึงข้อมูลงวดที่ 1
        const { data: att1 } = await supabase
          .from("daily_attendance")
          .select("*")
          .eq("employee_id", employee.employee_id)
          .gte("work_date", start1)
          .lte("work_date", end1);

        const { data: leave1 } = await supabase
          .from("leave_records")
          .select("*")
          .eq("employee_id", employee.employee_id)
          .gte("leave_date", start1)
          .lte("leave_date", end1)
          .or("status.eq.approved,leave_able.eq.true");

        const { data: adj1 } = await supabase
          .from("wage_adjustments")
          .select("*")
          .eq("employee_id", employee.employee_id)
          .eq("year", yearNum)
          .eq("month", monthNum)
          .eq("period", 1);

        // ดึงข้อมูลงวดที่ 2
        const { data: att2 } = await supabase
          .from("daily_attendance")
          .select("*")
          .eq("employee_id", employee.employee_id)
          .gte("work_date", start2)
          .lte("work_date", end2);

        const { data: leave2 } = await supabase
          .from("leave_records")
          .select("*")
          .eq("employee_id", employee.employee_id)
          .gte("leave_date", start2)
          .lte("leave_date", end2)
          .or("status.eq.approved,leave_able.eq.true");

        const { data: adj2 } = await supabase
          .from("wage_adjustments")
          .select("*")
          .eq("employee_id", employee.employee_id)
          .eq("year", yearNum)
          .eq("month", monthNum)
          .eq("period", 2);

        // ดึง Morning OT Allowance
        const { data: morningOT1 } = await supabase
          .from("morning_ot_allowances")
          .select("allowed_hours, selected_dates")
          .eq("employee_id", employee.employee_id)
          .eq("year", yearNum)
          .eq("month", monthNum)
          .eq("period", 1)
          .single();

        const { data: morningOT2 } = await supabase
          .from("morning_ot_allowances")
          .select("allowed_hours, selected_dates")
          .eq("employee_id", employee.employee_id)
          .eq("year", yearNum)
          .eq("month", monthNum)
          .eq("period", 2)
          .single();

        const morningOTAllowance1 = morningOT1?.allowed_hours || 0;
        const morningOTAllowance2 = morningOT2?.allowed_hours || 0;
        const selectedDates1 = morningOT1?.selected_dates || null;
        const selectedDates2 = morningOT2?.selected_dates || null;

        // คำนวณค่าจ้างทั้ง 2 งวด
        const wage1 = calculatePeriodWageV2(
          employeeInfo,
          convertAttendances(att1 || []),
          convertLeaves(leave1 || []),
          convertAdjustments(adj1 || []),
          { startDate: start1, endDate: end1 },
          morningOTAllowance1,
          selectedDates1
        );

        const wage2 = calculatePeriodWageV2(
          employeeInfo,
          convertAttendances(att2 || []),
          convertLeaves(leave2 || []),
          convertAdjustments(adj2 || []),
          { startDate: start2, endDate: end2 },
          morningOTAllowance2,
          selectedDates2
        );

        // คำนวณภาษี Cumulative
        const taxCalc1 = calculateEmployeeTax(
          wage1.total_income,
          ytdIncome,
          ytdTax,
          monthNum,
          1,
          ytdSSO
        );

        const taxCalc2 = calculateEmployeeTax(
          wage2.total_income,
          ytdIncome + wage1.total_income,
          ytdTax + taxCalc1.currentPeriodTax,
          monthNum,
          2,
          ytdSSO + Math.min(wage1.total_income * 0.05, 750)
        );

        const monthlyIncome = wage1.total_income + wage2.total_income;
        const monthlyTax =
          taxCalc1.currentPeriodTax + taxCalc2.currentPeriodTax;

        yearlyIncome += monthlyIncome;
        yearlyTax += monthlyTax;

        // อัปเดต YTD
        ytdIncome += monthlyIncome;
        ytdTax += monthlyTax;
        ytdSSO += Math.min(monthlyIncome * 0.05, 750);
      }

      // ข้ามพนักงานที่ไม่มีรายได้
      if (yearlyIncome <= 0) continue;

      // แยกชื่อและนามสกุล
      const nameParts = employee.name?.split(" ") || ["", ""];
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      pnd1GorEmployees.push({
        sequence: pnd1GorEmployees.length + 1,
        idNumber: employee.id_card_number || "",
        titleName: employee.title_name || "",
        firstName,
        lastName,
        address: employee.address || "",
        totalIncome: Math.round(yearlyIncome * 100) / 100,
        totalTax: Math.round(yearlyTax * 100) / 100,
        incomeType: "40(1)" as const,
      });

      totalIncome += yearlyIncome;
      totalTax += yearlyTax;
    }

    const pnd1GorData: PND1GorData = {
      companyTaxId: DEFAULT_COMPANY_INFO.companyTaxId,
      companyName: DEFAULT_COMPANY_INFO.companyName,
      companyBranch: DEFAULT_COMPANY_INFO.companyBranch,
      companyAddress: DEFAULT_COMPANY_INFO.companyAddress,
      postalCode: DEFAULT_COMPANY_INFO.postalCode,
      phone: DEFAULT_COMPANY_INFO.phone,
      taxYear: yearNum + 543, // แปลงเป็น พ.ศ.
      summary: {
        employeeCount: pnd1GorEmployees.length,
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalTax: Math.round(totalTax * 100) / 100,
      },
      employees: pnd1GorEmployees,
    };

    return NextResponse.json({
      success: true,
      data: pnd1GorData,
    });
  } catch (error: any) {
    console.error("Error generating PND1Gor data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
