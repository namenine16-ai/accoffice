import type { Employee, Prisma } from "@prisma/client";
import type { EmployeeCreateInput, EmployeeUpdateInput } from "@/validators/employee";

export type EmployeeRecord = Employee;

export type EmployeeWithAccount = Prisma.EmployeeGetPayload<{
  include: { user: { include: { roles: true } } };
}>;

export type { EmployeeCreateInput, EmployeeUpdateInput };
