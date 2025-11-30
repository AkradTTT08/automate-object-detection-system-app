// app/reports/alert-preview/page.tsx (ตัวอย่าง)
import AlertDocumentPreview from "@/app/components/PDF/AlertDocumentPreview";

export default function AlertPreviewPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <AlertDocumentPreview />
    </main>
  );
}
