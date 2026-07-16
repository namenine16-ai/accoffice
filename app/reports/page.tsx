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
import { TasksByMonthChart, type MonthlyTaskCount } from "@/components/dashboard/charts/TasksByMonthChart";
import { SlaTrendChart, type MonthlySlaRate } from "@/components/dashboard/charts/SlaTrendChart";
import { SlaWorkloadKpiCards } from "@/components/dashboard/SlaWorkloadKpiCards";
import {
  EmployeeWorkloadRankingTable,
  type EmployeeWorkloadRow,
} from "@/components/dashboard/EmployeeWorkloadRankingTable";
import {
  SlaDashboardFilters,
  type SlaDashboardFilterValues,
} from "@/components/dashboard/SlaDashboardFilters";
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

// GET /api/employees returns the full Employee record; the SLA & Workload
// Dashboard only needs id/firstName/lastName for filter options and ranking,
// so it declares its own local shape rather than modifying types/employee.ts.
interface ReportsEmployee {
  id: number;
  firstName: string;
  lastName: string;
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

// SLA & Workload Dashboard derivations

function isSameDay(value: string | null, date: Date): boolean {
  if (!value) return false;

  const target = new Date(value);
  return (
    target.getFullYear() === date.getFullYear() &&
    target.getMonth() === date.getMonth() &&
    target.getDate() === date.getDate()
  );
}

/**
 * Month/Year/Customer always apply; the Employee filter is optionally
 * excluded so the Employee Workload Ranking table can keep showing every
 * employee's row (per Sprint 4's "show ALL employees" requirement) even
 * when a specific employee is selected elsewhere on the same filter bar.
 */
function applySlaFilters(
  tasks: WorkflowTask[],
  filters: SlaDashboardFilterValues,
  includeEmployeeFilter: boolean
): WorkflowTask[] {
  return tasks.filter((task) => {
    if (filters.month !== null && task.month !== filters.month) return false;
    if (filters.year !== null && task.year !== filters.year) return false;
    if (includeEmployeeFilter && filters.employeeId !== null && task.employee?.id !== filters.employeeId) return false;
    if (filters.customerId !== null && task.customer.id !== filters.customerId) return false;
    return true;
  });
}

interface MonthBucket {
  year: number;
  month: number;
  label: string;
}

const monthNamesTh = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

// "Tasks by Month" and "SLA Trend" are exempt from the filter bar and always
// show the trailing 6 months, matching OfficeHubCharts.tsx's existing convention.
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

function buildTasksByMonthFixed(tasks: WorkflowTask[], buckets: MonthBucket[]): MonthlyTaskCount[] {
  return buckets.map((bucket) => ({
    month: bucket.label,
    count: tasks.filter((task) => task.year === bucket.year && task.month === bucket.month).length,
  }));
}

// On-time: completedAt <= deadline. Late: completedAt > deadline. Tasks with
// no deadline, or not yet completed, cannot be classified either way and are
// excluded from both the numerator and denominator.
function buildSlaTrend(tasks: WorkflowTask[], buckets: MonthBucket[]): MonthlySlaRate[] {
  return buckets.map((bucket) => {
    const monthTasks = tasks.filter((task) => task.year === bucket.year && task.month === bucket.month);
    const evaluable = monthTasks.filter((task) => task.deadline !== null && task.completedAt !== null);
    const onTime = evaluable.filter(
      (task) => new Date(task.completedAt!).getTime() <= new Date(task.deadline!).getTime()
    );
    const rate = evaluable.length > 0 ? Math.round((onTime.length / evaluable.length) * 100) : 0;

    return { month: bucket.label, onTimeRate: rate };
  });
}

function buildEmployeeWorkloadRanking(
  tasks: WorkflowTask[],
  employees: ReportsEmployee[],
  today: Date
): EmployeeWorkloadRow[] {
  return employees
    .map((employee) => {
      const employeeTasks = tasks.filter((task) => task.employee?.id === employee.id);

      return {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        totalTasks: employeeTasks.length,
        overdueTasks: employeeTasks.filter(
          (task) => task.deadline !== null && new Date(task.deadline) < today && task.status !== "completed"
        ).length,
        completedTasks: employeeTasks.filter((task) => task.status === "completed").length,
      };
    })
    .sort((a, b) => b.totalTasks - a.totalTasks);
}

export default function ReportsPage() {
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [customers, setCustomers] = useState<ReportsCustomer[]>([]);
  const [employees, setEmployees] = useState<ReportsEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slaFilters, setSlaFilters] = useState<SlaDashboardFilterValues>({
    month: null,
    year: null,
    employeeId: null,
    customerId: null,
  });
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
        const [workflowRes, customersRes, employeesRes] = await Promise.all([
          fetch("/api/workflow", { signal: controller.signal }),
          fetch("/api/customers", { signal: controller.signal }),
          fetch("/api/employees", { signal: controller.signal }),
        ]);

