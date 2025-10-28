import { pool } from "../config/db";
import * as Model from "../models/users.model";
import * as Mapping from "../models/Mapping/users.map";

// ✅
export async function getUserById(user_id: number){
    const { rows } =  await pool.query(`
        SELECT
            usr_id, 
            usr_rol_id, 
            usr_username, 
            usr_email, 
            usr_name, 
            usr_phone, 
            usr_profile, 
            usr_created_at, 
            usr_updated_at, 
            usr_is_use 
        FROM users
        WHERE usr_id = $1;
    `, [user_id]);

    return Mapping.mapUserToSaveResponse(rows[0]);
}