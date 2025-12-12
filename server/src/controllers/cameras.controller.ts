import e, { Request, Response, NextFunction } from 'express';
import * as CameraService from '../services/cameras/cameras.service';
import * as MaintenanceService from '../services/cameras/maintenances.service';
import * as EventDetectionService from '../services/cameras/eventDetections.service';
import * as AccessControlService from '../services/cameras/accessControl.service';
import * as LocationService from '../services/cameras/location.service';
import * as PerformanceService from '../services/cameras/performance.service';
import { ffmpegService } from '../services/cameras/ffmpeg.service';
import { hlsService } from '../services/cameras/hls.service';
import * as fs from 'fs';
import * as path from 'path';

/* ------------------------------ Cameras ------------------------------ */

/**
 * ดึงข้อมูลกล้องทั้งหมดในระบบ
 * ใช้สำหรับแสดงรายการกล้องทุกตัวในระบบ รวมถึงรายละเอียดพื้นฐาน เช่น ชื่อ ประเภท สถานะ แหล่งข้อมูล และตำแหน่งที่ตั้ง
 * 
 * @param {Request} req - Request ที่ใช้เรียก API เพื่อดึงข้อมูลกล้องทั้งหมด
 * @param {Response} res - Response สำหรับส่งข้อมูลรายการกล้องกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีรายการข้อมูลกล้องทั้งหมด
 * @throws {Error} ถ้าเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูลหรือ service layer
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

/**
 * ดึงข้อมูลรายละเอียดของกล้องตามรหัสที่ระบุ
 * ใช้สำหรับแสดงข้อมูลกล้องเฉพาะตัว เช่น ชื่อ ประเภท สถานะ ตำแหน่ง และแหล่งที่มา
 * 
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

/**
 * ดึงข้อมูลสรุปภาพรวมของกล้องทั้งหมดในระบบ
 * ใช้สำหรับแสดงข้อมูลเชิงสถิติ เช่น จำนวนกล้องที่เปิดใช้งาน ปิดใช้งาน หรือจำนวนทั้งหมด
 * 
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
 * เพิ่มข้อมูลกล้องใหม่เข้าสู่ระบบ
 * ใช้สำหรับสร้างรายการกล้องใหม่พร้อมรายละเอียด เช่น ประเภท สถานะ แหล่งข้อมูล และตำแหน่งที่ตั้ง
 * 
 * @param {Request} req - Request ที่มีข้อมูลใน body (camera_name, camera_type, camera_status, source_type, source_value, location_id, description, creator_id)
 * @param {Response} res - Response สำหรับส่งข้อมูลกล้องที่ถูกสร้างใหม่กลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลของกล้องที่ถูกสร้างใหม่
 * @throws {Error} ถ้าเกิดข้อผิดพลาดระหว่างการเพิ่มข้อมูลลงฐานข้อมูล หรือข้อมูลไม่ถูกต้องตามรูปแบบที่กำหนด
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

/**
 * อัปเดตข้อมูลกล้องตามรหัสที่ระบุ
 * ใช้สำหรับแก้ไขรายละเอียดของกล้อง เช่น ชื่อ ประเภท สถานะ แหล่งข้อมูล ตำแหน่งที่ตั้ง และคำอธิบาย
 * 
 * @param {Request} req - Request ที่มีพารามิเตอร์ cam_id และข้อมูลใน body (camera_name, camera_type, camera_status, source_type, source_value, location_id, description)
 * @param {Response} res - Response สำหรับส่งข้อมูลกล้องที่อัปเดตแล้วกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับจัดการ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลของกล้องที่ถูกอัปเดต
 * @throws {Error} ถ้าไม่พบกล้องที่ต้องการอัปเดต หรือเกิดข้อผิดพลาดระหว่างการอัปเดตฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-25
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
            user_id,
        } = req.body

        const update = await CameraService.updateCamera(
            camera_id,
            camera_name,
            camera_type,
            camera_status,
            source_type,
            source_value,
            location_id,
            description,
            user_id
        );
        return res.status(200).json({ message: 'Updated successfully', data: update });
    } catch (err) {
        next(err);
    }

}

/**
 * ลบข้อมูลกล้องแบบ Soft Delete ตามรหัสที่ระบุ
 * โดยจะเปลี่ยนสถานะ cam_is_use เป็น false และอัปเดตเวลาแก้ไขล่าสุด โดยไม่ลบข้อมูลจริงออกจากฐานข้อมูล
 * 
 * @param {Request} req - Request ที่มีพารามิเตอร์ cam_id (รหัสของกล้อง)
 * @param {Response} res - Response สำหรับส่งผลการลบกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลของกล้องที่ถูกลบ (soft delete)
 * @throws {Error} ถ้าไม่พบกล้องที่ต้องการลบ หรือเกิดข้อผิดพลาดระหว่างการอัปเดตฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-25
 */
