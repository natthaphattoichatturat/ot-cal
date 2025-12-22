-- =============================================
-- ระบบ OT เช้า (Morning OT) แบบ Manual
-- User กำหนดเองว่าพนักงานคนไหนได้ OT เช้ากี่ชั่วโมง
-- =============================================

-- ตารางเก็บ OT เช้าที่ user กำหนด
CREATE TABLE IF NOT EXISTS morning_ot_allowances (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL REFERENCES employees(employee_id),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  period INTEGER NOT NULL CHECK (period IN (1, 2)),

  -- ชั่วโมง OT เช้าที่ user กำหนด
  allowed_hours NUMERIC(5,2) NOT NULL DEFAULT 0,

  -- ชั่วโมง OT เช้าจริงที่ระบบคำนวณได้ (สำหรับ reference)
  calculated_hours NUMERIC(5,2) DEFAULT 0,

  -- ชั่วโมงที่ใช้จริง = MIN(allowed_hours, calculated_hours)
  actual_hours NUMERIC(5,2) GENERATED ALWAYS AS (
    LEAST(allowed_hours, COALESCE(calculated_hours, 0))
  ) STORED,

  -- วันที่ที่ user เลือกให้ OT เช้า (JSONB array ของวันที่)
  -- ถ้า NULL = ให้ทุกวันในงวด, ถ้ามีค่า = ให้เฉพาะวันที่เลือก
  -- ตัวอย่าง: ["2025-01-26", "2025-01-27", "2025-01-28"]
  selected_dates JSONB DEFAULT NULL,

  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(100),

  -- Unique constraint: พนักงาน 1 คน ต่อ 1 งวด
  UNIQUE(employee_id, year, month, period)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_morning_ot_period ON morning_ot_allowances(year, month, period);
CREATE INDEX IF NOT EXISTS idx_morning_ot_employee ON morning_ot_allowances(employee_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_morning_ot_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_morning_ot_updated ON morning_ot_allowances;
CREATE TRIGGER trigger_morning_ot_updated
  BEFORE UPDATE ON morning_ot_allowances
  FOR EACH ROW
  EXECUTE FUNCTION update_morning_ot_timestamp();

-- Comment
COMMENT ON TABLE morning_ot_allowances IS 'ตารางเก็บ OT เช้าที่ user กำหนดเอง';
COMMENT ON COLUMN morning_ot_allowances.allowed_hours IS 'ชั่วโมง OT เช้าที่ user อนุญาตให้พนักงาน';
COMMENT ON COLUMN morning_ot_allowances.calculated_hours IS 'ชั่วโมง OT เช้าที่ระบบคำนวณได้จากการเข้างานก่อนเวลา';
COMMENT ON COLUMN morning_ot_allowances.actual_hours IS 'ชั่วโมง OT เช้าที่ใช้จริง = MIN(allowed, calculated)';
COMMENT ON COLUMN morning_ot_allowances.selected_dates IS 'วันที่ที่เลือกให้ OT เช้า (JSONB array), NULL = ทุกวันในงวด';
