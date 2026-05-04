"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import type { ComponentType } from "react";
import {
  Brain,
  Droplets,
  Flame,
  Footprints,
  Heart,
  Menu,
  MoonStar,
  Thermometer,
  TrendingUp,
  Dumbbell,
} from "lucide-react";
import { AppShell } from "@/components/shell";
import { AuthGuard } from "@/components/auth-guard";
import { ProfileModal } from "@/components/profile-modal";
import { useHealth } from "@/lib/health-store";
import { buildCategoryProgress } from "@/lib/progress";

type OverviewCard = {
  title: string;
  subtitle: string;
  value: string;
  progress: number;
  icon: ComponentType<{ className?: string }>;
  tone: string;
};

function Meter({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(100, value));

  return <progress max={100} value={safe} className="dashboard-meter mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200" />;
}

export default function DashboardPage() {
  const { today, goals, categories, profile, workouts, nutritionEntries, heartRateEntries, vitalSignsEntries, streak, updateProfile, updateGoals } = useHealth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const latestHeartRate = heartRateEntries[0];
  const latestVitalSigns = vitalSignsEntries[0];
  const latestNutrition = nutritionEntries[0];
  const nutritionGoalCalories = 2000;

  const categoryProgress = useMemo(() => buildCategoryProgress({
    goals,
    today,
    workouts,
    nutritionEntries,
    heartRateEntries,
    vitalSignsEntries,
  }), [goals, today, workouts, nutritionEntries, heartRateEntries, vitalSignsEntries]);

  const titleToCategory: Record<string, string> = {
    Steps: "Physical Activity",
    Sleep: "Sleep Tracking",
    "Mental Wellness": "Mental Wellness",
    "Heart Rate": "Heart Health",
    "Water Intake": "Hydration",
    Nutrition: "Nutrition",
    Workout: "Exercise & Workouts",
    "Vital Signs": "Vital Signs",
  };

  const routeMap: Record<string, string> = {
    Steps: "/steps",
    Sleep: "/sleep",
    "Mental Wellness": "/mental-wellness",
    "Heart Rate": "/heart-rate",
    "Water Intake": "/water",
    Workout: "/workout",
    "Vital Signs": "/vital-signs",
    Nutrition: "/nutrition",
  };

  const cards: OverviewCard[] = [
    {
      title: "Steps",
      subtitle: `/ ${goals.steps.toLocaleString()} goal`,
      value: categories.includes(titleToCategory.Steps) ? today.steps.toLocaleString() : "—",
      progress: categories.includes(titleToCategory.Steps) ? categoryProgress["Physical Activity"] : 0,
      icon: Footprints,
      tone: "bg-brand-50 text-brand-700",
    },
    {
      title: "Sleep",
      subtitle: categories.includes(titleToCategory.Sleep) ? today.sleepQuality : "Not tracking",
      value: categories.includes(titleToCategory.Sleep) ? `${today.sleepHours} hrs` : "—",
      progress: categories.includes(titleToCategory.Sleep) ? categoryProgress["Sleep Tracking"] : 0,
      icon: MoonStar,
      tone: "bg-slate-100 text-slate-600",
    },
    {
      title: "Mental Wellness",
      subtitle: "Wellness check-in",
      value: categories.includes(titleToCategory["Mental Wellness"]) ? "Ready" : "—",
      progress: categories.includes(titleToCategory["Mental Wellness"]) ? categoryProgress["Mental Wellness"] : 0,
      icon: Brain,
      tone: "bg-brand-100 text-brand-700",
    },
    {
      title: "Heart Rate",
      subtitle: latestHeartRate
        ? `Resting: ${latestHeartRate.restingBpm ?? latestHeartRate.bpm} BPM`
        : categories.includes(titleToCategory["Heart Rate"])
          ? "Ready to log"
          : "No category selected",
      value: categories.includes(titleToCategory["Heart Rate"])
        ? latestHeartRate
          ? `${latestHeartRate.bpm} BPM`
          : "No data"
        : "—",
      progress: categories.includes(titleToCategory["Heart Rate"]) ? categoryProgress["Heart Health"] : 0,
      icon: Heart,
      tone: "bg-slate-100 text-slate-600",
    },
    {
      title: "Water Intake",
      subtitle: `/ ${goals.waterCups} cups goal`,
      value: categories.includes(titleToCategory["Water Intake"]) ? `${today.waterCups} cups` : "—",
      progress: categories.includes(titleToCategory["Water Intake"]) ? categoryProgress.Hydration : 0,
      icon: Droplets,
      tone: "bg-brand-50 text-brand-700",
    },
    {
      title: "Nutrition",
      subtitle: latestNutrition
        ? `${latestNutrition.mealType} · ${latestNutrition.category}`
        : categories.includes(titleToCategory.Nutrition)
          ? `${nutritionGoalCalories.toLocaleString()} kcal target`
          : "No category selected",
      value: categories.includes(titleToCategory.Nutrition)
        ? `${today.nutritionCalories.toLocaleString()} kcal`
        : "—",
      progress: categories.includes(titleToCategory.Nutrition) ? categoryProgress.Nutrition : 0,
      icon: Flame,
      tone: "bg-slate-100 text-slate-600",
    },
    {
      title: "Workout",
      subtitle: "Strength training",
      value: categories.includes(titleToCategory.Workout) ? (workouts.length ? `${workouts[0].duration} min` : "No data") : "—",
      progress: categories.includes(titleToCategory.Workout) ? categoryProgress["Exercise & Workouts"] : 0,
      icon: Dumbbell,
      tone: "bg-brand-100 text-brand-700",
    },
    {
      title: "Vital Signs",
      subtitle: latestVitalSigns
        ? `SpO2 ${latestVitalSigns.spo2}% · Temp ${latestVitalSigns.temperature.toFixed(1)}°${latestVitalSigns.temperatureUnit}`
        : categories.includes(titleToCategory["Vital Signs"])
          ? "Ready to log"
          : "No category selected",
      value: categories.includes(titleToCategory["Vital Signs"])
        ? latestVitalSigns
          ? `${latestVitalSigns.systolic}/${latestVitalSigns.diastolic}`
          : "No data"
        : "—",
      progress: categories.includes(titleToCategory["Vital Signs"]) ? categoryProgress["Vital Signs"] : 0,
      icon: Thermometer,
      tone: "bg-slate-100 text-slate-600",
    },
  ];

  const tracked = cards.filter((c) => c.progress > 0);
  const todayProgress = tracked.length ? Math.round(tracked.reduce((s, c) => s + c.progress, 0) / tracked.length) : 0;

  return (
    <AuthGuard>
      <AppShell>
        <div className="min-h-screen bg-slate-50 pb-24">
          <header className="rounded-b-2xl bg-linear-to-r from-brand-50 to-white px-4 pb-4 pt-3 text-slate-800 shadow-sm shadow-slate-200/70 sm:px-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">Hello, {profile.name.split(" ")[0]}!</p>
                <p className="text-xs text-slate-500">Monday, April 27, 2026</p>
              </div>
              <button
                type="button"
                onClick={() => setProfileModalOpen(true)}
                className="rounded-full bg-white/70 p-2 text-slate-700 transition hover:bg-white"
                aria-label="Open profile"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border border-white/70 bg-white/60 px-3 py-2 text-center shadow-sm">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Active Categories</p>
                <p className="text-sm font-bold">{categories.length}</p>
              </div>
              <div className="rounded-lg border border-white/70 bg-white/60 px-3 py-2 text-center shadow-sm">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Today&apos;s Progress</p>
                <p className="text-sm font-bold">{todayProgress}%</p>
              </div>
              <div className="rounded-lg border border-white/70 bg-white/60 px-3 py-2 text-center shadow-sm">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Streak</p>
                <p className="text-sm font-bold">{streak} {streak === 1 ? "day" : "days"}</p>
              </div>
            </div>
          </header>

          <main className="px-3 pt-4 sm:px-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">Today&apos;s Overview</h2>
              <Link href="/analytics" className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline">
                <TrendingUp className="h-3.5 w-3.5" /> View Insights
              </Link>
            </div>

            <section className="grid gap-3 lg:grid-cols-2">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <article key={card.title} className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <div className={`rounded-lg p-1.5 ${card.tone}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{card.title}</p>
                          <p className="text-[11px] text-slate-500">{card.subtitle}</p>
                        </div>
                      </div>
                      <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                    </div>

                    <p className="mt-3 text-lg font-semibold text-slate-800">{card.value}</p>
                    <Meter value={card.progress} />

                    <div className="mt-3 flex items-center justify-end">
                      <Link
                        href={routeMap[card.title] ?? "/categories"}
                        className="rounded-md bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700"
                      >
                        Log
                      </Link>
                    </div>
                  </article>
                );
              })}
            </section>

            <section className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Quick Actions</h3>
              <div className="grid gap-2 sm:grid-cols-1">
                <Link
                  href="/analytics"
                  className="rounded-xl border border-slate-200 bg-white p-4 text-center text-sm font-semibold text-slate-800 transition hover:border-brand-300"
                >
                  <span className="mb-1 block text-slate-500">↗</span>
                  View Trends
                </Link>
              </div>
            </section>

            <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs text-slate-700">
              <span className="font-semibold">Privacy First:</span> All your health data is stored locally on your device. No data is sent to external servers.
            </div>
          </main>
        </div>

        <ProfileModal
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          profile={profile}
          goals={goals}
          onSave={(newProfile, newGoals) => {
            updateProfile(newProfile);
            updateGoals(newGoals);
            setProfileModalOpen(false);
          }}
        />
      </AppShell>
    </AuthGuard>
  );
}
