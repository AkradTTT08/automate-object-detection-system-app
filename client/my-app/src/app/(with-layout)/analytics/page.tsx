import TimeBasedAlertDistribution from "@/app/components/Analytics/Chart/TimeBasedAlertDistribution";

export default function Analytics() {
  return (
    <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
      <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6 mt-6">
        <TimeBasedAlertDistribution />
      </div>
    </div>
  );
}
