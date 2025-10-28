"use client";

import { User as UserIcon } from "lucide-react";
import React from "react";

type UserBadgeProps = {
  username?: string | null;
  className?: string;
};

/**
 * แสดง badge ชื่อผู้ใช้พร้อมไอคอนด้านหน้า
 * ถ้า username เป็น "system" หรือ "System" จะใช้โทนสีม่วง
 */
export default function UserBadge({ username, className = "" }: UserBadgeProps) {
  const name = (username ?? "").trim() || "unknown";
  const isSystem = name.toLowerCase() === "system";

  const palette = isSystem
    ? {
        border: "border-purple-300",
        text: "text-purple-700",
        bg: "bg-purple-50",
        icon: "text-purple-700",
      }
    : {
        border: "border-emerald-300",
        text: "text-emerald-700",
        bg: "bg-emerald-50",
        icon: "text-emerald-700",
      };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium 
                  border ${palette.border} ${palette.text} ${palette.bg} ${className}`}
    >
      <UserIcon className={`h-4 w-4 ${palette.icon}`} />
      <span className="opacity-80 text-xs">{name}</span>
    </span>
  );
}