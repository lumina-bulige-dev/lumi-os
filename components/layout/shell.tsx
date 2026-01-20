import { ReactNode } from "react";
import { Sidebar } from "./sidebar";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="grid min-h-screen grid-cols-[220px_1fr]">
        <Sidebar />
        <main className="flex min-h-screen flex-col">{children}</main>
      </div>
    </div>
  );
}
