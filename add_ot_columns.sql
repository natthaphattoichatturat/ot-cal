-- เพิ่มคอลัมน์ OT แยกสำหรับ wage_summary table
ALTER TABLE wage_summary ADD COLUMN IF NOT EXISTS ot1_wage DECIMAL(10,2) DEFAULT 0;
ALTER TABLE wage_summary ADD COLUMN IF NOT EXISTS ot2_wage DECIMAL(10,2) DEFAULT 0;
ALTER TABLE wage_summary ADD COLUMN IF NOT EXISTS ot3_wage DECIMAL(10,2) DEFAULT 0;

-- เพิ่ม comment
COMMENT ON COLUMN wage_summary.ot1_wage IS 'ค่า OT ×1.5';
COMMENT ON COLUMN wage_summary.ot2_wage IS 'ค่า OT ×2 (รายวัน) หรือ ×1 (รายเดือน)';
COMMENT ON COLUMN wage_summary.ot3_wage IS 'ค่า OT ×3';
