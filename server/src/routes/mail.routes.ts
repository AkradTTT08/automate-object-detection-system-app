import { Router } from "express";
import { MailController } from "../controllers/mail.controller";

const router = Router();

// ส่งอีเมลทั่วไป
router.post("/send", MailController.sendMail);

// ส่ง Alert email สำหรับระบบกล้อง
router.post("/alert", MailController.sendAlert);

export default router;