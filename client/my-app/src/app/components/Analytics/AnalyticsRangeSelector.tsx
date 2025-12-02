"use client";

import React, { useEffect, useState } from "react";

export type RangeType = "week" | "month" | "year";

interface AnalyticsRangeSelectorProps {
  range: RangeType;
  onChange: (value: RangeType, start: string, end: string) => void;
}

/* ---------------- Date utils ---------------- */
function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function computeRange(r: RangeType) {
  const now = new Date();
  const start = new Date(now);

  if (r === "week") start.setDate(now.getDate() - 7);
  else if (r === "month") start.setMonth(now.getMonth() - 1);
  else if (r === "year") start.setFullYear(now.getFullYear() - 1);

  return {
    start: formatDate(start),
    end: formatDate(now),
  };
}

/* ---------------- Component ---------------- */
const OPTIONS: { key: RangeType; label: string }[] = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

const AnalyticsRangeSelector: React.FC<AnalyticsRangeSelectorProps> = ({
  range,
  onChange,
}) => {
  const [localStart, setLocalStart] = useState("");
  const [localEnd, setLocalEnd] = useState("");

  /* sync เมื่อ range เปลี่ยนจาก parent */
  useEffect(() => {
    const { start, end } = computeRange(range);
    setLocalStart(start);
    setLocalEnd(end);
    onChange(range, start, end);
  }, [range]);

  return (
    <div className="flex items-center">
      {/* ===== Segmented control background ===== */}
      <div className="inline-flex items-center rounded-full bg-sky-50 border border-sky-100 p-1">
        {OPTIONS.map((item) => {
          const active = range === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                const { start, end } = computeRange(item.key);
                setLocalStart(start);
                setLocalEnd(end);
                onChange(item.key, start, end);
              }}
              className={`
                px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full
                transition-all duration-150
                whitespace-nowrap

                ${
                  active
                    ? "bg-[var(--color-primary,#1D8CFF)] text-white shadow"
                    : "text-[#1D8CFF] hover:bg-white/70"
                }
              `}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsRangeSelector;