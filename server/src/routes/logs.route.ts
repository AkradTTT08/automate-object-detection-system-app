/**
 * Logs Router (RESTful)
 *
 * Base: /api/logs
 *
 * ## Logs
 *  - GET    /camera    → ดึงรายการบันทึกกล้อง (Camera Logs)
 *  - GET    /alert     → ดึงรายการบันทึกแจ้งเตือน (Alert Logs)
 *  - GET    /user      → ดึงประวัติการทำงานของผู้ใช้ (User Activity Logs)
 *
 * ใช้สำหรับหน้า Logs Management / Audit Trail / Monitoring
 *
 * @module routes/logs
 * @requires express
 * @requires controllers/logs.controller
 *
 * @author Wanasart
 * @created 2025-10-31
 * @lastModified 2025-11-26
 */
import { Router } from 'express';
import * as ctrl from '../controllers/logs.controller';

const router = Router();

/* ========================== Logs ========================== */
router.get('/camera', ctrl.getCameraLogs);
router.get('/alert', ctrl.getAlertLogs);
router.get('/user', ctrl.getUserLogs);

export default router;