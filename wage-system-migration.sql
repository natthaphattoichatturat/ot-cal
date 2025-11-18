-- ========================================
-- ระบบคำนวณค่าจ้างและประกันสังคม
-- สำหรับโรงงานที่จ่ายเงินเดือน 2 งวด/เดือน
-- ========================================

-- ========================================
-- 1. ตาราง wage_periods: กำหนดงวดจ่ายเงิน
-- ========================================
CREATE TABLE IF NOT EXISTS public.wage_periods (
    id SERIAL PRIMARY KEY,
    wage_month DATE NOT NULL,              -- เดือนของค่าจ้าง เช่น '2024-11-01'
    period_number INTEGER NOT NULL,         -- งวดที่ 1 หรือ 2
    work_start_date DATE NOT NULL,          -- วันเริ่มทำงาน
    work_end_date DATE NOT NULL,            -- วันสุดท้ายของการทำงาน
    payment_date DATE NOT NULL,             -- วันจ่ายเงิน
    sso_due_date DATE,                      -- วันครบกำหนดส่งประกันสังคม
    is_closed BOOLEAN DEFAULT FALSE,        -- ปิดงวดแล้วหรือยัง
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_wage_period UNIQUE(wage_month, period_number),
    CONSTRAINT check_period_number CHECK (period_number IN (1, 2))
);

COMMENT ON TABLE public.wage_periods IS 'ตารางกำหนดงวดจ่ายเงิน สำหรับการจ่ายเงินเดือน 2 งวด/เดือน';
COMMENT ON COLUMN public.wage_periods.wage_month IS 'เดือนของค่าจ้าง ใช้วันที่ 1 ของเดือน เช่น 2024-11-01 = พฤศจิกายน 2567';
COMMENT ON COLUMN public.wage_periods.period_number IS 'งวดที่ 1 (26-10) หรือ งวดที่ 2 (11-25)';
COMMENT ON COLUMN public.wage_periods.payment_date IS 'วันจ่ายเงิน: งวดที่ 1 = วันที่ 20, งวดที่ 2 = วันที่ 4 (เดือนถัดไป)';
COMMENT ON COLUMN public.wage_periods.sso_due_date IS 'วันครบกำหนดส่งประกันสังคม (วันที่ 15 ของเดือนถัดไป)';

-- ========================================
-- 2. ตาราง daily_wages: คำนวณค่าจ้างรายวัน
-- ========================================
CREATE TABLE IF NOT EXISTS public.daily_wages (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    work_date DATE NOT NULL,
    wage_period_id INTEGER,                 -- อ้างอิงถึง wage_periods

    -- ข้อมูลชั่วโมงทำงาน (ดึงจาก daily_attendance)
    actual_hours NUMERIC(5,2) DEFAULT 0,
    ot_normal_hours NUMERIC(5,2) DEFAULT 0,    -- OT ×1.5
    ot_special_hours NUMERIC(5,2) DEFAULT 0,   -- OT ×2
    ot_premium_hours NUMERIC(5,2) DEFAULT 0,   -- OT ×3

    -- อัตราค่าจ้าง (ดึงจาก employees)
    perhr_salary NUMERIC(10,2),
    perday_salary NUMERIC(10,2),

    -- ค่าจ้างที่คำนวณได้ (บาท)
    base_wage NUMERIC(10,2) DEFAULT 0,         -- ค่าจ้างพื้นฐาน (8 ชม. × perhr_salary)
    ot1_wage NUMERIC(10,2) DEFAULT 0,          -- ค่าจ้างจาก OT ปกติ (ot_normal_hours × perhr_salary)
    ot2_wage NUMERIC(10,2) DEFAULT 0,          -- ค่าจ้างจาก OT พิเศษ (ot_special_hours × perhr_salary)
    ot3_wage NUMERIC(10,2) DEFAULT 0,          -- ค่าจ้างจาก OT ขั้นสูง (ot_premium_hours × perhr_salary)
    daily_total_wage NUMERIC(10,2) DEFAULT 0,  -- รวมค่าจ้างของวันนั้น

    -- สถานะ
    is_holiday BOOLEAN DEFAULT FALSE,
    is_leave BOOLEAN DEFAULT FALSE,
    late BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_daily_wage_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    CONSTRAINT fk_daily_wage_period FOREIGN KEY (wage_period_id) REFERENCES wage_periods(id) ON DELETE SET NULL,
    CONSTRAINT unique_daily_wage UNIQUE(employee_id, work_date)
);

