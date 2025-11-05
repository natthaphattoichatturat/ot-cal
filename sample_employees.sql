-- Sample employee data
-- Run this in Supabase SQL Editor to populate test data

INSERT INTO employees (employee_id, name, department, perday_salary, perhr_salary) VALUES
('20056402', 'สมชาย ใจดี', 'Production', 500.00, 62.50),
('20056415', 'สมหญิง รักงาน', 'Production', 500.00, 62.50),
('20056330', 'วิชัย ขยัน', 'Quality Control', 550.00, 68.75),
('20056154', 'นิภา มั่นคง', 'Assembly', 480.00, 60.00),
('20056572', 'ประเสริฐ สุขใจ', 'Warehouse', 520.00, 65.00),
('20055882', 'สุนันท์ วิริยะ', 'Packing', 490.00, 61.25),
('20056545', 'วัชระ ทำดี', 'Production', 510.00, 63.75),
('20056418', 'สมศรี มีสุข', 'Assembly', 495.00, 61.88),
('20054852', 'ธนา เจริญ', 'Maintenance', 580.00, 72.50),
('20055708', 'รัตนา งามสม', 'Quality Control', 530.00, 66.25)
ON CONFLICT (employee_id) DO NOTHING;

-- Sample special holidays
INSERT INTO special_holidays (holiday_date, holiday_name, is_national, description) VALUES
('2025-01-01', 'วันขึ้นปีใหม่', true, 'วันหยุดราชการ'),
('2025-04-13', 'วันสงกรานต์', true, 'วันหยุดราชการ'),
('2025-04-14', 'วันสงกรานต์', true, 'วันหยุดราชการ'),
('2025-04-15', 'วันสงกรานต์', true, 'วันหยุดราชการ'),
('2025-05-01', 'วันแรงงาน', true, 'วันหยุดราชการ'),
('2025-05-05', 'วันฉัตรมงคล', true, 'วันหยุดราชการ'),
('2025-07-28', 'วันเฉลิมพระชนมพรรษา', true, 'วันหยุดราชการ'),
('2025-08-12', 'วันแม่', true, 'วันหยุดราชการ'),
('2025-10-13', 'วันคล้ายวันสวรรคต', true, 'วันหยุดราชการ'),
('2025-10-23', 'วันปิยมหาราช', true, 'วันหยุดราชการ'),
('2025-12-05', 'วันพ่อ', true, 'วันหยุดราชการ'),
('2025-12-10', 'วันรัฐธรรมนูญ', true, 'วันหยุดราชการ'),
('2025-12-31', 'วันสิ้นปี', true, 'วันหยุดราชการ')
ON CONFLICT (holiday_date) DO NOTHING;

-- Sample leave records
INSERT INTO leave_records (employee_id, leave_date, leave_type, reason, created_by) VALUES
('20056402', '2025-10-18', 'Sick', 'ป่วยเป็นไข้', 'Admin'),
('20056415', '2025-10-19', 'Personal', 'ธุระส่วนตัว', 'Admin')
ON CONFLICT (employee_id, leave_date) DO NOTHING;
