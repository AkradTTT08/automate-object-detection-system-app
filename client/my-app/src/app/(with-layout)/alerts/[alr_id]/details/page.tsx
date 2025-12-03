import { Alert } from "@/app/models/alerts.model";
import AlertDetails from '@/components/features/alerts/details/AlertDetails'
import { fetchWithAuth } from "@/lib/fetchWithAuth";

const base = process.env.NEXT_PUBLIC_APP_URL!;

export default async function Page({ params }: { params: Promise<{ alr_id: string }> }) {
    const { alr_id } = await params

    const json = await fetchWithAuth<{ data: Alert }>(`/api/alerts/${alr_id}`);
    const alert: Alert = json.data;

    return (
        <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
                <AlertDetails alert={alert} />
            </div>
        </div>
    )
}