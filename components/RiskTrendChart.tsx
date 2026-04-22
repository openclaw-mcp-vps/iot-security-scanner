"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { ScanRecord } from "@/lib/types";

function formatChartData(scans: ScanRecord[]) {
  return scans
    .slice()
    .reverse()
    .map((scan) => ({
      time: new Date(scan.completedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric"
      }),
      risk: scan.summary.overallRiskScore
    }));
}

export function RiskTrendChart({ scans }: { scans: ScanRecord[] }) {
  const data = formatChartData(scans);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#243042" />
          <XAxis dataKey="time" stroke="#8b949e" />
          <YAxis domain={[0, 100]} stroke="#8b949e" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#101826",
              borderColor: "#2f3d55",
              color: "#e6edf3"
            }}
            labelStyle={{ color: "#c6d2e1" }}
          />
          <Line
            type="monotone"
            dataKey="risk"
            stroke="#22d3ee"
            strokeWidth={2.5}
            dot={{ fill: "#10b981", r: 4 }}
            activeDot={{ r: 6, fill: "#10b981" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
