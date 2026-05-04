"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Clock3, UtensilsCrossed } from "lucide-react";
import { AppShell } from "@/components/shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card, ProgressBar, Stat } from "@/components/ui";
import { useHealth } from "@/lib/health-store";
import { generateNutritionAnalysis, type MetricAnalysis } from "@/lib/suggestions";

type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Drink";

type FoodProfile = {
  matchers: string[];
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  sugarGrams: number;
  sodiumMg: number;
};

type NutritionPreview = {
  mealType: MealType;
  category: string;
  servings: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  sugarGrams: number;
  sodiumMg: number;
};

const mealTypes: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack", "Drink"];

const foodProfiles: FoodProfile[] = [
  { matchers: ["greek yogurt", "yogurt"], calories: 130, proteinGrams: 18, carbsGrams: 8, fatGrams: 4, fiberGrams: 0, sugarGrams: 6, sodiumMg: 70 },
  { matchers: ["eggs", "egg"], calories: 72, proteinGrams: 6, carbsGrams: 0, fatGrams: 5, fiberGrams: 0, sugarGrams: 0, sodiumMg: 70 },
  { matchers: ["oatmeal", "oats"], calories: 150, proteinGrams: 5, carbsGrams: 27, fatGrams: 3, fiberGrams: 4, sugarGrams: 1, sodiumMg: 2 },
  { matchers: ["avocado toast", "avocado"], calories: 160, proteinGrams: 3, carbsGrams: 12, fatGrams: 11, fiberGrams: 5, sugarGrams: 1, sodiumMg: 140 },
  { matchers: ["chicken", "grilled chicken"], calories: 165, proteinGrams: 31, carbsGrams: 0, fatGrams: 4, fiberGrams: 0, sugarGrams: 0, sodiumMg: 75 },
  { matchers: ["salmon"], calories: 208, proteinGrams: 22, carbsGrams: 0, fatGrams: 13, fiberGrams: 0, sugarGrams: 0, sodiumMg: 59 },
  { matchers: ["rice bowl", "rice"], calories: 205, proteinGrams: 4, carbsGrams: 45, fatGrams: 1, fiberGrams: 1, sugarGrams: 0, sodiumMg: 3 },
  { matchers: ["salad"], calories: 120, proteinGrams: 4, carbsGrams: 10, fatGrams: 7, fiberGrams: 4, sugarGrams: 4, sodiumMg: 160 },
  { matchers: ["banana"], calories: 105, proteinGrams: 1, carbsGrams: 27, fatGrams: 0, fiberGrams: 3, sugarGrams: 14, sodiumMg: 1 },
  { matchers: ["apple"], calories: 95, proteinGrams: 0, carbsGrams: 25, fatGrams: 0, fiberGrams: 4, sugarGrams: 19, sodiumMg: 2 },
  { matchers: ["protein shake", "protein smoothie", "shake"], calories: 210, proteinGrams: 30, carbsGrams: 10, fatGrams: 5, fiberGrams: 2, sugarGrams: 4, sodiumMg: 180 },
  { matchers: ["sandwich"], calories: 320, proteinGrams: 18, carbsGrams: 32, fatGrams: 12, fiberGrams: 4, sugarGrams: 5, sodiumMg: 640 },
  { matchers: ["pasta"], calories: 280, proteinGrams: 10, carbsGrams: 52, fatGrams: 4, fiberGrams: 3, sugarGrams: 6, sodiumMg: 420 },
  { matchers: ["nuts", "almonds", "peanut butter"], calories: 170, proteinGrams: 6, carbsGrams: 6, fatGrams: 14, fiberGrams: 3, sugarGrams: 2, sodiumMg: 0 },
  { matchers: ["coffee", "latte"], calories: 80, proteinGrams: 2, carbsGrams: 10, fatGrams: 3, fiberGrams: 0, sugarGrams: 8, sodiumMg: 60 },
  { matchers: ["juice", "smoothie"], calories: 140, proteinGrams: 2, carbsGrams: 34, fatGrams: 1, fiberGrams: 2, sugarGrams: 25, sodiumMg: 15 },
];

const quickLogs = [
  { label: "Protein breakfast", mealType: "Breakfast" as MealType, foodLabel: "Greek yogurt, berries, oats", servings: 1 },
  { label: "Lunch bowl", mealType: "Lunch" as MealType, foodLabel: "Chicken, rice, salad", servings: 1 },
  { label: "Light snack", mealType: "Snack" as MealType, foodLabel: "Apple, nuts", servings: 1 },
  { label: "Recovery shake", mealType: "Drink" as MealType, foodLabel: "Protein shake, banana", servings: 1 },
];

