// app/components/Setting/UserFilters.tsx
"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

//useQueryParam อ่านและอัพเดต query parameter ใน URL ของหน้า user management
function useQueryParam() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function setParam(key: string, value?: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "All") params.delete(key);
    else params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function setMany(obj: Record<string, string | null | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(obj)) {
      if (!v) params.delete(k);
      else params.set(k, v);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return { searchParams, setParam, setMany };
}

// Component: UserFilters
export default function UserFilters() {
  const { searchParams, setParam, setMany } = useQueryParam();
  const roleValue = searchParams.get("role");

  const roles = ["admin", "staff", "security team", "system"];
  const hasAny = !!roleValue;

  return (
    <div className="max-w-150 mb-3 grid grid-cols-[1fr_auto] gap-2 items-center">
      
      {/* Dropdown เลือก role */}
      <div className="grid gap-1 w-full">
        <Select value={roleValue ?? "All"} onValueChange={(v) => setParam("role", v === "All" ? null : v)}>
          <SelectTrigger
            className="w-full rounded-md border border-[var(--color-primary)]
                       text-[var(--color-primary)]
                       focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]
                       px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm"
          >
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent className="border-[var(--color-primary)]">
            <SelectItem value="All">All Roles</SelectItem>
            {roles.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reset Filters */}
      <Button
        type="button"
        variant="ghost"
        className="text-[var(--color-primary)] border border-[var(--color-primary)]
                   px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm
                   hover:bg-[var(--color-primary)] hover:text-[var(--color-white)]"
        disabled={!hasAny}
        onClick={() => setMany({ role: null })}
      >
        Reset Filters
      </Button>
    </div>
  );
}
