import { pool } from '../config/db';

export async function createEvent(evt_icon: string, evt_name: string, evt_des: string) {
    const { rows } = await pool.query(`
        INSERT INTO events(evt_icon, evt_name, evt_description) 
        VALUES($1, $2, $3)
        RETURNING *
    `, [evt_icon, evt_name, evt_des]);

    const events = rows[0];

    if (!events) {
        throw new Error('Failed to insert events');
    }

    return events;
}

/**
 * อัปเดตข้อมูลของ Event ที่ระบุด้วย evt_id
 *
 * ฟังก์ชันนี้จะอัปเดตไอคอน, ชื่อ, และคำอธิบายของ Event ในฐานข้อมูล
 * หากพบ Event ตาม evt_id จะคืนค่าเป็น object ของ Event หลังการอัปเดต
 * หากไม่พบ Event หรืออัปเดตไม่สำเร็จ จะโยน Error
 *
 * @param {number} evt_id - รหัสของ Event ที่ต้องการอัปเดต
 * @param {string} evt_icon - ไอคอนใหม่ของ Event
 * @param {string} evt_name - ชื่อใหม่ของ Event
 * @param {string} evt_des - คำอธิบายใหม่ของ Event
 * @returns {Promise<object>} Event object หลังอัปเดต
 * @throws {Error} เมื่อไม่พบ Event หรืออัปเดตไม่สำเร็จ
 *
 * @author Fasai
 */
export async function updateEvent(evt_id: number, evt_icon: string, evt_name: string, evt_des: string) {
    const { rows } = await pool.query(`
        UPDATE events
        SET evt_icon = $1,
            evt_name = $2,
            evt_description = $3
        WHERE evt_id = $4
        RETURNING *;
        `, [evt_icon, evt_name, evt_des, evt_id]);

    const events = rows[0];

    if (!events) {
        throw new Error('Failed to update event or event not found');
    }


    return events;
}