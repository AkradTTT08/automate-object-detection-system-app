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
 * @lastModified 2025-10-12
 */

import { Router } from 'express';
import * as ctrl from '../controllers/cameras.controller';

const router = Router();

/* ========================== Cameras ========================== */
router.get('/', ctrl.getCameras); // ✅
router.get('/:cam_id', ctrl.getCameraById); // ✅
router.post('/', ctrl.createCamera); // ✅
router.put('/:cam_id', ctrl.updateCamera); // ✅
router.patch('/:cam_id', ctrl.softDeleteCamera); // ✅

router.get('/summary', ctrl.getSummaryCameras); // ✅

/* ========================== Event Detection ========================== */
router.get('/:cam_id/event-detections', ctrl.getEventDetectionById);
router.put('/event-detections/:cds_id', ctrl.updateEventDetection);

/* ======================= Utilities & Lookups ======================= */
// Disabled     // router.get('/cards', ctrl.cardsSummary);
// router.get('/status', ctrl.status);
// Disabled     // router.get('/total', ctrl.count);
// Disabled     // router.get('/total-inactive', ctrl.countInactive);
// Disabled     // router.get('/search/:term', ctrl.search);
router.get('/location', ctrl.location);

/* ===================== Subresources: Access Control ===================== */
router.get('/access-controls', ctrl.indexAccessControls);
router.get('/:cam_id/access-control', ctrl.showAccessControl);
// Bug          // router.patch('/:cam_id/access-control', ctrl.updateAccessControl);

/* ===================== Subresources: Maintenances ===================== */
router.get('/maintenances', ctrl.indexMaintenances);
router.get('/:cam_id/maintenances', ctrl.indexCameraMaintenances);
// Bug          // router.post('/:cam_id/maintenances', ctrl.storeCameraMaintenance);
// Bug          // router.put('/:cam_id/maintenances/:mtn_id', ctrl.updateCameraMaintenance);
// Bug          // router.patch('/:cam_id/maintenances/:mtn_id/soft-delete', ctrl.softDeleteCameraMaintenance);
// router.get('/:cam_id/maintenances/:mtn_id', ctrl.showCameraMaintenance);                 // NEW
// router.patch('/:cam_id/maintenances/:mtn_id/restore', ctrl.restoreCameraMaintenance);    // optional

/* =================== Subresources: Event Detections =================== */
router.get('/event-detections', ctrl.indexEventDetections);
router.post('/event-detections', ctrl.storeEventDetection);
router.patch('/event-detections/:cds_id/soft-delete', ctrl.softDeleteEventDetection);
// router.get('/event-detections/:cds_id', ctrl.showEventDetection);                       // NEW
// router.get('/:cam_id/event-detections', ctrl.indexCameraEventDetections);               // NEW
// router.patch('/event-detections/:cds_id/restore', ctrl.restoreEventDetection);          // optional

/* ============================== Item ============================== */
// router.get('/:cam_id', ctrl.show);

// router.patch('/:cam_id/activate', ctrl.activate);
// router.delete('/:cam_id', ctrl.destroy);
// router.patch('/:cam_id/restore', ctrl.restore); // optional

export default router;