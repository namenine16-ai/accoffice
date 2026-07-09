"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { OfficeHubSummaryTable } from "@/components/dashboard/OfficeHubSummaryTable";
import { OfficeHubNotifications } from "@/components/dashboard/OfficeHubNotifications";
import { OfficeHubPendingDocuments } from "@/components/dashboard/OfficeHubPendingDocuments";
import { OfficeHubActivityList } from "@/components/dashboard/OfficeHubActivityList";
import { OfficeHubStats } from "@/components/dashboard/OfficeHubStats";
import { CalendarCard } from "@/components/dashboard/CalendarCard";
import { OfficeHubCharts } from "@/components/dashboard/OfficeHubCharts";
import { TaxDeadlineDashboard } from "@/components/dashboard/TaxDeadlineDashboard";
import { Button } from "@/components/ui/button";
import type { WorkflowTask } from "@/types/workflow";

type MiniTaskRow = {
  id: number;
  taskName: string;
  customerName: string;
  status: string;
  progress: number;
  deadline: string | null;
  employeeName: string;
};

type ActivityItem = {
  id: number;
  title: string;
  description: string;
  timestamp: string;
};

type PendingDocumentRow = {
  id: number;
  customerName: string;
  expectedDocument: string;
  daysWaiting: number;
};

