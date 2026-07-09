import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type WorkflowFilters = {
  month?: number;
  year?: number;
  status?: string;
  customerId?: number;
  employeeId?: number;
  query?: string;
};

export const workflowRepository = {
  findTasks(filters: WorkflowFilters = {}) {
    const where: Prisma.CustomerTaskWhereInput = {};

    if (filters.month) {
      where.month = filters.month;
    }

    if (filters.year) {
      where.year = filters.year;
    }

    if (filters.status && filters.status !== "all") {
      where.status = filters.status;
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.employeeId) {
      where.assignedEmployeeId = filters.employeeId;
    }

    if (filters.query) {
      where.OR = [
        { remarks: { contains: filters.query } },
        { note: { contains: filters.query } },
        { customer: { companyName: { contains: filters.query } } },
        { employee: { firstName: { contains: filters.query } } },
        { employee: { lastName: { contains: filters.query } } },
      ];
    }

    return prisma.customerTask.findMany({
      where,
      include: {
        customer: true,
        employee: true,
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" },
        { updatedAt: "desc" },
      ],
    });
  },

  findTaskById(id: number) {
    return prisma.customerTask.findUnique({
      where: { id },
      include: {
        customer: true,
        employee: true,
      },
    });
  },

  updateTask(id: number, data: Prisma.CustomerTaskUpdateInput) {
    return prisma.customerTask.update({
      where: { id },
      data,
      include: {
        customer: true,
        employee: true,
      },
    });
  },

  findAllCustomers() {
    return prisma.customer.findMany({
      select: {
        id: true,
        companyName: true,
      },
      orderBy: { companyName: "asc" },
    });
  },

  findAllEmployees() {
    return prisma.employee.findMany({
      where: { status: "active" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        position: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });
  },
};
