"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { Activity, HeartPulse, MoonStar, Droplets, Brain, Apple, Dumbbell, Thermometer, Check } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { Card } from "@/components/ui";
import { useHealth } from "@/lib/health-store";

const categoryMeta: Record<string, { icon: ComponentType<{ className?: string }>; details: string[]; accent: string }> = {
  "Physical Activity": {
    icon: Activity,
    details: ["Step count", "Distance walked", "Calories burned", "Active minutes"],
    accent: "text-emerald-600 bg-emerald-100",
  },
  "Heart Health": {
    icon: HeartPulse,
    details: ["Heart rate (BPM)", "Resting heart rate", "Heart rate variability"],
    accent: "text-rose-600 bg-rose-100",
  },
  "Sleep Tracking": {
    icon: MoonStar,
    details: ["Sleep duration", "Sleep stages", "Wake times", "Sleep quality score"],
    accent: "text-violet-600 bg-violet-100",
  },
  Hydration: {
    icon: Droplets,
    details: ["Water intake (ml)", "Hydration reminders"],
    accent: "text-sky-600 bg-sky-100",
  },
  "Mental Wellness": {
    icon: Brain,
    details: ["Mood entries", "Stress level", "Meditation minutes"],
    accent: "text-indigo-600 bg-indigo-100",
  },
  Nutrition: {
    icon: Apple,
    details: ["Meal logs", "Caloric intake", "Macronutrients"],
    accent: "text-orange-600 bg-orange-100",
  },
  "Exercise & Workouts": {
    icon: Dumbbell,
    details: ["Workout type", "Duration", "Intensity", "Sets & reps"],
    accent: "text-cyan-600 bg-cyan-100",
  },
  "Vital Signs": {
    icon: Thermometer,
    details: ["Body temperature", "Blood pressure", "Oxygen saturation"],
    accent: "text-pink-600 bg-pink-100",
  },
};

export default function CategoriesPage() {
  const { categories, toggleCategory } = useHealth();

  return (
    <AuthGuard>
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 pb-28 pt-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100">Choose Health Categories</h1>
        <p className="mt-2 text-slate-500">Select the health metrics you want to track. You can change these anytime in settings.</p>

        <Card className="mt-4 border-brand-200 bg-brand-50 text-brand-700 dark:bg-brand-700/10 dark:text-brand-300">
          <p className="font-black">Data Minimization:</p>
          <p className="text-sm">Only data for selected categories will be collected. Everything stays on your device.</p>
        </Card>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Object.entries(categoryMeta).map(([name, meta]) => {
            const checked = categories.includes(name);
            const Icon = meta.icon;

            return (
              <button
                key={name}
                type="button"
                onClick={() => toggleCategory(name)}
                className={`rounded-3xl border p-4 text-left transition ${
                  checked
                    ? "border-brand-500 bg-brand-50 shadow-md shadow-brand-300/20 dark:bg-brand-700/10"
                    : "border-slate-200 bg-white hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2 ${meta.accent}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 dark:text-slate-100">{name}</p>
                    </div>
                  </div>
                  <span className={`rounded-md p-1 ${checked ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-400 dark:bg-slate-800"}`}>
                    <Check className="h-3.5 w-3.5" />
                  </span>
                </div>

                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Data collected:</p>
                <div className="flex flex-wrap gap-1.5">
                  {meta.details.map((detail) => (
                    <span key={detail} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {detail}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <footer className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-100">{categories.length} categories selected</p>
              <p className="text-sm text-slate-500">Minimum 1 category required</p>
            </div>

            <Link
              href="/dashboard"
              className={`rounded-xl px-6 py-2 font-bold text-white transition ${
                categories.length > 0 ? "bg-brand-600 hover:bg-brand-700" : "pointer-events-none bg-brand-300"
              }`}
            >
              Continue
            </Link>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
