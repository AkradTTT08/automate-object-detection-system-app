import TimeBasedAlertDistribution from "@/app/components/Analytics/Chart/TimeBasedAlertDistribution";

export default function Analytics() {
  return (
    <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
        <h1 className="text-2xl font-bold mb-4">Analytics</h1>

        <TimeBasedAlertDistribution />
      </div>
    </div>
  );
}
