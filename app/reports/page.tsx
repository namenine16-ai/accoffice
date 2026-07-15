"use client";

import { useEffect, useRef, useState } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { ExecutiveKpiCards } from "@/components/dashboard/ExecutiveKpiCards";
import { RevenueKpiCards } from "@/components/dashboard/RevenueKpiCards";
import { OfficeHubSummaryTable, type MiniTaskRow } from "@/components/dashboard/OfficeHubSummaryTable";
import { OutstandingCustomersTable } from "@/components/dashboard/OutstandingCustomersTable";
import {
  LatestCustomersTable,
  HighestContractValueTable,
  CustomersWithoutEmployeeTable,
  type CustomerSummaryRow,
} from "@/components/dashboard/CustomerSummaryTables";
import { TaskStatusDonutChart, type TaskStatusCount } from "@/components/dashboard/charts/TaskStatusDonutChart";
import { TasksByEmployeeChart, type EmployeeTaskCount } from "@/components/dashboard/charts/TasksByEmployeeChart";
import {
  CustomerCountByCategoryChart,
  type CategoryCount,
} from "@/components/dashboard/charts/CustomerCountByCategoryChart";
import type { WorkflowTask } from "@/types/workflow";

const statusLabels: Record<string, string> = {
  pending: "รอดำเนินการ",
  in_progress: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
};

// GET /api/customers returns the full Customer record; types/customer.ts's
// CustomerRow only covers the fields the Customer list page needs. This page
// needs a few more (businessType, serviceFee, createdAt) for the Revenue
// Dashboard, so it declares its own local shape rather than modifying that
// shared type (out of scope for this sprint).
interface ReportsCustomer {
  id: number;
  companyName: string;
  businessType: string | null;
  serviceFee: number;
  status: string;
  createdAt: string;
}

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

const UNASSIGNED_LABEL = "ไม่มอบหมาย";

/**
 * Per customer, "responsible employee" is not a stored field — it's derived
 * from that customer's most recent CustomerTask (sorted year desc, month
 * desc). No task, or a task with no assignedEmployeeId, means Unassigned.
 */
function buildResponsibleEmployeeByCustomer(tasks: WorkflowTask[]): Map<number, string> {
  const latestByCustomer = new Map<number, WorkflowTask>();

  tasks.forEach((task) => {
    const existing = latestByCustomer.get(task.customer.id);
    if (!existing || task.year > existing.year || (task.year === existing.year && task.month > existing.month)) {
      latestByCustomer.set(task.customer.id, task);
    }
  });

  const result = new Map<number, string>();
  latestByCustomer.forEach((task, customerId) => {
    result.set(customerId, task.employee ? `${task.employee.firstName} ${task.employee.lastName}` : UNASSIGNED_LABEL);
  });

  return result;
}

