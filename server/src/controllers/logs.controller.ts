import { Request, Response, NextFunction } from "express";
import * as LogService from '../services/logs.service';

/**
 * ดึงรายการบันทึกกล้อง (Camera Logs) ทั้งหมด
 *
 * @param {Request} req - อ็อบเจ็กต์คำขอจาก Express
 * @param {Response} res - อ็อบเจ็กต์ตอบกลับจาก Express
 * @param {NextFunction} next - ฟังก์ชันส่งต่อข้อผิดพลาดให้ middleware ถัดไป
 * @returns {Promise<Response>} รายการบันทึกกล้องทั้งหมดเรียงล่าสุดก่อน
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจาก Service
 *
 * @author Wanasart
 * @lastModified 2025-10-31
 */
export async function getCameraLogs(req: Request, res: Response, next: NextFunction) {
    try {
        const list = await LogService.getCameraLogs();
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err);
    }
};

/**
 * ดึงรายการบันทึกกล้อง (Camera Logs) ทั้งหมด
 *
 * @param {Request} req - อ็อบเจ็กต์คำขอจาก Express
 * @param {Response} res - อ็อบเจ็กต์ตอบกลับจาก Express
 * @param {NextFunction} next - ฟังก์ชันส่งต่อข้อผิดพลาดให้ middleware ถัดไป
 * @returns {Promise<Response>} รายการบันทึกกล้องทั้งหมดเรียงล่าสุดก่อน
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจาก Service
 *
 * @author Wanasart
 * @lastModified 2025-10-31
 */
export async function getAlertLogs(req: Request, res: Response, next: NextFunction) {
    try {
        const list = await LogService.getAlertLogs();
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err);
    }
};

/**
 * ดึงรายการบันทึกการทำงานของผู้ใช้ (User Activity Logs)
 * 
 * @param {Request} req - อ็อบเจ็กต์คำขอจาก Express
 * @param {Response} res - อ็อบเจ็กต์ตอบกลับจาก Express
 * @param {NextFunction} next - ฟังก์ชันส่งต่อข้อผิดพลาดให้ middleware ถัดไป
 * @returns {Promise<Response>} ส่งคืนรายการบันทึกการทำงานของผู้ใช้ เรียงตามเวลาล่าสุดก่อน
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจาก Service ชั้นล่าง
 *
 * @author Wanasart
 * @lastModified 2025-11-26
 */
export async function getUserLogs(req: Request, res: Response, next: NextFunction) {
    try {
        const list = await LogService.getUserLogs();
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err);
    }
};