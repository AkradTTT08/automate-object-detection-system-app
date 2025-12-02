"use client";

import React from "react";
import {
  FileText,
  BellRing,
  Gauge,
  CalendarClock,
  Eye,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type TemplateTabProps = {
  onPreview?: (id: string) => void;
};

const templates = [
  {
    id: "g",
    title: "General Summary Report",
    subtitle: "High-level overview of system activities and events.",
    color: "b",
  },
  {
    id: "a",
    title: "Alert Analysis Report",
    subtitle: "Detailed breakdown of alert events and handling.",
    color: "r",
  },
  {
    id: "p",
    title: "Performance Evaluation Report",
    subtitle: "Key metrics and KPIs for system performance.",
    color: "p",
  },
] as const;

const colorClasses: Record<
  string,
  { bg: string; ring: string }
> = {
  b: { bg: "bg-blue-500", ring: "ring-blue-100" },
  r: { bg: "bg-rose-500", ring: "ring-rose-100" },
  p: { bg: "bg-violet-500", ring: "ring-violet-100" },
};

const icons: Record<string, React.ReactNode> = {
  g: <FileText className="h-7 w-7 text-white" />,
  a: <BellRing className="h-7 w-7 text-white" />,
  p: <Gauge className="h-7 w-7 text-white" />,
};

export default function TemplateTab({ onPreview }: TemplateTabProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {/* ---------- Header ---------- */}
      <div className="col-span-full flex items-center justify-between">
        <h2 className="text-lg font-medium text-[var(--color-primary)]">
          Templates
        </h2>

        <Button size="sm" className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4" />
          Schedule Reports
        </Button>
      </div>

      <hr className="col-span-full border-slate-200 pt-2" />

      {/* ---------- Cards ---------- */}
      {templates.map((t) => {
        const cls = colorClasses[t.color] ?? colorClasses.b;

        return (
          <div
            key={t.id}
            className="
              flex
              min-h-[340px]
              flex-col
              items-center
              justify-between
              rounded-xl
              border
              border-slate-200
              bg-white
              p-6
              text-center
              shadow-sm
              transition
              hover:-translate-y-1
              hover:shadow-md
            "
          >
            {/* ---- Center Content ---- */}
            <div className="flex flex-col items-center justify-center gap-3">
              <div
                className={`inline-flex h-16 w-16 items-center justify-center rounded-full ${cls.bg} ring-4 ${cls.ring}`}
              >
                {icons[t.id]}
              </div>

              <h3 className="mt-2 text-base font-semibold text-slate-900">
                {t.title}
              </h3>

              <p className="text-sm text-slate-500 leading-relaxed max-w-[220px]">
                {t.subtitle}
              </p>
            </div>

            {/* ---- Actions ---- */}
            <div className="mt-6 flex w-full items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="
                  flex-1
                  gap-2
                  border-[var(--color-primary)]
                  text-[var(--color-primary)]
                  hover:bg-[var(--color-primary)]
                  hover:text-white
                "
                onClick={() => onPreview?.(t.id)}
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>

              {/* <Button
                variant="outline"
                size="sm"
                className="
                  flex-1
                  gap-2
                  border-[var(--color-primary)]
                  text-[var(--color-primary)]
                  hover:bg-[var(--color-primary)]
                  hover:text-white
                "
              >
                <Download className="h-4 w-4" />
                Download
              </Button> */}
            </div>
          </div>
        );
      })}
    </div>
  );
}