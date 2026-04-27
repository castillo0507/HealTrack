import { HeartPulse } from "lucide-react";

export function HealthLogo({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/20">
        <HeartPulse className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-black tracking-tight text-brand-700">HealTrack</h1>
      {subtitle ? <p className="text-lg text-slate-500">{subtitle}</p> : null}
    </div>
  );
}
