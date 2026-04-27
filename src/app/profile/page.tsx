"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card } from "@/components/ui";
import { allCategories, useHealth } from "@/lib/health-store";

export default function ProfilePage() {
  const { profile, goals, categories, updateProfile, updateGoals, toggleCategory } = useHealth();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [stepsGoal, setStepsGoal] = useState(String(goals.steps));
  const [waterGoal, setWaterGoal] = useState(String(goals.waterCups));
  const [sleepGoal, setSleepGoal] = useState(String(goals.sleepHours));
  const [savedMessage, setSavedMessage] = useState("");

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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
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
            <h3 className="mb-3 text-lg font-black text-slate-800 dark:text-slate-100">Manage Health Categories</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {allCategories.map((category) => {
                const selected = categories.includes(category);

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`rounded-2xl border px-4 py-3 text-left font-semibold transition ${
                      selected
                        ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-300"
                        : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="bg-brand-50 dark:bg-brand-500/10">
            <p className="flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-300">
              <ShieldCheck className="h-4 w-4" /> Privacy Status
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">All data stays local on your device. You control what to track and can update consent anytime.</p>
          </Card>

          <Card>
            <h3 className="mb-3 text-lg font-black text-slate-800 dark:text-slate-100">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/steps" className="block rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700 transition hover:border-brand-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                Manage Steps Target
              </Link>
              <Link href="/categories" className="block rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700 transition hover:border-brand-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                Manage Health Categories
              </Link>
              <Link href="/privacy" className="block rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700 transition hover:border-brand-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                Privacy Settings
              </Link>
            </div>
          </Card>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
