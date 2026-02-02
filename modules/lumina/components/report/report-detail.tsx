import { ReportDetail } from "../../lib/types";

export function ReportDetailView({ report }: { report: ReportDetail }) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-neutral-900">{report.title}</h2>
      <p className="mt-2 text-xs text-neutral-500">Report ID: {report.id}</p>
      <div className="mt-3 text-xs text-neutral-600">{report.summary}</div>
    </section>
  );
}
