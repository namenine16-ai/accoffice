import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const withRelations = {
  dueDateRule: true,
} satisfies Prisma.TaxTypeInclude;

export const taxTypeRepository = {
  findAll() {
    return prisma.taxType.findMany({
      include: withRelations,
      orderBy: { code: "asc" },
    });
  },

  findById(id: number) {
    return prisma.taxType.findUnique({
      where: { id },
      include: withRelations,
    });
  },

  findByCode(code: string) {
    return prisma.taxType.findUnique({
      where: { code },
      include: withRelations,
    });
  },

  create(data: Prisma.TaxTypeCreateInput) {
    return prisma.taxType.create({
      data,
    });
  },

  update(id: number, data: Prisma.TaxTypeUpdateInput) {
    return prisma.taxType.update({
      where: { id },
      data,
    });
  },

  delete(id: number) {
    return prisma.taxType.delete({
      where: { id },
    });
  },
};
