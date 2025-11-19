# HR System Enhancement - Implementation Plan

## Overview
ระบบนี้จะเพิ่มฟีเจอร์การจัดการเงินได้/เงินหัก, คำนวณภาษี, และสร้างเอกสารต่างๆ

## Phase 1: Database & Backend (ทำแล้ว ✅)

### 1.1 Database Schema
- [x] สร้าง `wage_income_deductions` table
- [x] สร้าง `tax_calculations` table
- [x] สร้าง `ytd_summary` table
- [x] สร้าง `tax_brackets` table (พร้อมข้อมูล)
- [x] สร้าง `leave_approvals` table
- [x] สร้าง `document_templates` table
- [x] สร้าง `generated_documents` table
- [x] อัพเดท `period_wages` table
- [x] สร้าง `income_deduction_items` master table
- [x] สร้าง function `calculate_progressive_tax()`
- [x] สร้าง view `v_period_wages_detail`

**ไฟล์:**
- `hr_system_enhancement.sql`
- `income_deduction_master_data.sql`

---

## Phase 2: Wage Calculation Library

### 2.1 Tax Calculation Functions
- [ ] `calculatePeriodTax()` - คำนวณภาษีงวดนี้
- [ ] `calculateYTDSummary()` - คำนวณยอดสะสม
- [ ] `calculateNetPay()` - คำนวณเงินได้สุทธิ

### 2.2 Income/Deduction Functions
- [ ] `calculateAdditionalIncome()` - รวมเงินได้เพิ่มเติม
- [ ] `calculateAdditionalDeductions()` - รวมเงินหัก
- [ ] `calculateSSOBase()` - ฐานคำนวณ SSO

**ไฟล์:**
- `lib/taxCalculations.ts` (ใหม่)
- `lib/wageCalculations.ts` (อัพเดท)

---

## Phase 3: API Routes

### 3.1 Income/Deduction APIs
- [ ] `POST /api/wages/income-deductions` - เพิ่มรายการ
- [ ] `GET /api/wages/income-deductions` - ดึงรายการ
- [ ] `DELETE /api/wages/income-deductions/[id]` - ลบรายการ
- [ ] `GET /api/wages/income-deduction-items` - ดึง master list

### 3.2 Tax APIs
- [ ] `GET /api/wages/tax/[employeeId]` - ดึงข้อมูลภาษี
- [ ] `POST /api/wages/tax/calculate` - คำนวณภาษี

### 3.3 YTD APIs
- [ ] `GET /api/wages/ytd/[employeeId]` - ดึงยอดสะสม

### 3.4 Document APIs
- [ ] `GET /api/documents/templates` - รายการเอกสาร
- [ ] `POST /api/documents/generate` - สร้างเอกสาร

**ไฟล์:**
- `app/api/wages/income-deductions/route.ts`
- `app/api/wages/tax/[employeeId]/route.ts`
- `app/api/wages/ytd/[employeeId]/route.ts`
- `app/api/documents/*`

---

## Phase 4: Frontend Components

### 4.1 Wages Page Enhancement
- [ ] เพิ่มปุ่ม "เพิ่มเงินได้/เงินหัก"
- [ ] สร้าง Modal/Popup สำหรับเพิ่มรายการ
- [ ] Multi-select พนักงาน
- [ ] Form เลือกประเภทและใส่จำนวนเงิน

**ไฟล์:**
- `app/wages/page.tsx` (อัพเดท)
- `components/IncomeDeductionModal.tsx` (ใหม่)

### 4.2 Employee Detail Page
- [ ] แสดงรายละเอียดเงินได้/เงินหัก
- [ ] แสดงการคำนวณภาษี
- [ ] แสดง YTD Summary

**ไฟล์:**
- `app/employees/[id]/page.tsx` (อัพเดท)

### 4.3 Employee OT Viewer (LIFF)
- [ ] แสดงค่าจ้างแต่ละงวด
- [ ] แสดงเงินเดือนสะสม
- [ ] แสดงภาษีสะสม
- [ ] แสดง SSO สะสม
- [ ] แสดงรวมเงินได้/หักสะสม
- [ ] แสดงเงินได้สุทธิสะสม

**ไฟล์:**
- `app/liff/employee-ot-viewer/page.tsx` (อัพเดทใหญ่)

### 4.4 Document Management Page
- [ ] สร้างหน้าใหม่ `/documents`
- [ ] ปุ่มสำหรับแต่ละประเภทเอกสาร:
  - สลิปเงินเดือน
  - ภ.ง.ด.1
  - สปส. 1-10
  - หนังสือรับรอง 50 ทวิ
  - ภ.ง.ด.1ก
- [ ] ระบุข้อมูลที่ใช้และความถี่

**ไฟล์:**
- `app/documents/page.tsx` (ใหม่)

---

## Phase 5: Leave Request Flow Changes

