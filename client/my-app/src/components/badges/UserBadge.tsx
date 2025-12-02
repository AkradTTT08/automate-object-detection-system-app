"use client";

import {
  User as UserIcon,
  MonitorCog,
  ShieldAlert,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import React from "react";

type UserBadgeProps = {
  username?: string | null;
  role?: string | null;
  className?: string;
};

export default function UserBadge({
  username,
  role,
  className = "",
}: UserBadgeProps) {
  const name = (username ?? "").trim() || "unknown";
  const roleName = (role ?? "").toLowerCase();

  const BASE_ICON_CLASS = "w-3.5 h-3.5";

  let palette = {
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Icon: <UserIcon className={`${BASE_ICON_CLASS} text-emerald-700`} />,
  };

  switch (roleName) {
    case "system":
      palette = {
        pill: "bg-purple-50 text-purple-700 ring-purple-200",
        Icon: <MonitorCog className={`${BASE_ICON_CLASS} text-purple-700`} />,
      };
      break;

    case "admin":
      palette = {
        pill: "bg-red-50 text-red-700 ring-red-200",
        Icon: <ShieldAlert className={`${BASE_ICON_CLASS} text-red-700`} />,
      };
      break;

    case "security team":
      palette = {
        pill: "bg-amber-50 text-amber-700 ring-amber-200",
        Icon: <ShieldCheck className={`${BASE_ICON_CLASS} text-amber-700`} />,
      };
      break;

    case "staff":
      palette = {
        pill: "bg-blue-50 text-blue-700 ring-blue-200",
        Icon: <Wrench className={`${BASE_ICON_CLASS} text-blue-700`} />,
      };
      break;
  }

  return (
    <span
      className={[
        "inline-flex items-center gap-1",
        "rounded-full px-2 py-0.5 text-xs font-medium",
        "ring-1 ring-inset",
        palette.pill,
        className,
      ].join(" ")}
    >
      {palette.Icon}
      <span>{name}</span>
    </span>
  );
}