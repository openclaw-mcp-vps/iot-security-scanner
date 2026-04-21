"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

interface SecurityScoreProps {
  score: number;
  devices: number;
}

export function SecurityScore({ score, devices }: SecurityScoreProps) {
  const data = [{ name: "Security", value: score, fill: score > 75 ? "#3fb950" : score > 55 ? "#d29922" : "#f85149" }];

  return (
    <div className="h-64 w-full rounded-xl border border-[#30363d] bg-[#161b22] p-4">
      <p className="text-sm text-[#9aa4af]">Network Security Score</p>
      <div className="mt-2 h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart data={data} innerRadius="45%" outerRadius="95%" startAngle={180} endAngle={0}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={12} background />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="-mt-6 text-center">
        <p className="text-3xl font-bold text-[#e6edf3]">{score}</p>
        <p className="text-sm text-[#9aa4af]">Based on {devices} detected devices</p>
      </div>
    </div>
  );
}
