"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, Bike, Dumbbell, Flame, HeartPulse, Plus, Repeat, Sparkles } from "lucide-react";
import { AppShell } from "@/components/shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card, ProgressBar } from "@/components/ui";
import { useHealth } from "@/lib/health-store";
import { buildCategoryProgress } from "@/lib/progress";
import { generateWorkoutSuggestion, type SuggestionData } from "@/lib/suggestions";

type WorkoutMode = "Running" | "Walking" | "Cycling" | "Rowing" | "Swimming" | "Strength Training" | "HIIT" | "Yoga" | "Boxing" | "Hiking";
type IntensityLevel = "Light" | "Moderate" | "Hard";

type WorkoutConfig = {
  label: string;
  icon: typeof Activity;
  kind: "cardio" | "strength" | "interval" | "recovery";
  met: number;
  summary: string;
  details: string[];
};

const intensityFactor: Record<IntensityLevel, number> = {
  Light: 0.9,
  Moderate: 1,
  Hard: 1.15,
};

const workoutOptions: Record<WorkoutMode, WorkoutConfig> = {
  Running: {
    label: "Running",
    icon: Activity,
    kind: "cardio",
    met: 9.8,
    summary: "Best for high calorie burn and cardio endurance.",
    details: ["Distance", "Pace", "Heart-rate impact"],
  },
  Walking: {
    label: "Walking",
    icon: HeartPulse,
    kind: "cardio",
    met: 3.8,
    summary: "Great for steady movement, recovery, and fat-loss support.",
    details: ["Steps or distance", "Time on feet", "Low impact"],
  },
  Cycling: {
    label: "Cycling",
    icon: Bike,
    kind: "cardio",
    met: 7.5,
    summary: "Strong lower-body conditioning with solid calorie output.",
    details: ["Distance", "Resistance", "Cadence"],
  },
  Rowing: {
    label: "Rowing",
    icon: Repeat,
    kind: "cardio",
    met: 7.0,
    summary: "Full-body work that blends power, endurance, and posture.",
    details: ["Distance", "Stroke quality", "Split time"],
  },
  Swimming: {
    label: "Swimming",
    icon: Flame,
    kind: "cardio",
    met: 8.0,
    summary: "Low-impact conditioning that engages the whole body.",
    details: ["Lap count", "Stroke type", "Breathing rhythm"],
  },
  "Strength Training": {
    label: "Strength Training",
    icon: Dumbbell,
    kind: "strength",
    met: 6.0,
    summary: "Ideal for muscle retention, posture, and metabolic support.",
    details: ["Sets", "Reps", "Load or effort level"],
  },
  HIIT: {
    label: "HIIT",
    icon: Sparkles,
    kind: "interval",
    met: 8.5,
    summary: "Efficient interval work with a strong afterburn effect.",
    details: ["Rounds", "Work/rest structure", "Intensity"],
  },
  Yoga: {
    label: "Yoga",
    icon: Activity,
    kind: "recovery",
    met: 3.0,
    summary: "Excellent for mobility, recovery, and stress reduction.",
    details: ["Flow style", "Duration", "Recovery"],
  },
  Boxing: {
    label: "Boxing",
    icon: Repeat,
    kind: "interval",
    met: 8.3,
    summary: "Explosive conditioning that trains power and coordination.",
    details: ["Rounds", "Bag work", "Footwork"],
  },
  Hiking: {
    label: "Hiking",
    icon: HeartPulse,
    kind: "cardio",
    met: 6.0,
    summary: "A sustained endurance session with a big total-energy cost.",
    details: ["Elevation", "Distance", "Duration"],
  },
};

const workoutModes = Object.keys(workoutOptions) as WorkoutMode[];

