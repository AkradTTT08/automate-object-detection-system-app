"use client";

import { useMemo, useState } from "react";
import {
  Mail,
  Camera,
  Bell,
  MapPin,
  AlertTriangle,
  Send,
  Video,
} from "lucide-react";

/* ===== helpers ===== */
const EMAIL_SEVERITY_MAP: Record<
  string,
  { label: string; text: string; bg: string; ring: string; dot: string }
> = {
  critical: {
    label: "CRITICAL",
    text: "#be123c", // rose-700
    bg: "#fff1f2",   // rose-50
    ring: "#fecdd3",// rose-200
    dot: "#e11d48",
  },
  high: {
    label: "HIGH",
    text: "#c2410c", // orange-700
    bg: "#fff7ed",   // orange-50
    ring: "#fed7aa",// orange-200
    dot: "#f97316",
  },
  medium: {
    label: "MEDIUM",
    text: "#a16207", // yellow-700
    bg: "#fefce8",   // yellow-50
    ring: "#fde68a",// yellow-200
    dot: "#eab308",
  },
  low: {
    label: "LOW",
    text: "#047857", // emerald-700
    bg: "#ecfdf5",   // emerald-50
    ring: "#a7f3d0",// emerald-200
    dot: "#10b981",
  },
  default: {
    label: "INFO",
    text: "#334155", // slate-700
    bg: "#f8fafc",   // slate-50
    ring: "#e2e8f0",// slate-200
    dot: "#475569",
  },
};

/**
 * Format timestamp to `YYYY-MM-DD HH:mm` with Asia/Bangkok timezone
 * Example: 2025-12-01 13:56
 */
function formatBangkokTimestamp(iso: string) {
  const date = new Date(iso);

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = get("hour");
  const minute = get("minute");

  return `${year}-${month}-${day} ${hour}:${minute}`;
}

