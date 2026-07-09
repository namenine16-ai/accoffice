"use client";

import { useEffect, useState } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowSummary } from "@/components/workflow/WorkflowSummary";
import type { WorkflowTask } from "@/types/workflow";

interface EmployeeWorkloadSummaryProps {
  employeeId: number;
}

function computeCounts(tasks: WorkflowTask[]) {
  const now = new Date();

  return {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((task) => task.status === "completed").length,
    inProgressTasks: tasks.filter((task) => task.status === "in_progress").length,
    pendingTasks: tasks.filter((task) => task.status === "pending").length,
    overdueTasks: tasks.filter(
      (task) => task.deadline && new Date(task.deadline) < now && task.status !== "completed"
    ).length,
  };
}

export function EmployeeWorkloadSummary({ employeeId }: EmployeeWorkloadSummaryProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);

  useEffect(() => {
    async function loadWorkload() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/workflow?employeeId=${employeeId}`);
        if (!res.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลภาระงานได้");
        }

        const data = await res.json();
        setTasks(data.tasks ?? []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadWorkload();
  }, [employeeId]);

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState title="โหลดภาระงานไม่สำเร็จ" description={error} />;
  }

  const counts = computeCounts(tasks);

  return (
    <WorkflowSummary
      totalTasks={counts.totalTasks}
      completedTasks={counts.completedTasks}
      inProgressTasks={counts.inProgressTasks}
      pendingTasks={counts.pendingTasks}
      overdueTasks={counts.overdueTasks}
    />
  );
}
