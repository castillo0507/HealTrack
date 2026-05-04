import type { DailySnapshot, HeartRateEntry, NutritionEntry, VitalSignsEntry, WorkoutEntry } from "./health-store";

type Goals = {
  steps: number;
  waterCups: number;
  sleepHours: number;
};

type Today = {
  steps: number;
  caloriesBurned: number;
  waterCups: number;
  sleepHours: number;
  nutritionCalories: number;
  nutritionProteinGrams: number;
  nutritionFiberGrams: number;
  nutritionSodiumMg: number;
};

export type CategoryProgressInput = {
  goals: Goals;
  today: Today;
  workouts: WorkoutEntry[];
  nutritionEntries: NutritionEntry[];
  heartRateEntries: HeartRateEntry[];
  vitalSignsEntries: VitalSignsEntry[];
};

export type CategoryProgressMap = Record<
  | "Physical Activity"
  | "Heart Health"
  | "Sleep Tracking"
  | "Hydration"
  | "Mental Wellness"
  | "Nutrition"
  | "Exercise & Workouts"
  | "Vital Signs",
  number
>;

type MonthlySnapshot = {
  name: string;
  steps: number;
  waterCups: number;
  sleepHours: number;
};

export type PeriodProgressInput = CategoryProgressInput & {
  weeklyData: DailySnapshot[];
  monthlyData: MonthlySnapshot[];
};

