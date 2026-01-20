export function ChatInterface() {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-neutral-900">Operator Notes</h2>
      <p className="mt-2 text-xs text-neutral-500">
        Record context and questions for the human operator. Automated approval is disabled.
      </p>
      <div className="mt-4 rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-3 text-xs text-neutral-500">
        Notes area (read-only skeleton)
      </div>
    </section>
  );
}
