import { pool } from '../config/db';

export async function listCameras() {
    const result = await pool.query(
        "SELECT * FROM cameras"
    );
    return result.rows;
}

/**
 * ดึงรายการประวัติการซ่อมบำรุงตามรหัสกล้อง
 *
 * @param {number} cam_id - รหัสกล้องที่ต้องการดูประวัติการซ่อมบำรุง
 * @returns {Promise<any[]>} รายการประวัติการซ่อมบำรุงของกล้องที่ระบุ
 * @description ดึงข้อมูลประวัติการซ่อมบำรุงจากฐานข้อมูลตามรหัสกล้อง
 * 
 * @author Jirayu
 */
export async function getMaintenanceHistoryByCamId(cam_id: number): Promise<any[]> {
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
        WHERE mnt_camera_id = $1 
        AND mnt_is_use = true
        ORDER BY mnt_date DESC
    `;
    
    const { rows } = await pool.query(query, [cam_id]);
    return rows;
}