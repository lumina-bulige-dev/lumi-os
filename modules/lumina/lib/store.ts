import { ReportDetail } from "./types";

export const reportStore: ReportDetail[] = [
  {
    id: "rep_001",
    title: "Quarterly integrity report",
    summary: "Read-only snapshot of proof receipts and audit notes.",
  },
  {
    id: "rep_002",
    title: "Policy checkpoint log",
    summary: "Summary of manual review milestones and outcomes.",
  },
];

export function getReportById(id: string): ReportDetail | undefined {
  return reportStore.find((report) => report.id === id);
}