CREATE INDEX idx_daily_wages_employee ON public.daily_wages(employee_id);
CREATE INDEX idx_daily_wages_date ON public.daily_wages(work_date);
CREATE INDEX idx_daily_wages_period ON public.daily_wages(wage_period_id);

COMMENT ON TABLE public.daily_wages IS 'ตารางคำนวณค่าจ้างรายวันของพนักงานแต่ละคน';
COMMENT ON COLUMN public.daily_wages.base_wage IS 'ค่าจ้างพื้นฐาน = 8 × perhr_salary (สำหรับคนที่มีเวลาเข้างานปกติ)';
COMMENT ON COLUMN public.daily_wages.ot1_wage IS 'ค่าจ้าง OT ปกติ = ot_normal_hours (ที่คูณ 1.5 แล้ว) × perhr_salary';
COMMENT ON COLUMN public.daily_wages.ot2_wage IS 'ค่าจ้าง OT พิเศษ = ot_special_hours (ที่คูณ 2 แล้ว) × perhr_salary';
COMMENT ON COLUMN public.daily_wages.ot3_wage IS 'ค่าจ้าง OT ขั้นสูง = ot_premium_hours (ที่คูณ 3 แล้ว) × perhr_salary';

-- ========================================
-- 3. ตาราง attendance_punctuality: ตรวจสอบเบี้ยขยัน
-- ========================================
CREATE TABLE IF NOT EXISTS public.attendance_punctuality (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    work_date DATE NOT NULL,
    wage_period_id INTEGER,

    scheduled_in_time TIME,
    check_in_time TIME,
    early_minutes INTEGER DEFAULT 0,        -- จำนวนนาทีที่มาก่อนเวลา
    is_punctual BOOLEAN DEFAULT FALSE,      -- มาก่อนเวลา >= 5 นาที

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_punctuality_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    CONSTRAINT fk_punctuality_period FOREIGN KEY (wage_period_id) REFERENCES wage_periods(id) ON DELETE CASCADE,
    CONSTRAINT unique_punctuality UNIQUE(employee_id, work_date)
);

CREATE INDEX idx_punctuality_employee_period ON public.attendance_punctuality(employee_id, wage_period_id);

COMMENT ON TABLE public.attendance_punctuality IS 'ตารางตรวจสอบความขยันในการเข้างาน สำหรับคำนวณเบี้ยขยัน';
COMMENT ON COLUMN public.attendance_punctuality.early_minutes IS 'จำนวนนาทีที่มาก่อนเวลา = scheduled_in_time - check_in_time';
COMMENT ON COLUMN public.attendance_punctuality.is_punctual IS 'เข้าเกณฑ์เบี้ยขยัน (มาก่อน >= 5 นาที) = TRUE';

