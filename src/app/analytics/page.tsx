"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ComponentType } from "react";
import { Activity, Brain, Droplets, HeartPulse, MoonStar, Thermometer, Dumbbell, Apple, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card, ProgressBar, Stat } from "@/components/ui";
import { MonthlyComparisonChart, WeeklyProgressChart } from "@/components/charts";
import { useHealth } from "@/lib/health-store";
import { buildCategoryProgress, buildMonthlyOverallProgress, buildWeeklyOverallProgress } from "@/lib/progress";
import { buildInsightsReport, type CategoryInsight } from "@/lib/insights";

const categoryMeta: Record<string, { icon: ComponentType<{ className?: string }>; accent: string; route: string }> = {
  "Physical Activity": { icon: Activity, accent: "text-emerald-600 bg-emerald-100", route: "/steps" },
  "Heart Health": { icon: HeartPulse, accent: "text-rose-600 bg-rose-100", route: "/heart-rate" },
  "Sleep Tracking": { icon: MoonStar, accent: "text-violet-600 bg-violet-100", route: "/sleep" },
  Hydration: { icon: Droplets, accent: "text-sky-600 bg-sky-100", route: "/water" },
  "Mental Wellness": { icon: Brain, accent: "text-indigo-600 bg-indigo-100", route: "/mental-wellness" },
  Nutrition: { icon: Apple, accent: "text-orange-600 bg-orange-100", route: "/nutrition" },
  "Exercise & Workouts": { icon: Dumbbell, accent: "text-cyan-600 bg-cyan-100", route: "/workout" },
  "Vital Signs": { icon: Thermometer, accent: "text-pink-600 bg-pink-100", route: "/vital-signs" },
};