export type OverallProgressSummary = {
  overallProgress: number;
  trackedCategories: number;
  totalCategories: number;
  categoryProgress: CategoryProgressMap;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percent(current: number, goal: number) {
  if (!Number.isFinite(goal) || goal <= 0) {
    return 0;
  }

  return clamp((current / goal) * 100);
}

function recentEntries<T extends { date: string }>(entries: T[], days: number) {
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  return entries.filter((entry) => Number(new Date(entry.date)) >= cutoff);
}

function scoreFromPeriodCategoryProgress(categoryProgress: CategoryProgressMap): OverallProgressSummary {
  const scores = Object.values(categoryProgress);
  const trackedScores = scores.filter((score) => score > 0);

  return {
    overallProgress: trackedScores.length
      ? Math.round(trackedScores.reduce((sum, score) => sum + score, 0) / trackedScores.length)
      : 0,
    trackedCategories: trackedScores.length,
    totalCategories: scores.length,
    categoryProgress,
  };
}

function periodStepsProgress(goals: Goals, dailyAverageSteps: number) {
  return percent(dailyAverageSteps, goals.steps);
}

function periodSleepProgress(goals: Goals, dailyAverageSleepHours: number) {
  return percent(dailyAverageSleepHours, goals.sleepHours);
}

function periodHydrationProgress(goals: Goals, dailyAverageWaterCups: number) {
  return percent(dailyAverageWaterCups, goals.waterCups);
}

function periodWorkoutProgress(workouts: WorkoutEntry[], days: number) {
  const totalMinutes = workouts.reduce((sum, workout) => sum + workout.duration, 0);
  const totalCalories = workouts.reduce((sum, workout) => sum + workout.calories, 0);
  const minuteGoal = 150 * (days / 7);
  const calorieGoal = 600 * (days / 7);

  return Math.round((percent(totalMinutes, minuteGoal) * 0.7) + (percent(totalCalories, calorieGoal) * 0.3));
}

function periodNutritionProgress(entries: NutritionEntry[], days: number) {
  if (!entries.length) {
    return 0;
  }

  const totals = entries.reduce((sum, entry) => {
    return {
      calories: sum.calories + entry.calories,
      proteinGrams: sum.proteinGrams + entry.proteinGrams,
      fiberGrams: sum.fiberGrams + entry.fiberGrams,
    };
  }, {
    calories: 0,
    proteinGrams: 0,
    fiberGrams: 0,
  });

  const dailyCalories = totals.calories / days;
  const dailyProtein = totals.proteinGrams / days;
  const dailyFiber = totals.fiberGrams / days;

  const calories = percent(dailyCalories, 2000);
  const protein = percent(dailyProtein, 100);
  const fiber = percent(dailyFiber, 25);

  return Math.round((calories * 0.55) + (protein * 0.3) + (fiber * 0.15));
}

function periodHeartProgress(entries: HeartRateEntry[]) {
  const latest = entries[0];

  if (!latest) {
    return 0;
  }

  const readingTarget = 7;
  const readingProgress = percent(Math.min(entries.length, readingTarget), readingTarget) * 0.35;
  const rangeProgress = latest.bpm >= 60 && latest.bpm <= 100 ? 25 : latest.bpm >= 50 && latest.bpm <= 120 ? 12 : 0;
  const baselineProgress = latest.restingBpm ? 15 : 0;
  const hrvProgress = latest.hrvMs ? 15 : 0;
  const consistencyProgress = entries.length > 1 && Math.abs(latest.bpm - entries[1].bpm) <= 15 ? 10 : 0;

  return clamp(readingProgress + rangeProgress + baselineProgress + hrvProgress + consistencyProgress);
}

function periodVitalSignsProgress(entries: VitalSignsEntry[]) {
  const latest = entries[0];

  if (!latest) {
    return 0;
  }

  const readingTarget = 7;
  const readingProgress = percent(Math.min(entries.length, readingTarget), readingTarget) * 0.3;

  let healthProgress = 0;
  if (latest.systolic < 120 && latest.diastolic < 80) {
    healthProgress += 25;
  } else if (latest.systolic < 130 && latest.diastolic < 85) {
    healthProgress += 15;
  }

  if (latest.spo2 >= 95) {
    healthProgress += 20;
  } else if (latest.spo2 >= 90) {
    healthProgress += 10;
  }

  if (latest.temperature >= 36 && latest.temperature <= 37.8) {
    healthProgress += 15;
  } else if (latest.temperature >= 35.5 && latest.temperature < 36 || latest.temperature > 37.8 && latest.temperature <= 38.5) {
    healthProgress += 5;
  }

  const consistencyProgress = entries.length > 1 ? 10 : 0;

  return clamp(readingProgress + healthProgress + consistencyProgress);
}

function periodMentalWellnessProgress(input: {
  steps: number;
  sleep: number;
  hydration: number;
  workout: number;
  nutrition: number;
  heart: number;
  vitalSigns: number;
}) {
  return Math.round(clamp(
    (input.sleep * 0.25)
    + (input.hydration * 0.15)
    + (input.steps * 0.2)
    + (input.workout * 0.1)
    + (input.nutrition * 0.15)
    + (input.heart * 0.075)
    + (input.vitalSigns * 0.075),
  ));
}

function stepsProgress(input: CategoryProgressInput) {
  return percent(input.today.steps, input.goals.steps);
}

function sleepProgress(input: CategoryProgressInput) {
  return percent(input.today.sleepHours, input.goals.sleepHours);
}

function hydrationProgress(input: CategoryProgressInput) {
  return percent(input.today.waterCups, input.goals.waterCups);
}

function workoutProgress(input: CategoryProgressInput) {
  const totalMinutes = input.workouts.reduce((sum, workout) => sum + workout.duration, 0);
  const totalCalories = input.workouts.reduce((sum, workout) => sum + workout.calories, 0);

  return Math.round((percent(totalMinutes, 150) * 0.7) + (percent(totalCalories, 600) * 0.3));
}

function nutritionProgress(input: CategoryProgressInput) {
  const calories = percent(input.today.nutritionCalories, 2000);
  const protein = percent(input.today.nutritionProteinGrams, 100);
  const fiber = percent(input.today.nutritionFiberGrams, 25);

  return Math.round((calories * 0.55) + (protein * 0.3) + (fiber * 0.15));
}

function heartProgress(input: CategoryProgressInput) {
  const latest = input.heartRateEntries[0];

  if (!latest) {
    return 0;
  }

  const readingProgress = percent(Math.min(input.heartRateEntries.length, 7), 7) * 0.35;
  const rangeProgress = latest.bpm >= 60 && latest.bpm <= 100 ? 25 : latest.bpm >= 50 && latest.bpm <= 120 ? 12 : 0;
  const baselineProgress = latest.restingBpm ? 15 : 0;
  const hrvProgress = latest.hrvMs ? 15 : 0;
  const consistencyProgress = input.heartRateEntries.length > 1 && Math.abs(latest.bpm - input.heartRateEntries[1].bpm) <= 15 ? 10 : 0;

  return clamp(readingProgress + rangeProgress + baselineProgress + hrvProgress + consistencyProgress);
}

function vitalSignsProgress(input: CategoryProgressInput) {
  const latest = input.vitalSignsEntries[0];

  if (!latest) {
    return 0;
  }

  const readingProgress = percent(Math.min(input.vitalSignsEntries.length, 7), 7) * 0.3;

  let healthProgress = 0;
  if (latest.systolic < 120 && latest.diastolic < 80) {
    healthProgress += 25;
  } else if (latest.systolic < 130 && latest.diastolic < 85) {
    healthProgress += 15;
  }

  if (latest.spo2 >= 95) {
    healthProgress += 20;
  } else if (latest.spo2 >= 90) {
    healthProgress += 10;
  }

  if (latest.temperature >= 36 && latest.temperature <= 37.8) {
    healthProgress += 15;
  } else if (latest.temperature >= 35.5 && latest.temperature < 36 || latest.temperature > 37.8 && latest.temperature <= 38.5) {
    healthProgress += 5;
  }

  const consistencyProgress = input.vitalSignsEntries.length > 1 ? 10 : 0;

  return clamp(readingProgress + healthProgress + consistencyProgress);
}

function mentalWellnessProgress(input: CategoryProgressInput) {
  const componentScores = [
    sleepProgress(input) * 0.25,
    hydrationProgress(input) * 0.15,
    stepsProgress(input) * 0.2,
    workoutProgress(input) * 0.1,
    nutritionProgress(input) * 0.15,
    heartProgress(input) * 0.075,
    vitalSignsProgress(input) * 0.075,
  ];

  return Math.round(clamp(componentScores.reduce((sum, value) => sum + value, 0)));
}

export function buildCategoryProgress(input: CategoryProgressInput): CategoryProgressMap {
  return {
    "Physical Activity": stepsProgress(input),
    "Heart Health": heartProgress(input),
    "Sleep Tracking": sleepProgress(input),
    Hydration: hydrationProgress(input),
    "Mental Wellness": mentalWellnessProgress(input),
    Nutrition: nutritionProgress(input),
    "Exercise & Workouts": workoutProgress(input),
    "Vital Signs": vitalSignsProgress(input),
  };
}

export function buildWeeklyOverallProgress(input: PeriodProgressInput): OverallProgressSummary {
  const dailyAverageSteps = average(input.weeklyData.map((day) => day.steps));
  const dailyAverageWater = average(input.weeklyData.map((day) => day.waterCups));
  const dailyAverageSleep = average(input.weeklyData.map((day) => day.sleepHours));

  const weeklyWorkouts = recentEntries(input.workouts, 7);
  const weeklyNutrition = recentEntries(input.nutritionEntries, 7);
  const weeklyHeart = recentEntries(input.heartRateEntries, 7);
  const weeklyVitals = recentEntries(input.vitalSignsEntries, 7);

  const steps = periodStepsProgress(input.goals, dailyAverageSteps);
  const sleep = periodSleepProgress(input.goals, dailyAverageSleep);
  const hydration = periodHydrationProgress(input.goals, dailyAverageWater);
  const workout = periodWorkoutProgress(weeklyWorkouts, 7);
  const nutrition = periodNutritionProgress(weeklyNutrition, 7);
  const heart = periodHeartProgress(weeklyHeart);
  const vitalSigns = periodVitalSignsProgress(weeklyVitals);

  const categoryProgress: CategoryProgressMap = {
    "Physical Activity": steps,
    "Heart Health": heart,
    "Sleep Tracking": sleep,
    Hydration: hydration,
    "Mental Wellness": periodMentalWellnessProgress({
      steps,
      sleep,
      hydration,
      workout,
      nutrition,
      heart,
      vitalSigns,
    }),
    Nutrition: nutrition,
    "Exercise & Workouts": workout,
    "Vital Signs": vitalSigns,
  };

  return scoreFromPeriodCategoryProgress(categoryProgress);
}

export function buildMonthlyOverallProgress(input: PeriodProgressInput): OverallProgressSummary {
  const monthlyAverages = {
    weeklySteps: average(input.monthlyData.map((week) => week.steps)),
    weeklyWater: average(input.monthlyData.map((week) => week.waterCups)),
    weeklySleep: average(input.monthlyData.map((week) => week.sleepHours)),
  };

  const monthlyWorkouts = recentEntries(input.workouts, 30);
  const monthlyNutrition = recentEntries(input.nutritionEntries, 30);
  const monthlyHeart = recentEntries(input.heartRateEntries, 30);
  const monthlyVitals = recentEntries(input.vitalSignsEntries, 30);

  const dailyAverageSteps = monthlyAverages.weeklySteps / 7;
  const dailyAverageWater = monthlyAverages.weeklyWater / 7;
  const dailyAverageSleep = monthlyAverages.weeklySleep / 7;

  const steps = periodStepsProgress(input.goals, dailyAverageSteps);
  const sleep = periodSleepProgress(input.goals, dailyAverageSleep);
  const hydration = periodHydrationProgress(input.goals, dailyAverageWater);
  const workout = periodWorkoutProgress(monthlyWorkouts, 30);
  const nutrition = periodNutritionProgress(monthlyNutrition, 30);
  const heart = periodHeartProgress(monthlyHeart);
  const vitalSigns = periodVitalSignsProgress(monthlyVitals);

  const categoryProgress: CategoryProgressMap = {
    "Physical Activity": steps,
    "Heart Health": heart,
    "Sleep Tracking": sleep,
    Hydration: hydration,
    "Mental Wellness": periodMentalWellnessProgress({
      steps,
      sleep,
      hydration,
      workout,
      nutrition,
      heart,
      vitalSigns,
    }),
    Nutrition: nutrition,
    "Exercise & Workouts": workout,
    "Vital Signs": vitalSigns,
  };

  return scoreFromPeriodCategoryProgress(categoryProgress);
}