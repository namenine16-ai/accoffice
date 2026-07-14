import { prisma } from "@/lib/prisma";
import type { Prisma, TaxTaskStatus } from "@prisma/client";

export interface TaxTaskFilters {
  customerId?: number;
  taxTypeId?: number;
  assignedEmployeeId?: number;
  status?: TaxTaskStatus;
  year?: number;
  month?: number;
  dueDateFrom?: Date;
  dueDateTo?: Date;
}

const withRelations = {
  customer: true,
  customerTask: true,
  taxType: true,
  employee: true,
} satisfies Prisma.TaxTaskInclude;

export const taxTaskRepository = {
  findAll(filters: TaxTaskFilters = {}) {
    const where: Prisma.TaxTaskWhereInput = {
      deletedAt: null,
      customerId: filters.customerId,
      taxTypeId: filters.taxTypeId,
      assignedEmployeeId: filters.assignedEmployeeId,
      status: filters.status,
      year: filters.year,
      month: filters.month,
    };

    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {
        gte: filters.dueDateFrom,
        lte: filters.dueDateTo,
      };
    }

    return prisma.taxTask.findMany({
      where,
      include: withRelations,
      orderBy: { dueDate: "asc" },
    });
  },

  findById(id: number) {
    return prisma.taxTask.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...withRelations,
        submissions: true,
      },
    });
  },

  create(data: Prisma.TaxTaskCreateInput) {
    return prisma.taxTask.create({
      data,
    });
  },

  update(id: number, data: Prisma.TaxTaskUpdateInput) {
    return prisma.taxTask.update({
      where: { id },
      data,
    });
  },

  softDelete(id: number) {
    return prisma.taxTask.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
