"use client";

import { useMemo } from "react";
import type { WorkflowTask } from "@/types/workflow";
import { TasksByMonthChart, type MonthlyTaskCount } from "@/components/dashboard/charts/TasksByMonthChart";
import {
  CompletedVsOverdueChart,
  type MonthlyCompletionCount,
} from "@/components/dashboard/charts/CompletedVsOverdueChart";
import { TaskStatusDonutChart, type TaskStatusCount } from "@/components/dashboard/charts/TaskStatusDonutChart";
import {
  TaxFilingStackedBarChart,
  type TaxFilingStatusCount,
} from "@/components/dashboard/charts/TaxFilingStackedBarChart";

const monthNamesTh = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const statusLabels: Record<string, string> = {
  pending: "รอดำเนินการ",
  in_progress: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
};

const taxTypeConfig = [
  { key: "vat", label: "VAT" },
  { key: "pnd1", label: "PND1" },
  { key: "pnd3", label: "PND3" },
  { key: "pnd53", label: "PND53" },
  { key: "sso", label: "SSO" },
] as const;

interface MonthBucket {
  year: number;
  month: number;
  label: string;
}

function getLastSixMonthBuckets(referenceDate: Date): MonthBucket[] {
  const buckets: MonthBucket[] = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const bucketDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - offset, 1);
    buckets.push({
      year: bucketDate.getFullYear(),
      month: bucketDate.getMonth() + 1,
      label: monthNamesTh[bucketDate.getMonth()],
    });
  }

  return buckets;
}

function buildTasksByMonth(tasks: WorkflowTask[], buckets: MonthBucket[]): MonthlyTaskCount[] {
  return buckets.map((bucket) => ({
    month: bucket.label,
    count: tasks.filter((task) => task.year === bucket.year && task.month === bucket.month).length,
  }));
}

function buildCompletedVsOverdue(
  tasks: WorkflowTask[],
  buckets: MonthBucket[],
  now: Date
): MonthlyCompletionCount[] {
  return buckets.map((bucket) => {
    const monthTasks = tasks.filter((task) => task.year === bucket.year && task.month === bucket.month);

    return {
      month: bucket.label,
      completed: monthTasks.filter((task) => task.status === "completed").length,
      overdue: monthTasks.filter(
        (task) => task.deadline !== null && new Date(task.deadline) < now && task.status !== "completed"
      ).length,
    };
  });
}

function buildTaskStatusDistribution(tasks: WorkflowTask[]): TaskStatusCount[] {
  const counts = new Map<string, number>();

  tasks.forEach((task) => {
    counts.set(task.status, (counts.get(task.status) ?? 0) + 1);
  });

  return Array.from(counts.entries()).map(([status, count]) => ({
    status,
    label: statusLabels[status] ?? status,
    count,
  }));
}

function buildTaxFilingStatus(tasks: WorkflowTask[]): TaxFilingStatusCount[] {
  return taxTypeConfig.map(({ key, label }) => ({
    taxType: label,
    filed: tasks.filter((task) => task[key]).length,
    pending: tasks.filter((task) => !task[key]).length,
  }));
}

interface OfficeHubChartsProps {
  tasks: WorkflowTask[];
}

export function OfficeHubCharts({ tasks }: OfficeHubChartsProps) {
  const now = useMemo(() => new Date(), []);
  const buckets = useMemo(() => getLastSixMonthBuckets(now), [now]);

  const tasksByMonth = useMemo(() => buildTasksByMonth(tasks, buckets), [tasks, buckets]);
  const completedVsOverdue = useMemo(
    () => buildCompletedVsOverdue(tasks, buckets, now),
    [tasks, buckets, now]
  );
  const statusDistribution = useMemo(() => buildTaskStatusDistribution(tasks), [tasks]);
  const taxFilingStatus = useMemo(() => buildTaxFilingStatus(tasks), [tasks]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TasksByMonthChart data={tasksByMonth} />
      <CompletedVsOverdueChart data={completedVsOverdue} />
      <TaskStatusDonutChart data={statusDistribution} />
      <TaxFilingStackedBarChart data={taxFilingStatus} />
    </div>
  );
}
