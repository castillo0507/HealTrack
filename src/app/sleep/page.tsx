"use client";

import { FormEvent, useState } from "react";
import { MoonStar } from "lucide-react";
import { AppShell } from "@/components/shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card, ProgressBar } from "@/components/ui";
import { SleepQuality, useHealth } from "@/lib/health-store";

const qualityOptions: SleepQuality[] = ["Poor", "Fair", "Good", "Excellent"];

export default function SleepPage() {
  const { today, goals, setSleep } = useHealth();
  const [hours, setHours] = useState(String(today.sleepHours));
  const [quality, setQuality] = useState<SleepQuality>(today.sleepQuality);

  function submitSleep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSleep(Number(hours), quality);
  }

  const progress = (today.sleepHours / goals.sleepHours) * 100;

  return (
    <AuthGuard>
      <AppShell>
        <Card>
          <h2 className="mb-1 flex items-center gap-2 text-2xl font-black text-slate-800 dark:text-slate-100">
            <MoonStar className="h-6 w-6 text-violet-600" /> Sleep Tracker
          </h2>
          <p className="mb-5 text-sm text-slate-500">Track sleep duration and quality to improve recovery.</p>

          <div className="mb-4 rounded-2xl bg-violet-50 p-4 dark:bg-violet-900/20">
            <p className="text-sm text-slate-600">Last logged sleep</p>
            <p className="text-4xl font-black text-violet-700 dark:text-violet-300">{today.sleepHours} hrs</p>
            <p className="text-xs text-slate-500">Quality: {today.sleepQuality}</p>
          </div>

          <ProgressBar value={progress} className="mb-2" />
          <p className="mb-6 text-sm text-slate-500">{Math.floor(progress)}% of your sleep goal</p>

          <form className="space-y-3" onSubmit={submitSleep}>
            <label htmlFor="sleep-hours" className="block text-sm font-semibold text-slate-600 dark:text-slate-300">
              Sleep duration (hours)
            </label>
            <input
              id="sleep-hours"
              type="number"
              step="0.1"
              min={1}
              max={14}
              value={hours}
              onChange={(event) => setHours(event.target.value)}
              placeholder="Sleep duration (hours)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800"
            />

            <label htmlFor="sleep-quality" className="block text-sm font-semibold text-slate-600 dark:text-slate-300">
              Sleep quality rating
            </label>
            <select
              id="sleep-quality"
              value={quality}
              onChange={(event) => setQuality(event.target.value as SleepQuality)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800"
            >
              {qualityOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="w-full rounded-xl bg-violet-600 py-3 font-bold text-white transition hover:bg-violet-700"
            >
              Save Sleep Data
            </button>
          </form>
        </Card>
      </AppShell>
    </AuthGuard>
  );
}
