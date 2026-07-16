import { workflowRepository, type WorkflowFilters } from "@/repositories/workflow.repository";
import { customerRepository } from "@/repositories/customer.repository";
import { activityService } from "@/services/activity.service";
import type { WorkflowTask } from "@/types/workflow";
import type { WorkflowTaskUpdateInput } from "@/validators/workflow";

export class WorkflowTaskError extends Error {}

// Shared within the monthly generation flow only — not a refactor of the
// unrelated hardcoded "ใช้งาน" strings already present in the Customer
// module (forms, tables, validators), which stay untouched.
export const ACTIVE_CUSTOMER_STATUS = "ใช้งาน";

export interface GenerateMonthlyTasksResult {
  totalCustomers: number;
  generated: number;
  skipped: number;
  failed: number;
}

function normalizeTasks(tasks: Array<Awaited<ReturnType<typeof workflowRepository.findTasks>>[number]>) {
  return tasks.map((task) => ({
    ...task,
    deadline: task.deadline?.toISOString() ?? null,
    completedAt: task.completedAt?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  })) as WorkflowTask[];
}

function taskCounts(tasks: WorkflowTask[]) {
  const now = new Date();

  return {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((task) => task.status === "completed").length,
    inProgressTasks: tasks.filter((task) => task.status === "in_progress").length,
    pendingTasks: tasks.filter((task) => task.status === "pending").length,
    overdueTasks: tasks.filter(
      (task) =>
        task.deadline &&
        new Date(task.deadline) < now &&
        task.status !== "completed"
    ).length,
  };
}

export const workflowService = {
  async getWorkflowOverview(filters: WorkflowFilters = {}) {
    const [tasks, allTasks, customers, employees] = await Promise.all([
      workflowRepository.findTasks(filters),
      workflowRepository.findTasks(),
      workflowRepository.findAllCustomers(),
      workflowRepository.findAllEmployees(),
    ]);

    const normalizedTasks = normalizeTasks(tasks);
    const summary = taskCounts(normalizeTasks(allTasks));

    return {
      tasks: normalizedTasks,
      customers,
      employees,
      summary,
    };
  },

  getTaskById(id: number) {
    return workflowRepository.findTaskById(id);
  },

  getAssignableEmployees() {
    return workflowRepository.findAllEmployees();
  },

  async updateTask(id: number, input: WorkflowTaskUpdateInput) {
    const existing = await workflowRepository.findTaskById(id);

    if (!existing) {
      throw new WorkflowTaskError("ไม่พบงานที่ร้องขอ");
    }

    const task = await workflowRepository.updateTask(id, {
      ...(input.assignedEmployeeId !== undefined && {
        employee: input.assignedEmployeeId
          ? { connect: { id: input.assignedEmployeeId } }
          : { disconnect: true },
      }),
      ...(input.status !== undefined && { status: input.status }),
    });

    if (input.assignedEmployeeId !== undefined && input.assignedEmployeeId !== existing.assignedEmployeeId) {
      await activityService.logActivity({
        action: "workflow.task_assigned",
        details: task.employee
          ? `มอบหมายงาน ${task.customer.companyName} (${task.month}/${task.year}) ให้ ${task.employee.firstName} ${task.employee.lastName}`
          : `ยกเลิกการมอบหมายงาน ${task.customer.companyName} (${task.month}/${task.year})`,
      });
    }

    if (input.status !== undefined && input.status !== existing.status) {
      await activityService.logActivity({
        action: "workflow.task_status_changed",
        details: `เปลี่ยนสถานะงาน ${task.customer.companyName} (${task.month}/${task.year}) เป็น ${task.status}`,
      });
    }

    return task;
  },

  async generateMonthlyTasks(month: number, year: number): Promise<GenerateMonthlyTasksResult> {
    const [allCustomers, existingTasks] = await Promise.all([
      customerRepository.findAll(),
      workflowRepository.findTasks({ month, year }),
    ]);

    const activeCustomers = allCustomers.filter((customer) => customer.status === ACTIVE_CUSTOMER_STATUS);
    const existingCustomerIds = new Set(existingTasks.map((task) => task.customerId));

    let generated = 0;
    let skipped = 0;
    let failed = 0;

    for (const customer of activeCustomers) {
      if (existingCustomerIds.has(customer.id)) {
        skipped += 1;
        continue;
      }

      try {
        await workflowRepository.createTask({
          customer: { connect: { id: customer.id } },
          month,
          year,
        });
        generated += 1;
      } catch (error) {
        failed += 1;
        console.error(
          JSON.stringify({
            level: "error",
            scope: "workflow.generateMonthlyTasks",
            customerId: customer.id,
            error: String(error),
          })
        );
      }
    }

    await activityService.logActivity({
      action: "workflow.monthly_generation",
      details: `สร้างงานประจำเดือน ${month}/${year}: สร้างสำเร็จ ${generated} ราย, ข้าม ${skipped} ราย, ล้มเหลว ${failed} ราย (จากลูกค้าที่ใช้งานทั้งหมด ${activeCustomers.length} ราย)`,
    });

    return {
      totalCustomers: activeCustomers.length,
      generated,
      skipped,
      failed,
    };
  },
};
