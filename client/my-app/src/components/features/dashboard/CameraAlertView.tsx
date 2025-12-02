import { Camera } from "@/app/models/cameras.model";
import CameraAlertTable from "./CameraAlertTable";
import { Separator } from "@/components/ui/separator";
import RefreshButton from "@/components/utilities/RefreshCamerasButton";
import SearchCamerasInput from "@/components/features/cameras/SearchCamerasInput";
import CameraFilters from "@/components/features/cameras/CameraFilters";

type ViewMode = "grid" | "list";
const base = process.env.NEXT_PUBLIC_APP_URL!;

/* ------------------------- Search matcher -------------------------- */
function buildMatcher(search?: string) {
    const q = (search ?? "").trim().toLowerCase();
    if (!q) return (_c: Camera) => true;

    const tokens = q.split(/\s+/);
    const checks: Array<(c: Camera) => boolean> = [];

    for (const t of tokens) {
        const m = t.match(/^(id|name|location):(.*)$/i);
        if (m) {
            const key = m[1].toLowerCase();
            const val = m[2].trim().toLowerCase();
            if (!val) continue;

            if (key === "id") {
                checks.push((c) => String(c.camera_id).toLowerCase().includes(val));
            } else if (key === "name") {
                checks.push((c) => (c.camera_name ?? "").toLowerCase().includes(val));
            } else if (key === "location") {
                checks.push((c) => (c.location_name ?? "").toLowerCase().includes(val));
            }
        } else {
            const val = t.toLowerCase();
            checks.push((c) => {
                const idStr = String(c.camera_id).toLowerCase();
                const nm = (c.camera_name ?? "").toLowerCase();
                const loc = (c.location_name ?? "").toLowerCase();
                return idStr.includes(val) || nm.includes(val) || loc.includes(val);
            });
        }
    }
    return (c: Camera) => checks.every((fn) => fn(c));
}

export default async function CameraView({
    search,
    status,
    location,
    type,
}: {
    search?: string;
    status?: "Active" | "Inactive";
    location?: string;
    type?: string;
}) {
    const res = await fetch(`${base}/api/cameras`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to load cameras");
    const json = await res.json();
    const cameras: Camera[] = Array.isArray(json.data) ? json.data : [];

    // 1) ค้นหา
    const match = buildMatcher(search);
    let filtered = cameras.filter(match);

    // 2) กรองสถานะ
    if (status === "Active" || status === "Inactive") {
        const want = status === "Active";
        filtered = filtered.filter((c) => c.camera_status === want);
    }

    // 3) กรอง location
    if (location && location !== "All") {
        const needle = location.toLowerCase();
        filtered = filtered.filter((c) =>
            (c.location_name ?? "").toLowerCase().includes(needle)
        );
    }

    // 4) กรอง type
    if (type && type !== "All") {
        const t = type.toLowerCase();
        filtered = filtered.filter((c) =>
            (c.camera_type ?? "").toLowerCase().includes(t)
        );
    }

    // ✅ 5) นับ “สรุปหลังกรอง”
    const total = filtered.length;
    const active = filtered.reduce((n, c) => n + (c.camera_status ? 1 : 0), 0);
    const inactive = total - active;

    // ปรับตาม schema จริงของคุณ
    const repair = filtered.filter((c) => {
        const t = (c.maintenance_type ?? "").toLowerCase();
        return t.includes("repair"); // หรือ t === "repair"
    }).length;

    const summaryInitial = { total, active, inactive, repair };

    // ✅ 6) เรนเดอร์ 'CameraSummary' (แทนที่ของเดิม) + การ์ด Camera Management + ตาราง/กริด
    return (
        <div className="space-y-6">

            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start gap-3 justify-center mb-3">
                <label
                    htmlFor="cameraName"
                    className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)]"
                >
                    Camera Alert
                </label>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
                    <RefreshButton />
                </div>
            </div>

            <Separator className="bg-[var(--color-primary-bg)] my-3" />
            <div className="grid gap-6">
                <div className="grid gap-2 items-start sm:gap-3 mt-3">
                    <div className="w-full">
                        <SearchCamerasInput />
                    </div>
                    <div className="w-full">
                        <CameraFilters />
                    </div>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
                    <CameraAlertTable cameras={filtered} />
                </div>
            </div>
        </div>
    );
}