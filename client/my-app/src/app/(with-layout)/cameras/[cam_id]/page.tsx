import FullScreenView from "@/app/components/Cameras/FullScreenView";
import { Camera } from "@/app/models/cameras.model";

// สำหรับ Server Component: ใช้ SERVER_API_URL ใน Docker หรือ NEXT_PUBLIC_APP_URL ใน local
function getServerApiBase(): string {
  return process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://server:8066';
}

export default async function Page({ params }: { params: Promise<{ cam_id: string }> }) {
  const { cam_id } = await params;
  const apiBase = getServerApiBase();

  let camera: Camera | null = null;
  
  try {
    const res = await fetch(`${apiBase}/api/cameras/${cam_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error(`[Camera View] Failed to load camera ${cam_id}: ${res.status} - ${errorText}`);
      throw new Error(`Failed to load camera: ${res.status}`);
    }

    const json = await res.json();
    camera = json.data || json; // รองรับทั้ง { data: ... } และ object โดยตรง
    
    if (!camera) {
      throw new Error("Camera data not found");
    }
  } catch (error: any) {
    console.error(`[Camera View] Error loading camera ${cam_id}:`, error?.message || error);
    return (
      <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold">Failed to load camera</p>
          <p className="text-sm mt-2">{error?.message || "Unknown error occurred"}</p>
          <a 
            href="/cameras" 
            className="text-[var(--color-primary)] hover:underline mt-4 inline-block"
          >
            ← Back to Cameras
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
        <FullScreenView camera={camera} />
      </div>
    </div>
  );
}