import e, { Request, Response, NextFunction } from 'express';
import * as CameraService from '../services/cameras/cameras.service';
import * as MaintenanceService from '../services/cameras/maintenances.service';
import * as EventDetectionService from '../services/cameras/eventDetections.service';
import * as AccessControlService from '../services/cameras/accessControl.service';
import * as LocationService from '../services/cameras/location.service';
import { ffmpegService } from '../services/cameras/ffmpeg.service';

/* ------------------------------ Cameras ------------------------------ */

/**✅
 * Controller: ดึงรายการ Cameras ทั้งหมดที่ถูกใช้งาน
 *
 * @route GET /api/cameras
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object (ส่งกลับรายการ cameras เป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของรายการ cameras
 *
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function getCameras(req: Request, res: Response, next: NextFunction) {
    try {
        const list = await CameraService.getCameras();
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err);
    }
};

/**✅
 * ดึงข้อมูลรายละเอียดของกล้องตามรหัสที่ระบุ
 * ใช้สำหรับแสดงข้อมูลกล้องเฉพาะตัว เช่น ชื่อ ประเภท สถานะ ตำแหน่ง และแหล่งที่มา
 * 
 * @route GET /api/cameras/:cam_id
 * @param {Request} req - Request ที่มีพารามิเตอร์ cam_id (รหัสกล้อง)
 * @param {Response} res - Response สำหรับส่งข้อมูลกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลกล้องและข้อความสถานะ
 * @throws {Error} ถ้าไม่พบกล้องตามรหัสที่ระบุ หรือเกิดข้อผิดพลาดระหว่างการดึงข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function getCameraById(req: Request, res: Response, next: NextFunction) {
    try {
        const camera_id = Number(req.params.cam_id);

        const camera = await CameraService.getCameraById(camera_id);
        return res.status(200).json({ message: 'Fetched successfully', data: camera });
    } catch (err) {
        next(err);
    }
};

/**✅
 * ดึงข้อมูลสรุปภาพรวมของกล้องทั้งหมดในระบบ
 * ใช้สำหรับแสดงข้อมูลเชิงสถิติ เช่น จำนวนกล้องที่เปิดใช้งาน ปิดใช้งาน หรือจำนวนทั้งหมด
 * 
 * @route GET /api/cameras/summary
 * @param {Request} req - Request ที่รับข้อมูลการเรียกใช้งาน
 * @param {Response} res - Response สำหรับส่งข้อมูลสรุปกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลสรุปกล้องและข้อความสถานะ
 * @throws {Error} ถ้าเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูลหรือ service layer
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function getSummaryCameras(req: Request, res: Response, next: NextFunction) {
    try {
        const summary = await CameraService.summaryCameras();
        return res.status(200).json({ message: 'Fetched successfully', data: summary });
    } catch (err) {
        next(err);
    }
};

/**
 * Controller: ดึงข้อมูล Location ของกล้องตาม cam_id
 * @route GET /api/cameras/:cam_id/location
 * @param {Request} req - Express request object (ต้องมี params.cam_id)
 * @param {Response} res - Express response object (ส่งกลับข้อมูล location เป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของ location ของกล้องที่เลือก
 *
 * @author Wanasart
 */
export async function location(req: Request, res: Response, next: NextFunction) {
    try {
        const location = await LocationService.index();
        res.json(location);
    } catch (err) {
        next(err);
    }
}

