export function WorkflowVisualizer() {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-neutral-900">Decision Flow</h2>
      <p className="mt-2 text-xs text-neutral-500">
        AZR highlights the decision path and keeps the final approval in human hands.
      </p>
      <ol className="mt-3 space-y-2 text-xs text-neutral-600">
        <li>1. Receive request</li>
        <li>2. Review evidence</li>
        <li>3. Decide and record</li>
      </ol>
    </section>
  );
}
