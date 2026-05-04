import type { SleepQuality, TemperatureUnit } from "./health-store";

export type SuggestionData = {
  comment: string;
  suggestion: string;
};

export type MetricAnalysis = {
  feedback: string;
  insights: string[];
  recommendations: string[];
  severity: "good" | "watch" | "urgent";
};

export function generateStepsSuggestion(steps: number, totalSteps: number, goal: number): SuggestionData {
  const percentage = (totalSteps / goal) * 100;
  
  const comments = [
    `Great job! You've logged ${steps.toLocaleString()} steps.`,
    `Nice! Adding ${steps.toLocaleString()} steps to your daily total.`,
    `Awesome! ${steps.toLocaleString()} more steps recorded.`,
    `Excellent! You're making progress with ${steps.toLocaleString()} steps.`,
  ];
  
  const suggestions: Record<string, string[]> = {
    low: [
      "Try taking the stairs next time instead of the elevator.",
      "Consider a short 5-minute walk to boost your step count.",
      "Park farther away to add more steps to your day.",
      "Walk while on phone calls to increase your daily movement.",
    ],
    moderate: [
      "Keep up the pace! You're on track to reach your goal.",
      "You're doing well. A quick walk could push you over the top.",
      "Almost there! Keep moving to reach your daily target.",
      "Great consistency! You're close to your daily goal.",
    ],
    high: [
      "Fantastic! You've crushed your daily step goal! 🎉",
      "Outstanding performance! You've exceeded your target.",
      "Incredible! You're a step champion today.",
      "Amazing! You're well above your daily goal. Keep it up!",
    ],
  };

  const comment = comments[Math.floor(Math.random() * comments.length)];
  let category: keyof typeof suggestions;
  
  if (percentage < 50) {
    category = "low";
  } else if (percentage < 100) {
    category = "moderate";
  } else {
    category = "high";
  }

  const suggestion = suggestions[category][Math.floor(Math.random() * suggestions[category].length)];
  
  return { comment, suggestion };
}

export function generateSleepSuggestion(hours: number, quality: SleepQuality, goal: number): SuggestionData {
  const percentage = (hours / goal) * 100;

  const comments = [
    `You logged ${hours} hours of ${quality.toLowerCase()} sleep.`,
    `${hours} hours of ${quality.toLowerCase()} quality sleep recorded.`,
    `Nice! ${hours} hours with ${quality.toLowerCase()} sleep quality.`,
    `Logged: ${hours} hours, Quality: ${quality}`,
  ];

  const suggestions: Record<string, string[]> = {
    low: [
      "Try to get a bit more sleep tomorrow. Your body will thank you!",
      "You might feel tired tomorrow. Consider an earlier bedtime.",
      "Short sleep night. Prioritize more rest tomorrow.",
      "Consider improving your sleep schedule for better recovery.",
    ],
    moderate: [
      "Good sleep duration! Try to maintain this consistency.",
      "You're on track. Consistent sleep helps build healthy habits.",
      "Almost at your goal. Keep this sleep pattern up!",
      "Nice balance! You're getting closer to your target.",
    ],
    high: [
      "Excellent sleep! You're giving your body the recovery it needs.",
      "Perfect! You've hit your sleep goal. Keep it up!",
      "Amazing! Your body is well-rested today.",
      "Fantastic sleep night! Your recovery is optimal.",
    ],
  };

  const qualityBonus: Record<SleepQuality, string> = {
    Poor: "Poor quality sleep can affect your energy. Try relaxation techniques.",
    Fair: "Fair quality. Consider better sleep hygiene practices.",
    Good: "Good quality sleep! Your rest is paying off.",
    Excellent: "Excellent quality! Your sleep environment is working well.",
  };

  const comment = comments[Math.floor(Math.random() * comments.length)];
  let category: keyof typeof suggestions;
  
  if (percentage < 75) {
    category = "low";
  } else if (percentage < 100) {
    category = "moderate";
  } else {
    category = "high";
  }

  const baseSuggestion = suggestions[category][Math.floor(Math.random() * suggestions[category].length)];
  const qualityTip = qualityBonus[quality];
  
  return { comment, suggestion: `${baseSuggestion} ${qualityTip}` };
}

