import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { employeeService } from "@/services/employee.service";
import { employeeUpdateSchema } from "@/validators/employee";
import { apiErrorResponse } from "@/lib/api-error";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

function isRecordNotFound(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

export async function GET(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const employee = await employeeService.getEmployeeById(Number(id));

    if (!employee) {
      return apiErrorResponse("employees.getById", "ไม่พบข้อมูลพนักงาน", 404);
    }

    return NextResponse.json(employee);
  } catch (error) {
    return apiErrorResponse("employees.getById", "โหลดข้อมูลไม่สำเร็จ", 500, error);
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = employeeUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return apiErrorResponse("employees.update", "ข้อมูลไม่ถูกต้อง", 400);
    }

    const employee = await employeeService.updateEmployee(Number(id), parsed.data);
    return NextResponse.json(employee);
  } catch (error) {
    if (isRecordNotFound(error)) {
      return apiErrorResponse("employees.update", "ไม่พบข้อมูลพนักงาน", 404);
    }

    return apiErrorResponse("employees.update", "บันทึกข้อมูลไม่สำเร็จ", 500, error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    await employeeService.deleteEmployee(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    if (isRecordNotFound(error)) {
      return apiErrorResponse("employees.delete", "ไม่พบข้อมูลพนักงาน", 404);
    }

    return apiErrorResponse("employees.delete", "ลบข้อมูลไม่สำเร็จ", 500, error);
  }
}
