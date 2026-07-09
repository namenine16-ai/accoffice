import { cn } from "@/utils/cn";

interface WorkflowProgressBarProps {
  progress: number;
  status: string;
}

function progressColor(status: string) {
  if (status === "completed") {
    return "bg-emerald-500";
  }

  if (status === "pending") {
    return "bg-amber-500";
  }

  return "bg-sky-500";
}

export function WorkflowProgressBar({ progress, status }: WorkflowProgressBarProps) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="space-y-2">
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={cn(progressColor(status), "h-2 rounded-full transition-all duration-200")}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{normalizedProgress}%</p>
    </div>
  );
}
