import { pool } from '../config/db';

/**
 * ดึงรายการประวัติการซ่อมบำรุงทั้งหมด
 *
 * @returns {Promise<any[]>} รายการประวัติการซ่อมบำรุงทั้งหมด
 * @description ดึงข้อมูลจากฐานข้อมูล โดยแปลงวันที่เป็น วัน-เดือน-ปี (ค.ศ.)
 */
export async function getAllMaintenanceHistory(): Promise<any[]> {
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

    const { rows } = await pool.query(query);

    return rows;
}
