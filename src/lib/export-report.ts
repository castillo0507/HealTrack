import { jsPDF } from "jspdf";
import { allCategories, type DailySnapshot, type HeartRateEntry, type NutritionEntry, type VitalSignsEntry, type WorkoutEntry } from "./health-store";
import type { CategoryProgressMap } from "./progress";
import type { InsightsReport } from "./insights";

type ExportProfile = {
  name: string;
  email: string;
};

type ExportGoals = {
  steps: number;
  waterCups: number;
  sleepHours: number;
};

type ExportToday = {
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

export type ExportAllDataInput = {
  profile: ExportProfile;
  goals: ExportGoals;
  categories: string[];
  today: ExportToday;
  streak: number;
  progress: CategoryProgressMap;
  insights: InsightsReport;
  weeklyData: DailySnapshot[];
  monthlyData: { name: string; steps: number; waterCups: number; sleepHours: number }[];
  workouts: WorkoutEntry[];
  nutritionEntries: NutritionEntry[];
  heartRateEntries: HeartRateEntry[];
  vitalSignsEntries: VitalSignsEntry[];
};

type PdfCursor = {
  y: number;
};

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 14;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM_LIMIT = PAGE_HEIGHT - 16;

function formatDateTime(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDate(value = new Date()) {
  return value.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function colorForStatus(status: string) {
  if (status === "urgent") {
    return [185, 28, 28] as const;
  }

  if (status === "watch") {
    return [180, 83, 9] as const;
  }

  if (status === "good") {
    return [21, 128, 61] as const;
  }

  return [71, 85, 105] as const;
}

function makePdf(filename: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  (doc as any).setAutoPageBreak(false);
  doc.setDrawColor(226, 232, 240);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  return {
    doc,
    filename,
    cursor: { y: MARGIN } as PdfCursor,
  };
}

function ensureSpace(doc: jsPDF, cursor: PdfCursor, needed = 12) {
  if (cursor.y + needed <= BOTTOM_LIMIT) {
    return;
  }

  doc.addPage();
  cursor.y = MARGIN;
}

function drawHeader(doc: jsPDF, cursor: PdfCursor, title: string, subtitle: string) {
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(MARGIN, cursor.y, CONTENT_WIDTH, 24, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, MARGIN + 4, cursor.y + 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(subtitle, MARGIN + 4, cursor.y + 16);
  doc.setTextColor(30, 41, 59);
  cursor.y += 30;
}

function drawSectionTitle(doc: jsPDF, cursor: PdfCursor, title: string, accent = [95, 116, 139] as const) {
  ensureSpace(doc, cursor, 14);
  doc.setFillColor(accent[0], accent[1], accent[2]);
  doc.roundedRect(MARGIN, cursor.y, 3, 8, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(title, MARGIN + 5, cursor.y + 6);
  cursor.y += 11;
}

function drawParagraph(doc: jsPDF, cursor: PdfCursor, text: string, options?: { size?: number; color?: readonly [number, number, number] }) {
  const size = options?.size ?? 10;
  const color = options?.color ?? [51, 65, 85] as const;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(size);
  doc.setTextColor(color[0], color[1], color[2]);
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
  ensureSpace(doc, cursor, lines.length * (size * 0.55) + 2);
  doc.text(lines, MARGIN, cursor.y);
  cursor.y += lines.length * (size * 0.55) + 2;
  doc.setTextColor(30, 41, 59);
}

function drawBulletList(doc: jsPDF, cursor: PdfCursor, items: string[], color: readonly [number, number, number] = [51, 65, 85]) {
  items.forEach((item) => {
    ensureSpace(doc, cursor, 8);
    doc.setFontSize(10);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(item, CONTENT_WIDTH - 6);
    doc.text(`• ${lines[0]}`, MARGIN, cursor.y);
    for (let index = 1; index < lines.length; index += 1) {
      doc.text(lines[index], MARGIN + 5, cursor.y + index * 4.8);
    }
    cursor.y += lines.length * 4.8 + 1.2;
  });
  doc.setTextColor(30, 41, 59);
}

function drawStatGrid(doc: jsPDF, cursor: PdfCursor, entries: Array<{ label: string; value: string }>) {
  const columns = 2;
  const columnWidth = CONTENT_WIDTH / columns;
  const rowHeight = 16;

  for (let index = 0; index < entries.length; index += columns) {
    ensureSpace(doc, cursor, rowHeight + 2);
    const row = entries.slice(index, index + columns);

    row.forEach((entry, columnIndex) => {
      const x = MARGIN + columnIndex * columnWidth;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, cursor.y, columnWidth - 2, rowHeight, 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(entry.label, x + 3, cursor.y + 5.5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      const valueLines = doc.splitTextToSize(entry.value, columnWidth - 8);
      doc.text(valueLines, x + 3, cursor.y + 11);
    });

    cursor.y += rowHeight + 4;
  }
}

function drawSectionDivider(doc: jsPDF, cursor: PdfCursor) {
  ensureSpace(doc, cursor, 5);
  doc.setDrawColor(226, 232, 240);
  doc.line(MARGIN, cursor.y, PAGE_WIDTH - MARGIN, cursor.y);
  cursor.y += 5;
}

function formatEntryDate(entryDate: string) {
  return formatDateTime(entryDate);
}

function summariseConclusion(report: InsightsReport, progressValues: number[]) {
  const urgentCount = report.categoryInsights.filter((item) => item.status === "urgent").length;
  const watchCount = report.categoryInsights.filter((item) => item.status === "watch").length;
  const averageProgress = progressValues.length > 0 ? progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length : 0;

  if (urgentCount > 0) {
    return {
      title: "Immediate attention recommended",
      body: "One or more categories have urgent signals. Review the flagged sections and consider professional guidance where appropriate.",
      tone: colorForStatus("urgent"),
    };
  }

  if (watchCount >= 3) {
    return {
      title: "Mixed but manageable",
      body: "Several categories need attention, but there is enough data to keep improving. Focus on the recommendations that appear repeatedly in the report.",
      tone: colorForStatus("watch"),
    };
  }

  if (averageProgress >= 70) {
    return {
      title: "Overall health is tracking well",
      body: "Most categories are showing healthy momentum and consistent logging. Keep the same pattern and maintain a steady recovery routine.",
      tone: colorForStatus("good"),
    };
  }

  return {
    title: "Steady progress with room to build",
    body: "The report shows useful tracking activity, but several categories still need consistent input before strong trends emerge.",
    tone: colorForStatus("watch"),
  };
}

function renderEntrySection(
  doc: jsPDF,
  cursor: PdfCursor,
  title: string,
  entries: Array<{ date: string; summary: string; detailLines: string[] }>,
) {
  drawSectionTitle(doc, cursor, title);

  if (entries.length === 0) {
    drawParagraph(doc, cursor, "No entries have been logged yet.", { color: [100, 116, 139] });
    drawSectionDivider(doc, cursor);
    return;
  }

  entries.forEach((entry) => {
    ensureSpace(doc, cursor, 22);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(MARGIN, cursor.y, CONTENT_WIDTH, 18 + Math.min(18, entry.detailLines.length * 4.6), 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(entry.summary, MARGIN + 3, cursor.y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);
    doc.setTextColor(100, 116, 139);
    doc.text(entry.date, MARGIN + 3, cursor.y + 11.5);
    doc.setTextColor(51, 65, 85);
    const detailText = doc.splitTextToSize(entry.detailLines.join("\n"), CONTENT_WIDTH - 6);
    doc.text(detailText, MARGIN + 3, cursor.y + 18);
    cursor.y += 18 + detailText.length * 4.4 + 4;
  });

  drawSectionDivider(doc, cursor);
}

export function exportAllDataPdf(input: ExportAllDataInput) {
  const { doc, filename, cursor } = makePdf(
    `HealTrack-Health-Report-${new Date().toISOString().slice(0, 10)}.pdf`,
  );

  drawHeader(doc, cursor, "HealTrack Health Report", `Generated for ${input.profile.name} on ${formatDate()}`);
  drawParagraph(doc, cursor, "This report compiles your complete tracking history, computed progress, category insights, and system-generated guidance into a single reviewable document.");

  drawSectionTitle(doc, cursor, "Profile & Goals");
  drawStatGrid(doc, cursor, [
    { label: "User", value: input.profile.name || "Unknown" },
    { label: "Email", value: input.profile.email || "Not set" },
    { label: "Current Streak", value: `${input.streak} day${input.streak === 1 ? "" : "s"}` },
    { label: "Selected Categories", value: `${input.categories.length} / ${allCategories.length}` },
    { label: "Step Goal", value: `${input.goals.steps.toLocaleString()} steps` },
    { label: "Water Goal", value: `${input.goals.waterCups} cups` },
    { label: "Sleep Goal", value: `${input.goals.sleepHours} hours` },
  ]);

  drawSectionDivider(doc, cursor);

  drawSectionTitle(doc, cursor, "Current Day Snapshot");
  drawStatGrid(doc, cursor, [
    { label: "Steps", value: `${input.today.steps.toLocaleString()}` },
    { label: "Workout Calories", value: `${input.today.caloriesBurned.toLocaleString()} kcal` },
    { label: "Water", value: `${input.today.waterCups} cups` },
    { label: "Sleep", value: `${input.today.sleepHours.toFixed(1)} hrs (${input.today.sleepQuality})` },
    { label: "Nutrition Calories", value: `${input.today.nutritionCalories.toLocaleString()} kcal` },
    { label: "Protein", value: `${input.today.nutritionProteinGrams} g` },
    { label: "Fiber", value: `${input.today.nutritionFiberGrams} g` },
    { label: "Sodium", value: `${input.today.nutritionSodiumMg} mg` },
  ]);

  drawSectionDivider(doc, cursor);

  drawSectionTitle(doc, cursor, "Weekly Snapshot");
  drawStatGrid(
    doc,
    cursor,
    input.weeklyData.map((entry) => ({
      label: entry.day,
      value: `${entry.steps.toLocaleString()} steps • ${entry.waterCups} cups • ${entry.sleepHours.toFixed(1)} hrs`,
    })),
  );

  drawSectionDivider(doc, cursor);

  drawSectionTitle(doc, cursor, "Monthly Snapshot");
  drawStatGrid(
    doc,
    cursor,
    input.monthlyData.map((entry) => ({
      label: entry.name,
      value: `${entry.steps.toLocaleString()} steps • ${entry.waterCups} cups • ${entry.sleepHours.toFixed(1)} hrs`,
    })),
  );

  drawSectionDivider(doc, cursor);

  drawSectionTitle(doc, cursor, "Category Progress Overview");
  input.insights.categoryInsights.forEach((item) => {
    ensureSpace(doc, cursor, 11);
    const progressValue = clampPercent(input.progress[item.category as keyof CategoryProgressMap] ?? 0);
    const tone = colorForStatus(item.status);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(MARGIN, cursor.y, CONTENT_WIDTH, 16, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(item.category, MARGIN + 3, cursor.y + 5.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.7);
    doc.setTextColor(tone[0], tone[1], tone[2]);
    doc.text(item.status.toUpperCase(), PAGE_WIDTH - MARGIN - 34, cursor.y + 5.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`${Math.round(progressValue)}%`, PAGE_WIDTH - MARGIN - 10, cursor.y + 5.5, { align: "right" });
    cursor.y += 20;
  });

  drawSectionDivider(doc, cursor);

  drawSectionTitle(doc, cursor, "Logged Activities");
  renderEntrySection(
    doc,
    cursor,
    "Workouts",
    input.workouts.slice(0, 10).map((entry) => ({
      date: formatEntryDate(entry.date),
      summary: `${entry.type} - ${entry.duration} min / ${entry.calories} kcal`,
      detailLines: [
        `Intensity: ${entry.intensity ?? "Not set"}`,
        entry.distanceKm !== undefined ? `Distance: ${entry.distanceKm} km` : "Distance: not logged",
        entry.sets && entry.reps ? `Strength volume: ${entry.sets} sets x ${entry.reps} reps` : "Volume detail: not applicable",
        entry.rounds ? `Rounds: ${entry.rounds}` : "Rounds: not applicable",
      ],
    })),
  );

  renderEntrySection(
    doc,
    cursor,
    "Nutrition",
    input.nutritionEntries.slice(0, 10).map((entry) => ({
      date: formatEntryDate(entry.date),
      summary: `${entry.foodLabel} - ${entry.mealType} (${entry.category})`,
      detailLines: [
        `${entry.servings} serving${entry.servings === 1 ? "" : "s"} | ${entry.calories} kcal`,
        `Protein ${entry.proteinGrams}g, Carbs ${entry.carbsGrams}g, Fat ${entry.fatGrams}g`,
        `Fiber ${entry.fiberGrams}g, Sugar ${entry.sugarGrams}g, Sodium ${entry.sodiumMg}mg`,
      ],
    })),
  );

  renderEntrySection(
    doc,
    cursor,
    "Heart Rate",
    input.heartRateEntries.slice(0, 10).map((entry) => ({
      date: formatEntryDate(entry.date),
      summary: `${entry.bpm} BPM`,
      detailLines: [
        entry.restingBpm !== undefined ? `Resting BPM: ${entry.restingBpm}` : "Resting BPM: not logged",
        entry.hrvMs !== undefined ? `HRV: ${entry.hrvMs} ms` : "HRV: not logged",
      ],
    })),
  );

  renderEntrySection(
    doc,
    cursor,
    "Vital Signs",
    input.vitalSignsEntries.slice(0, 10).map((entry) => ({
      date: formatEntryDate(entry.date),
      summary: `${entry.systolic}/${entry.diastolic} mmHg`,
      detailLines: [
        `SpO2: ${entry.spo2}%`,
        `Temperature: ${entry.temperature.toFixed(1)}°${entry.temperatureUnit}`,
      ],
    })),
  );

  drawSectionTitle(doc, cursor, "Daily Summary Trends");
  drawParagraph(doc, cursor, `Weekly step average: ${Math.round(input.progress["Physical Activity"])}% progress against the step pattern.`);
  drawParagraph(doc, cursor, `Weekly sleep pattern: ${Math.round(input.progress["Sleep Tracking"])}% progress against the sleep goal.`);
  drawParagraph(doc, cursor, `Hydration pattern: ${Math.round(input.progress.Hydration)}% progress against the water goal.`);

  drawSectionDivider(doc, cursor);

  drawSectionTitle(doc, cursor, "System Generated Feedback");
  drawBulletList(doc, cursor, input.insights.highlights, [71, 85, 105]);
  drawBulletList(doc, cursor, input.insights.recommendations, [30, 41, 59]);

  drawSectionDivider(doc, cursor);

  drawSectionTitle(doc, cursor, "Category Insights");
  input.insights.categoryInsights.forEach((item) => {
    ensureSpace(doc, cursor, 18);
    const tone = colorForStatus(item.status);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(tone[0], tone[1], tone[2]);
    doc.text(`${item.category} (${item.status})`, MARGIN, cursor.y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(`${item.summary} ${item.trend} ${item.recommendation}`, CONTENT_WIDTH);
    doc.text(lines, MARGIN, cursor.y + 5.5);
    cursor.y += 7 + lines.length * 4.8;
  });

  drawSectionDivider(doc, cursor);

  const conclusion = summariseConclusion(input.insights, Object.values(input.progress));
  drawSectionTitle(doc, cursor, "Overall Health Conclusion", conclusion.tone);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(MARGIN, cursor.y, CONTENT_WIDTH, 22, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(conclusion.tone[0], conclusion.tone[1], conclusion.tone[2]);
  doc.text(conclusion.title, MARGIN + 3, cursor.y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const conclusionLines = doc.splitTextToSize(conclusion.body, CONTENT_WIDTH - 6);
  doc.text(conclusionLines, MARGIN + 3, cursor.y + 14);
  cursor.y += 29;

  ensureSpace(doc, cursor, 12);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("This report is generated from local HealTrack data and is intended for personal tracking and review.", MARGIN, PAGE_HEIGHT - 10);

  doc.save(filename);
}