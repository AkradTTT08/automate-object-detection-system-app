"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Eye, CheckCircle2, XCircle, MapPin,
  ArrowUpDown, ArrowUp, ArrowDown
} from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideProps } from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import RefreshAlertsButton from "@/app/components/Utilities/RefreshAlertsButton";
import { Separator } from "@/components/ui/separator";

type SortKey =
  | "report"
  | "recipient"
  | "frequency"
  | "format"
  | "nextSchedule"
  | "status";

type SortOrder = "asc" | "desc" | null;

export default function Scheduled() {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // const sortedAlerts = useMemo(() => {
  //   const data = rows;
  //   if (!sortKey || !sortOrder) return data;
  //   return [...data].sort((a, b) => {
  //     const A = getComparable(a, sortKey);
  //     const B = getComparable(b, sortKey);
  //     if (A < B) return sortOrder === "asc" ? -1 : 1;
  //     if (A > B) return sortOrder === "asc" ? 1 : -1;
  //     return 0;
  //   });
  // }, [rows, sortKey, sortOrder]);

  const renderSortIcon = (key: SortKey) => {
      if (sortKey !== key || !sortOrder) return <ArrowUpDown className="w-4 h-4 ml-1 inline-block" />;
      if (sortOrder === "asc") return <ArrowUp className="w-4 h-4 ml-1 inline-block" />;
      if (sortOrder === "desc") return <ArrowDown className="w-4 h-4 ml-1 inline-block" />;
  };

  const handleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortOrder("asc");
    } else {
      if (sortOrder === "asc") setSortOrder("desc");
      else if (sortOrder === "desc") setSortOrder(null);
      else setSortOrder("asc");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start gap-3 justify-center mb-3">
      <label
        htmlFor="scheduledReports"
        className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)]"
      >
        Scheduled Reports
      </label>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
        GENERATE BUTTON!
      </div>

      <Separator className="bg-[var(--color-primary-bg)] my-2" />

      <Table className="table-auto w-full">
        <TableHeader>
          <TableRow className="border-b border-[var(--color-primary)]">
            {[
              { key: "report", label: "Report" },
              { key: "recipient", label: "Recipient" },
              { key: "frequency", label: "Frequency" },
              { key: "format", label: "Format" },
              { key: "nextSchedule", label: "Next Schedule" },
              { key: "status", label: "Status" },
            ].map(({ key, label }) => (
              <TableHead
                key={key}
                onClick={() => handleSort(key as SortKey)}
                className="cursor-pointer select-none text-[var(--color-primary)]"
              >
                <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                  <span>{label}</span>
                  {renderSortIcon(key as SortKey)}
                </div>
              </TableHead>
            ))}
            <TableHead className="text-[var(--color-primary)]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow>
            <TableCell>
              Report
            </TableCell>

            <TableCell>
              Recipient
            </TableCell>

            <TableCell>
              Frequency
            </TableCell>

            <TableCell>
              Format
            </TableCell>

            <TableCell>
              Next Schedule
            </TableCell>

            <TableCell>
              Status
            </TableCell>

            <TableCell>
              Actions
            </TableCell>
          </TableRow>

        </TableBody>
      </Table>
    </div>

  )
}