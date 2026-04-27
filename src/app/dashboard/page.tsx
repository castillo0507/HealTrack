"use client";

import Link from "next/link";
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
import { useHealth } from "@/lib/health-store";

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
  const { today, goals, categories, profile } = useHealth();

  const stepsProgress = (today.steps / goals.steps) * 100;
  const sleepProgress = (today.sleepHours / goals.sleepHours) * 100;
  const waterProgress = (today.waterCups / goals.waterCups) * 100;
  const todayProgress = Math.round((stepsProgress + sleepProgress + waterProgress + 78) / 4);

  const cards: OverviewCard[] = [
    {
      title: "Steps",
      subtitle: `/ ${goals.steps.toLocaleString()} goal`,
      value: today.steps.toLocaleString(),
      progress: stepsProgress,
      icon: Footprints,
      tone: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Sleep",
      subtitle: today.sleepQuality,
      value: `${today.sleepHours} hrs`,
      progress: sleepProgress,
      icon: MoonStar,
      tone: "bg-violet-100 text-violet-600",
    },
    {
      title: "Mental Wellness",
      subtitle: "15 min meditation",
      value: "Good",
      progress: 80,
      icon: Brain,
      tone: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Heart Rate",
      subtitle: "Resting: 65 BPM",
      value: "72 BPM",
      progress: 85,
      icon: Heart,
      tone: "bg-rose-100 text-rose-600",
    },
    {
      title: "Water Intake",
      subtitle: `/ ${goals.waterCups} cups goal`,
      value: `${today.waterCups} cups`,
      progress: waterProgress,
      icon: Droplets,
      tone: "bg-sky-100 text-sky-600",
    },
    {
      title: "Nutrition",
      subtitle: "/ 2,000 cal goal",
      value: `${today.caloriesBurned.toLocaleString()} cal`,
      progress: 82,
      icon: Flame,
      tone: "bg-orange-100 text-orange-600",
    },
    {
      title: "Workout",
      subtitle: "Strength training",
      value: "45 min",
      progress: 100,
      icon: Dumbbell,
      tone: "bg-cyan-100 text-cyan-600",
    },
    {
      title: "Vital Signs",
      subtitle: "BP: 120/80",
      value: "98.6°F",
      progress: 90,
      icon: Thermometer,
      tone: "bg-pink-100 text-pink-600",
    },
  ];

  return (
    <AuthGuard>
      <AppShell>
        <div className="min-h-screen bg-slate-100 pb-24">
          <header className="rounded-b-2xl bg-linear-to-r from-[#2460ea] to-[#1f54de] px-4 pb-4 pt-3 text-white shadow-lg shadow-blue-500/20 sm:px-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">Hello, {profile.name.split(" ")[0]}!</p>
                <p className="text-xs text-blue-100">Monday, April 27, 2026</p>
              </div>
              <Link
                href="/profile"
                className="rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30"
                aria-label="Open profile"
              >
                <Menu className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg bg-white/8 px-3 py-2 text-center">
                <p className="text-[10px] uppercase tracking-wide text-blue-100">Active Categories</p>
                <p className="text-sm font-bold">{categories.length}</p>
              </div>
              <div className="rounded-lg bg-white/8 px-3 py-2 text-center">
                <p className="text-[10px] uppercase tracking-wide text-blue-100">Today&apos;s Progress</p>
                <p className="text-sm font-bold">{todayProgress}%</p>
              </div>
              <div className="rounded-lg bg-white/8 px-3 py-2 text-center">
                <p className="text-[10px] uppercase tracking-wide text-blue-100">Streak</p>
                <p className="text-sm font-bold">12 days</p>
              </div>
            </div>
          </header>

          <main className="px-3 pt-4 sm:px-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">Today&apos;s Overview</h2>
              <Link href="/analytics" className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:underline">
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
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    </div>

                    <p className="mt-3 text-lg font-semibold text-slate-900">{card.value}</p>
                    <Meter value={card.progress} />
                  </article>
                );
              })}
            </section>

            <section className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Quick Actions</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <Link
                  href="/workout"
                  className="rounded-xl border border-slate-200 bg-white p-4 text-center text-sm font-semibold text-slate-800 transition hover:border-blue-300"
                >
                  <span className="mb-1 block text-blue-500">+</span>
                  Log Activity
                </Link>
                <Link
                  href="/analytics"
                  className="rounded-xl border border-slate-200 bg-white p-4 text-center text-sm font-semibold text-slate-800 transition hover:border-blue-300"
                >
                  <span className="mb-1 block text-emerald-500">↗</span>
                  View Trends
                </Link>
              </div>
            </section>

            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
              <span className="font-semibold">Privacy First:</span> All your health data is stored locally on your device. No data is sent to external servers.
            </div>
          </main>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