function formatLoggedAt(date: string) {
  return new Date(date).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function severityStyles(severity: MetricAnalysis["severity"]) {
  if (severity === "urgent") {
    return "border-brand-200 bg-brand-50 text-slate-700";
  }

  if (severity === "watch") {
    return "border-slate-200 bg-slate-50 text-slate-700";
  }

  return "border-brand-200 bg-brand-50 text-slate-700";
}

function parseQuantity(input: string) {
  const match = input.trim().match(/^([0-9]+(?:\.[0-9]+)?)\s+(.*)$/);

  if (!match) {
    return { quantity: 1, text: input.trim() };
  }

  return { quantity: Number(match[1]), text: match[2].trim() };
}

function lookupFoodProfile(foodText: string) {
  const normalized = foodText.toLowerCase();

  for (const profile of foodProfiles) {
    if (profile.matchers.some((matcher) => normalized.includes(matcher))) {
      return profile;
    }
  }

  return { calories: 180, proteinGrams: 8, carbsGrams: 18, fatGrams: 7, fiberGrams: 3, sugarGrams: 5, sodiumMg: 180 };
}

function classifyCategory(input: Pick<NutritionPreview, "proteinGrams" | "carbsGrams" | "fatGrams">) {
  if (input.proteinGrams >= input.carbsGrams && input.proteinGrams >= input.fatGrams) {
    return "Protein-rich";
  }

  if (input.carbsGrams >= input.proteinGrams && input.carbsGrams >= input.fatGrams) {
    return "Carb-forward";
  }

  if (input.fatGrams >= input.proteinGrams && input.fatGrams >= input.carbsGrams) {
    return "Energy-dense";
  }

  return "Balanced";
}

function estimateNutritionPreview(foodLabel: string, mealType: MealType, servings: number): NutritionPreview | null {
  const parts = foodLabel
    .split(/[,;+]/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0 || servings <= 0) {
    return null;
  }

  const totals = parts.reduce(
    (accumulator, part) => {
      const { quantity, text } = parseQuantity(part);
      const profile = lookupFoodProfile(text);
      const scaled = quantity * servings;

      accumulator.calories += profile.calories * scaled;
      accumulator.proteinGrams += profile.proteinGrams * scaled;
      accumulator.carbsGrams += profile.carbsGrams * scaled;
      accumulator.fatGrams += profile.fatGrams * scaled;
      accumulator.fiberGrams += profile.fiberGrams * scaled;
      accumulator.sugarGrams += profile.sugarGrams * scaled;
      accumulator.sodiumMg += profile.sodiumMg * scaled;

      return accumulator;
    },
    {
      calories: 0,
      proteinGrams: 0,
      carbsGrams: 0,
      fatGrams: 0,
      fiberGrams: 0,
      sugarGrams: 0,
      sodiumMg: 0,
    },
  );

  return {
    mealType,
    servings,
    category: classifyCategory(totals),
    ...totals,
  };
}

export default function NutritionPage() {
  const { today, nutritionEntries, addNutrition } = useHealth();
  const [foodLabel, setFoodLabel] = useState("Greek yogurt, oats, berries");
  const [mealType, setMealType] = useState<MealType>("Breakfast");
  const [servings, setServings] = useState("1");
  const [analysis, setAnalysis] = useState<MetricAnalysis | null>(null);

  const preview = useMemo(() => {
    const value = Number(servings);

    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }

    return estimateNutritionPreview(foodLabel, mealType, value);
  }, [foodLabel, mealType, servings]);

  function submitNutrition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const servingsValue = Number(servings);

    if (!preview || !Number.isFinite(servingsValue) || servingsValue <= 0) {
      return;
    }

    addNutrition({
      foodLabel: foodLabel.trim(),
      mealType: preview.mealType,
      category: preview.category,
      servings: servingsValue,
      calories: preview.calories,
      proteinGrams: preview.proteinGrams,
      carbsGrams: preview.carbsGrams,
      fatGrams: preview.fatGrams,
      fiberGrams: preview.fiberGrams,
      sugarGrams: preview.sugarGrams,
      sodiumMg: preview.sodiumMg,
    });

    setAnalysis(
      generateNutritionAnalysis({
        foodLabel: foodLabel.trim(),
        mealType: preview.mealType,
        category: preview.category,
        servings: servingsValue,
        calories: preview.calories,
        proteinGrams: preview.proteinGrams,
        carbsGrams: preview.carbsGrams,
        fatGrams: preview.fatGrams,
        fiberGrams: preview.fiberGrams,
        sugarGrams: preview.sugarGrams,
        sodiumMg: preview.sodiumMg,
        dailyCalories: today.nutritionCalories + preview.calories,
        dailyProteinGrams: today.nutritionProteinGrams + preview.proteinGrams,
        dailyFiberGrams: today.nutritionFiberGrams + preview.fiberGrams,
      }),
    );
  }

  const nutritionProgress = Math.min(100, (today.nutritionCalories / 2000) * 100);

  return (
    <AuthGuard>
      <AppShell>
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="mb-1 flex items-center gap-2 text-2xl font-black text-slate-800">
                  <UtensilsCrossed className="h-6 w-6 text-brand-700" /> Nutrition Log
                </h2>
                <p className="text-sm text-slate-500">Type what you ate, and the app estimates calories, macros, and daily impact automatically.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-right shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Today&apos;s Intake</p>
                <p className="text-lg font-black text-brand-700">{today.nutritionCalories.toLocaleString()} kcal</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Calories" value={today.nutritionCalories.toLocaleString()} hint="Daily total" />
              <Stat label="Protein" value={`${today.nutritionProteinGrams}g`} hint="Satiety and repair" />
              <Stat label="Fiber" value={`${today.nutritionFiberGrams}g`} hint="Digestion support" />
            </div>

            <form className="mt-6 space-y-3" onSubmit={submitNutrition}>
              <div>
                <label htmlFor="food-label" className="mb-1 block text-sm font-semibold text-slate-600">
                  Food or meal
                </label>
                <input
                  id="food-label"
                  type="text"
                  value={foodLabel}
                  onChange={(event) => setFoodLabel(event.target.value)}
                  placeholder="Chicken, rice, salad"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  autoFocus
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="meal-type" className="mb-1 block text-sm font-semibold text-slate-600">
                    Meal type
                  </label>
                  <select
                    id="meal-type"
                    value={mealType}
                    onChange={(event) => setMealType(event.target.value as MealType)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  >
                    {mealTypes.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="servings" className="mb-1 block text-sm font-semibold text-slate-600">
                    Servings
                  </label>
                  <input
                    id="servings"
                    type="number"
                    min={1}
                    step="1"
                    value={servings}
                    onChange={(event) => setServings(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {quickLogs.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setFoodLabel(preset.foodLabel);
                      setMealType(preset.mealType);
                      setServings(String(preset.servings));
                    }}
                    className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-brand-600 py-3 font-bold text-white transition hover:bg-brand-700"
              >
                Log Nutrition
              </button>
            </form>

            {preview && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Live Preview</p>
                    <p className="text-lg font-black text-brand-700">{preview.calories.toLocaleString()} kcal</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1">{preview.category}</span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1">{preview.mealType}</span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1">{preview.servings} serving{preview.servings > 1 ? "s" : ""}</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">Protein: <span className="font-bold">{preview.proteinGrams}g</span></div>
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">Carbs: <span className="font-bold">{preview.carbsGrams}g</span></div>
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">Fat: <span className="font-bold">{preview.fatGrams}g</span></div>
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">Fiber: <span className="font-bold">{preview.fiberGrams}g</span></div>
                </div>
              </div>
            )}

            {analysis && (
              <div className={`mt-6 rounded-2xl border p-4 ${severityStyles(analysis.severity)}`}>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.2em]">Personalized Feedback</p>
                <p className="text-sm font-semibold">{analysis.feedback}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.18em]">Insights</p>
                    <ul className="space-y-2 text-sm">
                      {analysis.insights.map((item) => (
                        <li key={item} className="rounded-xl bg-white px-3 py-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.18em]">Recommendations</p>
                    <ul className="space-y-2 text-sm">
                      {analysis.recommendations.map((item) => (
                        <li key={item} className="rounded-xl bg-white px-3 py-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href="/dashboard" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700">
                    Return to Dashboard
                  </Link>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-800">
              <Clock3 className="h-5 w-5 text-brand-700" /> Recent Nutrition Logs
            </h3>

            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-600">Progress toward a 2,000 kcal target</p>
                <ProgressBar value={nutritionProgress} className="mt-2" />
                <p className="mt-2 text-xs text-slate-500">{Math.round(nutritionProgress)}% of goal reached today.</p>
              </div>

              {nutritionEntries.length > 0 ? (
                nutritionEntries.slice(0, 6).map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-black text-slate-900">{entry.foodLabel}</p>
                        <p className="text-sm text-slate-500">{entry.mealType} · {entry.category} · {entry.servings} serving{entry.servings > 1 ? "s" : ""}</p>
                      </div>
                      <p className="text-right text-xs text-slate-500">{formatLoggedAt(entry.date)}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1">{entry.calories} kcal</span>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1">P {entry.proteinGrams}g</span>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1">C {entry.carbsGrams}g</span>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1">F {entry.fatGrams}g</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                  No nutrition logs yet. Add a meal to see automatic calorie and macro estimates.
                </div>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
              <p className="mb-1 font-semibold text-slate-700">How it works</p>
              <p>Food names are matched locally to common foods, then combined into a macro estimate with personalized guidance.</p>
            </div>
          </Card>
        </div>
      </AppShell>
    </AuthGuard>
  );
}