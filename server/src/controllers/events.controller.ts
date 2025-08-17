import { Request, Response, NextFunction } from "express";
import * as eventService from '../services/events.service';

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
        const eventDetection = await eventService.eventDetection();
        res.json(eventDetection);
    } catch(err) {
        next(err);
    }
};