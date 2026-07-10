import { prisma } from "@/lib/prisma";
import type { DocumentCategory, Prisma } from "@prisma/client";

export interface DocumentFilters {
  customerId?: number;
  taskId?: number;
  category?: DocumentCategory;
}

export const documentRepository = {
  findAll(filters: DocumentFilters = {}) {
    return prisma.document.findMany({
      where: {
        deletedAt: null,
        customerId: filters.customerId,
        taskId: filters.taskId,
        category: filters.category,
      },
      orderBy: { id: "desc" },
    });
  },

  findById(id: number) {
    return prisma.document.findFirst({
      where: { id, deletedAt: null },
    });
  },

  create(data: Prisma.DocumentCreateInput) {
    return prisma.document.create({
      data,
    });
  },

  softDelete(id: number) {
    return prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
