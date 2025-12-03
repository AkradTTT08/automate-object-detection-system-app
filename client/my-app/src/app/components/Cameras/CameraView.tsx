import { Camera } from "@/app/models/cameras.model";
import CameraTable from "./CameraTable";
import CameraGrid from "./CameraGrid";
import {
  CameraSummaryProvider,
  DashboardSummaryCameraSection,
} from "../../components/Utilities/CameraSummaryProvider";
import ToggleViewButton from "@/app/components/Cameras/ToggleViewButton";
import CreateCameraForm from "@/app/components/Forms/CreateCameraForm";
import { Separator } from "@/components/ui/separator";
import RefreshButton from "@/app/components/Utilities/RefreshCamerasButton";

type ViewMode = "grid" | "list";

/**
 * Helper function to get API base URL for Server Components
 * ใน Docker container: ใช้ service name 'server' แทน localhost
 * ใน local development: ใช้ NEXT_PUBLIC_APP_URL หรือ localhost
 */
function getServerApiBase(): string {
  // Server Component ใน Next.js จะรันบน server-side เท่านั้น
  // ใช้ SERVER_API_URL สำหรับ Docker internal network หรือ NEXT_PUBLIC_APP_URL สำหรับ local
  return process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://server:8066';
}

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
  viewMode,
  search,
  status,
  location,
  type,
}: {
  viewMode: ViewMode;
  search?: string;
  status?: "Active" | "Inactive";
  location?: string;
  type?: string;
}) {
  // Server Component: ใช้ SERVER_API_URL สำหรับ internal Docker network
  const apiBase = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://server:8066';
  
  let cameras: Camera[] = [];
  try {
    const url = `${apiBase}/api/cameras`;
    console.log(`[CameraView] Fetching from: ${url}`);
    
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Server Component ไม่ต้องใช้ credentials เพราะรันบน server-side
      cache: "no-store",
    });
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error(`[CameraView] API error: ${res.status} - ${errorText}`);
      throw new Error(`Failed to load cameras: ${res.status}`);
    }
    
    const json = await res.json();
    cameras = Array.isArray(json.data) ? json.data : [];
    console.log(`[CameraView] Loaded ${cameras.length} cameras`);
  } catch (error: any) {
    console.error(`[CameraView] Fetch error:`, error?.message || error);
    console.error(`[CameraView] Error details:`, error);
    // Return empty array to prevent page crash
    cameras = [];
  }

  console.log(`[CameraView] Total cameras loaded: ${cameras.length}`);
  console.log(`[CameraView] Search query: "${search}"`);
  console.log(`[CameraView] Status filter: ${status}`);
  console.log(`[CameraView] Location filter: ${location}`);
  console.log(`[CameraView] Type filter: ${type}`);

  // 1) ค้นหา
  const match = buildMatcher(search);
  let filtered = cameras.filter(match);
  console.log(`[CameraView] After search filter: ${filtered.length} cameras`);

  // 2) กรองสถานะ
  if (status === "Active" || status === "Inactive") {
    const want = status === "Active";
    filtered = filtered.filter((c) => c.camera_status === want);
    console.log(`[CameraView] After status filter (${status}): ${filtered.length} cameras`);
  }

  // 3) กรอง location
  if (location && location !== "All") {
    const needle = location.toLowerCase();
    filtered = filtered.filter((c) =>
      (c.location_name ?? "").toLowerCase().includes(needle)
    );
    console.log(`[CameraView] After location filter (${location}): ${filtered.length} cameras`);
  }

  // 4) กรอง type
  if (type && type !== "All") {
    const t = type.toLowerCase();
    filtered = filtered.filter((c) =>
      (c.camera_type ?? "").toLowerCase().includes(t)
    );
    console.log(`[CameraView] After type filter (${type}): ${filtered.length} cameras`);
  }

  // ✅ 5) นับ "สรุปหลังกรอง"
  const total = filtered.length;
  console.log(`[CameraView] Final filtered count: ${total} cameras`);
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
      {/* === Summary Section (แทน <StatusCard.DashboardSummaryCameraSection /> เดิม) === */}
      <CameraSummaryProvider initial={summaryInitial}>
        <DashboardSummaryCameraSection />
      </CameraSummaryProvider>

      {/* === Camera Management Card (ย้าย layout จาก page มาไว้ในนี้) === */}
      <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start gap-3 justify-center mb-3">
          <label
            htmlFor="cameraName"
            className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)]"
          >
            Camera Management
          </label>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
            <ToggleViewButton />
            <CreateCameraForm />
            <RefreshButton />
          </div>
        </div>

        <Separator className="bg-[var(--color-primary-bg)] my-3" />

        {viewMode === "grid" ? (
          <CameraGrid cameras={filtered} />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
            <CameraTable cameras={filtered} />
          </div>
        )}
      </div>
    </div>
  );
}