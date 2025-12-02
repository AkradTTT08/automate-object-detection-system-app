// app/components/Setting/UserManagements.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import UserTable, { type UserRow } from "./UserTable";
import SearchUsersInput from "./SearchUsersInput";
import UserFilters from "./UserFilters";

/* --------------------------- API response types --------------------------- */
type ApiUser = {
  usr_id: number;
  usr_username: string;
  usr_email: string;
  usr_role?: string;
  usr_name?: string;
  usr_phone?: string;
  created_at?: string;
};

type ApiResponse = {
  message: string;
  data: ApiUser[];
};

/* ------------------------------- utilities -------------------------------- */
function normalizeToTableUser(u: ApiUser): UserRow {
  return {
    usr_id: u.usr_id,
    usr_username: u.usr_username,
    usr_email: u.usr_email,
    usr_role: u.usr_role ?? "-",
    usr_name: u.usr_name ?? "-",
    usr_phone: u.usr_phone ?? "-",
  };
}

/* --------------------------------- view ----------------------------------- */
export default function UserManagements() {
  const searchParams = useSearchParams();

  // state สำหรับเก็บข้อมูล users, loading และ error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [reloadTick, setReloadTick] = useState(0);

  // ฟังก์ชันเรียก fetch ใหม่ (increment reloadTick)
  const refetch = useCallback(() => setReloadTick((x) => x + 1), []);

  // === Fetch users ===
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/users/", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: ac.signal,
        });

        if (!res.ok) throw new Error(`Failed to load users (${res.status})`);
        const json: ApiResponse = await res.json();

        setUsers((json.data ?? []).map(normalizeToTableUser));
      } catch (e: any) {
        if (e?.name !== "AbortError") setError(e?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [reloadTick]);

  // === URL params for filtering ===
  const q = searchParams.get("q")?.toLowerCase() ?? "";
  const roleParam = searchParams.get("role")?.toLowerCase() ?? "";

  // === Filtering users ตาม search และ role ===
  const filtered = useMemo(() => {
    const tokens = q.split(/\s+/).filter(Boolean);

    return users.filter((u) => {
      if (roleParam && u.usr_role.toLowerCase() !== roleParam) return false;

      if (tokens.length) {
        const blob = `${u.usr_id} ${u.usr_username} ${u.usr_email} ${u.usr_role} ${u.usr_name} ${u.usr_phone}`.toLowerCase();
        for (const t of tokens) if (!blob.includes(t)) return false;
      }

      return true;
    });
  }, [users, q, roleParam]);

  if (loading) return <div className="text-sm text-gray-500">Loading users…</div>;
  if (error)
    return <div className="text-red-600 text-sm">Error: {error}</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between mb-3">
        <label className="font-bold text-lg text-[var(--color-primary)]">User Management</label>
      </div>

      {/* Search และ Filters */}
      <div className="mb-3 flex flex-col gap-2">
        <SearchUsersInput />
        <UserFilters />
      </div>
      
      {/* ตารางผู้ใช้ */}
      <UserTable users={filtered} />
    </div>
  
  );
}
