"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

type ChartSeries = {
  name: string;
  data: number[];
}[];

// ✅ dynamic import สำหรับ Next.js (ห้าม SSR)
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export const ALERT_CHART_ID = "alert-report-chart";

const DEFAULT_CHART_OPTIONS: ApexOptions = {
  chart: {
    id: ALERT_CHART_ID,
    toolbar: { show: true },
    zoom: { enabled: false },
  },
  xaxis: {
    categories: [
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
    ],
    title: { text: "Time" },
  },
  yaxis: {
    title: { text: "Alert Count" },
  },
  stroke: {
    curve: "smooth",
    width: 3,
  },
  dataLabels: {
    enabled: false,
  },
};

const DEFAULT_CHART_SERIES: ChartSeries = [
  {
    name: "Alerts",
    data: [5, 3, 4, 10, 22, 35, 40, 38, 30, 18, 10, 6],
  },
];

export type TemplateAlertDocumentProps = {
  title?: string;
  subtitle?: string;
  filters?: {
    rangeLabel?: string;
    locationLabel?: string;
    cameraLabel?: string;
    severityLabel?: string;
  };
  chartOptions?: ApexOptions;
  chartSeries?: ChartSeries;
  className?: string;
};

const TemplateAlertDocument: React.FC<TemplateAlertDocumentProps> = ({
  title = "AODS Alert Trend Report",
  subtitle = "Alert volume by time of day",
  filters,
  chartOptions,
  chartSeries,
  className,
}) => {
  const mergedChartOptions = useMemo<ApexOptions>(() => {
    return {
      ...DEFAULT_CHART_OPTIONS,
      ...(chartOptions || {}),
      chart: {
        ...DEFAULT_CHART_OPTIONS.chart,
        ...(chartOptions?.chart || {}),
        id: ALERT_CHART_ID, // บังคับให้ใช้ id นี้ไว้ให้ ApexCharts.exec
      },
    };
  }, [chartOptions]);

  const mergedChartSeries = useMemo<ChartSeries>(
    () => chartSeries || DEFAULT_CHART_SERIES,
    [chartSeries]
  );

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${
        className ?? ""
      }`}
    >
      {/* Header */}
      <header className="mb-4">
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        )}

        {(filters?.rangeLabel ||
          filters?.locationLabel ||
          filters?.cameraLabel ||
          filters?.severityLabel) && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
            {filters?.rangeLabel && (
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Range: {filters.rangeLabel}
              </span>
            )}
            {filters?.locationLabel && (
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Location: {filters.locationLabel}
              </span>
            )}
            {filters?.cameraLabel && (
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Camera: {filters.cameraLabel}
              </span>
            )}
            {filters?.severityLabel && (
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Severity: {filters.severityLabel}
              </span>
            )}
          </div>
        )}
      </header>

      {/* Chart */}
      <section>
        <ReactApexChart
          options={mergedChartOptions}
          series={mergedChartSeries}
          type="line"
          height={300}
        />
      </section>
    </div>
  );
};

export default TemplateAlertDocument;