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
 * Controller: ดึงรายการ Event Detection 
 *
 * @route GET /api/:cam_id/event-detection
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object (ส่งกลับ event detections เป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของ event detections
 *
 * @author Wongsakon
 */
export async function listEventDetection(req: Request, res: Response, next: NextFunction){
    try {
        const cameras = await CameraService.eventDetection();
        res.json(cameras);
    } catch(err) {
        next(err);
    }
};