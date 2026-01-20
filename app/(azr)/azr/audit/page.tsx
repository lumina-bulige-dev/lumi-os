import { Shell } from "@/components/layout/shell";
import { Topbar } from "@/components/layout/topbar";
import { auditTrailSeed } from "@/modules/azr/lib/store";

export default function AzrAuditPage() {
  return (
    <Shell>
      <Topbar title="Audit" />
      <div className="p-6">
        <section className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Audit Trail</h2>
          <ul className="mt-3 space-y-2 text-xs text-neutral-600">
            {auditTrailSeed.map((event) => (
              <li key={`${event.name}-${event.occurredAt}`} className="space-y-1">
                <div className="font-medium text-neutral-800">{event.name}</div>
                <div className="text-neutral-500">{event.occurredAt}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Shell>
  );
}
