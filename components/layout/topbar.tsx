export function Topbar({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">{title}</h1>
        <p className="text-xs text-neutral-500">Decision support. No automatic approvals.</p>
      </div>
      <div className="text-xs text-neutral-500">AZR</div>
    </header>
  );
}