### 5.1 Update Leave Request
- [ ] เปลี่ยนจาก HR OA → Employee OA
- [ ] ค้นหาหัวหน้าแผนก (position = "หัวหน้าแผนก")
- [ ] ส่งคำขออนุมัติไปหัวหน้า
- [ ] HR OA รับแค่ข้อมูล

### 5.2 Update Webhook
- [ ] แก้ `/api/line/webhook` สำหรับ approval flow ใหม่
- [ ] สร้าง action ปุ่มอนุมัติ/ปฏิเสธ

**ไฟล์:**
- `app/liff/leave-request/page.tsx` (อัพเดท)
- `app/api/line/submit-leave/route.ts` (อัพเดท)
- `app/api/line/webhook/route.ts` (อัพเดท)

---

## Phase 6: Employee Registration

### 6.1 Update Registration Form
- [ ] เปลี่ยนจาก identity_id → employee_id เป็นหลัก
- [ ] identity_id เป็น optional
- [ ] name เป็น optional
- [ ] ต้องกรอก: employee_id + identity_id (optional)

**ไฟล์:**
- `app/liff/employee-register/page.tsx` (อัพเดท)
- `app/api/line/register-employee/route.ts` (อัพเดท)

---

## Phase 7: Employee Management Forms

### 7.1 Update All Forms
รองรับฟิลด์เพิ่มเติม:
- department_code
- section, section_code
- position
- gender, nationality, citizenship, religion
- birth_date, start_date
- tax_id, social_security
- provident_fund, company_provident_fund
- และอื่นๆ ตาม schema

**ไฟล์:**
- `app/employees/add/page.tsx`
- `app/employees/edit/page.tsx`
- `app/liff/hr-admin/add/page.tsx`
- `app/liff/hr-admin/edit/page.tsx`

---

## Phase 8: Chatbot Fix

### 8.1 Fix OT Query
- [ ] ตรวจสอบ error ใน chatbot
- [ ] แก้ไขการ query ข้อมูล OT
- [ ] Test คำถาม "เดือนตุลาคม ใครทำโอทีเยอะสุด"

**ไฟล์:**
- `app/api/chatbot/route.ts` (debug และแก้ไข)

---

## Phase 9: Testing & Build

### 9.1 Unit Testing
- [ ] ทดสอบ tax calculation
- [ ] ทดสอบ YTD summary
- [ ] ทดสอบ income/deduction

### 9.2 Integration Testing
- [ ] ทดสอบ flow การเพิ่มเงินได้/หัก
- [ ] ทดสอบ flow การลา
- [ ] ทดสอบ chatbot

### 9.3 Build
- [ ] `npm run build`
- [ ] แก้ TypeScript errors
- [ ] แก้ ESLint warnings

---

## Priority Order

### Critical (ทำก่อน):
1. ✅ Database Schema
2. Tax Calculation Library
3. Income/Deduction APIs
4. Wages Page + Modal
5. Employee Detail Page

### High (ทำต่อ):
6. Employee OT Viewer (LIFF)
7. Leave Request Flow
8. Employee Registration

### Medium:
9. Employee Management Forms
10. Document Management Page
11. Chatbot Fix

### Final:
12. Testing
13. Build & Deploy

---

## Files Created/Modified Summary

### New SQL Files:
1. `hr_system_enhancement.sql` - Main schema
2. `income_deduction_master_data.sql` - Master data

### New TypeScript Files:
- `lib/taxCalculations.ts`
- `components/IncomeDeductionModal.tsx`
- `app/documents/page.tsx`
- `app/api/wages/income-deductions/route.ts`
- `app/api/wages/tax/[employeeId]/route.ts`
- `app/api/wages/ytd/[employeeId]/route.ts`

### Modified Files:
- `lib/wageCalculations.ts`
- `app/wages/page.tsx`
- `app/employees/[id]/page.tsx`
- `app/liff/employee-ot-viewer/page.tsx`
- `app/liff/leave-request/page.tsx`
- `app/liff/employee-register/page.tsx`
- `app/employees/add/page.tsx`
- `app/employees/edit/page.tsx`
- `app/api/chatbot/route.ts`
- และอื่นๆ

---

## Estimated Timeline

- Phase 1: ✅ Done
- Phase 2-3: 2-3 hours (Backend)
- Phase 4: 3-4 hours (Frontend Core)
- Phase 5-6: 1-2 hours (LIFF Updates)
- Phase 7: 2 hours (Forms)
- Phase 8: 30 mins (Chatbot)
- Phase 9: 1 hour (Testing & Build)

**Total: ~10-13 hours**

---

## Next Steps

1. รัน SQL files ใน Supabase Console
2. สร้าง Tax Calculation Library
3. สร้าง API Routes
4. สร้าง Frontend Components

ดำเนินการทีละ Phase ตามลำดับ
