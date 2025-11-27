"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import AnalyticsCard from "./AnalyticsCard";
import AnalyticsRangeSelector, { RangeType } from "./AnalyticsRangeSelector";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

/* ============================================
   FORMAT DATE
============================================ */
function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ============================================
   RANGE (ใช้ได้ทั้งใน refresh และ selector)
============================================ */
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

function getRangeDates(range: RangeType) {
  const now = new Date();
  const from = new Date(now);

  if (range === "week") from.setDate(now.getDate() - 7);
  else if (range === "month") from.setMonth(now.getMonth() - 1);
  else if (range === "year") from.setFullYear(now.getFullYear() - 1);

  return { from, to: now };
}

/* ============================================
   SUMMARY
============================================ */
function summarizeAnalytics(alerts: any[], cameras: any[], from: Date, to: Date) {
  const totalAlerts = alerts.length;
  const resolved = alerts.filter((a) => a.status === "resolved").length;
  const dismissed = alerts.filter((a) => a.status === "dismissed").length;

  const eventResolutionRate =
    totalAlerts === 0 ? 0 : ((resolved + dismissed) / totalAlerts) * 100;

  const activeCameras = cameras.filter((cam) => {
    const createdAt = new Date(cam.camera_created_at).getTime();
    return cam.camera_is_use && cam.camera_status && createdAt <= to.getTime();
  }).length;

  const alertRate =
    totalAlerts === 0 ? 0 : (activeCameras / totalAlerts) * 100;

  return {
    totalAlerts,
    resolved,
    dismissed,
    activeCameras,
    alertRate,
    eventResolutionRate,
    aiAccuracy: 95.45,
  };
}

/* ============================================
   MAIN COMPONENT
============================================ */
const AnalyticsView: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [cameras, setCameras] = useState<any[]>([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [range, setRange] = useState<RangeType>("week");

  // 🔥 ใช้ trigger การโหลดข้อมูลใหม่
  const [reloadTick, setReloadTick] = useState(0);
  const refetch = useCallback(() => setReloadTick((x) => x + 1), []);

  const { from, to } = getRangeDates(range);

  /* Load Alerts + Cameras */
  useEffect(() => {
    const load = async () => {
      const resAlerts = await fetch("/api/alerts").then((r) => r.json());
      const resCameras = await fetch("/api/cameras/analytics").then((r) => r.json());

      setAlerts(resAlerts.data || []);
      setCameras(resCameras.data || []);
    };

    load();
  }, [reloadTick]);

  /* Filter Alerts */
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const t = new Date(a.created_at).getTime();

      // ถ้าเลือกวันที่ → ใช้วันที่
      if (startDate && endDate) {
        const s = new Date(startDate + "T00:00:00").getTime();
        const e = new Date(endDate + "T23:59:59").getTime();
        return t >= s && t <= e;
      }

      // ถ้าไม่เลือกวันที่ → ใช้ range
      return t >= from.getTime() && t <= to.getTime();
    });
  }, [alerts, startDate, endDate, from, to]);

  const summary = useMemo(() => {
    if (!cameras.length) return null;
    return summarizeAnalytics(filteredAlerts, cameras, from, to);
  }, [filteredAlerts, cameras, from, to]);

  if (!summary) return <div>Loading analytics…</div>;

  /* ============================================
     REFRESH
  ============================================ */
  const handleRefreshFilter = () => {
    const { start, end } = computeRange("week");

    setStartDate(start);   // ⭐ ตั้งวันที่ย้อนหลัง 7 วัน
    setEndDate(end);       // ⭐ วันนี้
    setRange("week");      // ⭐ ตั้งช่วงเป็นสัปดาห์
    refetch();             // ⭐ โหลดข้อมูลใหม่
  };

  /* ============================================
     UI
  ============================================ */
  return (
    <div className="space-y-6">
      {/* FILTER BAR */}
      <div className="rounded-lg bg-white shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto flex-1">
          
          {/* DATE RANGE INPUT */}
          <div className="grid grid-cols-[1fr_16px_1fr] items-center gap-2 rounded-md border border-[var(--color-primary)] px-2 py-1.5 w-full sm:w-auto min-w-[220px] sm:min-w-[260px]">
            <input
              type={startDate ? "date" : "text"}
              value={startDate}
              onFocus={(e) => (e.currentTarget.type = "date")}
              onBlur={(e) => {
                if (!e.currentTarget.value) e.currentTarget.type = "text";
              }}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-transparent outline-none text-xs sm:text-sm"
              placeholder="Start date"
            />

            <span className="text-[var(--color-primary)] text-sm text-center">→</span>

            <input
              type={endDate ? "date" : "text"}
              value={endDate}
              onFocus={(e) => (e.currentTarget.type = "date")}
              onBlur={(e) => {
                if (!e.currentTarget.value) e.currentTarget.type = "text";
              }}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-transparent outline-none text-xs sm:text-sm"
              placeholder="End date"
            />
          </div>

          {/* RANGE SELECTOR */}
          <AnalyticsRangeSelector
            range={range}
            onChange={(newRange, start, end) => {
              setRange(newRange);
              setStartDate(start);
              setEndDate(end);
            }}
          />
        </div>

        {/* REFRESH BTN */}
        <Button
          type="button"
          variant="ghost"
          onClick={handleRefreshFilter}
          className="text-[var(--color-primary)]
          border border-[var(--color-primary)]
          px-3 py-2 text-sm
          hover:bg-[var(--color-primary)] hover:text-white 
          flex items-center justify-center gap-2
          w-full sm:w-auto
          order-last sm:order-none"
        >
          <RotateCcw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard title="Total Alerts" icon="alert-triangle" color="red" value={summary.totalAlerts} subtitleLeft="Alerts" />

        <AnalyticsCard
          title="Alert Rate"
          icon="gauge"
          color="orange"
          value={summary.alertRate.toFixed(2) + "%"}
          subtitleLeft={`Cameras: ${summary.activeCameras}`}
          subtitleRight={`Alert: ${summary.totalAlerts}`}
        />

        <AnalyticsCard
          title="AI Accuracy"
          icon="check-circle"
          color="yellow"
          value={`${summary.aiAccuracy}%`}
          subtitleLeft="AI Alert: 100"
          subtitleRight="Correct: 95"
        />

        <AnalyticsCard
          title="Event Resolution Rate"
          icon="shield-check"
          color="green"
          value={summary.eventResolutionRate.toFixed(2) + "%"}
          subtitleLeft={`Alert: ${summary.totalAlerts}`}
          subtitleRight={`Closed: ${summary.resolved + summary.dismissed}`}
        />
      </div>
    </div>
  );
};

export default AnalyticsView;
