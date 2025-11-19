-- ============================================
-- Master Data: รายการเงินได้และเงินหัก
-- ============================================

-- ตารางสำหรับเก็บ Master รายการ
CREATE TABLE IF NOT EXISTS public.income_deduction_items (
  id SERIAL PRIMARY KEY,
  item_code VARCHAR(50) UNIQUE NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('income', 'deduction')),
  include_in_sso BOOLEAN DEFAULT false,
  is_fixed BOOLEAN DEFAULT false,
  is_automatic BOOLEAN DEFAULT false,
  default_amount NUMERIC(10, 2) DEFAULT 0.00,
  description TEXT,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0
);

-- ============================================
-- เงินหัก (Deductions)
-- ============================================
INSERT INTO income_deduction_items
(item_code, item_name, transaction_type, include_in_sso, is_fixed, is_automatic, description, display_order)
VALUES
-- อัตโนมัติ
('LATE_DEDUCTION', 'หักมาสาย', 'deduction', true, false, true, 'หักค่ามาสายอัตโนมัติ', 1),
('ABSENT_DEDUCTION', 'หักขาดงาน', 'deduction', true, false, true, 'หักค่าขาดงานอัตโนมัติ', 2),
('LEAVE_DEDUCTION', 'หักลากิจ', 'deduction', true, false, true, 'หักถ้าลาเกินกำหนด', 3),

-- คงที่
('WORK_DAMAGE', 'งานเสีย', 'deduction', false, true, false, 'งานเสีย (คงที่ทุกงวด)', 7),

-- ใส่ manual
('UNIFORM_DEDUCTION', 'ค่าชุมฟอร์ม', 'deduction', false, false, false, 'ค่าชุดยูนิฟอร์ม', 4),
('STUDENT_LOAN', 'หักกยศ.', 'deduction', false, false, false, 'หักกองทุนเงินให้กู้ยืมเพื่อการศึกษา', 5),
('COOPERATIVE', 'สหกรณ์', 'deduction', false, false, false, 'หักเงินสหกรณ์', 6),
('FUNERAL_FEE', 'ค่าฌาปนกิจ', 'deduction', false, false, false, 'ค่าฌาปนกิจสงเคราะห์', 8),
('SPECIAL_DEDUCTION', 'หักค่าพิเศษ', 'deduction', false, false, false, 'หักค่าพิเศษอื่นๆ', 9),
('OTHER_DEDUCTION', 'หักค่าอื่นๆ', 'deduction', false, false, false, 'หักค่าอื่นๆ', 10)
ON CONFLICT (item_code) DO NOTHING;

-- ============================================
-- เงินได้ (Income)
-- ============================================
INSERT INTO income_deduction_items
(item_code, item_name, transaction_type, include_in_sso, is_fixed, is_automatic, description, display_order)
VALUES
-- คงที่
('POSITION_ALLOWANCE', 'ค่าตำแหน่ง', 'income', true, true, false, 'ค่าตำแหน่ง (คงที่)', 1),
('PHONE_ALLOWANCE', 'ค่าโทรศัพท์', 'income', true, true, false, 'ค่าโทรศัพท์ (คงที่)', 2),
('OTHER_FIXED', 'ค่าอื่นๆ', 'income', false, true, false, 'ค่าอื่นๆคงที่', 5),

-- ใส่ manual
('LIVING_ALLOWANCE', 'ค่าครองชีพ', 'income', false, false, false, 'ค่าครองชีพ', 3),
('SPECIAL_ALLOWANCE', 'ค่าพิเศษ', 'income', false, false, false, 'ค่าพิเศษ', 4),
('OTHER_SPECIAL', 'ค่าอื่นๆพิเศษ', 'income', false, false, false, 'ค่าอื่นๆพิเศษ', 6),
('ATTENDANCE_REFUND', 'คืนเบี้ยขยัน', 'income', false, false, false, 'คืนเบี้ยขยัน', 7),
('VACATION_REFUND', 'คืนพักร้อน', 'income', false, false, false, 'คืนค่าพักร้อน', 8),
('MONTHLY_BONUS', 'โบนัสรายเดือน', 'income', false, false, false, 'โบนัสรายเดือน', 9),
('ANNUAL_BONUS', 'โบนัสรายปี', 'income', false, false, false, 'โบนัสรายปี', 10),
('SHIFT_ALLOWANCE', 'ค่ากะ', 'income', true, false, false, 'ค่ากะ (คำนวณ SSO)', 11)
ON CONFLICT (item_code) DO NOTHING;

-- สร้าง index
CREATE INDEX IF NOT EXISTS idx_income_deduction_items_type ON income_deduction_items(transaction_type, active);
CREATE INDEX IF NOT EXISTS idx_income_deduction_items_order ON income_deduction_items(display_order);

GRANT ALL ON income_deduction_items TO postgres, anon, authenticated, service_role;
