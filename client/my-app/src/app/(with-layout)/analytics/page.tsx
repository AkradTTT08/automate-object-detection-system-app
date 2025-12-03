import AnalyticsView from "@/components/features/analytics/AnalyticsView";
import TimeBasedAlertDistribution from "@/components/features/analytics/chart/TimeBasedAlertDistribution";
import AiAccuracyChart from "@/components/features/analytics/chart/AiAccuracyChart";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
        <AnalyticsView />
      </div>

  
      <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
        <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6 mt-6">
          <TimeBasedAlertDistribution />
        </div>
      </div>

     
      <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
        <AiAccuracyChart />
      </div>
    </div>
  );
}