function isSameDay(value: string | null, date: Date) {
  if (!value) {
    return false;
  }

  const target = new Date(value);
  return (
    target.getFullYear() === date.getFullYear() &&
    target.getMonth() === date.getMonth() &&
    target.getDate() === date.getDate()
  );
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

function getPendingDocumentRows(tasks: WorkflowTask[], today: Date): PendingDocumentRow[] {
  return tasks
    .filter((task) =>
      task.status !== "completed" &&
      (!task.receiveDoc || !task.vat || !task.pnd1 || !task.pnd3 || !task.pnd53 || !task.sso || !task.closing)
    )
    .map((task) => {
      const missing = [
        !task.receiveDoc && "เอกสารรับเอกสาร",
        !task.vat && "แบบ VAT",
        !task.pnd1 && "แบบ PND1",
        !task.pnd3 && "แบบ PND3",
        !task.pnd53 && "แบบ PND53",
        !task.sso && "ข้อมูลประกันสังคม",
        !task.closing && "ปิดงบการเงิน",
      ].filter(Boolean) as string[];

      const createdAt = new Date(task.createdAt);
      const daysWaiting = Math.max(0, Math.floor((today.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));

      return {
        id: task.id,
        customerName: task.customer.companyName,
        expectedDocument: missing.join(", ") || "เอกสารเพิ่มเติม",
        daysWaiting,
      };
    });
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocumentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      setError(null);

      try {
        const [workflowRes, activityRes] = await Promise.all([
          fetch("/api/workflow"),
          fetch("/api/activity"),
        ]);

        if (!workflowRes.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลงานได้");
        }

        if (!activityRes.ok) {
          throw new Error("ไม่สามารถโหลดกิจกรรมล่าสุดได้");
        }

        const workflowData = await workflowRes.json();
        const activityData = (await activityRes.json()) as Array<{
          id: number;
          action: string;
          details?: string | null;
          createdAt: string;
        }>;

        const taskPayload = (workflowData.tasks ?? []) as WorkflowTask[];
        setTasks(taskPayload);
        setCustomerCount(workflowData.customers?.length ?? 0);

        setActivities(
          activityData.map((activity) => ({
            id: activity.id,
            title: activity.action,
            description: activity.details ?? "ไม่มีรายละเอียดเพิ่มเติม",
            timestamp: new Date(activity.createdAt).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
          }))
        );

        setPendingDocuments(getPendingDocumentRows(taskPayload, today).slice(0, 5));
      } catch (err) {
        const message = (err as Error).message;
        setError(message);
        toast({ title: "โหลดข้อมูลแดชบอร์ดไม่สำเร็จ", description: message, variant: "error" });
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboardData();
  }, [toast, today]);

  const todayTasks = tasks.filter((task) => isSameDay(task.deadline, today));
  const overdueTasks = tasks
    .filter((task) => task.deadline !== null && new Date(task.deadline) < today && task.status !== "completed")
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  const upcomingDeadlines = tasks
    .filter((task) => {
      if (!task.deadline) {
        return false;
      }

      const deadlineDate = new Date(task.deadline);
      const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7 && task.status !== "completed";
    })
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  const selectedDateTasks = selectedDate ? tasks.filter((task) => isSameDay(task.deadline, selectedDate)) : [];

  const completedThisMonth = tasks.filter((task) => {
    if (!task.completedAt) {
      return false;
    }

    const completedDate = new Date(task.completedAt);
    return completedDate.getMonth() === today.getMonth() && completedDate.getFullYear() === today.getFullYear();
  }).length;

  const summaryStats: Array<{ title: string; value: number; subtitle: string; variant?: "default" | "success" | "warning" | "destructive"; }> = [
    { title: "ลูกค้าทั้งหมด", value: customerCount, subtitle: "บริษัทในระบบทั้งหมด" },
    { title: "งานวันนี้", value: todayTasks.length, subtitle: "งานที่ต้องทำวันนี้", variant: "warning" },
    { title: "งานค้าง", value: overdueTasks.length, subtitle: "งานที่เลยกำหนด", variant: "destructive" },
    { title: "เสร็จเดือนนี้", value: completedThisMonth, subtitle: "งานเสร็จในเดือนนี้", variant: "success" },
    { title: "เอกสารรอดำเนินการ", value: pendingDocuments.length, subtitle: "ลูกค้ารอเอกสาร", variant: "warning" },
  ];

  const notifications: Array<{ id: number; title: string; description: string; variant: "default" | "success" | "warning" | "destructive"; }> = [
    { id: 1, title: "งานวันนี้", description: `${todayTasks.length} งานต้องทำวันนี้`, variant: "success" },
    { id: 2, title: "งานค้างส่ง", description: `${overdueTasks.length} งานที่เลยกำหนด`, variant: "destructive" },
    { id: 3, title: "เอกสารรอการส่ง", description: `${pendingDocuments.length} รายการต้องติดตาม`, variant: "warning" },
  ];

  return (
    <main className="space-y-6 p-6">
      <div className="space-y-3">
        <div>
          <h1 className="text-3xl font-bold">🏢 Office Hub</h1>
          <p className="text-sm text-muted-foreground">แดชบอร์ดศูนย์กลางสำหรับดูสภาพงานและเอกสารในเช้าวันทำการ</p>
        </div>
      </div>

      <OfficeHubStats stats={summaryStats} />

      {isLoading ? (
        <div className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </div>
      ) : error ? (
        <EmptyState title="ไม่สามารถโหลดแดชบอร์ด" description={error} />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="space-y-4">
            {selectedDate ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    งานวันที่ {selectedDate.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedDate(null)}>
                    ล้างตัวกรอง
                  </Button>
                </div>
                <OfficeHubSummaryTable
                  title="งานตามวันที่เลือก"
                  tasks={selectedDateTasks.map(taskToRow)}
                />
              </div>
            ) : null}
            <OfficeHubSummaryTable title="งานวันนี้" tasks={todayTasks.slice(0, 5).map(taskToRow)} />
            <OfficeHubSummaryTable title="งานค้าง" tasks={overdueTasks.slice(0, 5).map(taskToRow)} />
            <OfficeHubSummaryTable title="กำหนดส่ง 7 วัน" tasks={upcomingDeadlines.slice(0, 5).map(taskToRow)} />
            <OfficeHubPendingDocuments items={pendingDocuments} />
          </div>

          <div className="space-y-4">
            <OfficeHubNotifications notifications={notifications} />
            <CalendarCard tasks={tasks} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            <TaxDeadlineDashboard tasks={tasks} today={today} />
            <OfficeHubActivityList activities={activities} />
          </div>
        </div>
      )}

      {!isLoading && !error ? <OfficeHubCharts tasks={tasks} /> : null}
    </main>
  );
}
