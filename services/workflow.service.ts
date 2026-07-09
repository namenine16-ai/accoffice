import { workflowRepository, type WorkflowFilters } from "@/repositories/workflow.repository";
import type { WorkflowTask } from "@/types/workflow";

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
};