-- ========================================
-- 4. ตาราง period_wages: สรุปค่าจ้างรายงวด
-- ========================================
CREATE TABLE IF NOT EXISTS public.period_wages (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    wage_period_id INTEGER NOT NULL,

    -- สรุปค่าจ้าง
    total_base_wage NUMERIC(10,2) DEFAULT 0,
    total_ot1_wage NUMERIC(10,2) DEFAULT 0,
    total_ot2_wage NUMERIC(10,2) DEFAULT 0,
    total_ot3_wage NUMERIC(10,2) DEFAULT 0,
    gross_wage NUMERIC(10,2) DEFAULT 0,         -- รวมค่าจ้างทั้งหมด (ไม่รวมเบี้ยขยัน)

    -- เบี้ยขยัน
    attendance_bonus NUMERIC(10,2) DEFAULT 0,   -- เบี้ยขยัน 300 บาท (ถ้ามีสิทธิ์)
    total_days_worked INTEGER DEFAULT 0,        -- จำนวนวันทำงานทั้งหมด
    punctual_days INTEGER DEFAULT 0,            -- จำนวนวันที่มาก่อนเวลา >= 5 นาที
    eligible_for_bonus BOOLEAN DEFAULT FALSE,   -- มีสิทธิ์ได้เบี้ยขยันหรือไม่

    -- รวมรายได้
    total_income NUMERIC(10,2) DEFAULT 0,       -- รวมค่าจ้าง + เบี้ยขยัน

    -- หักรายจ่าย
    sso_employee NUMERIC(10,2) DEFAULT 0,       -- ประกันสังคม (ส่วนพนักงาน)
    tax_withholding NUMERIC(10,2) DEFAULT 0,    -- ภาษีหัก ณ ที่จ่าย
    other_deductions NUMERIC(10,2) DEFAULT 0,   -- หักอื่นๆ
    total_deductions NUMERIC(10,2) DEFAULT 0,   -- รวมหัก

    -- เงินสุทธิ
    net_wage NUMERIC(10,2) DEFAULT 0,           -- เงินได้สุทธิ (รับจริง)

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_period_wage_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    CONSTRAINT fk_period_wage_period FOREIGN KEY (wage_period_id) REFERENCES wage_periods(id) ON DELETE CASCADE,
    CONSTRAINT unique_period_wage UNIQUE(employee_id, wage_period_id)
);

CREATE INDEX idx_period_wages_employee ON public.period_wages(employee_id);
CREATE INDEX idx_period_wages_period ON public.period_wages(wage_period_id);

COMMENT ON TABLE public.period_wages IS 'ตารางสรุปค่าจ้างรายงวดของพนักงานแต่ละคน';
COMMENT ON COLUMN public.period_wages.gross_wage IS 'รวมค่าจ้างก่อนหัก (ไม่รวมเบี้ยขยัน)';
COMMENT ON COLUMN public.period_wages.attendance_bonus IS 'เบี้ยขยัน 300 บาท (ถ้ามาก่อนเวลา >= 5 นาที ทุกวันในงวด)';
COMMENT ON COLUMN public.period_wages.total_income IS 'รวมรายได้ = gross_wage + attendance_bonus';
COMMENT ON COLUMN public.period_wages.net_wage IS 'เงินสุทธิที่พนักงานได้รับ = total_income - total_deductions';

-- ========================================
-- 5. ตาราง sso_monthly_summary: สรุปประกันสังคมรายเดือน
-- ========================================
CREATE TABLE IF NOT EXISTS public.sso_monthly_summary (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    wage_month DATE NOT NULL,               -- เดือนของค่าจ้าง

    -- รายได้แต่ละงวด
    period1_income NUMERIC(10,2) DEFAULT 0,
    period2_income NUMERIC(10,2) DEFAULT 0,
    total_monthly_income NUMERIC(10,2) DEFAULT 0,

    -- ฐานคำนวณประกันสังคม
    sso_base NUMERIC(10,2) DEFAULT 0,       -- ฐาน (สูงสุด 15,000)
    sso_rate NUMERIC(5,4) DEFAULT 0.05,     -- อัตรา 5%

    -- ประกันสังคมแต่ละงวด
    period1_sso NUMERIC(10,2) DEFAULT 0,    -- SSO ที่หักงวดที่ 1
    period2_sso NUMERIC(10,2) DEFAULT 0,    -- SSO ที่หักงวดที่ 2
    total_monthly_sso NUMERIC(10,2) DEFAULT 0,  -- รวม SSO ทั้งเดือน (สูงสุด 750)

    -- บริษัทจ่าย
    employer_sso NUMERIC(10,2) DEFAULT 0,   -- SSO ส่วนบริษัท (5%)

    -- ข้อมูลการนำส่ง
    sso_due_date DATE,                      -- วันครบกำหนดส่ง (วันที่ 15 เดือนถัดไป)
    is_submitted BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_sso_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    CONSTRAINT unique_sso_monthly UNIQUE(employee_id, wage_month)
);

