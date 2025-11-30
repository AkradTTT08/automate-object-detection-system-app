import { pool } from "../config/db";
import * as Model from "../models/users.model";
import * as Mapping from "../models/Mapping/users.map";
import bcrypt from 'bcrypt';

/**
 * ดึงข้อมูลผู้ใช้งานจากฐานข้อมูลตามรหัสที่ระบุ
 * ใช้สำหรับโหลดข้อมูลผู้ใช้เพื่อแสดงในหน้าโปรไฟล์ หรือหน้าจัดการผู้ใช้
 *
 * @async
 * @function getUserById
 * @param {number} user_id - รหัสผู้ใช้งานที่ต้องการค้นหา
 * @returns {Promise<Model.User>} ข้อมูลผู้ใช้ที่พบ (หรือ undefined หากไม่พบ)
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-30
 */
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

/**
 * อัปเดตข้อมูลโปรไฟล์ผู้ใช้งานตามรหัสที่ระบุ
 * ปรับปรุงชื่อ เบอร์โทร อีเมล และอัปเดตเวลาแก้ไข (usr_updated_at) ให้เป็นปัจจุบัน
 * คืนค่าข้อมูลผู้ใช้ที่อัปเดตแล้ว (ไม่รวมรหัสผ่าน)
 *
 * @async
 * @function updateProfile
 * @param {number} user_id - รหัสผู้ใช้งานเป้าหมาย
 * @param {string} name - ชื่อที่ต้องการอัปเดต (ระบบจะ trim ช่องว่างให้)
 * @param {string} phone - เบอร์โทรศัพท์ที่ต้องการอัปเดต (ระบบจะ trim ช่องว่างให้)
 * @param {string} email - อีเมลที่ต้องการอัปเดต (ระบบจะ trim ช่องว่างให้)
 * @returns {Promise<{
 *   usr_id: number,
 *   usr_username: string,
 *   usr_name: string,
 *   usr_phone: string,
 *   usr_email: string,
 *   usr_rol_id: number,
 *   usr_updated_at: string
 * }>} ออบเจ็กต์ผู้ใช้ที่ถูกอัปเดต (ฟิลด์ปลอดภัย ไม่รวมรหัสผ่าน)
 * @throws {Error} หากไม่พบผู้ใช้งานที่ระบุ (User not found) หรือเกิดข้อผิดพลาดฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-30
 */
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

/**
 * เปลี่ยนรหัสผ่านของผู้ใช้งานตามรหัสที่ระบุ
 * ระบบจะทำการแฮชรหัสผ่านใหม่ด้วย bcrypt (saltRounds = 12) และอัปเดตเวลาแก้ไข
 *
 * ข้อควรระวัง: ส่งรหัสผ่านเข้าฟังก์ชันนี้ผ่านช่องทางที่ปลอดภัยเท่านั้น (HTTPS)
 *
 * @async
 * @function updatePassword
 * @param {number} user_id - รหัสผู้ใช้งานเป้าหมาย
 * @param {string} password - รหัสผ่านใหม่ (Plain text ที่จะถูกแฮชภายในฟังก์ชัน)
 * @returns {Promise<{ success: boolean, message: string }>} สถานะการอัปเดตและข้อความยืนยัน
 * @throws {Error} หากไม่พบผู้ใช้งานที่ระบุ (User not found) หรือเกิดข้อผิดพลาดฐานข้อมูล/การแฮช
 *
 * @author Wanasart
 * @lastModified 2025-10-30
 */
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