export async function softDeleteCamera(req: Request, res: Response, next: NextFunction) { //soft delete
    try {
        const camera_id = Number(req.params.cam_id);
        const user_id = Number(req.body.user_id);

        const softDelete = await CameraService.removeCamera(camera_id, user_id);

        return res.status(200).json({ message: 'Deleted successfully', data: softDelete });
    } catch (err) {
        next(err);
    }
}

/* ------------------------------ Maintenances History ------------------------------ */

/**
 * ดึงข้อมูลประวัติการบำรุงรักษาของกล้องตามรหัสที่ระบุ
 * ใช้สำหรับแสดงรายการบำรุงรักษาทั้งหมดของกล้องแต่ละตัว
 * 
 * @param {Request} req - Request ที่มีพารามิเตอร์ cam_id (รหัสกล้อง)
 * @param {Response} res - Response สำหรับส่งข้อมูลกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีรายการบำรุงรักษาของกล้อง
 * @throws {Error} ถ้าไม่พบข้อมูลการบำรุงรักษาหรือเกิดข้อผิดพลาดระหว่างการดึงข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-17
 */
export async function getMaintenanceByCameraId(req: Request, res: Response, next: NextFunction) {
    try {
        const camera_id = Number(req.params.cam_id);

        const list = await MaintenanceService.getMaintenanceByCameraId(camera_id);
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err);
    }
}

/**
 * เพิ่มข้อมูลประวัติการบำรุงรักษาใหม่ให้กับกล้องที่ระบุ
 * ใช้สำหรับบันทึกการซ่อม การตรวจเช็ก หรือการบำรุงรักษาในแต่ละครั้ง
 * 
 * @param {Request} req - Request ที่มีข้อมูลใน body (technician, type, date, note)
 * @param {Response} res - Response สำหรับส่งผลการสร้างกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลของรายการบำรุงรักษาที่ถูกสร้างใหม่
 * @throws {Error} ถ้าเกิดข้อผิดพลาดระหว่างการเพิ่มข้อมูลลงฐานข้อมูลหรือข้อมูลไม่ถูกต้องตามรูปแบบที่กำหนด
 * 
 * @author Wanasart
 * @lastModified 2025-10-17
 */
export async function createMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
        const camera_id = Number(req.params.cam_id);
        const {
            technician,
            type,
            date,
            note
        } = req.body;

        const create = await MaintenanceService.insertMaintenance(camera_id, technician, type, date, note);
        return res.status(201).json({ message: 'Created successfully', data: create });
    } catch (err) {
        next(err);
    }
}

/**
 * อัปเดตรายการบำรุงรักษาตามรหัสที่ระบุ
 * ใช้สำหรับแก้ไขข้อมูล เช่น วันที่ ประเภท ช่างเทคนิค หรือหมายเหตุของการบำรุงรักษา
 * 
 * @param {Request} req - Request ที่มีพารามิเตอร์ mnt_id และข้อมูลใน body (technician, type, date, note)
 * @param {Response} res - Response สำหรับส่งข้อมูลที่อัปเดตกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลของรายการบำรุงรักษาหลังการอัปเดต
 * @throws {Error} ถ้าไม่พบรายการบำรุงรักษาหรือเกิดข้อผิดพลาดระหว่างการอัปเดตฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-17
 */
export async function updateMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
        const maintenance_id = Number(req.params.mnt_id);
        const {
            technician,
            type,
            date,
            note
        } = req.body;

        const update = await MaintenanceService.updateMaintenance(maintenance_id, technician, type, date, note);
        return res.status(201).json({ message: 'Updated successfully', data: update });
    } catch (err) {
        next(err);
    }
}

