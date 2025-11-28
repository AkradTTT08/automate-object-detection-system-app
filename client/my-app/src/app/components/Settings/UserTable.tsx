// app/components/Setting/UserTable.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, KeyRound } from "lucide-react";
import * as Icons from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { SaveConfirmModal } from "@/app/components/Utilities/AlertsPopup";

/* ------------------------------ ROLE COLORS ------------------------------ */
const ROLE_STYLES = {
  admin: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "security team": "bg-sky-50 text-sky-700 ring-sky-200",
  staff: "bg-orange-50 text-orange-700 ring-orange-200",
  system: "bg-violet-50 text-violet-700 ring-violet-200",
  default: "bg-slate-50 text-slate-700 ring-slate-200",
} as const;

function RoleBadge({ value }: { value?: string }) {
  const key = (value ?? "").trim().toLowerCase() as keyof typeof ROLE_STYLES;
  const pill = ROLE_STYLES[key] ?? ROLE_STYLES.default;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${pill}`}
    >
      <span className="capitalize">{value ?? "Unknown"}</span>
    </span>
  );
}

/* ----------------------------- ICON BUTTON -------------------------------- */
function IconAction({
  label,
  children,
  variant = "primary",
  onClick,
  className = "",
}) {
  const palette =
    variant === "danger"
      ? {
        border: "border-red-500",
        text: "text-red-500",
        hoverBg: "hover:bg-red-500",
        focusRing: "focus:ring-red-500",
      }
      : variant === "info"
        ? {
          border: "border-sky-500",
          text: "text-sky-500",
          hoverBg: "hover:bg-sky-500",
          focusRing: "focus:ring-sky-500",
        }
        : variant === "success"
          ? {
            border: "border-emerald-500",
            text: "text-emerald-500",
            hoverBg: "hover:bg-emerald-500",
            focusRing: "focus:ring-emerald-500",
          }
          : {
            border: "border-blue-500",
            text: "text-blue-500",
            hoverBg: "hover:bg-blue-500",
            focusRing: "focus:ring-blue-500",
          };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            aria-label={label}
            className={[
              "inline-flex items-center justify-center h-8 w-8 rounded-full border",
              palette.border,
              palette.text,
              palette.hoverBg,
              "hover:text-white hover:border-transparent",
              "transition focus:outline-none focus:ring-2 focus:ring-offset-2",
              palette.focusRing,
              className,
            ].join(" ")}
          >
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ------------------------------- TYPES ------------------------------- */
export type User = {
  usr_id: number;
  usr_username: string;
  usr_email: string;
  usr_role: string;
  usr_name: string;
  usr_phone: string;
};

type SortKey = "usr_id" | "usr_username" | "usr_email" | "usr_role" | "usr_name" | "usr_phone";
type SortOrder = "asc" | "desc" | null;

/* -------------------------------------------------------------------------- */
/*                                MAIN TABLE                                  */
/* -------------------------------------------------------------------------- */
export default function UserTable({ users }: { users: User[] }) {
  const [rows, setRows] = useState<User[]>(users);
  useEffect(() => setRows(users), [users]);

  const PAGE_SIZE = 25;
  const [page, setPage] = useState(1);

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

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

  const sortedUsers = useMemo(() => {
    if (!sortKey || !sortOrder) return rows;

    return [...rows].sort((a, b) => {
      const A = (a as any)[sortKey];
      const B = (b as any)[sortKey];

      if (A < B) return sortOrder === "asc" ? -1 : 1;
      if (A > B) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, sortOrder]);

  const total = sortedUsers.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);

  const pagedUsers = sortedUsers.slice(start, end);

  /* ----------------------------- RESET PASSWORD ----------------------------- */

  // popup state
  const [usrId, setResetUserId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // default password from env
  const defaultPassword = process.env.NEXT_PUBLIC_DEFAULT_PASSWORD;

  // reset password logic
  const handleConfirmReset = async () => {
    if (!usrId) return;

    try {
      const res = await fetch(`/api/users/${usrId}/password`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: defaultPassword }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(json?.message || "Failed to reset password.");
        return;
      }

      alert("Password has been reset.");
    } catch (err) {
      alert("Error resetting password.");
    } finally {
      setConfirmOpen(false);
      setResetUserId(null);
    }
  };

  /* ----------------------------- ACTIONS ----------------------------- */
  const onResetPassword = (id: number) => {
    setResetUserId(id);
    setConfirmOpen(true);
  };

  const onEdit = (id: number) => console.log("Edit user:", id);
  const onDelete = (id: number) => console.log("Delete user:", id);

  return (
    <div className="w-full">
      <Table className="table-auto w-full">
        <TableHeader>
          <TableRow className="border-b border-[var(--color-primary)]">
            {[
              { key: "usr_id", label: "User ID" },
              { key: "usr_name", label: "Name" },
              { key: "usr_role", label: "Role" },
              { key: "usr_username", label: "Username" },
              { key: "usr_email", label: "Email" },
              { key: "usr_phone", label: "Phone" },
            ].map(({ key, label }) => (
              <TableHead
                key={key}
                onClick={() => handleSort(key as SortKey)}
                className="cursor-pointer select-none text-[var(--color-primary)]"
              >
                <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                  <span>{label}</span>
                  <Icons.ArrowUpDown className="w-4 h-4 ml-1 inline-block" />
                </div>
              </TableHead>
            ))}

            <TableHead className="text-[var(--color-primary)]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {pagedUsers.map((usr) => (
            <TableRow key={usr.usr_id}>
              <TableCell>{`USR${String(usr.usr_id).padStart(4, "0")}`}</TableCell>
              <TableCell>{usr.usr_name || "-"}</TableCell>
              <TableCell><RoleBadge value={usr.usr_role || "-"} /></TableCell>
              <TableCell>{usr.usr_username || "-"}</TableCell>
              <TableCell>{usr.usr_email || "-"}</TableCell>
              <TableCell>{usr.usr_phone || "-"}</TableCell>
              
              <TableCell className="whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <IconAction
                    label="Reset Password"
                    variant="primary"
                    onClick={() => onResetPassword(usr.usr_id)}
                  >
                    <KeyRound className="w-4 h-4" />
                  </IconAction>

                  <IconAction
                    label="Edit"
                    variant="primary"
                    onClick={() => onEdit(usr.usr_id)}
                  >
                    <Pencil className="w-4 h-4" />
                  </IconAction>

                  <IconAction
                    label="Delete"
                    variant="danger"
                    onClick={() => onDelete(usr.usr_id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </IconAction>
                </div>
              </TableCell>
            </TableRow>
          ))}
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
            className={`px-3 py-1 rounded-md border text-sm ${page <= 1
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
            className={`px-3 py-1 rounded-md border text-sm ${page >= totalPages
                ? "text-gray-400 border-gray-200"
                : "text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* reset-password confirmation modal */}
      <SaveConfirmModal
        title="Reset Password"
        description="Do you want to reset this user's password to the default?"
        confirmText="Reset"
        cancelText="Cancel"
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmReset}
      />
    </div>
  );
}
