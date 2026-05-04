"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Settings } from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/analytics", label: "Insights", icon: BarChart3 },
  { href: "/profile", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full flex-col pb-20">
      <main className="flex-1">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/85 px-3 py-2 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-around gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-w-16 flex-col items-center rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                  active ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="mb-1 h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