function statusTone(status: CategoryInsight["status"]) {
  if (status === "urgent") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (status === "watch") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "good") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export default function AnalyticsPage() {
  const { categories, goals, today, weeklyData, monthlyData, workouts, nutritionEntries, heartRateEntries, vitalSignsEntries } = useHealth();
  const categoryProgress = useMemo(
    () =>
      buildCategoryProgress({
        goals,
        today,
        workouts,
        nutritionEntries,
        heartRateEntries,
        vitalSignsEntries,
      }),
    [goals, today, workouts, nutritionEntries, heartRateEntries, vitalSignsEntries],
  );

  const report = useMemo(() => {
    return buildInsightsReport({
      categories,
      goals,
      today,
      weeklyData,
      workouts,
      nutritionEntries,
      heartRateEntries,
      vitalSignsEntries,
    });
  }, [categories, goals, today, weeklyData, workouts, nutritionEntries, heartRateEntries, vitalSignsEntries]);

  const weeklyOverall = useMemo(() => {
    return buildWeeklyOverallProgress({
      goals,
      today,
      weeklyData,
      monthlyData,
      workouts,
      nutritionEntries,
      heartRateEntries,
      vitalSignsEntries,
    });
  }, [goals, today, weeklyData, monthlyData, workouts, nutritionEntries, heartRateEntries, vitalSignsEntries]);

  const monthlyOverall = useMemo(() => {
    return buildMonthlyOverallProgress({
      goals,
      today,
      weeklyData,
      monthlyData,
      workouts,
      nutritionEntries,
      heartRateEntries,
      vitalSignsEntries,
    });
  }, [goals, today, weeklyData, monthlyData, workouts, nutritionEntries, heartRateEntries, vitalSignsEntries]);

  const categoryProgressEntries = Object.entries(categoryProgress);
  const weeklyCategoryProgress = Object.entries(weeklyOverall.categoryProgress).map(([category, progress]) => ({
    category,
    progress,
  }));
  const monthlyCategoryProgress = Object.entries(monthlyOverall.categoryProgress).map(([category, progress]) => ({
    category,
    progress,
  }));

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-4 pb-8">
          <Card>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="mb-1 text-2xl font-black text-slate-900 dark:text-slate-100">Insights</h2>
                <p className="text-sm text-slate-700">A live summary of trends, category status, and personalized recommendations across your health data.</p>
              </div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700">
                Back to dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Tracked Categories" value={`${report.selectedCategories}`} hint={`${report.categoryCount} available`} />
              <Stat label="Active Categories" value={`${report.activeCategories}`} hint="Categories with usable data" />
              <Stat label="Current Focus" value={report.categoryInsights.find((item) => item.status === "urgent")?.category ?? report.categoryInsights.find((item) => item.status === "watch")?.category ?? "Balanced"} hint="Most relevant category" />
            </div>

            <div className="mt-4 rounded-2xl border border-brand-200 bg-white p-4 text-slate-900 shadow-sm">
              <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-slate-700">Overall Summary</p>
              <p className="text-sm font-semibold">{report.overview}</p>

              <div className="mt-3 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div>
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    <span>Weekly Overall Progress</span>
                    <span>{weeklyOverall.overallProgress}%</span>
                  </div>
                  <ProgressBar value={weeklyOverall.overallProgress} />
                  <p className="mt-1 text-xs text-slate-600">
                    {weeklyOverall.trackedCategories} of {weeklyOverall.totalCategories} categories have weekly data contributing to this score.
                  </p>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    <span>Monthly Overall Progress</span>
                    <span>{monthlyOverall.overallProgress}%</span>
                  </div>
                  <ProgressBar value={monthlyOverall.overallProgress} />
                  <p className="mt-1 text-xs text-slate-600">
                    {monthlyOverall.trackedCategories} of {monthlyOverall.totalCategories} categories have monthly data contributing to this score.
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm text-slate-700">{report.highlights[0]}</p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {report.highlights.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800 shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="mb-1 text-2xl font-black text-slate-800">Category Progress Overview</h2>
                <p className="text-sm text-slate-500">All 8 categories are shown here, including those with no current activity.</p>
              </div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{categoryProgressEntries.length} categories</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {categoryProgressEntries.map(([category, value]) => {
                const meta = categoryMeta[category];
                const Icon = meta.icon;

                return (
                  <div key={category} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-start gap-3">
                      <div className={`rounded-xl p-2 ${meta.accent}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-slate-800">{category}</p>
                        <p className="text-xs text-slate-500">{Math.round(value)}% complete</p>
                      </div>
                    </div>

                    <ProgressBar value={value} />
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <div className="mb-4">
              <h2 className="mb-1 text-2xl font-black text-slate-800 dark:text-slate-100">Personalized Recommendations</h2>
              <p className="text-sm text-slate-500">These suggestions are derived from the combined data across all categories.</p>
            </div>

            <div className="grid gap-3">
              {report.recommendations.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="mb-1 text-2xl font-black text-slate-800 dark:text-slate-100">Category Insights</h2>
                <p className="text-sm text-slate-500">Every category is included, even when there is no direct data yet.</p>
              </div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{report.selectedCategories} selected</p>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {report.categoryInsights.map((item) => {
                const meta = categoryMeta[item.category];
                const Icon = meta.icon;

                return (
                  <article key={item.category} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-xl p-2 ${meta.accent}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-black text-slate-800">{item.category}</p>
                          <p className="text-xs text-slate-500">{item.metric}</p>
                        </div>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusTone(item.status)}`}>{item.status}</span>
                    </div>

                    <p className="text-sm font-semibold text-slate-700">{item.summary}</p>
                    <p className="mt-2 text-sm text-slate-500">{item.trend}</p>
                    <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Recommendation</p>
                      <p>{item.recommendation}</p>
                    </div>

                    <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="mb-2 flex items-center justify-between gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                        <span>Progress</span>
                        <span>{Math.round(categoryProgress[item.category as keyof typeof categoryProgress] ?? 0)}%</span>
                      </div>
                      <ProgressBar value={categoryProgress[item.category as keyof typeof categoryProgress] ?? 0} />
                    </div>

                    <Link href={meta.route} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline">
                      Open category <ArrowRight className="h-4 w-4" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 text-2xl font-black text-slate-800">Weekly Analytics</h2>
            <p className="text-sm text-slate-500">Category progress for the current week across all 8 categories.</p>
            <WeeklyProgressChart data={weeklyCategoryProgress} />
          </Card>

          <Card>
            <h2 className="mb-1 text-2xl font-black text-slate-800">Monthly Progress</h2>
            <p className="text-sm text-slate-500">Category progress for the month across all 8 categories.</p>
            <MonthlyComparisonChart data={monthlyCategoryProgress} />
          </Card>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
