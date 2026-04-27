"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailySnapshot } from "@/lib/health-store";

export function WeeklyProgressChart({ data }: { data: DailySnapshot[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d8e1ef" />
          <XAxis dataKey="day" tick={{ fill: "#5f6c83", fontSize: 12 }} />
          <YAxis tick={{ fill: "#5f6c83", fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="steps" name="Steps" stroke="#1d4ed8" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="waterCups" name="Water (cups)" stroke="#0ea5e9" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="sleepHours" name="Sleep (hrs)" stroke="#7c3aed" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyComparisonChart({
  data,
}: {
  data: { name: string; steps: number; waterCups: number; sleepHours: number }[];
}) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d8e1ef" />
          <XAxis dataKey="name" tick={{ fill: "#5f6c83", fontSize: 12 }} />
          <YAxis tick={{ fill: "#5f6c83", fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="steps" name="Steps" fill="#1d4ed8" radius={[8, 8, 0, 0]} />
          <Bar dataKey="waterCups" name="Water" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
          <Bar dataKey="sleepHours" name="Sleep" fill="#7c3aed" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
