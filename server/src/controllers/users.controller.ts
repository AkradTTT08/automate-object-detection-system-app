import { Request, Response, NextFunction } from "express";
import * as UserService from "../services/users.service";

/**
 * ดึงข้อมูลผู้ใช้งานตามรหัสจาก API
 * เหมาะสำหรับใช้ใน endpoint เช่น `/api/users/:usr_id`
 *
 * @param {Request} req - Express Request ที่มี usr_id ใน params
 * @param {Response} res - Express Response สำหรับส่งข้อมูลกลับไป
 * @param {NextFunction} next - ฟังก์ชันส่งต่อข้อผิดพลาดให้ middleware ถัดไป
 * @returns {Promise<Response>} ข้อมูลผู้ใช้งานที่พบและข้อความยืนยันการดึงข้อมูลสำเร็จ
 * @throws {Error} หากไม่พบผู้ใช้หรือเกิดข้อผิดพลาดระหว่างการเรียก service
 *
 * @author Wanasart
 * @lastModified 2025-10-30
 */
export async function getUserById(req: Request, res: Response, next: NextFunction) {
    try {
        const user_id = Number(req.params.usr_id);
        const user = await UserService.getUserById(user_id);
        
        return res.status(200).json({ message: 'Fetched successfully', data: user });
    } catch (err) {
        next(err);
    }
}

/**
 * อัปเดตข้อมูลโปรไฟล์ผู้ใช้งานตามรหัสที่ระบุ
 * ใช้สำหรับแก้ไขชื่อ เบอร์โทร และอีเมลของผู้ใช้งาน จากนั้นคืนค่าข้อมูลผู้ใช้ที่อัปเดตแล้ว
 *
 * @param {Request} req - Express Request ที่มี usr_id ใน params และ { name, phone, email } ใน body
 * @param {Response} res - Express Response
 * @param {NextFunction} next - ฟังก์ชันส่งต่อข้อผิดพลาดให้ middleware ถัดไป
 * @returns {Promise<Response>} ข้อมูลผู้ใช้ที่ถูกอัปเดตสำเร็จ
 * @throws {Error} หากไม่พบผู้ใช้หรือเกิดข้อผิดพลาดระหว่างอัปเดตฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-30
 */
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

/**
 * เปลี่ยนรหัสผ่านของผู้ใช้งานตามรหัสที่ระบุ
 * ระบบจะทำการแฮชรหัสผ่านใหม่ในชั้น Service และอัปเดตเวลาแก้ไข จากนั้นคืนค่าสถานะสำเร็จ
 *
 * @param {Request} req - Express Request ที่มี usr_id ใน params และ { password } ใน body
 * @param {Response} res - Express Response
 * @param {NextFunction} next - ฟังก์ชันส่งต่อข้อผิดพลาดให้ middleware ถัดไป
 * @returns {Promise<Response>} ออบเจ็กต์สถานะผลลัพธ์การอัปเดตรหัสผ่าน
 * @throws {Error} หากไม่พบผู้ใช้หรือเกิดข้อผิดพลาดระหว่างการอัปเดตฐานข้อมูล/แฮชรหัสผ่าน
 *
 * @author Wanasart
 * @lastModified 2025-10-30
 */
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


/**
 * อัปเดตข้อมูลผู้ใช้งานตามรหัสที่ระบุ
 * ระบบจะรับข้อมูลที่ต้องการแก้ไข เช่น username, name, phone, email, role และสถานะ is_use
 * แล้วส่งให้ Service จัดการอัปเดตในฐานข้อมูล ก่อนคืนค่าผลลัพธ์กลับมา
 *
 * @param {Request} req - Express Request ที่มี user id ใน params และข้อมูลผู้ใช้ใน body
 * @param {Response} res - Express Response สำหรับส่งผลลัพธ์การอัปเดต
 * @param {NextFunction} next - ฟังก์ชันส่งต่อ error ให้ middleware ถัดไป
 * @returns {Promise<Response>} ข้อมูลผู้ใช้ที่ได้รับการอัปเดตสำเร็จ
 * @throws {Error} หาก user id ไม่ถูกต้อง หรือเกิดข้อผิดพลาดระหว่างอัปเดตฐานข้อมูล
 *
 * @author Premsirikun
 * @lastModified 2025-11-30
 */
export async function updateUser(req: Request,res: Response,next: NextFunction){
    try {
    const userId = Number(req.params.id);
    if (!userId || Number.isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user id" });
    }
    const { username, name, phone, email, usr_role, is_use } = req.body;
    const user = await UserService.updatedUser(userId, {username,name,phone,email,usr_role,is_use,});
    return res.json({
         message: "User updated successfully",
        data: user,
    });
    } catch (err) {
    next(err);
  }
}
/**
 * ปิดการใช้งานบัญชีผู้ใช้งานแบบ Soft Delete ตามรหัสที่ระบุ
 * การลบแบบ Soft Delete จะไม่ลบข้อมูลจริง แต่จะเปลี่ยนสถานะผู้ใช้ให้ไม่สามารถเข้าสู่ระบบได้
 *
 * @param {Request} req - Express Request ที่มี user id ใน params
 * @param {Response} res - Express Response สำหรับส่งสถานะผลลัพธ์การปิดการใช้งานผู้ใช้
 * @param {NextFunction} next - ฟังก์ชันส่งต่อ error ให้ middleware ถัดไป
 * @returns {Promise<Response>} ออบเจ็กต์ข้อมูลผู้ใช้หลังถูกปิดการใช้งาน
 * @throws {Error} หาก user id ไม่ถูกต้อง หรือเกิดปัญหาระหว่าง Soft Delete ในฐานข้อมูล
 *
 * @author Premsirikun
 * @lastModified 2025-11-30
 */
export async function softDeleteUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.params.id);

    if (!userId || Number.isNaN(userId)) {
      return res.status(400).json({ message: "User has been deactivated (soft delete)" });
    }
    const user = await UserService.softDeleteUser(userId);

    return res.json({
      message: "User has been deactivated (soft delete).",
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

