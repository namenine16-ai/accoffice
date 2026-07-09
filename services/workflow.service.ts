import { workflowRepository, type WorkflowFilters } from "@/repositories/workflow.repository";
import { activityService } from "@/services/activity.service";
import type { WorkflowTask } from "@/types/workflow";
import type { WorkflowTaskUpdateInput } from "@/validators/workflow";

export class WorkflowTaskError extends Error {}

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
};
