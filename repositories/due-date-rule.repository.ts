import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const withRelations = {
  taxType: true,
} satisfies Prisma.DueDateRuleInclude;

export const dueDateRuleRepository = {
  findAll() {
    return prisma.dueDateRule.findMany({
      include: withRelations,
      orderBy: { id: "asc" },
    });
  },

  findById(id: number) {
    return prisma.dueDateRule.findUnique({
      where: { id },
      include: withRelations,
    });
  },

  findByTaxTypeId(taxTypeId: number) {
    return prisma.dueDateRule.findUnique({
      where: { taxTypeId },
      include: withRelations,
    });
  },

  create(data: Prisma.DueDateRuleCreateInput) {
    return prisma.dueDateRule.create({
      data,
    });
  },

  update(id: number, data: Prisma.DueDateRuleUpdateInput) {
    return prisma.dueDateRule.update({
      where: { id },
      data,
    });
  },

  delete(id: number) {
    return prisma.dueDateRule.delete({
      where: { id },
    });
  },
};
