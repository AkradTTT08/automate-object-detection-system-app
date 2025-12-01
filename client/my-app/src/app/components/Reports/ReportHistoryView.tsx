"use client";

import React, { useMemo, useState } from "react";
import ReportsCard from "./ReportsCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

/* ---------------- Mock Data (จำลองประวัติการส่งรายงาน) ---------------- */

type ReportStatus = "Success" | "Processing" | "Failed";

interface ReportItem {
  id: number;
  createdAt: string; // "YYYY-MM-DD"
  status: ReportStatus;
}

// ข้อมูลจำลอง
const MOCK_REPORTS: ReportItem[] = [
  { id: 1, createdAt: "2025-11-25", status: "Success" },
  { id: 2, createdAt: "2025-11-26", status: "Success" },
  { id: 3, createdAt: "2025-11-27", status: "Processing" },
  { id: 4, createdAt: "2025-11-27", status: "Failed" },
  { id: 5, createdAt: "2025-11-28", status: "Success" },
  { id: 6, createdAt: "2025-11-28", status: "Failed" },
  { id: 7, createdAt: "2025-11-29", status: "Processing" },
  { id: 8, createdAt: "2025-11-30", status: "Success" },
  { id: 9, createdAt: "2025-11-30", status: "Failed" },
];

export default function ReportHistoryView() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"All Status" | ReportStatus>("All Status");

  const statusOptions: Array<"All Status" | ReportStatus> = [
    "All Status",
    "Success",
    "Processing",
    "Failed",
  ];

  const handleRangeChange = (start: string, end: string) => {
    console.log("Range changed:", { start, end });
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setStatus("All Status");
  };

  const hasAnyFilters = useMemo(
    () => !!(startDate || endDate || status !== "All Status"),
    [startDate, endDate, status]
  );

  /* ------------------------ Filter + Summary จาก mock ----------------------- */
  const {
    totalReports,
    successCount,
    processingCount,
    failedCount,
  } = useMemo(() => {
    let filtered = [...MOCK_REPORTS];

    if (startDate) {
      const s = new Date(startDate);
      filtered = filtered.filter((r) => new Date(r.createdAt) >= s);
    }

    if (endDate) {
      const e = new Date(endDate);
      filtered = filtered.filter((r) => new Date(r.createdAt) <= e);
    }

    if (status !== "All Status") {
      filtered = filtered.filter((r) => r.status === status);
    }

    const total = filtered.length;
    const success = filtered.filter((r) => r.status === "Success").length;
    const processing = filtered.filter((r) => r.status === "Processing").length;
    const failed = filtered.filter((r) => r.status === "Failed").length;

    return {
      totalReports: total,
      successCount: success,
      processingCount: processing,
      failedCount: failed,
    };
  }, [startDate, endDate, status]);

  return (
    <div className="w-full">
      {/* Filter Bar */}
      <div className="w-full bg-white border-b border-gray-100 py-4 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
          {/* Send History Title */}
          <div className="text-[var(--color-primary)] font-bold text-base sm:text-lg">
            Send History
          </div>

          {/* Filters + Reset */}
          <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            {/* Time range + Status (stack บน mobile) */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Time Range */}
              <div className="w-full sm:w-auto">
                <div className="grid grid-cols-[1fr_16px_1fr] items-center gap-2 rounded-md border border-[var(--color-primary)] px-2 py-1.5 w-full">
                  <input
                    type={startDate ? "date" : "text"}
                    value={startDate}
                    onFocus={(e) => (e.currentTarget.type = "date")}
                    onBlur={(e) => {
                      if (!e.currentTarget.value) e.currentTarget.type = "text";
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      setStartDate(value);
                      handleRangeChange(value, endDate);
                    }}
                    className="w-full bg-transparent outline-none text-xs sm:text-sm text-gray-800"
                    placeholder="Start date"
                  />
                  <span className="text-[var(--color-primary)] text-sm text-center">
                    →
                  </span>
                  <input
                    type={endDate ? "date" : "text"}
                    value={endDate}
                    onFocus={(e) => (e.currentTarget.type = "date")}
                    onBlur={(e) => {
                      if (!e.currentTarget.value) e.currentTarget.type = "text";
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEndDate(value);
                      handleRangeChange(startDate, value);
                    }}
                    className="w-full bg-transparent outline-none text-xs sm:text-sm text-gray-800"
                    placeholder="End date"
                  />
                </div>
              </div>

              {/* Status Select (style แบบ AlertFilters.Field) */}
              <div className="grid gap-1 w-full sm:w-auto">
                {/* ถ้าอยากมี label ด้านบนก็ใส่ได้แบบนี้ */}
                {/* <Label className="text-xs text-[var(--color-primary)]">Status</Label> */}
                <Select
                  value={status}
                  onValueChange={(val) =>
                    setStatus(val as "All Status" | ReportStatus)
                  }
                >
                  <SelectTrigger
                    className="w-full rounded-md border border-[var(--color-primary)]
                               text-[var(--color-primary)]
                               focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]
                               px-2 py-1.5 text-xs
                               sm:px-3 sm:py-2 sm:text-sm
                               md:px-3 md:py-2.5 md:text-sm"
                  >
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="border-[var(--color-primary)]">
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reset Filters Button (เต็มจอบน mobile, ด้านขวาบน desktop) */}
            <div className="flex justify-end w-full sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                disabled={!hasAnyFilters}
                className="text-[var(--color-primary)] border border-[var(--color-primary)]
                           px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm
                           w-full sm:w-auto rounded-md
                           hover:bg-[var(--color-primary)] hover:text-[var(--color-white)]
                           disabled:opacity-50 disabled:cursor-not-allowed
                           disabled:hover:bg-transparent disabled:hover:text-[var(--color-primary)]"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 sm:px-6 py-6 bg-gray-50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ReportsCard
            title="Total Reports"
            icon="file-text"
            value={totalReports}
            color="blue"
          />

          <ReportsCard
            title="Success"
            icon="badge-check"
            value={successCount}
            color="green"
          />

          <ReportsCard
            title="Processing"
            icon="loader-circle"
            value={processingCount}
            color="blue"
          />

          <ReportsCard
            title="Failed"
            icon="circle-x"
            value={failedCount}
            color="red"
          />
        </div>
      </div>

      {/* Table or List section can go here */}
    </div>
  );
}