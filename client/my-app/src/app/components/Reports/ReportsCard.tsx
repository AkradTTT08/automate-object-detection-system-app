"use client";

import React from "react";
import { FileText, BadgeCheck, LoaderCircle, CircleX } from "lucide-react";

export type IconKey = "file-text" | "badge-check" | "loader-circle" | "circle-x";
export type CardColor = "blue" | "green" | "red";

export interface ReportsCardProps {
  title: string;
  icon: IconKey;
  value: string | number;
  color: CardColor;
}

const iconMap: Record<IconKey, React.ComponentType<any>> = {
  "file-text": FileText,
  "badge-check": BadgeCheck,
  "loader-circle": LoaderCircle,
  "circle-x": CircleX,
};

// สีหลักของเลข / icon (เอา bg ออก เหลือแค่สีตัว icon + ตัวเลข)
const colorMap: Record<CardColor, string> = {
  blue: "text-[var(--color-primary)]",
  green: "text-[var(--color-success)]",
  red: "text-[var(--color-danger)]",
};

const cardBase =
  "bg-white w-full min-w-0 rounded-[10px] shadow-md border border-gray-100 min-h-[120px] flex";

const ReportsCard: React.FC<ReportsCardProps> = ({
  title,
  icon,
  value,
  color,
}) => {
  const IconComponent = iconMap[icon];
  const textColorClass = colorMap[color];

  return (
    <div className={cardBase}>
      <div className="flex flex-1 flex-col justify-center items-start text-left px-[20px] sm:px-[24px] py-[20px] sm:py-[22px]">
        {/* Title */}
        <h4 className="text-base font-medium text-[#000000]">{title}</h4>

        {/* Value Section + icon */}
        <div className="mt-2 flex items-center gap-x-[10px]">
          {/* icon ไม่มีพื้นหลังสีอ่อนแล้ว */}
          <div className={`w-[30px] h-[30px] flex items-center justify-center ${textColorClass}`}>
            <IconComponent className="h-[30px] w-[30px]" />
          </div>

          <div className="flex items-baseline gap-x-1">
            <span
              className={`text-[24px] leading-none font-medium pb-[2px] ${textColorClass}`}
            >
              {value}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsCard;