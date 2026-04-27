"use client";

import { AppShell } from "@/components/shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card } from "@/components/ui";
import { MonthlyComparisonChart, WeeklyProgressChart } from "@/components/charts";
import { useHealth } from "@/lib/health-store";

export default function AnalyticsPage() {
  const { weeklyData, monthlyData } = useHealth();

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-4">
          <Card>
            <h2 className="mb-1 text-2xl font-black text-slate-800 dark:text-slate-100">Weekly Analytics</h2>
            <p className="mb-5 text-sm text-slate-500">Compare daily health trends over the current week.</p>
            <WeeklyProgressChart data={weeklyData} />
          </Card>

          <Card>
            <h2 className="mb-1 text-2xl font-black text-slate-800 dark:text-slate-100">Monthly Progress</h2>
            <p className="mb-5 text-sm text-slate-500">Simple comparison across the month.</p>
            <MonthlyComparisonChart data={monthlyData} />
          </Card>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
