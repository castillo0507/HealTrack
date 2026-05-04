"use client";

import { FormEvent, useMemo, useState } from "react";
import { Clock3, Thermometer } from "lucide-react";
import { AppShell } from "@/components/shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card, ProgressBar, Stat } from "@/components/ui";
import { useHealth } from "@/lib/health-store";
import { buildCategoryProgress } from "@/lib/progress";
import { generateVitalSignsAnalysis, type MetricAnalysis } from "@/lib/suggestions";

function formatLoggedAt(date: string) {
  return new Date(date).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function severityStyles(severity: MetricAnalysis["severity"]) {
  if (severity === "urgent") {
    return "border-brand-200 bg-brand-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-100";
  }

  if (severity === "watch") {
    return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-100";
  }

  return "border-brand-200 bg-brand-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-100";
}

export default function VitalSignsPage() {
  const { today, goals, workouts, nutritionEntries, heartRateEntries, vitalSignsEntries, addVitalSigns } = useHealth();
  const latestEntry = vitalSignsEntries[0];
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [spo2, setSpo2] = useState("");
  const [temperature, setTemperature] = useState("36.6");
  const [temperatureUnit, setTemperatureUnit] = useState<"C" | "F">("C");
  const [analysis, setAnalysis] = useState<MetricAnalysis | null>(null);
  const categoryProgress = useMemo(() => buildCategoryProgress({
    goals,
    today,
    workouts,
    nutritionEntries,
    heartRateEntries,
    vitalSignsEntries,
  }), [goals, today, workouts, nutritionEntries, heartRateEntries, vitalSignsEntries]);

  function handleTemperatureUnitChange(nextUnit: "C" | "F") {
    setTemperature((current) => {
      const numeric = Number(current);

      if (!Number.isFinite(numeric)) {
        return current;
      }

      if (temperatureUnit === nextUnit) {
        return current;
      }

      const converted = nextUnit === "C" ? (numeric - 32) / 1.8 : numeric * 1.8 + 32;
      return converted.toFixed(1);
    });

    setTemperatureUnit(nextUnit);
  }

  function submitVitalSigns(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const systolicValue = Number(systolic);
    const diastolicValue = Number(diastolic);
    const spo2Value = Number(spo2);
    const temperatureValue = Number(temperature);

    if (
      !Number.isFinite(systolicValue) ||
      systolicValue <= 0 ||
      !Number.isFinite(diastolicValue) ||
      diastolicValue <= 0 ||
      !Number.isFinite(spo2Value) ||
      spo2Value <= 0 ||
      spo2Value > 100 ||
      !Number.isFinite(temperatureValue)
    ) {
      return;
    }

    addVitalSigns({
      systolic: systolicValue,
      diastolic: diastolicValue,
      spo2: spo2Value,
      temperature: temperatureValue,
      temperatureUnit,
    });

    setAnalysis(
      generateVitalSignsAnalysis({
        systolic: systolicValue,
        diastolic: diastolicValue,
        spo2: spo2Value,
        temperature: temperatureValue,
        temperatureUnit,
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
                <h2 className="mb-1 flex items-center gap-2 text-2xl font-black text-slate-800 dark:text-slate-100">
                  <Thermometer className="h-6 w-6 text-brand-700" /> Vital Signs Log
                </h2>
                <p className="text-sm text-slate-500">Capture blood pressure, oxygen saturation, and temperature in one quick entry.</p>
              </div>
              <div className="rounded-2xl bg-brand-50 px-3 py-2 text-right dark:bg-slate-900/30">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Latest Reading</p>
                <p className="text-lg font-black text-brand-700 dark:text-brand-300">{latestEntry ? `${latestEntry.systolic}/${latestEntry.diastolic}` : "—"}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Blood Pressure" value={latestEntry ? `${latestEntry.systolic}/${latestEntry.diastolic}` : "—"} hint="mmHg" />
              <Stat label="SpO2" value={latestEntry ? `${latestEntry.spo2}%` : "—"} hint="Oxygen saturation" />
              <Stat label="Temperature" value={latestEntry ? `${latestEntry.temperature.toFixed(1)}°${latestEntry.temperatureUnit}` : "—"} hint="Body temperature" />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">Tracking progress</p>
              <ProgressBar value={categoryProgress["Vital Signs"]} className="mb-2" />
              <p className="text-sm text-slate-500">{Math.round(categoryProgress["Vital Signs"])}% of your vital-sign tracking target is complete.</p>
            </div>

            <form className="mt-6 space-y-3" onSubmit={submitVitalSigns}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="systolic" className="mb-1 block text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Systolic
                  </label>
                  <input
                    id="systolic"
                    type="number"
                    min={1}
                    step="1"
                    value={systolic}
                    onChange={(event) => setSystolic(event.target.value)}
                    placeholder="120"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:bg-white dark:text-slate-900"
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="diastolic" className="mb-1 block text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Diastolic
                  </label>
                  <input
                    id="diastolic"
                    type="number"
                    min={1}
                    step="1"
                    value={diastolic}
                    onChange={(event) => setDiastolic(event.target.value)}
                    placeholder="80"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:bg-white dark:text-slate-900"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="spo2" className="mb-1 block text-sm font-semibold text-slate-600 dark:text-slate-300">
                    SpO2 (%)
                  </label>
                  <input
                    id="spo2"
                    type="number"
                    min={1}
                    max={100}
                    step="1"
                    value={spo2}
                    onChange={(event) => setSpo2(event.target.value)}
                    placeholder="98"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:bg-white dark:text-slate-900"
                  />
                </div>

                <div>
                  <label htmlFor="temperature" className="mb-1 block text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Temperature
                  </label>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <input
                      id="temperature"
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(event) => setTemperature(event.target.value)}
                      placeholder={temperatureUnit === "C" ? "36.6" : "98.6"}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:bg-white dark:text-slate-900"
                    />
                    <select
                      value={temperatureUnit}
                      onChange={(event) => handleTemperatureUnitChange(event.target.value as "C" | "F")}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <option value="C">C</option>
                      <option value="F">F</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-brand-600 py-3 font-bold text-white transition hover:bg-brand-700"
              >
                Log Vital Signs
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
                        <li key={item} className="rounded-xl bg-white/70 px-3 py-2 dark:bg-slate-800/60">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.18em]">Recommendations</p>
                    <ul className="space-y-2 text-sm">
                      {analysis.recommendations.map((item) => (
                        <li key={item} className="rounded-xl bg-white/70 px-3 py-2 dark:bg-slate-800/60">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-800 dark:text-slate-100">
              <Clock3 className="h-5 w-5 text-brand-700" /> Recent Vital Signs Readings
            </h3>

            <div className="space-y-3">
              {vitalSignsEntries.length > 0 ? (
                vitalSignsEntries.slice(0, 6).map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-black text-slate-900 dark:text-slate-100">{entry.systolic}/{entry.diastolic} mmHg</p>
                        <p className="text-sm text-slate-500">SpO2 {entry.spo2}% · Temp {entry.temperature.toFixed(1)}°{entry.temperatureUnit}</p>
                      </div>
                      <p className="text-right text-xs text-slate-500">{formatLoggedAt(entry.date)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800">
                  No vital sign readings logged yet. Add a reading to get a tailored interpretation.
                </div>
              )}
            </div>
          </Card>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
