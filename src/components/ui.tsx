import { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900 ${className}`}>
      {children}
    </section>
  );
}

export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  const safe = Math.max(0, Math.min(100, value));

  return (
    <progress
      max={100}
      value={safe}
      className={`healtrack-progress h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 ${className}`}
    />
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-brand-600/10 px-4 py-3 text-center dark:bg-brand-300/10">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-2xl font-black text-brand-700 dark:text-brand-300">{value}</p>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
