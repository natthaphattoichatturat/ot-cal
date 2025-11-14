const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://clmzzsyxrymhbfvyclwe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsbXp6c3l4cnltaGJmdnljbHdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTI2ODQsImV4cCI6MjA3Nzg4ODY4NH0.bD0qROMjMvSYgLi21OLsvv5cvp6-YaQPRaLIx1rbveE'
)

async function checkData() {
  console.log('Checking attendance_scans')
  
  const { data: scans, error: scanError } = await supabase
    .from('attendance_scans')
    .select('scan_date, employee_id')
    .gte('scan_date', '2025-10-25')
    .lte('scan_date', '2025-11-04')
    .order('scan_date')
  
  if (scanError) {
    console.error('Error:', scanError)
  } else {
    console.log('Total scans (25 Oct - 4 Nov):', scans.length)
    
    const byDate = {}
    scans.forEach(s => {
      if (!byDate[s.scan_date]) byDate[s.scan_date] = 0
      byDate[s.scan_date]++
    })
    console.log('By date:')
    Object.keys(byDate).sort().forEach(date => {
      console.log('  ' + date + ': ' + byDate[date])
    })
  }
  
  console.log('\nChecking daily_attendance')
  
  const { data: attendance, error: attError } = await supabase
    .from('daily_attendance')
    .select('work_date, employee_id, ot_hours')
    .gte('work_date', '2025-10-24')
    .lte('work_date', '2025-11-05')
    .order('work_date')
  
  if (attError) {
    console.error('Error:', attError)
  } else {
    console.log('Total attendance (24 Oct - 5 Nov):', attendance.length)
    
    const byDate = {}
    attendance.forEach(a => {
      if (!byDate[a.work_date]) byDate[a.work_date] = 0
      byDate[a.work_date]++
    })
    console.log('By date:')
    Object.keys(byDate).sort().forEach(date => {
      console.log('  ' + date + ': ' + byDate[date])
    })
  }
}

checkData().catch(console.error)
