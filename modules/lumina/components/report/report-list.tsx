import Link from "next/link";

export type ReportSummary = {
  id: string;
  title: string;
  updatedAt: string;
};

const sampleReports: ReportSummary[] = [
  { id: "rep_001", title: "Quarterly integrity report", updatedAt: "2026-01-20" },
  { id: "rep_002", title: "Policy checkpoint log", updatedAt: "2026-01-18" },
];

export function ReportList() {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-neutral-900">Reports</h2>
      <ul className="mt-3 space-y-2 text-xs text-neutral-600">
        {sampleReports.map((report) => (
          <li key={report.id} className="flex items-center justify-between">
            <Link href={`/lumina/reports/${report.id}`} className="underline">
              {report.title}
            </Link>
            <span className="text-neutral-400">{report.updatedAt}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
