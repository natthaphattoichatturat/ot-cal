CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    perday_salary DECIMAL(10,2) , -- Dayly base salary
    perhr_salary DECIMAL(10,2) ,
    bank_id INTEGER,
    bank_account INTEGER,
    identity_id VARCHAR(20), -- Changed to VARCHAR to store identity card number
    line_id TEXT, -- LINE User ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance scans table
CREATE TABLE IF NOT EXISTS attendance_scans (
    id SERIAL PRIMARY KEY,
    machine_id VARCHAR(10) NOT NULL,
    scan_date DATE NOT NULL,
    scan_time TIME NOT NULL,
    employee_id VARCHAR(20) NOT NULL,
    scan_type INTEGER NOT NULL CHECK (scan_type IN (1, 2)), -- 1 = IN, 2 = OUT
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

-- Daily attendance summary table
CREATE TABLE IF NOT EXISTS daily_attendance (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    work_date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    scheduled_in_time TIME,
    scheduled_out_time TIME,
    actual_hours DECIMAL(5,2) DEFAULT 0,
    ot_hours DECIMAL(5,2) DEFAULT 0,
    is_holiday BOOLEAN DEFAULT FALSE,
    is_leave BOOLEAN DEFAULT FALSE,
    late BOOLEAN DEFAULT FALSE,
    late_hours DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_daily_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    UNIQUE(employee_id, work_date)
);

CREATE TABLE IF NOT EXISTS special_holidays (
    id SERIAL PRIMARY KEY,
    holiday_date DATE NOT NULL,
    holiday_name VARCHAR(100) NOT NULL,
    is_national BOOLEAN DEFAULT TRUE,   -- TRUE = วันหยุดราชการ, FALSE = วันหยุดภายในบริษัท
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(holiday_date)
);

-- Leave records table
CREATE TABLE IF NOT EXISTS leave_records (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    leave_date DATE NOT NULL,
    leave_type VARCHAR(50) DEFAULT 'Personal', -- Personal, Sick, Vacation, etc.
    reason TEXT,
    leave_able BOOLEAN DEFAULT FALSE, -- Approval status
    rejected_reason TEXT, -- Reason if rejected
    created_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_leave_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    UNIQUE(employee_id, leave_date)
);