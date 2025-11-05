import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types based on database schema
export interface Employee {
  id: number
  employee_id: string
  name: string
  department: string
  perday_salary: number | null
  perhr_salary: number | null
  bank_id: number | null
  bank_account: number | null
  identity_id: number | null
  created_at: string
  updated_at: string
}

export interface AttendanceScan {
  id: number
  machine_id: string
  scan_date: string
  scan_time: string
  employee_id: string
  scan_type: 1 | 2 // 1 = IN, 2 = OUT
  created_at: string
}

export interface DailyAttendance {
  id: number
  employee_id: string
  work_date: string
  check_in_time: string | null
  check_out_time: string | null
  scheduled_in_time: string | null
  scheduled_out_time: string | null
  actual_hours: number
  ot_hours: number
  is_holiday: boolean
  is_leave: boolean
  late: boolean
  late_hours: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SpecialHoliday {
  id: number
  holiday_date: string
  holiday_name: string
  is_national: boolean
  description: string | null
  created_at: string
  updated_at: string
}

export interface LeaveRecord {
  id: number
  employee_id: string
  leave_date: string
  leave_type: string
  reason: string | null
  created_by: string | null
  created_at: string
}
