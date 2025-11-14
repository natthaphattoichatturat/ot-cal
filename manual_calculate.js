const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://clmzzsyxrymhbfvyclwe.supabase.co',
  'sb_secret_pVh3YLa0hZyEEFAX12my7g_IAu4lKwk'
)

async function manualCalculate() {
  console.log('Manual OT calculation for 26 Oct - 4 Nov\n')
  
  // Get all scans in this range
  const { data: scans, error } = await supabase
    .from('attendance_scans')
    .select('*')
    .gte('scan_date', '2025-10-26')
    .lte('scan_date', '2025-11-04')
  
  if (error) {
    console.error('Error fetching scans:', error)
    return
  }
  
  console.log('Total scans found:', scans.length)
  
  // Trigger calculation by calling the API endpoint
  console.log('\nNOTE: Cannot call API from script.')
  console.log('Please try re-uploading the file through the web interface.')
  console.log('\nOR manually insert a test record to trigger calculation:')
  console.log('1. Go to Supabase Dashboard')
  console.log('2. Table Editor -> attendance_scans')
  console.log('3. Insert a new row with date 2025-10-26')
  console.log('4. Delete it immediately')
  console.log('5. Re-upload the file')
}

manualCalculate().catch(console.error)
