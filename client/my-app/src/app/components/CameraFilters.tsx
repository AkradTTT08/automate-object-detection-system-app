"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type LocationItem =
    | { id?: number | string; name?: string; location?: string }
    | string;

function useQueryParam() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    function setParam(key: string, value?: string | null) {
        const params = new URLSearchParams(searchParams.toString());
        if (!value || value === "All") {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }

    return { searchParams, setParam };
}

function Field({
    label,
    placeholder,
    value,
    onChange,
    children,
}: {
    label: string;
    placeholder: string;
    value?: string | null;
    onChange: (val: string) => void;
    children: React.ReactNode;
}) {
    return (
        <div className="grid gap-1 w-full">
            {label ? (
                <Label className="text-xs text-[var(--color-primary)]">{label}</Label>
            ) : null}
            <Select value={value ?? "All"} onValueChange={onChange}>
                <SelectTrigger
                    className="
              w-full rounded-md border border-[var(--color-primary)]
              text-[var(--color-primary)]
              focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]
              px-2 py-1.5 text-xs
              sm:px-3 sm:py-2 sm:text-sm
              md:px-3 md:py-2.5 md:text-sm
            "
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="border-[var(--color-primary)]">
                    {children}
                </SelectContent>
            </Select>
        </div>
    );
}

export default function CameraFilters({
    typeOptions,
}: {
    /** รายการชนิดกล้อง ถ้าไม่ส่ง จะใช้ค่าเริ่มต้น */
    typeOptions?: string[];
}) {
    const { searchParams, setParam } = useQueryParam();

    // STATUS: ใช้ "Active" | "Inactive" เป็นค่าจริงใน URL
    const statusValue = (() => {
        const v = searchParams.get("status");
        return v === "Active" || v === "Inactive" ? v : null;
    })();

    // LOCATION: fetch จาก /api/location
    const [locations, setLocations] = useState<LocationItem[]>([]);
    const [locErr, setLocErr] = useState<string>("");
    const [locLoading, setLocLoading] = useState<boolean>(false);
    const locationValue = searchParams.get("location");

    useEffect(() => {
        let mounted = true;
        setLocLoading(true);
        fetch("/api/cameras/location", { cache: "no-store" })
            .then((r) => r.json())
            .then((data: LocationItem[]) => {
                if (!mounted) return;
                setLocations(Array.isArray(data) ? data : []);
            })
            .catch((e) => {
                if (!mounted) return;
                setLocErr(e?.message || "Failed to load locations");
            })
            .finally(() => mounted && setLocLoading(false));
        return () => {
            mounted = false;
        };
    }, []);

    // map เป็นชื่อ location (label) และ dedupe
    const locationOptions = useMemo(() => {
        const labels = locations
            .map((it) =>
                typeof it === "string"
                    ? it
                    : it?.name ?? it?.location ?? String(it?.id ?? "")
            )
            .filter(Boolean)
            .map(String);
        return Array.from(new Set(labels));
    }, [locations]);

    // TYPE
    const typeValue = searchParams.get("type");
    const typeOpts =
        typeOptions && typeOptions.length > 0
            ? typeOptions
            : ["Fixed", "PTZ", "Panoramic", "Thermal"];

    return (
        // ใหม่: Grid ล้วน
        <div className="grid gap-2 min-[420px]:grid-cols-2 sm:grid-cols-3 w-full">
            {/* Status */}
            <Field
                label=""
                placeholder="All status"
                value={statusValue}
                onChange={(v) => setParam("status", v === "All" ? null : v)}
            >
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
            </Field>

            {/* Location */}
            <Field
                label=""
                placeholder="All locations"
                value={locationValue}
                onChange={(v) => setParam("location", v)}
            >
                <SelectItem value="All">All Locations</SelectItem>
                {locLoading ? (
                    <SelectItem value="__loading" disabled>Loading…</SelectItem>
                ) : locErr ? (
                    <SelectItem value="__error" disabled>Failed to load</SelectItem>
                ) : (
                    locationOptions.map((loc) => (
                        <SelectItem key={loc} value={loc.toLowerCase()}>
                            {loc}
                        </SelectItem>
                    ))
                )}
            </Field>

            {/* Type */}
            <Field
                label=""
                placeholder="All types"
                value={typeValue}
                onChange={(v) => setParam("type", v)}
            >
                <SelectItem value="All">All Types</SelectItem>
                {typeOpts.map((t) => (
                    <SelectItem key={t} value={t.toLowerCase()}>
                        {t}
                    </SelectItem>
                ))}
            </Field>
        </div>
    );
}