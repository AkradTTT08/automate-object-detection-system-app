import { Request, Response, NextFunction } from "express";
import * as UserService from "../services/users.service";


// ✅
export async function getUserById(req: Request, res: Response, next: NextFunction) {
    try {
        const user_id = Number(req.params.usr_id);
        const user = await UserService.getUserById(user_id);
        
        return res.status(200).json({ message: 'Fetched successfully', data: user });
    } catch (err) {
        next(err);
    }
}

// ✅ 2025-10-30
export async function updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
        const user_id = Number(req.params.usr_id);
        const { 
            name, 
            phone, 
            email 
        } = req.body;

        const user = await UserService.updateProfile(user_id, name, phone, email);
        
        return res.status(200).json({ message: 'Updated successfully', data: user });
    } catch (err) {
        next(err);
    }
}

// ✅ 2025-10-30
export async function updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
        const user_id = Number(req.params.usr_id);
        const { password } = req.body;

        const user = await UserService.updatePassword(user_id, password);
        
        return res.status(200).json({ message: 'Updated successfully', data: user });
    } catch (err) {
        next(err);
    }
}