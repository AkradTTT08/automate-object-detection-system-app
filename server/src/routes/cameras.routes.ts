/**
 * Cameras Router (RESTful)
 *
 * Base: /api/cameras
 *
 * ## Cameras
 *  - GET       /                   → ดึงรายการกล้องทั้งหมด
 *  - GET       /:cam_id            → ดึงรายการกล้องตาม cam_id
 *  - POST      /                   → เพิ่มกล้องใหม่
 *  - PUT       /:cam_id            → อัปเดตข้อมูลกล้อง
 *  - PATCH     /:cam_id            → ลบกล้อง
 * 
 *  - GET       /summary            → ดึงรายการผลสรุปของกล้อง
 * 
 * ## Performance
 * 
 * 
 * ## Event Detection
 *  - GET       /:cam_id/event-detection            → ดึงรายการ event detection ของกล้องตาม cam_id
 * 
 * ## Access Control
 * 
 * 
 * ## Maintenance
 * 
 *
 * @module routes/cameras
 * @requires express
 * @requires controllers/cameras.controller
 *
 * @author Wanasart
 * @created 2025-08-16
 * @lastModified 2025-10-17
 */

import { Router } from 'express';
import * as ctrl from '../controllers/cameras.controller';

const router = Router();

/* ========================== Cameras ========================== */
router.get('/', ctrl.getCameras); // ✅
router.post('/', ctrl.createCamera); // ✅

router.get('/summary', ctrl.getSummaryCameras); // ✅

/* ========================== Performance ========================== */
router.get('/performance', ctrl.getPerformance); // ✅
router.get('/:cam_id/performance', ctrl.getPerformanceById); // ✅

/* ========================== Event Detection ========================== */
router.put('/event-detections/:cds_id', ctrl.updateEventDetection); // ✅
router.get('/:cam_id/event-detections', ctrl.getEventDetectionById); // ✅

/* ========================== Maintenance ========================== */
router.get('/:cam_id/maintenance', ctrl.getMaintenanceByCameraId); // ✅
router.post('/:cam_id/maintenance', ctrl.createMaintenance); // ✅
router.put('/maintenance/:mnt_id', ctrl.updateMaintenance); // ✅
router.patch('/maintenance/:mnt_id', ctrl.softDeleteMaintenance); // ✅

/* ========================== Access Control ========================== */
router.get('/:cam_id/permission', ctrl.getPermissionByCameraId); // ✅
router.put('/:cam_id/permission', ctrl.updatePermission); // ✅

/* ========================== Cameras (by id) ========================== */
router.get('/:cam_id', ctrl.getCameraById); // ✅
router.put('/:cam_id', ctrl.updateCamera); // ✅
router.patch('/:cam_id', ctrl.softDeleteCamera); // ✅

export default router;