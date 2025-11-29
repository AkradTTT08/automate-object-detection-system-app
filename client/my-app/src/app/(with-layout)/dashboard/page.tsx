import EventSeverityChart from '@/app/components/Dashboard/SeverityDistributionChart';
import AlertBarChart from '@/app/components/Dashboard/AlertAcorssCamerasChart';

export default function Dashboard() {
    return (
        <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
            <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
                <EventSeverityChart />
            </div>
            <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6 mt-6">
                <AlertBarChart />
            </div>
        </div>
    );
}