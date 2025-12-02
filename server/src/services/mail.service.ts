// src/services/mail.service.ts

import { mailer, DEFAULT_FROM } from "../config/mailer";

/**
 * Generic options สำหรับการส่งอีเมล
 */
export interface SendMailOptions {
  to: string | string[];
  subject: string;
  text?: string | null | undefined;
  html?: string | null | undefined;
}

/**
 * Options สำหรับอีเมลแจ้งเตือน CCTV Alert
 * (ใช้ template HTML ใน backend)
 */
export interface SendAlertMailOptions {
  to: string | string[];
  cameraName: string;
  severity: string;
  eventName: string;
  timestamp: string;
  location?: string | null | undefined;
}

export class MailService {
  /**
   * ส่งอีเมลทั่วไป
   * - รองรับทั้ง text และ html (อย่างใดอย่างหนึ่งหรือทั้งคู่)
   */
  static async sendMail(options: SendMailOptions) {
    const { to, subject, text, html } = options;

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error(
        "SMTP is not configured. Please set SMTP_USER and SMTP_PASS in environment."
      );
    }

    const info = await mailer.sendMail({
      from: DEFAULT_FROM,
      to,
      subject,
      // ถ้ามี html ก็ใช้ html, ถ้าไม่มีแต่มี text จะ wrap เป็น <p>
      text: text ?? undefined,
      html: html ?? (text ? `<p>${text}</p>` : undefined),
    });

    return info;
  }

  /**
   * ส่งอีเมลแจ้งเตือน CCTV Alert (template สวยๆ ใน backend)
   */
  static async sendAlertEmail(options: SendAlertMailOptions) {
    const { to, cameraName, severity, eventName, timestamp, location } = options;

    const subject = `[ALERT] ${severity.toUpperCase()} - ${eventName} @ ${cameraName}`;

    const html = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size:14px; color:#111827;">
        <h2 style="font-size:16px; margin-bottom:8px;">WorkQuest AI CCTV Alert</h2>
        <p style="margin:4px 0;">มีเหตุการณ์แจ้งเตือนจากระบบกล้องวงจรปิด:</p>
        <ul style="margin:8px 0 12px 18px; padding:0;">
          <li><strong>Camera:</strong> ${cameraName}</li>
          <li><strong>Event:</strong> ${eventName}</li>
          <li><strong>Severity:</strong> ${severity}</li>
          <li><strong>Time:</strong> ${timestamp}</li>
          ${location ? `<li><strong>Location:</strong> ${location}</li>` : ""}
        </ul>
        <p style="margin:4px 0;">กรุณาเข้าตรวจสอบในระบบ Dashboard เพื่อดูรายละเอียดเพิ่มเติม</p>
        <p style="margin-top:16px; font-size:12px; color:#6B7280;">
          This is an automated message from WorkQuest Alert System.
        </p>
      </div>
    `;

    // reuse generic sender
    return this.sendMail({
      to,
      subject,
      html,
    });
  }
}