export function generateWaterSuggestion(cups: number, totalCups: number, goal: number): SuggestionData {
  const progress = goal > 0 ? (totalCups / goal) * 100 : 0;

  const comments = [
    `Great! You added ${cups} cup${cups > 1 ? "s" : ""} of water.`,
    `Nice hydration! ${cups} cup${cups > 1 ? "s" : ""} logged.`,
    `Excellent! ${cups} cup${cups > 1 ? "s" : ""} of water recorded.`,
    `Good choice! Adding ${cups} cup${cups > 1 ? "s" : ""} to stay hydrated.`,
  ];

  const suggestions: Record<string, string[]> = [
    "Keep your water bottle nearby to stay hydrated throughout the day.",
    "Drink water before, during, and after exercise for optimal hydration.",
    "Try herbal tea or infused water to keep hydration interesting.",
    "Set reminders every hour to drink water consistently.",
    "Hydration is key to energy and focus. Keep it up!",
    "You're doing great! Consistent hydration improves overall health.",
    "Almost at your goal! A few more cups will get you there.",
    "You've reached your hydration goal! Stay hydrated.",
  ];

  const comment = comments[Math.floor(Math.random() * comments.length)];
  const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
  const progressNote = progress >= 100 ? "You've reached your hydration goal." : progress >= 75 ? "You're close to your hydration goal." : "Keep building toward your hydration goal.";

  return { comment, suggestion: `${suggestion} ${progressNote}` };
}

export function generateWorkoutSuggestion(type: string, duration: number, calories: number): SuggestionData {
  const comments = [
    `Amazing! You completed a ${duration}-minute ${type}.`,
    `Great job! ${duration} minutes of ${type} recorded.`,
    `Excellent work! You burned ${calories} calories doing ${type}.`,
    `Awesome! ${type} session logged: ${duration} minutes.`,
  ];

  const suggestions = [
    `Fantastic ${type} session! Recovery is just as important as exercise. Stay hydrated and rest well.`,
    `Great effort! For the next ${type} session, try increasing the duration by 5 minutes.`,
    `Well done! Your ${type} workout burns about ${calories} calories. Keep up this energy!`,
    `Impressive! You're building strength and endurance. Keep this momentum going.`,
    `Excellent work! Varied workouts like ${type} prevent plateaus. Mix it up tomorrow!`,
    `You crushed it! Rest properly today to be ready for tomorrow's training.`,
  ];

  const comment = comments[Math.floor(Math.random() * comments.length)];
  const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

  return { comment, suggestion };
}

