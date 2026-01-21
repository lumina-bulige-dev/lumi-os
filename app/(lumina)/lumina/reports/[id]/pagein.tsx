import { notFound } from "next/navigation";
import { ReportDetailView } from "@/modules/lumina/components/report/report-detail";
import { getReportById } from "@/modules/lumina/lib/store";

export default function LuminaReportDetailPage({ params }: { params: { id: string } }) {
  const report = getReportById(params.id);
  if (!report) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <ReportDetailView report={report} />
    </div>
  );
}
