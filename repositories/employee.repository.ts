import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const employeeRepository = {
  findAll() {
    return prisma.employee.findMany({
      orderBy: { id: "desc" },
    });
  },

  findById(id: number) {
    return prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          include: { roles: true },
        },
      },
    });
  },

  create(data: Prisma.EmployeeCreateInput) {
    return prisma.employee.create({
      data,
    });
  },

  update(id: number, data: Prisma.EmployeeUpdateInput) {
    return prisma.employee.update({
      where: { id },
      data,
    });
  },

  delete(id: number) {
    return prisma.employee.delete({
      where: { id },
    });
  },
};
