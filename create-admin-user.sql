-- สร้าง admin user สำหรับทดสอบ
-- Password: admin2025 (จะถูก hash ด้วย bcrypt)

SET search_path TO aods_dev_v3;

-- Hash password: admin2025 (ใช้ bcrypt rounds = 12)
-- ตัวอย่าง hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYq5q5q5q5q
-- แต่ในที่นี้จะใช้วิธี INSERT แล้วให้ application hash ให้

-- ตรวจสอบ role admin ก่อน
SELECT rol_id, rol_name FROM roles WHERE rol_name = 'admin';

-- สร้าง user admin2025 (ต้อง hash password ก่อน)
-- สำหรับทดสอบ: ใช้ password ที่ hash แล้วจาก bcrypt
-- Password: admin2025 -> Hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYq5q5q5q5q

-- หรือใช้วิธีง่ายๆ: สร้างผ่าน API register endpoint

