import EventSeverityChart from '@/app/components/Dashboard/SeverityDistributionChart';

export default function Dashboard() {
    return (
        <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
            <EventSeverityChart />
        </div>
    );
}