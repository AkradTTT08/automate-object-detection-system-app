import { pool } from "../config/db";
import * as Model from "../models/events.model";
import * as Mapping from "../models/Mapping/events.map";

// ✅
export async function getEvents() {
  const { rows } = await pool.query(`
        SELECT
            evt_id, 
            evt_icon, 
            evt_name, 
            evt_description, 
            evt_created_at, 
            evt_updated_at, 
            evt_is_use
        FROM events
        WHERE evt_is_use = true
        ORDER BY evt_id ASC;
    `);

  return rows.map(Mapping.mapEventsToSaveResponse);
}

// ✅
export async function getEventById(event_id: number) {
  const { rows } = await pool.query(
    `
    SELECT
        evt_id, 
        evt_icon, 
        evt_name, 
        evt_description, 
        evt_created_at, 
        evt_updated_at, 
        evt_is_use
        FROM events
    WHERE evt_id = $1
    AND evt_is_use = true;`,
    [event_id]
  );
  return Mapping.mapEventsToSaveResponse(rows[0]);
}

// ✅ INSERT EVENT
export async function insertEvent(
  icon_name: string,
  event_name: string,
  description: string,
  sensitivity: string,
  priority: string,
  status: boolean
) {
  try {
    // 🟦 1. INSERT event ใหม่
    const { rows: evtRows } = await pool.query(
      `
      INSERT INTO events (
        evt_icon, 
        evt_name, 
        evt_description
      )
      VALUES ($1, $2, $3)
      RETURNING evt_id;
      `,
      [icon_name, event_name, description]
    );

    const newEvent = evtRows[0];
    if (!newEvent) throw new Error("Failed to insert event");

    // 🟩 2. UPDATE GDS ที่เกี่ยวข้อง
    await pool.query(
      `
      UPDATE global_detection_settings
      SET
        gds_sensitivity = $1,
        gds_priority    = $2,
        gds_status      = $3,
        gds_updated_at  = CURRENT_TIMESTAMP
      WHERE gds_evt_id = $4;
      `,
      [sensitivity, priority, status, newEvent.evt_id]
    );

    // 🟨 3. ดึงข้อมูลจาก View
    const { rows: viewRows } = await pool.query(
      `
      SELECT * FROM v_events_overview
      WHERE event_id = $1;
      `,
      [newEvent.evt_id]
    );

    return viewRows[0];
  } catch (err: any) {
    // 🚨 ตรวจจับ error ชื่อซ้ำ
    if (err.code === "23505") {
      throw new Error("Event name already exists");
    }
    console.error("❌ insertEvent error:", err);
    throw err;
  }
}

// ✅ UPDATE EVENT
export async function updateEvent(
  icon_name: string,
  event_name: string,
  description: string,
  sensitivity: string,
  priority: string,
  status: boolean,
  event_id: number
) {
  try {
    // 🟦 1. UPDATE events
    await pool.query(
      `
      UPDATE events
      SET
        evt_icon = $1,
        evt_name = $2,
        evt_description = $3,
        evt_updated_at = CURRENT_TIMESTAMP
      WHERE evt_id = $4;
      `,
      [icon_name, event_name, description, event_id]
    );

    // 🟩 2. UPDATE global_detection_settings
    await pool.query(
      `
      UPDATE global_detection_settings
      SET
        gds_sensitivity = $1,
        gds_priority    = $2,
        gds_status      = $3,
        gds_updated_at  = CURRENT_TIMESTAMP
      WHERE gds_evt_id = $4;
      `,
      [sensitivity, priority, status, event_id]
    );

    // 🟨 3. ดึงข้อมูลจาก View
    const { rows: viewRows } = await pool.query(
      `
      SELECT * FROM v_events_overview
      WHERE event_id = $1;
      `,
      [event_id]
    );

    return viewRows[0];
  } catch (err: any) {
    if (err.code === "23505") {
      throw new Error("Event name already exists");
    }
    console.error("❌ updateEvent error:", err);
    throw err;
  }
}

// ✅
export async function removeEvent(event_id: number) {
  const { rows } = await pool.query(
    `
    UPDATE events
    SET evt_is_use = false
    WHERE evt_id = $1
    RETURNING *;
    `,
    [event_id]
  );

  return Mapping.mapEventsToSaveResponse(rows[0]);
}

// ✅
export async function getGlobalEvents() {
  const { rows } = await pool.query(`
        SELECT * FROM v_events_overview
        WHERE is_use = true;
    `);

  return rows;
}

// ✅
export async function getGlobalEventById(event_id: number) {
  const { rows } = await pool.query(
    `
    SELECT * FROM v_events_overview
    WHERE event_id = $1;
    AND is_use = true;
  `,
    [event_id]
  );

  return rows;
}

// ✅
export async function updateGlobalEvent(
  sensitivity: string,
  priority: string,
  status: boolean,
  event_id: number
) {
  const { rows } = await pool.query(
    `
    UPDATE global_detection_settings
    SET
        gds_sensitivity = $1,
        gds_priority = $2,
        gds_status = $3,
        gds_updated_at = CURRENT_TIMESTAMP
    WHERE gds_evt_id = $4
    RETURNING *;
  `,
    [sensitivity, priority, status, event_id]
  );

  return Mapping.mapGlobalEventsToSaveResponse(rows[0]);
}

/**
 * ดึงรายการ Events ทั้งหมดที่ยังใช้งานอยู่
 *
 * @returns {Promise<Event[]>} รายการ Events ที่ถูกใช้งานอยู่ทั้งหมด
 * @description ดึงข้อมูล Events จากฐานข้อมูลโดยเรียงตาม evt_id จากมากไปน้อย และแสดงเฉพาะ Events ที่ยังใช้งานอยู่

 * 
 * @author Jirayu
 */
