"use client";

import React from "react";
import {
  AlertTriangle,
  Gauge,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";

export type IconKey = "alert-triangle" | "gauge" | "check-circle" | "shield-check";

export interface AnalyticsCardProps {
  title: string;
  icon: IconKey;
  value: string | number;
  color: "red" | "orange" | "yellow" | "green";
  subtitleLeft?: string;
  subtitleRight?: string;

  // ⭐ Badge สำหรับแสดงระดับความถี่ (เช่น Low / Moderate / High)
  badgeLabel?: string;
  badgeTone?: "low" | "moderate" | "high" | "critical";
}

const iconMap: Record<IconKey, React.ComponentType<any>> = {
  "alert-triangle": AlertTriangle,
  gauge: Gauge,
  "check-circle": CheckCircle,
  "shield-check": ShieldCheck,
};

// สีหลักของเลข / icon
const colorMap: Record<AnalyticsCardProps["color"], string> = {
  red: "text-red-500",
  orange: "text-orange-500",
  yellow: "text-yellow-500",
  green: "text-emerald-500",
};

const cardBase =
  "bg-white w-full min-w-0 rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.12)] border border-gray-200 h-[120px] flex flex-col justify-center px-[20px] py-[14px]";

/* ================= Helper: format number ================= */
// แปลง "10.00" → "10", "95.45" → "95.45"
function formatNumber(raw?: string) {
  if (!raw) return "";
  const n = Number(raw);
  if (isNaN(n)) return raw;

  if (Number.isInteger(n)) {
    return n.toString();
  }
  return n.toString(); // ถ้ามีทศนิยมจริง ให้แสดงตามจริง
}

/* ================= Helper: parse "Label: Value" ================= */
function parseMeta(text?: string) {
  if (!text) return null;

  const [label, value] = text.split(":");

  return {
    label: (label ?? "").trim(),
    value: formatNumber((value ?? "").trim()),
  };
}

// สี badge ตามโทนระดับความเสี่ยง
const badgeToneClass: Record<
  NonNullable<AnalyticsCardProps["badgeTone"]>,
  string
> = {
  low: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  moderate: "bg-amber-50 text-amber-700 border border-amber-200",
  high: "bg-orange-50 text-orange-700 border border-orange-200",
  critical: "bg-red-50 text-red-700 border border-red-200",
};

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  icon,
  value,
  color,
  subtitleLeft,
  subtitleRight,
  badgeLabel,
  badgeTone,
}) => {
  const IconComponent = iconMap[icon];
  const colorClass = colorMap[color];

  const leftMeta = parseMeta(subtitleLeft);
  const rightMeta = parseMeta(subtitleRight);

  return (
    <div className={cardBase}>
      {/* Title */}
      <h4 className="text-sm font-medium text-slate-800 mb-1">{title}</h4>

      {/* Value Section + Badge ข้าง ๆ */}
      <div className="flex items-center gap-3">
        <IconComponent className={`h-[28px] w-[28px] ${colorClass}`} />

        <div className="flex items-center gap-2">
          <span className={`text-[24px] font-semibold ${colorClass}`}>
            {value}
          </span>

          {badgeLabel && (
            <span
              className={`inline-flex items-center rounded-full px-2 py-[2px] text-[11px] font-medium ${
                badgeTone ? badgeToneClass[badgeTone] : "bg-slate-100 text-slate-600"
              }`}
            >
              {badgeLabel}
            </span>
          )}
        </div>
      </div>

      {/* Bottom: meta pills */}
      {(leftMeta || rightMeta) && (
        <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
          {leftMeta && (
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1">
              <span className="text-slate-400">{leftMeta.label}</span>
              <span className="font-semibold text-slate-700">
                {leftMeta.value}
              </span>
            </div>
          )}

          {rightMeta && (
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1">
              <span className="text-slate-400">{rightMeta.label}</span>
              <span className="font-semibold text-slate-700">
                {rightMeta.value}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsCard;