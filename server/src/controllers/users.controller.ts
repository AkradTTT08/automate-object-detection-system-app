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