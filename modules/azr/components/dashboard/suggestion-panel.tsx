export function SuggestionPanel() {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-neutral-900">Suggestions</h2>
      <p className="mt-2 text-xs text-neutral-500">
        Suggestions are advisory only and do not grant approval rights.
      </p>
      <ul className="mt-3 space-y-2 text-xs text-neutral-600">
        <li>• Verify receipts against the ledger.</li>
        <li>• Check the target environment scope.</li>
        <li>• Ensure rollback plan is documented.</li>
      </ul>
    </section>
  );
}
