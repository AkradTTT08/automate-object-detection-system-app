import AnalyticsView from "@/app/components/Analytics/AnalyticsView";
export default function Analytics() {
    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
            {/* เรียกใช้ AnalyticsView */}
                <AnalyticsView />
        </div>
        
        
    );
}