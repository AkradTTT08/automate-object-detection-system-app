"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";


const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});


type TimeBasedAlertChartProps = {
  height?: number;       // ความสูงของกราฟ (ส่ง override ได้)
  rangeLabel?: string;   // ข้อความบอกช่วงเวลา (เชื่อมกับ filter time range)
};

type ApexSeries = NonNullable<ApexOptions["series"]>;


const AXIS_LABEL_STYLE = {
  colors: "#6b7280",
  fontSize: "12px",
};

// ===== DATA =====
// ใช้แบบเขียนเต็ม 5 months ago ... 1 day ago
const X_CATEGORIES = [
  "5 months ago",
  "4 months ago",
  "3 months ago",
  "2 months ago",
  "1 month ago",
  "3 weeks ago",
  "2 weeks ago",
  "1 week ago",
  "6 days ago",
  "5 days ago",
  "4 days ago",
  "3 days ago",
  "2 days ago",
  "1 day ago",
];

const CORRECT_SERIES = [58, 20, 66, 15, 95, 65, 38, 2, 23, 56, 45, 62, 45, 42];
const INCORRECT_SERIES = [16, 82, 88, 18, 18, 46, 90, 20, 30, 40, 50, 30, 23, 12];

// ===== CONFIG (Spline Area Chart) =====
const chartOptions: ApexOptions = {
  chart: {
    type: "area",
    zoom: { enabled: false },
    toolbar: { show: false },
    background: "transparent",
    parentHeightOffset: 0,
  },

  // เส้น Spline
  stroke: {
    curve: "smooth",
    width: 3,
  },

  // ไม่โชว์ตัวเลขบนจุด
  dataLabels: {
    enabled: false,
  },

  // สีเส้น Correct / Incorrect
  colors: ["#a0a1ffff", "#ff758aff"],

  // จุดวงกลมบนเส้นกราฟ
  markers: {
    size: 5,
    strokeWidth: 2,
    strokeOpacity: 1,
    fillOpacity: 1,
    colors: ["#ffffff"], // วงกลมพื้นขาว
    strokeColors: ["#a0a1ffff", "#ff758aff"],
    hover: {
      size: 7,
    },
  },

  // พื้นใต้เส้นแบบ gradient ซ้อนกัน
  fill: {
    type: "gradient",
    gradient: {
      shade: "light",
      type: "vertical",
      shadeIntensity: 0.5,
      gradientToColors: ["#d8ddff", "#ffd8dd"],
      opacityFrom: 0.2,
      opacityTo: 0.5,
      stops: [0, 60, 100],
    },
  },

  // แกน Y (จำนวนครั้ง)
  yaxis: {
    min: 0,
    max: 200, // ลบออกได้ถ้าอยากให้ auto
    tickAmount: 5,
    title: {
      text: "Alert Count",
      style: {
        color: "#6b7280",
        fontSize: "12px",
        fontWeight:600,
      },
    },
    labels: {
      style: AXIS_LABEL_STYLE,
      formatter: (val) => `${val}`,
    },
  },

  // เส้นตาราง
  grid: {
    borderColor: "#e5e7eb",
    strokeDashArray: 4,
    yaxis: { lines: { show: true } },
    xaxis: { lines: { show: true } },
  },

 
  xaxis: {
    categories: X_CATEGORIES,
    labels: {
      style: AXIS_LABEL_STYLE,
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },

  // Tooltip (จำนวนครั้งล้วน ๆ)
  tooltip: {
    theme: "light",
    shared: true,
    intersect: false,
    y: {
      formatter: (val: number) => `${val.toFixed(0)}`,
    },
  },

  // ใช้ legend custom เองด้านล่าง
  legend: {
    show: false,
  },

  responsive: [
    {
      breakpoint: 768,
      options: {},
    },
  ],
};

// ===== SERIES =====
const chartSeries: ApexSeries = [
  {
    name: "Correct",
    data: CORRECT_SERIES,
  },
  {
    name: "Incorrect",
    data: INCORRECT_SERIES,
  },
];

// ===== COMPONENT หลัก =====
export default function TimeBasedAlertDistribution({
  height = 250,
  rangeLabel = "Last 5 months – 1 day", // default (ผูกกับ filter ภายหลังได้)
}: TimeBasedAlertChartProps) {
  return (
    <div className="w-full rounded-3xl bg-[#ffffff] px-6 py-5 shadow-sm border border-[#e5e7f5]">
      {/* Header + Time Range Badge */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-[var(--color-primary,#111827)]">
          AI Accuracy
        </h2>

        {/* badge แสดงช่วงเวลา (เชื่อมกับ filter time range) */}
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          {rangeLabel}
        </span>
      </div>

      {/* Chart */}
      <div className="w-full md:overflow-visible overflow-x-auto overflow-y-hidden">
        <div className="min-w-[900px] md:min-w-0">
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height={height}
          />
        </div>
      </div>

      {/* Legend อธิบายความหมายสี — ล็อกกลางทุกหน้าจอ */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#a0a1ff]" />
          <span className="whitespace-nowrap">
            Correct — AI detection matches user
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff758a]" />
          <span className="whitespace-nowrap">
            Incorrect — AI detection mismatch
          </span>
        </div>
      </div>
    </div>
  );
}