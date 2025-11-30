"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

// โหลด react-apexcharts แบบ dynamic กัน error window is not defined ตอน SSR
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// ===== TYPES =====
type TimeBasedAlertChartProps = {
  height?: number; // ความสูงของกราฟ (ส่ง override ได้)
};

type ApexSeries = NonNullable<ApexOptions["series"]>;

// ===== SHARED CONSTS (ของที่ใช้ร่วมกันหลายที่) =====
const AXIS_LABEL_STYLE = {
  colors: "#6b7280",
  fontSize: "12px",
};

// ===== MOCK DATA 24 HOURS =====
const TIME_CATEGORIES = [
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00",
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
];

/**
 * Mock Alert Data (more realistic & volatile)
 * - ไม่เป็น smooth wave
 * - มี spike/dip กระจายเหมือน production
 */
const ALERT_SERIES_DATA = [
  6, 128, 4, 9, 12, 7,     // 00 - 05 (night + random spike)
  22, 48, 31, 76,         // 06 - 09 (morning volatile)
  92, 57, 101, 84,        // 10 - 13 (peak zone w/ dips)
  119, 63, 108, 79,       // 14 - 17 (double peak + drop)
  51, 86, 34, 58,         // 18 - 21 (evening uneven)
  17, 44                  // 22 - 23 (late spikes)
];

// ===== CONFIG (ตั้งค่าชาร์ต) =====
const chartOptions: ApexOptions = {
  chart: {
    type: "area",
    zoom: { enabled: false },
    toolbar: { show: false },
    background: "#ffffff",

    // 💜 เอฟเฟกต์ "เส้นเรืองแสงม่วง"
    dropShadow: {
      enabled: true,
      color: "#6705c9",
      top: 0,
      left: 0,
      blur: 14,
      opacity: 0.55,
    },

    // ช่วยให้ responsive ใน card ที่มี padding
    parentHeightOffset: 0,
  },

  // เส้นกราฟ
  stroke: {
    curve: "smooth",
    width: 2,
  },

  // ตัวเลขบนกราฟ
  dataLabels: {
    enabled: true,
    offsetY: -10,
    background: { enabled: false },
    style: {
      fontSize: "12px",
      fontWeight: "500",
      colors: ["#5d6470"],
    },
  },

  // สีของเส้นกราฟหลัก
  colors: ["#bab7fb"],

  // จุดวงกลมบนเส้นกราฟ
  markers: {
    size: 5,
    colors: ["#ffffff"],
    strokeColors: "#bab7fb",
    strokeWidth: 2,
  },

  // พื้นใต้กราฟ
  fill: {
    type: "gradient",
    gradient: {
      shade: "light",
      type: "vertical",
      shadeIntensity: 0.6,
      opacityFrom: 0.12,
      opacityTo: 0,
      stops: [0, 50, 100],
    },
  },

  // เส้นตาราง
  grid: {
    borderColor: "#e5e7eb",
    strokeDashArray: 4,
    yaxis: { lines: { show: true } },
    xaxis: { lines: { show: true } },
  },

  // แกน X (เวลา)
  xaxis: {
    categories: TIME_CATEGORIES,
    labels: { style: AXIS_LABEL_STYLE },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },

  // แกน Y (จำนวน alerts)
  yaxis: {
    min: 0,
    tickAmount: 5,
    forceNiceScale: true,   // 👈 ปรับ step ให้ออกมาสวย
    labels: { style: AXIS_LABEL_STYLE },
    title: {
      text: "Alert Count",
      style: {
        color: "#4b5563",
        fontSize: "12px",
        fontWeight: 600,
      },
    },
  },

  // Tooltip ตอน hover
  tooltip: {
    theme: "light",
    y: {
      formatter: (val: number) => `${val} alerts`,
    },
  },

  // ปรับบางอย่างให้เหมาะกับจอเล็ก
  responsive: [
    {
      breakpoint: 768,
      options: {
        dataLabels: {
          enabled: false,
        },
        markers: {
          size: 3,
        },
        yaxis: {
          tickAmount: 4,
        },
      },
    },
  ],
};

// ===== DATA (ข้อมูลกราฟ) =====
const chartSeries: ApexSeries = [
  {
    name: "Alerts",
    data: ALERT_SERIES_DATA,
  },
];

// ===== COMPONENT หลัก =====
export default function TimeBasedAlertDistribution({
  height = 220, // บีบกราฟให้เตี้ยลง
}: TimeBasedAlertChartProps) {
  return (
    <div className="w-full">
      <h2 className="text-lg font-bold mb-2 text-[var(--color-primary)]">
        Time-based Alert Distribution
      </h2>

      {/* Mobile: scroll X ที่ wrapper | Desktop: เต็มหน้าจอ */}
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
    </div>
  );
}