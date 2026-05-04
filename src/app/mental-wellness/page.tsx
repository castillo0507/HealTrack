"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Brain, Plus, Sparkles } from "lucide-react";
import { AppShell } from "@/components/shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card, ProgressBar } from "@/components/ui";
import { useHealth } from "@/lib/health-store";
import { buildCategoryProgress } from "@/lib/progress";

type MentalWellnessScore = {
  score: number;
  verdict: string;
  comment: string;
  suggestion: string;
};

const moodOptions = [
  { label: "Very low", value: 1 },
  { label: "Low", value: 2 },
  { label: "Okay", value: 3 },
  { label: "Good", value: 4 },
  { label: "Great", value: 5 },
];

const stressOptions = [
  { label: "Very high", value: 1 },
  { label: "High", value: 2 },
  { label: "Moderate", value: 3 },
  { label: "Low", value: 4 },
  { label: "Very low", value: 5 },
];

const energyOptions = [
  { label: "Drained", value: 1 },
  { label: "Low", value: 2 },
  { label: "Steady", value: 3 },
  { label: "Good", value: 4 },
  { label: "High", value: 5 },
];

const focusOptions = [
  { label: "Very hard to focus", value: 1 },
  { label: "Distracted", value: 2 },
  { label: "Mixed", value: 3 },
  { label: "Focused", value: 4 },
  { label: "Very focused", value: 5 },
];

function buildAssessment(mood: number, stress: number, energy: number, focus: number): MentalWellnessScore {
  const average = (mood + stress + energy + focus) / 4;
  const score = Math.round(average * 20);

  if (score >= 85) {
    return {
      score,
      verdict: "Strong",
      comment: "You appear to be in a strong mental state today.",
      suggestion: "Keep the momentum going with a light routine, good hydration, and a short pause before the day gets busy.",
    };
  }

  if (score >= 70) {
    return {
      score,
      verdict: "Stable",
      comment: "Your mental wellness looks stable, with a few areas to protect.",
      suggestion: "A brief walk, breathing break, or quiet reset could help keep your balance steady.",
    };
  }

  if (score >= 50) {
    return {
      score,
      verdict: "Mixed",
      comment: "Your check-in shows a mixed mental wellness signal today.",
      suggestion: "Try reducing one source of pressure and make time for one grounding activity before the day ends.",
    };
  }

  return {
    score,
    verdict: "Needs attention",
    comment: "Your check-in suggests you may be under a lot of strain right now.",
    suggestion: "Pause, rest, and reach out to someone you trust. If this feeling continues or gets worse, consider professional support.",
  };
}

export default function MentalWellnessPage() {
  const { today, goals, workouts, nutritionEntries, heartRateEntries, vitalSignsEntries } = useHealth();
  const [mood, setMood] = useState("3");
  const [stress, setStress] = useState("3");
  const [energy, setEnergy] = useState("3");
  const [focus, setFocus] = useState("3");
  const [showForm, setShowForm] = useState(false);
  const [assessment, setAssessment] = useState<MentalWellnessScore | null>(null);
  const categoryProgress = useMemo(() => buildCategoryProgress({
    goals,
    today,
    workouts,
    nutritionEntries,
    heartRateEntries,
    vitalSignsEntries,
  }), [goals, today, workouts, nutritionEntries, heartRateEntries, vitalSignsEntries]);

  function submitEvaluation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = buildAssessment(Number(mood), Number(stress), Number(energy), Number(focus));
    setAssessment(result);
    setShowForm(false);
  }

  return (
    <AuthGuard>
      <AppShell>
        <Card>
          <h2 className="mb-1 flex items-center gap-2 text-2xl font-black text-slate-800">
            <Brain className="h-6 w-6 text-brand-700" /> Mental Wellness
          </h2>
          <p className="mb-5 text-sm text-slate-500">Check in on mood, stress, energy, and focus to evaluate how you are doing today.</p>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">Live balance score</p>
            <ProgressBar value={categoryProgress["Mental Wellness"]} className="mb-2" />
            <p className="text-sm text-slate-500">{Math.round(categoryProgress["Mental Wellness"])}% based on your latest sleep, hydration, activity, and recovery signals.</p>
          </div>

          {!showForm && !assessment && (
            <button
              onClick={() => setShowForm(true)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
              title="Evaluate mental wellness"
              aria-label="Evaluate mental wellness"
            >
              <Plus className="h-6 w-6" />
            </button>
          )}

          {showForm && (
            <form className="space-y-3" onSubmit={submitEvaluation}>
              <label className="block text-sm font-semibold text-slate-600" htmlFor="mood">
                Mood
              </label>
              <select
                id="mood"
                value={mood}
                onChange={(event) => setMood(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                {moodOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <label className="block text-sm font-semibold text-slate-600" htmlFor="stress">
                Stress level
              </label>
              <select
                id="stress"
                value={stress}
                onChange={(event) => setStress(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                {stressOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <label className="block text-sm font-semibold text-slate-600" htmlFor="energy">
                Energy level
              </label>
              <select
                id="energy"
                value={energy}
                onChange={(event) => setEnergy(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                {energyOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <label className="block text-sm font-semibold text-slate-600" htmlFor="focus">
                Focus
              </label>
              <select
                id="focus"
                value={focus}
                onChange={(event) => setFocus(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                {focusOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="w-full rounded-xl bg-brand-600 py-3 font-bold text-white transition hover:bg-brand-700"
              >
                Evaluate Mental Wellness
              </button>
            </form>
          )}

          {assessment && (
            <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-700" />
                <p className="font-semibold text-slate-800">{assessment.verdict} mental wellness score</p>
              </div>
              <p className="mb-2 text-4xl font-black text-brand-700">{assessment.score}/100</p>
              <p className="mb-2 font-semibold text-slate-800">{assessment.comment}</p>
              <p className="text-sm text-slate-600">{assessment.suggestion}</p>

              <button
                type="button"
                onClick={() => {
                  setAssessment(null);
                  setShowForm(true);
                }}
                className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700"
              >
                Evaluate again
              </button>
              <div className="mt-4">
                <Link href="/dashboard" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700">
                  Return to Dashboard
                </Link>
              </div>
            </div>
          )}
        </Card>
      </AppShell>
    </AuthGuard>
  );
}
