import { taxTaskRepository, type TaxTaskFilters } from "@/repositories/tax-task.repository";
import type { TaxTaskStatus } from "@prisma/client";

const DEFAULT_UPCOMING_WINDOW_DAYS = 7;

interface CalendarTask {
  dueDate: Date;
  status: TaxTaskStatus;
}

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function isOpen(task: CalendarTask) {
  return task.status !== "COMPLETED" && task.status !== "CANCELLED";
}

function isOverdue(task: CalendarTask) {
  return isOpen(task) && startOfDay(task.dueDate) < startOfDay(new Date());
}

function isDueToday(task: CalendarTask) {
  return isOpen(task) && startOfDay(task.dueDate).getTime() === startOfDay(new Date()).getTime();
}

function isUpcoming(task: CalendarTask, windowDays: number) {
  if (!isOpen(task)) {
    return false;
  }

  const today = startOfDay(new Date());
  const dueDate = startOfDay(task.dueDate);
  const windowEnd = new Date(today);
  windowEnd.setDate(windowEnd.getDate() + windowDays);

  return dueDate > today && dueDate <= windowEnd;
}

export const taxCalendarService = {
  isOverdue,
  isDueToday,
  isUpcoming,

  getCalendarForPeriod(month: number, year: number, filters: Omit<TaxTaskFilters, "month" | "year"> = {}) {
    return taxTaskRepository.findAll({ ...filters, month, year });
  },

  async getDashboardSummary(filters: TaxTaskFilters = {}, windowDays = DEFAULT_UPCOMING_WINDOW_DAYS) {
    const tasks = await taxTaskRepository.findAll(filters);

    const overdue = tasks.filter(isOverdue);
    const dueToday = tasks.filter(isDueToday);
    const upcoming = tasks.filter((task) => isUpcoming(task, windowDays));
    const completed = tasks.filter((task) => task.status === "COMPLETED");

    return {
      overdue,
      dueToday,
      upcoming,
      completed,
      counts: {
        overdue: overdue.length,
        dueToday: dueToday.length,
        upcoming: upcoming.length,
        completed: completed.length,
        total: tasks.length,
      },
    };
  },
};
