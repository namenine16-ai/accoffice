import type { Employee } from "@prisma/client";
import type { EmployeeCreateInput, EmployeeUpdateInput } from "@/validators/employee";

export type EmployeeRecord = Employee;
export type { EmployeeCreateInput, EmployeeUpdateInput };
