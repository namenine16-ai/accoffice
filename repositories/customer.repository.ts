import { prisma } from "@/lib/prisma";
import type { Prisma, Customer } from "@prisma/client";

export const customerRepository = {
  findAll() {
    return prisma.customer.findMany({
      orderBy: { id: "desc" },
    });
  },

  findAllListView() {
    return prisma.customer.findMany({
      orderBy: { id: "desc" },
      select: {
        id: true,
        code: true,
        companyName: true,
        phone: true,
        status: true,
      },
    });
  },

  findById(id: number) {
    return prisma.customer.findUnique({
      where: { id },
    });
  },

  create(data: Prisma.CustomerCreateInput) {
    return prisma.customer.create({
      data,
    });
  },

  update(id: number, data: Prisma.CustomerUpdateInput) {
    return prisma.customer.update({
      where: { id },
      data,
    });
  },

  delete(id: number) {
    return prisma.customer.delete({
      where: { id },
    });
  },
};

export type { Customer };
