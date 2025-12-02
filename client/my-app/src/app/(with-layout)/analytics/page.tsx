import AnalyticsView from "@/app/components/Analytics/AnalyticsView";
import TimeBasedAlertDistribution from "@/app/components/Analytics/Chart/TimeBasedAlertDistribution";
import AiAccuracyChart from "@/app/components/Analytics/Chart/AiAccuracyChart";

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