/**
 * ลบข้อมูลการบำรุงรักษาแบบ Soft Delete ตามรหัสที่ระบุ
 * โดยจะตั้งค่า mnt_is_use เป็น false และอัปเดตเวลาแก้ไขล่าสุด โดยไม่ลบข้อมูลจริงออกจากฐานข้อมูล
 * 
 * @param {Request} req - Request ที่มีพารามิเตอร์ mnt_id (รหัสรายการบำรุงรักษา)
 * @param {Response} res - Response สำหรับส่งผลการลบกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลของรายการบำรุงรักษาที่ถูกลบ (soft delete)
 * @throws {Error} ถ้าไม่พบรายการบำรุงรักษาหรือเกิดข้อผิดพลาดระหว่างการอัปเดตฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-17
 */
export async function softDeleteMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
        const maintenance_id = Number(req.params.mnt_id);

        const softDelete = await MaintenanceService.removeMaintenance(maintenance_id);
        return res.status(200).json({ message: 'Deleted successfully', data: softDelete });
    } catch (err) {
        next(err);
    }
}

/* ------------------------------ Event Detection ------------------------------ */

/**
 * ดึงข้อมูลการตั้งค่าการตรวจจับเหตุการณ์ (Event Detection) ของกล้องตามรหัสที่ระบุ
 * ใช้สำหรับแสดงรายละเอียดเหตุการณ์ที่กล้องสามารถตรวจจับได้ รวมถึงระดับความไว (sensitivity) ลำดับความสำคัญ (priority) และสถานะการทำงาน
 * 
 * @param {Request} req - Request ที่มีพารามิเตอร์ cam_id (รหัสกล้อง)
 * @param {Response} res - Response สำหรับส่งข้อมูลการตั้งค่าการตรวจจับเหตุการณ์กลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีรายการการตั้งค่าการตรวจจับเหตุการณ์ของกล้องที่ระบุ
 * @throws {Error} ถ้าไม่พบข้อมูลการตั้งค่าการตรวจจับเหตุการณ์ หรือเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function getEventDetectionById(req: Request, res: Response, next: NextFunction) {
    try {
        const camera_id = Number(req.params.cam_id);

        const eventDetection = await EventDetectionService.getEventDetectionById(camera_id);
        return res.status(200).json({ message: 'Fetched successfully', data: eventDetection });
    } catch (err) {
        next(err);
    }
}

/**
 * อัปเดตการตั้งค่าการตรวจจับเหตุการณ์ (Event Detection) ตามรหัสที่ระบุ
 * ใช้สำหรับปรับค่าการตรวจจับ เช่น ความไว (sensitivity), ลำดับความสำคัญ (priority) และสถานะการทำงานของเหตุการณ์
 * 
 * @param {Request} req - Request ที่มีพารามิเตอร์ cds_id และข้อมูลใน body (detection_sensitivity, detection_priority, detection_status)
 * @param {Response} res - Response สำหรับส่งข้อมูลการตั้งค่าที่อัปเดตกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลของการตั้งค่าการตรวจจับเหตุการณ์ที่ถูกอัปเดต
 * @throws {Error} ถ้าไม่พบรายการที่ต้องการอัปเดต หรือเกิดข้อผิดพลาดระหว่างการอัปเดตฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
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

/* ------------------------------ Access Control ------------------------------ */

/**
 * ดึงข้อมูลสิทธิ์การเข้าถึงของกล้องตามรหัสที่ระบุ
 * ใช้สำหรับตรวจสอบการตั้งค่าการเข้าถึงของกล้อง เช่น การยืนยันตัวตน การจำกัดสิทธิ์ และการบันทึกการเข้าถึง
 * 
 * @param {Request} req - Request ที่มีพารามิเตอร์ cam_id (รหัสของกล้อง)
 * @param {Response} res - Response สำหรับส่งข้อมูลสิทธิ์การเข้าถึงกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลสิทธิ์การเข้าถึงของกล้องที่ระบุ
 * @throws {Error} ถ้าไม่พบข้อมูลสิทธิ์การเข้าถึงหรือเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-17
 */
export async function getPermissionByCameraId(req: Request, res: Response, next: NextFunction) {
    try {
        const camera_id = Number(req.params.cam_id);

        const list = await AccessControlService.getPermissionByCameraId(camera_id);
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err)
    }
}

