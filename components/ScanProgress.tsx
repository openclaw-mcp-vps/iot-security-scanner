import { Progress } from "@/components/ui/progress";

interface ScanProgressProps {
  progress: number;
  stage: string;
}

export function ScanProgress({ progress, stage }: ScanProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>{stage}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
}
