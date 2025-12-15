const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runSQLMigration() {
  console.log('🚀 Running wage_adjustment_logs.sql migration...\n');

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'sql', 'wage_adjustment_logs.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    console.log('📄 SQL file loaded, executing...\n');

    // Execute the entire SQL file at once
    console.log('⚡ Executing SQL migration...');

    // Note: This might not work with complex SQL. If it fails, you may need to run this manually in Supabase Console
    const { error } = await supabase.rpc('exec', { query: sqlContent });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      console.log('\n⚠️  Please run the SQL file manually in Supabase Console:');
      console.log('   File: sql/wage_adjustment_logs.sql\n');
      return;
    }

    console.log('✅ Migration executed successfully!\n');

    // Test the view
    console.log('🧪 Testing wage_adjustments_combined view...');
    const { data, error: viewError } = await supabase
      .from('wage_adjustments_combined')
      .select('count', { count: 'exact', head: true });

    if (viewError) {
      console.error('❌ View test failed:', viewError.message);
    } else {
      console.log(`✅ View created successfully! Found ${data} records`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n⚠️  Please run the SQL file manually in Supabase Console:');
    console.log('   File: sql/wage_adjustment_logs.sql\n');
  }
}

runSQLMigration();