/**
 * อัปเดตการตั้งค่าสิทธิ์การเข้าถึงของกล้องตามรหัสที่ระบุ
 * ใช้สำหรับแก้ไขการตั้งค่าการเข้าถึง เช่น การยืนยันตัวตน การจำกัดสิทธิ์การเข้าถึง และการบันทึกการเข้าถึงของผู้ใช้
 * 
 * @param {Request} req - Request ที่มีพารามิเตอร์ cam_id และข้อมูลใน body (require_auth, restrict, log)
 * @param {Response} res - Response สำหรับส่งข้อมูลสิทธิ์การเข้าถึงที่อัปเดตกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลสิทธิ์การเข้าถึงของกล้องที่ถูกอัปเดต
 * @throws {Error} ถ้าไม่พบกล้องที่ต้องการอัปเดต หรือเกิดข้อผิดพลาดระหว่างการอัปเดตฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-17
 */
export async function updatePermission(req: Request, res: Response, next: NextFunction) {
    try {
        const camera_id = Number(req.params.cam_id);
        const {
            require_auth,
            restrict,
            log
        } = req.body;

        const update = await AccessControlService.updatePermission(camera_id, require_auth, restrict, log);
        return res.status(200).json({ message: 'Updated successfully', data: update });
    } catch (err) {
        next(err)
    }
}

/* ------------------------------ Performance ------------------------------ */

/**
 * ดึงข้อมูลประสิทธิภาพการทำงานของกล้องทั้งหมดประจำวัน
 * ใช้สำหรับแสดงสถิติการทำงานของกล้องทุกตัว เช่น เวลาทำงาน การเชื่อมต่อ และสถานะการทำงานปัจจุบัน
 * 
 * @param {Request} req - Request ที่รับการเรียกใช้งาน API
 * @param {Response} res - Response สำหรับส่งข้อมูลประสิทธิภาพของกล้องทั้งหมดกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลประสิทธิภาพของกล้องทั้งหมด
 * @throws {Error} ถ้าเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูลหรือ service layer
 * 
 * @author Fasai
 * @lastModified 2025-10-16
 */
export async function getPerformance(req: Request, res: Response, next: NextFunction) {
    try {
        const list = await PerformanceService.getPerformance();
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err)
    }
}

/**
 * ดึงข้อมูลประสิทธิภาพการทำงานของกล้องตามรหัสที่ระบุ
 * ใช้สำหรับตรวจสอบข้อมูลการทำงานเฉพาะของกล้อง เช่น เวลาการทำงาน การตอบสนอง และสถานะล่าสุดของกล้อง
 * 
 * @param {Request} req - Request ที่มีพารามิเตอร์ cam_id (รหัสของกล้อง)
 * @param {Response} res - Response สำหรับส่งข้อมูลประสิทธิภาพของกล้องกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลประสิทธิภาพของกล้องที่ระบุ
 * @throws {Error} ถ้าไม่พบข้อมูลของกล้องหรือเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 * 
 * @author Fasai
 * @lastModified 2025-10-16
 */
export async function getPerformanceById(req: Request, res: Response, next: NextFunction) {
    try {
        const camera_id = Number(req.params.cam_id);

        const performance = await PerformanceService.getPerformanceById(camera_id);
        return res.status(200).json({ message: 'Fetched successfully', data: performance });
    } catch (err) {
        next(err)
    }
}

/* ------------------------------ Location  ------------------------------ */

