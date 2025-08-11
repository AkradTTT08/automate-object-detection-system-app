import { pool } from '../config/db';

export async function listCameras() {
    console.log("Fetching cameras from the database...");
    const result = await pool.query(
        "SELECT * FROM cameras"
    );
    return result.rows;
}