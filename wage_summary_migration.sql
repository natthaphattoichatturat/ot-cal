-- สร้าง table wage_summary สำหรับเก็บข้อมูลค่าจ้างรายงวด
CREATE TABLE IF NOT EXISTS wage_summary (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    period INTEGER NOT NULL CHECK (period IN (1, 2)),
    base_wage DECIMAL(10,2) DEFAULT 0,
    ot_wage DECIMAL(10,2) DEFAULT 0,
    attendance_bonus DECIMAL(10,2) DEFAULT 0,
    total_income DECIMAL(10,2) DEFAULT 0,
    sso DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total_deduction DECIMAL(10,2) DEFAULT 0,
    net_wage DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_wage_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    UNIQUE(employee_id, year, month, period)
);

-- สร้าง index เพื่อเพิ่มความเร็วในการ query
CREATE INDEX IF NOT EXISTS idx_wage_summary_employee_year ON wage_summary(employee_id, year);
CREATE INDEX IF NOT EXISTS idx_wage_summary_year_month ON wage_summary(year, month, period);

COMMENT ON TABLE wage_summary IS 'เก็บข้อมูลสรุปค่าจ้างของพนักงานแต่ละงวด';
COMMENT ON COLUMN wage_summary.base_wage IS 'ค่าจ้างพื้นฐาน (base + OT รวมกัน)';
COMMENT ON COLUMN wage_summary.ot_wage IS 'ค่า OT ทั้งหมด';
COMMENT ON COLUMN wage_summary.attendance_bonus IS 'เบี้ยขยัน';
COMMENT ON COLUMN wage_summary.total_income IS 'รายได้รวม';
COMMENT ON COLUMN wage_summary.sso IS 'ประกันสังคมที่หัก';
COMMENT ON COLUMN wage_summary.tax IS 'ภาษีที่หัก';
COMMENT ON COLUMN wage_summary.total_deduction IS 'รวมหักทั้งหมด';
COMMENT ON COLUMN wage_summary.net_wage IS 'เงินสุทธิ';

