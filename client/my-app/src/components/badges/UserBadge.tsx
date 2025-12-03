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

/* ============================================
   ROLE CONFIG
============================================ */
const BASE_ICON_CLASS = "w-3.5 h-3.5";

const ROLE_ICONS = {
  admin: ShieldAlert,
  "security team": ShieldCheck,
  staff: Wrench,
  system: MonitorCog,
  default: UserIcon,
} as const;

const ROLE_STYLES = {
  admin: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "security team": "bg-sky-50 text-sky-700 ring-sky-200",
  staff: "bg-orange-50 text-orange-700 ring-orange-200",
  system: "bg-violet-50 text-violet-700 ring-violet-200",
  default: "bg-slate-50 text-slate-700 ring-slate-200",
} as const;

type RoleKey = keyof typeof ROLE_STYLES;

/* ============================================
   HELPERS
============================================ */
function normalizeRole(role?: string | null): RoleKey {
  if (!role) return "default";

  const key = role.toLowerCase().trim() as RoleKey;
  return ROLE_STYLES[key] ? key : "default";
}

/* ============================================
   COMPONENT
============================================ */
export default function UserBadge({
  username,
  role,
  className = "",
}: UserBadgeProps) {
  const name = (username ?? "").trim() || "unknown";

  const roleKey = normalizeRole(role);

  const Icon = ROLE_ICONS[roleKey] ?? ROLE_ICONS.default;
  const pill = ROLE_STYLES[roleKey];

  return (
    <span
      className={[
        "inline-flex items-center gap-1",
        "rounded-full px-2 py-0.5 text-xs font-medium",
        "ring-1 ring-inset",
        pill,
        className,
      ].join(" ")}
    >
      <Icon className={BASE_ICON_CLASS} />
      <span>{name}</span>
    </span>
  );
}