/**
 * ดึงข้อมูลสถานที่ทั้งหมดที่เปิดใช้งานอยู่จากฐานข้อมูล
 * ใช้สำหรับแสดงรายชื่อสถานที่ในระบบ เช่น dropdown หรือหน้าจัดการกล้อง
 * 
 * @param {Request} req - อ็อบเจ็กต์คำขอจาก Express
 * @param {Response} res - อ็อบเจ็กต์ตอบกลับจาก Express
 * @param {NextFunction} next - ฟังก์ชันส่งต่อ error ให้ middleware ถัดไป
 * @returns {Promise<Response>} รายการข้อมูลสถานที่ที่เปิดใช้งานในระบบ
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function getLocation(req: Request, res: Response, next: NextFunction) {
    try {
        const list = await LocationService.getLocation();
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err)
    }
}

/**
 * เพิ่มข้อมูลสถานที่ใหม่เข้าสู่ระบบ
 * ใช้สำหรับสร้างสถานที่ใหม่ เช่น “อาคาร A”, “โซนจอดรถ 1”
 * 
 * @param {Request} req - อ็อบเจ็กต์คำขอจาก Express ที่มีข้อมูล location_name ใน body
 * @param {Response} res - อ็อบเจ็กต์ตอบกลับจาก Express
 * @param {NextFunction} next - ฟังก์ชันส่งต่อ error ให้ middleware ถัดไป
 * @returns {Promise<Response>} ข้อมูลสถานที่ที่ถูกสร้างใหม่พร้อมข้อความยืนยัน
 * @throws {Error} หากไม่สามารถสร้างข้อมูลได้หรือเกิดข้อผิดพลาดในฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function createLocation(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            location_name
        } = req.body;

        const create = await LocationService.insertLocation(location_name);
        return res.status(201).json({ message: 'Created successfully', data: create });
    } catch (err) {
        next(err)
    }
}

/**
 * อัปเดตข้อมูลสถานที่ตามรหัสที่ระบุ
 * ใช้สำหรับแก้ไขชื่อสถานที่ที่มีอยู่ เช่น เปลี่ยนจาก “Building A” เป็น “Main Building”
 * 
 * @param {Request} req - อ็อบเจ็กต์คำขอจาก Express ที่มี loc_id ใน params และ location_name ใน body
 * @param {Response} res - อ็อบเจ็กต์ตอบกลับจาก Express
 * @param {NextFunction} next - ฟังก์ชันส่งต่อ error ให้ middleware ถัดไป
 * @returns {Promise<Response>} ข้อมูลสถานที่ที่ถูกอัปเดตพร้อมข้อความยืนยัน
 * @throws {Error} หากไม่พบสถานที่ที่ต้องการอัปเดตหรือเกิดข้อผิดพลาดในฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
        const location_id = Number(req.params.loc_id);
        const {
            location_name
        } = req.body;

        const update = await LocationService.updateLocation(location_id, location_name);
        return res.status(200).json({ message: 'Updated successfully', data: update });
    } catch (err) {
        next(err)
    }
}

/**
 * ลบข้อมูลสถานที่ออกจากระบบแบบ Soft Delete
 * ใช้สำหรับซ่อนสถานที่ออกจากรายการ โดยไม่ลบข้อมูลจริงในฐานข้อมูล
 * 
 * @param {Request} req - อ็อบเจ็กต์คำขอจาก Express ที่มี loc_id ใน params
 * @param {Response} res - อ็อบเจ็กต์ตอบกลับจาก Express
 * @param {NextFunction} next - ฟังก์ชันส่งต่อ error ให้ middleware ถัดไป
 * @returns {Promise<Response>} ผลลัพธ์ของการลบข้อมูลแบบ Soft Delete พร้อมข้อความยืนยัน
 * @throws {Error} หากไม่พบข้อมูลที่ต้องการลบหรือเกิดข้อผิดพลาดในฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function softDeleteLocation(req: Request, res: Response, next: NextFunction) {
    try {
        const location_id = Number(req.params.loc_id);

        const softDelete = await LocationService.removeLocation(location_id);
        return res.status(200).json({ message: 'Deleted successfully', data: softDelete });
    } catch (err) {
        next(err)
    }
}

/* ------------------------------ Streamimg ------------------------------ */
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

export async function streamCamera(req: Request, res: Response) {
    try {
        const camId = Number(req.params.cam_id);
        if (!camId) {
            if (!res.headersSent) return res.status(400).json({ error: "cam_id required" });
            return;
        }

        const cams = await CameraService.getCameraById(camId);
        const cam = cams?.[0];
        if (!cam) {
            if (!res.headersSent) return res.status(404).json({ error: "Camera not found" });
            return;
        }

        const rtspUrl = String(cam.source_value);
        if (!rtspUrl || !rtspUrl.startsWith("rtsp://")) {
            if (!res.headersSent) return res.status(400).json({ error: "Invalid RTSP URL" });
            return;
        }

        console.log(`[stream] Starting stream for camera ${camId}: ${rtspUrl.substring(0, 30)}...`);
        // บังคับ encode เสมอเพื่อให้แน่ใจว่า stream ทำงานได้
        const forceEncode = true; // req.query.encode === "1" || true;
        ffmpegService.startStream(res, rtspUrl, { forceEncode });

    } catch (err: any) {
        const status = err?.status ?? 500;
        const msg = err?.message ?? "Failed to stream camera";
        console.error("[stream error]", err);
        if (!res.headersSent) {
            res.status(status).json({ error: msg });
        }
    }
}

/* ------------------------------ HLS Streaming ------------------------------ */

/**
 * Get HLS playlist (.m3u8) for camera
 */
