import { taxTaskRepository, type TaxTaskFilters } from "@/repositories/tax-task.repository";
import { dueDateRuleService } from "@/services/due-date-rule.service";
import { activityService } from "@/services/activity.service";
import type { Priority, TaxTaskStatus } from "@prisma/client";

export class TaxTaskError extends Error {}

interface CreateTaxTaskInput {
  customerId: number;
  customerTaskId: number;
  taxTypeId: number;
  month: number;
  year: number;
  assignedEmployeeId?: number;
  priority?: Priority;
  remarks?: string;
}

interface UpdateTaxTaskInput {
  assignedEmployeeId?: number | null;
  priority?: Priority;
  remarks?: string;
}

const ALLOWED_TRANSITIONS: Record<TaxTaskStatus, TaxTaskStatus[]> = {
  PENDING: ["READY", "CANCELLED"],
  READY: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["WAITING_DOCUMENTS", "FILED", "CANCELLED"],
  WAITING_DOCUMENTS: ["IN_PROGRESS", "FILED", "CANCELLED"],
  FILED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const taxTaskService = {
  getAllTasks(filters: TaxTaskFilters = {}) {
    return taxTaskRepository.findAll(filters);
  },

  getTaskById(id: number) {
    return taxTaskRepository.findById(id);
  },

  async createTask(input: CreateTaxTaskInput) {
    const dueDate = await dueDateRuleService.computeDueDate(input.taxTypeId, input.month, input.year);

    const task = await taxTaskRepository.create({
      customer: { connect: { id: input.customerId } },
      customerTask: { connect: { id: input.customerTaskId } },
      taxType: { connect: { id: input.taxTypeId } },
      ...(input.assignedEmployeeId !== undefined
        ? { employee: { connect: { id: input.assignedEmployeeId } } }
        : {}),
      month: input.month,
      year: input.year,
      dueDate,
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.remarks !== undefined ? { remarks: input.remarks } : {}),
    });

    await activityService.logActivity({
      action: "tax.task_created",
      details: `สร้างงานภาษี id ${task.id} (${task.month}/${task.year})`,
    });

    return task;
  },

  async updateTask(id: number, input: UpdateTaxTaskInput) {
    const existing = await taxTaskRepository.findById(id);
    if (!existing) {
      throw new TaxTaskError("ไม่พบงานภาษี");
    }

    const task = await taxTaskRepository.update(id, {
      ...(input.assignedEmployeeId !== undefined
        ? {
            employee: input.assignedEmployeeId
              ? { connect: { id: input.assignedEmployeeId } }
              : { disconnect: true },
          }
        : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.remarks !== undefined ? { remarks: input.remarks } : {}),
    });

    if (input.assignedEmployeeId !== undefined && input.assignedEmployeeId !== existing.assignedEmployeeId) {
      await activityService.logActivity({
        action: "tax.task_assigned",
        details: input.assignedEmployeeId
          ? `มอบหมายงานภาษี id ${id} ให้พนักงาน id ${input.assignedEmployeeId}`
          : `ยกเลิกการมอบหมายงานภาษี id ${id}`,
      });
    }

    return task;
  },

  async updateStatus(id: number, status: TaxTaskStatus) {
    const existing = await taxTaskRepository.findById(id);
    if (!existing) {
      throw new TaxTaskError("ไม่พบงานภาษี");
    }

    if (existing.status === status) {
      return existing;
    }

    const allowed = ALLOWED_TRANSITIONS[existing.status];
    if (!allowed.includes(status)) {
      throw new TaxTaskError(`ไม่สามารถเปลี่ยนสถานะจาก ${existing.status} เป็น ${status} ได้`);
    }

    const task = await taxTaskRepository.update(id, {
      status,
      ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
    });

    await activityService.logActivity({
      action: "tax.task_status_changed",
      details: `เปลี่ยนสถานะงานภาษี id ${id} จาก ${existing.status} เป็น ${status}`,
    });

    return task;
  },

  async deleteTask(id: number) {
    const existing = await taxTaskRepository.findById(id);

    const task = await taxTaskRepository.softDelete(id);

    await activityService.logActivity({
      action: "tax.task_deleted",
      details: existing ? `ลบงานภาษี id ${id} (${existing.month}/${existing.year})` : `ลบงานภาษี id ${id}`,
    });

    return task;
  },
};
