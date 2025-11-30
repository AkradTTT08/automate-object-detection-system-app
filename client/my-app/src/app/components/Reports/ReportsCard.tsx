"use client";

import React from "react";
import {
  FileText,
  BadgeCheck,
  LoaderCircle,
  CircleX,
} from "lucide-react";

export type IconKey = "file-text" | "badge-check" | "loader-circle" | "circle-x";

export interface ReportsCardProps {
  title: string;
  icon: IconKey;
  value: string | number;
  color: "blue" | "green" | "blue" | "red";

}

const iconMap: Record<IconKey, React.ComponentType<any>> = {
  "file-text": FileText,
  "badge-check": BadgeCheck,
  "loader-circle": LoaderCircle,
  "circle-x": CircleX,
};

// สีหลักของเลข / icon
const colorMap: Record<ReportsCardProps["color"], string> = {
  red: "text-red-500",
  blue: "text-blue-500",
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

const ReportsCard: React.FC<ReportsCardProps> = ({
  title,
  icon,
  value,
  color,
}) => {
  const IconComponent = iconMap[icon];
  const colorClass = colorMap[color];

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
        </div>
      </div>

    </div>
  );
};

export default ReportsCard;