import { prisma } from "@/lib/prisma";
import type { DocumentCategory, Prisma } from "@prisma/client";

export interface DocumentFilters {
  customerId?: number;
  taskId?: number;
  category?: DocumentCategory;
}

const withRelations = {
  customer: true,
  uploadedBy: {
    select: { id: true, name: true, email: true },
  },
  task: true,
} satisfies Prisma.DocumentInclude;

export const documentRepository = {
  findAll(filters: DocumentFilters = {}) {
    return prisma.document.findMany({
      where: {
        deletedAt: null,
        customerId: filters.customerId,
        taskId: filters.taskId,
        category: filters.category,
      },
      include: withRelations,
      orderBy: { id: "desc" },
    });
  },

  findById(id: number) {
    return prisma.document.findFirst({
      where: { id, deletedAt: null },
      include: withRelations,
    });
  },

  create(data: Prisma.DocumentCreateInput) {
    return prisma.document.create({
      data,
    });
  },

  update(id: number, data: Prisma.DocumentUpdateInput) {
    return prisma.document.update({
      where: { id },
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
