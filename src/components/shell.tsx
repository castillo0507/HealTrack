"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Plus, Settings } from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/analytics", label: "Insights", icon: BarChart3 },
  { href: "/workout", label: "Add", icon: Plus },
  { href: "/profile", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full flex-col pb-20">
      <main className="flex-1">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/90 px-3 py-2 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-3xl items-center justify-around gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-16 flex-col items-center rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                  active
                    ? "text-brand-700 dark:text-brand-200"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
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
