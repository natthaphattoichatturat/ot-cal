const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://clmzzsyxrymhbfvyclwe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsbXp6c3l4cnltaGJmdnljbHdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTI2ODQsImV4cCI6MjA3Nzg4ODY4NH0.bD0qROMjMvSYgLi21OLsvv5cvp6-YaQPRaLIx1rbveE'
)

async function checkColumns() {
  console.log('Checking daily_attendance table structure...\n')
  
  const { data, error } = await supabase
    .from('daily_attendance')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('Error:', error)
  } else if (data && data.length > 0) {
    console.log('Columns found:')
    Object.keys(data[0]).sort().forEach(col => {
      console.log('  - ' + col)
    })
    
    const hasNew = data[0].hasOwnProperty('ot_normal_hours')
    console.log('\nHas new OT columns:', hasNew)
    
    if (!hasNew) {
      console.log('\nWARNING: Missing new columns!')
      console.log('Need to add: ot_normal_hours, ot_special_hours, ot_premium_hours')
    }
  } else {
    console.log('No data in table')
  }
}

checkColumns().catch(console.error)
