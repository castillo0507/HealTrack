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
          <CartesianGrid strokeDasharray="3 3" stroke="#dbe3ec" />
          <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              borderColor: "#d8e1ef",
              borderRadius: 16,
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            }}
            labelStyle={{ color: "#334155" }}
            itemStyle={{ color: "#475569" }}
          />
          <Legend wrapperStyle={{ color: "#64748b", fontSize: 12 }} />
          <Line type="monotone" dataKey="steps" name="Steps" stroke="#5f748b" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="waterCups" name="Water (cups)" stroke="#7e92a5" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="sleepHours" name="Sleep (hrs)" stroke="#9aa8b7" strokeWidth={3} dot={false} />
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
          <CartesianGrid strokeDasharray="3 3" stroke="#dbe3ec" />
          <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              borderColor: "#d8e1ef",
              borderRadius: 16,
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            }}
            labelStyle={{ color: "#334155" }}
            itemStyle={{ color: "#475569" }}
          />
          <Legend wrapperStyle={{ color: "#64748b", fontSize: 12 }} />
          <Bar dataKey="steps" name="Steps" fill="#5f748b" radius={[8, 8, 0, 0]} />
          <Bar dataKey="waterCups" name="Water" fill="#7e92a5" radius={[8, 8, 0, 0]} />
          <Bar dataKey="sleepHours" name="Sleep" fill="#9aa8b7" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
