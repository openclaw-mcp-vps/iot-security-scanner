"use client";

import { Loader2 } from "lucide-react";

import { Progress } from "@/components/ui/progress";

export function ScanProgress({
  progress,
  status
}: {
  progress: number;
  status: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
      <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          <span>{status}</span>
        </div>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
}
