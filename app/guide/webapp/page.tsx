'use client'

export default function WebAppGuidePage() {
  return (
    <div className="app-container">
      <div className="page-header">
        <h1 className="page-title">คู่มือการใช้งาน Web Application</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          ระบบคำนวณชั่วโมง OT พนักงาน
        </p>
      </div>

      <div className="card" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ lineHeight: '1.8', fontSize: '15px' }}>

          {/* Section 1 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--primary-light)' }}>
              1. ภาพรวมของระบบ
            </h2>
            <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
              ระบบ Web Application สำหรับคำนวณและจัดการข้อมูลเวลาทำงานล่วงเวลา (OT) ของพนักงาน ประกอบด้วยหน้าหลัก 3 หน้า
            </p>
            <ul style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
              <li style={{ marginBottom: '8px' }}><strong>หน้าหลัก (Dashboard OT)</strong> - แสดงตารางข้อมูล OT รายวัน รายเดือน และรายงวด</li>
              <li style={{ marginBottom: '8px' }}><strong>หน้าจัดการพนักงาน</strong> - เพิ่ม แก้ไข ลบ และนำเข้าข้อมูลพนักงาน</li>
              <li style={{ marginBottom: '8px' }}><strong>หน้าบันทึกการลา</strong> - บันทึกและจัดการข้อมูลการลาของพนักงาน</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--primary-light)' }}>
              2. หน้าหลัก - ตารางคำนวณ OT
            </h2>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              2.1 ระบบงวดการจ่ายเงิน
            </h3>
            <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
              ระบบแบ่งข้อมูลออกเป็น 2 งวดต่อเดือน ตามรอบการจ่ายเงินเดือน
            </p>
            <ul style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
              <li style={{ marginBottom: '8px' }}><strong>งวดที่ 1:</strong> วันที่ 26 ของเดือนก่อนหน้า ถึง วันที่ 10 ของเดือนปัจจุบัน</li>
              <li style={{ marginBottom: '8px' }}><strong>งวดที่ 2:</strong> วันที่ 11 ถึง วันที่ 25 ของเดือนปัจจุบัน</li>
            </ul>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              2.2 การค้นหาพนักงาน
            </h3>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>วิธีการค้นหา:</strong>
              </p>
              <ol style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>พิมพ์รหัสพนักงานหรือชื่อในช่องค้นหา</li>
                <li style={{ marginBottom: '8px' }}>ระบบจะแสดงรายชื่อที่ตรงกันในรูปแบบ Autocomplete</li>
                <li style={{ marginBottom: '8px' }}>เลือกพนักงานด้วยการคลิก หรือใช้ลูกศรขึ้น-ลง และกด Enter</li>
                <li style={{ marginBottom: '8px' }}>กด Escape เพื่อปิดรายการแนะนำ</li>
              </ol>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              2.3 การเลือกเดือนและปี
            </h3>
            <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
              ใช้ Dropdown เลือกเดือนและปี พ.ศ. ที่ต้องการดูข้อมูล ระบบจะโหลดข้อมูลใหม่ทันทีเมื่อมีการเปลี่ยนแปลง
            </p>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              2.4 การนำเข้าข้อมูลการสแกน
            </h3>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>ขั้นตอนการนำเข้าข้อมูล:</strong>
              </p>
              <ol style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>คลิกปุ่ม "Choose File" และเลือกไฟล์ .txt จากเครื่องสแกนใบหน้า</li>
                <li style={{ marginBottom: '8px' }}>ตรวจสอบชื่อไฟล์ที่เลือกให้ถูกต้อง</li>
                <li style={{ marginBottom: '8px' }}>คลิกปุ่ม "นำเข้าข้อมูล"</li>
                <li style={{ marginBottom: '8px' }}>รอระบบประมวลผล ระบบจะแสดงข้อความแจ้งผลลัพธ์</li>
                <li style={{ marginBottom: '8px' }}>หากสำเร็จ ข้อมูลจะถูกคำนวณและอัพเดทในตารางทันที</li>
              </ol>
              <p style={{ marginTop: '12px', padding: '12px', background: 'var(--warning-light)', borderLeft: '4px solid var(--warning)', color: 'var(--text-secondary)', borderRadius: '4px' }}>
                <strong>หรือมายเหตุ:</strong> ไฟล์ต้องเป็นรูปแบบ .txt จากเครื่องสแกนเท่านั้น มีรูปแบบ: MachineID | Date | Time | EmployeeID | ScanType
              </p>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              2.5 การอ่านตาราง OT
            </h3>
            <ul style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
              <li style={{ marginBottom: '8px' }}><strong>คอลัมน์วันที่:</strong> แสดงเลขวันที่และวันในสัปดาห์ (จ. อ. พ. พฤ. ศ. ส. อา.)</li>
              <li style={{ marginBottom: '8px' }}><strong>สีพื้นหลัง:</strong> แต่ละวันมีสีพื้นหลังแตกต่างกันเล็กน้อยเพื่อความสะดวกในการอ่าน</li>
              <li style={{ marginBottom: '8px' }}><strong>เลข OT:</strong> แสดงจำนวนชั่วโมง OT ทศนิยม 2 ตำแหน่ง</li>
              <li style={{ marginBottom: '8px' }}><strong>คอลัมน์รวม OT:</strong> แสดงผลรวมชั่วโมง OT ทั้งงวด (พื้นหลังสีฟ้าอ่อน)</li>
              <li style={{ marginBottom: '8px' }}><strong>Tooltip:</strong> วางเมาส์บนเซลล์วันที่มีข้อมูลเพื่อดูเวลาเข้า-ออกและชั่วโมงจริงที่ทำงาน</li>
            </ul>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              2.6 กฎการคำนวณ OT
            </h3>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>รองรับ 2 กะการทำงาน:</strong>
              </p>
              <ul style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>กะที่ 1 (08:00-17:00):</strong>
                  <ul style={{ marginLeft: '20px', marginTop: '6px' }}>
                    <li>OT เช้า: 06:00-08:00 (สูงสุด 2 ชั่วโมง)</li>
                    <li>OT เย็น: 17:30 เป็นต้นไป</li>
                  </ul>
                </li>
                <li style={{ marginBottom: '8px', marginTop: '8px' }}>
                  <strong>กะที่ 2 (20:00-05:00 วันถัดไป):</strong>
                  <ul style={{ marginLeft: '20px', marginTop: '6px' }}>
                    <li>OT เย็น: 17:30-20:00</li>
                    <li>OT เช้า: 05:30 เป็นต้นไปของวันถัดไป</li>
                  </ul>
                </li>
              </ul>
              <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>
                <strong>อัตราการคูณ OT:</strong>
              </p>
              <ul style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>วันปกติ: × 1.5</li>
                <li style={{ marginBottom: '8px' }}>วันหยุด/อาทิตย์: 8 ชั่วโมงแรก × 2, เกิน 8 ชั่วโมง × 3</li>
                <li style={{ marginBottom: '8px' }}>การปัดเศษ: ปัดลงเป็นหน่วย 30 นาที</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--primary-light)' }}>
              3. หน้าจัดการพนักงาน
            </h2>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              3.1 การดูรายชื่อพนักงาน
            </h3>
            <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
              คลิกปุ่ม "จัดการพนักงาน" จากหน้าหลัก จะแสดงตารางรายชื่อพนักงานทั้งหมดพร้อมข้อมูล:
            </p>
            <ul style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
              <li style={{ marginBottom: '8px' }}>รหัสพนักงาน</li>
              <li style={{ marginBottom: '8px' }}>ชื่อ-นามสกุล</li>
              <li style={{ marginBottom: '8px' }}>แผนก (Department)</li>
              <li style={{ marginBottom: '8px' }}>รหัสแผนกย่อย (Division Code)</li>
              <li style={{ marginBottom: '8px' }}>รหัสส่วนงาน (Section Code)</li>
              <li style={{ marginBottom: '8px' }}>เลขบัตรประชาชน</li>
              <li style={{ marginBottom: '8px' }}>ที่อยู่</li>
              <li style={{ marginBottom: '8px' }}>LINE ID</li>
              <li style={{ marginBottom: '8px' }}>สถานะ (active, inactive, removed)</li>
            </ul>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              3.2 การค้นหาพนักงาน
            </h3>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                มี 2 ช่องค้นหาแยกกัน:
              </p>
              <ul style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}><strong>ค้นหาตามชื่อ:</strong> พิมพ์ชื่อหรือนามสกุล</li>
                <li style={{ marginBottom: '8px' }}><strong>ค้นหาตามรหัส:</strong> พิมพ์รหัสพนักงาน</li>
              </ul>
              <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
                สามารถใช้ทั้ง 2 ช่องพร้อมกันเพื่อกรองผลลัพธ์ได้
              </p>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              3.3 การเรียงลำดับข้อมูล
            </h3>
            <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
              คลิกที่หัวคอลัมน์ใดก็ได้ในตาราง จะเรียงข้อมูลจากน้อยไปมาก (Ascending) คลิกซ้ำอีกครั้งจะเรียงจากมากไปน้อย (Descending)
            </p>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              3.4 การเพิ่มพนักงาน
            </h3>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>ขั้นตอน:</strong>
              </p>
              <ol style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>คลิกปุ่ม "เพิ่มพนักงาน"</li>
                <li style={{ marginBottom: '8px' }}>กรอกข้อมูลในแบบฟอร์ม (ช่องที่มีเครื่องหมาย * ต้องกรอก)</li>
                <li style={{ marginBottom: '8px' }}>ตรวจสอบความถูกต้องของข้อมูล</li>
                <li style={{ marginBottom: '8px' }}>คลิกปุ่ม "บันทึก"</li>
                <li style={{ marginBottom: '8px' }}>ระบบจะแจ้งผลและกลับไปหน้ารายชื่อพนักงาน</li>
              </ol>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              3.5 การแก้ไขข้อมูลพนักงาน
            </h3>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>ขั้นตอน:</strong>
              </p>
              <ol style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>คลิกที่แถวของพนักงานที่ต้องการแก้ไข</li>
                <li style={{ marginBottom: '8px' }}>ในหน้ารายละเอียด คลิกปุ่ม "แก้ไขข้อมูล"</li>
                <li style={{ marginBottom: '8px' }}>แก้ไขข้อมูลที่ต้องการเปลี่ยนแปลง</li>
                <li style={{ marginBottom: '8px' }}>คลิกปุ่ม "บันทึกการเปลี่ยนแปลง"</li>
              </ol>
              <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>
                หรือสามารถคลิกปุ่ม "แก้ไขพนักงาน" ในเมนูหลักและค้นหาพนักงานที่ต้องการได้
              </p>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              3.6 การลบ/ปิดการใช้งานพนักงาน
            </h3>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>ขั้นตอน:</strong>
              </p>
              <ol style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>คลิกปุ่ม "ลบพนักงาน" ในเมนูหลัก</li>
                <li style={{ marginBottom: '8px' }}>ค้นหาและเลือกพนักงานที่ต้องการปิดการใช้งาน</li>
                <li style={{ marginBottom: '8px' }}>ยืนยันการดำเนินการ</li>
              </ol>
              <p style={{ marginTop: '12px', padding: '12px', background: 'var(--danger-light)', borderLeft: '4px solid var(--danger)', color: 'var(--text-secondary)', borderRadius: '4px' }}>
                <strong>ข้อควรระวัง:</strong> การลบพนักงานจะเปลี่ยนสถานะเป็น "removed" และไม่แสดงในรายการหลัก แต่ข้อมูลประวัติยังคงอยู่ในระบบ
              </p>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              3.7 การนำเข้าพนักงานจำนวนมาก (Bulk Import)
            </h3>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>ขั้นตอน:</strong>
              </p>
              <ol style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>คลิกปุ่ม "นำเข้าพนักงาน"</li>
                <li style={{ marginBottom: '8px' }}>เตรียมไฟล์ CSV หรือ Excel ตามรูปแบบที่กำหนด</li>
                <li style={{ marginBottom: '8px' }}>อัพโหลดไฟล์</li>
                <li style={{ marginBottom: '8px' }}>ตรวจสอบข้อมูลที่นำเข้า</li>
                <li style={{ marginBottom: '8px' }}>ยืนยันการนำเข้า</li>
              </ol>
              <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>
                <strong>คอลัมน์ที่ต้องมีในไฟล์:</strong> รหัสพนักงาน, ชื่อ, แผนก, Division Code, Section Code, เลขบัตรประชาชน, ที่อยู่
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--primary-light)' }}>
              4. หน้าบันทึกการลา
            </h2>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              4.1 การบันทึกการลา
            </h3>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>ขั้นตอน:</strong>
              </p>
              <ol style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>คลิกปุ่ม "บันทึกการลา" จากหน้าหลัก</li>
                <li style={{ marginBottom: '8px' }}>เลือกพนักงานที่ต้องการบันทึกการลา</li>
                <li style={{ marginBottom: '8px' }}>เลือกประเภทการลา (ลาป่วย, ลากิจ, ลาพักร้อน, ฯลฯ)</li>
                <li style={{ marginBottom: '8px' }}>เลือกวันที่ลา</li>
                <li style={{ marginBottom: '8px' }}>กรอกเหตุผล/หมายเหตุ (ถ้ามี)</li>
                <li style={{ marginBottom: '8px' }}>คลิกปุ่ม "บันทึก"</li>
              </ol>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              4.2 การดูประวัติการลา
            </h3>
            <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
              ในหน้าบันทึกการลาจะแสดงประวัติการลาทั้งหมด สามารถกรองตามวันที่ ประเภทการลา หรือสถานะการอนุมัติได้
            </p>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              4.3 การเชื่อมโยงกับระบบ LINE
            </h3>
            <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
              เมื่อบันทึกการลาในระบบ Web หากพนักงานมีการลงทะเบียน LINE ID ไว้ ระบบจะส่งการแจ้งเตือนไปยัง LINE อัตโนมัติ
            </p>
          </section>

          {/* Section 5 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--primary-light)' }}>
              5. เคล็ดลับการใช้งาน
            </h2>
            <ul style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
              <li style={{ marginBottom: '12px' }}>
                <strong>การดูรายละเอียดเซลล์:</strong> วางเมาส์บนเซลล์ในตารางเพื่อดูเวลาเข้า-ออกและชั่วโมงทำงานจริง
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>การ Scroll แนวนอน:</strong> หัวตารางและคอลัมน์รหัสพนักงานจะติดอยู่ (Sticky) เพื่อความสะดวกในการดู
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>Keyboard Shortcuts:</strong> ใช้ลูกศรขึ้น-ลงในช่องค้นหาเพื่อเลือกพนักงาน กด Enter เพื่อยืนยัน
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>การรีเฟรชข้อมูล:</strong> หลังจากนำเข้าข้อมูลใหม่ ระบบจะโหลดข้อมูลใหม่อัตโนมัติ
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>การดูข้อมูลย้อนหลัง:</strong> สามารถเลือกดูข้อมูล OT ย้อนหลังได้ 5 ปี
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--primary-light)' }}>
              6. ปัญหาที่พบบ่อยและการแก้ไข
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Q: ไม่พบข้อมูล OT ของพนักงาน
              </h4>
              <p style={{ marginLeft: '16px', color: 'var(--text-secondary)' }}>
                A: ตรวจสอบว่าได้นำเข้าข้อมูลการสแกนสำหรับเดือนและงวดนั้นแล้วหรือไม่ และตรวจสอบว่ารหัสพนักงานในไฟล์สแกนตรงกับในระบบ
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Q: การนำเข้าไฟล์ล้มเหลว
              </h4>
              <p style={{ marginLeft: '16px', color: 'var(--text-secondary)' }}>
                A: ตรวจสอบว่าไฟล์เป็นนามสกุล .txt และมีรูปแบบข้อมูลถูกต้องตามที่กำหนด
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Q: ตัวเลข OT ไม่ตรงกับที่คาดหวัง
              </h4>
              <p style={{ marginLeft: '16px', color: 'var(--text-secondary)' }}>
                A: ระบบคำนวณตามกฎที่กำหนดไว้ (อัตราคูณ, การปัดเศษ, ประเภทวัน) ตรวจสอบเวลาเข้า-ออกในแต่ละวันและเทียบกับกฎการคำนวณ
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Q: ไม่สามารถแก้ไขข้อมูลพนักงานได้
              </h4>
              <p style={{ marginLeft: '16px', color: 'var(--text-secondary)' }}>
                A: ตรวจสอบสิทธิ์การเข้าถึงของคุณ เฉพาะ HR Admin เท่านั้นที่สามารถแก้ไขข้อมูลพนักงานได้
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--primary-light)' }}>
              7. การติดต่อและขอความช่วยเหลือ
            </h2>
            <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
              หากพบปัญหาหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อทีม IT Support หรือทีมพัฒนาระบบ
            </p>
            <div style={{ marginTop: '16px', padding: '16px', background: 'var(--info-light)', borderLeft: '4px solid var(--info)', borderRadius: '4px' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                <strong>สำหรับคู่มือการใช้งานระบบ LINE:</strong> กรุณาดูที่หน้า "คู่มือการใช้งาน LINE System"
              </p>
            </div>
          </section>

        </div>

        {/* Navigation */}
        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '2px solid var(--border-light)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="/" className="btn btn-primary">
            กลับสู่หน้าหลัก
          </a>
          <a href="/guide/line" className="btn btn-secondary">
            ดูคู่มือระบบ LINE
          </a>
        </div>
      </div>
    </div>
  )
}
