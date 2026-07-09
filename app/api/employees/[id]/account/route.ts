import { NextResponse } from "next/server";
import { employeeService, EmployeeAccountError } from "@/services/employee.service";
import { employeeAccountCreateSchema, employeeAccountUpdateSchema } from "@/validators/employee";
import { apiErrorResponse } from "@/lib/api-error";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = employeeAccountCreateSchema.safeParse(body);

    if (!parsed.success) {
      return apiErrorResponse("employees.account.create", "ข้อมูลไม่ถูกต้อง", 400);
    }

    const employee = await employeeService.createAccountForEmployee(Number(id), parsed.data);
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    if (error instanceof EmployeeAccountError) {
      return apiErrorResponse("employees.account.create", error.message, 409);
    }

    return apiErrorResponse("employees.account.create", "สร้างบัญชีผู้ใช้ไม่สำเร็จ", 500, error);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = employeeAccountUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return apiErrorResponse("employees.account.update", "ข้อมูลไม่ถูกต้อง", 400);
    }

    const employee = await employeeService.updateEmployeeAccount(Number(id), parsed.data);
    return NextResponse.json(employee);
  } catch (error) {
    if (error instanceof EmployeeAccountError) {
      return apiErrorResponse("employees.account.update", error.message, 409);
    }

    return apiErrorResponse("employees.account.update", "อัปเดตบัญชีผู้ใช้ไม่สำเร็จ", 500, error);
  }
}
