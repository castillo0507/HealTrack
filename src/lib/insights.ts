import { allCategories, type DailySnapshot, type HeartRateEntry, type NutritionEntry, type VitalSignsEntry, type WorkoutEntry } from "./health-store";

type HealthGoals = {
  steps: number;
  waterCups: number;
  sleepHours: number;
};

type TodaySummary = {
  steps: number;
  caloriesBurned: number;
  waterCups: number;
  sleepHours: number;
  sleepQuality: string;
  nutritionCalories: number;
  nutritionProteinGrams: number;
  nutritionCarbsGrams: number;
  nutritionFatGrams: number;
  nutritionFiberGrams: number;
  nutritionSugarGrams: number;
  nutritionSodiumMg: number;
};

export type InsightsInput = {
  categories: string[];
  goals: HealthGoals;
  today: TodaySummary;
  weeklyData: DailySnapshot[];
  workouts: WorkoutEntry[];
  nutritionEntries: NutritionEntry[];
  heartRateEntries: HeartRateEntry[];
  vitalSignsEntries: VitalSignsEntry[];
};

export type CategoryInsight = {
  category: string;
  status: "good" | "watch" | "urgent" | "inactive";
  summary: string;
  trend: string;
  recommendation: string;
  metric: string;
};

export type InsightsReport = {
  overview: string;
  categoryCount: number;
  selectedCategories: number;
  activeCategories: number;
  categoryInsights: CategoryInsight[];
  highlights: string[];
  recommendations: string[];
};

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function percent(value: number, goal: number) {
  if (!Number.isFinite(goal) || goal <= 0) {
    return 0;
  }

  return clamp((value / goal) * 100);
}

function compareSeries(current: number[], previous: number[]) {
  const currentAverage = average(current);
  const previousAverage = average(previous);

  if (currentAverage === 0 && previousAverage === 0) {
    return { label: "stable", delta: 0 };
  }

  const delta = currentAverage - previousAverage;

  if (delta > 5) {
    return { label: "improving", delta };
  }

  if (delta < -5) {
    return { label: "slipping", delta };
  }

  return { label: "stable", delta };
}

function splitTrend(values: number[]) {
  if (values.length < 2) {
    return { label: "not enough history", delta: 0 };
  }

  const midpoint = Math.max(1, Math.floor(values.length / 2));
  const firstHalf = values.slice(0, midpoint);
  const secondHalf = values.slice(midpoint);

  return compareSeries(secondHalf, firstHalf);
}

function recentEntries<T extends { date: string }>(entries: T[], days = 7) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return entries.filter((entry) => Number(new Date(entry.date)) >= cutoff);
}

function latestEntry<T>(entries: T[]) {
  return entries[0];
}

function formatSignedDelta(delta: number, suffix = "") {
  if (delta === 0) {
    return `no change${suffix}`;
  }

  return `${delta > 0 ? "+" : ""}${Math.round(delta)}${suffix}`;
}

function describeTrend(label: string, delta: number, unit: string) {
  if (label === "not enough history") {
    return "Not enough history yet to spot a trend.";
  }

  if (label === "improving") {
    return `Trend is improving by ${formatSignedDelta(delta, unit)}.`;
  }

  if (label === "slipping") {
    return `Trend is slipping by ${formatSignedDelta(Math.abs(delta), unit)}.`;
  }

  return `Trend is stable, with about ${formatSignedDelta(delta, unit)} change.`;
}

function activityInsight(input: InsightsInput): CategoryInsight {
  const selected = input.categories.includes("Physical Activity");
  const weeklySteps = input.weeklyData.map((day) => day.steps);
  const trend = splitTrend(weeklySteps);
  const workoutCount = input.workouts.length;
  const totalWorkoutMinutes = input.workouts.reduce((sum, workout) => sum + workout.duration, 0);
  const metric = `${input.today.steps.toLocaleString()} steps · ${workoutCount} workout${workoutCount === 1 ? "" : "s"}`;
  const summary = input.today.steps > 0 || workoutCount > 0
    ? `${input.today.steps.toLocaleString()} steps today and ${totalWorkoutMinutes} logged workout minutes show how active the day has been.`
    : selected
      ? "Physical activity is selected, but no movement logs have been added yet."
      : "Physical activity is not selected yet and no movement logs are available.";

  let status: CategoryInsight["status"] = "inactive";
  let recommendation = "Log a walk or workout to start building movement trends.";

  const stepProgress = percent(input.today.steps, input.goals.steps);
  if (input.today.steps > 0 || workoutCount > 0) {
    status = stepProgress >= 100 ? "good" : stepProgress >= 60 ? "watch" : "watch";
    recommendation = stepProgress >= 100
      ? "Keep the movement streak going and protect recovery with good hydration and sleep."
      : `A short walk or brief workout can close the ${Math.round(100 - stepProgress)}% gap to today's step goal.`;
  }

  if (workoutCount === 0 && input.today.steps < input.goals.steps / 3) {
    recommendation = "A 10-minute walk would move this category forward without adding a big training load.";
  }

  return {
    category: "Physical Activity",
    status,
    summary,
    trend: describeTrend(trend.label, trend.delta, " steps"),
    recommendation,
    metric,
  };
}

