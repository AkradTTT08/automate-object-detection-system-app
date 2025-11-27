import GeneratePDFReports from "@/app/components/Forms/GeneratePDFReports";
export default function Reports() {
    return (
        <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
                <h1 className="text-2xl font-bold">
                    
                    Reports
                    <GeneratePDFReports/>
                    
                    </h1>
            </div>
        </div>
    );
}