"use client";

import { FormEvent, useState } from "react";
import { Dumbbell } from "lucide-react";
import { AppShell } from "@/components/shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card } from "@/components/ui";
import { useHealth } from "@/lib/health-store";

export default function WorkoutPage() {
  const { workouts, addWorkout } = useHealth();
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");

  function submitWorkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    addWorkout({
      type: type.trim(),
      duration: Number(duration),
      calories: Number(calories),
    });

    setType("");
    setDuration("");
    setCalories("");
  }

  return (
    <AuthGuard>
      <AppShell>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="mb-1 flex items-center gap-2 text-2xl font-black text-slate-800 dark:text-slate-100">
              <Dumbbell className="h-6 w-6 text-emerald-600" /> Workout Log
            </h2>
            <p className="mb-5 text-sm text-slate-500">Add exercise type, duration, and calories burned.</p>

            <form className="space-y-3" onSubmit={submitWorkout}>
              <input
                type="text"
                value={type}
                onChange={(event) => setType(event.target.value)}
                placeholder="Exercise type"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
              />
              <input
                type="number"
                min={1}
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                placeholder="Duration (minutes)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
              />
              <input
                type="number"
                min={1}
                value={calories}
                onChange={(event) => setCalories(event.target.value)}
                placeholder="Calories burned"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white transition hover:bg-emerald-700"
              >
                Add Workout
              </button>
            </form>
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-black text-slate-800 dark:text-slate-100">Recent Workouts</h3>
            <div className="space-y-3">
              {workouts.slice(0, 8).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                  <p className="font-bold text-slate-700 dark:text-slate-200">{item.type}</p>
                  <p className="text-sm text-slate-500">
                    {item.duration} min • {item.calories} kcal
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
