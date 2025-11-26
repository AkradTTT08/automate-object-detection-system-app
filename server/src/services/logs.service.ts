import { pool } from "../config/db";
import * as Mapping from "../models/Mapping/logs.map";

/**
 * ดึงรายการบันทึกกล้อง (Camera Logs) ทั้งหมดจากฐานข้อมูล
 * รวมข้อมูลผู้ใช้งาน (users), บทบาท (roles) และข้อมูลกล้อง (cameras)
 * เหมาะสำหรับใช้แสดงในหน้า Camera Logs / Audit Trail / Activity Monitor
 *
 * @returns {Promise<Array<Model.CameraLog>>} รายการบันทึกกล้องทั้งหมด เรียงตามเวลาที่สร้าง (clg_created_at) แบบล่าสุดก่อน (DESC)
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-11-26
 */
export async function getCameraLogs(){
    const { rows } = await pool.query(`
        SELECT
            clg_id, 
            clg_usr_id, 
            usr_username,
            rol_name,
            clg_cam_id, 
            cam_name,
            clg_action, 
            clg_created_at
        FROM camera_logs
        JOIN users ON clg_usr_id = usr_id
        JOIN roles ON usr_rol_id = rol_id
        JOIN cameras ON clg_cam_id = cam_id
        ORDER BY clg_created_at DESC;
    `);

    return rows.map(Mapping.mapCameraLogsToSaveResponse);
}

/**
 * ดึงรายการบันทึกการแจ้งเตือน (Alert Logs) ทั้งหมดจากฐานข้อมูล
 * รวมข้อมูลผู้ใช้งาน (users) และบทบาท (roles)
 * เหมาะสำหรับใช้แสดงในหน้า Alert Logs / Alert Monitor / Audit Trail
 *
 * @returns {Promise<Array<Model.AlertLog>>} รายการบันทึกการแจ้งเตือนทั้งหมด เรียงตามเวลาที่สร้าง (alg_created_at) แบบล่าสุดก่อน (DESC)
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-11-26
 */
export async function getAlertLogs(){
    const { rows } = await pool.query(`
        SELECT
            alg_id, 
            alg_usr_id, 
            usr_username,
            rol_name,
            alg_alr_id, 
            alg_action, 
            alg_created_at
        FROM alert_logs
        JOIN users ON alg_usr_id = usr_id
        JOIN roles ON usr_rol_id = rol_id
        ORDER BY alg_created_at DESC;
    `);

    return rows.map(Mapping.mapAlertLogsToSaveResponse);
}

export async function getUserLogs(){
    
}