// export async function getAllEvents(): Promise<Model.Events[]> {
//   const query = `
//         SELECT evt_id, evt_icon, evt_name, evt_description, evt_status, evt_is_use
//         FROM events
//         WHERE evt_is_use = true
//         ORDER BY evt_id DESC
//     `;

//   const result = await pool.query<Event>(query);
//   return result.rows.map(Mapping.mapToEvent);
// }

// export async function getEventById(evt_id: number): Promise<Model.Events> {
//     const { rows } = await pool.query(`
//         SELECT * FROM events
//         WHERE evt_id = $1
//         AND evt_is_use = true
//     `, [evt_id])

//     return Mapping.mapToEvent(rows[0]);
// }

/**
 * เพิ่มข้อมูลของ Event
 *
 * ฟังก์ชันนี้จะเพิ่มไอคอน, ชื่อ, และคำอธิบายของ Event ในฐานข้อมูล
 * หากเพิ่มไม่สำเร็จ จะโยน Error
 *
 * @param {string} evt_icon - ไอคอนใหม่ของ Event
 * @param {string} evt_name - ชื่อใหม่ของ Event
 * @param {string} evt_des - คำอธิบายใหม่ของ Event
 * @returns {Promise<object>} Event object หลังเพิ่มสำเร็จ
 * @throws {Error} เมื่อเพิ่ม Event ไม่สำเร็จ
 *
 *
 * @author Fasai
 */
// export async function createEvent(
//   evt_icon: string,
//   evt_name: string,
//   evt_des: string,
//   evt_status: boolean
// ): Promise<Model.Events> {
//   if (!evt_icon.trim() || !evt_name.trim() || !evt_des.trim()) {
//     throw new Error("Event fields cannot be empty");
//   }

//   // const eventExists = await pool.query(`
//   //     SELECT evt_id FROM events
//   //     WHERE evt_name = $1
//   //     AND evt_is_use = true`,
//   //     [evt_name]
//   // )

//   // if (eventExists.rows.length > 0) {
//   //     throw new Error('Event already exists');
//   // }

//   const { rows } = await pool.query(
//     `
//         INSERT INTO events(evt_icon, evt_name, evt_description, evt_status)
//         VALUES($1, $2, $3, $4)
//         RETURNING *
//     `,
//     [evt_icon, evt_name, evt_des, evt_status]
//   );

//   const events = rows[0];

//   if (!events) {
//     throw new Error("Failed to insert events");
//   }

//   return Mapping.mapToEvent(rows[0]);
// }

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
// export async function updateEvent(evt_id: number, evt_icon: string, evt_name: string, evt_des: string): Promise<Model.Events> {

//     if (!evt_icon.trim() || !evt_name.trim() || !evt_des.trim()) {
//         throw new Error("Event fields cannot be empty");
//     }

//     // ดึงข้อมูลปัจจุบันทั้งหมด
//     const eventExists = await pool.query(`
//         SELECT evt_id, evt_icon, evt_name, evt_description
//         FROM events
//         WHERE evt_id = $1
//         AND evt_is_use = true
//     `, [evt_id]);

//     if (eventExists.rows.length === 0) {
//         throw new Error("Event not found or inactive");
//     }

//     // เอาข้อมูลที่ดึงมาเก็บใส่ตัวแปรแล้วเทียบกับที่รับเข้ามาว่าเหมือนเดิมมั้ย
//     const currentEvent = eventExists.rows[0];

//     if (
//         currentEvent.evt_icon === evt_icon &&
//         currentEvent.evt_name === evt_name &&
//         currentEvent.evt_description === evt_des
//     ) {
//         throw new Error("No changes detected");
//     }

//     const { rows } = await pool.query(`
//         UPDATE events
//         SET evt_icon = $1,
//             evt_name = $2,
//             evt_description = $3
//         WHERE evt_id = $4
//         RETURNING *;
//         `, [evt_icon, evt_name, evt_des, evt_id]);

//     const events = rows[0];

//     if (!events) {
//         throw new Error('Failed to update event or event not found');
//     }

//     return Mapping.mapToEvent(events);

// }

/**
 * ลบข้อมูลของ Event ที่ระบุด้วย evt_id
 *
 * ฟังก์ชันนี้จะลบโดยอัปเดตสถานะของ Event ในฐานข้อมูลแทนการลบจริง ๆ
 * หากพบ Event ตาม evt_id จะคืนค่าเป็น object ของ Event หลังการลบ
 * หากไม่พบ Event หรือลบไม่สำเร็จ จะโยน Error
 *
 * @param {number} evt_id - รหัสของ Event ที่ต้องการลบ
 * @param {boolean} evt_is_use - สถานะใหม่ของ Event
 * @returns {Promise<object>} Event object หลังลบ
 * @throws {Error} เมื่อไม่พบ Event หรือลบไม่สำเร็จ
 *
 * @author Fasai
 */
// export async function deleteEvent(
//   evt_id: number,
//   evt_is_use: boolean
// ): Promise<Model.EventSafeDelete> {
//   const eventExists = await pool.query(
//     `
//       SELECT evt_id FROM events
//       WHERE evt_id = $1
//       AND evt_is_use = true
//     `,
//     [evt_id]
//   );

//   if (eventExists.rows.length === 0) {
//     throw new Error("Event not found");
//   }

//   const { rows } = await pool.query(
//     `
//         UPDATE events
//         set evt_is_use = $1
//         WHERE evt_id = $2
//         RETURNING *;
//         `,
//     [evt_is_use, evt_id]
//   );

//   const events = rows[0];

//   if (!events) {
//     throw new Error("Failed to delete event or event not found");
//   }

//   return events;
// }
