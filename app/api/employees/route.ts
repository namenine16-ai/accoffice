import { NextResponse } from "next/server";
import { employeeService } from "@/services/employee.service";
import { employeeCreateSchema } from "@/validators/employee";
import { apiErrorResponse } from "@/lib/api-error";

export async function GET() {
  try {
    const employees = await employeeService.getAllEmployees();
    return NextResponse.json(employees);
  } catch (error) {
    return apiErrorResponse("employees.getAll", "โหลดข้อมูลพนักงานไม่สำเร็จ", 500, error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = employeeCreateSchema.safeParse(body);

    if (!parsed.success) {
      return apiErrorResponse("employees.create", "ข้อมูลไม่ถูกต้อง", 400);
    }

    const employee = await employeeService.createEmployee(parsed.data);
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    return apiErrorResponse("employees.create", "บันทึกพนักงานไม่สำเร็จ", 500, error);
  }
}