function heartHealthInsight(input: InsightsInput): CategoryInsight {
  const selected = input.categories.includes("Heart Health");
  const latest = latestEntry(input.heartRateEntries);
  const recent = recentEntries(input.heartRateEntries, 7);
  const previous = input.heartRateEntries.slice(1, 4);
  const latestBpm = latest?.bpm ?? 0;
  const resting = latest?.restingBpm ?? 0;
  const hrv = latest?.hrvMs;
  const metric = latest ? `${latestBpm} BPM${resting ? ` · resting ${resting}` : ""}${hrv ? ` · HRV ${hrv} ms` : ""}` : "No readings yet";

  let status: CategoryInsight["status"] = "inactive";
  let summary = selected
    ? "Heart health is selected, but no readings have been logged yet."
    : "Heart health is not selected yet and no readings are available.";
  let recommendation = "Log a baseline heart-rate reading to start building a recovery profile.";

  if (latest) {
    status = latestBpm >= 120 ? "urgent" : latestBpm >= 100 || (hrv !== undefined && hrv < 30) ? "watch" : "good";
    summary = `Latest reading is ${latestBpm} BPM${resting ? ` with a resting baseline of ${resting} BPM` : ""}${hrv ? ` and HRV of ${hrv} ms` : ""}.`;

    if (latestBpm >= 120) {
      recommendation = "Take a recovery break, hydrate, and recheck once you are calm.";
    } else if (hrv !== undefined && hrv < 30) {
      recommendation = "Prioritize sleep and lighter training today to support recovery.";
    } else if (latest.restingBpm && latestBpm - latest.restingBpm >= 15) {
      recommendation = "This is above your resting baseline. Watch stress, caffeine, and hydration.";
    } else {
      recommendation = "Keep logging at the same time each day so your baseline stays meaningful.";
    }
  }

  const trend = latest && previous.length > 0
    ? splitTrend([latestBpm, ...previous.map((entry) => entry.bpm)])
    : { label: recent.length > 1 ? "stable" : "not enough history", delta: 0 };

  return {
    category: "Heart Health",
    status,
    summary,
    trend: latest ? describeTrend(trend.label, trend.delta, " BPM") : "No trend available until a second reading is logged.",
    recommendation,
    metric,
  };
}

function sleepInsight(input: InsightsInput): CategoryInsight {
  const selected = input.categories.includes("Sleep Tracking");
  const weeklySleeps = input.weeklyData.map((day) => day.sleepHours);
  const trend = splitTrend(weeklySleeps);
  const sleepProgress = percent(input.today.sleepHours, input.goals.sleepHours);
  const metric = `${input.today.sleepHours.toFixed(1)} hrs · ${input.today.sleepQuality}`;

  let status: CategoryInsight["status"] = "inactive";
  let summary = selected
    ? "Sleep tracking is selected, but no sleep session has been logged today."
    : "Sleep tracking is not selected yet and no sleep data is available.";
  let recommendation = "Log sleep duration and quality to start seeing rest patterns.";

  if (input.today.sleepHours > 0) {
    status = sleepProgress >= 100 ? "good" : sleepProgress >= 75 ? "watch" : "watch";
    summary = `${input.today.sleepHours.toFixed(1)} hours of ${input.today.sleepQuality.toLowerCase()} sleep is recorded today.`;
    recommendation = sleepProgress >= 100
      ? "You are meeting the sleep goal. Keep the schedule consistent and protect bedtime."
      : `You are ${Math.round(100 - sleepProgress)}% short of the sleep goal. An earlier bedtime would help.`;
  }

  if (input.today.sleepHours > 0 && input.today.sleepHours < input.goals.sleepHours - 1) {
    status = "watch";
  }

  return {
    category: "Sleep Tracking",
    status,
    summary,
    trend: input.today.sleepHours > 0 ? describeTrend(trend.label, trend.delta, " hrs") : "No sleep trend yet.",
    recommendation,
    metric,
  };
}

