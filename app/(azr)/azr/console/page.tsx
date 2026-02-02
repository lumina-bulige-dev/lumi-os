import { Shell } from "@/components/layout/shell";
import { Topbar } from "@/components/layout/topbar";
import { AzrDashboard } from "@/modules/azr/components/dashboard/dashboard";

export default function AzrConsolePage() {
  return (
    <Shell>
      <Topbar title="Console" />
      <div className="p-6">
        <AzrDashboard />
      </div>
    </Shell>
  );
}
