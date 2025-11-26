"use client";

import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ActionConfig = {
  label: string;
  pill: string;
  Icon: LucideIcon;
};

const ACTION_MAP: Record<string, ActionConfig> = {
  CREATE: {
    label: "Create",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Icon: Icons.PlusCircle,
  },
  UPDATE: {
    label: "Update",
    pill: "bg-sky-50 text-sky-700 ring-sky-200",
    Icon: Icons.Edit3,
  },
  DELETE: {
    label: "Delete",
    pill: "bg-rose-50 text-rose-700 ring-rose-200",
    Icon: Icons.Trash2,
  },
  ENABLE: {
    label: "Enable",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Icon: Icons.ToggleRight,
  },
  DISABLE: {
    label: "Disable",
    pill: "bg-amber-50 text-amber-700 ring-amber-200",
    Icon: Icons.ToggleLeft,
  },
  VIEW: {
    label: "View",
    pill: "bg-slate-50 text-slate-700 ring-slate-200",
    Icon: Icons.Eye,
  },
};

export function ActionBadge({ action }: { action?: string }) {
  const key = (action ?? "").trim().toUpperCase();

  const conf: ActionConfig =
    ACTION_MAP[key] ?? {
      label: key || "Unknown",
      pill: "bg-slate-50 text-slate-700 ring-slate-200",
      Icon: Icons.HelpCircle,
    };

  const Icon = conf.Icon;

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        conf.pill,
      ].join(" ")}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="uppercase text-[11px] tracking-wide">
        {conf.label}
      </span>
    </span>
  );
}