CREATE INDEX idx_sso_employee_month ON public.sso_monthly_summary(employee_id, wage_month);

COMMENT ON TABLE public.sso_monthly_summary IS 'ตารางสรุปประกันสังคมรายเดือน (คำนวณจาก 2 งวด)';
COMMENT ON COLUMN public.sso_monthly_summary.sso_base IS 'ฐานคำนวณ SSO = MIN(total_monthly_income, 15000)';
COMMENT ON COLUMN public.sso_monthly_summary.total_monthly_sso IS 'รวม SSO ที่ต้องหัก = sso_base × 5% (สูงสุด 750 บาท)';
COMMENT ON COLUMN public.sso_monthly_summary.period1_sso IS 'SSO งวดที่ 1 = MIN(period1_income × 5%, 750)';
COMMENT ON COLUMN public.sso_monthly_summary.period2_sso IS 'SSO งวดที่ 2 = total_monthly_sso - period1_sso';

-- ========================================
-- 6. ตาราง tax_calculations: คำนวณภาษีเงินได้
-- ========================================
CREATE TABLE IF NOT EXISTS public.tax_calculations (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    wage_period_id INTEGER NOT NULL,

    -- รายได้
    gross_income NUMERIC(10,2) DEFAULT 0,

    -- ค่าลดหย่อน
    personal_allowance NUMERIC(10,2) DEFAULT 0,     -- ค่าลดหย่อนส่วนตัว
    sso_deduction NUMERIC(10,2) DEFAULT 0,          -- ประกันสังคม
    other_allowances NUMERIC(10,2) DEFAULT 0,       -- ลดหย่อนอื่นๆ
    total_allowances NUMERIC(10,2) DEFAULT 0,

    -- ภาษี
    taxable_income NUMERIC(10,2) DEFAULT 0,         -- รายได้หลังหักค่าลดหย่อน
    tax_amount NUMERIC(10,2) DEFAULT 0,             -- ภาษีที่ต้องจ่าย
    tax_rate NUMERIC(5,4) DEFAULT 0,                -- อัตราภาษี

    -- สะสมประจำปี
    ytd_income NUMERIC(10,2) DEFAULT 0,
    ytd_tax NUMERIC(10,2) DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_tax_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    CONSTRAINT fk_tax_period FOREIGN KEY (wage_period_id) REFERENCES wage_periods(id) ON DELETE CASCADE,
    CONSTRAINT unique_tax_period UNIQUE(employee_id, wage_period_id)
);

CREATE INDEX idx_tax_employee ON public.tax_calculations(employee_id);
CREATE INDEX idx_tax_period ON public.tax_calculations(wage_period_id);

COMMENT ON TABLE public.tax_calculations IS 'ตารางคำนวณภาษีเงินได้หัก ณ ที่จ่าย';
COMMENT ON COLUMN public.tax_calculations.taxable_income IS 'รายได้หลังหักค่าลดหย่อน';
COMMENT ON COLUMN public.tax_calculations.ytd_income IS 'รายได้สะสมตั้งแต่ต้นปี (Year-to-Date)';

