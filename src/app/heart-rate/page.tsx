"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Clock3, HeartPulse } from "lucide-react";
import { AppShell } from "@/components/shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card, ProgressBar, Stat } from "@/components/ui";
import { useHealth } from "@/lib/health-store";
import { buildCategoryProgress } from "@/lib/progress";
import { generateHeartRateAnalysis, type MetricAnalysis } from "@/lib/suggestions";

function formatLoggedAt(date: string) {
  return new Date(date).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function severityStyles(severity: MetricAnalysis["severity"]) {
  if (severity === "urgent") {
    return "border-brand-200 bg-brand-50 text-slate-700";
  }

  if (severity === "watch") {
    return "border-slate-200 bg-slate-50 text-slate-700";
  }

  return "border-brand-200 bg-brand-50 text-slate-700";
}

export default function HeartRatePage() {
  const { today, goals, workouts, nutritionEntries, heartRateEntries, vitalSignsEntries, addHeartRate } = useHealth();
  const latestEntry = heartRateEntries[0];
  const [bpm, setBpm] = useState("");
  const [restingBpm, setRestingBpm] = useState("");
  const [hrvMs, setHrvMs] = useState("");
  const [analysis, setAnalysis] = useState<MetricAnalysis | null>(null);
  const categoryProgress = useMemo(() => buildCategoryProgress({
    goals,
    today,
    workouts,
    nutritionEntries,
    heartRateEntries,
    vitalSignsEntries,
  }), [goals, today, workouts, nutritionEntries, heartRateEntries, vitalSignsEntries]);

  function submitHeartRate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const bpmValue = Number(bpm);
    const restingValue = restingBpm ? Number(restingBpm) : undefined;
    const hrvValue = hrvMs ? Number(hrvMs) : undefined;

    if (!Number.isFinite(bpmValue) || bpmValue <= 0) {
      return;
    }

    if (restingValue !== undefined && (!Number.isFinite(restingValue) || restingValue <= 0)) {
      return;
    }

    if (hrvValue !== undefined && (!Number.isFinite(hrvValue) || hrvValue <= 0)) {
      return;
    }

    addHeartRate({
      bpm: bpmValue,
      restingBpm: restingValue,
      hrvMs: hrvValue,
    });

    setAnalysis(
      generateHeartRateAnalysis({
        bpm: bpmValue,
        restingBpm: restingValue,
        hrvMs: hrvValue,
      }),
    );
  }

  return (
    <AuthGuard>
      <AppShell>
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="mb-1 flex items-center gap-2 text-2xl font-black text-slate-800">
                  <HeartPulse className="h-6 w-6 text-brand-700" /> Heart Rate Log
                </h2>
                <p className="text-sm text-slate-500">Log a reading, compare it with your baseline, and get an instant interpretation.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-right shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Latest Reading</p>
                <p className="text-lg font-black text-brand-700">{latestEntry ? `${latestEntry.bpm} BPM` : "—"}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Current BPM" value={latestEntry ? `${latestEntry.bpm}` : "—"} hint={latestEntry ? "Most recent log" : "No readings yet"} />
              <Stat label="Resting BPM" value={latestEntry?.restingBpm ? `${latestEntry.restingBpm}` : "—"} hint="Optional baseline" />
              <Stat label="HRV" value={latestEntry?.hrvMs ? `${latestEntry.hrvMs}` : "—"} hint="Milliseconds" />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">Tracking progress</p>
              <ProgressBar value={categoryProgress["Heart Health"]} className="mb-2" />
              <p className="text-sm text-slate-500">{Math.round(categoryProgress["Heart Health"])}% of your heart health tracking target is complete.</p>
            </div>

            <form className="mt-6 space-y-3" onSubmit={submitHeartRate}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="heart-rate-bpm" className="mb-1 block text-sm font-semibold text-slate-600">
                    Heart rate (BPM)
                  </label>
                  <input
                    id="heart-rate-bpm"
                    type="number"
                    min={1}
                    step="1"
                    value={bpm}
                    onChange={(event) => setBpm(event.target.value)}
                    placeholder="72"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="resting-bpm" className="mb-1 block text-sm font-semibold text-slate-600">
                    Resting BPM
                  </label>
                  <input
                    id="resting-bpm"
                    type="number"
                    min={1}
                    step="1"
                    value={restingBpm}
                    onChange={(event) => setRestingBpm(event.target.value)}
                    placeholder="65"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="hrv-ms" className="mb-1 block text-sm font-semibold text-slate-600">
                  Heart-rate variability (ms)
                </label>
                <input
                  id="hrv-ms"
                  type="number"
                  min={1}
                  step="1"
                  value={hrvMs}
                  onChange={(event) => setHrvMs(event.target.value)}
                  placeholder="48"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-brand-600 py-3 font-bold text-white transition hover:bg-brand-700"
              >
                Log Heart Rate
              </button>
            </form>

            {analysis && (
              <div className={`mt-6 rounded-2xl border p-4 ${severityStyles(analysis.severity)}`}>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.2em]">Automatic Analysis</p>
                <p className="text-sm font-semibold">{analysis.feedback}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.18em]">Insights</p>
                    <ul className="space-y-2 text-sm">
                      {analysis.insights.map((item) => (
                        <li key={item} className="rounded-xl bg-white px-3 py-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.18em]">Recommendations</p>
                    <ul className="space-y-2 text-sm">
                      {analysis.recommendations.map((item) => (
                        <li key={item} className="rounded-xl bg-white px-3 py-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href="/dashboard" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700">
                    Return to Dashboard
                  </Link>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-800">
              <Clock3 className="h-5 w-5 text-brand-700" /> Recent Heart Rate Readings
            </h3>

            <div className="space-y-3">
              {heartRateEntries.length > 0 ? (
                heartRateEntries.slice(0, 6).map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-black text-slate-900">{entry.bpm} BPM</p>
                        <p className="text-sm text-slate-500">{entry.restingBpm ? `Resting ${entry.restingBpm} BPM` : "No resting baseline"}</p>
                      </div>
                      <p className="text-right text-xs text-slate-500">{formatLoggedAt(entry.date)}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      {entry.hrvMs ? <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">HRV {entry.hrvMs} ms</span> : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                  No readings logged yet. Add a heart rate value to see personalized feedback.
                </div>
              )}
            </div>
          </Card>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
