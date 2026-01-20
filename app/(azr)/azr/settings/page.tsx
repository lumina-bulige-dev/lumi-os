import { Shell } from "@/components/layout/shell";
import { Topbar } from "@/components/layout/topbar";

export default function AzrSettingsPage() {
  return (
    <Shell>
      <Topbar title="Settings" />
      <div className="p-6">
        <section className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Access Controls</h2>
          <p className="mt-2 text-xs text-neutral-500">
            Configure human-only access. Automated approval is not available.
          </p>
          <ul className="mt-3 space-y-2 text-xs text-neutral-600">
            <li>• Require operator header for Decision APIs.</li>
            <li>• Use Cloudflare Access for admin UI in production.</li>
          </ul>
        </section>
      </div>
    </Shell>
  );
}
