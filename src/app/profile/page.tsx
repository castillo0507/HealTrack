"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card } from "@/components/ui";
import { allCategories, useHealth } from "@/lib/health-store";
import { buildInsightsReport } from "@/lib/insights";
import { buildCategoryProgress } from "@/lib/progress";
import { exportAllDataPdf } from "@/lib/export-report";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, goals, categories, today, weeklyData, monthlyData, workouts, nutritionEntries, heartRateEntries, vitalSignsEntries, streak, updateProfile, updateGoals, toggleCategory, logout } = useHealth();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [stepsGoal, setStepsGoal] = useState(String(goals.steps));
  const [waterGoal, setWaterGoal] = useState(String(goals.waterCups));
  const [sleepGoal, setSleepGoal] = useState(String(goals.sleepHours));
  const [savedMessage, setSavedMessage] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    updateProfile({ name: name.trim(), email: email.trim() });
    updateGoals({
      steps: Number(stepsGoal),
      waterCups: Number(waterGoal),
      sleepHours: Number(sleepGoal),
    });

    setSavedMessage("Profile and health targets saved.");
  }


  function onSignOut() {
    logout();
    router.push("/login");
  }

  async function onExportAllData() {
    setIsExporting(true);
    setExportMessage("");

    try {
      const insights = buildInsightsReport({
        categories,
        goals,
        today,
        weeklyData,
        workouts,
        nutritionEntries,
        heartRateEntries,
        vitalSignsEntries,
      });

      const progress = buildCategoryProgress({
        goals,
        today,
        workouts,
        nutritionEntries,
        heartRateEntries,
        vitalSignsEntries,
      });

      exportAllDataPdf({
        profile: {
          name: name.trim() || profile.name,
          email: email.trim() || profile.email,
        },
        goals: {
          steps: Number(stepsGoal),
          waterCups: Number(waterGoal),
          sleepHours: Number(sleepGoal),
        },
        categories,
        today,
        streak,
        progress,
        insights,
        weeklyData,
        monthlyData,
        workouts,
        nutritionEntries,
        heartRateEntries,
        vitalSignsEntries,
      });

      setExportMessage("Your PDF report has been downloaded.");
    } catch {
      setExportMessage("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-4">
          <Card>
            <h2 className="mb-1 text-2xl font-black text-slate-800 dark:text-slate-100">Profile</h2>
            <p className="mb-5 text-sm text-slate-500">Basic user info and editable health targets.</p>

            <form className="grid gap-3 sm:grid-cols-2" onSubmit={onSave}>
              <div className="sm:col-span-2">
                <label htmlFor="profile-name" className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  Full Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:bg-white dark:text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="profile-email" className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:bg-white dark:text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="goal-steps" className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  Steps Target
                </label>
                <input
                  id="goal-steps"
                  type="number"
                  min={1000}
                  value={stepsGoal}
                  onChange={(event) => setStepsGoal(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:bg-white dark:text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="goal-water" className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  Water Target (cups)
                </label>
                <input
                  id="goal-water"
                  type="number"
                  min={1}
                  value={waterGoal}
                  onChange={(event) => setWaterGoal(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:bg-white dark:text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="goal-sleep" className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  Sleep Target (hours)
                </label>
                <input
                  id="goal-sleep"
                  type="number"
                  min={4}
                  max={12}
                  step="0.5"
                  value={sleepGoal}
                  onChange={(event) => setSleepGoal(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:bg-white dark:text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-brand-600 py-3 font-bold text-white transition hover:bg-brand-700"
                >
                  Save Changes
                </button>
              </div>
            </form>

            {savedMessage ? <p className="mt-3 text-sm text-slate-600">{savedMessage}</p> : null}
          </Card>

          <Card>
            <h3 className="mb-3 text-lg font-black text-slate-800">Manage Health Categories</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {allCategories.map((category) => {
                const selected = categories.includes(category);

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`rounded-2xl border px-4 py-3 text-left font-semibold text-black transition hover:border-brand-300 hover:bg-slate-50 hover:text-black ${
                      selected ? "border-brand-400 bg-brand-50 text-black shadow-sm" : "border-slate-200 bg-white"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="bg-white">
            <p className="flex items-center gap-2 text-sm font-semibold text-brand-700">
              <ShieldCheck className="h-4 w-4" /> Privacy Status
            </p>
            <p className="mt-2 text-sm text-slate-600">All data stays local on your device. You control what to track and can update consent anytime.</p>
          </Card>


          <Card>
            <h3 className="mb-2 text-lg font-black text-slate-800">Account</h3>
            <p className="mb-3 text-sm text-slate-600">Sign out of the current account to return to the login screen.</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={onExportAllData}
                disabled={isExporting}
                className="w-full rounded-xl border border-brand-200 bg-white py-3 font-bold text-brand-700 transition hover:border-brand-300 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isExporting ? "Exporting PDF..." : "Export All Data"}
              </button>
              <button
                type="button"
                onClick={onSignOut}
                className="w-full rounded-xl border border-rose-200 bg-white py-3 font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </div>
            {exportMessage ? <p className="mt-3 text-sm text-slate-600">{exportMessage}</p> : null}
          </Card>

          <Card>
            <h3 className="mb-3 text-lg font-black text-slate-800">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/steps" className="block rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-brand-300 hover:bg-slate-50">
                Manage Steps Target
              </Link>
              <Link href="/categories" className="block rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-brand-300 hover:bg-slate-50">
                Manage Health Categories
              </Link>
              <Link href="/privacy" className="block rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-brand-300 hover:bg-slate-50">
                Privacy Settings
              </Link>
            </div>
          </Card>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
