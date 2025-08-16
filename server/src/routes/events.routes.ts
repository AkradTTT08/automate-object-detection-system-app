/**
 * Events Router
 *
 * กำหนดเส้นทาง (routes) สำหรับจัดการ Events:
 *  - POST /api/events   → เพิ่ม Event ใหม่
 *  - PUT /api/events/update → แก้ไข Event ที่ทำการเลือก
 *  - PATCH /api/events/delete → ลบ Event ที่ทำการเลือกโดยการเปลี่ยนสถานะแทนการลบจริง
 * 
 * @module routes/events
 * @requires express
 * @requires controllers/event.controller
 *
 * @author Fasai
 * @created 2025-08-16
 * @lastModified 2025-08-16
 */

import { Router } from "express";
import * as ctrl from '../controllers/events.controller';

const router = Router();

router.post('/', ctrl.create);
router.put('/update', ctrl.update);
router.patch('/delete', ctrl.softDelete);

export default router;