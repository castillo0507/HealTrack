"use client";

import { FormEvent, useState } from "react";
import { Footprints, Plus } from "lucide-react";
import { AppShell } from "@/components/shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card, ProgressBar } from "@/components/ui";
import { useHealth } from "@/lib/health-store";
import { generateStepsSuggestion, type SuggestionData } from "@/lib/suggestions";

export default function StepsPage() {
  const { today, goals, addSteps } = useHealth();
  const [steps, setSteps] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestionData | null>(null);

  function submitSteps(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(steps);

    if (!Number.isFinite(value) || value <= 0) {
      return;
    }

    const newTotal = today.steps + value;
    addSteps(value);
    
    // Generate suggestion
    const newSuggestion = generateStepsSuggestion(value, newTotal, goals.steps);
    setSuggestion(newSuggestion);
    
    setSteps("");
    
    // Reset form after a delay
    setTimeout(() => {
      setShowForm(false);
    }, 2000);
  }

  const progress = ((today.steps) / goals.steps) * 100;

  return (
    <AuthGuard>
      <AppShell>
        <Card>
          <h2 className="mb-1 flex items-center gap-2 text-2xl font-black text-slate-800 dark:text-slate-100">
            <Footprints className="h-6 w-6 text-brand-600" /> Steps Tracker
          </h2>
          <p className="mb-5 text-sm text-slate-500">Track your daily movement and stay on target.</p>

          <div className="mb-4 rounded-2xl bg-brand-50 p-4 dark:bg-brand-700/10">
            <p className="text-sm text-slate-600">Daily step counter</p>
            <p className="text-4xl font-black text-brand-700 dark:text-brand-300">{today.steps.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Goal: {goals.steps.toLocaleString()} steps</p>
          </div>

          <ProgressBar value={progress} className="mb-2" />
          <p className="mb-6 text-sm text-slate-500">{Math.floor(progress)}% complete</p>

          {!showForm && !suggestion && (
            <button
              onClick={() => setShowForm(true)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400"
              title="Log steps"
              aria-label="Log steps"
            >
              <Plus className="h-6 w-6" />
            </button>
          )}

          {showForm && (
            <form className="space-y-3" onSubmit={submitSteps}>
              <input
                type="number"
                min={1}
                value={steps}
                onChange={(event) => setSteps(event.target.value)}
                placeholder="Add steps"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:bg-white dark:text-slate-900"
                autoFocus
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-brand-600 py-3 font-bold text-white transition hover:bg-brand-700"
              >
                Log Steps
              </button>
            </form>
          )}

          {suggestion && (
            <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500 rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-700/10">
              <p className="mb-2 font-semibold text-slate-800 dark:text-slate-100">{suggestion.comment}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{suggestion.suggestion}</p>
            </div>
          )}
        </Card>
      </AppShell>
    </AuthGuard>
  );
}
