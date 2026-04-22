import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className }: ProgressProps) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-800", className)}>
      <div
        className="h-full rounded-full bg-green-400 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
