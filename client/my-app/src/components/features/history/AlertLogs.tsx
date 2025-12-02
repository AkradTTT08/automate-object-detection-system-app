// app/logs/alert/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Activity,
  Clock3,
} from "lucide-react";

import UserBadge from "@/components/badges/UserBadge";
import { ActionBadge } from "../../badges/ActionBadge";

type AlertLog = {
  log_id: number;
  user_id: number;
  user_username: string;
  role: string;
  alert_id: number;
  log_action: string; // "CREATE_ALERT" | "UPDATE_STATUS" | ...
  log_created_at: string; // "YYYY-MM-DD HH:mm:ss"
};

/* -------------------------------- SORTING --------------------------------- */

type SortKey = "id" | "user" | "alert" | "action" | "timestamp";
type SortOrder = "asc" | "desc" | null;

function getComparable(log: AlertLog, key: SortKey) {
  switch (key) {
    case "id":
      return log.log_id;
    case "user":
      return log.user_id;
    case "alert":
      return log.alert_id;
    case "action":
      return (log.log_action ?? "").toLowerCase();
    case "timestamp":
      // "2025-11-26 16:19:54" -> Date
      return new Date(log.log_created_at.replace(" ", "T")).getTime();
    default:
      return 0;
  }
}

function SortIcon({
  sortKey,
  sortOrder,
  columnKey,
}: {
  sortKey: SortKey | null;
  sortOrder: SortOrder;
  columnKey: SortKey;
}) {
  if (sortKey !== columnKey || !sortOrder) {
    return <ArrowUpDown className="w-4 h-4 ml-1 inline-block" />;
  }
  if (sortOrder === "asc") {
    return <ArrowUp className="w-4 h-4 ml-1 inline-block" />;
  }
  return <ArrowDown className="w-4 h-4 ml-1 inline-block" />;
}

/* --------------------------------- PAGE ----------------------------------- */

export default function AlertLogs() {
  const router = useRouter();

  const [logs, setLogs] = useState<AlertLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey | null>("timestamp");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const PAGE_SIZE = 25;
  const [page, setPage] = useState(1);

  // Fetch logs จาก API
  useEffect(() => {
    let cancelled = false;

    async function fetchLogs() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/logs/alert", {
          credentials: "include",
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json?.message || "Failed to fetch alert logs");
        }

        const json = await res.json();
        const data = Array.isArray(json?.data) ? json.data : [];
        if (!cancelled) {
          setLogs(data);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Unable to load logs");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchLogs();
    return () => {
      cancelled = true;
    };
  }, []);

  // reset page เวลาเปลี่ยน sort
  useEffect(() => {
    setPage(1);
  }, [sortKey, sortOrder, logs.length]);

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

  const sortedLogs = useMemo(() => {
    if (!sortKey || !sortOrder) return logs;
    return [...logs].sort((a, b) => {
      const A = getComparable(a, sortKey);
      const B = getComparable(b, sortKey);
      if (A < B) return sortOrder === "asc" ? -1 : 1;
      if (A > B) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [logs, sortKey, sortOrder]);

  const total = sortedLogs.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const pageItems = sortedLogs.slice(start, end);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading alert logs…</div>;
  }

  if (error) {
    return <div className="text-sm text-rose-600">Error: {error}</div>;
  }

  if (!logs.length) {
    return (
      <div className="text-sm text-gray-500">
        No alert logs to display.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-primary,#1f2937)]">
            Alert Logs
          </h1>
          <p className="text-xs text-gray-500">
            Showing audit logs for alert actions (create / status updates)
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="col-span-full w-full">
        <Table className="table-auto w-full text-black">
          <TableHeader>
            <TableRow className="border-b border-[var(--color-primary,#1f2937)]">
              {[
                { key: "id", label: "Log ID" },
                { key: "action", label: "Action" },
                { key: "alert", label: "Alert" },
                { key: "user", label: "User" },
                { key: "timestamp", label: "Timestamp" },
              ].map(({ key, label }) => (
                <TableHead
                  key={key}
                  onClick={() => handleSort(key as SortKey)}
                  className="cursor-pointer select-none text-[var(--color-primary,#1f2937)]"
                >
                  <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary,#1f2937)] w-full">
                    <span>{label}</span>
                    <SortIcon
                      sortKey={sortKey}
                      sortOrder={sortOrder}
                      columnKey={key as SortKey}
                    />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageItems.map((log) => {
              const code = `LOA${String(log.log_id).padStart(3, "0")}`;
              const [datePart, timePart] = (log.log_created_at ?? "").split(" ");

              return (
                <TableRow key={log.log_id}>
                  {/* Log ID */}
                  <TableCell>{code}</TableCell>

                  {/* Action */}
                  <TableCell>
                    <ActionBadge action={log.log_action} />
                  </TableCell>

                  {/* Alert */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <span
                          className="
                            inline-flex items-center gap-1 
                            rounded-full px-2 py-0.5
                            text-xs font-mono
                            ring-1 ring-inset
                            bg-orange-50 text-orange-700 ring-orange-200
                          "
                        >
                          ALT{String(log.alert_id).padStart(3, "0")}
                        </span>
                    </div>
                  </TableCell>

                  {/* User */}
                  <TableCell>
                    <UserBadge
                      username={log.user_username}
                      role={log.role}
                    />
                  </TableCell>

                  {/* Timestamp */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-[var(--color-primary,#1f2937)]" />
                      <span className="text-sm">
                        {datePart} {timePart}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Pagination bar */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Showing <span className="font-medium">{start + 1}</span>–
            <span className="font-medium">{end}</span> of{" "}
            <span className="font-medium">{total}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={`px-3 py-1 rounded-md border text-sm ${
                page <= 1
                  ? "text-gray-400 border-gray-200"
                  : "text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <div className="text-sm tabular-nums">
              {page} / {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={`px-3 py-1 rounded-md border text-sm ${
                page >= totalPages
                  ? "text-gray-400 border-gray-200"
                  : "text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
