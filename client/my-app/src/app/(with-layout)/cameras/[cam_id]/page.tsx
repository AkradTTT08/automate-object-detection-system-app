import FullScreenView from "@/components/features/cameras/FullScreenView";
import { Camera } from "@/app/models/cameras.model";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export default async function Page({ params }: { params: Promise<{ cam_id: string }> }) {
  const { cam_id } = await params

  const json = await fetchWithAuth<{ data: Camera }>(`/api/cameras/${cam_id}`);
  const camera: Camera = json.data;

  console.log(camera);

  return (
    <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
        <FullScreenView camera={camera}/>
      </div>
    </div>
  )
}