function hydrationInsight(input: InsightsInput): CategoryInsight {
  const selected = input.categories.includes("Hydration");
  const weeklyWater = input.weeklyData.map((day) => day.waterCups);
  const trend = splitTrend(weeklyWater);
  const progress = percent(input.today.waterCups, input.goals.waterCups);
  const metric = `${input.today.waterCups} / ${input.goals.waterCups} cups`;

  let status: CategoryInsight["status"] = "inactive";
  let summary = selected
    ? "Hydration is selected, but no water has been logged yet."
    : "Hydration is not selected yet and no water logs are available.";
  let recommendation = "Add your first water log to start tracking hydration.";

  if (input.today.waterCups > 0) {
    status = progress >= 100 ? "good" : progress >= 75 ? "watch" : "watch";
    summary = `${input.today.waterCups} cups today puts you at ${Math.round(progress)}% of your hydration goal.`;
    recommendation = progress >= 100
      ? "You hit your hydration goal. Keep the momentum going by drinking steadily through the day."
      : `You still need ${Math.max(0, input.goals.waterCups - input.today.waterCups)} more cup${input.goals.waterCups - input.today.waterCups === 1 ? "" : "s"} to reach the goal.`;
  }

  return {
    category: "Hydration",
    status,
    summary,
    trend: input.today.waterCups > 0 ? describeTrend(trend.label, trend.delta, " cups") : "No hydration trend yet.",
    recommendation,
    metric,
  };
}

function mentalWellnessInsight(input: InsightsInput): CategoryInsight {
  const selected = input.categories.includes("Mental Wellness");
  const sleepScore = percent(input.today.sleepHours, input.goals.sleepHours);
  const hydrationScore = percent(input.today.waterCups, input.goals.waterCups);
  const activityScore = percent(input.today.steps, input.goals.steps);
  const latestHeartRate = latestEntry(input.heartRateEntries);
  const latestVitals = latestEntry(input.vitalSignsEntries);
  const recoveryScore = latestHeartRate
    ? clamp(latestHeartRate.hrvMs !== undefined ? latestHeartRate.hrvMs * 1.6 : latestHeartRate.bpm < 90 ? 70 : 45)
    : 55;
  const wellnessScore = Math.round((sleepScore * 0.35) + (hydrationScore * 0.2) + (activityScore * 0.2) + (recoveryScore * 0.25));

  const status: CategoryInsight["status"] = wellnessScore >= 75 ? "good" : "watch";
  const summary = selected
    ? `Estimated wellness score is ${wellnessScore}/100 based on sleep, hydration, activity, and recovery data.`
    : `Estimated wellness score is ${wellnessScore}/100 even without direct mood entries, using the rest of the day's signals.`;
  let recommendation = "Keep the current balance and log a mood or stress check-in when you want a direct comparison.";

  if (wellnessScore < 50) {
    recommendation = "Reduce pressure today: rest more, hydrate, and keep movement light until recovery improves.";
  } else if (wellnessScore < 75) {
    recommendation = "A short reset, earlier bedtime, or calmer workout could improve the overall signal.";
  }

  if (latestHeartRate && latestHeartRate.bpm >= 100) {
    recommendation = "Elevated heart-rate data suggests stress or load. Prioritize rest and breathing breaks.";
  }

  if (latestVitals && latestVitals.systolic >= 130) {
    recommendation = "The latest vital signs lean elevated, so keep today lighter and lower stress where possible.";
  }

  const metric = `${wellnessScore}/100`;

  return {
    category: "Mental Wellness",
    status,
    summary,
    trend: `Combined recovery signal uses sleep, hydration, steps, and the latest heart/vital signs data${selected ? "." : " to approximate mental load."}`,
    recommendation,
    metric,
  };
}

