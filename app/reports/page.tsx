"use client";

import { useEffect, useRef, useState } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { ExecutiveKpiCards } from "@/components/dashboard/ExecutiveKpiCards";
import { OfficeHubSummaryTable, type MiniTaskRow } from "@/components/dashboard/OfficeHubSummaryTable";
import { OutstandingCustomersTable } from "@/components/dashboard/OutstandingCustomersTable";
import { TaskStatusDonutChart, type TaskStatusCount } from "@/components/dashboard/charts/TaskStatusDonutChart";
import { TasksByEmployeeChart, type EmployeeTaskCount } from "@/components/dashboard/charts/TasksByEmployeeChart";
import type { WorkflowTask } from "@/types/workflow";
import type { CustomerRow } from "@/types/customer";

const statusLabels: Record<string, string> = {
  pending: "รอดำเนินการ",
  in_progress: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
};

function taskToRow(task: WorkflowTask): MiniTaskRow {
  return {
    id: task.id,
    taskName: task.remarks ?? "งานประจำเดือน",
    customerName: task.customer.companyName,
    status: task.status,
    progress: task.progress,
    deadline: task.deadline,
    employeeName: task.employee ? `${task.employee.firstName} ${task.employee.lastName}` : "ไม่มอบหมาย",
  };
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

function buildTasksByEmployee(tasks: WorkflowTask[]): EmployeeTaskCount[] {
  const counts = new Map<string, number>();

  tasks.forEach((task) => {
    const key = task.employee ? `${task.employee.firstName} ${task.employee.lastName}` : "ไม่มอบหมาย";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([employee, count]) => ({ employee, count }))
    .sort((a, b) => b.count - a.count);
}

export default function ReportsPage() {
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    async function loadReportsData() {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const [workflowRes, customersRes] = await Promise.all([
          fetch("/api/workflow", { signal: controller.signal }),
          fetch("/api/customers", { signal: controller.signal }),
        ]);

        if (!workflowRes.ok) throw new Error("ไม่สามารถโหลดข้อมูลงานได้");
        if (!customersRes.ok) throw new Error("ไม่สามารถโหลดข้อมูลลูกค้าได้");

        const [workflowData, customersData] = await Promise.all([workflowRes.json(), customersRes.json()]);

        setTasks(workflowData.tasks ?? []);
        setCustomers(customersData ?? []);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;

        const message = (err as Error).message;
        setError(message);
        toast({ title: "โหลดข้อมูลไม่สำเร็จ", description: message, variant: "error" });
      } finally {
        setIsLoading(false);
      }
    }

    void loadReportsData();

    return () => abortControllerRef.current?.abort();
  }, [toast]);

  const today = new Date();

  const overdueTasks = tasks
    .filter((task) => task.deadline !== null && new Date(task.deadline) < today && task.status !== "completed")
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  const upcomingTasks = tasks
    .filter((task) => {
      if (!task.deadline) return false;
      const diffDays = Math.ceil((new Date(task.deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7 && task.status !== "completed";
    })
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  const completedTasks = tasks.filter((task) => task.status === "completed");

  const isEmpty = !isLoading && !error && tasks.length === 0 && customers.length === 0;

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">📊 รายงาน</h1>
        <p className="text-sm text-muted-foreground">ภาพรวมผู้บริหาร — ลูกค้า งานประจำเดือน และภาระงานของพนักงาน</p>
      </div>

      {error ? (
        <ErrorState title="ไม่สามารถโหลดรายงานได้" description={error} />
      ) : isLoading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : isEmpty ? (
        <EmptyState title="ยังไม่มีข้อมูล" description="ยังไม่มีลูกค้าหรืองานประจำเดือนในระบบ" />
      ) : (
        <>
          <ExecutiveKpiCards
            totalCustomers={customers.length}
            totalTasks={tasks.length}
            upcomingTasks={upcomingTasks.length}
            overdueTasks={overdueTasks.length}
            completedTasks={completedTasks.length}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <TaskStatusDonutChart data={buildTaskStatusDistribution(tasks)} />
            <TasksByEmployeeChart data={buildTasksByEmployee(tasks)} />
          </div>

          <div className="space-y-4">
            <OfficeHubSummaryTable title="งานที่ใกล้ครบกำหนด 10 อันดับแรก" tasks={upcomingTasks.slice(0, 10).map(taskToRow)} />
            <OfficeHubSummaryTable title="งานค้าง" tasks={overdueTasks.slice(0, 10).map(taskToRow)} />
            <OutstandingCustomersTable />
          </div>
        </>
      )}
    </main>
  );
}
