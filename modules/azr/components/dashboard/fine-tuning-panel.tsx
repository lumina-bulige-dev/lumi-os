export function FineTuningPanel() {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-neutral-900">Runbook Checklist</h2>
      <p className="mt-2 text-xs text-neutral-500">
        Confirm manual checks before approving.
      </p>
      <ul className="mt-3 space-y-2 text-xs text-neutral-600">
        <li>• Evidence captured</li>
        <li>• Audit notes prepared</li>
        <li>• Rollback window confirmed</li>
      </ul>
    </section>
  );
}
