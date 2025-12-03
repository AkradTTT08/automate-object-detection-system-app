import { Camera } from "@/app/models/cameras.model";
import CameraDetails from '@/app/components/Cameras/Details/CameraDetails'

// สำหรับ Server Component: ใช้ SERVER_API_URL ใน Docker หรือ NEXT_PUBLIC_APP_URL ใน local
const base = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://server:8066';

export default async function Page({ params }: { params: Promise<{ cam_id: string }> }) {
    const { cam_id } = await params

    const res = await fetch(`${base}/api/cameras/${cam_id}`, { cache: "no-store" });
    if (!res.ok) {
        throw new Error("Failed to load cameras");
    }

    const json = await res.json();
    const camera: Camera = json.data[0];

    return (
        <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
                <CameraDetails camera={camera} />
            </div>
        </div>
    )
}