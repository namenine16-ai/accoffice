import type { Priority, TaxTaskStatus } from "@prisma/client";

export type BadgeVariant = "default" | "secondary" | "destructive" | "success" | "warning" | "outline";

export const TAX_TASK_STATUS_LABELS: Record<TaxTaskStatus, string> = {
  PENDING: "รอดำเนินการ",
  READY: "พร้อมดำเนินการ",
  IN_PROGRESS: "กำลังดำเนินการ",
  WAITING_DOCUMENTS: "รอเอกสาร",
  FILED: "ยื่นแบบแล้ว",
  COMPLETED: "เสร็จสิ้น",
  CANCELLED: "ยกเลิก",
};

export const TAX_TASK_STATUS_BADGE_VARIANT: Record<TaxTaskStatus, BadgeVariant> = {
  PENDING: "secondary",
  READY: "outline",
  IN_PROGRESS: "default",
  WAITING_DOCUMENTS: "warning",
  FILED: "default",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

/**
 * Mirrors ALLOWED_TRANSITIONS in services/tax-task.service.ts.
 * Kept as a manually-synced UI-side constant since a client component
 * cannot import a server-only service — see docs/MILESTONES/EPIC-05-M3-UI.md, Risks.
 */
export const TAX_TASK_ALLOWED_TRANSITIONS: Record<TaxTaskStatus, TaxTaskStatus[]> = {
  PENDING: ["READY", "CANCELLED"],
  READY: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["WAITING_DOCUMENTS", "FILED", "CANCELLED"],
  WAITING_DOCUMENTS: ["IN_PROGRESS", "FILED", "CANCELLED"],
  FILED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const TAX_TASK_PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "ต่ำ",
  NORMAL: "ปกติ",
  HIGH: "สูง",
  URGENT: "เร่งด่วน",
};

export const TAX_TASK_PRIORITY_BADGE_VARIANT: Record<Priority, BadgeVariant> = {
  LOW: "secondary",
  NORMAL: "outline",
  HIGH: "warning",
  URGENT: "destructive",
};
