const fs = require('fs');
const path = require('path');

// อ่านไฟล์ CSV
const csvPath = path.join(__dirname, 'employee_data_typhoon_cleaned.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// แยก rows
const lines = csvContent.split('\n').filter(line => line.trim());
const headers = lines[0].replace(/^\uFEFF/, '').split(','); // Remove BOM
const rows = lines.slice(1);

console.log('-- ============================================');
console.log('-- เพิ่มคอลัมน์ใหม่ให้กับ table employees');
console.log('-- ============================================\n');

console.log('-- เพิ่มคอลัมน์ข้อมูลส่วนตัว');
console.log('ALTER TABLE public.employees');
console.log('ADD COLUMN IF NOT EXISTS section character varying(100),');
console.log('ADD COLUMN IF NOT EXISTS position character varying(100),');
console.log('ADD COLUMN IF NOT EXISTS gender character varying(20),');
console.log('ADD COLUMN IF NOT EXISTS nationality character varying(50),');
console.log('ADD COLUMN IF NOT EXISTS citizenship character varying(50),');
console.log('ADD COLUMN IF NOT EXISTS religion character varying(50),');
console.log('ADD COLUMN IF NOT EXISTS birth_date date,');
console.log('ADD COLUMN IF NOT EXISTS start_date date;\n');

console.log('-- เพิ่มคอลัมน์เอกสารและภาษี');
console.log('ALTER TABLE public.employees');
console.log('ADD COLUMN IF NOT EXISTS tax_id character varying(20),');
console.log('ADD COLUMN IF NOT EXISTS social_security character varying(20);\n');

console.log('-- เพิ่มคอลัมน์กองทุนและสวัสดิการ');
console.log('ALTER TABLE public.employees');
console.log('ADD COLUMN IF NOT EXISTS provident_fund numeric(10, 2) DEFAULT 0.0,');
console.log('ADD COLUMN IF NOT EXISTS company_provident_fund numeric(10, 2) DEFAULT 0.0,');
console.log('ADD COLUMN IF NOT EXISTS provident_fund_deduction numeric(10, 2) DEFAULT 0.0,');
console.log('ADD COLUMN IF NOT EXISTS social_fund_deduction numeric(10, 2) DEFAULT 0.0,');
console.log('ADD COLUMN IF NOT EXISTS life_insurance numeric(10, 2) DEFAULT 0.0,');
console.log('ADD COLUMN IF NOT EXISTS housing_loan numeric(10, 2) DEFAULT 0.0,');
console.log('ADD COLUMN IF NOT EXISTS teacher_fund numeric(10, 2) DEFAULT 0.0,');
console.log('ADD COLUMN IF NOT EXISTS rmf_fund numeric(10, 2) DEFAULT 0.0;\n');

console.log('-- เพิ่ม indexes สำหรับคอลัมน์ที่ค้นหาบ่อย');
console.log('CREATE INDEX IF NOT EXISTS idx_employees_section ON public.employees USING btree (section);');
console.log('CREATE INDEX IF NOT EXISTS idx_employees_position ON public.employees USING btree (position);');
console.log('CREATE INDEX IF NOT EXISTS idx_employees_gender ON public.employees USING btree (gender);');
console.log('CREATE INDEX IF NOT EXISTS idx_employees_start_date ON public.employees USING btree (start_date);\n');

console.log('-- ============================================');
console.log('-- อัพเดทข้อมูลจาก CSV');
console.log('-- ============================================\n');

// ฟังก์ชันแปลงวันที่จากรูปแบบ DD/MM/YYYY เป็น YYYY-MM-DD
function convertDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return null;

  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;

  const day = parts[0].padStart(2, '0');
  const month = parts[1].padStart(2, '0');
  const year = parts[2];

  return `${year}-${month}-${day}`;
}

// ฟังก์ชัน escape string สำหรับ SQL
function sqlEscape(str) {
  if (str === null || str === undefined || str === '') return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

// ฟังก์ชันแปลงตัวเลข
function sqlNumber(numStr) {
  if (!numStr || numStr.trim() === '') return '0.0';
  return parseFloat(numStr) || 0.0;
}

// สร้าง UPDATE statements
rows.forEach((row, index) => {
  const values = row.split(',');

  if (values.length < headers.length) return; // Skip incomplete rows

  const employee = {};
  headers.forEach((header, i) => {
    employee[header.trim()] = values[i] ? values[i].trim() : '';
  });

  const employeeId = employee.employee_id;
  if (!employeeId) return;

  const birthDate = convertDate(employee.birth_date);
  const startDate = convertDate(employee.start_date);

  console.log(`-- อัพเดทข้อมูลพนักงาน ID: ${employeeId}`);
  console.log('UPDATE public.employees');
  console.log('SET');
  console.log(`  section = ${sqlEscape(employee.section)},`);
  console.log(`  position = ${sqlEscape(employee.position)},`);
  console.log(`  gender = ${sqlEscape(employee.gender)},`);
  console.log(`  nationality = ${sqlEscape(employee.nationality)},`);
  console.log(`  citizenship = ${sqlEscape(employee.citizenship)},`);
  console.log(`  religion = ${sqlEscape(employee.religion)},`);
  console.log(`  birth_date = ${birthDate ? `'${birthDate}'` : 'NULL'},`);
  console.log(`  tax_id = ${sqlEscape(employee.tax_id)},`);
  console.log(`  social_security = ${sqlEscape(employee.social_security)},`);
  console.log(`  provident_fund = ${sqlNumber(employee.provident_fund)},`);
  console.log(`  start_date = ${startDate ? `'${startDate}'` : 'NULL'},`);
  console.log(`  company_provident_fund = ${sqlNumber(employee.company_provident_fund)},`);
  console.log(`  provident_fund_deduction = ${sqlNumber(employee.provident_fund_deduction)},`);
  console.log(`  social_fund_deduction = ${sqlNumber(employee.social_fund_deduction)},`);
  console.log(`  life_insurance = ${sqlNumber(employee.life_insurance)},`);
  console.log(`  housing_loan = ${sqlNumber(employee.housing_loan)},`);
  console.log(`  teacher_fund = ${sqlNumber(employee.teacher_fund)},`);
  console.log(`  rmf_fund = ${sqlNumber(employee.rmf_fund)}`);
  console.log(`WHERE employee_id = '${employeeId}';\n`);
});

console.log('-- ============================================');
console.log('-- เสร็จสิ้นการอัพเดท');
console.log('-- ============================================');
