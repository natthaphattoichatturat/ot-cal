const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://clmzzsyxrymhbfvyclwe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsbXp6c3l4cnltaGJmdnljbHdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTI2ODQsImV4cCI6MjA3Nzg4ODY4NH0.bD0qROMjMvSYgLi21OLsvv5cvp6-YaQPRaLIx1rbveE'
)

async function checkEmployees() {
  console.log('Checking employees...\n')
  
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('employee_id, name')
    .limit(10)
  
  if (empError) {
    console.error('Error:', empError)
  } else {
    console.log('Total employees:', employees.length)
    console.log('Sample employees:')
    employees.forEach(e => {
      console.log('  ' + e.employee_id + ': ' + e.name)
    })
  }
  
  console.log('\nChecking scan employee IDs...')
  const { data: scans } = await supabase
    .from('attendance_scans')
    .select('employee_id')
    .gte('scan_date', '2025-10-26')
    .lte('scan_date', '2025-11-04')
    .limit(10)
  
  if (scans && scans.length > 0) {
    const uniqueIds = [...new Set(scans.map(s => s.employee_id))].slice(0, 5)
    console.log('Sample employee IDs from new scans:', uniqueIds.join(', '))
  }
}

checkEmployees().catch(console.error)
