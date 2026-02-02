export function ShareView({ token, receipt }: { token: string; receipt?: string }) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-neutral-900">Shared Proof</h2>
      <p className="mt-2 text-xs text-neutral-500">Token: {token}</p>
      <div className="mt-3 rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-3 text-xs text-neutral-600">
        {receipt ? receipt : "No receipt found. The proof store is read-only."}
      </div>
    </section>
  );
}
