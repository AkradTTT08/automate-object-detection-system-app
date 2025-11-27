"use client";

import React, { useEffect, useState } from "react";

export type RangeType = "week" | "month" | "year";

interface AnalyticsRangeSelectorProps {
  range: RangeType;
  onChange: (value: RangeType, start: string, end: string) => void;
}

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

const AnalyticsRangeSelector: React.FC<AnalyticsRangeSelectorProps> = ({
  range,
  onChange,
}) => {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(() => {
    const { start, end } = computeRange(range);
    setStart(start);
    setEnd(end);
    onChange(range, start, end);
  }, [range]);

  const options: RangeType[] = ["week", "month", "year"];

  return (
    <div className="w-full sm:w-auto flex-1">
      <div className="flex flex-wrap items-center gap-2">
        {options.map((item) => (
          <button
            key={item}
            onClick={() => {
              const { start, end } = computeRange(item);
              setStart(start);
              setEnd(end);
              onChange(item, start, end);
            }}
            className={`
              rounded-full border px-3 py-1 text-sm transition
              block w-full sm:w-auto text-center
              self-center
              ${
                range === item
                  ? "bg-[var(--color-primary)] text-[var(--color-white)] border-transparent"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }
            `}
          >
            {item.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsRangeSelector;
