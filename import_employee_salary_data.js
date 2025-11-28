/**
 * Import Employee Salary Data from CSV
 * อัพเดทข้อมูล monthly_salary และ employment_type ในตาราง employees
 *
 * การใช้งาน:
 * node import_employee_salary_data.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://clmzzsyxrymhbfvyclwe.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_pVh3YLa0hZyEEFAX12my7g_IAu4lKwk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ฟังก์ชันอ่านและ parse CSV แบบ manual (ไม่ใช้ library เพิ่มเติม)
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());

  const data = [];
  for (let i = 1; i < lines.length; i++) {
    // จัดการกับ comma ในข้อมูลโดยใช้ regex แบบง่าย
    // แยกตาม comma แต่ไม่แยกถ้าอยู่ใน quotes
    const values = parseCSVLine(lines[i]);

    if (values && values.length >= headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ? values[index].trim() : '';
      });
      data.push(row);
    }
  }

  return data;
}

// ฟังก์ชัน parse CSV line แบบง่าย (รองรับ comma ในข้อมูล)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current); // เพิ่มข้อมูลสุดท้าย
  return result;
}

// ฟังก์ชันหลักสำหรับ import ข้อมูล
async function importEmployeeSalaryData() {
  console.log('🚀 เริ่มการนำเข้าข้อมูลเงินเดือนพนักงาน...');

  try {
    // อ่านไฟล์ CSV
    const csvPath = path.join(__dirname, 'employee_data_typhoon_cleaned.csv');
    const csvText = fs.readFileSync(csvPath, 'utf8');
    const csvData = parseCSV(csvText);

    console.log(`📊 พบข้อมูลพนักงานทั้งหมด: ${csvData.length} รายการ`);

    // เตรียมข้อมูลสำหรับ upsert
    const updateData = csvData
      .filter(row => row.employee_id && row.employee_id.trim()) // กรองข้อมูลที่ไม่มี employee_id
      .map(row => ({
        employee_id: row.employee_id,
        monthly_salary: row.monthly_salary && row.monthly_salary !== '' ? parseFloat(row.monthly_salary) : 0,
        employment_type: row.employment_type || null,
        updated_at: new Date().toISOString()
      }))
      .filter(item => item.employee_id); // กรองอีกครั้งหลังการ map

    console.log(`✅ เตรียมข้อมูลสำหรับอัพเดท: ${updateData.length} รายการ`);

    // แสดงตัวอย่างข้อมูลที่จะอัพเดท
    console.log('\n📋 ตัวอย่างข้อมูลที่จะอัพเดท:');
    updateData.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. ${item.employee_id}: monthly_salary=${item.monthly_salary}, employment_type=${item.employment_type}`);
    });

    if (updateData.length === 0) {
      console.log('❌ ไม่พบข้อมูลที่ถูกต้องสำหรับการอัพเดท');
      return;
    }

    // ตรวจสอบว่าพนักงานเหล่านี้มีอยู่ในฐานข้อมูลหรือไม่
    console.log('\n🔍 กำลังตรวจสอบข้อมูลพนักงานที่มีอยู่ในฐานข้อมูล...');
    const employeeIds = updateData.map(item => item.employee_id);

    const { data: existingEmployees, error: checkError } = await supabase
      .from('employees')
      .select('employee_id, name')
      .in('employee_id', employeeIds);

    if (checkError) {
      console.error('❌ ไม่สามารถตรวจสอบข้อมูลพนักงานได้:', checkError.message);
      return;
    }

    const existingEmployeeIds = new Set(existingEmployees.map(emp => emp.employee_id));
    const missingEmployees = updateData.filter(item => !existingEmployeeIds.has(item.employee_id));

    if (missingEmployees.length > 0) {
      console.log(`⚠️ พบพนักงาน ${missingEmployees.length} คนที่ไม่มีอยู่ในฐานข้อมูล:`);
      missingEmployees.slice(0, 5).forEach(emp => {
        console.log(`  - ${emp.employee_id}`);
      });
      if (missingEmployees.length > 5) {
        console.log(`  ... และอีก ${missingEmployees.length - 5} คน`);
      }
    }

    // กรองเฉพาะพนักงานที่มีอยู่ในฐานข้อมูล
    const validUpdateData = updateData.filter(item => existingEmployeeIds.has(item.employee_id));
    console.log(`\n✅ พนักงานที่มีอยู่ในฐานข้อมูล: ${validUpdateData.length} คน`);
    console.log(`❌ พนักงานที่ไม่มีในฐานข้อมูล: ${missingEmployees.length} คน`);

    if (validUpdateData.length === 0) {
      console.log('❌ ไม่มีพนักงานที่สามารถอัพเดทได้');
      return;
    }

    // ทำการ update ข้อมูลเป็น batch แทน upsert เพื่อหลีกเลี่ยงปัญหา NOT NULL constraints
    const BATCH_SIZE = 25; // ลดขนาด batch ลงเพราะแต่ละรายการเป็น query แยก
    let totalProcessed = 0;
    let totalErrors = 0;

    for (let i = 0; i < validUpdateData.length; i += BATCH_SIZE) {
      const batch = updateData.slice(i, i + BATCH_SIZE);
      console.log(`\n🔄 กำลังอัพเดท batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(validUpdateData.length / BATCH_SIZE)} (${batch.length} รายการ)...`);

      // Update แต่ละรายการใน batch แยกกัน
      for (const employeeData of batch) {
        try {
          const { data, error } = await supabase
            .from('employees')
            .update({
              monthly_salary: employeeData.monthly_salary,
              employment_type: employeeData.employment_type,
              updated_at: employeeData.updated_at
            })
            .eq('employee_id', employeeData.employee_id)
            .select('employee_id, monthly_salary, employment_type');

          if (error) {
            console.error(`❌ อัพเดท ${employeeData.employee_id} เกิดข้อผิดพลาด:`, error.message);
            totalErrors++;
          } else if (data && data.length > 0) {
            totalProcessed++;
          } else {
            console.log(`⚠️ ไม่พบพนักงาน ${employeeData.employee_id} ในฐานข้อมูล`);
          }
        } catch (updateError) {
          console.error(`💥 อัพเดท ${employeeData.employee_id} เกิดข้อผิดพลาดร้ายแรง:`, updateError.message);
          totalErrors++;
        }

        // เพิ่ม delay เล็กน้อยระหว่างแต่ละ update เพื่อไม่ให้ server overload
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1} เสร็จสิ้น (${batch.length} รายการ)`);
    }

    // สรุปผลการทำงาน
    console.log('\n🎉 การนำเข้าข้อมูลเสร็จสิ้น!');
    console.log(`✅ สำเร็จ: ${totalProcessed} รายการ`);
    console.log(`❌ เกิดข้อผิดพลาด: ${totalErrors} รายการ`);
    console.log(`📈 รวมทั้งหมด: ${totalProcessed + totalErrors} รายการ`);

    // ตรวจสอบข้อมูลหลังการอัพเดท
    if (totalProcessed > 0) {
      console.log('\n🔍 ตรวจสอบข้อมูลตัวอย่างหลังการอัพเดท...');

      const { data: sampleData, error: checkError } = await supabase
        .from('employees')
        .select('employee_id, monthly_salary, employment_type')
        .in('employee_id', validUpdateData.slice(0, 3).map(d => d.employee_id))
        .limit(3);

      if (!checkError && sampleData) {
        console.log('📋 ข้อมูลหลังการอัพเดท:');
        sampleData.forEach(item => {
          console.log(`  ${item.employee_id}: monthly_salary=${item.monthly_salary}, employment_type=${item.employment_type}`);
        });
      }
    }

  } catch (error) {
    console.error('💥 เกิดข้อผิดพลาดร้ายแรง:', error.message);
    process.exit(1);
  }
}

// ตรวจสอบว่ามีไฟล์ CSV หรือไม่ก่อนเริ่ม
const csvPath = path.join(__dirname, 'employee_data_typhoon_cleaned.csv');
if (!fs.existsSync(csvPath)) {
  console.error(`❌ ไม่พบไฟล์ CSV: ${csvPath}`);
  console.log('กรุณาตรวจสอบว่าไฟล์ employee_data_typhoon_cleaned.csv อยู่ในโฟลเดอร์เดียวกันกับไฟล์นี้');
  process.exit(1);
}

// เรียกใช้ฟังก์ชันหลัก
importEmployeeSalaryData()
  .then(() => {
    console.log('\n✨ เสร็จสิ้นการทำงาน');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 เกิดข้อผิดพลาด:', error.message);
    process.exit(1);
  });
