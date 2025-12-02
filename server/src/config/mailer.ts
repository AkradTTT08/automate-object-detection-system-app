import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST || "smtp.gmail.com";
const port = Number(process.env.SMTP_PORT || 587);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || user;

if (!user || !pass) {
  console.warn("[MAILER] SMTP_USER หรือ SMTP_PASS ยังไม่ได้ตั้งค่าใน .env");
}

export const mailer = nodemailer.createTransport({
  host,
  port,
  secure: port === 465, // 587 = STARTTLS, 465 = SSL
  auth: {
    user,
    pass,
  },
});

export const DEFAULT_FROM = from;