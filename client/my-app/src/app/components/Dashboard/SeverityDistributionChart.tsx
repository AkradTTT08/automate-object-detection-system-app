"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

/* ========================= Types ========================= */

export interface ApiEventGlobalItem {
  event_id: number;
  event_name: string;
  priority?: string | null; // ใช้แทน severity
  created_at?: string;
}

interface SeriesItem {
  name: string;
  data: number[];
}

/* ========================= Mock Data ========================= */

const MOCK_API_EVENTS: ApiEventGlobalItem[] = [
  { event_id: 1, event_name: "Motion Detected", priority: "high" },
  { event_id: 2, event_name: "Line Crossing", priority: "medium" },
  { event_id: 3, event_name: "Intrusion", priority: "critical" },
  { event_id: 4, event_name: "Loitering", priority: "low" },
  { event_id: 5, event_name: "Motion Detected", priority: "medium" },
  { event_id: 6, event_name: "Motion Detected", priority: "high" },
  { event_id: 7, event_name: "Intrusion", priority: "high" },
];

/* priority(lowercase) -> severity label */
const PRIORITY_MAP: Record<
  string,
  "Low" | "Medium" | "High" | "Critical" | "Unknown"
> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

/* Fix order 4 ช่องเสมอ */
const SEVERITY_ORDER = ["Critical", "High", "Medium", "Low"] as const;

/* สี severity ของคุณ */
const SEVERITY_COLORS: Record<"Critical" | "High" | "Medium" | "Low", string> = {
  Critical: "#F87171", // rose-400
  High: "#FB923C", // orange-400
  Medium: "#FACC15", // yellow-400
  Low: "#4ADE80", // emerald-400
};

/* ========================= Helpers ========================= */

function buildChartDataFromRaw(raw: ApiEventGlobalItem[]) {
  // Normalize API → { type, severity }
  const normalized = raw.map((item) => {
    const type = item.event_name || "Unknown";
    const priority = (item.priority || "unknown").toLowerCase();
    const severity = PRIORITY_MAP[priority] || "Unknown";
    return { type, severity };
  });

  const eventTypes = Array.from(new Set(normalized.map((i) => i.type)));

  // สร้าง series ครบ 4 severity ตลอด
  const series: SeriesItem[] = SEVERITY_ORDER.map((sev) => ({
    name: sev,
    data: eventTypes.map((type) => {
      const count = normalized.filter(
        (i) => i.type === type && i.severity === sev
      ).length;
      return count;
    }),
  }));

  return { categories: eventTypes, series };
}

/* ========================= Component ========================= */

type Props = {
  events?: ApiEventGlobalItem[];
};

export default function EventSeverityChart({ events }: Props) {
  const source = events && events.length > 0 ? events : MOCK_API_EVENTS;

  const { categories, series } = useMemo(
    () => buildChartDataFromRaw(source),
    [source]
  );

  const options: ApexOptions = {
    chart: {
      type: "bar",
      stacked: false,
      height: 400,
      toolbar: { show: false },
    },
    xaxis: {
      categories,
      labels: {
        style: { colors: "#6B7280", fontSize: "12px" },
      },
    },
    yaxis: {
      title: {
        text: "Alert Count",
        style: { color: "#4B5563" },
      },
      labels: {
        style: { colors: "#6B7280", fontSize: "12px" },
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "50%",
        borderRadius: 4,
      },
    },
    // ปิด legend ของ Apex (ไม่ให้โชว์ด้านบน)
    legend: {
      show: false,
    },
    dataLabels: { enabled: false },

    colors: SEVERITY_ORDER.map((sev) => SEVERITY_COLORS[sev]),

    tooltip: {
      y: {
        formatter: (val) => `${val} alerts`,
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
  };

  return (
    <div className="w-full">
      <h2 className="text-md font-semibold mb-2 text-[var(--color-primary)]">
        Event Severity by Event Type
      </h2>

      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={400}
      />

      {/* คำอธิบายสี (Legend) ไว้ด้านล่างกราฟ */}
      <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs text-gray-600">
        {SEVERITY_ORDER.map((sev) => (
          <div key={sev} className="flex items-center gap-1">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: SEVERITY_COLORS[sev] }}
            />
            <span>{sev}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
