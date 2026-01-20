import { ReportList } from "@/modules/lumina/components/report/report-list";

export default function LuminaReportsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">Reports</h1>
        <p className="mt-2 text-sm text-neutral-600">Read-only report summaries.</p>
      </header>
      <ReportList />
    </div>
  );
}
