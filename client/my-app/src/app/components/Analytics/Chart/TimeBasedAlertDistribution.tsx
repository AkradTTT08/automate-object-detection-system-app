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

const ALERT_SERIES_DATA = [63, 26, 74, 81, 49, 61, 50, 43, 84, 96, 74, 24];

const TIME_CATEGORIES = [
  "00:00",
  "02:00",
  "04:00",
  "06:00",
  "08:00",
  "10:00",
  "12:00",
  "14:00",
  "16:00",
  "18:00",
  "20:00",
  "22:00",
];

// ===== CONFIG (ตั้งค่าชาร์ต) =====
const chartOptions: ApexOptions = {
  chart: {
    type: "area",
    zoom: { enabled: false },
    toolbar: { show: false },
    background: "#ffffff", // พื้นหลัง plot area

    // 💜 เอฟเฟกต์ "เส้นเรืองแสงม่วง"
    dropShadow: {
      enabled: true,
      color: "#6705c9", // สีแสงเรือง (ม่วง)
      top: 0,
      left: 0,
      blur: 14,
      opacity: 0.55,
    },
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
    background: { enabled: false }, // ไม่มีกรอบหลังตัวเลข
    style: {
      fontSize: "12px",
      fontWeight: "500",
      colors: ["#5d6470"], // สีตัวเลขบนกราฟ
    },
  },

  // สีของเส้นกราฟหลัก
  colors: ["#bab7fb"],

  // จุดวงกลมบนเส้นกราฟ
  markers: {
    size: 5,
    colors: ["#ffffff"],     // สีด้านในวงกลม
    strokeColors: "#bab7fb", // สีขอบวงกลม
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
    yaxis: { lines: { show: true } }, // แนวนอน
    xaxis: { lines: { show: true } }, // แนวตั้ง
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
    max: 100,
    tickAmount: 5,
    labels: { style: AXIS_LABEL_STYLE },
  },

  // Tooltip ตอน hover
  tooltip: {
    theme: "light",
    y: {
      formatter: (val: number) => `${val} alerts`,
    },
  },
};

// ===== DATA (ข้อมูลกราฟ) =====
const chartSeries: ApexSeries = [
  {
    name: "Alerts",
    data: ALERT_SERIES_DATA,
  },
];

// ===== COMPONENT หลัก =====
const TimeBasedAlertDistribution: React.FC<TimeBasedAlertChartProps> = ({
  height = 220, // บีบกราฟให้เตี้ยลง
}) => {
  return (
    <div
      style={{
        // กล่องด้านหลัง (ใต้หัวข้อ + ใต้กราฟทั้งหมด)
        background: "#ffffff",
        padding: "12px 20px", // [บน-ล่าง, ซ้าย-ขวา]
        borderRadius: "24px",
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
        width: "100%",
      }}
    >
      {/* หัวข้อด้านบนของกราฟ */}
      <h2
        style={{
          marginBottom: "12px",
          fontSize: "20px",
          fontWeight: 600,
          color: "#2563eb",
        }}
      >
        Time-based Alert Distribution
      </h2>

      {/* ตัวกราฟ ApexCharts */}
      <ReactApexChart
        options={chartOptions}
        series={chartSeries}
        type="area"
        height={height}
        width="114%"
      />
    </div>
  );
};

export default TimeBasedAlertDistribution;
