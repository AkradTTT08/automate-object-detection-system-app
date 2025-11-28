"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ApiAlertItem {
  camera_id: number;
  camera_name: string;
  alert_id: number;
}

interface Props {
  alerts?: ApiAlertItem[];
}

/* ========================= Mock Data ========================= */
const MOCK_CAMERAS = [
  { name: "Gate Entrance Cam 01", alerts: 5 },
  { name: "Lobby Cam 01", alerts: 3 },
  { name: "Parking Cam 01", alerts: 7 },
  { name: "Hallway Cam 01", alerts: 4 },
  { name: "Hallway Cam 02", alerts: 6 },
  { name: "Conference Room Cam 01", alerts: 2 },
  { name: "Staircase Cam 01", alerts: 5 },
  { name: "Staircase Cam 02", alerts: 3 },
  { name: "Elevator Cam 01", alerts: 4 },
  { name: "Elevator Cam 02", alerts: 1 },
  { name: "Server Room Cam 01", alerts: 8 },
  { name: "Cafeteria Cam 01", alerts: 2 },
  { name: "Parking Cam 02", alerts: 6 },
];

/* ========================= Component ========================= */
export default function CameraAlertsBarChart({ alerts }: Props) {
  const [categories, setCategories] = useState<string[]>([]);
  const [values, setValues] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const buildFromAlerts = (data: ApiAlertItem[], allowFallback = true) => {
    const cameraMap = new Map<number, { name: string; count: number }>();
    for (const alert of data) {
      const camId = alert.camera_id;
      const camName = alert.camera_name || `Camera #${camId}`;
      const exist = cameraMap.get(camId);
      if (exist) exist.count += 1;
      else cameraMap.set(camId, { name: camName, count: 1 });
    }

    const cams = Array.from(cameraMap.values());
    const names = cams.map((c) => c.name);
    const counts = cams.map((c) => c.count);

    if (allowFallback && (counts.length === 0 || counts.every((v) => v === 0))) {
      setCategories(MOCK_CAMERAS.map((c) => c.name));
      setValues(MOCK_CAMERAS.map((c) => c.alerts));
      return;
    }

    setCategories(names);
    setValues(counts);
  };

  useEffect(() => {
    if (alerts && alerts.length > 0) {
      buildFromAlerts(alerts);
      setLoading(false);
      return;
    }

    const fetchCameras = async () => {
      try {
        const res = await fetch("/api/cameras");
        if (!res.ok) throw new Error("Failed to fetch cameras");
        const data: ApiAlertItem[] = Array.isArray(await res.json()) ? await res.json() : [];
        buildFromAlerts(data);
      } catch {
        setCategories(MOCK_CAMERAS.map((c) => c.name));
        setValues(MOCK_CAMERAS.map((c) => c.alerts));
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, [alerts]);

  // Dynamic scroll width
  const minBarWidth = 120;
  const chartWidth = categories.length > 10 ? categories.length * minBarWidth : "100%";

  // หา max value เพื่อกำหนด Y axis
  const maxY = Math.max(...values, 1);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 480,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        columnWidth: "55%",
        borderRadius: 4
      }
    },
    xaxis: {
      categories: categories,
      labels: {
        rotate: -45,
        rotateAlways: true,
        style: {
          colors: "#6B7280",
          fontSize: "11px"
        },
        offsetY: 0,
        maxHeight: 120,
      },
    },
    yaxis: {
      min: 0,
      max: maxY,
      tickAmount: maxY,
      labels: {
        formatter: (val) => Math.round(Number(val)).toString(),
        style: { colors: "#6B7280", fontSize: "12px" },
      },
      title: { text: "Alert Count", style: { color: "#4B5563", fontSize: "12px" } },
      forceNiceScale: false,
    },
    tooltip: {
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const fullName = categories[dataPointIndex]; // ชื่อเต็ม
        const value = w.globals.series[seriesIndex][dataPointIndex];
        return `<div style="padding:5px">${fullName}: ${value} alerts</div>`;
      },
    },
    dataLabels: { enabled: false },
    colors: ["#8979FF"],
    grid: { strokeDashArray: 4, borderColor: "#E5E7EB" },
  };

  const series = [{ name: "Alerts", data: values }];

  return (
    <div className="w-full">
      <h2 className="text-md font-semibold mb-2 text-[var(--color-primary,#111827)]">
        Alert Distribution across Cameras
      </h2>

      {loading && <p className="mb-2 text-xs text-gray-400">Loading camera alerts...</p>}

      <div className="overflow-x-auto">
        <div style={{ minWidth: chartWidth }}>
          <ReactApexChart options={options} series={series} type="bar" height={360} />
        </div>
      </div>
    </div>
  );
}
