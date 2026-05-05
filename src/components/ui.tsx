import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:shadow-md ${className}`}>
      {children}
    </section>
  );
}

export function ProgressBar({ value, className = "", tone = "brand" }: { value: number; className?: string; tone?: "brand" | "emerald" | "rose" | "violet" | "sky" | "indigo" | "orange" | "cyan" | "pink" }) {
  const safe = Math.max(0, Math.min(100, value));

  return (
    <progress
      max={100}
      value={safe}
      className={`healtrack-progress tone-${tone} h-3 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}
    />
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-brand-50 px-4 py-3 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">{label}</p>
      <p className="text-2xl font-black text-brand-700">{value}</p>
      {hint ? <p className="text-xs text-slate-700">{hint}</p> : null}
    </div>
  );
}