/**✅
 * Controller: เพิ่มกล้องใหม่
 * @route POST /api/cameras
 * @param req -กรอกข้อมูลของกล้องทั้งหมดตามฟิลด์
 * @param res ส่งข้อมูลของกล้องกลับ
 * @param next ส่งต่อ error
 * @returns -JSON response ส่งข้อมูลของกล้องที่สร้างกลับพร้อมแสดงสถานะ 201
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function createCamera(req: Request, res: Response, next: NextFunction) { 
    try {
        const { 
            camera_name, 
            camera_type, 
            camera_status, 
            source_type, 
            source_value, 
            location_id, 
            description, 
            creator_id 
        } = req.body

        const create = await CameraService.insertCamera(
            camera_name, 
            camera_type, 
            camera_status, 
            source_type, 
            source_value, 
            location_id, 
            description, 
            creator_id
        );
        return res.status(201).json({ message: 'Created successfully', data: create });
    } catch (err) {
        next(err);
    }
}

/**✅
 * Controller: แก้ไขข้อมูลกล้อง
 * @route PUT /api/cameras/:id
 * @param req -กรอกข้อมูลของกล้องทั้งหมดตามฟิลด์
 * @param res ส่งข้อมูลของกล้องกลับ
 * @returns -JSON response ส่งข้อมูลของกล้องที่แก้ไขกลับพร้อมแสดงสถานะ 200
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function updateCamera(req: Request, res: Response, next: NextFunction) { //update camera
    try {
        const camera_id = Number(req.params.cam_id);
        const { 
            camera_name, 
            camera_type, 
            camera_status, 
            source_type, 
            source_value, 
            location_id, 
            description,
        } = req.body

        const update = await CameraService.updateCamera(
            camera_id,
            camera_name, 
            camera_type, 
            camera_status, 
            source_type, 
            source_value, 
            location_id, 
            description
        );
        return res.status(200).json({ message: 'Updated successfully', data: update });
    } catch (err) {
        next(err);
    }
    
}

/**✅
 * Controller: ลบข้อมูลกล้องแบบ softdelete
 * @route POST /api/cameras/create
 * @param req -กรอกข้อมูลของกล้องทั้งหมดตามฟิลด์
 * @param res ส่งข้อมูลของกล้องกลับ
 * @returns -JSON response แสดงสถานะ 202
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function softDeleteCamera(req: Request, res: Response, next: NextFunction) { //soft delete
    try {
        const camera_id = Number(req.params.cam_id);
        const softDelete = await CameraService.removeCamera(camera_id);

        return res.status(200).json({ message: 'Deleted successfully', data: softDelete });
    } catch (err) {
        next(err);
    }
}

/* ------------------------------ Maintenances History ------------------------------ */
/**
 * Controller: ดึงรายการประวัติการซ่อมบำรุงกล้องทั้งหมด
 *
 * @route GET /api/cameras/maintenance
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object (ส่งกลับรายการประวัติการซ่อมบำรุงเป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของรายการประวัติการซ่อมบำรุง
 *
 * @author Jirayu
 * 
 */
export async function indexMaintenances(req: Request, res: Response, next: NextFunction) {
    try {
        const history = await MaintenanceService.listAllMaintenances();
        return res.json(history);
    } catch (err) {
        next(err);
    }
}

/**
 * Controller: ดึงรายการประวัติการซ่อมบำรุงตามรหัสกล้อง
 *
 * @route GET /api/cameras/:cam_id/maintenance
 * @param {Request} req - Express request object (ต้องมี params.cam_id)
 * @param {Response} res - Express response object (ส่งกลับรายการประวัติการซ่อมบำรุงเป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของรายการประวัติการซ่อมบำรุง
 *
 * @author Jirayu
 */
export async function indexCameraMaintenances(req: Request, res: Response, next: NextFunction) {
    try {
        const cam_id = Number(req.params.cam_id);
        if (isNaN(cam_id)) {
            return res.status(400).json({ error: "Invalid camera ID" });
        }
        const history = await MaintenanceService.listMaintenancesByCamera(cam_id);
        return res.json(history);
    } catch (err) {
        next(err);
    }
}

/**
 * Controller: ลบ Maintenance History
 *
 * @route POST /api/cameras/:cam_id/maintenance/delete
 * @param {Request} req - Express request object (body: { mnt_id, isUse })
 * @param {Response} res - Express response object (ส่งกลับ Maintenance History ที่ลบเป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของ Maintenance History  ที่ลบ
 *
 * @author Napat
 */
export async function softDeleteCameraMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
        const { mnt_id, isUse } = req.body;
        const softDeleteHistory = await MaintenanceService.softDeleteMaintenance(mnt_id, isUse);
        res.json(softDeleteHistory);
    } catch (err) {
        next(err);
    }
}

export async function storeCameraMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
        const { cam_id } = req.params;
        const { date, type, technician, note } = req.body;
        const createHistory = await MaintenanceService.createMaintenance(Number(cam_id), date, type, technician, note);
        res.status(201).json(createHistory);
    } catch (err) {
        next(err);
    }
}

/**
 * Controller: อัพเดท Maintenance History
 *
 * @route POST /api/cameras/:cam_id/maintenance/update
 * @param {Request} req - Express request object (body: { mnt_id, date, type, technician, note })
 * @param {Response} res - Express response object (ส่งกลับ Maintenance History ที่อัพเดทเป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของ Maintenance History  ที่อัพเดท
 *
 * @author Napat
 */
