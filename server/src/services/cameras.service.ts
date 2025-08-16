import { pool } from '../config/db';

/**
 * ดึงรายการกล้องทั้งหมดจากฐานข้อมูล
 *
 * @returns {Promise<any[]>} รายการกล้องทั้งหมด
 * 
 * @author Wanasart
 */
export async function listCameras() {
    const result = await pool.query(
        "SELECT * FROM cameras"
    );
    return result.rows;
}

/**
 * นับจำนวนกล้องทั้งหมดที่ใช้งานอยู่
 *
 * @returns {Promise<any[]>} จำนวนกล้องที่ใช้งานอยู่ทั้งหมด
 * 
 * @author Premsirigul
 */
export async function totalCameras() {
    const result = await pool.query(
        "SELECT COUNT(*) FROM cameras WHERE cam_is_use = true"
    );
    return result.rows;
}

/**
 * ดึงรายการประวัติการซ่อมบำรุงทั้งหมด
 *
 * @returns {Promise<any[]>} รายการประวัติการซ่อมบำรุงทั้งหมด
 * 
 * @author Jirayu
 * 
 */
export async function getAllMaintenanceHistory() {
    const query = `
        SELECT 
            mnt_id,
            mnt_date,
            mnt_type,
            mnt_technician,
            mnt_note,
            mnt_is_use,
            mnt_camera_id
        FROM maintenance_history 
        WHERE mnt_is_use = true
        ORDER BY mnt_date DESC
    `;

    const result = await pool.query(query);

    return result.rows;
}
/**
 * เปลี่ยนสถานะของกล้อง
 *
 * @param {string} cam_id - ไอดีของ cam ที่จะเปลี่ยนสถานะ
 * @param {string} cam_status - สถานะที่จะเปลี่ยน
 * @returns {Promise<any[]>} กล้องที่ถูกอัปเดต
 * 
 * @author Audomsak
 * 
 */
export async function changeStatus(cam_id: number, cam_status: boolean) {
    const result = await pool.query(
        "UPDATE cameras SET cam_status = $1 WHERE cam_id = $2 RETURNING *",
        [cam_status, cam_id]
    );
    return result.rows[0]; // คืนค่ากล้องที่ถูกอัพเดต
}
