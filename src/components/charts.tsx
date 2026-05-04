"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReactNode } from "react";

export type CategoryProgressPoint = {
  category: string;
  progress: number;
};

export function CategoryProgressChart({
  data,
  title,
}: {
  data: CategoryProgressPoint[];
  title: ReactNode;
}) {
  return (
    <div className="h-112 w-full">
      <p className="mb-3 text-sm font-semibold text-slate-700">{title}</p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 16, left: 24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dbe3ec" />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis type="category" dataKey="category" width={140} tick={{ fill: "#64748b", fontSize: 12 }} />
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
          <Bar dataKey="progress" name="Progress" fill="#5f748b" radius={[0, 10, 10, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeeklyProgressChart({
  data,
}: {
  data: CategoryProgressPoint[];
}) {
  return (
    <CategoryProgressChart data={data} title="Weekly category progress across all 8 categories" />
  );
}

export function MonthlyComparisonChart({
  data,
}: {
  data: CategoryProgressPoint[];
}) {
  return (
    <CategoryProgressChart data={data} title="Monthly category progress across all 8 categories" />
  );
}
