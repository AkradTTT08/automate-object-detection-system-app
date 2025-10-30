import { pool } from "../config/db";
import * as Model from "../models/users.model";
import * as Mapping from "../models/Mapping/users.map";
import bcrypt from 'bcrypt';

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

// ✅ 2025-10-30
export async function updateProfile(
  user_id: number,
  name: string,
  phone: string,
  email: string
) {
    const { rows } = await pool.query(
      `
      UPDATE users
      SET 
        usr_name = $1,
        usr_phone = $2,
        usr_email = $3,
        usr_updated_at = CURRENT_TIMESTAMP
      WHERE usr_id = $4
      RETURNING usr_id, usr_username, usr_name, usr_phone, usr_email, usr_rol_id, usr_updated_at;
      `,
      [name.trim(), phone.trim(), email.trim(), user_id]
    );

    if (rows.length === 0) {
      throw new Error("User not found");
    }

    return rows[0];
}

// ✅ 2025-10-30
export async function updatePassword(
  user_id: number,
  password: string
) {
    const hashed = await bcrypt.hash(password, 12);

    const { rowCount } = await pool.query(
      `
      UPDATE users
      SET usr_password = $1,
          usr_updated_at = CURRENT_TIMESTAMP
      WHERE usr_id = $2;
      `,
      [hashed, user_id]
    );

    if (rowCount === 0) {
      throw new Error("User not found");
    }

    return {
      success: true,
      message: "Password updated successfully",
    };
}