export async function updateCameraMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
        const { mnt_id, date, type, technician, note } = req.body;
        const createHistory = await MaintenanceService.updateMaintenance(mnt_id, date, type, technician, note);
        res.json(createHistory);
    } catch (err) {
        next(err);
    }
}

export async function deleteCameraMaintenance(req: Request, res: Response, next: NextFunction) { }

/* ------------------------------ Event Detection ------------------------------ */

export async function getEventDetectionById(req: Request, res: Response, next: NextFunction) {
    try {
        const camera_id = Number(req.params.cam_id);

        const eventDetection = await EventDetectionService.getEventDetectionById(camera_id);
        return res.status(200).json({ message: 'Fetched successfully', data: eventDetection });
    } catch (err) {
        next(err);
    }
}

export async function updateEventDetection(req: Request, res: Response, next: NextFunction) {
    try {
        const detection_id = Number(req.params.cds_id);
        const { 
            detection_sensitivity, 
            detection_priority, 
            detection_status
        } = req.body;

        const updateEventDetection = await EventDetectionService.updateEventDetection(
            detection_sensitivity, 
            detection_priority, 
            detection_status, 
            detection_id
        );
        return res.status(200).json({ message: 'Updated successfully', data: updateEventDetection });
    } catch (err) {
        next(err);
    }
}

/**
 * Controller: ดึงรายการ Event Detection ทั้งหมด
 *
 * @route GET /api/events/detections
 * @param req - Request ของ Express
 * @param res - Response ของ Express (ส่งกลับรายการ EventDetect เป็น JSON)
 * @param next - ส่งต่อ error
 * @returns {Promise<Response>} JSON response ของรายการ EventDetect
 *
 * @author Wongsakon
 */
export async function indexEventDetections(req: Request, res: Response, next: NextFunction) {
    try {
        const eventDetection = await EventDetectionService.listEventDetections();
        return res.json(eventDetection);
    } catch (err) {
        next(err);
    }
}

/**
 * สร้าง Event Detect 
 *
 * @route POST /api/events/createDetect
 * @param req - Request ของ Express (body: cds_event_id, cds_camera_id, cds_sensitivity, cds_priority, cds_status)
 * @param res - Response ของ Express
 * @param next - ส่งต่อ error
 * @returns {Promise<Response>} JSON response ของ EventDetect ที่สร้างขึ้นใหม่
 *
 * @author Audomsak
 */
export async function storeEventDetection(req: Request, res: Response, next: NextFunction) {
    try {
        const { cds_event_id, cds_camera_id, cds_sensitivity, cds_priority, cds_status } = req.body;
        const createEventDetection = await EventDetectionService.createEventDetection(cds_event_id, cds_camera_id);
        return res.json(createEventDetection);
    } catch (err) {
        next(err);
    }
}

/**
 * อัพเดท EventDetect ตามข้อมูลใน req.body
 * ส่ง EventDetect ที่อัพเดทแล้วกลับเป็น JSON
 *
 * @param req - Request ของ Express (body: cds_event_id, cds_camera_id, cds_sensitivity, cds_priority, cds_status)
 * @param res - Response ของ Express
 * @param next - ส่งต่อ error
 * @returns {Promise<Response>} JSON response ของ EventDetect ที่อัพเดทแล้ว
 *
 * @throws Error หากเกิดข้อผิดพลาดระหว่างการอัพเดท
 *
 * @author Wanasart
 */
// export async function updateEventDetection(req: Request, res: Response, next: NextFunction) {
//     try {
//         const id = Number(req.params.cds_id);
//         const { event_id, camera_id, sensitivity, priority, status } = req.body
//         console.log(event_id, camera_id, sensitivity, priority, status)
//         const updateEventDetection = await EventDetectionService.updateEventDetection(id, event_id, camera_id, sensitivity, priority, status);
//         return res.json(updateEventDetection);
//     } catch (err) {
//         next(err);
//     }
// }

/**
 * ลบ EventDetect ตามข้อมูลใน req.body
 * ส่ง EventDetect ที่ลบแล้วกลับเป็น JSON
 *
 * @param req - Request ของ Express (body: id, status)
 * @param res - Response ของ Express
 * @param next - ส่งต่อ error
 * @returns {Promise<Response>} JSON response ของ EventDetect ที่ลบแล้ว
 *
 * @throws Error หากเกิดข้อผิดพลาดระหว่างการลบ
 *
 * @author Audomsak
 */