function round(value: number, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function estimateCaloriesBurned(input: {
  mode: WorkoutMode;
  durationMinutes: number;
  weightKg: number;
  intensity: IntensityLevel;
  distanceKm?: number;
  sets?: number;
  reps?: number;
  rounds?: number;
}) {
  const workout = workoutOptions[input.mode];
  const baseCalories = (workout.met * 3.5 * input.weightKg * input.durationMinutes) / 200;
  const intensityBonus = intensityFactor[input.intensity];

  let volumeBonus = 1;
  if (workout.kind === "cardio" && input.distanceKm) {
    volumeBonus += Math.min(input.distanceKm / Math.max(input.durationMinutes / 10, 1), 1) * 0.08;
  }
  if (workout.kind === "strength" && input.sets && input.reps) {
    volumeBonus += Math.min((input.sets * input.reps) / 60, 1) * 0.12;
  }
  if (workout.kind === "interval" && input.rounds) {
    volumeBonus += Math.min(input.rounds / 12, 1) * 0.14;
  }

  const calories = Math.max(1, Math.round(baseCalories * intensityBonus * volumeBonus));
  const fatLossKg = calories / 7700;
  const fatLossLbs = calories / 3500;

  return {
    calories,
    fatLossKg: round(fatLossKg, 2),
    fatLossLbs: round(fatLossLbs, 2),
  };
}

function buildWorkoutFeedback(input: {
  mode: WorkoutMode;
  durationMinutes: number;
  intensity: IntensityLevel;
  calories: number;
  distanceKm?: number;
  sets?: number;
  reps?: number;
  rounds?: number;
}) {
  const workout = workoutOptions[input.mode];

  if (input.calories >= 600) {
    return `High-output ${workout.label.toLowerCase()} session. Plan a good recovery block and hydration afterward.`;
  }

  if (workout.kind === "strength" && input.sets && input.reps) {
    return `Solid strength volume. ${input.sets * input.reps} total reps is a strong stimulus for muscle retention.`;
  }

  if (workout.kind === "interval" && input.rounds) {
    return `Excellent interval density. ${input.rounds} rounds at ${input.intensity.toLowerCase()} intensity is a strong conditioning block.`;
  }

  if (workout.kind === "cardio" && input.distanceKm) {
    return `Good endurance work. ${round(input.distanceKm / Math.max(input.durationMinutes / 60, 1), 1)} km per hour keeps the session efficient.`;
  }

  if (input.durationMinutes >= 45) {
    return `Long-form ${workout.label.toLowerCase()} is helping build endurance and total weekly energy expenditure.`;
  }

  return `Consistent ${workout.label.toLowerCase()} at ${input.intensity.toLowerCase()} intensity supports progress without overreaching.`;
}

export default function WorkoutPage() {
  const { today, goals, workouts, nutritionEntries, heartRateEntries, vitalSignsEntries, addWorkout } = useHealth();
  const [type, setType] = useState<WorkoutMode>("Running");
  const [duration, setDuration] = useState("");
  const [weight, setWeight] = useState("70");
  const [intensity, setIntensity] = useState<IntensityLevel>("Moderate");
  const [distanceKm, setDistanceKm] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [rounds, setRounds] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestionData | null>(null);

  const selectedWorkout = workoutOptions[type];
  const categoryProgress = useMemo(() => buildCategoryProgress({
    goals,
    today,
    workouts,
    nutritionEntries,
    heartRateEntries,
    vitalSignsEntries,
  }), [goals, today, workouts, nutritionEntries, heartRateEntries, vitalSignsEntries]);

  const preview = useMemo(() => {
    const durationMinutes = Number(duration);
    const weightKg = Number(weight);

    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0 || !Number.isFinite(weightKg) || weightKg <= 0) {
      return null;
    }

    return estimateCaloriesBurned({
      mode: type,
      durationMinutes,
      weightKg,
      intensity,
      distanceKm: distanceKm ? Number(distanceKm) : undefined,
      sets: sets ? Number(sets) : undefined,
      reps: reps ? Number(reps) : undefined,
      rounds: rounds ? Number(rounds) : undefined,
    });
  }, [duration, weight, intensity, type, distanceKm, sets, reps, rounds]);

  function submitWorkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const durationMinutes = Number(duration);
    const weightKg = Number(weight);
    const numericDistance = distanceKm ? Number(distanceKm) : undefined;
    const numericSets = sets ? Number(sets) : undefined;
    const numericReps = reps ? Number(reps) : undefined;
    const numericRounds = rounds ? Number(rounds) : undefined;

    if (!selectedWorkout || !Number.isFinite(durationMinutes) || durationMinutes <= 0 || !Number.isFinite(weightKg) || weightKg <= 0 || !preview) {
      return;
    }

    if (selectedWorkout.kind === "cardio" && numericDistance !== undefined && !Number.isFinite(numericDistance)) {
      return;
    }

    if (selectedWorkout.kind === "strength" && ((numericSets !== undefined && !Number.isFinite(numericSets)) || (numericReps !== undefined && !Number.isFinite(numericReps)))) {
      return;
    }

    if (selectedWorkout.kind === "interval" && numericRounds !== undefined && !Number.isFinite(numericRounds)) {
      return;
    }

    addWorkout({
      type,
      duration: durationMinutes,
      calories: preview.calories,
      intensity,
      weightKg,
      distanceKm: numericDistance,
      sets: numericSets,
      reps: numericReps,
      rounds: numericRounds,
      estimatedFatLossKg: preview.fatLossKg,
      estimatedFatLossLbs: preview.fatLossLbs,
    });

    // Generate suggestion
    const newSuggestion = generateWorkoutSuggestion(type, durationMinutes, preview.calories);
    setSuggestion(newSuggestion);

    setDuration("");
    setWeight("70");
    setIntensity("Moderate");
    setDistanceKm("");
    setSets("");
    setReps("");
    setRounds("");

    // Reset form after a delay
    setTimeout(() => {
      setShowForm(false);
    }, 2000);
  }

  return (
    <AuthGuard>
      <AppShell>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="mb-1 flex items-center gap-2 text-2xl font-black text-slate-800 dark:text-slate-100">
              <Dumbbell className="h-6 w-6 text-emerald-600" /> Workout Log
            </h2>
            <p className="mb-5 text-sm text-slate-500">Pick a workout type, enter the key details, and we will estimate calories and fat-loss impact automatically.</p>
            <ProgressBar value={categoryProgress["Exercise & Workouts"]} className="mb-2" />
            <p className="mb-6 text-sm text-slate-500">{Math.round(categoryProgress["Exercise & Workouts"])}% of your weekly workout target is covered.</p>

            {!showForm && !suggestion && (
              <button
                onClick={() => setShowForm(true)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                title="Log workout"
                aria-label="Log workout"
              >
                <Plus className="h-6 w-6" />
              </button>
            )}

            {showForm && (
              <form className="space-y-3" onSubmit={submitWorkout}>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Workout Type</label>
                  <select
                    value={type}
                    onChange={(event) => setType(event.target.value as WorkoutMode)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:bg-white dark:text-slate-900"
                    autoFocus
                  >
                    {workoutModes.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500">{selectedWorkout.summary}</p>
                </div>

                <input
                  type="number"
                  min={1}
                  step="0.1"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  placeholder="Duration (minutes)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:bg-white dark:text-slate-900"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="number"
                    min={20}
                    max={300}
                    step="0.1"
                    value={weight}
                    onChange={(event) => setWeight(event.target.value)}
                    placeholder="Body weight (kg)"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:bg-white dark:text-slate-900"
                  />

                  <select
                    value={intensity}
                    onChange={(event) => setIntensity(event.target.value as IntensityLevel)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:bg-white dark:text-slate-900"
                  >
                    <option value="Light">Light</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                {selectedWorkout.kind === "cardio" && (
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    value={distanceKm}
                    onChange={(event) => setDistanceKm(event.target.value)}
                    placeholder="Distance (km, optional but useful)"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:bg-white dark:text-slate-900"
                  />
                )}

                {selectedWorkout.kind === "strength" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="number"
                      min={1}
                      value={sets}
                      onChange={(event) => setSets(event.target.value)}
                      placeholder="Sets"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:bg-white dark:text-slate-900"
                    />
                    <input
                      type="number"
                      min={1}
                      value={reps}
                      onChange={(event) => setReps(event.target.value)}
                      placeholder="Reps per set"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:bg-white dark:text-slate-900"
                    />
                  </div>
                )}

                {selectedWorkout.kind === "interval" && (
                  <input
                    type="number"
                    min={1}
                    value={rounds}
                    onChange={(event) => setRounds(event.target.value)}
                    placeholder="Rounds"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:bg-white dark:text-slate-900"
                  />
                )}

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-slate-200">
                  <p className="mb-1 font-bold text-slate-800 dark:text-slate-100">Automatic estimates</p>
                  {preview ? (
                    <div className="space-y-2">
                      <p className="rounded-xl bg-white/70 p-3 text-slate-700 dark:bg-slate-950/30 dark:text-slate-200">
                        {buildWorkoutFeedback({
                          mode: type,
                          durationMinutes: Number(duration),
                          intensity,
                          calories: preview.calories,
                          distanceKm: distanceKm ? Number(distanceKm) : undefined,
                          sets: sets ? Number(sets) : undefined,
                          reps: reps ? Number(reps) : undefined,
                          rounds: rounds ? Number(rounds) : undefined,
                        })}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                      <p>Calories burned: <span className="font-black text-emerald-700 dark:text-emerald-300">{preview.calories.toLocaleString()} kcal</span></p>
                      <p>Fat loss equivalent: <span className="font-black text-emerald-700 dark:text-emerald-300">{preview.fatLossKg} kg</span></p>
                      <p className="sm:col-span-2">Equivalent in pounds: <span className="font-black text-emerald-700 dark:text-emerald-300">{preview.fatLossLbs} lb</span></p>
                      </div>
                    </div>
                  ) : (
                    <p>Enter duration and body weight to see an automatic estimate.</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white transition hover:bg-emerald-700"
                >
                  Log Workout
                </button>
              </form>
            )}

            {suggestion && (
              <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="mb-2 font-semibold text-slate-800 dark:text-slate-100">{suggestion.comment}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{suggestion.suggestion}</p>
                <button
                  type="button"
                  onClick={() => {
                    setSuggestion(null);
                    setShowForm(true);
                  }}
                  className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  Log another workout
                </button>
                <div className="mt-4">
                  <Link href="/dashboard" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700">
                    Return to Dashboard
                  </Link>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-black text-slate-800 dark:text-slate-100">Recent Workouts</h3>
            <div className="space-y-3">
              {workouts.slice(0, 8).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-200">{item.type}</p>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{item.intensity ?? "Moderate"} intensity</p>
                    </div>
                    <p className="text-right text-sm font-black text-emerald-600 dark:text-emerald-400">{item.calories} kcal</p>
                  </div>
                  <p className="text-sm text-slate-500">
                    {item.duration} min
                    {item.distanceKm ? ` • ${item.distanceKm} km` : ""}
                    {item.sets && item.reps ? ` • ${item.sets}x${item.reps}` : ""}
                    {item.rounds ? ` • ${item.rounds} rounds` : ""}
                  </p>
                  {(item.estimatedFatLossKg || item.estimatedFatLossLbs) && (
                    <p className="mt-1 text-xs text-slate-500">
                      Estimated fat loss: {item.estimatedFatLossKg ?? round(item.calories / 7700, 2)} kg / {item.estimatedFatLossLbs ?? round(item.calories / 3500, 2)} lb
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
