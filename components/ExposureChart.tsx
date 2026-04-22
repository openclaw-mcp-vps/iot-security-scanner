"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Point {
  name: string;
  devices: number;
  critical: number;
}

interface ExposureChartProps {
  data: Point[];
}

export function ExposureChart({ data }: ExposureChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorDevices" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4ade80" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#4ade80" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "0.5rem",
              color: "#e2e8f0",
            }}
          />
          <Area type="monotone" dataKey="devices" stroke="#4ade80" fill="url(#colorDevices)" strokeWidth={2} />
          <Area type="monotone" dataKey="critical" stroke="#ef4444" fill="url(#colorCritical)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
