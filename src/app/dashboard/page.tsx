"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import type { ComponentType } from "react";
import {
  Apple,
  Brain,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Flame,
  Footprints,
  Heart,
  Menu,
  MoonStar,
  Sparkles,
  Thermometer,
  TrendingUp,
  Dumbbell,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/shell";
import { AuthGuard } from "@/components/auth-guard";
import { ProfileModal } from "@/components/profile-modal";
import { ProfileAvatarBadge } from "../../components/profile-avatar";
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

type TipSlide = {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
};

function Meter({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(100, value));

  return <progress max={100} value={safe} className="dashboard-meter mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200" />;
}

export default function DashboardPage() {
  const { today, goals, categories, profile, workouts, nutritionEntries, heartRateEntries, vitalSignsEntries, streak, updateProfile, updatePassword } = useHealth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [philippineDate, setPhilippineDate] = useState<string>("");
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const updatePhilippineDate = () => {
      const now = new Date();
      const phDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
      const dateStr = phDate.toLocaleDateString("en-US", { 
        weekday: "long", 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      });
      setPhilippineDate(dateStr);
    };
    
    updatePhilippineDate();
  }, []);

  const tips: TipSlide[] = [
    {
      eyebrow: "Hydration",
      title: "Start the day with water before coffee.",
      description: "A full glass of water first thing in the morning helps your body wake up and makes the rest of your intake easier to hit.",
      cta: "Open Water Log",
      href: "/water",
      icon: Droplets,
      accent: "from-sky-50 via-white to-blue-50",
    },
    {
      eyebrow: "Movement",
      title: "Break long sitting sessions with a 2-minute walk.",
      description: "Small movement snacks during the day improve energy, loosen stiffness, and keep step goals from feeling overwhelming.",
      cta: "Track Steps",
      href: "/steps",
      icon: Footprints,
      accent: "from-cyan-50 via-white to-sky-50",
    },
    {
      eyebrow: "Recovery",
      title: "Protect your sleep with a calmer last hour.",
      description: "Dim screens, lower stimulation, and keep your bedtime routine predictable so sleep quality becomes easier to improve.",
      cta: "Review Sleep",
      href: "/sleep",
      icon: MoonStar,
      accent: "from-indigo-50 via-white to-sky-50",
    },
    {
      eyebrow: "Nutrition",
      title: "Build meals around protein, fiber, and color.",
      description: "A balanced plate keeps energy steadier and makes nutrition tracking feel more useful than restrictive.",
      cta: "Log Nutrition",
      href: "/nutrition",
      icon: Apple,
      accent: "from-sky-50 via-white to-cyan-50",
    },
    {
      eyebrow: "Wellness",
      title: "Check in on how you feel, not just the numbers.",
      description: "A quick mental wellness check-in helps you spot stress earlier and keep the dashboard focused on the whole picture.",
      cta: "Open Wellness",
      href: "/mental-wellness",
      icon: Brain,
      accent: "from-blue-50 via-white to-sky-50",
    },
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTipIndex((current) => (current + 1) % tips.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [tips.length]);

  const activeTip = tips[tipIndex];

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
      tone: "border border-sky-100 bg-linear-to-br from-sky-100 via-white to-cyan-100 text-sky-700",
    },
    {
      title: "Sleep",
      subtitle: categories.includes(titleToCategory.Sleep) ? today.sleepQuality : "Not tracking",
      value: categories.includes(titleToCategory.Sleep) ? `${today.sleepHours} hrs` : "—",
      progress: categories.includes(titleToCategory.Sleep) ? categoryProgress["Sleep Tracking"] : 0,
      icon: MoonStar,
      tone: "border border-sky-100 bg-linear-to-br from-blue-100 via-white to-sky-100 text-blue-700",
    },
    {
      title: "Mental Wellness",
      subtitle: "Wellness check-in",
      value: categories.includes(titleToCategory["Mental Wellness"]) ? "Ready" : "—",
      progress: categories.includes(titleToCategory["Mental Wellness"]) ? categoryProgress["Mental Wellness"] : 0,
      icon: Brain,
      tone: "border border-sky-100 bg-linear-to-br from-indigo-100 via-white to-sky-100 text-indigo-700",
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
      tone: "border border-sky-100 bg-linear-to-br from-blue-100 via-white to-cyan-100 text-blue-700",
    },
    {
      title: "Water Intake",
      subtitle: `/ ${goals.waterCups} cups goal`,
      value: categories.includes(titleToCategory["Water Intake"]) ? `${today.waterCups} cups` : "—",
      progress: categories.includes(titleToCategory["Water Intake"]) ? categoryProgress.Hydration : 0,
      icon: Droplets,
      tone: "border border-sky-100 bg-linear-to-br from-sky-100 via-white to-blue-100 text-sky-700",
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
      tone: "border border-sky-100 bg-linear-to-br from-cyan-100 via-white to-sky-100 text-cyan-700",
    },
    {
      title: "Workout",
      subtitle: "Strength training",
      value: categories.includes(titleToCategory.Workout) ? (workouts.length ? `${workouts[0].duration} min` : "No data") : "—",
      progress: categories.includes(titleToCategory.Workout) ? categoryProgress["Exercise & Workouts"] : 0,
      icon: Dumbbell,
      tone: "border border-sky-100 bg-linear-to-br from-blue-100 via-white to-indigo-100 text-blue-700",
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
      tone: "border border-sky-100 bg-linear-to-br from-sky-100 via-white to-cyan-100 text-sky-700",
    },
  ];

  const tracked = cards.filter((c) => c.progress > 0);
  const todayProgress = tracked.length ? Math.round(tracked.reduce((s, c) => s + c.progress, 0) / tracked.length) : 0;

  return (
    <AuthGuard>
      <AppShell>
        <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.16),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#f3f8ff_35%,#ebf4ff_100%)] pb-24">
          <div className="pointer-events-none absolute -left-32 -top-24 h-64 w-64 rounded-full bg-brand-100/50 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-56 h-56 w-56 rounded-full bg-sky-100/60 blur-3xl" />

          <header className="relative mx-3 mt-3 overflow-hidden rounded-4xl border border-white/80 bg-white/75 px-4 pb-4 pt-4 text-slate-800 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:mx-4 sm:px-6">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-sky-500 via-cyan-400 to-blue-500" />
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <ProfileAvatarBadge avatarId={profile.avatar} className="mt-1 h-11 w-11 shrink-0" iconClassName="h-5 w-5" />
                <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700/80">Good day</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Hello, {profile.name.split(" ")[0]}!</h1>
                <p className="mt-1 text-sm text-slate-500">{philippineDate}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProfileModalOpen(true)}
                className="rounded-full border border-slate-200/80 bg-white p-2.5 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                aria-label="Open profile"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-[1.4fr_1fr]">
              <div className="rounded-3xl border border-sky-100 bg-linear-to-br from-sky-50 via-white to-blue-50 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sky-700">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-[0.22em]">Today&apos;s momentum</p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-white/90 px-3 py-3 text-center shadow-sm">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">Active Categories</p>
                    <p className="mt-1 text-xl font-black text-slate-900">{categories.length}</p>
                  </div>
                  <div className="rounded-2xl bg-white/90 px-3 py-3 text-center shadow-sm">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">Today&apos;s Progress</p>
                    <p className="mt-1 text-xl font-black text-slate-900">{todayProgress}%</p>
                  </div>
                  <div className="rounded-2xl bg-white/90 px-3 py-3 text-center shadow-sm">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">Streak</p>
                    <p className="mt-1 text-xl font-black text-slate-900">{streak} {streak === 1 ? "day" : "days"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-sky-100 bg-linear-to-br from-sky-50 via-white to-cyan-50 p-4 text-slate-800 shadow-sm">
                <div className="flex items-center gap-2 text-sky-700">
                  <ShieldCheck className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-[0.22em]">Private by design</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Your daily health dashboard stays local, organized, and easy to scan. Use the tips carousel to keep the focus on one small improvement at a time.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-2xl border border-white/70 bg-white/85 px-3 py-3 shadow-sm">
                    <p className="text-xs text-slate-500">Tracked today</p>
                    <p className="mt-1 font-bold text-slate-900">{tracked.length} categories</p>
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-white/85 px-3 py-3 shadow-sm">
                    <p className="text-xs text-slate-500">Next goal</p>
                    <p className="mt-1 font-bold text-slate-900">Keep building streaks</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="relative px-3 pt-4 sm:px-4">
            <section className="mb-4 overflow-hidden rounded-4xl border border-white/80 bg-white/80 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-sky-700/80">Health tips</p>
                  <h2 className="mt-1 text-lg font-black tracking-tight text-slate-900">One small change at a time</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTipIndex((current) => (current - 1 + tips.length) % tips.length)}
                    className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
                    aria-label="Previous tip"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipIndex((current) => (current + 1) % tips.length)}
                    className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
                    aria-label="Next tip"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className={`mt-4 rounded-3xl border border-slate-200 bg-linear-to-br ${activeTip.accent} p-5 shadow-inner`}>
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="max-w-xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/85 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700 shadow-sm">
                      <activeTip.icon className="h-3.5 w-3.5 text-sky-700" />
                      {activeTip.eyebrow}
                    </div>
                    <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{activeTip.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{activeTip.description}</p>
                  </div>

                  <div className="rounded-[1.25rem] border border-white/70 bg-white/85 p-4 shadow-sm md:min-w-56">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Quick action</p>
                    <Link
                      href={activeTip.href}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-sky-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:from-sky-500 hover:to-blue-500"
                    >
                      <activeTip.icon className="h-4 w-4" />
                      {activeTip.cta}
                    </Link>
                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      Rotate through practical tips that map directly to your logged categories.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  {tips.map((tip, index) => (
                    <button
                      key={tip.title}
                      type="button"
                      onClick={() => setTipIndex(index)}
                      className={`h-2.5 rounded-full transition-all ${index === tipIndex ? "w-8 bg-sky-700" : "w-2.5 bg-sky-200 hover:bg-sky-300"}`}
                      aria-label={`Show tip ${index + 1}`}
                      aria-current={index === tipIndex ? "true" : undefined}
                    />
                  ))}
                </div>
              </div>
            </section>

            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">Today&apos;s Overview</h2>
              <Link href="/analytics" className="flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline">
                <TrendingUp className="h-3.5 w-3.5" /> View Insights
              </Link>
            </div>

            <section className="grid gap-3 lg:grid-cols-2">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <article key={card.title} className="group rounded-[1.4rem] border border-sky-100 bg-linear-to-br from-white via-white to-sky-50/70 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <div className={`rounded-2xl p-2.5 ${card.tone} shadow-sm transition group-hover:scale-105`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{card.title}</p>
                          <p className="text-[11px] text-slate-500">{card.subtitle}</p>
                        </div>
                      </div>
                      <TrendingUp className="h-3.5 w-3.5 text-slate-400 transition group-hover:text-brand-600" />
                    </div>

                    <div className="mt-3 flex items-end justify-between gap-3">
                      <p className="text-2xl font-black tracking-tight text-slate-900">{card.value}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{card.progress}%</p>
                    </div>
                    <Meter value={card.progress} />

                    <div className="mt-3 flex items-center justify-end">
                      <Link
                        href={routeMap[card.title] ?? "/categories"}
                        className="rounded-full bg-linear-to-r from-sky-600 to-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:from-sky-500 hover:to-blue-500"
                      >
                        Log
                      </Link>
                    </div>
                  </article>
                );
              })}
            </section>

            <div className="mt-4 rounded-[1.25rem] border border-brand-200 bg-linear-to-r from-brand-50 to-white px-4 py-3 text-xs text-slate-700 shadow-sm">
              <span className="font-semibold">Privacy First:</span> All your health data is stored locally on your device. No data is sent to external servers.
            </div>
          </main>
        </div>

        <ProfileModal
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          profile={profile}
          onSave={(newProfile, password) => {
            updateProfile(newProfile);
            if (password) {
              updatePassword(password);
            }
            setProfileModalOpen(false);
          }}
        />
      </AppShell>
    </AuthGuard>
  );
}
