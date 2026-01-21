import Link from "next/link";

export default function LuminaDashboardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">Lumina Dashboard</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Public viewing area. No approval or decision actions are available here.
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        <Link href="/lumina/reports" className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Reports</h2>
          <p className="mt-2 text-xs text-neutral-500">Read-only summaries and receipts.</p>
        </Link>
        <Link href="/lumina/compliance" className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Compliance</h2>
          <p className="mt-2 text-xs text-neutral-500">Policies and constraints overview.</p>
        </Link>
      </section>
    </div>
  );
}
