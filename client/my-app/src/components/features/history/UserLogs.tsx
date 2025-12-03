/**
 * Page: User Logs
 *
 * Purpose:
 *  แสดงประวัติกิจกรรมที่เกี่ยวข้องกับผู้ใช้งาน (User Activity Logs)
 *  เช่น การเข้าใช้งาน (LOGIN), ออกจากระบบ (LOGOUT) หรือเหตุการณ์อื่น ๆ
 *
 * Responsibilities:
 *  - ดึงข้อมูล user logs จาก API
 *  - รองรับการเรียงลำดับ (sorting) ตามคอลัมน์ต่าง ๆ
 *  - แสดงข้อมูลแบบแบ่งหน้า (pagination)
 *
 * Main Columns:
 *  - Log ID
 *  - Action (LOGIN / LOGOUT / REGISTER / ...)
 *  - User (ชื่อผู้ใช้ + สิทธิ์)
 *  - Timestamp (วันที่และเวลาที่ทำรายการ)
 *
 * UI Behavior:
 *  - แสดงสถานะ Loading / Error / Empty state
 *  - คลิกหัวคอลัมน์เพื่อเปลี่ยนลำดับการเรียง (asc / desc / none)
 *
 * Dependencies:
 *  - shadcn/ui → Table components
 *  - lucide-react → Icons (Clock3, ArrowUpDown / ArrowUp / ArrowDown)
 *  - UserBadge, ActionBadge → แสดง badge สำหรับผู้ใช้และ action
 *
 * Notes:
 *  - โครงสร้างหน้าสอดคล้องกับ Camera Logs และ Alert Logs เพื่อความสม่ำเสมอ
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

type UserLog = {
  log_id: number;
  user_id: number;
  user_username: string;
  role: string;
  log_action: string;      // LOGIN | LOGOUT | REGISTER | ...
  log_created_at: string;  // "YYYY-MM-DD HH:mm:ss"
};

type SortKey = "id" | "user" | "action" | "timestamp";
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
function getComparable(log: UserLog, key: SortKey) {
  switch (key) {
    case "id":
      return log.log_id;
    case "user":
      return log.user_id;
    case "action":
      return (log.log_action ?? "").toLowerCase();
    case "timestamp": {
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

export default function UserLogs() {
  const [logs, setLogs] = useState<UserLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortState, setSortState] = useState<SortState>({
    key: "timestamp",
    order: "desc",
  });

  const [page, setPage] = useState(1);

  /* ------------------------------ Fetch ----------------------------------- */
  useEffect(() => {
    let cancelled = false;

    async function fetchLogs() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/logs/user", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json?.message || "Failed to fetch user logs");
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

  /* ---------------------------- Sorting Logic ------------------------------ */

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

  /* ------------------------ Pagination ------------------------------------ */

  const total = sortedLogs.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const pageItems = sortedLogs.slice(start, end);

  /* ---------------------------- Render States ------------------------------ */

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        Loading user logs…
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
        No user logs to display.
      </div>
    );
  }

  /* ------------------------------ Render UI -------------------------------- */

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-primary,#1f2937)]">
            User Logs
          </h1>
          <p className="text-xs text-gray-500">
            Showing login/logout activities performed by users.
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
                { key: "user", label: "User" },
                { key: "timestamp", label: "Timestamp" },
              ].map(({ key, label }) => (
                <TableHead
                  key={key}
                  onClick={() => handleSort(key as SortKey)}
                  className="w-1/4 cursor-pointer select-none text-[var(--color-primary,#1f2937)]"
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
              const logCode = `AAL${String(log.log_id).padStart(3, "0")}`;
              const formattedTimestamp = formatTimestamp(log.log_created_at);

              return (
                <TableRow key={log.log_id}>
                  {/* Log ID */}
                  <TableCell>{logCode}</TableCell>

                  {/* Action */}
                  <TableCell>
                    <ActionBadge action={log.log_action} />
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

        {/* Pagination */}
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