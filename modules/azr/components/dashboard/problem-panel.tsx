export function ProblemPanel() {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-neutral-900">Open Risks</h2>
      <p className="mt-2 text-xs text-neutral-500">
        Track unresolved issues before recording a decision.
      </p>
      <div className="mt-3 text-xs text-neutral-600">No open risks recorded.</div>
    </section>
  );
}
