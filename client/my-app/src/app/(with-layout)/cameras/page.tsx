import CameraCard, { type Camera } from "../../components/cameraCard";
import * as StatusCard from "../../components/StatusCard";
import CamerasGrid from "../../components/searchCameras";


const base = process.env.NEXT_PUBLIC_APP_URL!;

export default async function CamerasPage() {

  const res = await fetch(`${base}/api/cameras/`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to load cameras");
  }

  const cameras: Camera[] = await res.json();

  return (
    <div className="space-y-6">
      <StatusCard.DashboardSummaryCameraSection></StatusCard.DashboardSummaryCameraSection>
      <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6 ">
        {/* <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6"> */}
        <CamerasGrid cameras={cameras} />
        
      </div>
    </div>
  );
}