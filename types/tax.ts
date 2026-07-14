import type { Prisma } from "@prisma/client";

export type TaxTypeRow = Prisma.TaxTypeGetPayload<{
  include: { dueDateRule: true };
}>;