function buildCustomersByBusinessType(customers: ReportsCustomer[]): CategoryCount[] {
  const counts = new Map<string, number>();

  customers.forEach((customer) => {
    const key = customer.businessType?.trim() || "ไม่ระบุ";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function buildCustomersByResponsibleEmployee(
  customers: ReportsCustomer[],
  responsibleEmployeeByCustomer: Map<number, string>
): CategoryCount[] {
  const counts = new Map<string, number>();

  customers.forEach((customer) => {
    const key = responsibleEmployeeByCustomer.get(customer.id) ?? UNASSIGNED_LABEL;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function buildCustomerStatusDistribution(customers: ReportsCustomer[]): TaskStatusCount[] {
  const counts = new Map<string, number>();

  customers.forEach((customer) => {
    counts.set(customer.status, (counts.get(customer.status) ?? 0) + 1);
  });

  return Array.from(counts.entries()).map(([status, count]) => ({
    status,
    label: status,
    count,
  }));
}

function toCustomerSummaryRow(customer: ReportsCustomer, responsibleEmployee: string): CustomerSummaryRow {
  return {
    id: customer.id,
    companyName: customer.companyName,
    status: customer.status,
    serviceFee: customer.serviceFee,
    createdAt: customer.createdAt,
    responsibleEmployee,
  };
}

export default function ReportsPage() {
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [customers, setCustomers] = useState<ReportsCustomer[]>([]);
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

  // Executive Dashboard derivations
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

  // Revenue Dashboard derivations
  const activeCustomers = customers.filter((customer) => customer.status === "ใช้งาน");

  const newCustomers = customers.filter((customer) => {
    const createdAt = new Date(customer.createdAt);
    return createdAt.getMonth() === today.getMonth() && createdAt.getFullYear() === today.getFullYear();
  });

  const totalServiceFee = customers.reduce((sum, customer) => sum + customer.serviceFee, 0);
  const estimatedMonthlyContractValue = totalServiceFee;
  const estimatedAnnualContractValue = totalServiceFee * 12;
  const averageMonthlyContractValue = customers.length > 0 ? totalServiceFee / customers.length : 0;

  const responsibleEmployeeByCustomer = buildResponsibleEmployeeByCustomer(tasks);

  const latestCustomers = [...customers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map((customer) => toCustomerSummaryRow(customer, responsibleEmployeeByCustomer.get(customer.id) ?? UNASSIGNED_LABEL));

  const highestContractValueCustomers = [...customers]
    .sort((a, b) => b.serviceFee - a.serviceFee)
    .slice(0, 10)
    .map((customer) => toCustomerSummaryRow(customer, responsibleEmployeeByCustomer.get(customer.id) ?? UNASSIGNED_LABEL));

  const customersWithoutEmployee = customers
    .filter((customer) => (responsibleEmployeeByCustomer.get(customer.id) ?? UNASSIGNED_LABEL) === UNASSIGNED_LABEL)
    .map((customer) => toCustomerSummaryRow(customer, UNASSIGNED_LABEL));

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
          <section className="space-y-6">
            <h2 className="text-xl font-semibold">Executive Dashboard</h2>

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
              <OfficeHubSummaryTable
                title="งานที่ใกล้ครบกำหนด 10 อันดับแรก"
                tasks={upcomingTasks.slice(0, 10).map(taskToRow)}
              />
              <OfficeHubSummaryTable title="งานค้าง" tasks={overdueTasks.slice(0, 10).map(taskToRow)} />
              <OutstandingCustomersTable />
            </div>
          </section>

          <Separator />

          <section className="space-y-6">
            <h2 className="text-xl font-semibold">Revenue Dashboard</h2>

            <RevenueKpiCards
              activeCustomers={activeCustomers.length}
              newCustomers={newCustomers.length}
              estimatedMonthlyContractValue={estimatedMonthlyContractValue}
              estimatedAnnualContractValue={estimatedAnnualContractValue}
              averageMonthlyContractValue={averageMonthlyContractValue}
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <CustomerCountByCategoryChart
                title="ลูกค้าตามประเภทธุรกิจ"
                description="จำนวนลูกค้าจำแนกตามประเภทธุรกิจ"
                data={buildCustomersByBusinessType(customers)}
              />
              <CustomerCountByCategoryChart
                title="ลูกค้าตามพนักงานผู้รับผิดชอบ"
                description="จำนวนลูกค้าจำแนกตามพนักงานที่รับผิดชอบล่าสุด"
                data={buildCustomersByResponsibleEmployee(customers, responsibleEmployeeByCustomer)}
              />
              <TaskStatusDonutChart
                title="Customer Status Distribution"
                description="Customer distribution by current status"
                data={buildCustomerStatusDistribution(customers)}
              />
            </div>

            <div className="space-y-4">
              <LatestCustomersTable customers={latestCustomers} />
              <HighestContractValueTable customers={highestContractValueCustomers} />
              <CustomersWithoutEmployeeTable customers={customersWithoutEmployee} />
            </div>
          </section>
        </>
      )}
    </main>
  );
}
