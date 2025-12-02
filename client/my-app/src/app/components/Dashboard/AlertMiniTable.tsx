"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { MapPin } from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideProps } from "lucide-react";
import { SeverityBadge } from "../Alerts/AlertTable";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

/* --------------------- Data type --------------------- */
export type Alert = {
    alert_id: number;
    severity: string;
    created_at: string;
    event_name: string;
    event_icon?: string;
    camera_name: string;
    location_name: string;
    alert_status: string;
};

/* ---------------------- Sort types ---------------------- */
type SortKey = keyof Alert | null;
type SortOrder = "asc" | "desc" | null;

/* ---------------------- Component ---------------------- */
interface AlertMiniTableProps {
    cameraName: string;
}

export default function AlertMiniTable({ cameraName }: AlertMiniTableProps) {
    const [rows, setRows] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>(null);
    const [page, setPage] = useState(1);

    const PAGE_SIZE = 5; // จำนวน row ต่อหน้า

    async function fetchAlerts() {
        try {
            setError("");
            setLoading(true);
            const res = await fetch("/api/alerts");
            if (!res.ok) throw new Error("Failed to fetch alerts");
            const data = await res.json();
            const alerts: Alert[] = data.data.filter((a: Alert) => a.camera_name === cameraName);
            setRows(alerts);
        } catch (err: any) {
            setError(err.message || "Error fetching alerts");
        } finally {
            setLoading(false);
        }
    }

    function iconFromName(name?: string) {
        if (!name) return Icons.Bell;
        const pascal = name
            .toString()
            .replace(/[^a-zA-Z0-9]+/g, " ")
            .trim()
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join("");
        return ((Icons as any)[pascal] ?? Icons.Bell) as React.ComponentType<LucideProps>;
    }

    useEffect(() => {
        fetchAlerts();
        setPage(1); // reset page ถ้า cameraName เปลี่ยน
    }, [cameraName]);

    const handleSort = (key: SortKey) => {
        if (sortKey !== key) {
            setSortKey(key);
            setSortOrder("asc");
        } else {
            if (sortOrder === "asc") setSortOrder("desc");
            else if (sortOrder === "desc") setSortOrder(null);
            else setSortOrder("asc");
        }
        setPage(1); // reset page เวลา sort
    };

    // Sort rows
    const sortedRows = useMemo(() => {
        if (!sortKey || !sortOrder) return rows;
        return [...rows].sort((a, b) => {
            let valA: any = a[sortKey as keyof Alert];
            let valB: any = b[sortKey as keyof Alert];

            if (sortKey === "created_at") {
                valA = new Date(valA).getTime();
                valB = new Date(valB).getTime();
            }

            if (typeof valA === "string") valA = valA.toLowerCase();
            if (typeof valB === "string") valB = valB.toLowerCase();

            if (valA < valB) return sortOrder === "asc" ? -1 : 1;
            if (valA > valB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }, [rows, sortKey, sortOrder]);

    // Pagination slice
    const total = sortedRows.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const start = (page - 1) * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, total);
    const pagedRows = sortedRows.slice(start, end);

    const renderSortIcon = (key: SortKey) => {
        if (sortKey !== key || !sortOrder) return <ArrowUpDown className="w-4 h-4 ml-1 inline-block" />;
        if (sortOrder === "asc") return <ArrowUp className="w-4 h-4 ml-1 inline-block" />;
        return <ArrowDown className="w-4 h-4 ml-1 inline-block" />;
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!rows.length) return <p className="text-gray-500">No alerts for {cameraName}</p>;

    return (
        <div className="col-span-full w-full">
            <div className="max-h-[320px] overflow-y-auto rounded-md">
                <Table className="table-auto w-full">
                    <TableHeader>
                        <TableRow className="border-b border-[var(--color-primary)]">
                            <TableHead onClick={() => handleSort("severity")} className="cursor-pointer select-none text-[var(--color-primary)]">
                                <div className="flex items-center gap-1">
                                    Severity {renderSortIcon("severity")}
                                </div>
                            </TableHead>
                            <TableHead onClick={() => handleSort("alert_id")} className="cursor-pointer select-none text-[var(--color-primary)]">
                                <div className="flex items-center gap-1">
                                    Alert ID {renderSortIcon("alert_id")}
                                </div>
                            </TableHead>
                            <TableHead onClick={() => handleSort("created_at")} className="cursor-pointer select-none text-[var(--color-primary)]">
                                <div className="flex items-center gap-1">
                                    Timestamp {renderSortIcon("created_at")}
                                </div>
                            </TableHead>
                            <TableHead onClick={() => handleSort("event_name")} className="cursor-pointer select-none text-[var(--color-primary)]">
                                <div className="flex items-center gap-1">
                                    Event Type {renderSortIcon("event_name")}
                                </div>
                            </TableHead>
                            <TableHead onClick={() => handleSort("location_name")} className="cursor-pointer select-none text-[var(--color-primary)]">
                                <div className="flex items-center gap-1">
                                    Location {renderSortIcon("location_name")}
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {pagedRows.map((alr) => {
                            const alrCode = `ALR${String(alr.alert_id).padStart(3, "0")}`;
                            const timestamp = new Date(alr.created_at).toLocaleString();
                            const EventIcon = iconFromName(alr.event_icon);

                            return (
                                <TableRow key={alr.alert_id}>
                                    <TableCell><SeverityBadge value={alr.severity} /></TableCell>
                                    <TableCell>{alrCode}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Icons.Clock3 className="w-4 h-4 text-[var(--color-primary)]" />
                                            {timestamp}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <EventIcon className="w-4 h-4 text-[var(--color-primary)]" />
                                            {alr.event_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                                            {alr.location_name}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>

                {/* Pagination bar */}
                <div className="mt-3 flex items-center justify-between px-2">
                    <div className="text-xs text-gray-500">
                        Showing <span className="font-medium">{start + 1}</span>–<span className="font-medium">{end}</span> of <span className="font-medium">{total}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className={`px-3 py-1 rounded-md border text-sm ${page <= 1 ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                        >
                            Previous
                        </button>
                        <div className="text-sm tabular-nums">{page} / {totalPages}</div>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className={`px-3 py-1 rounded-md border text-sm ${page >= totalPages ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
