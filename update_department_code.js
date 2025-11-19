const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials
const SUPABASE_URL = 'https://clmzzsyxrymhbfvyclwe.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_pVh3YLa0hZyEEFAX12my7g_IAu4lKwk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateDepartmentCodes() {
  console.log('🚀 Updating department_code column...\n');

  try {
    // Test connection
    console.log('🔍 Testing connection...');
    const { data: testData, error: testError } = await supabase
      .from('employees')
      .select('employee_id')
      .limit(1);

    if (testError) {
      console.error('❌ Connection failed:', testError);
      return;
    }
    console.log('✅ Connection successful\n');

    // อ่านไฟล์ CSV
    const csvPath = path.join(__dirname, 'employee_data_typhoon_cleaned.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    // แยก rows
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].replace(/^\uFEFF/, '').split(',').map(h => h.trim());
    const rows = lines.slice(1);

    // หา index ของคอลัมน์ที่ต้องการ
    const employeeIdIndex = headers.indexOf('employee_id');
    const departmentCodeIndex = headers.indexOf('department_code');

    if (employeeIdIndex === -1 || departmentCodeIndex === -1) {
      console.error('❌ Required columns not found in CSV');
      console.log('   Headers:', headers);
      return;
    }

    console.log(`📊 Found ${rows.length} employee records\n`);
    console.log('📝 Updating department_code...\n');

    let successCount = 0;
    let errorCount = 0;
    let notFoundCount = 0;

    // Process each employee
    for (let i = 0; i < rows.length; i++) {
      const values = rows[i].split(',');
      if (values.length < headers.length) continue;

      const employeeId = values[employeeIdIndex]?.trim();
      const departmentCode = values[departmentCodeIndex]?.trim();

      if (!employeeId) continue;

      // Update employee record
      const { data, error } = await supabase
        .from('employees')
        .update({
          department_code: departmentCode || null
        })
        .eq('employee_id', employeeId)
        .select();

      if (error) {
        // ตรวจสอบว่าเป็น error เรื่อง column ไม่มีหรือไม่
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          console.error(`\n❌ Column 'department_code' does not exist!`);
          console.error(`   Please run add_department_code.sql in Supabase SQL Editor first.\n`);
          process.exit(1);
        }

        errorCount++;
        if (errorCount <= 5) {
          console.error(`   ❌ Error updating ${employeeId}: ${error.message}`);
        }
      } else if (!data || data.length === 0) {
        notFoundCount++;
        if (notFoundCount <= 5) {
          console.log(`   ⚠️  Employee ${employeeId} not found`);
        }
      } else {
        successCount++;
        if ((i + 1) % 100 === 0) {
          console.log(`   ✓ Updated ${i + 1}/${rows.length} records...`);
        }
      }
    }

    console.log(`\n✅ Update completed!\n`);
    console.log('Summary:');
    console.log(`  - Total records in CSV: ${rows.length}`);
    console.log(`  - Successfully updated: ${successCount}`);
    console.log(`  - Not found: ${notFoundCount}`);
    console.log(`  - Errors: ${errorCount}`);

    if (errorCount > 5) {
      console.log(`\n⚠️  Note: Only first 5 errors were shown`);
    }
    if (notFoundCount > 5) {
      console.log(`⚠️  Note: Only first 5 "not found" warnings were shown`);
    }

  } catch (error) {
    console.error('\n❌ Update failed:', error.message);
    process.exit(1);
  }
}

// Run
updateDepartmentCodes();
