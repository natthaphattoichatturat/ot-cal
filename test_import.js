const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabase = createClient(
  'https://clmzzsyxrymhbfvyclwe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsbXp6c3l4cnltaGJmdnljbHdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTI2ODQsImV4cCI6MjA3Nzg4ODY4NH0.bD0qROMjMvSYgLi21OLsvv5cvp6-YaQPRaLIx1rbveE'
)

async function testCalculation() {
  console.log('Testing OT calculation...\n')
  
  // Get sample scans from 26 Oct
  const { data: scans } = await supabase
    .from('attendance_scans')
    .select('*')
    .eq('scan_date', '2025-10-26')
    .eq('employee_id', '20056315')
    .order('scan_time')
  
  console.log('Sample scans for employee 20056315 on 26 Oct:')
  if (scans && scans.length > 0) {
    scans.forEach(s => {
      console.log('  ' + s.scan_time + ' - Type: ' + s.scan_type)
    })
  } else {
    console.log('  No scans found')
  }
  
  // Check if this employee has attendance record
  const { data: att } = await supabase
    .from('daily_attendance')
    .select('*')
    .eq('work_date', '2025-10-26')
    .eq('employee_id', '20056315')
  
  console.log('\nAttendance record for 26 Oct:')
  if (att && att.length > 0) {
    console.log('  Found:', att[0])
  } else {
    console.log('  NOT FOUND - This is the problem!')
  }
}

testCalculation().catch(console.error)
