import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const authRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    });
  },

  findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    });
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      include: { roles: true },
    });
  },

  update(id: number, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      include: { roles: true },
    });
  },
};
