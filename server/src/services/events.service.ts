import { pool } from '../config/db';

/**
 * ดึงรายการ Event Detection จากฐานข้อมูล
 *
 * @returns {Promise<any[]>} รายการ Event Detection
 * (icon, name, sensitivity, priority, status)
 * @description
 * ฟังก์ชันนี้จะ query join ข้อมูลระหว่าง events กับ camera_detection_settings
 * โดยใช้ evt_id = cds_event_id เพื่อดึงรายละเอียดที่จำเป็นสำหรับการแสดงผล
 * 
 * @author Wongsakon
 */
export async function eventDetection() {
    const result = await pool.query(
        "SELECT evt_icon, evt_name, cds_sensitivity, cds_priority, cds_status FROM events INNER JOIN camera_detection_settings ON evt_id = cds_event_id"
    );
    return result.rows;
}