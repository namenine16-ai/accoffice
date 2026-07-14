import type { Prisma } from "@prisma/client";

export type TaxTypeRow = Prisma.TaxTypeGetPayload<{
  include: { dueDateRule: true };
}>;

export type DueDateRuleRow = Prisma.DueDateRuleGetPayload<{
  include: { taxType: true };
}>;