function nutritionInsight(input: InsightsInput): CategoryInsight {
  const selected = input.categories.includes("Nutrition");
  const latest = latestEntry(input.nutritionEntries);
  const recent = recentEntries(input.nutritionEntries, 7);
  const calorieTarget = 2000;
  const proteinTarget = 100;
  const fiberTarget = 25;
  const calorieProgress = percent(input.today.nutritionCalories, calorieTarget);
  const proteinProgress = percent(input.today.nutritionProteinGrams, proteinTarget);
  const fiberProgress = percent(input.today.nutritionFiberGrams, fiberTarget);
  const metric = `${input.today.nutritionCalories.toLocaleString()} kcal · ${input.today.nutritionProteinGrams}g protein`;

  let status: CategoryInsight["status"] = "inactive";
  let summary = selected
    ? "Nutrition is selected, but no meal logs have been added yet."
    : "Nutrition is not selected yet and no meal logs are available.";
  let recommendation = "Log a meal to see calories, macros, and fiber guidance.";

  if (latest) {
    status = calorieProgress >= 100 ? "watch" : calorieProgress >= 75 ? "good" : "watch";
    summary = `${input.today.nutritionCalories.toLocaleString()} kcal logged today, with ${input.today.nutritionProteinGrams}g protein and ${input.today.nutritionFiberGrams}g fiber.`;
    recommendation = input.today.nutritionProteinGrams < 60
      ? "Add a protein-forward meal later to round out today's intake."
      : input.today.nutritionFiberGrams < 15
        ? "Add vegetables, fruit, or whole grains to lift fiber for the rest of the day."
        : "Nutrition is balanced. Keep meals varied and keep an eye on sodium and sugar.";
  }

  if (input.today.nutritionSodiumMg >= 900) {
    status = status === "good" ? "watch" : status;
  }

  return {
    category: "Nutrition",
    status,
    summary,
    trend: latest
      ? `Today is at ${Math.round(calorieProgress)}% of the calorie target, ${Math.round(proteinProgress)}% of protein target, and ${Math.round(fiberProgress)}% of fiber target.`
      : recent.length > 1
        ? "Multiple meal logs are available, but today's totals are still building."
        : "No nutrition trend yet.",
    recommendation,
    metric,
  };
}

function workoutInsight(input: InsightsInput): CategoryInsight {
  const selected = input.categories.includes("Exercise & Workouts");
  const recent = recentEntries(input.workouts, 7);
  const totalMinutes = input.workouts.reduce((sum, workout) => sum + workout.duration, 0);
  const totalCalories = input.workouts.reduce((sum, workout) => sum + workout.calories, 0);
  const latest = latestEntry(input.workouts);
  const typeCounts = input.workouts.reduce<Record<string, number>>((accumulator, workout) => {
    accumulator[workout.type] = (accumulator[workout.type] ?? 0) + 1;
    return accumulator;
  }, {});
  const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Workout";
  const metric = `${input.workouts.length} session${input.workouts.length === 1 ? "" : "s"} · ${totalMinutes} min`;

  let status: CategoryInsight["status"] = "inactive";
  let summary = selected
    ? "Exercise & Workouts is selected, but no workouts have been logged yet."
    : "Exercise & Workouts is not selected yet and no workout logs are available.";
  let recommendation = "Log a workout to see training volume and calorie trends.";

  if (latest) {
    status = totalMinutes >= 150 ? "good" : totalMinutes >= 60 ? "watch" : "watch";
    summary = `${input.workouts.length} workout${input.workouts.length === 1 ? "" : "s"} total ${totalMinutes} minutes and ${totalCalories} calories burned.`;
    recommendation = totalMinutes >= 150
      ? "Great volume. Keep variety in the mix and protect recovery with sleep and hydration."
      : `You have ${Math.max(0, 150 - totalMinutes)} more minutes of activity to reach a stronger weekly base.`;
  }

  const trend = recent.length > 1 ? splitTrend(recent.map((workout) => workout.duration)) : { label: "not enough history", delta: 0 };

  return {
    category: "Exercise & Workouts",
    status,
    summary,
    trend: recent.length > 1 ? `Recent workouts are ${trend.label} in duration, and ${mostCommonType.toLowerCase()} is the most common pattern.` : "No workout trend yet.",
    recommendation: latest ? recommendation : "Add a workout session to unlock training volume insights.",
    metric,
  };
}

