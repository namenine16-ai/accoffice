export type AutomationJobType =
  | "monthly_workflow_generation";

export type AutomationJobStatus = "idle" | "running" | "success" | "failed";

export type AutomationRunStatus = "running" | "success" | "failed";

export interface AutomationJob {
  id: string;
  name: string;
  type: AutomationJobType;
  status: AutomationJobStatus;
  lastRunAt: string | null;
  lastRunDurationMs: number | null;
  nextRunAt: string | null;
  successCount: number;
  failedCount: number;
}

export interface AutomationRun {
  id: string;
  jobId: string;
  status: AutomationRunStatus;
  triggeredBy: "manual" | "schedule";
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  errorMessage: string | null;
}
