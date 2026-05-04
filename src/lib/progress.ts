import type { HeartRateEntry, NutritionEntry, VitalSignsEntry, WorkoutEntry } from "./health-store";

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

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function percent(current: number, goal: number) {
  if (!Number.isFinite(goal) || goal <= 0) {
    return 0;
  }

  return clamp((current / goal) * 100);
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