-- Add updated_at column to leave_records table if it doesn't exist
ALTER TABLE leave_records
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create check-in/check-out records table
CREATE TABLE IF NOT EXISTS attendance_checkin (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    work_date DATE NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    shift INTEGER, -- 1 = 08:00-17:00, 2 = 20:00-05:00
    gps_location_in TEXT, -- GPS coordinates for check-in (latitude,longitude)
    gps_location_out TEXT, -- GPS coordinates for check-out
    is_checked_in BOOLEAN DEFAULT FALSE,
    is_checked_out BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_checkin_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    UNIQUE(employee_id, work_date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_attendance_checkin_employee_date
ON attendance_checkin(employee_id, work_date);

CREATE INDEX IF NOT EXISTS idx_attendance_checkin_date
ON attendance_checkin(work_date);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
DROP TRIGGER IF EXISTS update_leave_records_updated_at ON leave_records;
CREATE TRIGGER update_leave_records_updated_at
    BEFORE UPDATE ON leave_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_attendance_checkin_updated_at ON attendance_checkin;
CREATE TRIGGER update_attendance_checkin_updated_at
    BEFORE UPDATE ON attendance_checkin
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