-- ========================================
-- 7. ตาราง employee_wage_summary_ytd: สรุปค่าจ้างสะสมรายปี
-- ========================================
CREATE TABLE IF NOT EXISTS public.employee_wage_summary_ytd (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,

    -- สะสมรายได้
    ytd_gross_wage NUMERIC(12,2) DEFAULT 0,
    ytd_attendance_bonus NUMERIC(12,2) DEFAULT 0,
    ytd_total_income NUMERIC(12,2) DEFAULT 0,

    -- สะสมหัก
    ytd_sso NUMERIC(12,2) DEFAULT 0,
    ytd_tax NUMERIC(12,2) DEFAULT 0,
    ytd_other_deductions NUMERIC(12,2) DEFAULT 0,
    ytd_total_deductions NUMERIC(12,2) DEFAULT 0,

    -- สุทธิ
    ytd_net_wage NUMERIC(12,2) DEFAULT 0,

    -- สถิติ
    total_periods_paid INTEGER DEFAULT 0,
    total_days_worked INTEGER DEFAULT 0,
    total_ot_hours NUMERIC(10,2) DEFAULT 0,

    last_updated_period_id INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_ytd_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    CONSTRAINT unique_ytd UNIQUE(employee_id, year)
);

CREATE INDEX idx_ytd_employee_year ON public.employee_wage_summary_ytd(employee_id, year);

COMMENT ON TABLE public.employee_wage_summary_ytd IS 'ตารางสรุปค่าจ้างสะสมรายปีของพนักงาน (Year-to-Date Summary)';
COMMENT ON COLUMN public.employee_wage_summary_ytd.ytd_gross_wage IS 'เงินเดือนสะสมตั้งแต่ต้นปี';
COMMENT ON COLUMN public.employee_wage_summary_ytd.ytd_sso IS 'ประกันสังคมสะสมตั้งแต่ต้นปี';
COMMENT ON COLUMN public.employee_wage_summary_ytd.ytd_net_wage IS 'เงินได้สุทธิสะสมตั้งแต่ต้นปี';

-- ========================================
-- 8. Functions และ Triggers
-- ========================================

-- Function: คำนวณค่าจ้างรายวันอัตโนมัติ
CREATE OR REPLACE FUNCTION calculate_daily_wage()
RETURNS TRIGGER AS $$
BEGIN
    -- ดึงอัตราค่าจ้างจากตาราง employees
    SELECT perhr_salary, perday_salary
    INTO NEW.perhr_salary, NEW.perday_salary
    FROM employees
    WHERE employee_id = NEW.employee_id;

    -- คำนวณค่าจ้างพื้นฐาน (8 ชม.)
    IF NEW.actual_hours > 0 THEN
        NEW.base_wage := 8 * COALESCE(NEW.perhr_salary, 0);
    ELSE
        NEW.base_wage := 0;
    END IF;

    -- คำนวณค่า OT แต่ละระดับ (ชั่วโมงที่บันทึกคูณด้วย multiplier แล้ว)
    NEW.ot1_wage := COALESCE(NEW.ot_normal_hours, 0) * COALESCE(NEW.perhr_salary, 0);
    NEW.ot2_wage := COALESCE(NEW.ot_special_hours, 0) * COALESCE(NEW.perhr_salary, 0);
    NEW.ot3_wage := COALESCE(NEW.ot_premium_hours, 0) * COALESCE(NEW.perhr_salary, 0);

    -- รวมค่าจ้างของวัน
    NEW.daily_total_wage := NEW.base_wage + NEW.ot1_wage + NEW.ot2_wage + NEW.ot3_wage;

    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: คำนวณค่าจ้างรายวันเมื่อ insert/update
CREATE TRIGGER trigger_calculate_daily_wage
    BEFORE INSERT OR UPDATE ON daily_wages
    FOR EACH ROW
    EXECUTE FUNCTION calculate_daily_wage();

COMMENT ON FUNCTION calculate_daily_wage() IS 'คำนวณค่าจ้างรายวันอัตโนมัติเมื่อมีการเพิ่มหรือแก้ไขข้อมูล';

-- ========================================
-- 9. Views สำหรับ Query ข้อมูลง่ายขึ้น
-- ========================================

