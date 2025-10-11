-- สคริปต์สำหรับเพิ่มข้อมูลตัวอย่างในตาราง appraisal และ Score

-- 1. เพิ่มข้อมูล detail (ถ้ายังไม่มี)
INSERT OR IGNORE INTO detail (detail_id, topic, max_score) VALUES
(1, 'การมาปฏิบัติงาน (Attendance)', 10),
(2, 'ผลงานตามตัวชี้วัด (Performance/KPI)', 70),
(3, 'พฤติกรรมการปฏิบัติงาน (Behavior)', 20);

-- 2. เพิ่มข้อมูล SubDetail ตัวอย่าง (ถ้ายังไม่มี)
INSERT OR IGNORE INTO SubDetail (detail_id, subdetail_id, subdetail_topic) VALUES
-- Attendance (detail_id = 1)
(1, 1, 'การมาทำงานตรงเวลา'),
(1, 2, 'การลางาน'),

-- Performance (detail_id = 2)
(2, 1, 'คุณภาพของงาน'),
(2, 2, 'ปริมาณงาน'),
(2, 3, 'ความรับผิดชอบ'),

-- Behavior (detail_id = 3)
(3, 1, 'ทัศนคติ'),
(3, 2, 'การทำงานร่วมกับผู้อื่น'),
(3, 3, 'ความคิดสร้างสรรค์');

-- 3. เพิ่มข้อมูล appraisal ตัวอย่าง
-- สมมติว่ามี emp_id = 1 อยู่ในตาราง employees
INSERT INTO appraisal (user_id, year, evaluated_at) VALUES
(1, 2025, datetime('2025-06-15 10:30:00')),
(1, 2025, datetime('2025-05-10 14:00:00'));

-- ดึง ap_id ที่เพิ่งสร้าง
-- ap_id = 1 สำหรับการประเมินครั้งแรก
-- ap_id = 2 สำหรับการประเมินครั้งที่สอง

-- 4. เพิ่มคะแนนสำหรับ appraisal ครั้งแรก (ap_id = 1)
-- Attendance (detail_id=1): รวม 9 คะแนน
INSERT INTO Score (appraisal_id, detail_id, subdetail_id, score_value) VALUES
(1, 1, 1, 5.0),  -- การมาทำงานตรงเวลา
(1, 1, 2, 4.0);  -- การลางาน

-- Performance (detail_id=2): รวม 63 คะแนน
INSERT INTO Score (appraisal_id, detail_id, subdetail_id, score_value) VALUES
(1, 2, 1, 23.0),  -- คุณภาพของงาน
(1, 2, 2, 22.0),  -- ปริมาณงาน
(1, 2, 3, 18.0);  -- ความรับผิดชอบ

-- Behavior (detail_id=3): รวม 17.5 คะแนน
INSERT INTO Score (appraisal_id, detail_id, subdetail_id, score_value) VALUES
(1, 3, 1, 6.0),  -- ทัศนคติ
(1, 3, 2, 6.0),  -- การทำงานร่วมกับผู้อื่น
(1, 3, 3, 5.5);  -- ความคิดสร้างสรรค์

-- 5. เพิ่มคะแนนสำหรับ appraisal ครั้งที่สอง (ap_id = 2)
-- Attendance (detail_id=1): รวม 8.5 คะแนน
INSERT INTO Score (appraisal_id, detail_id, subdetail_id, score_value) VALUES
(2, 1, 1, 4.5),
(2, 1, 2, 4.0);

-- Performance (detail_id=2): รวม 60 คะแนน
INSERT INTO Score (appraisal_id, detail_id, subdetail_id, score_value) VALUES
(2, 2, 1, 20.0),
(2, 2, 2, 20.0),
(2, 2, 3, 20.0);

-- Behavior (detail_id=3): รวม 16 คะแนน
INSERT INTO Score (appraisal_id, detail_id, subdetail_id, score_value) VALUES
(2, 3, 1, 5.5),
(2, 3, 2, 5.5),
(2, 3, 3, 5.0);

-- 6. ตรวจสอบข้อมูลที่เพิ่มเข้าไป
SELECT 'Appraisals:' as info;
SELECT * FROM appraisal;

SELECT 'Scores by Appraisal:' as info;
SELECT 
    a.ap_id,
    e.first_name || ' ' || e.last_name as employee_name,
    d.topic,
    SUM(s.score_value) as total_score,
    d.max_score
FROM appraisal a
LEFT JOIN employees e ON a.user_id = e.emp_id
LEFT JOIN Score s ON a.ap_id = s.appraisal_id
LEFT JOIN detail d ON s.detail_id = d.detail_id
GROUP BY a.ap_id, d.detail_id
ORDER BY a.ap_id, d.detail_id;
