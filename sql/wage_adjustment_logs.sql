-- ตาราง wage_adjustment_logs: เก็บประวัติการดำเนินการกับ wage_adjustments
CREATE TABLE IF NOT EXISTS wage_adjustment_logs (
  id BIGSERIAL PRIMARY KEY,
  adjustment_id BIGINT REFERENCES wage_adjustments(id) ON DELETE SET NULL,
  employee_id TEXT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL,
  period INT NOT NULL CHECK (period IN (1, 2)),

  -- ข้อมูลการปรับเงิน
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('income', 'deduction')),
  category TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT,

  -- ประเภทของ action
  action_type TEXT NOT NULL CHECK (action_type IN ('create', 'update', 'delete')),

  -- ข้อมูลก่อนแก้ไข (สำหรับ update/delete)
  old_data JSONB,

  -- ข้อมูลผู้ดำเนินการ
  performed_by TEXT NOT NULL,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index สำหรับค้นหาเร็ว
CREATE INDEX IF NOT EXISTS idx_wage_adjustment_logs_employee_id ON wage_adjustment_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_wage_adjustment_logs_year_month ON wage_adjustment_logs(year, month);
CREATE INDEX IF NOT EXISTS idx_wage_adjustment_logs_period ON wage_adjustment_logs(period);
CREATE INDEX IF NOT EXISTS idx_wage_adjustment_logs_performed_at ON wage_adjustment_logs(performed_at DESC);

-- ตาราง auto_adjustment_logs: เก็บประวัติการคำนวณอัตโนมัติ
CREATE TABLE IF NOT EXISTS auto_adjustment_logs (
  id BIGSERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL,
  period INT NOT NULL CHECK (period IN (1, 2)),

  -- ประเภทการปรับเงินอัตโนมัติ
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('income', 'deduction')),
  category TEXT NOT NULL, -- 'late_deduction', 'attendance_bonus', 'sso', 'tax', 'night_shift', 'leave_deduction'
  amount NUMERIC(10, 2) NOT NULL,

  -- รายละเอียดเพิ่มเติม
  details JSONB, -- เก็บข้อมูลเพิ่มเติม เช่น จำนวนนาทีมาสาย, จำนวนวันทำงาน

  -- ข้อมูล calculation run
  calculation_run_id TEXT, -- ID ของการคำนวณครั้งนั้น
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_auto_adjustment_logs_employee_id ON auto_adjustment_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_auto_adjustment_logs_year_month ON auto_adjustment_logs(year, month);
CREATE INDEX IF NOT EXISTS idx_auto_adjustment_logs_period ON auto_adjustment_logs(period);
CREATE INDEX IF NOT EXISTS idx_auto_adjustment_logs_calculated_at ON auto_adjustment_logs(calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_auto_adjustment_logs_category ON auto_adjustment_logs(category);

-- View: รวม manual adjustments และ auto adjustments
CREATE OR REPLACE VIEW wage_adjustments_combined AS
SELECT
  'manual' as source_type,
  wa.id,
  wa.employee_id,
  e.name as employee_name,
  e.department,
  wa.year,
  wa.month,
  wa.period,
  wa.adjustment_type,
  wa.category,
  wa.amount,
  wa.description,
  NULL as details,
  wa.created_at,
  wa.created_by as performed_by,
  TRUE as can_edit,
  TRUE as can_delete
FROM wage_adjustments wa
LEFT JOIN employees e ON wa.employee_id = e.employee_id

UNION ALL

SELECT
  'auto' as source_type,
  aal.id,
  aal.employee_id,
  e.name as employee_name,
  e.department,
  aal.year,
  aal.month,
  aal.period,
  aal.adjustment_type,
  aal.category,
  aal.amount,
  NULL as description,
  aal.details,
  aal.calculated_at as created_at,
  'system' as performed_by,
  FALSE as can_edit,
  FALSE as can_delete
FROM auto_adjustment_logs aal
LEFT JOIN employees e ON aal.employee_id = e.employee_id;

-- Comment ตาราง
COMMENT ON TABLE wage_adjustment_logs IS 'เก็บประวัติการแก้ไข/ลบ wage_adjustments';
COMMENT ON TABLE auto_adjustment_logs IS 'เก็บประวัติการคำนวณค่าจ้างอัตโนมัติ เช่น มาสาย, เบี้ยขยัน, SSO';
COMMENT ON VIEW wage_adjustments_combined IS 'View รวม manual adjustments และ auto adjustments พร้อมข้อมูลพนักงาน';
