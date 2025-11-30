"use client";

import React, { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import ReportsCard from "./ReportsCard";

export default function ReportHistoryView() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("All Status");
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const statusOptions = [
    "All Status",
    "Success",
    "Processing",
    "Failed",
  ];

  const handleRangeChange = (
    start: string,
    end: string
  ) => {
    setStartDate(start);
    setEndDate(end);
    console.log("Range changed:", {start, end });
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setStatus("All Status");
  };

  return (
    <div className="w-full">
      {/* Filter Bar */}
      <div className="w-full bg-white border-b border-gray-200 py-4 px-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Send History Title */}
          <div className="text-blue-500 font-semibold text-lg">
            Send History
          </div>

          {/* Right Side Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Range Label */}
            <span className="text-gray-700 text-sm font-medium">Range</span>

            {/* Date Range Inputs */}
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm text-gray-500 outline-none w-32"
                placeholder="Start Date"
              />
              <span className="text-gray-400">→</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm text-gray-500 outline-none w-32"
                placeholder="End Date"
              />
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="flex items-center justify-between gap-8 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors min-w-40"
              >
                <span>{status}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {isStatusOpen && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {statusOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setStatus(option);
                        setIsStatusOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Filters Button */}
            <button
              onClick={handleReset}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm px-5 py-2 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-6 bg-gray-50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ReportsCard
            title="Total Reports"
            icon="file-text"
            value="8"
            color="blue"
          />

          <ReportsCard
            title="Success"
            icon="badge-check"
            value="8"
            color="green"
          />

          <ReportsCard
            title="Processing"
            icon="loader-circle"
            value="3"
            color="blue"
          />

          <ReportsCard
            title="Failed"
            icon="circle-x"
            value="5"
            color="red"
          />
        </div>
      </div>

      {/* Table or List section can go here */}
    </div>
  );
}