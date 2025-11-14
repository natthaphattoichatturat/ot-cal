'use client'

export default function LineGuidePage() {
  return (
    <div className="app-container">
      <div className="page-header">
        <h1 className="page-title">คู่มือการใช้งาน LINE System</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          ระบบ LINE OA สำหรับพนักงานและฝ่ายทรัพยากรบุคคล
        </p>
      </div>

      <div className="card" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ lineHeight: '1.8', fontSize: '15px' }}>

          {/* Section 1 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--primary-light)' }}>
              1. ภาพรวมระบบ LINE
            </h2>
            <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
              ระบบ LINE OA แบ่งออกเป็น 2 บัญชีหลัก เพื่อแยกการทำงานระหว่างพนักงานทั่วไปและเจ้าหน้าที่ฝ่ายทรัพยากรบุคคล
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '20px' }}>
              <div style={{ background: 'var(--surface-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '12px', color: 'var(--primary)' }}>
                  LINE OA สำหรับพนักงาน
                </h3>
                <ul style={{ marginLeft: '20px', color: 'var(--text-secondary)' }}>
                  <li style={{ marginBottom: '8px' }}>ลงทะเบียนเข้าระบบ</li>
                  <li style={{ marginBottom: '8px' }}>เช็คอิน-เช็คเอาท์</li>
                  <li style={{ marginBottom: '8px' }}>ขออนุมัติการลา</li>
                  <li style={{ marginBottom: '8px' }}>ดูข้อมูล OT ของตนเอง</li>
                  <li style={{ marginBottom: '8px' }}>ประเมินผลงานด้วย AI</li>
                  <li style={{ marginBottom: '8px' }}>นัดหมายประชุมกับ HR</li>
                </ul>
              </div>

              <div style={{ background: 'var(--surface-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '12px', color: 'var(--primary)' }}>
                  LINE OA สำหรับ HR
                </h3>
                <ul style={{ marginLeft: '20px', color: 'var(--text-secondary)' }}>
                  <li style={{ marginBottom: '8px' }}>ลงทะเบียน HR Admin</li>
                  <li style={{ marginBottom: '8px' }}>จัดการข้อมูลพนักงาน</li>
                  <li style={{ marginBottom: '8px' }}>อนุมัติ/ปฏิเสธการลา</li>
                  <li style={{ marginBottom: '8px' }}>ดูข้อมูล OT ทั้งหมด</li>
                  <li style={{ marginBottom: '8px' }}>Dashboard วิเคราะห์ข้อมูล</li>
                  <li style={{ marginBottom: '8px' }}>AI Chatbot ตอบคำถาม</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--primary-light)' }}>
              2. สำหรับพนักงาน - การใช้งาน LINE OA
            </h2>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              2.1 การลงทะเบียนเข้าระบบ
            </h3>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>ขั้นตอนการลงทะเบียน:</strong>
              </p>
              <ol style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>เพิ่มเพื่อน LINE OA สำหรับพนักงาน (สอบถาม QR Code จากฝ่าย HR)</li>
                <li style={{ marginBottom: '8px' }}>คลิกเมนู "ลงทะเบียน" ในหน้า Rich Menu</li>
                <li style={{ marginBottom: '8px' }}>กรอกข้อมูลส่วนตัว:
                  <ul style={{ marginLeft: '20px', marginTop: '6px' }}>
                    <li>รหัสพนักงาน</li>
                    <li>เลขบัตรประชาชน 13 หลัก</li>
                    <li>ชื่อ-นามสกุล</li>
                  </ul>
                </li>
                <li style={{ marginBottom: '8px' }}>กดปุ่ม "ยืนยันการลงทะเบียน"</li>
                <li style={{ marginBottom: '8px' }}>ระบบจะแสดงข้อความยืนยันเมื่อลงทะเบียนสำเร็จ</li>
              </ol>
              <p style={{ marginTop: '12px', padding: '12px', background: 'var(--info-light)', borderLeft: '4px solid var(--info)', color: 'var(--text-secondary)', borderRadius: '4px' }}>
                <strong>หมายเหตุ:</strong> ข้อมูลที่กรอกต้องตรงกับข้อมูลในระบบที่ฝ่าย HR บันทึกไว้ หากลงทะเบียนไม่สำเร็จ กรุณาติดต่อฝ่าย HR
              </p>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              2.2 การเช็คอิน-เช็คเอาท์ผ่าน LINE
            </h3>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>ขั้นตอนการเช็คอิน:</strong>
              </p>
              <ol style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>เปิด LINE OA และคลิกเมนู "เช็คอิน/เช็คเอาท์"</li>
                <li style={{ marginBottom: '8px' }}>ระบบจะเปิดหน้า LIFF (LINE Front-end Framework)</li>
                <li style={{ marginBottom: '8px' }}>ตรวจสอบข้อมูลที่แสดง (ชื่อ, รหัสพนักงาน, วันที่)</li>
                <li style={{ marginBottom: '8px' }}>กดปุ่ม "เช็คอิน" เมื่อเริ่มงาน</li>
                <li style={{ marginBottom: '8px' }}>ระบบจะบันทึกเวลาและส่งข้อความยืนยัน</li>
              </ol>

              <p style={{ marginTop: '16px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>ขั้นตอนการเช็คเอาท์:</strong>
              </p>
              <ol style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>เปิดเมนูเดิม "เช็คอิน/เช็คเอาท์"</li>
                <li style={{ marginBottom: '8px' }}>กดปุ่ม "เช็คเอาท์" เมื่อเลิกงาน</li>
                <li style={{ marginBottom: '8px' }}>ระบบจะคำนวณชั่วโมงทำงานและแสดงสรุป</li>
              </ol>

              <p style={{ marginTop: '12px', padding: '12px', background: 'var(--warning-light)', borderLeft: '4px solid var(--warning)', color: 'var(--text-secondary)', borderRadius: '4px' }}>
                <strong>ข้อควรทราบ:</strong>
              </p>
              <ul style={{ marginLeft: '24px', marginTop: '8px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>ระบบตรวจจับกะงานอัตโนมัติตามเวลาที่เช็คอิน</li>
                <li style={{ marginBottom: '8px' }}>สามารถเช็คอิน-เช็คเอาท์ได้วันละ 1 ครั้ง</li>
                <li style={{ marginBottom: '8px' }}>หากเช็คเอาท์ไม่ได้ กรุณาติดต่อฝ่าย HR</li>
                <li style={{ marginBottom: '8px' }}>การบันทึกนี้แยกจากข้อมูล OT จากเครื่องสแกนใบหน้า</li>
              </ul>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              2.3 การขออนุมัติการลา
            </h3>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>ขั้นตอนการขอลา:</strong>
              </p>
              <ol style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>คลิกเมนู "ขออนุมัติการลา" ใน Rich Menu</li>
                <li style={{ marginBottom: '8px' }}>เลือกประเภทการลา:
                  <ul style={{ marginLeft: '20px', marginTop: '6px' }}>
                    <li>ลาป่วย</li>
                    <li>ลากิจ</li>
                    <li>ลาพักร้อน</li>
                    <li>อื่นๆ (ระบุ)</li>
                  </ul>
                </li>
                <li style={{ marginBottom: '8px' }}>เลือกวันที่ต้องการลา (สามารถเลือกหลายวันได้)</li>
                <li style={{ marginBottom: '8px' }}>กรอกเหตุผล/รายละเอียดการลา</li>
                <li style={{ marginBottom: '8px' }}>กดปุ่ม "ส่งคำขอ"</li>
                <li style={{ marginBottom: '8px' }}>ระบบจะส่งคำขอไปยังฝ่าย HR ทันที</li>
                <li style={{ marginBottom: '8px' }}>รอรับการแจ้งเตือนผลการอนุมัติผ่าน LINE</li>
              </ol>

              <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>
                <strong>สถานะการลา:</strong>
              </p>
              <ul style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}><strong>รออนุมัติ:</strong> คำขอถูกส่งแล้ว รอ HR พิจารณา</li>
                <li style={{ marginBottom: '8px' }}><strong>อนุมัติ:</strong> HR อนุมัติการลาแล้ว</li>
                <li style={{ marginBottom: '8px' }}><strong>ปฏิเสธ:</strong> HR ปฏิเสธคำขอ พร้อมระบุเหตุผล</li>
              </ul>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              2.4 การดูข้อมูล OT ของตนเอง
            </h3>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>ขั้นตอน:</strong>
              </p>
              <ol style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>คลิกเมนู "ดู OT ของฉัน"</li>
                <li style={{ marginBottom: '8px' }}>เลือกเดือนและปีที่ต้องการดูข้อมูล</li>
                <li style={{ marginBottom: '8px' }}>ระบบจะแสดงตารางข้อมูล OT รายวัน</li>
                <li style={{ marginBottom: '8px' }}>แสดงสรุปรวม OT ทั้งเดือนและแยกตามงวด</li>
              </ol>
              <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>
                <strong>ข้อมูลที่แสดง:</strong> วันที่, เวลาเข้า-ออก, ชั่วโมงทำงานจริง, ชั่วโมง OT, สถานะวันหยุด/ลา
              </p>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              2.5 การนัดหมายประชุมกับ HR
            </h3>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>ขั้นตอน:</strong>
              </p>
              <ol style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>คลิกเมนู "นัดหมายประชุม"</li>
                <li style={{ marginBottom: '8px' }}>เลือกวันและเวลาที่ต้องการ</li>
                <li style={{ marginBottom: '8px' }}>ระบุหัวข้อ/วัตถุประสงค์ของการประชุม</li>
                <li style={{ marginBottom: '8px' }}>กดปุ่ม "ส่งคำขอนัดหมาย"</li>
                <li style={{ marginBottom: '8px' }}>รอรับการยืนยันจากฝ่าย HR</li>
              </ol>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              2.6 การประเมินผลงานด้วย AI
            </h3>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>ขั้นตอน:</strong>
              </p>
              <ol style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>คลิกเมนู "ประเมินผลงาน AI"</li>
                <li style={{ marginBottom: '8px' }}>ระบบจะวิเคราะห์ข้อมูลการทำงานของคุณ</li>
                <li style={{ marginBottom: '8px' }}>แสดงผลการประเมิน ข้อเสนอแนะ และแนวทางพัฒนา</li>
                <li style={{ marginBottom: '8px' }}>สามารถบันทึกหรือแชร์ผลการประเมินได้</li>
              </ol>
            </div>
          </section>

          {/* Section 3 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--primary-light)' }}>
              3. สำหรับ HR - การใช้งาน LINE OA
            </h2>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              3.1 การลงทะเบียน HR Admin
            </h3>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>ขั้นตอนการลงทะเบียน:</strong>
              </p>
              <ol style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>เพิ่มเพื่อน LINE OA สำหรับ HR (QR Code แยกต่างหาก)</li>
                <li style={{ marginBottom: '8px' }}>คลิกเมนู "ลงทะเบียน Admin"</li>
                <li style={{ marginBottom: '8px' }}>กรอกรหัสผ่าน Admin (ติดต่อผู้ดูแลระบบ)</li>
                <li style={{ marginBottom: '8px' }}>กรอกข้อมูลส่วนตัว: ชื่อ, เลขบัตรประชาชน, รหัสพนักงาน</li>
                <li style={{ marginBottom: '8px' }}>ยืนยันการลงทะเบียน</li>
                <li style={{ marginBottom: '8px' }}>ระบบจะสร้างบัญชี HR Admin ให้อัตโนมัติ</li>
              </ol>
              <p style={{ marginTop: '12px', padding: '12px', background: 'var(--danger-light)', borderLeft: '4px solid var(--danger)', color: 'var(--text-secondary)', borderRadius: '4px' }}>
                <strong>ข้อควรระวัง:</strong> รหัสผ่าน Admin เป็นความลับ ห้ามเปิดเผยแก่บุคคลที่ไม่ได้รับอนุญาต
              </p>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              3.2 การจัดการข้อมูลพนักงานผ่าน LINE
            </h3>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>ฟังก์ชันที่ใช้ได้:</strong>
              </p>
              <ul style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}><strong>ดูรายชื่อพนักงาน:</strong> แสดงตารางพนักงานทั้งหมด</li>
                <li style={{ marginBottom: '8px' }}><strong>เพิ่มพนักงาน:</strong> เปิดแบบฟอร์มเพิ่มพนักงานใหม่</li>
                <li style={{ marginBottom: '8px' }}><strong>แก้ไขพนักงาน:</strong> เลือกพนักงานและแก้ไขข้อมูล</li>
                <li style={{ marginBottom: '8px' }}><strong>ลบพนักงาน:</strong> ปิดการใช้งานบัญชีพนักงาน</li>
              </ul>
              <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>
                ทุกฟังก์ชันทำงานเหมือนกับ Web Application แต่อยู่ในรูปแบบ LIFF ที่เหมาะกับหน้าจอมือถือ
              </p>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              3.3 การอนุมัติ/ปฏิเสธการลา
            </h3>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>ขั้นตอน:</strong>
              </p>
              <ol style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>เมื่อพนักงานส่งคำขอลา HR จะได้รับการแจ้งเตือนผ่าน LINE ทันที</li>
                <li style={{ marginBottom: '8px' }}>LINE จะแสดงข้อมูลคำขอ:
                  <ul style={{ marginLeft: '20px', marginTop: '6px' }}>
                    <li>ชื่อพนักงาน, รหัสพนักงาน</li>
                    <li>ประเภทการลา</li>
                    <li>วันที่ลา</li>
                    <li>เหตุผล</li>
                  </ul>
                </li>
                <li style={{ marginBottom: '8px' }}>คลิกปุ่ม "อนุมัติ" หรือ "ปฏิเสธ"</li>
                <li style={{ marginBottom: '8px' }}>หากปฏิเสธ ให้กรอกเหตุผล</li>
                <li style={{ marginBottom: '8px' }}>ระบบจะอัพเดทและแจ้งผลให้พนักงานทราบทันที</li>
              </ol>
              <p style={{ marginTop: '12px', padding: '12px', background: 'var(--info-light)', borderLeft: '4px solid var(--info)', color: 'var(--text-secondary)', borderRadius: '4px' }}>
                <strong>หมายเหตุ:</strong> การอนุมัติจะอัพเดทข้อมูลในฐานข้อมูลและตารางการคำนวณ OT อัตโนมัติ
              </p>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              3.4 การดูข้อมูล OT ของพนักงานทั้งหมด
            </h3>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>ขั้นตอน:</strong>
              </p>
              <ol style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>คลิกเมนู "ดูข้อมูล OT ทั้งหมด"</li>
                <li style={{ marginBottom: '8px' }}>เลือกเดือน ปี และงวด</li>
                <li style={{ marginBottom: '8px' }}>ระบบจะแสดงตาราง OT ของพนักงานทุกคน</li>
                <li style={{ marginBottom: '8px' }}>สามารถกรองและค้นหาพนักงานได้</li>
                <li style={{ marginBottom: '8px' }}>ดูรายละเอียดแต่ละคนโดยคลิกที่แถว</li>
              </ol>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              3.5 HR Dashboard และการวิเคราะห์ข้อมูล
            </h3>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>ฟีเจอร์ใน Dashboard:</strong>
              </p>
              <ul style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}><strong>สรุปภาพรวม:</strong> จำนวนพนักงานทั้งหมด, OT รวม, การลาในเดือน</li>
                <li style={{ marginBottom: '8px' }}><strong>กราฟแสดงแนวโน้ม:</strong> OT เฉลี่ย, เปรียบเทียบรายเดือน</li>
                <li style={{ marginBottom: '8px' }}><strong>รายงานพิเศษ:</strong> พนักงานที่ทำ OT สูงสุด, แผนกที่มี OT มากที่สุด</li>
                <li style={{ marginBottom: '8px' }}><strong>การวิเคราะห์ด้วย AI:</strong> คำแนะนำในการจัดการทรัพยากรบุคคล</li>
              </ul>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              3.6 AI Chatbot สำหรับ HR
            </h3>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>วิธีใช้งาน:</strong>
              </p>
              <ol style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>พิมพ์ข้อความในแชท LINE OA สำหรับ HR</li>
                <li style={{ marginBottom: '8px' }}>AI จะตอบคำถามเกี่ยวกับ:
                  <ul style={{ marginLeft: '20px', marginTop: '6px' }}>
                    <li>นโยบายการลา</li>
                    <li>กฎหมายแรงงาน</li>
                    <li>การคำนวณ OT</li>
                    <li>ข้อมูลสถิติพนักงาน</li>
                    <li>คำแนะนำด้าน HR</li>
                  </ul>
                </li>
                <li style={{ marginBottom: '8px' }}>ระบบจะตอบกลับด้วย AI ที่ได้รับการฝึกฝนมาเฉพาะด้าน HR</li>
              </ol>
              <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>
                <strong>ตัวอย่างคำถาม:</strong> "สรุป OT เดือนนี้", "พนักงานกี่คนยังไม่ได้เช็คอิน", "นโยบายการลาป่วยคืออะไร"
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--primary-light)' }}>
              4. การแจ้งเตือนและ Notification
            </h2>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              4.1 การแจ้งเตือนสำหรับพนักงาน
            </h3>
            <ul style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
              <li style={{ marginBottom: '8px' }}>ยืนยันการเช็คอิน-เช็คเอาท์สำเร็จ</li>
              <li style={{ marginBottom: '8px' }}>ผลการอนุมัติ/ปฏิเสธการลา</li>
              <li style={{ marginBottom: '8px' }}>การยืนยันนัดหมายประชุม</li>
              <li style={{ marginBottom: '8px' }}>การเตือนก่อนถึงวันลาที่ได้รับอนุมัติ</li>
              <li style={{ marginBottom: '8px' }}>ประกาศหรือข่าวสารจากฝ่าย HR</li>
            </ul>

            <h3 style={{ fontSize: '17px', fontWeight: '600', marginTop: '20px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              4.2 การแจ้งเตือนสำหรับ HR
            </h3>
            <ul style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
              <li style={{ marginBottom: '8px' }}>คำขออนุมัติการลาใหม่ (พร้อมปุ่มอนุมัติ/ปฏิเสธ)</li>
              <li style={{ marginBottom: '8px' }}>การลงทะเบียนพนักงานใหม่</li>
              <li style={{ marginBottom: '8px' }}>คำขอนัดหมายประชุมจากพนักงาน</li>
              <li style={{ marginBottom: '8px' }}>สรุปรายงาน OT รายวัน/รายสัปดาห์</li>
              <li style={{ marginBottom: '8px' }}>การแจ้งเตือนเมื่อมีข้อมูลผิดปกติ</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--primary-light)' }}>
              5. ความปลอดภัยและข้อควรระวัง
            </h2>

            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)' }}>
                5.1 การรักษาความปลอดภัย
              </h3>
              <ul style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>ห้ามแชร์บัญชี LINE ที่ลงทะเบียนกับผู้อื่น</li>
                <li style={{ marginBottom: '8px' }}>ตรวจสอบให้แน่ใจว่าเป็น LINE OA อย่างเป็นทางการ (มี Verified Badge)</li>
                <li style={{ marginBottom: '8px' }}>ไม่ควรเช็คอิน/เช็คเอาท์ให้ผู้อื่น</li>
                <li style={{ marginBottom: '8px' }}>หากพบบัญชีถูกใช้งานโดยไม่ได้รับอนุญาต แจ้ง HR ทันที</li>
              </ul>
            </div>

            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)' }}>
                5.2 ข้อจำกัดของระบบ
              </h3>
              <ul style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>ต้องเชื่อมต่ออินเทอร์เน็ตในการใช้งาน</li>
                <li style={{ marginBottom: '8px' }}>LIFF ทำงานบน LINE เท่านั้น ไม่สามารถเปิดในเว็บเบราว์เซอร์ทั่วไปได้</li>
                <li style={{ marginBottom: '8px' }}>ข้อมูลอาจมีความล่าช้าในการอัพเดท 1-2 นาที</li>
                <li style={{ marginBottom: '8px' }}>หากลงทะเบียนซ้ำ ข้อมูลเดิมจะถูกแทนที่</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--primary-light)' }}>
              6. ปัญหาที่พบบ่อยและการแก้ไข
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Q: ลงทะเบียนไม่สำเร็จ แสดงข้อความ "ไม่พบข้อมูลพนักงาน"
              </h4>
              <p style={{ marginLeft: '16px', color: 'var(--text-secondary)' }}>
                A: ตรวจสอบว่ารหัสพนักงานและเลขบัตรประชาชนที่กรอกตรงกับข้อมูลในระบบหรือไม่ หากไม่แน่ใจ ติดต่อฝ่าย HR เพื่อยืนยันข้อมูล
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Q: กดเช็คอิน/เช็คเอาท์แล้วไม่มีการตอบกลับ
              </h4>
              <p style={{ marginLeft: '16px', color: 'var(--text-secondary)' }}>
                A: ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต ลองรีเฟรชหน้า LIFF (ปิดแล้วเปิดใหม่) หากยังไม่ได้ กรุณาติดต่อฝ่าย IT
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Q: ส่งคำขอลาแล้วแต่ยังไม่ได้รับการตอบกลับ
              </h4>
              <p style={{ marginLeft: '16px', color: 'var(--text-secondary)' }}>
                A: ฝ่าย HR อาจยังไม่ได้พิจารณาคำขอ โดยปกติจะได้รับคำตอบภายใน 24-48 ชั่วโมง หากเร่งด่วนสามารถติดต่อ HR โดยตรง
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Q: ข้อมูล OT ที่แสดงใน LINE ไม่ตรงกับเครื่องสแกน
              </h4>
              <p style={{ marginLeft: '16px', color: 'var(--text-secondary)' }}>
                A: ระบบ LINE ดึงข้อมูลจากฐานข้อมูลกลาง หาก HR ยังไม่ได้นำเข้าข้อมูลการสแกนล่าสุด ข้อมูลจะยังไม่อัพเดท ติดต่อ HR เพื่อนำเข้าข้อมูลใหม่
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Q: LIFF ไม่เปิด หรือแสดงหน้าว่างเปล่า
              </h4>
              <p style={{ marginLeft: '16px', color: 'var(--text-secondary)' }}>
                A: ลองปิดแอป LINE และเปิดใหม่ ตรวจสอบว่าใช้ LINE เวอร์ชันล่าสุด หากยังไม่ได้ ลองลบแคช LINE หรือติดต่อฝ่าย IT
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Q: (สำหรับ HR) ไม่ได้รับการแจ้งเตือนคำขอลา
              </h4>
              <p style={{ marginLeft: '16px', color: 'var(--text-secondary)' }}>
                A: ตรวจสอบว่าได้ลงทะเบียน HR Admin แล้ว และตั้งค่าการแจ้งเตือน LINE เปิดอยู่ หากยังไม่ได้รับ ตรวจสอบใน Web Application
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--primary-light)' }}>
              7. เคล็ดลับการใช้งาน
            </h2>
            <ul style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
              <li style={{ marginBottom: '12px' }}>
                <strong>ตั้งค่าการแจ้งเตือน:</strong> เปิดการแจ้งเตือนของ LINE OA เพื่อไม่พลาดข่าวสารสำคัญ
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>ใช้ Rich Menu:</strong> Rich Menu (เมนูด้านล่างของหน้าแชท) ช่วยให้เข้าถึงฟังก์ชันต่างๆ ได้รวดเร็ว
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>เช็คอินล่วงหน้า:</strong> ควรเช็คอินทันทีเมื่อถึงที่ทำงานเพื่อความแม่นยำ
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>ส่งคำขอลาล่วงหน้า:</strong> ขอลาล่วงหน้าอย่างน้อย 1-2 วันเพื่อให้ HR มีเวลาพิจารณา
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>ตรวจสอบข้อมูล OT เป็นประจำ:</strong> เพื่อให้แน่ใจว่าข้อมูลถูกต้องก่อนปิดงวด
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid var(--primary-light)' }}>
              8. การติดต่อและขอความช่วยเหลือ
            </h2>
            <div style={{ background: 'var(--surface-bg)', padding: '16px', borderRadius: '6px' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <strong>ช่องทางการติดต่อ:</strong>
              </p>
              <ul style={{ marginLeft: '24px', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '8px' }}>ปัญหาเกี่ยวกับการลงทะเบียน, การลา, ข้อมูล OT: ติดต่อฝ่าย HR</li>
                <li style={{ marginBottom: '8px' }}>ปัญหาทางเทคนิค, LIFF ไม่ทำงาน: ติดต่อฝ่าย IT Support</li>
                <li style={{ marginBottom: '8px' }}>คำถามเกี่ยวกับการใช้งาน: ถาม AI Chatbot ใน LINE OA (สำหรับ HR)</li>
              </ul>
            </div>

            <div style={{ marginTop: '16px', padding: '16px', background: 'var(--info-light)', borderLeft: '4px solid var(--info)', borderRadius: '4px' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                <strong>สำหรับคู่มือการใช้งาน Web Application:</strong> กรุณาดูที่หน้า "คู่มือการใช้งาน Web App"
              </p>
            </div>
          </section>

        </div>

        {/* Navigation */}
        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '2px solid var(--border-light)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="/" className="btn btn-primary">
            กลับสู่หน้าหลัก
          </a>
          <a href="/guide/webapp" className="btn btn-secondary">
            ดูคู่มือระบบ Web App
          </a>
        </div>
      </div>
    </div>
  )
}
