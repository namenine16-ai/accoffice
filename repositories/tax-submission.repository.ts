import { prisma } from "@/lib/prisma";
import type { Prisma, TaxSubmissionStatus } from "@prisma/client";

export interface TaxSubmissionFilters {
  taxTaskId?: number;
  status?: TaxSubmissionStatus;
}

const withRelations = {
  submittedBy: {
    select: { id: true, name: true, email: true },
  },
} satisfies Prisma.TaxSubmissionInclude;

export const taxSubmissionRepository = {
  findAll(filters: TaxSubmissionFilters = {}) {
    return prisma.taxSubmission.findMany({
      where: {
        taxTaskId: filters.taxTaskId,
        status: filters.status,
      },
      include: withRelations,
      orderBy: { submittedAt: "desc" },
    });
  },

  findById(id: number) {
    return prisma.taxSubmission.findUnique({
      where: { id },
      include: withRelations,
    });
  },

  create(data: Prisma.TaxSubmissionCreateInput) {
    return prisma.taxSubmission.create({
      data,
    });
  },

  update(id: number, data: Prisma.TaxSubmissionUpdateInput) {
    return prisma.taxSubmission.update({
      where: { id },
      data,
    });
  },
};
