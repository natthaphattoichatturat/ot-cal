const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://clmzzsyxrymhbfvyclwe.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsbXp6c3l4cnltaGJmdnljbHdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjMxMjY4NCwiZXhwIjoyMDc3ODg4Njg0fQ.a-cCHBfXJG21Y-V8wVgaRG__U_o3T9QzE_XW84PW6pM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function addColumns() {
  console.log('🚀 Adding columns to employees table via SQL...\n');

  const sql = `
    -- เพิ่มคอลัมน์ข้อมูลส่วนตัว
    ALTER TABLE public.employees
    ADD COLUMN IF NOT EXISTS section character varying(100),
    ADD COLUMN IF NOT EXISTS position character varying(100),
    ADD COLUMN IF NOT EXISTS gender character varying(20),
    ADD COLUMN IF NOT EXISTS nationality character varying(50),
    ADD COLUMN IF NOT EXISTS citizenship character varying(50),
    ADD COLUMN IF NOT EXISTS religion character varying(50),
    ADD COLUMN IF NOT EXISTS birth_date date,
    ADD COLUMN IF NOT EXISTS start_date date;

    -- เพิ่มคอลัมน์เอกสารและภาษี
    ALTER TABLE public.employees
    ADD COLUMN IF NOT EXISTS tax_id character varying(20),
    ADD COLUMN IF NOT EXISTS social_security character varying(20);

    -- เพิ่มคอลัมน์กองทุนและสวัสดิการ
    ALTER TABLE public.employees
    ADD COLUMN IF NOT EXISTS provident_fund numeric(10, 2) DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS company_provident_fund numeric(10, 2) DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS provident_fund_deduction numeric(10, 2) DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS social_fund_deduction numeric(10, 2) DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS life_insurance numeric(10, 2) DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS housing_loan numeric(10, 2) DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS teacher_fund numeric(10, 2) DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS rmf_fund numeric(10, 2) DEFAULT 0.0;

    -- เพิ่ม indexes
    CREATE INDEX IF NOT EXISTS idx_employees_section ON public.employees USING btree (section);
    CREATE INDEX IF NOT EXISTS idx_employees_position ON public.employees USING btree (position);
    CREATE INDEX IF NOT EXISTS idx_employees_gender ON public.employees USING btree (gender);
    CREATE INDEX IF NOT EXISTS idx_employees_start_date ON public.employees USING btree (start_date);
  `;

  try {
    // ใช้ rpc เพื่อรัน SQL
    const { data, error } = await supabase.rpc('exec', { sql });

    if (error) {
      console.error('❌ Error:', error);

      // ลองอีกวิธี - ใช้ from().select() เพื่อทดสอบว่า connection ทำงาน
      console.log('\n📝 Trying alternative method: Testing connection...');
      const { data: testData, error: testError } = await supabase
        .from('employees')
        .select('employee_id')
        .limit(1);

      if (testError) {
        console.error('❌ Connection test failed:', testError);
      } else {
        console.log('✅ Connection successful!');
        console.log('\n⚠️  Please run the SQL manually in Supabase Dashboard:');
        console.log('   1. Go to: https://supabase.com/dashboard/project/clmzzsyxrymhbfvyclwe/editor');
        console.log('   2. Go to SQL Editor');
        console.log('   3. Copy and run the SQL from: add_columns_migration.sql\n');
      }
    } else {
      console.log('✅ Columns added successfully!');
      console.log('Data:', data);
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
    console.log('\n⚠️  Please run the SQL manually in Supabase Dashboard:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/clmzzsyxrymhbfvyclwe/editor');
    console.log('   2. Go to SQL Editor');
    console.log('   3. Copy and run the SQL from: add_columns_migration.sql\n');
  }
}

addColumns();
