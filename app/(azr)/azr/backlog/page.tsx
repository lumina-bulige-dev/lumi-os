import { Shell } from "@/components/layout/shell";
import { Topbar } from "@/components/layout/topbar";
import { backlogSeed } from "@/modules/azr/lib/store";

export default function AzrBacklogPage() {
  return (
    <Shell>
      <Topbar title="Backlog" />
      <div className="p-6">
        <section className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Pending Decisions</h2>
          <ul className="mt-3 space-y-2 text-xs text-neutral-600">
            {backlogSeed.map((item) => (
              <li key={item.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-neutral-800">{item.title}</div>
                  <div className="text-neutral-500">{item.id}</div>
                </div>
                <div className="text-neutral-400">{item.env}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Shell>
  );
}