export async function getHlsPlaylist(req: Request, res: Response, next: NextFunction) {
    try {
        const camId = Number(req.params.cam_id);
        if (!camId) {
            return res.status(400).json({ error: "cam_id required" });
        }

        const cams = await CameraService.getCameraById(camId);
        const cam = cams?.[0];
        if (!cam) {
            return res.status(404).json({ error: "Camera not found" });
        }

        const rtspUrl = String(cam.source_value);
        if (!rtspUrl || !rtspUrl.startsWith("rtsp://")) {
            return res.status(400).json({ error: "Invalid RTSP URL" });
        }

        // เริ่ม HLS stream ถ้ายังไม่ได้เริ่ม
        if (!hlsService.isStreaming(camId)) {
            console.log(`[HLS] Starting HLS stream for camera ${camId}`);
            try {
                hlsService.startHlsStream(camId, rtspUrl);
            } catch (err: any) {
                console.error(`[HLS] Failed to start stream for camera ${camId}:`, err);
                return res.status(500).json({ error: `Failed to start HLS stream: ${err?.message || 'Unknown error'}` });
            }

            // รอให้ m3u8 file ถูกสร้าง (ลองหลายครั้ง)
            const m3u8Path = hlsService.getM3u8Path(camId);
            let attempts = 0;
            const maxAttempts = 20; // 20 attempts = 10 seconds (เพิ่มเวลาให้ FFmpeg เริ่มต้น)

            while (attempts < maxAttempts && !fs.existsSync(m3u8Path)) {
                await new Promise(resolve => setTimeout(resolve, 500));
                attempts++;

                // ตรวจสอบว่า FFmpeg process ยังทำงานอยู่หรือไม่
                if (!hlsService.isStreaming(camId)) {
                    console.error(`[HLS] FFmpeg process died for camera ${camId} before m3u8 was created`);
                    // ลองเริ่ม stream ใหม่อีกครั้ง
                    try {
                        console.log(`[HLS] Retrying to start stream for camera ${camId}`);
                        hlsService.startHlsStream(camId, rtspUrl);
                        // รออีก 3 วินาที
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    } catch (retryErr: any) {
                        console.error(`[HLS] Retry failed for camera ${camId}:`, retryErr);
                        return res.status(500).json({ error: "HLS stream process failed to start. Please check RTSP URL and camera connection." });
                    }
                }
            }
        }

        const m3u8Path = hlsService.getM3u8Path(camId);

        // ตรวจสอบว่า stream ยังทำงานอยู่หรือไม่
        if (!hlsService.isStreaming(camId)) {
            console.warn(`[HLS] Stream not running for camera ${camId}, attempting to restart...`);
            try {
                const cams = await CameraService.getCameraById(camId);
                const cam = cams?.[0];
                if (cam) {
                    const rtspUrl = String(cam.source_value);
                    hlsService.startHlsStream(camId, rtspUrl);
                    // รอ 3 วินาที
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            } catch (restartErr: any) {
                console.error(`[HLS] Failed to restart stream for camera ${camId}:`, restartErr);
            }
        }

        if (!fs.existsSync(m3u8Path)) {
            console.warn(`[HLS] m3u8 file not found for camera ${camId} after waiting`);
            // ถ้า stream ยังทำงานอยู่ ให้ return 503 เพื่อให้ client retry
            if (hlsService.isStreaming(camId)) {
                return res.status(503).json({
                    error: "HLS stream is initializing. Please retry in a few seconds.",
                    retryAfter: 3
                });
            } else {
                return res.status(503).json({
                    error: "HLS stream not available. Please check camera connection.",
                    retryAfter: 5
                });
            }
        }

        // ตรวจสอบว่า file มีเนื้อหาหรือไม่
        let stats;
        try {
            stats = fs.statSync(m3u8Path);
        } catch (statErr: any) {
            console.error(`[HLS] Failed to stat m3u8 file for camera ${camId}:`, statErr);
            return res.status(503).json({ error: "HLS playlist file is not accessible. Please try again." });
        }

        if (stats.size === 0) {
            console.warn(`[HLS] m3u8 file is empty for camera ${camId}`);
            // ถ้า stream ยังทำงานอยู่ ให้ return 503 เพื่อให้ client retry
            if (hlsService.isStreaming(camId)) {
                return res.status(503).json({
                    error: "HLS stream is still initializing. Please try again in a few seconds.",
                    retryAfter: 2
                });
            } else {
                return res.status(503).json({
                    error: "HLS stream process stopped. Please try again.",
                    retryAfter: 5
                });
            }
        }

        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        // res.setHeader("Access-Control-Allow-Origin", "*");

        try {
            const m3u8Content = fs.readFileSync(m3u8Path, "utf-8");

            // ตรวจสอบว่า content ไม่ว่างเปล่า
            if (!m3u8Content || m3u8Content.trim().length === 0) {
                console.warn(`[HLS] m3u8 file is empty for camera ${camId}`);
                if (hlsService.isStreaming(camId)) {
                    return res.status(503).json({
                        error: "HLS playlist is empty. Stream is still initializing.",
                        retryAfter: 2
                    });
                } else {
                    return res.status(503).json({
                        error: "HLS stream stopped. Please try again.",
                        retryAfter: 5
                    });
                }
            }

            // แก้ไข path ใน m3u8 ให้ชี้ไปที่ API endpoint
            const modifiedContent = m3u8Content.replace(
                /segment_(\d+\.ts)/g,
                `/api/cameras/${camId}/hls/segment_$1`
            );

            // ตรวจสอบว่า response ยังไม่ได้ถูกส่ง
            if (!res.headersSent) {
                res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                res.setHeader("Pragma", "no-cache");
                // res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Content-Length", Buffer.byteLength(modifiedContent, "utf-8"));
                res.send(modifiedContent);
            }
        } catch (readErr: any) {
            console.error(`[HLS] Failed to read m3u8 file for camera ${camId}:`, readErr);
            if (!res.headersSent) {
                return res.status(500).json({ error: "Failed to read HLS playlist file" });
            }
        }
    } catch (err: any) {
        console.error("[HLS playlist error]", err);
        if (!res.headersSent) {
            res.status(500).json({ error: err?.message || "Failed to get HLS playlist" });
        } else {
            // ถ้า headers ถูกส่งแล้วแต่ยังมี error ให้ log เท่านั้น
            console.error("[HLS] Error occurred after headers sent");
        }
    }
}

/**
 * Get HLS segment (.ts) file for camera
 */
export async function getHlsSegment(req: Request, res: Response, next: NextFunction) {
    try {
        const camId = Number(req.params.cam_id);
        const segmentName = req.params.segment;

        if (!camId || !segmentName) {
            return res.status(400).json({ error: "cam_id and segment required" });
        }

        // ตรวจสอบว่า stream กำลังทำงานอยู่หรือไม่
        if (!hlsService.isStreaming(camId)) {
            console.warn(`[HLS] Segment requested but stream not running for camera ${camId}`);
            return res.status(503).json({ error: "HLS stream not running. Please request the playlist first." });
        }

        const segmentPath = hlsService.getSegmentPath(camId, segmentName);

        // ตรวจสอบว่า segment file มีอยู่หรือไม่
        if (!fs.existsSync(segmentPath)) {
            // Segment อาจยังไม่ถูกสร้าง (FFmpeg กำลังสร้างอยู่) หรือถูกลบไปแล้ว
            console.warn(`[HLS] Segment not found: ${segmentName} for camera ${camId}`);
            return res.status(404).json({ error: "Segment not found. It may not be created yet or already deleted." });
        }

        // ตรวจสอบว่า file มีเนื้อหาหรือไม่
        const stats = fs.statSync(segmentPath);
        if (stats.size === 0) {
            console.warn(`[HLS] Segment file is empty: ${segmentName} for camera ${camId}`);
            return res.status(404).json({ error: "Segment file is empty" });
        }

        // อ่านและส่ง segment file
        try {
            const segmentContent = fs.readFileSync(segmentPath);

            res.setHeader("Content-Type", "video/mp2t");
            res.setHeader("Content-Length", segmentContent.length);
            res.setHeader("Cache-Control", "public, max-age=3600");
            // res.setHeader("Access-Control-Allow-Origin", "*");

            res.send(segmentContent);
        } catch (readErr: any) {
            console.error(`[HLS] Failed to read segment file ${segmentName} for camera ${camId}:`, readErr);
            if (!res.headersSent) {
                return res.status(500).json({ error: "Failed to read segment file" });
            }
        }
    } catch (err: any) {
        console.error("[HLS segment error]", err);
        if (!res.headersSent) {
            res.status(500).json({ error: err?.message || "Failed to get HLS segment" });
        }
    }
}