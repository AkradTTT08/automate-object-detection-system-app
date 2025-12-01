"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";


const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});


type TimeBasedAlertChartProps = {
  height?: number; 
};

type ApexSeries = NonNullable<ApexOptions["series"]>;


const AXIS_LABEL_STYLE = {
  colors: "#6b7280",
  fontSize: "12px",
};


const X_CATEGORIES = [
    "5 months ago","4 months ago","3 months ago",
    "2 months ago","1 months ago",
    "3 week ago","2 week ago", "1 week ago",
    "6 Days ago","5 Days ago","4 Days ago","3 Days ago",
    "2 Days ago","1 Days ago",
];

const CORRECT_SERIES = [58, 20, 66, 15, 95, 65, 38, 2, 23, 56, 45, 62, 45, 42 ];
const INCORRECT_SERIES = [16, 82, 88, 18, 18, 46, 90, 20, 30, 40, 50, 30, 23, 12];


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

 
fill: {
  type: "gradient",
  gradient: {
    shade: "light",
    type: "vertical",
    shadeIntensity: 0.5,

    gradientToColors: ["#d8ddff", "#ffd8dd"],

    opacityFrom: 0.20,
    opacityTo: 0.50,   
    stops: [0, 60, 100],
  },
},
yaxis: {
  min: 0,
  max: 100,
  tickAmount: 5,
  labels: { style: AXIS_LABEL_STYLE },
},
 
  grid: {
    borderColor: "#e5e7eb",
    strokeDashArray: 4,
    yaxis: { lines: { show: true } },
    xaxis: { lines: { show: true } },
  },

 
  xaxis: {
    categories: X_CATEGORIES,
    labels: { style: AXIS_LABEL_STYLE },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },

  
  yaxis: {
    min: 0,
    max: 200,
    tickAmount: 5,
    labels: {
      style: AXIS_LABEL_STYLE,
      formatter: (val) => `${val}`,
    },
  },

  
  tooltip: {
    theme: "light",
    shared: true,
    intersect: false,
    y: {
      formatter: (val: number) => `${val.toFixed(0)} %`,
    },
  },

  legend: {
    show: true,
    position: "bottom",
    horizontalAlign: "center",
    fontSize: "12px",
    labels: {
      colors: "#6b7280",
    },
    markers: {
      width: 12,
      height: 12,
    },
    itemMargin: {
      horizontal: 12,
      vertical: 4,
    },
  },

  // ปรับสำหรับจอเล็ก
  responsive: [
    {
      breakpoint: 768,
      options: {
        legend: {
          fontSize: "11px",
        },
      },
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
}: TimeBasedAlertChartProps) {
  return (
    <div className="w-full rounded-3xl bg-[#ffffff] px-6 py-5 shadow-sm border border-[#e5e7f5]">
       <h2 className="text-lg font-bold mb-2 text-[var(--color-primary)]">
        Ai Accuracy
      </h2>

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
