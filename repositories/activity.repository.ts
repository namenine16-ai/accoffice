import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const activityRepository = {
  findRecent(limit = 5) {
    return prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  },

  create(data: Prisma.ActivityLogCreateInput) {
    return prisma.activityLog.create({ data });
  },
};