export function generateNutritionAnalysis(input: {
  foodLabel: string;
  mealType: string;
  category: string;
  servings: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  sugarGrams: number;
  sodiumMg: number;
  dailyCalories: number;
  dailyProteinGrams: number;
  dailyFiberGrams: number;
}): MetricAnalysis {
  const caloriesPerServing = input.servings > 0 ? Math.round(input.calories / input.servings) : input.calories;
  let severity: MetricAnalysis["severity"] = "good";

  const feedback = `${input.mealType} logged for ${input.foodLabel}. This entry adds ${input.calories.toLocaleString()} kcal, ${input.proteinGrams}g protein, ${input.carbsGrams}g carbs, and ${input.fatGrams}g fat.`;

  const insights: string[] = [
    `Auto-categorized as ${input.category}.`,
    `Average serving size: ${caloriesPerServing} kcal per serving.`,
  ];

  if (input.proteinGrams >= 25) {
    insights.push("Protein looks strong enough to support satiety and recovery.");
  } else if (input.proteinGrams < 15) {
    insights.push("Protein is on the lighter side. Adding eggs, yogurt, tofu, chicken, or beans would improve balance.");
    severity = "watch";
  }

  if (input.fiberGrams >= 8) {
    insights.push("Fiber is in a helpful range for fullness and digestion.");
  } else if (input.fiberGrams < 5) {
    insights.push("Fiber is fairly low. Whole grains, fruit, vegetables, or legumes would round this out.");
    severity = severity === "good" ? "watch" : severity;
  }

  if (input.sugarGrams >= 25) {
    insights.push("Sugar is relatively high for one entry, so pairing the next meal with protein and fiber may help steadier energy.");
    severity = severity === "good" ? "watch" : severity;
  }

  if (input.sodiumMg >= 900) {
    insights.push("Sodium is on the higher side. Balance the rest of the day with lower-sodium choices and water.");
  }

  const calorieProgress = input.dailyCalories > 0 ? (input.dailyCalories / 2000) * 100 : 0;
  if (input.dailyCalories >= 2000) {
    insights.push("Today's intake has already reached a typical 2,000 kcal target.");
    severity = severity === "good" ? "watch" : severity;
  } else if (input.dailyCalories >= 1500) {
    insights.push(`Today's intake is roughly ${Math.round(calorieProgress)}% of a 2,000 kcal target.`);
  }

  if (input.dailyProteinGrams >= 100) {
    insights.push("Daily protein is already in a strong range for satiety and recovery.");
  } else if (input.dailyProteinGrams < 60) {
    insights.push("Today's protein total is still low. Another protein-forward meal would help close the gap.");
    severity = severity === "good" ? "watch" : severity;
  }

  if (input.dailyFiberGrams >= 25) {
    insights.push("Daily fiber is tracking well for digestion and appetite control.");
  } else if (input.dailyFiberGrams < 15) {
    insights.push("Today's fiber total is still light. Build the next meal around vegetables, fruit, or whole grains.");
    severity = severity === "good" ? "watch" : severity;
  }

  const recommendations: string[] = [];
  if (input.proteinGrams < 20) {
    recommendations.push("Add a higher-protein side next time to improve fullness and recovery support.");
  }
  if (input.fiberGrams < 5) {
    recommendations.push("Swap in fruit, vegetables, or whole grains to raise fiber without much effort.");
  }
  if (input.sugarGrams >= 25) {
    recommendations.push("If this was a snack or drink, consider a smaller portion or a less sweet alternative.");
  }
  if (input.sodiumMg >= 900) {
    recommendations.push("Choose a lower-sodium option later in the day to keep intake more balanced.");
  }
  if (input.dailyProteinGrams < 60) {
    recommendations.push("Plan a protein-focused meal later today to bring the daily total closer to a stronger range.");
  }
  if (input.dailyFiberGrams < 15) {
    recommendations.push("Add a fiber-rich choice later today so the running total improves before the day ends.");
  }
  if (recommendations.length === 0) {
    recommendations.push("This is a balanced log. Keep stacking similar entries to stay on track.");
    recommendations.push("Use the same pattern for your next meal and adjust portions only if hunger or energy changes.");
  }

  return {
    feedback,
    insights,
    recommendations,
    severity,
  };
}

function formatTemperature(value: number, unit: TemperatureUnit) {
  return `${value.toFixed(1)}°${unit}`;
}

export function generateHeartRateAnalysis(input: {
  bpm: number;
  restingBpm?: number;
  hrvMs?: number;
}): MetricAnalysis {
  let severity: MetricAnalysis["severity"] = "good";
  let feedback = "This heart rate reading sits in a typical range.";

  if (input.bpm < 50) {
    severity = "watch";
    feedback = "This is a lower-than-typical heart rate reading. If you are relaxed and feel well, it may be normal, but recheck if you notice dizziness or weakness.";
  } else if (input.bpm > 100) {
    severity = input.bpm >= 120 ? "urgent" : "watch";
    feedback = input.bpm >= 120
      ? "This heart rate is elevated. Rest, hydrate, and recheck after a few minutes of calm breathing."
      : "This heart rate is above a typical resting range and may reflect activity, stress, caffeine, dehydration, or illness.";
  }

  const insights: string[] = [];
  if (input.restingBpm) {
    const delta = input.bpm - input.restingBpm;
    if (delta >= 15) {
      insights.push(`Your current rate is ${delta} BPM above your resting baseline.`);
    } else if (delta <= -10) {
      insights.push(`Your current rate is ${Math.abs(delta)} BPM below your resting baseline.`);
    } else {
      insights.push("Your current rate is close to your recorded resting baseline.");
    }
  }

  if (input.hrvMs) {
    if (input.hrvMs >= 60) {
      insights.push(`HRV at ${input.hrvMs} ms suggests a solid recovery signal.`);
    } else if (input.hrvMs >= 30) {
      insights.push(`HRV at ${input.hrvMs} ms is moderate and worth watching against your normal pattern.`);
      if (severity === "good") {
        severity = "watch";
      }
    } else {
      insights.push(`HRV at ${input.hrvMs} ms is on the lower side and can reflect stress or fatigue.`);
      severity = "watch";
    }
  }

  const recommendations = [
    input.bpm >= 120 ? "Take a short recovery break and retest once your breathing settles." : "Recheck the reading when you are calm and seated for consistency.",
    input.hrvMs !== undefined && input.hrvMs < 30
      ? "Prioritize sleep, hydration, and lighter training today."
      : "Keep tracking at the same time each day to build a reliable baseline.",
  ];

  return {
    feedback,
    insights,
    recommendations,
    severity,
  };
}

