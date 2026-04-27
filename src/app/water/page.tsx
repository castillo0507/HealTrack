"use client";

import { FormEvent, useState } from "react";
import { Droplets } from "lucide-react";
import { AppShell } from "@/components/shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card, ProgressBar } from "@/components/ui";
import { useHealth } from "@/lib/health-store";

export default function WaterPage() {
  const { today, goals, addWater } = useHealth();
  const [cups, setCups] = useState("1");

  function submitWater(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addWater(Number(cups));
  }

  const progress = (today.waterCups / goals.waterCups) * 100;

  return (
    <AuthGuard>
      <AppShell>
        <Card>
          <h2 className="mb-1 flex items-center gap-2 text-2xl font-black text-slate-800 dark:text-slate-100">
            <Droplets className="h-6 w-6 text-sky-500" /> Water Intake
          </h2>
          <p className="mb-5 text-sm text-slate-500">Add cups or glasses and stay hydrated.</p>

          <div className="mb-4 rounded-2xl bg-sky-50 p-4 dark:bg-sky-900/20">
            <p className="text-sm text-slate-600">Daily hydration</p>
            <p className="text-4xl font-black text-sky-700 dark:text-sky-300">{today.waterCups} cups</p>
            <p className="text-xs text-slate-500">Goal: {goals.waterCups} cups</p>
          </div>

          <ProgressBar value={progress} className="mb-2" />
          <p className="mb-6 text-sm text-slate-500">{Math.floor(progress)}% complete</p>

          <form className="space-y-3" onSubmit={submitWater}>
            <input
              type="number"
              min={1}
              value={cups}
              onChange={(event) => setCups(event.target.value)}
              placeholder="Cups to add"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-sky-600 py-3 font-bold text-white transition hover:bg-sky-700"
            >
              Add Water
            </button>
          </form>
        </Card>
      </AppShell>
    </AuthGuard>
  );
}
