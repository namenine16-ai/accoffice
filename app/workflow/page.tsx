"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import WorkflowTaskTable from "@/components/workflow/WorkflowTaskTable";
import { WorkflowSummary } from "@/components/workflow/WorkflowSummary";
import { WorkflowFilters, WorkflowFiltersState } from "@/components/workflow/WorkflowFilters";
import type { WorkflowTask } from "@/types/workflow";

interface SummaryCounts {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

const initialFilters: WorkflowFiltersState = {
  month: "all",
  year: "all",
  status: "all",
  customerId: "all",
  employeeId: "all",
  query: "",
};

export default function WorkflowPage() {
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [customers, setCustomers] = useState<Array<{ id: number; companyName: string }>>([]);
  const [employees, setEmployees] = useState<Array<{ id: number; firstName: string; lastName: string }>>([]);
  const [summary, setSummary] = useState<SummaryCounts>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
  });
  const [filters, setFilters] = useState<WorkflowFiltersState>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadWorkflow = useCallback(async (activeFilters: WorkflowFiltersState) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = new URL("/api/workflow", window.location.origin);

      if (activeFilters.month !== "all") {
        url.searchParams.set("month", activeFilters.month);
      }
      if (activeFilters.year !== "all") {
        url.searchParams.set("year", activeFilters.year);
      }
      if (activeFilters.status !== "all") {
        url.searchParams.set("status", activeFilters.status);
      }
      if (activeFilters.customerId !== "all") {
        url.searchParams.set("customerId", activeFilters.customerId);
      }
      if (activeFilters.employeeId !== "all") {
        url.searchParams.set("employeeId", activeFilters.employeeId);
      }
      if (activeFilters.query.trim()) {
        url.searchParams.set("query", activeFilters.query.trim());
      }

      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error("ไม่สามารถโหลดข้อมูลงานได้");
      }

      const data = await res.json();
      setTasks(data.tasks ?? []);
      setCustomers(data.customers ?? []);
      setEmployees(data.employees ?? []);
      setSummary(
        data.summary ?? {
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          pendingTasks: 0,
          overdueTasks: 0,
        }
      );
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      toast({ title: "โหลดงานไม่สำเร็จ", description: message, variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    async function loadInitialWorkflow() {
      await loadWorkflow(initialFilters);
    }

    void loadInitialWorkflow();
  }, [loadWorkflow]);

  return (
    <main className="space-y-6 p-0">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">📅 งานประจำเดือน</h1>
          <p className="text-sm text-muted-foreground mt-1">ติดตามสถานะงานภาษีและบัญชีรายเดือนทั้งหมด</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/customers">
            <Button variant="outline">ลูกค้า</Button>
          </Link>
          <Button onClick={() => void loadWorkflow(filters)}>รีเฟรช</Button>
        </div>
      </div>

      <WorkflowSummary
        totalTasks={summary.totalTasks}
        completedTasks={summary.completedTasks}
        inProgressTasks={summary.inProgressTasks}
        pendingTasks={summary.pendingTasks}
        overdueTasks={summary.overdueTasks}
      />

      <WorkflowFilters
        filters={filters}
        customers={customers}
        employees={employees}
        onFiltersChange={setFilters}
        onSearch={() => void loadWorkflow(filters)}
        onReset={() => setFilters(initialFilters)}
      />

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      ) : null}

      <div className="rounded-lg border bg-card p-0 shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">รายการงาน</h2>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid gap-3">
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} className="h-12 rounded-xl" />
                ))}
              </div>
            </div>
          ) : error ? (
            <ErrorState title="ไม่สามารถโหลดข้อมูล" description={error} />
          ) : tasks.length === 0 ? (
            <EmptyState title="ไม่มีงาน" description="ไม่พบงานสำหรับตัวกรองที่เลือก" />
          ) : (
            <WorkflowTaskTable tasks={tasks} />
          )}
        </div>
      </div>
    </main>
  );
}
