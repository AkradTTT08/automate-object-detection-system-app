"use client";

import React from "react";
import {
  AlertTriangle,
  Gauge,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";

type IconKey = "alert-triangle" | "gauge" | "check-circle" | "shield-check";

export interface AnalyticsCardProps {
  title: string;
  icon: IconKey;
  value: string | number;
  color: "red" | "orange" | "yellow" | "green";
  subtitleLeft?: string;
  subtitleRight?: string;
}

const iconMap = {
  "alert-triangle": AlertTriangle,
  gauge: Gauge,
  "check-circle": CheckCircle,
  "shield-check": ShieldCheck,
};

// ⭐ FIX: color map ให้ tailwind compile ได้ (static classes)
const colorMap: Record<
  "red" | "orange" | "yellow" | "green",
  string
> = {
  red: "text-red-500",
  orange: "text-orange-500",
  yellow: "text-yellow-500",
  green: "text-green-500",
};

const cardBase =
  "bg-white w-full min-w-0 rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.12)] border border-gray-200 h-[120px] flex flex-col justify-center px-[20px] py-[14px]";

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  icon,
  value,
  color,
  subtitleLeft,
  subtitleRight,
}) => {
  const IconComponent = iconMap[icon];
  const colorClass = colorMap[color]; // ใช้สีแบบ static

  return (
    <div className={cardBase}>
      {/* Title */}
      <h4 className="text-sm font-medium text-black-700 mb-1">{title}</h4>

      {/* Value Section */}
      <div className="flex items-center gap-3">
        <IconComponent className={`h-[28px] w-[28px] ${colorClass}`} />
        <span className={`text-[24px] font-semibold ${colorClass}`}>
          {value}
        </span>
      </div>

      {/* Subtitle */}
      {(subtitleLeft || subtitleRight) && (
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{subtitleLeft}</span>
          <span>{subtitleRight}</span>
        </div>
      )}
    </div>
  );
};

export default AnalyticsCard;
