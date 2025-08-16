import { Request, Response, NextFunction } from 'express';
import * as CameraService from '../services/cameras.service';

export async function list(req: Request, res: Response, next: NextFunction){
    try {
        const cameras = await CameraService.listCameras();
        res.json(cameras);
    } catch(err) {
        next(err);
    }
};

/**
 * Controller: ดึงรายการประวัติการซ่อมบำรุงตามรหัสกล้อง
 *
 * @route GET /api/cameras/:cam_id
 * @param {Request} req - Express request object (ต้องมี params.cam_id)
 * @param {Response} res - Express response object (ส่งกลับรายการประวัติการซ่อมบำรุงเป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของรายการประวัติการซ่อมบำรุง
 *
 * @author Jirayu
 */
export async function listMaintenanceByCamId(req: Request, res: Response, next: NextFunction) {
    try {
        const cam_id = Number(req.params.cam_id);
        if (isNaN(cam_id)) {
            return res.status(400).json({ error: "Invalid camera ID" });
        }
        const history = await CameraService.getMaintenanceHistoryByCamId(cam_id);
        return res.json(history);
    } catch (err) {
        next(err);
    }
}