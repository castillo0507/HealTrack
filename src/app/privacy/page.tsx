"use client";

import { Download, FileText, Trash2 } from "lucide-react";
import { AppShell } from "@/components/shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card } from "@/components/ui";
import { useState } from "react";
import { useHealth } from "@/lib/health-store";
import { buildCategoryProgress } from "@/lib/progress";
import { buildInsightsReport } from "@/lib/insights";
import { exportAllDataPdf, type ExportAllDataInput } from "@/lib/export-report";

export default function PrivacyPage() {
  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto max-w-2xl space-y-4">
          <Card>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Privacy Center</h2>
            <p className="mt-2 text-sm text-slate-500">Complete transparency and control over your data.</p>
          </Card>

          <Card>
            <h3 className="mb-2 font-black text-slate-800 dark:text-slate-100">Our Privacy Principles</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>Purpose limitation: data used only for selected health tracking purposes.</li>
              <li>Data minimization: we collect only what you enable.</li>
              <li>Local storage: all health data stays on your device.</li>
              <li>No third-party sharing: your data is never sold or shared with advertisers.</li>
            </ul>
          </Card>

          <Card>
            <h3 className="mb-3 font-black text-slate-800 dark:text-slate-100">Your Data Rights</h3>
            <div className="space-y-2">
              <ExportButtons />
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <FileText className="h-4 w-4" /> View Data Usage Report
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-white py-2 font-semibold text-red-600 transition hover:bg-slate-100"
              >
                <Trash2 className="h-4 w-4" /> Delete All My Data
              </button>
            </div>
          </Card>
        </div>
      </AppShell>
    </AuthGuard>
  );
}

function ExportButtons() {
  const { profile, goals, categories, today, weeklyData, monthlyData, workouts, nutritionEntries, heartRateEntries, vitalSignsEntries, streak } = useHealth();
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    try {
      setIsExporting(true);

      const progress = buildCategoryProgress({
        goals,
        today: {
          steps: today.steps,
          caloriesBurned: today.caloriesBurned,
          waterCups: today.waterCups,
          sleepHours: today.sleepHours,
          nutritionCalories: today.nutritionCalories,
          nutritionProteinGrams: today.nutritionProteinGrams,
          nutritionFiberGrams: today.nutritionFiberGrams,
          nutritionSodiumMg: today.nutritionSodiumMg,
        },
        workouts,
        nutritionEntries,
        heartRateEntries,
        vitalSignsEntries,
      });

      const insights = buildInsightsReport({
        categories,
        goals,
        today: {
          steps: today.steps,
          caloriesBurned: today.caloriesBurned,
          waterCups: today.waterCups,
          sleepHours: today.sleepHours,
          sleepQuality: today.sleepQuality,
          nutritionCalories: today.nutritionCalories,
          nutritionProteinGrams: today.nutritionProteinGrams,
          nutritionCarbsGrams: today.nutritionCarbsGrams,
          nutritionFatGrams: today.nutritionFatGrams,
          nutritionFiberGrams: today.nutritionFiberGrams,
          nutritionSugarGrams: today.nutritionSugarGrams,
          nutritionSodiumMg: today.nutritionSodiumMg,
        },
        weeklyData,
        workouts,
        nutritionEntries,
        heartRateEntries,
        vitalSignsEntries,
      });

      const payload: ExportAllDataInput = {
        profile: { name: profile.name, email: profile.email },
        goals,
        categories,
        today: {
          steps: today.steps,
          caloriesBurned: today.caloriesBurned,
          waterCups: today.waterCups,
          sleepHours: today.sleepHours,
          sleepQuality: today.sleepQuality,
          nutritionCalories: today.nutritionCalories,
          nutritionProteinGrams: today.nutritionProteinGrams,
          nutritionCarbsGrams: today.nutritionCarbsGrams,
          nutritionFatGrams: today.nutritionFatGrams,
          nutritionFiberGrams: today.nutritionFiberGrams,
          nutritionSugarGrams: today.nutritionSugarGrams,
          nutritionSodiumMg: today.nutritionSodiumMg,
        },
        streak: streak ?? 0,
        progress,
        insights,
        weeklyData,
        monthlyData,
        workouts,
        nutritionEntries,
        heartRateEntries,
        vitalSignsEntries,
      };

      // generate and save pdf
      exportAllDataPdf(payload);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Export failed", e);
      // we could surface a toast here later
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
    >
      <Download className="h-4 w-4" /> {isExporting ? "Exporting report..." : "Export All Data (PDF)"}
    </button>
  );
}
