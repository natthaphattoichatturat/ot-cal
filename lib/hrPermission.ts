import { supabase } from './supabase'

/**
 * Check if a LINE user has HR permissions
 * Requirements:
 * 1. User must have line_id_hr registered in employees table
 * 2. User must be in admin_etec department
 * 3. User must have active status
 */
export async function checkHRPermission(lineUserId: string): Promise<{
  allowed: boolean
  employee?: any
  error?: string
}> {
  try {
    // Query employee by HR LINE ID
    const { data: employee, error } = await supabase
      .from('employees')
      .select('*')
      .eq('line_id_hr', lineUserId)
      .eq('status', 'active')
      .single()

    if (error || !employee) {
      return {
        allowed: false,
        error: 'ไม่พบข้อมูลพนักงานในระบบ กรุณาลงทะเบียน HR LINE OA ก่อน',
      }
    }

    // Check if user is in admin_etec department
    if (employee.department !== 'admin_etec') {
      return {
        allowed: false,
        employee,
        error: 'คุณไม่มีสิทธิ์เข้าถึงระบบ HR (เฉพาะแผนก admin_etec เท่านั้น)',
      }
    }

    // User has permission
    return {
      allowed: true,
      employee,
    }
  } catch (error) {
    console.error('Permission check error:', error)
    return {
      allowed: false,
      error: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์',
    }
  }
}

/**
 * API route helper to check HR permission
 * Returns NextResponse with error if not allowed
 */
export async function requireHRPermission(lineUserId: string) {
  const result = await checkHRPermission(lineUserId)

  if (!result.allowed) {
    return {
      hasPermission: false,
      error: result.error,
      employee: result.employee,
    }
  }

  return {
    hasPermission: true,
    employee: result.employee,
  }
}
