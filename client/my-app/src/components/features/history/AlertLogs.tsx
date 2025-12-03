/**
 * Page: Alert Logs
 *
 * Purpose:
 *  แสดงประวัติการทำงานที่เกี่ยวข้องกับ Alert (Alert Activity Logs)
 *  เช่น การสร้างการแจ้งเตือน และการเปลี่ยนสถานะการแจ้งเตือน
 *
 * Responsibilities:
 *  - ดึงข้อมูล alert logs จาก API
 *  - รองรับการเรียงลำดับ (sorting) ตามคอลัมน์ต่าง ๆ
 *  - แสดงข้อมูลแบบแบ่งหน้า (pagination)
 *
 * Main Columns:
 *  - Log ID
 *  - Action (CREATE_ALERT / UPDATE_STATUS / ...)
 *  - Alert (รหัสการแจ้งเตือน ALTxxx)
 *  - User (ผู้ใช้งานและสิทธิ์)
 *  - Timestamp (วันที่และเวลาที่ทำรายการ)
 *
 * UI Behavior:
 *  - แสดงสถานะ Loading / Error / Empty state
 *  - คลิกหัวคอลัมน์เพื่อเปลี่ยนลำดับการเรียง (asc / desc / none)
 *  - แสดงรหัส Alert ในรูปแบบ ALTxxx เพื่อให้อ่านง่าย
 *
 * Dependencies:
 *  - shadcn/ui → Table components
 *  - lucide-react → Icons (Clock3, ArrowUpDown / ArrowUp / ArrowDown)
 *  - UserBadge, ActionBadge → แสดง badge สำหรับผู้ใช้และ action
 *
 * Notes:
 *  - การดึงข้อมูลจัดการฝั่ง client ผ่าน fetch("/api/logs/alert")
 *  - โครงสร้างหน้าคล้ายกับ Camera Logs เพื่อความสม่ำเสมอ
 *
 * Author: Wanasart
 * Created: 2025-12-02
 * Updated: 2025-12-02
 */
"use client";

import { useEffect, useMemo, useState } from "react";

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
  Clock3,
} from "lucide-react";

import UserBadge from "@/components/badges/UserBadge";
import { ActionBadge } from "../../badges/ActionBadge";

/* ============================== TYPES ===================================== */

type AlertLog = {
  log_id: number;
  user_id: number;
  user_username: string;
  role: string;
  alert_id: number;
  log_action: string;      // "CREATE_ALERT" | "UPDATE_STATUS" | ...
  log_created_at: string;  // "YYYY-MM-DD HH:mm:ss"
};

type SortKey = "id" | "user" | "alert" | "action" | "timestamp";
type SortOrder = "asc" | "desc" | null;

type SortState = {
  key: SortKey | null;
  order: SortOrder;
};

const PAGE_SIZE = 10;

/* ============================ HELPERS ===================================== */

/**
 * แปลงค่า log ให้กลายเป็นค่า primitive ที่ใช้สำหรับเปรียบเทียบเวลา sort
 */
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
    case "timestamp": {
      // "2025-11-26 16:19:54" -> "2025-11-26T16:19:54" -> timestamp
      const isoString = log.log_created_at?.replace(" ", "T");
      return new Date(isoString).getTime();
    }
    default:
      return 0;
  }
}

/**
 * แสดง icon บอกสถานะการ sort ในแต่ละคอลัมน์
 */
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
    return <ArrowUpDown className="ml-1 inline-block h-4 w-4" />;
  }
  if (sortOrder === "asc") {
    return <ArrowUp className="ml-1 inline-block h-4 w-4" />;
  }
  return <ArrowDown className="ml-1 inline-block h-4 w-4" />;
}

/**
 * แปลง timestamp ให้อยู่ในรูปแบบ "YYYY-MM-DD HH:mm:ss"
 * ถ้า format ไม่ถูกต้อง จะ fallback เป็นค่าเดิม
 */
function formatTimestamp(raw: string) {
  if (!raw) return "-";
  const [datePart, timePart] = raw.split(" ");
  if (!timePart) return raw;
  return `${datePart} ${timePart}`;
}

/* =============================== PAGE ===================================== */

export default function AlertLogs() {
  const [logs, setLogs] = useState<AlertLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortState, setSortState] = useState<SortState>({
    key: "timestamp",
    order: "desc",
  });

  const [page, setPage] = useState(1);

  /* -------------------------- FETCH LOGS ---------------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function fetchLogs() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/logs/alert", {
          method: "GET",
          cache: "no-store",
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
      } catch (e: unknown) {
        if (!cancelled) {
          const message =
            e instanceof Error ? e.message : "Unable to load logs";
          setError(message);
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

  /* -------------------------- SORTING ------------------------------------- */

  // reset page เมื่อ sort หรือจำนวน log เปลี่ยน
  useEffect(() => {
    setPage(1);
  }, [sortState.key, sortState.order, logs.length]);

  const handleSort = (key: SortKey) => {
    setSortState((prev) => {
      // เปลี่ยนคอลัมน์ใหม่ → เริ่ม asc
      if (prev.key !== key) {
        return { key, order: "asc" };
      }

      // วนลูป: asc → desc → null → asc
      if (prev.order === "asc") return { key, order: "desc" };
      if (prev.order === "desc") return { key, order: null };
      return { key, order: "asc" };
    });
  };

  const sortedLogs = useMemo(() => {
    const { key, order } = sortState;
    if (!key || !order) return logs;

    return [...logs].sort((a, b) => {
      const A = getComparable(a, key);
      const B = getComparable(b, key);

      if (A < B) return order === "asc" ? -1 : 1;
      if (A > B) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [logs, sortState]);

  /* ------------------------ PAGINATION ------------------------------------ */

  const total = sortedLogs.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const pageItems = sortedLogs.slice(start, end);

  /* ------------------------ STATES (loading / error / empty) -------------- */

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        Loading alert logs…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-rose-600">
        Error: {error}
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="text-sm text-gray-500">
        No alert logs to display.
      </div>
    );
  }

  /* ----------------------------- RENDER ----------------------------------- */

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
      <div className="w-full">
        <Table className="w-full table-auto text-black">
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
                  className="w-1/5 cursor-pointer select-none text-[var(--color-primary,#1f2937)]"
                >
                  <div className="flex w-full items-center justify-between gap-2 pr-3">
                    <span>{label}</span>
                    <SortIcon
                      sortKey={sortState.key}
                      sortOrder={sortState.order}
                      columnKey={key as SortKey}
                    />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageItems.map((log) => {
              const logCode = `LOA${String(log.log_id).padStart(3, "0")}`;
              const alertCode = `ALT${String(log.alert_id).padStart(3, "0")}`;
              const formattedTimestamp = formatTimestamp(log.log_created_at);

              return (
                <TableRow key={log.log_id}>
                  {/* Log ID */}
                  <TableCell>{logCode}</TableCell>

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
                        {alertCode}
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
                        {formattedTimestamp}
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
            Showing{" "}
            <span className="font-medium">{start + 1}</span>
            –
            <span className="font-medium">{end}</span>
            {" "}of{" "}
            <span className="font-medium">{total}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={`rounded-md border px-3 py-1 text-sm ${
                page <= 1
                  ? "border-gray-200 text-gray-400"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>

            <div className="text-sm tabular-nums">
              {page} / {totalPages}
            </div>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={`rounded-md border px-3 py-1 text-sm ${
                page >= totalPages
                  ? "border-gray-200 text-gray-400"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
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