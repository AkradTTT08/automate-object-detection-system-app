import { pool } from '../config/db';

export async function createEvent(evt_icon: string, evt_name: string, evt_des: string) {
    const { rows } = await pool.query(`
        INSERT INTO events(evt_icon, evt_name, evt_description) 
        VALUES($1, $2, $3)
        RETURNING *
    `, [evt_icon, evt_name, evt_des]);
    
    const events = rows[0];
    
    if(!events){
        throw new Error('Failed to insert events');
    }

    return events;
}

/**
 * ดึงรายการ Events ทั้งหมดที่ยังใช้งานอยู่
 *
 * @returns {Promise<Event[]>} รายการ Events ที่ถูกใช้งานอยู่ทั้งหมด
 * @description ดึงข้อมูล Events จากฐานข้อมูลโดยเรียงตาม evt_id จากมากไปน้อย และแสดงเฉพาะ Events ที่ยังใช้งานอยู่

 * 
 * @author Jirayu
 */
export async function getAllEvents(): Promise<Event[]> {
    const query = `
        SELECT evt_id, evt_icon, evt_name, evt_description, evt_is_use
        FROM events 
        WHERE evt_is_use = true
        ORDER BY evt_id DESC
    `;
    
    const { rows } = await pool.query<Event>(query);
    return rows;
}