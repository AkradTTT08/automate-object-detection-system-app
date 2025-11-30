import AnalyticsView from "@/app/components/Analytics/AnalyticsView";
import TimeBasedAlertDistribution from "@/app/components/Analytics/Chart/TimeBasedAlertDistribution";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
        {/* เรียกใช้ AnalyticsView */}
        <AnalyticsView />
      </div>

      <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
        <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6 mt-6">
          <TimeBasedAlertDistribution />
        </div>
      </div>
    </div>
  );
}