export function generateVitalSignsAnalysis(input: {
  systolic: number;
  diastolic: number;
  spo2: number;
  temperature: number;
  temperatureUnit: TemperatureUnit;
}): MetricAnalysis {
  const temperatureC = input.temperatureUnit === "F" ? (input.temperature - 32) / 1.8 : input.temperature;
  const temperatureLabel = formatTemperature(input.temperature, input.temperatureUnit);

  let severity: MetricAnalysis["severity"] = "good";
  let feedback = `Blood pressure is ${input.systolic}/${input.diastolic} mmHg, SpO2 is ${input.spo2}%, and temperature is ${temperatureLabel}.`;

  if (input.systolic >= 180 || input.diastolic >= 120) {
    severity = "urgent";
    feedback = "This blood pressure reading is in a crisis range. If it is confirmed on a repeat reading or you have symptoms, seek urgent medical care.";
  } else if (input.systolic >= 140 || input.diastolic >= 90) {
    severity = "watch";
    feedback = "This blood pressure is in a high range. Recheck after resting and discuss repeated elevations with a clinician.";
  } else if (input.systolic >= 130 || input.diastolic >= 80) {
    severity = "watch";
    feedback = "This blood pressure falls into an elevated range. Small changes in sodium, stress, sleep, and activity can help over time.";
  } else if (input.systolic >= 120 && input.diastolic < 80) {
    feedback = "This blood pressure is slightly elevated for many adults, so steady tracking is worthwhile.";
  }

  const insights: string[] = [];
  if (input.spo2 >= 95) {
    insights.push(`SpO2 at ${input.spo2}% is within the expected range.`);
  } else if (input.spo2 >= 90) {
    insights.push(`SpO2 at ${input.spo2}% is a little low and should be rechecked with a good sensor fit.`);
    severity = severity === "good" ? "watch" : severity;
  } else {
    insights.push(`SpO2 at ${input.spo2}% is very low and needs prompt attention.`);
    severity = "urgent";
  }

  if (temperatureC >= 37.8) {
    insights.push(`Temperature is ${temperatureLabel}, which can be consistent with fever.`);
    if (severity === "good") {
      severity = "watch";
    }
  } else if (temperatureC < 36) {
    insights.push(`Temperature is ${temperatureLabel}, which is below the usual range.`);
    if (severity === "good") {
      severity = "watch";
    }
  } else {
    insights.push(`Temperature is ${temperatureLabel}, which is in a typical range.`);
  }

  const recommendations = [
    input.systolic >= 130 || input.diastolic >= 80
      ? "Rest quietly for 5 minutes and repeat the blood pressure reading before drawing conclusions."
      : "Keep measuring at the same time of day to spot patterns.",
    input.spo2 < 95
      ? "Check sensor placement, sit upright, and repeat the oxygen reading if it seems unexpected."
      : "Maintain hydration and note how you feel alongside the numbers.",
    temperatureC >= 37.8
      ? "Rest, hydrate, and monitor for other fever symptoms such as chills or fatigue."
      : "Continue watching temperature trends along with the rest of your vital signs.",
  ];

  return {
    feedback,
    insights,
    recommendations,
    severity,
  };
}
