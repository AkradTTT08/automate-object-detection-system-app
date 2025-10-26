import { Request, Response, NextFunction } from "express";
import * as EventService from '../services/events.service';

// ✅
export async function getEvents(req: Request, res: Response, next: NextFunction) {
    try {
        const list = await EventService.getEvents();
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err);
    }
};

// ✅
export async function getEventById(req: Request, res: Response, next: NextFunction) {
    try {
        const event_id = Number(req.params.evt_id);

        const event = await EventService.getEventById(event_id);
        return res.status(200).json({ message: 'Fetched successfully', data: event });
    } catch (err) {
        next(err);
    }
};

// ✅
export async function createEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            icon_name,
            event_name,
            description,
            sensitivity,
            priority,
            status
        } = req.body;
        const event = await EventService.insertEvent(
            icon_name,
            event_name,
            description,
            sensitivity,
            priority,
            status
        );

        return res.status(201).json({ message: 'Created successfully', data: event });
    } catch (err: any) {
        // 🚨 ตรวจ error ที่มาจาก unique constraint
        if (err.message === "Event name already exists") {
            return res.status(400).json({
                message: "Event name already exists"
            });
        }

        // ❌ ส่งต่อ error อื่น ๆ ให้ middleware ถัดไป
        next(err);
    }
};

// ✅
export async function updateEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const event_id = Number(req.params.evt_id);
        const {
            icon_name,
            event_name,
            description,
            sensitivity,
            priority,
            status
        } = req.body;
        const event = await EventService.updateEvent(
            icon_name,
            event_name,
            description,
            sensitivity,
            priority,
            status,
            event_id
        );

        return res.status(200).json({ message: 'Updated successfully', data: event });
    } catch (err: any) {
        if (err.message === "Event name already exists") {
            return res.status(400).json({
                message: "Event name already exists"
            });
        }
        next(err);
    }
};

// ✅
export async function softDeleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const event_id = Number(req.params.evt_id);

        const event = await EventService.removeEvent(event_id);

        return res.status(200).json({ message: 'Deleted successfully', data: event });
    } catch (err) {
        next(err);
    }
};

// ✅
export async function getGlobalEvents(req: Request, res: Response, next: NextFunction) {
    try {
        const list = await EventService.getGlobalEvents();
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err);
    }
};

// ✅
export async function getGlobalEventById(req: Request, res: Response, next: NextFunction) {
    try {
        const event_id = Number(req.params.evt_id);

        const event = await EventService.getGlobalEventById(event_id);
        return res.status(200).json({ message: 'Fetched successfully', data: event });
    } catch (err) {
        next(err);
    }
};

// ✅
export async function updateGlobalEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const event_id = Number(req.params.evt_id);
        const {
            sensitivity,
            priority,
            status
        } = req.body

        const update = await EventService.updateGlobalEvent(
            sensitivity,
            priority,
            status,
            event_id
        );
        return res.status(200).json({ message: 'Updated successfully', data: update });
    } catch (err) {
        next(err);
    }

}

/**
 * Controller: ดึงรายการ Events ทั้งหมดออกมาแสดง
 *
 * @route GET /api/events
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object (ส่งกลับรายการ events เป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของรายการ events
 *
 * @author Jirayu
 */
// export async function index(req: Request, res: Response, next: NextFunction) {
//     try {
//         const events = await EventService.getAllEvents();
//         return res.json(events);
//     } catch (err) {
//         next(err);
//     }
// }

// export async function show(req: Request, res: Response, next:NextFunction){
//     try{
//         const evt_id = Number(req.params.evt_id);
//         const event = await EventService.getEventById(evt_id);
//         return res.json(event);
//     } catch (err) {
//         next(err);
//     }
// }

/**
 * เพิ่ม Event ตามข้อมูลใน req.body
 * ส่ง Event ที่เพิ่มแล้วเป็น JSON
 *
 * @param req - Request ของ Express (body: id, icon, name, description)
 * @param res - Response ของ Express
 * @param next - ส่งต่อ error
 * @returns {Promise<Response>} JSON response ของ Event ที่เพิ่มแล้ว
 *
 * @throws Error หากเกิดข้อผิดพลาดระหว่างการเพิ่ม
 *
 * @author Fasai
 */
// export async function store(req: Request, res: Response, next: NextFunction) {
//     try {
//         const { icon, name, description, status } = req.body;
//         const createEvent = await EventService.createEvent(icon, name, description, status);
//         return res.json(createEvent);
//     } catch (err) {
//         next(err);
//     }
// }

/**
 * อัปเดต Event ตามข้อมูลใน req.body
 * ส่ง Event ที่อัปเดตแล้วกลับเป็น JSON
 *
 * @param req - Request ของ Express (body: id, icon, name, description)
 * @param res - Response ของ Express
 * @param next - ส่งต่อ error
 * @returns {Promise<Response>} JSON response ของ Event ที่อัปเดตแล้ว
 *
 * @throws Error หากเกิดข้อผิดพลาดระหว่างการอัปเดต
 *
 * @author Fasai
 */
// export async function update(req: Request, res: Response, next: NextFunction) {
//     try {
//         const evt_id = Number(req.params.evt_id);
//         const { icon, name, description } = req.body;
//         const updateEvent = await EventService.updateEvent(evt_id, icon, name, description);
//         return res.json(updateEvent);
//     } catch (err) {
//         next(err);
//     }
// }

/**
 * ลบ Event ตามข้อมูลใน req.body
 * ส่ง Event ที่ลบแล้วกลับเป็น JSON
 *
 * @param req - Request ของ Express (body: id, status)
 * @param res - Response ของ Express
 * @param next - ส่งต่อ error
 * @returns {Promise<Response>} JSON response ของ Event ที่ลบแล้ว
 *
 * @throws Error หากเกิดข้อผิดพลาดระหว่างการลบ
 *
 * @author Fasai
 */
// export async function softDelete(req: Request, res: Response, next: NextFunction) {
//     try {
//         const evt_id = Number(req.params.evt_id);
//         const { status } = req.body
//         const deleteEvent = await EventService.deleteEvent(evt_id, status);
//         return res.json(deleteEvent);
//     } catch (err) {
//         next(err);
//     }
// }