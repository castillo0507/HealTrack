"use client";

import { FormEvent, useState } from "react";
import { MoonStar, Plus } from "lucide-react";
import { AppShell } from "@/components/shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card, ProgressBar } from "@/components/ui";
import { SleepQuality, useHealth } from "@/lib/health-store";
import { generateSleepSuggestion, type SuggestionData } from "@/lib/suggestions";

const qualityOptions: SleepQuality[] = ["Poor", "Fair", "Good", "Excellent"];

export default function SleepPage() {
  const { today, goals, setSleep } = useHealth();
  const [hours, setHours] = useState(String(today.sleepHours));
  const [quality, setQuality] = useState<SleepQuality>(today.sleepQuality);
  const [showForm, setShowForm] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestionData | null>(null);

  function submitSleep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newHours = Number(hours);
    setSleep(newHours, quality);
    
    // Generate suggestion
    const newSuggestion = generateSleepSuggestion(newHours, quality, goals.sleepHours);
    setSuggestion(newSuggestion);
    
    // Reset form after a delay
    setTimeout(() => {
      setShowForm(false);
      setHours(String(today.sleepHours));
      setQuality("Good");
    }, 2000);
  }

  const progress = ((today.sleepHours) / goals.sleepHours) * 100;

  return (
    <AuthGuard>
      <AppShell>
        <Card>
          <h2 className="mb-1 flex items-center gap-2 text-2xl font-black text-slate-800 dark:text-slate-100">
            <MoonStar className="h-6 w-6 text-brand-700" /> Sleep Tracker
          </h2>
          <p className="mb-5 text-sm text-slate-500">Track sleep duration and quality to improve recovery.</p>

          <div className="mb-4 rounded-2xl bg-brand-50 p-4 dark:bg-slate-900/30">
            <p className="text-sm text-slate-600">Last logged sleep</p>
            <p className="text-4xl font-black text-brand-700 dark:text-brand-300">{today.sleepHours} hrs</p>
            <p className="text-xs text-slate-500">Quality: {today.sleepQuality}</p>
          </div>

          <ProgressBar value={progress} className="mb-2" />
          <p className="mb-6 text-sm text-slate-500">{Math.floor(progress)}% of your sleep goal</p>

          {!showForm && !suggestion && (
            <button
              onClick={() => setShowForm(true)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
              title="Log sleep"
              aria-label="Log sleep"
            >
              <Plus className="h-6 w-6" />
            </button>
          )}

          {showForm && (
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:bg-white dark:text-slate-900"
              />

              <label htmlFor="sleep-quality" className="block text-sm font-semibold text-slate-600 dark:text-slate-300">
                Sleep quality rating
              </label>
              <select
                id="sleep-quality"
                value={quality}
                onChange={(event) => setQuality(event.target.value as SleepQuality)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:bg-white dark:text-slate-900"
              >
                {qualityOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="w-full rounded-xl bg-brand-600 py-3 font-bold text-white transition hover:bg-brand-700"
              >
                Log Sleep
              </button>
            </form>
          )}

          {suggestion && (
            <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500 rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-slate-700 dark:bg-slate-900/30">
              <p className="mb-2 font-semibold text-slate-800 dark:text-slate-100">{suggestion.comment}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{suggestion.suggestion}</p>
            </div>
          )}
        </Card>
      </AppShell>
    </AuthGuard>
  );
}