-- View: ดูค่าจ้างรายวันพร้อมข้อมูลพนักงาน
CREATE OR REPLACE VIEW v_daily_wages_detail AS
SELECT
    dw.*,
    e.name,
    e.department,
    wp.wage_month,
    wp.period_number,
    wp.payment_date,
    da.check_in_time,
    da.check_out_time,
    da.scheduled_in_time,
    da.scheduled_out_time
FROM daily_wages dw
LEFT JOIN employees e ON dw.employee_id = e.employee_id
LEFT JOIN wage_periods wp ON dw.wage_period_id = wp.id
LEFT JOIN daily_attendance da ON dw.employee_id = da.employee_id AND dw.work_date = da.work_date;

COMMENT ON VIEW v_daily_wages_detail IS 'View แสดงข้อมูลค่าจ้างรายวันพร้อมรายละเอียดพนักงานและเวลาเข้า-ออก';

-- View: สรุปค่าจ้างรายงวดพร้อมข้อมูลพนักงาน
CREATE OR REPLACE VIEW v_period_wages_detail AS
SELECT
    pw.*,
    e.name,
    e.department,
    wp.wage_month,
    wp.period_number,
    wp.work_start_date,
    wp.work_end_date,
    wp.payment_date,
    sso.total_monthly_sso,
    sso.sso_due_date
FROM period_wages pw
LEFT JOIN employees e ON pw.employee_id = e.employee_id
LEFT JOIN wage_periods wp ON pw.wage_period_id = wp.id
LEFT JOIN sso_monthly_summary sso ON pw.employee_id = sso.employee_id
    AND wp.wage_month = sso.wage_month;

COMMENT ON VIEW v_period_wages_detail IS 'View แสดงข้อมูลค่าจ้างรายงวดพร้อมรายละเอียดการจ่ายและประกันสังคม';

-- ========================================
-- 10. Sample Data สำหรับทดสอบ
-- ========================================

-- สร้างงวดจ่ายเงินตัวอย่าง (พฤศจิกายน 2567)

-- ========================================
-- สรุป Database Schema
-- ========================================
/*
ตารางทั้งหมด 6 ตาราง:

1. wage_periods (งวดจ่ายเงิน)
   - กำหนดงวดการจ่ายเงิน 2 งวด/เดือน
   - ระบุวันทำงาน, วันจ่ายเงิน, วันส่ง SSO

2. daily_wages (ค่าจ้างรายวัน)
   - เก็บค่าจ้างของแต่ละคนแต่ละวัน
   - แยกเป็น: ค่าจ้างพื้นฐาน, OT 3 ระดับ

3. attendance_punctuality (ตรวจสอบเบี้ยขยัน)
   - ตรวจว่ามาก่อนเวลา >= 5 นาทีหรือไม่
   - ใช้คำนวณเบี้ยขยัน 300 บาท

4. period_wages (สรุปค่าจ้างรายงวด)
   - สรุปค่าจ้างทั้งงวด
   - รวมเบี้ยขยัน, หัก SSO, หักภาษี
   - คำนวณเงินสุทธิ

5. sso_monthly_summary (ประกันสังคมรายเดือน)
   - คำนวณ SSO แบบสะสมรายเดือน
   - รองรับการหักแบบ 2 งวด (งวดที่ 2 หัก ส่วนต่าง)

6. tax_calculations (ภาษีเงินได้)
   - คำนวณภาษีหัก ณ ที่จ่าย
   - เก็บข้อมูลสะสมประจำปี

7. employee_wage_summary_ytd (สรุปสะสมรายปี)
   - เก็บข้อมูลสะสมตั้งแต่ต้นปี (YTD)
   - เงินเดือน, SSO, ภาษี, เงินสุทธิ

Views:
- v_daily_wages_detail: ดูค่าจ้างรายวันพร้อมข้อมูลพนักงาน
- v_period_wages_detail: ดูค่าจ้างรายงวดพร้อมข้อมูล SSO

Functions:
- calculate_daily_wage(): คำนวณค่าจ้างรายวันอัตโนมัติ
*/
