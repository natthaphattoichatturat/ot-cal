const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials - ใช้ key ที่ให้มา
const SUPABASE_URL = 'https://clmzzsyxrymhbfvyclwe.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_pVh3YLa0hZyEEFAX12my7g_IAu4lKwk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  const { data, error } = await supabase
    .from('employees')
    .select('employee_id, name')
    .limit(3);

  if (error) {
    console.error('❌ Connection failed:', error);
    return false;
  }

  console.log('✅ Connection successful!');
  console.log(`   Found ${data.length} sample employees\n`);
  return true;
}

async function runMigration() {
  console.log('🚀 Starting employee data migration...\n');

  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    console.log('\n⚠️  Cannot connect to Supabase. Please check your credentials.\n');
    return;
  }

  try {
    // อ่านไฟล์ CSV
    const csvPath = path.join(__dirname, 'employee_data_typhoon_cleaned.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    // แยก rows
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].replace(/^\uFEFF/, '').split(',');
    const rows = lines.slice(1);

    console.log(`📊 Found ${rows.length} employee records to process\n`);

    // ฟังก์ชันแปลงวันที่
    function convertDate(dateStr) {
      if (!dateStr || dateStr.trim() === '') return null;
      const parts = dateStr.split('/');
      if (parts.length !== 3) return null;
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }

    // ฟังก์ชันแปลงตัวเลข
    function parseNumber(numStr) {
      if (!numStr || numStr.trim() === '') return 0.0;
      return parseFloat(numStr) || 0.0;
    }

    let successCount = 0;
    let errorCount = 0;
    let notFoundCount = 0;

    console.log('📝 Updating employee records...\n');

    // Process each employee
    for (let i = 0; i < rows.length; i++) {
      const values = rows[i].split(',');
      if (values.length < headers.length) continue;

      const employee = {};
      headers.forEach((header, idx) => {
        employee[header.trim()] = values[idx] ? values[idx].trim() : '';
      });

      const employeeId = employee.employee_id;
      if (!employeeId) continue;

      const birthDate = convertDate(employee.birth_date);
      const startDate = convertDate(employee.start_date);

      // Update employee record
      const { data, error } = await supabase
        .from('employees')
        .update({
          department_code: employee.department_code || null,
          section: employee.section || null,
          position: employee.position || null,
          gender: employee.gender || null,
          nationality: employee.nationality || null,
          citizenship: employee.citizenship || null,
          religion: employee.religion || null,
          birth_date: birthDate,
          tax_id: employee.tax_id || null,
          social_security: employee.social_security || null,
          provident_fund: parseNumber(employee.provident_fund),
          start_date: startDate,
          company_provident_fund: parseNumber(employee.company_provident_fund),
          provident_fund_deduction: parseNumber(employee.provident_fund_deduction),
          social_fund_deduction: parseNumber(employee.social_fund_deduction),
          life_insurance: parseNumber(employee.life_insurance),
          housing_loan: parseNumber(employee.housing_loan),
          teacher_fund: parseNumber(employee.teacher_fund),
          rmf_fund: parseNumber(employee.rmf_fund)
        })
        .eq('employee_id', employeeId)
        .select();

      if (error) {
        // ตรวจสอบว่าเป็น error เรื่อง column ไม่มีหรือไม่
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          console.error(`\n❌ Column does not exist! Please run add_columns_migration.sql first.\n`);
          console.error(`   Error: ${error.message}\n`);
          process.exit(1);
        }

        errorCount++;
        if (errorCount <= 5) {
          console.error(`   ❌ Error updating ${employeeId}: ${error.message}`);
        }
      } else if (!data || data.length === 0) {
        notFoundCount++;
        if (notFoundCount <= 5) {
          console.log(`   ⚠️  Employee ${employeeId} not found in database`);
        }
      } else {
        successCount++;
        if ((i + 1) % 100 === 0) {
          console.log(`   ✓ Processed ${i + 1}/${rows.length} records...`);
        }
      }
    }

    console.log(`\n✅ Migration completed!\n`);
    console.log('Summary:');
    console.log(`  - Total records in CSV: ${rows.length}`);
    console.log(`  - Successful updates: ${successCount}`);
    console.log(`  - Employees not found: ${notFoundCount}`);
    console.log(`  - Errors: ${errorCount}`);

    if (errorCount > 5) {
      console.log(`\n⚠️  Note: Only first 5 errors were shown`);
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// เรียกใช้ function
runMigration();
