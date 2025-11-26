"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

/* ========================= Types ========================= */

interface ApiAlertItem {
  severity: string;
  alert_id: number;
  created_at: string;
  camera_id: number;
  camera_name: string;
  event_icon: string;
  event_name: string;
  location_name: string;
  alert_status: string;
  alert_description: string | null;
  alert_reason: string | null;
  footage_id: number;
  footage_path: string;
  created_by: string;
}

interface Props {
  alerts?: ApiAlertItem[];
}

/* ========================= Mock Data ========================= */

const MOCK_CAMERAS = [
  { name: "Gate Entrance Cam 01", alerts: 5 },
  { name: "Lobby Cam 01", alerts: 3 },
  { name: "Parking Cam 01", alerts: 7 },
];

/* ========================= Component ========================= */

export default function CameraAlertsBarChart({ alerts }: Props) {
  const [categories, setCategories] = useState<string[]>([]);
  const [values, setValues] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // group alerts by camera
  const buildFromAlerts = (data: ApiAlertItem[], allowFallback = true) => {
    const cameraMap = new Map<number, { name: string; count: number }>();

    for (const alert of data) {
      const camId = alert.camera_id;
      const camName = alert.camera_name || `Camera #${camId}`;

      const exist = cameraMap.get(camId);
      if (exist) {
        exist.count += 1;
      } else {
        cameraMap.set(camId, { name: camName, count: 1 });
      }
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
    // ถ้ามี alerts ส่งเข้ามา → ใช้ props ไม่ต้อง fetch
    if (alerts && alerts.length > 0) {
      buildFromAlerts(alerts);
      setLoading(false);
      return;
    }

    // ถ้าไม่มี → fetch API
    const fetchCameras = async () => {
      try {
        const res = await fetch("/api/cameras");

        if (!res.ok) {
          setCategories(MOCK_CAMERAS.map((c) => c.name));
          setValues(MOCK_CAMERAS.map((c) => c.alerts));
          return;
        }

        const json = await res.json();
        const data: ApiAlertItem[] = Array.isArray(json)
          ? json
          : Array.isArray(json?.data)
          ? json.data
          : [];

        if (!data.length) {
          setCategories(MOCK_CAMERAS.map((c) => c.name));
          setValues(MOCK_CAMERAS.map((c) => c.alerts));
          return;
        }

        buildFromAlerts(data);
      } catch (err) {
        setCategories(MOCK_CAMERAS.map((c) => c.name));
        setValues(MOCK_CAMERAS.map((c) => c.alerts));
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, [alerts]);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 360,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    xaxis: {
      categories,
      labels: {
        rotate: 0,
        trim: true,
        maxHeight: 60,
        style: {
          colors: "#6B7280",
          fontSize: "12px",
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      min: 0,
      max: 80,
      tickAmount: 4,
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
      title: {
        text: "Alert Count",
        style: {
          color: "#4B5563",
          fontSize: "12px",
        },
      },
    },
    dataLabels: { enabled: false },
    tooltip: {
      y: { formatter: (val) => `${val} alerts` },
    },
    colors: ["#3B82F6"],
    grid: {
      strokeDashArray: 4,
      borderColor: "#E5E7EB",
    },
  };

  const series = [
    {
      name: "Alerts",
      data: values,
    },
  ];

  return (
    <div className="w-full">
      <h2 className="text-md font-semibold mb-2 text-[var(--color-primary,#111827)]">
        Alert Distribution Across Cameras
      </h2>

      {loading && (
        <p className="mb-2 text-xs text-gray-400">Loading camera alerts...</p>
      )}

      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={360}
      />
    </div>
  );
}