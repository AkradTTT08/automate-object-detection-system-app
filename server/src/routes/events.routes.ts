/**
 * Events Router
 *
 * กำหนดเส้นทาง (routes) สำหรับจัดการ Events:
 *  - GET  /api/events   → ดึงรายการ events ทั้งหมด
 *  - POST /api/events   → เพิ่ม Event ใหม่
 *  - PUT /api/events/update → แก้ไข Event ที่ทำการเลือก
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

router.get('/', ctrl.list);     
router.post('/', ctrl.create);
router.put('/:evt_id', ctrl.update); // ปรับให้ update โดยส่ง params id ไป

export default router;