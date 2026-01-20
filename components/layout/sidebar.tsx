import Link from "next/link";

const links = [
  { href: "/azr/console", label: "Console" },
  { href: "/azr/backlog", label: "Backlog" },
  { href: "/azr/audit", label: "Audit" },
  { href: "/azr/settings", label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="flex h-full w-full flex-col gap-4 border-r border-neutral-200 bg-white p-4 text-sm text-neutral-800">
      <div className="text-xs uppercase tracking-wide text-neutral-500">AZR Control</div>
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md px-2 py-1 text-neutral-700 transition hover:bg-neutral-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto text-xs text-neutral-500">
        Human-only decision surface.
      </div>
    </aside>
  );
}
