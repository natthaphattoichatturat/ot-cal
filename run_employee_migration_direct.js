const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials
const SUPABASE_URL = 'https://clmzzsyxrymhbfvyclwe.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsbXp6c3l4cnltaGJmdnljbHdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjMxMjY4NCwiZXhwIjoyMDc3ODg4Njg0fQ.a-cCHBfXJG21Y-V8wVgaRG__U_o3T9QzE_XW84PW6pM';

// ใช้ postgres client แทน
const { Client } = require('pg');

async function runMigration() {
  console.log('🚀 Starting employee data migration...\n');

  // สร้าง PostgreSQL connection string
  // Format: postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
  const connectionString = `postgresql://postgres.clmzzsyxrymhbfvyclwe:${encodeURIComponent('sb_secret_pVh3YLa0hZyEEFAX12my7g_IAu4lKwk')}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`;

  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL\n');

    // อ่านไฟล์ SQL
    const sqlPath = path.join(__dirname, 'update_employee_data.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // แยก SQL statements
    const statements = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

    // รัน ALTER TABLE statements ก่อน
    console.log('📝 Step 1: Adding new columns to employees table...');
    const alterStatements = statements.filter(stmt => stmt.startsWith('ALTER TABLE'));

    for (const sql of alterStatements) {
      try {
        await client.query(sql);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.error('❌ Error executing ALTER TABLE:', error.message);
        }
      }
    }
    console.log('✅ Columns added successfully\n');

    // รัน CREATE INDEX statements
    console.log('📝 Step 2: Creating indexes...');
    const indexStatements = statements.filter(stmt => stmt.startsWith('CREATE INDEX'));

    for (const sql of indexStatements) {
      try {
        await client.query(sql);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.error('❌ Error creating index:', error.message);
        }
      }
    }
    console.log('✅ Indexes created successfully\n');

    // รัน UPDATE statements
    console.log('📝 Step 3: Updating employee data...');
    const updateStatements = statements.filter(stmt => stmt.startsWith('UPDATE'));

    console.log(`   Processing ${updateStatements.length} employee records...`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < updateStatements.length; i++) {
      const sql = updateStatements[i];

      try {
        await client.query(sql);
        successCount++;

        if ((i + 1) % 100 === 0) {
          console.log(`   ✓ Processed ${i + 1}/${updateStatements.length} records...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Error updating record ${i + 1}:`, error.message);
      }
    }

    console.log(`\n✅ Step 3 completed: ${successCount} successful, ${errorCount} errors\n`);

    console.log('🎉 Migration completed!\n');
    console.log('Summary:');
    console.log(`  - Total statements executed: ${statements.length}`);
    console.log(`  - Successful updates: ${successCount}`);
    console.log(`  - Errors: ${errorCount}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// เรียกใช้ function
runMigration();
