import { pool } from '../config/db';

export async function listCameras() {
    const result = await pool.query(
        "SELECT * FROM cameras"
    );
    return result.rows;
}

export async function changeStatus(id: number, status: boolean) {
    const result = await pool.query(
        "UPDATE cameras SET cam_status = $1 WHERE cam_id = $2 RETURNING *",
        [status, id]
    );
    return result.rows[0]; // คืนค่ากล้องที่ถูกอัพเดต
}