/**
 * อัปเดตข้อมูลผู้ใช้งานตามรหัสผู้ใช้ที่ระบุ
 * ระบบจะตรวจสอบความซ้ำของ Username/Email (ยกเว้นบัญชีของตัวเอง)
 * แปลงชื่อบทบาท (role name) เป็นรหัสบทบาท (rol_id) จากตาราง roles
 * และอัปเดตข้อมูลลงในฐานข้อมูล พร้อมบันทึกเวลาแก้ไขล่าสุด
 *
 * ข้อควรระวัง:
 * - ใช้ฟังก์ชันนี้ในส่วนที่ได้รับอนุญาตเท่านั้น (เช่น Admin Panel)
 * - ควรใช้ผ่าน HTTPS เพื่อความปลอดภัยของข้อมูลผู้ใช้งาน
 *
 * @async
 * @function updatedUser
 * @param {number} userId - รหัสผู้ใช้งานที่ต้องการแก้ไข
 * @param {Object} data - ข้อมูลใหม่ของผู้ใช้งาน
 * @param {string} data.username - ชื่อผู้ใช้ใหม่ (ตรวจสอบความซ้ำ)
 * @param {string} data.email - อีเมลใหม่ (ตรวจสอบความซ้ำ)
 * @param {string} data.name - ชื่อจริงของผู้ใช้งาน
 * @param {string} data.phone - เบอร์โทรศัพท์
 * @param {string} data.usr_role - บทบาทใหม่ (เช่น "admin", "staff", "user")
 * @param {boolean} data.is_use - สถานะการใช้งานบัญชี (true = ใช้งานอยู่)
 *
 * @returns {Promise<Object>} ข้อมูลผู้ใช้งานหลังอัปเดต (รวม rol_name)
 * @author Premsirikun Ketphaen
 * @lastModified 2025-11-30
 */
export async function updatedUser(
  userId: number, 
  data :{username: string;name: string;phone: string;email: string;usr_role: string;  is_use: boolean;
}) {
  const {username,name,phone,email,usr_role,is_use} = data;
  const existing = await pool.query(
  `
    SELECT * FROM users
    WHERE (usr_username = $1 OR usr_email = $2)
    AND usr_id <> $3
  `,
  [username, email, userId]
);
if (existing.rows.length > 0) {
  throw new Error("Username or email already exists");
}
const roleRes = await pool.query(
  `
    SELECT rol_id FROM roles
    WHERE rol_name = $1
  `,
  [usr_role]      
);
if (roleRes.rows.length === 0) {
    throw new Error("Role not found");
  }
const role_id = roleRes.rows[0].rol_id;
  const { rows } = await pool.query(
    `
      UPDATE users
      SET
        usr_username = $1,
        usr_email    = $2,
        usr_name     = $3,
        usr_phone    = $4,
        usr_rol_id   = $5,   
        usr_is_use   = $6,
        usr_updated_at = CURRENT_TIMESTAMP
      WHERE usr_id = $7
      RETURNING usr_id,usr_username,usr_email,usr_name,usr_phone,usr_rol_id,
        (SELECT rol_name FROM roles WHERE rol_id = usr_rol_id) AS usr_role
    `,
    [username.trim(), email.trim(), name.trim(), phone.trim(), role_id, is_use, userId]
  );

  if (rows.length === 0) {
    throw new Error("Failed to update user");
  }

  return rows[0]; 
}

/**
 * ปิดการใช้งานผู้ใช้แบบ Soft Delete ตาม userId ที่ระบุ
 * ฟังก์ชันนี้จะอัปเดตฟิลด์ usr_is_use ให้เป็น FALSE และตั้งค่าเวลา usr_updated_at เป็นเวลาปัจจุบัน
 * โดยไม่ลบข้อมูลจริงออกจากฐานข้อมูล จากนั้นคืนค่าข้อมูลผู้ใช้ที่ถูกปิดใช้งานกลับไป
 *
 * @param {number} userId - รหัสผู้ใช้งานที่ต้องการปิดการใช้งาน
 * @returns {Promise<Object>} ออบเจ็กต์ข้อมูลผู้ใช้หลังจากถูกปิดการใช้งานสำเร็จ
 * @throws {Error} หากไม่พบผู้ใช้ตาม userId ที่ระบุ
 *
 * @description ใช้สำหรับกรณีที่ต้องการให้ผู้ใช้ไม่สามารถเข้าสู่ระบบได้
 * โดยยังเก็บข้อมูลไว้ในระบบเพื่ออ้างอิงในอนาคต (Soft Delete)
 *
 * @author Premsirikun
 * @lastModified 2025-11-30
 */
export async function softDeleteUser(userId: number) {
  const { rows } = await pool.query(
    `
      UPDATE users
      SET usr_is_use = FALSE,
          usr_updated_at = CURRENT_TIMESTAMP
      WHERE usr_id = $1
      RETURNING 
        usr_id,
        usr_username,
        usr_email,
        usr_name,
        usr_is_use
    `,
    [userId]
  );

  if (rows.length === 0) {
    throw new Error("User not found");
  }

  return rows[0]; // ส่ง user กลับเพื่อให้ frontend รู้ว่าปิดใช้งานแล้ว
}