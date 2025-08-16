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

export async function change(req: Request, res: Response, next: NextFunction){
    try {
        const { id, status } = req.body; // รับ id และ status ใหม่
        console.log(id , status)

        if (isNaN(id) || isNaN(status)) {
            return res.status(400).json({ message: "id and status are required" });
        }

        const updatedCamera = await CameraService.changeStatus(id, status);
        res.json(updatedCamera);
    } catch(err) {
        next(err);
    }
};