        if (!workflowRes.ok) throw new Error("ไม่สามารถโหลดข้อมูลงานได้");
        if (!customersRes.ok) throw new Error("ไม่สามารถโหลดข้อมูลลูกค้าได้");
        if (!employeesRes.ok) throw new Error("ไม่สามารถโหลดข้อมูลพนักงานได้");

        const [workflowData, customersData, employeesData] = await Promise.all([
          workflowRes.json(),
          customersRes.json(),
          employeesRes.json(),
        ]);

        setTasks(workflowData.tasks ?? []);
        setCustomers(customersData ?? []);
        setEmployees(employeesData ?? []);
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

  // SLA & Workload Dashboard derivations
  const slaFilteredTasks = applySlaFilters(tasks, slaFilters, true);

  const slaOverdueTasks = slaFilteredTasks
    .filter((task) => task.deadline !== null && new Date(task.deadline) < today && task.status !== "completed")
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  const slaDueTodayTasks = slaFilteredTasks.filter(
    (task) => isSameDay(task.deadline, today) && task.status !== "completed"
  );

  const slaUpcomingTasks = slaFilteredTasks
    .filter((task) => {
      if (!task.deadline) return false;
      const diffDays = Math.ceil((new Date(task.deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7 && task.status !== "completed";
    })
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  const slaCompletedTasks = slaFilteredTasks.filter((task) => task.status === "completed");

  const slaProductivity =
    slaFilteredTasks.length > 0 ? Math.round((slaCompletedTasks.length / slaFilteredTasks.length) * 100) : 0;

  const employeeWorkloadTasks = applySlaFilters(tasks, slaFilters, true);
  const employeeWorkloadRanking = buildEmployeeWorkloadRanking(employeeWorkloadTasks, employees, today);

  const last6MonthBuckets = getLastSixMonthBuckets(today);
  const tasksByMonthFixed = buildTasksByMonthFixed(tasks, last6MonthBuckets);
  const slaTrendData = buildSlaTrend(tasks, last6MonthBuckets);

  const employeeFilterOptions = employees.map((employee) => ({
    id: employee.id,
    name: `${employee.firstName} ${employee.lastName}`,
  }));
  const customerFilterOptions = customers.map((customer) => ({ id: customer.id, companyName: customer.companyName }));

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

          <Separator />

          <section className="space-y-6">
            <h2 className="text-xl font-semibold">SLA & Workload Dashboard</h2>

            <SlaDashboardFilters
              employees={employeeFilterOptions}
              customers={customerFilterOptions}
              onApply={setSlaFilters}
            />

            <SlaWorkloadKpiCards
              totalTasks={slaFilteredTasks.length}
              overdueTasks={slaOverdueTasks.length}
              dueTodayTasks={slaDueTodayTasks.length}
              upcomingTasks={slaUpcomingTasks.length}
              completedTasks={slaCompletedTasks.length}
              productivity={slaProductivity}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <TaskStatusDonutChart
                title="สัดส่วนสถานะงาน (ตามตัวกรอง)"
                description="กระจายงานตามสถานะ ตามตัวกรองที่เลือก"
                data={buildTaskStatusDistribution(slaFilteredTasks)}
              />
              <TasksByEmployeeChart data={buildTasksByEmployee(slaFilteredTasks)} />
              <TasksByMonthChart data={tasksByMonthFixed} />
              <SlaTrendChart data={slaTrendData} />
            </div>

            <div className="space-y-4">
              <OfficeHubSummaryTable title="งานค้าง 10 อันดับแรก" tasks={slaOverdueTasks.slice(0, 10).map(taskToRow)} />
              <OfficeHubSummaryTable
                title="ครบกำหนดวันนี้ 10 อันดับแรก"
                tasks={slaDueTodayTasks.slice(0, 10).map(taskToRow)}
              />
              <OfficeHubSummaryTable
                title="ใกล้ครบกำหนด 10 อันดับแรก"
                tasks={slaUpcomingTasks.slice(0, 10).map(taskToRow)}
              />
              <EmployeeWorkloadRankingTable rows={employeeWorkloadRanking} />
            </div>
          </section>
        </>
      )}
    </main>
  );
}
