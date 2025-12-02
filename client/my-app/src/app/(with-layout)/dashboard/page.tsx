import EventSeverityChart from '@/app/components/Dashboard/SeverityDistributionChart';
import AlertBarChart from '@/app/components/Dashboard/AlertAcorssCamerasChart';
import CameraAlertView from '@/app/components/Dashboard/CameraAlertView';

type SP = Record<string, string | string[] | undefined>;

export default async function Dashboard({
    searchParams,
}: {
    searchParams: Promise<SP>;
}) {

    const sp = await searchParams;

    const pick = (key: keyof SP) =>
        typeof sp?.[key] === "string" ? (sp[key] as string) : undefined;

    const viewParam = pick("view");
    const q = pick("q") ?? "";
    const status = pick("status") as "Active" | "Inactive" | undefined;
    const location = pick("location");
    const type = pick("type");

    return (
        <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
            <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
                <EventSeverityChart />
            </div>
            <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6 mt-6">
                <AlertBarChart />
            </div>
            <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6 mt-6">
                <CameraAlertView
                    search={q}
                    status={status}
                    location={location}
                    type={type} />
            </div>
        </div>
    );
}