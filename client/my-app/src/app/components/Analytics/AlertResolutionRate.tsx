"use client";

import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const data = [
  { month: "January", total: 65, closed: 80 },
  { month: "February", total: 90, closed: 60 },
  { month: "March", total: 55, closed: 10 },
  { month: "April", total: 78, closed: 50 },
  { month: "May", total: 50, closed: 45 },
  { month: "June", total: 42, closed: 40 },
  { month: "July", total: 67, closed: 20 },
  { month: "August", total: 40, closed: 55 },
  { month: "September", total: 52, closed: 90 },
  { month: "October", total: 64, closed: 78 },
  { month: "November", total: 48, closed: 25 },
  { month: "December", total: 88, closed: 15 },
];

export default function AlertResolutionRate() {
  const options: ApexOptions = {
    chart: {
      type: "line", // ✔ ตอนนี้ TS รู้ว่าเป็น literal แล้ว เพราะ options มี type เป็น ApexOptions
      toolbar: { show: false },
    },
    stroke: {
      curve: "straight",
      width: 3,
    },
    xaxis: {
      categories: data.map((d) => d.month),
      labels: { style: { fontSize: "12px", colors: "#6b7280" } },
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: { style: { fontSize: "12px", colors: "#6b7280" } },
    },
    colors: ["#3b82f6", "#ef4444"],
    legend: { show: true },
    grid: { borderColor: "#e5e7eb" },
    tooltip: { theme: "light" },
  };

  const series = [
    { name: "Total", data: data.map((d) => d.total) },
    { name: "Closed", data: data.map((d) => d.closed) },
  ];

  return (
    <Card className="mt-6 rounded-xl shadow-md bg-white">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-[var(--color-primary)] mb-4">
          Alert Resolution Rate
        </h2>

        <div className="w-full h-[320px]">
          <Chart options={options} series={series} type="line" height="100%" />
        </div>
      </CardContent>
    </Card>
  );
}
