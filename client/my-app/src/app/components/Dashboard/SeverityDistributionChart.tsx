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
  priority?: string | null;
  created_at?: string;
}

interface SeriesItem {
  name: string;
  data: number[];
}

/* ========================= Mock Data ========================= */

const MOCK_API_EVENTS: ApiEventGlobalItem[] = [
  { event_id: 1, event_name: "Motion", priority: "low" },
  { event_id: 2, event_name: "Motion", priority: "medium" },
  { event_id: 3, event_name: "Motion", priority: "high" },
  { event_id: 4, event_name: "Motion", priority: "critical" },
  { event_id: 5, event_name: "Line", priority: "low" },
  { event_id: 6, event_name: "Line", priority: "medium" },
  { event_id: 7, event_name: "Line", priority: "high" },
  { event_id: 8, event_name: "Line", priority: "critical" },
  { event_id: 9, event_name: "Intrusion", priority: "low" },
  { event_id: 10, event_name: "Intrusion", priority: "medium" },
  { event_id: 11, event_name: "Intrusion", priority: "high" },
  { event_id: 12, event_name: "Intrusion", priority: "critical" },
  { event_id: 13, event_name: "Loitering", priority: "low" },
  { event_id: 14, event_name: "Loitering", priority: "medium" },
  { event_id: 15, event_name: "Loitering", priority: "high" },
  { event_id: 16, event_name: "Loitering", priority: "critical" },
  { event_id: 17, event_name: "Face", priority: "low" },
  { event_id: 18, event_name: "Face", priority: "medium" },
  { event_id: 19, event_name: "Face", priority: "high" },
  { event_id: 20, event_name: "Face", priority: "critical" },
  { event_id: 21, event_name: "Tamper", priority: "low" },
  { event_id: 22, event_name: "Tamper", priority: "medium" },
  { event_id: 23, event_name: "Tamper", priority: "high" },
  { event_id: 24, event_name: "Tamper", priority: "critical" },
  { event_id: 25, event_name: "Fire", priority: "low" },
  { event_id: 26, event_name: "Fire", priority: "medium" },
  { event_id: 27, event_name: "Fire", priority: "high" },
  { event_id: 28, event_name: "Fire", priority: "critical" },
  { event_id: 29, event_name: "Crowd", priority: "low" },
  { event_id: 30, event_name: "Crowd", priority: "medium" },
  { event_id: 31, event_name: "Crowd", priority: "high" },
  { event_id: 32, event_name: "Crowd", priority: "critical" },
  { event_id: 33, event_name: "Left Object", priority: "low" },
  { event_id: 34, event_name: "Left Object", priority: "medium" },
  { event_id: 35, event_name: "Left Object", priority: "high" },
  { event_id: 36, event_name: "Left Object", priority: "critical" },
  { event_id: 37, event_name: "Queue", priority: "low" },
  { event_id: 38, event_name: "Queue", priority: "medium" },
  { event_id: 39, event_name: "Queue", priority: "high" },
  { event_id: 40, event_name: "Queue", priority: "critical" },
  { event_id: 41, event_name: "Helmet", priority: "low" },
  { event_id: 42, event_name: "Helmet", priority: "medium" },
  { event_id: 43, event_name: "Helmet", priority: "high" },
  { event_id: 44, event_name: "Helmet", priority: "critical" },
  { event_id: 45, event_name: "Smoke", priority: "low" },
  { event_id: 46, event_name: "Smoke", priority: "medium" },
  { event_id: 47, event_name: "Smoke", priority: "high" },
  { event_id: 48, event_name: "Smoke", priority: "critical" },
  { event_id: 49, event_name: "Vibration", priority: "low" },
  { event_id: 50, event_name: "Vibration", priority: "medium" },
  { event_id: 51, event_name: "Vibration", priority: "high" },
  { event_id: 52, event_name: "Vibration", priority: "critical" },
  { event_id: 53, event_name: "Water Leak", priority: "low" },
  { event_id: 54, event_name: "Water Leak", priority: "medium" },
  { event_id: 55, event_name: "Water Leak", priority: "high" },
  { event_id: 56, event_name: "Water Leak", priority: "critical" },
  { event_id: 57, event_name: "Power Failure", priority: "low" },
  { event_id: 58, event_name: "Power Failure", priority: "medium" },
  { event_id: 59, event_name: "Power Failure", priority: "high" },
  { event_id: 60, event_name: "Power Failure", priority: "critical" },
];

/* ========================= Configs ========================= */

const PRIORITY_MAP: Record<string, "Low" | "Medium" | "High" | "Critical" | "Unknown"> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const SEVERITY_ORDER = ["Critical", "High", "Medium", "Low"] as const;

const SEVERITY_COLORS: Record<"Critical" | "High" | "Medium" | "Low", string> = {
  Critical: "#F87171",
  High: "#FB923C",
  Medium: "#FACC15",
  Low: "#4ADE80",
};

/* ========================= Helpers ========================= */

function buildChartDataFromRaw(raw: ApiEventGlobalItem[]) {
  const normalized = raw.map((item) => {
    const type = item.event_name || "Unknown";
    const priority = (item.priority || "unknown").toLowerCase();
    const severity = PRIORITY_MAP[priority] || "Unknown";
    return { type, severity };
  });

  const eventTypes = Array.from(new Set(normalized.map((i) => i.type)));

  const series: SeriesItem[] = SEVERITY_ORDER.map((sev) => ({
    name: sev,
    data: eventTypes.map(
      (type) => normalized.filter((i) => i.type === type && i.severity === sev).length
    ),
  }));

  return { categories: eventTypes, series };
}

/* ========================= Component ========================= */

type Props = {
  events?: ApiEventGlobalItem[];
};

export default function EventSeverityChart({ events }: Props) {
  const source = events && events.length > 0 ? events : MOCK_API_EVENTS;
  const { categories, series } = useMemo(() => buildChartDataFromRaw(source), [source]);

  const minEventWidth = 80;
  const chartWidth = categories.length * minEventWidth;

  const options: ApexOptions = {
    chart: {
      type: "bar",
      stacked: true,
      height: 400,
      toolbar: { show: false },
    },
    xaxis: {
      categories,
      labels: { rotate: 0, style: { colors: "#6B7280", fontSize: "12px" } },
    },
    yaxis: {
      title: { text: "Alert Count", style: { color: "#4B5563" } },
      labels: { style: { colors: "#6B7280", fontSize: "12px" } },
    },
    plotOptions: { bar: { horizontal: false, columnWidth: "55%", borderRadius: 3 } },
    colors: SEVERITY_ORDER.map((sev) => SEVERITY_COLORS[sev]),
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val) => `${val} alerts` } },
    stroke: { show: false },
    legend: { show: false },
  };

  return (
    <div className="w-full">
      <h2 className="text-md font-semibold mb-2 text-[var(--color-primary)]">
        Event Severity by Event Type
      </h2>

      {/* Scrollable chart container */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: chartWidth }}>
          <ReactApexChart options={options} series={series} type="bar" height={400} />
        </div>
      </div>

      {/* Legend */}
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