/* ===== HTML Template Generator (Google-like, formal) ===== */
function buildAlertHtml(data: {
  cameraName: string;
  severity: string;
  eventName: string;
  location?: string;
  timestamp: string;
}) {
  const sev = EMAIL_SEVERITY_MAP[data.severity] ?? EMAIL_SEVERITY_MAP.default;
  const formattedTime = formatBangkokTimestamp(data.timestamp);

  const LOGO_URL =
    "https://cdn.discordapp.com/attachments/1383089713996365854/1444988195027681353/automate-object-detection-system-icon_1.png?ex=692eb5a0&is=692d6420&hm=350b6804940dd43308da20365e293cef000bbe971239075271bb53dbb34b1ca4&";

  /**
   * Responsive scale (desktop = ปกติ, mobile ≈ เล็กลง ~20–25%)
   */
  const LOGO_SIZE = "clamp(28px,6vw,36px)";
  const TITLE_SIZE = "clamp(12px,3.5vw,15px)";
  const SUBTITLE_SIZE = "clamp(10px,3vw,12px)";

  // ใช้ badge แค่ใน Alert Details (ไม่อยู่ header แล้ว)
  const BADGE_SIZE = "clamp(8px,2.2vw,11px)";
  const BADGE_PAD_Y = "clamp(2px,0.8vw,3px)";
  const BADGE_PAD_X = "clamp(6px,2vw,10px)";

  const HEADER_PAD_Y = "clamp(12px,4vw,16px)";
  const HEADER_PAD_X = "clamp(16px,5vw,24px)";
  const HEADER_GAP = "clamp(8px,4vw,12px)";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AODS Security Alert</title>
</head>

<body style="margin:0;padding:0;background:#f3f4f6;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="padding:24px 12px;">
  <div style="
    max-width:640px;
    margin:0 auto;
    width:100%;
    background:#ffffff;
    border-radius:16px;
    border:1px solid #e5e7eb;
    box-shadow:0 12px 40px rgba(15,23,42,.12);
    overflow:hidden;
  ">

    <!-- Accent -->
    <div style="height:3px;background:linear-gradient(90deg,#0ea5e9,#2563eb,#4f46e5);"></div>

    <!-- Header (โลโก้ + ชื่อระบบ เท่านั้น) -->
    <div style="
      display:flex;
      align-items:center;
      gap:${HEADER_GAP};
      padding:${HEADER_PAD_Y} ${HEADER_PAD_X};
      border-bottom:1px solid #e5e7eb;
    ">

      <!-- Logo + title -->
      <div style="display:flex;align-items:center;gap:${HEADER_GAP};min-width:0;">

        <img src="${LOGO_URL}"
          alt="AODS Logo"
          style="
            width:${LOGO_SIZE};
            height:${LOGO_SIZE};
            border-radius:999px;
            border:1px solid #e5e7eb;
            background:#f8fafc;
            object-fit:cover;
            flex-shrink:0;
          "
        />

        <div style="min-width:0;">
          <div style="
            font-size:${TITLE_SIZE};
            font-weight:600;
            color:#0f172a;
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          ">
            AODS Security Alert
          </div>

          <div style="
            margin-top:2px;
            font-size:${SUBTITLE_SIZE};
            color:#6b7280;
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          ">
            Automate Object Detection System
          </div>
        </div>
      </div>
      <!-- ❌ ไม่มี severity badge ใน header แล้ว -->
    </div>

    <!-- Body -->
    <div style="padding:18px 24px 22px;color:#020617;font-size:13px;line-height:1.55;">
      <p style="margin:0 0 10px;color:#374151;">
        The <strong>AODS</strong> system has detected a camera event that requires your attention:
      </p>

      <!-- Event -->
      <div style="
        padding:10px 12px;
        background:#f3f4f6;
        border:1px solid #e5e7eb;
        border-radius:10px;
        margin-bottom:14px;
      ">
        <div style="font-size:11px;color:#6b7280;">Event</div>
        <div style="font-size:14px;font-weight:600;color:#111827;">
          ${data.eventName}
        </div>
      </div>

      <!-- Details -->
      <div style="
        border-radius:12px;
        border:1px solid #e5e7eb;
        background:#fafafa;
        overflow:hidden;
      ">
        <div style="
          padding:10px 14px;
          border-bottom:1px solid #e5e7eb;
          font-size:11px;
          color:#6b7280;
          letter-spacing:.04em;
          text-transform:uppercase;
        ">
          Alert Details
        </div>

        <div style="padding:10px 14px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:12px;color:#111827;">
            <tr>
              <td style="padding:6px 0;width:120px;color:#6b7280;">Camera</td>
              <td style="padding:6px 0;font-weight:500;">${data.cameraName}</td>
            </tr>

            <tr>
              <td style="padding:6px 0;color:#6b7280;vertical-align:top;">Severity</td>
              <td style="padding:6px 0;">
                <!-- ✅ Badge มาอยู่ใน Alert Details แล้ว -->
                <span style="
                  display:inline-flex;
                  align-items:center;
                  padding:${BADGE_PAD_Y} ${BADGE_PAD_X};
                  border-radius:999px;
                  background:${sev.bg};
                  border:1px solid ${sev.ring};
                  color:${sev.text};
                  font-weight:600;
                  font-size:${BADGE_SIZE};
                  white-space:nowrap;
                ">
                  ${sev.label}
                </span>
              </td>
            </tr>

            <tr>
              <td style="padding:6px 0;color:#6b7280;">Date & Time</td>
              <td style="padding:6px 0;">
                ${formattedTime}
              </td>
            </tr>

            ${
              data.location
                ? `
            <tr>
              <td style="padding:6px 0;color:#6b7280;">Location</td>
              <td style="padding:6px 0;">${data.location}</td>
            </tr>
            `
                : ""
            }
          </table>
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-top:18px;">
        <a href="http://localhost:8060/dashboard"
          style="
            display:inline-flex;
            align-items:center;
            justify-content:center;
            padding:9px 18px;
            background:#2563eb;
            color:white;
            border-radius:999px;
            text-decoration:none;
            font-size:13px;
            font-weight:500;
            box-shadow:0 8px 18px rgba(37,99,235,.45);
            white-space:nowrap;
          "
        >
          View Alert in Dashboard
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="
      padding:12px 18px;
      background:#f9fafb;
      border-top:1px solid #e5e7eb;
      color:#6b7280;
      font-size:11px;
    ">
      <p style="margin:0;">
        This email was automatically generated by
        <strong>AODS Alert System</strong>.
      </p>
      <p style="margin:4px 0 0;color:#9ca3af;">
        You are receiving this message because alert notifications are enabled for your account.
      </p>
    </div>

  </div>
</div>
</body>
</html>
`;
}

/* ===== React Component ===== */

export default function TestAlertMailPage() {
  const [to, setTo] = useState("");
  const [cameraName, setCamera] = useState("Gate Entrance Cam 01");
  const [eventName, setEvent] = useState("Tamper Detected");
  const [severity, setSeverity] = useState("critical");
  const [location, setLocation] = useState("Head Office Front Gate");

  const timestamp = new Date().toISOString();

  const htmlPreview = useMemo(
    () =>
      buildAlertHtml({
        cameraName,
        eventName,
        severity,
        location,
        timestamp,
      }),
    [cameraName, eventName, severity, location, timestamp]
  );

  async function handleSend() {
    await fetch("/api/mail/alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to,
        subject: `[AODS ALERT] ${eventName}`,
        html: htmlPreview,
      }),
    });

    alert("✅ Alert email sent!");
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Mail className="h-4 w-4" />
            </span>
            <span>Test AODS Alert Email</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            ส่งอีเมลแจ้งเตือนเหตุการณ์จากกล้องด้วยเทมเพลตแบบมินิมอล ใช้สีตามระบบ
          </p>
        </div>

        <div className="hidden text-xs text-slate-400 md:block">
          Preview only · Lucide UI · Tailwind
        </div>
      </div>

      {/* ===== FORM + PREVIEW ===== */}
      <div className="grid gap-6 md:grid-cols-[340px_1fr]">
        {/* Form */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100 mb-2">
            <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-slate-100">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-medium text-slate-800">
              Alert Payload
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              Send To
            </label>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="email@example.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-slate-400" />
              Camera Name
            </label>
            <input
              value={cameraName}
              onChange={(e) => setCamera(e.target.value)}
              placeholder="Camera name"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <Bell className="h-3.5 w-3.5 text-slate-400" />
              Event Name
            </label>
            <input
              value={eventName}
              onChange={(e) => setEvent(e.target.value)}
              placeholder="Event name"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-slate-400" />
                Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-[9px] text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
              />
            </div>
          </div>

          <button
            onClick={handleSend}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary,#1d4ed8)] px-3 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <Send className="h-4 w-4" />
            <span>Send Alert Email</span>
          </button>
        </div>

        {/* Preview */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Video className="h-3.5 w-3.5 text-slate-400" />
              <span>Email Template Preview</span>
            </div>
            <span className="text-[10px] text-slate-400">
              Timestamp: {formatBangkokTimestamp(timestamp)}
            </span>
          </div>
          <iframe
            title="Email Preview"
            srcDoc={htmlPreview}
            className="h-[580px] w-full border-none bg-white"
          />
        </div>
      </div>
    </div>
  );
}