function vitalSignsInsight(input: InsightsInput): CategoryInsight {
  const selected = input.categories.includes("Vital Signs");
  const latest = latestEntry(input.vitalSignsEntries);
  const previous = input.vitalSignsEntries.slice(1, 4);
  const metric = latest
    ? `${latest.systolic}/${latest.diastolic} mmHg · ${latest.spo2}% SpO2 · ${latest.temperature.toFixed(1)}°${latest.temperatureUnit}`
    : "No readings yet";

  let status: CategoryInsight["status"] = "inactive";
  let summary = selected
    ? "Vital Signs is selected, but no reading has been logged yet."
    : "Vital Signs is not selected yet and no readings are available.";
  let recommendation = "Log blood pressure, SpO2, and temperature to establish a baseline.";

  if (latest) {
    if (latest.systolic >= 180 || latest.diastolic >= 120 || latest.spo2 < 90) {
      status = "urgent";
    } else if (latest.systolic >= 130 || latest.diastolic >= 80 || latest.spo2 < 95 || latest.temperature >= 37.8) {
      status = "watch";
    } else {
      status = "good";
    }

    summary = `Latest reading is ${latest.systolic}/${latest.diastolic} mmHg, ${latest.spo2}% SpO2, and ${latest.temperature.toFixed(1)}°${latest.temperatureUnit}.`;
    recommendation = latest.systolic >= 130 || latest.diastolic >= 80
      ? "Rest and repeat the reading later to see whether the pattern settles." : "Vitals look steady. Keep measuring at the same time each day for consistency.";
  }

  const systolicTrend = latest && previous.length > 0 ? splitTrend([latest.systolic, ...previous.map((entry) => entry.systolic)]) : { label: "not enough history", delta: 0 };
  const diastolicTrend = latest && previous.length > 0 ? splitTrend([latest.diastolic, ...previous.map((entry) => entry.diastolic)]) : { label: "not enough history", delta: 0 };
  const spo2Trend = latest && previous.length > 0 ? splitTrend([latest.spo2, ...previous.map((entry) => entry.spo2)]) : { label: "not enough history", delta: 0 };

  return {
    category: "Vital Signs",
    status,
    summary,
    trend: latest
      ? `Recent vital signs are ${systolicTrend.label} for systolic pressure, ${diastolicTrend.label} for diastolic pressure, and ${spo2Trend.label} for oxygen saturation.`
      : "No vital-sign trend yet.",
    recommendation,
    metric,
  };
}

export function buildInsightsReport(input: InsightsInput): InsightsReport {
  const categoryInsights = allCategories.map((category) => {
    switch (category) {
      case "Physical Activity":
        return activityInsight(input);
      case "Heart Health":
        return heartHealthInsight(input);
      case "Sleep Tracking":
        return sleepInsight(input);
      case "Hydration":
        return hydrationInsight(input);
      case "Mental Wellness":
        return mentalWellnessInsight(input);
      case "Nutrition":
        return nutritionInsight(input);
      case "Exercise & Workouts":
        return workoutInsight(input);
      case "Vital Signs":
        return vitalSignsInsight(input);
      default:
        return {
          category,
          status: "inactive" as const,
          summary: "No insight available.",
          trend: "No insight available.",
          recommendation: "No insight available.",
          metric: "—",
        };
    }
  });

  const activeCategories = categoryInsights.filter((item) => item.status !== "inactive").length;
  const selectedCategories = input.categories.length;
  const attentionNeeded = categoryInsights.filter((item) => item.status === "watch" || item.status === "urgent");
  const currentStreak = "activity";

  const highlights = [
    `${selectedCategories} category${selectedCategories === 1 ? " is" : "s are"} selected, with ${activeCategories} currently active in the data feed.`,
    `${input.workouts.length} workout${input.workouts.length === 1 ? "" : "s"}, ${input.nutritionEntries.length} meal log${input.nutritionEntries.length === 1 ? "" : "s"}, ${input.heartRateEntries.length} heart-rate reading${input.heartRateEntries.length === 1 ? "" : "s"}, and ${input.vitalSignsEntries.length} vital-sign reading${input.vitalSignsEntries.length === 1 ? "s" : ""} are available for analysis.`,
  ];

  if (currentStreak) {
    highlights.push(`Your recent movement and logging consistency is carrying across multiple categories.`);
  }

  const recommendations = attentionNeeded.slice(0, 4).map((item) => `${item.category}: ${item.recommendation}`);

  if (recommendations.length < 4) {
    const filler = categoryInsights
      .filter((item) => item.status === "good")
      .slice(0, 4 - recommendations.length)
      .map((item) => `${item.category}: ${item.recommendation}`);
    recommendations.push(...filler);
  }

  if (input.categories.includes("Mental Wellness") && !input.heartRateEntries.length && !input.vitalSignsEntries.length) {
    recommendations.push("Mental Wellness: Log a mood or stress check-in later today to complement the recovery signals.");
  }

  return {
    overview: `${activeCategories} of ${allCategories.length} categories currently have usable data.`,
    categoryCount: allCategories.length,
    selectedCategories,
    activeCategories,
    categoryInsights,
    highlights,
    recommendations: recommendations.slice(0, 4),
  };
}