export async function softDeleteEventDetection(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.cds_id);

        const { status } = req.body
        const deleteEventDetection = await EventDetectionService.softDeleteEventDetection(id, status);
        return res.json(deleteEventDetection);
    } catch (err) {
        next(err);
    }
}

/* ------------------------------ Access Control ------------------------------ */
/**
 * Controller: ดึงรายการ Event Detection 
 *
 * @route GET /api/cameras/access-control
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object (ส่งกลับข้อมูล access control ของกล้องทั้งหมดเป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของการควบคุมสิทธิ์กล้องทั้งหมด
 *
 * @author Jirayu
 */
export async function indexAccessControls(req: Request, res: Response, next: NextFunction) {
    try {
        const cameraAccess = await AccessControlService.listAccessControls();
        return res.json(cameraAccess);
    } catch (error) {
        next(error);
    }
}

/**
 * Controller: ดึงข้อมูลการควบคุมสิทธิ์การเข้าถึงของกล้องตาม cam_id
 *
 * @route GET /api/cameras/:cam_id/access-control
 * @param {Request} req - Express request object (ต้องมี params: cam_id)
 * @param {Response} res - Express response object (ส่งกลับข้อมูล access control ของกล้องที่เลือกเป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของการควบคุมสิทธิ์กล้อง (access control)
 *
 * @author Jirayu
 */
export async function showAccessControl(req: Request, res: Response, next: NextFunction) {
    try {
        const cam_id = Number(req.params.cam_id);
        console.log(cam_id)
        const cameraAccess = await AccessControlService.getAccessControlByCamera(cam_id);
        return res.json(cameraAccess);
    } catch (error) {
        next(error);
    }
}

export async function createAccessControl(req: Request, res: Response, next: NextFunction) { }

/**
 * อัพเดท Access Control ตามข้อมูลใน req.body
 * ส่ง Access Control ที่อัพเดทแล้วกลับเป็น JSON
 *
 * @param req - Request ของ Express (body: selectedAccess, status)
 * @param res - Response ของ Express
 * @param next - ส่งต่อ error
 * @returns {Promise<Response>} JSON response ของ Access Control ที่อัพเดทแล้ว
 *
 * @throws Error หากเกิดข้อผิดพลาดระหว่างการอัพเดท
 *
 * @author Napat
 */
export async function updateAccessControl(req: Request, res: Response, next: NextFunction) {
    try {
        const camId = Number(req.params.cam_id);

        const { selectedAccess, status } = req.body
        const update = await AccessControlService.updateAccessControl(camId, selectedAccess, status);
        return res.json(update);
    } catch (err) {
        next(err);
    }
}

export async function deleteAccessControl(req: Request, res: Response, next: NextFunction) { }

export function rtspToWhep(rtspUrl: string, webrtcBase = 'http://localhost:8889') {
    // rtsp://user:pass@host:8003/<path>
    const m = rtspUrl.match(/^rtsp:\/\/([^@]*@)?[^/]+\/(.+)$/i);
    const path = m?.[2] ?? ''; // เช่น 'city-traffic'
    if (!path) throw new Error('Invalid RTSP url, no path');

    // ถ้าต้อง auth (readUser/readPass) ให้แนบ Basic Auth
    // ในงานจริง แนะนำซ่อนไว้หลัง API/Token ของคุณ
    const authHeader = (rtspUrl.includes('viewer:viewpass@'))
        ? 'Basic ' + Buffer.from('viewer:viewpass').toString('base64')
        : undefined;

    return {
        whepUrl: `${webrtcBase.replace(/\/+$/, '')}/whep/${encodeURIComponent(path)}`,
        authHeader,
    };
}

// export async function streamCamera(req: Request, res: Response) {
//     try {
//         const camId = Number(req.params.cam_id);
//         if (!camId) return res.status(400).send("cam_id required");

//         const cam = await CameraService.getCameraById(camId);
//         if (!cam) return res.status(404).send("Camera not found");

//         const rtspUrl = String(cam.address);
//         rtspToWhep(rtspUrl);

//         // const finalUrl = normalizeForHost(rtspUrl);
//         const finalUrl = rtspUrl;

//         const forceEncode = req.query.encode === "1"; // ?encode=1 จะบังคับ x264
//         ffmpegService.startStream(res, finalUrl, { forceEncode });
//     } catch (err: any) {
//         const status = err?.status ?? 500;
//         const msg = err?.message ?? "Failed to stream camera";
//         console.error("stream error:", err);
//         if (!res.headersSent) res.status(status).json({ error: msg });
//     }
// }