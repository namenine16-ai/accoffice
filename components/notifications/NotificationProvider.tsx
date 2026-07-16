"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { WorkflowTask } from "@/types/workflow";

export type NotificationType = "overdue" | "due_today" | "due_soon" | "pending_documents" | "tax_deadline";
export type NotificationPriority = "critical" | "high" | "normal";

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  description: string;
  customer: string;
  date: string | null;
  href?: string;
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  isRead: (id: string) => boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const defaultContextValue: NotificationContextValue = {
  notifications: [],
  unreadCount: 0,
  isLoading: true,
  error: null,
  isRead: () => false,
  markAsRead: () => {},
  markAllAsRead: () => {},
};

export const NotificationContext = createContext<NotificationContextValue>(defaultContextValue);

const PRIORITY_ORDER: Record<NotificationPriority, number> = { critical: 0, high: 1, normal: 2 };

function buildWorkflowNotifications(tasks: WorkflowTask[], today: Date): Notification[] {
  const notifications: Notification[] = [];

  tasks.forEach((task) => {
    if (task.status === "completed") return;

    const taskName = task.remarks ?? "งานประจำเดือน";
    const customer = task.customer.companyName;
    const href = `/workflow/${task.id}`;

    if (task.deadline) {
      const deadline = new Date(task.deadline);
      const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (deadline < today) {
        notifications.push({
          id: `overdue-${task.id}`,
          type: "overdue",
          priority: "critical",
          title: `งานเลยกำหนด: ${taskName}`,
          description: `${customer} — เลยกำหนดส่งแล้ว`,
          customer,
          date: task.deadline,
          href,
        });
      } else if (diffDays === 0) {
        notifications.push({
          id: `due-today-${task.id}`,
          type: "due_today",
          priority: "high",
          title: `ครบกำหนดวันนี้: ${taskName}`,
          description: `${customer} — ครบกำหนดส่งวันนี้`,
          customer,
          date: task.deadline,
          href,
        });
      } else if (diffDays >= 1 && diffDays <= 7) {
        notifications.push({
          id: `due-soon-${task.id}`,
          type: "due_soon",
          priority: "normal",
          title: `ใกล้ครบกำหนด: ${taskName}`,
          description: `${customer} — ครบกำหนดในอีก ${diffDays} วัน`,
          customer,
          date: task.deadline,
          href,
        });
      }
    }

    const missingDocs = [
      !task.receiveDoc && "เอกสารรับเอกสาร",
      !task.vat && "แบบ VAT",
      !task.pnd1 && "แบบ PND1",
      !task.pnd3 && "แบบ PND3",
      !task.pnd53 && "แบบ PND53",
      !task.sso && "ข้อมูลประกันสังคม",
      !task.closing && "ปิดงบการเงิน",
    ].filter(Boolean) as string[];

    if (missingDocs.length > 0) {
      notifications.push({
        id: `pending-documents-${task.id}`,
        type: "pending_documents",
        priority: "normal",
        title: `รอเอกสาร: ${taskName}`,
        description: `${customer} — รอ: ${missingDocs.join(", ")}`,
        customer,
        date: task.deadline,
        href,
      });
    }
  });

  return notifications;
}

interface TaxCalendarTask {
  id: number;
  dueDate: string;
  customer: { companyName: string };
  taxType: { name: string };
}

function buildTaxDeadlineNotifications(
  overdue: TaxCalendarTask[],
  dueToday: TaxCalendarTask[],
  upcoming: TaxCalendarTask[]
): Notification[] {
  function toNotification(task: TaxCalendarTask, priority: NotificationPriority, label: string): Notification {
    return {
      id: `tax-deadline-${task.id}`,
      type: "tax_deadline",
      priority,
      title: `${label}: ${task.taxType.name}`,
      description: `${task.customer.companyName} — ${label}`,
      customer: task.customer.companyName,
      date: task.dueDate,
      href: "/tax/calendar",
    };
  }

  return [
    ...overdue.map((task) => toNotification(task, "critical", "ภาษีเลยกำหนด")),
    ...dueToday.map((task) => toNotification(task, "high", "ภาษีครบกำหนดวันนี้")),
    ...upcoming.map((task) => toNotification(task, "high", "ภาษีใกล้ครบกำหนด")),
  ];
}

function sortNotifications(notifications: Notification[], readIds: Set<string>): Notification[] {
  return [...notifications].sort((a, b) => {
    const aRead = readIds.has(a.id) ? 1 : 0;
    const bRead = readIds.has(b.id) ? 1 : 0;
    if (aRead !== bRead) return aRead - bRead;

    const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    const aTime = a.date ? new Date(a.date).getTime() : Number.MAX_SAFE_INTEGER;
    const bTime = b.date ? new Date(b.date).getTime() : Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  });
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [rawNotifications, setRawNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadNotifications() {
      setIsLoading(true);
      setError(null);

      try {
        const [workflowRes, taxCalendarRes] = await Promise.all([
          fetch("/api/workflow", { signal: controller.signal }),
          fetch("/api/tax/calendar", { signal: controller.signal }),
        ]);

        if (!workflowRes.ok) throw new Error("ไม่สามารถโหลดข้อมูลงานได้");
        if (!taxCalendarRes.ok) throw new Error("ไม่สามารถโหลดปฏิทินภาษีได้");

        const [workflowData, taxCalendarData] = await Promise.all([workflowRes.json(), taxCalendarRes.json()]);

        const today = new Date();
        const workflowNotifications = buildWorkflowNotifications(workflowData.tasks ?? [], today);
        const taxNotifications = buildTaxDeadlineNotifications(
          taxCalendarData.overdue ?? [],
          taxCalendarData.dueToday ?? [],
          taxCalendarData.upcoming ?? []
        );

        setRawNotifications([...workflowNotifications, ...taxNotifications]);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadNotifications();

    return () => controller.abort();
  }, []);

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds(new Set(rawNotifications.map((notification) => notification.id)));
  }, [rawNotifications]);

  const isRead = useCallback((id: string) => readIds.has(id), [readIds]);

  const notifications = useMemo(() => sortNotifications(rawNotifications, readIds), [rawNotifications, readIds]);
  const unreadCount = useMemo(
    () => rawNotifications.filter((notification) => !readIds.has(notification.id)).length,
    [rawNotifications, readIds]
  );

  const value = useMemo<NotificationContextValue>(
    () => ({ notifications, unreadCount, isLoading, error, isRead, markAsRead, markAllAsRead }),
    [notifications, unreadCount, isLoading, error, isRead, markAsRead, markAllAsRead]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
