"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Droplets, Plus } from "lucide-react";
import { AppShell } from "@/components/shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card, ProgressBar } from "@/components/ui";
import { useHealth } from "@/lib/health-store";
import { generateWaterSuggestion, type SuggestionData } from "@/lib/suggestions";

export default function WaterPage() {
  const { today, goals, addWater } = useHealth();
  const [cups, setCups] = useState("1");
  const [showForm, setShowForm] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestionData | null>(null);

  function submitWater(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(cups);
    
    if (!Number.isFinite(value) || value <= 0) {
      return;
    }
    
    const newTotal = today.waterCups + value;
    addWater(value);
    
    // Generate suggestion
    const newSuggestion = generateWaterSuggestion(value, newTotal, goals.waterCups);
    setSuggestion(newSuggestion);
    
    setCups("1");
    
    // Reset form after a delay
    setTimeout(() => {
      setShowForm(false);
    }, 2000);
  }

  const progress = (today.waterCups / goals.waterCups) * 100;

  return (
    <AuthGuard>
      <AppShell>
        <Card>
          <h2 className="mb-1 flex items-center gap-2 text-2xl font-black text-slate-800 dark:text-slate-100">
            <Droplets className="h-6 w-6 text-brand-700" /> Water Intake
          </h2>
          <p className="mb-5 text-sm text-slate-500">Add cups or glasses and stay hydrated.</p>

          <div className="mb-4 rounded-2xl bg-brand-50 p-4 dark:bg-slate-900/30">
            <p className="text-sm text-slate-600">Daily hydration</p>
            <p className="text-4xl font-black text-brand-700 dark:text-brand-300">{today.waterCups} cups</p>
            <p className="text-xs text-slate-500">Goal: {goals.waterCups} cups</p>
          </div>

          <ProgressBar value={progress} className="mb-2" />
          <p className="mb-6 text-sm text-slate-500">{Math.floor(progress)}% complete</p>

          {!showForm && !suggestion && (
            <button
              onClick={() => setShowForm(true)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
              title="Log water intake"
              aria-label="Log water intake"
            >
              <Plus className="h-6 w-6" />
            </button>
          )}

          {showForm && (
            <form className="space-y-3" onSubmit={submitWater}>
              <input
                type="number"
                min={1}
                value={cups}
                onChange={(event) => setCups(event.target.value)}
                placeholder="Cups to add"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:bg-white dark:text-slate-900"
                autoFocus
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-brand-600 py-3 font-bold text-white transition hover:bg-brand-700"
              >
                Log Water
              </button>
            </form>
          )}

          {suggestion && (
            <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500 rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-slate-700 dark:bg-slate-900/30">
              <p className="mb-2 font-semibold text-slate-800 dark:text-slate-100">{suggestion.comment}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{suggestion.suggestion}</p>
              <div className="mt-4">
                <Link href="/dashboard" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700">
                  Return to Dashboard
                </Link>
              </div>
            </div>
          )}
        </Card>
      </AppShell>
    </AuthGuard>
  );
}
