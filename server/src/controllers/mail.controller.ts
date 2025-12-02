// src/controllers/mail.controller.ts

import { Request, Response, NextFunction } from "express";
import {
  MailService,
  SendMailOptions,
  SendAlertMailOptions,
} from "../services/mail.service";

export class MailController {
  /**
   * POST /api/mail/send
   * ส่งอีเมลทั่วไป
   */
  static async sendMail(req: Request, res: Response, next: NextFunction) {
    try {
      const { to, subject, text, html } = req.body as {
        to?: string | string[];
        subject?: string;
        text?: string | null;
        html?: string | null;
      };

      if (!to || !subject) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: to, subject",
        });
      }

      // ✅ สร้าง payload แบบไม่ยัด undefined ลงไป
      const payload: SendMailOptions = { to, subject };

      if (typeof text === "string") {
        payload.text = text;
      }

      if (typeof html === "string") {
        payload.html = html;
      }

      const info = await MailService.sendMail(payload);

      return res.status(200).json({
        success: true,
        message: "Email sent successfully",
        data: {
          messageId: info.messageId,
          accepted: info.accepted,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/mail/alert
   * ส่งอีเมลแจ้งเตือน CCTV Alert
   * - ถ้า body มี html → ใช้ html จาก frontend ส่งตรงเลย
   * - ถ้าไม่มี html → ใช้ backend template (sendAlertEmail)
   */
  static async sendAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        to,
        subject,
        html,

        cameraName,
        severity,
        eventName,
        timestamp,
        location,
      } = req.body as {
        to?: string | string[];
        subject?: string;
        html?: string | null;

        cameraName?: string;
        severity?: string;
        eventName?: string;
        timestamp?: string;
        location?: string | null;
      };

      if (!to) {
        return res.status(400).json({
          success: false,
          message: "Missing required field: to",
        });
      }

      // ✅ โหมด 1: frontend ส่ง html มาเอง
      if (typeof html === "string" && html.trim().length > 0) {
        const mailPayload: SendMailOptions = {
          to,
          subject: subject ?? "[ALERT] WorkQuest Notification",
          html,
        };

        const info = await MailService.sendMail(mailPayload);

        return res.status(200).json({
          success: true,
          message: "Alert email sent with custom HTML",
          data: {
            messageId: info.messageId,
            accepted: info.accepted,
          },
        });
      }

      // ✅ โหมด 2: ใช้ backend template (ต้องมีข้อมูล alert ครบ)
      if (!cameraName || !severity || !eventName || !timestamp) {
        return res.status(400).json({
          success: false,
          message:
            "Missing alert fields: cameraName, severity, eventName, timestamp (or provide html)",
        });
      }

      // สร้าง payload แบบไม่ส่ง undefined
      const payload: SendAlertMailOptions = {
        to,
        cameraName,
        severity,
        eventName,
        timestamp,
      };

      if (typeof location === "string") {
        payload.location = location;
      }

      const info = await MailService.sendAlertEmail(payload);

      return res.status(200).json({
        success: true,
        message: "Alert email sent successfully",
        data: {
          messageId: info.messageId,
          accepted: info.accepted,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}