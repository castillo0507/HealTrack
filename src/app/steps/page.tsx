"use client";

import { FormEvent, useState } from "react";
import { Footprints } from "lucide-react";
import { AppShell } from "@/components/shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card, ProgressBar } from "@/components/ui";
import { useHealth } from "@/lib/health-store";

export default function StepsPage() {
  const { today, goals, addSteps } = useHealth();
  const [steps, setSteps] = useState("");
  const [message, setMessage] = useState("");

  function submitSteps(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(steps);

    if (!Number.isFinite(value) || value <= 0) {
      setMessage("Enter a valid number of steps.");
      return;
    }

    addSteps(value);
    setSteps("");
    setMessage("Steps added successfully.");
  }

  const progress = (today.steps / goals.steps) * 100;

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

          <form className="space-y-3" onSubmit={submitSteps}>
            <input
              type="number"
              min={1}
              value={steps}
              onChange={(event) => setSteps(event.target.value)}
              placeholder="Add steps"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 py-3 font-bold text-white transition hover:bg-brand-700"
            >
              Add Steps
            </button>
          </form>

          {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
        </Card>
      </AppShell>
    </AuthGuard>
  );
}
