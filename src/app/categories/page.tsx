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
    accent: "text-emerald-600 bg-emerald-100 group-hover:bg-emerald-200 group-hover:text-emerald-700",
  },
  "Heart Health": {
    icon: HeartPulse,
    details: ["Heart rate (BPM)", "Resting heart rate", "Heart rate variability"],
    accent: "text-rose-600 bg-rose-100 group-hover:bg-rose-200 group-hover:text-rose-700",
  },
  "Sleep Tracking": {
    icon: MoonStar,
    details: ["Sleep duration", "Sleep stages", "Wake times", "Sleep quality score"],
    accent: "text-violet-600 bg-violet-100 group-hover:bg-violet-200 group-hover:text-violet-700",
  },
  Hydration: {
    icon: Droplets,
    details: ["Water intake (ml)", "Hydration reminders"],
    accent: "text-sky-600 bg-sky-100 group-hover:bg-sky-200 group-hover:text-sky-700",
  },
  "Mental Wellness": {
    icon: Brain,
    details: ["Mood check-ins", "Stress level", "Wellness evaluation"],
    accent: "text-indigo-600 bg-indigo-100 group-hover:bg-indigo-200 group-hover:text-indigo-700",
  },
  Nutrition: {
    icon: Apple,
    details: ["Meal logs", "Caloric intake", "Macronutrients"],
    accent: "text-orange-600 bg-orange-100 group-hover:bg-orange-200 group-hover:text-orange-700",
  },
  "Exercise & Workouts": {
    icon: Dumbbell,
    details: ["Workout type", "Duration", "Intensity", "Sets & reps"],
    accent: "text-cyan-600 bg-cyan-100 group-hover:bg-cyan-200 group-hover:text-cyan-700",
  },
  "Vital Signs": {
    icon: Thermometer,
    details: ["Body temperature", "Blood pressure", "Oxygen saturation"],
    accent: "text-pink-600 bg-pink-100 group-hover:bg-pink-200 group-hover:text-pink-700",
  },
};

export default function CategoriesPage() {
  const { categories, toggleCategory } = useHealth();

  return (
    <AuthGuard>
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 pb-28 pt-8">
        <h1 className="text-4xl font-black text-slate-900">Choose Health Categories</h1>
        <p className="mt-2 text-slate-700">Select the health metrics you want to track. You can change these anytime in settings.</p>

        <Card className="mt-4 border-brand-200 bg-brand-50 text-slate-700">
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
                className={`group rounded-3xl border p-4 text-left text-black transition hover:border-brand-300 hover:bg-slate-50 hover:shadow-md hover:text-black ${
                  checked ? "border-brand-300 bg-brand-50 text-black shadow-sm" : "border-slate-200 bg-white"
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2 ${meta.accent}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-black">{name}</p>
                    </div>
                  </div>
                  <span className={`rounded-md p-1 ${checked ? "bg-brand-100 text-black" : "bg-slate-100 text-black"}`}>
                    <Check className="h-3.5 w-3.5" />
                  </span>
                </div>

                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-black">Data collected:</p>
                <div className="flex flex-wrap gap-1.5">
                  {meta.details.map((detail) => (
                    <span key={detail} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-black">
                      {detail}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <footer className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
            <div>
              <p className="font-bold text-slate-900">{categories.length} categories selected</p>
              <p className="text-sm text-slate-700">Minimum 1 category required</p>
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
