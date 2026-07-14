import { NextResponse, type NextRequest } from "next/server";
import { Prisma, TaxTaskStatus } from "@prisma/client";
import { taxTaskService } from "@/services/tax-task.service";
import { DueDateRuleError } from "@/services/due-date-rule.service";
import { taxTaskCreateSchema } from "@/validators/tax";
import { apiErrorResponse } from "@/lib/api-error";

function parseStatus(value: string | null): TaxTaskStatus | undefined {
  if (!value) return undefined;
  return (Object.values(TaxTaskStatus) as string[]).includes(value) ? (value as TaxTaskStatus) : undefined;
}

function isForeignKeyViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const customerId = searchParams.get("customerId");
    const taxTypeId = searchParams.get("taxTypeId");
    const assignedEmployeeId = searchParams.get("assignedEmployeeId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const dueDateFrom = searchParams.get("dueDateFrom");
    const dueDateTo = searchParams.get("dueDateTo");

    const filters = {
      customerId: customerId ? Number(customerId) : undefined,
      taxTypeId: taxTypeId ? Number(taxTypeId) : undefined,
      assignedEmployeeId: assignedEmployeeId ? Number(assignedEmployeeId) : undefined,
      status: parseStatus(searchParams.get("status")),
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
      dueDateFrom: dueDateFrom ? new Date(dueDateFrom) : undefined,
      dueDateTo: dueDateTo ? new Date(dueDateTo) : undefined,
    };

    const tasks = await taxTaskService.getAllTasks(filters);
    return NextResponse.json(tasks);
  } catch (error) {
    return apiErrorResponse("tax.tasks.getAll", "โหลดข้อมูลงานภาษีไม่สำเร็จ", 500, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = taxTaskCreateSchema.safeParse(body);

    if (!parsed.success) {
      return apiErrorResponse("tax.tasks.create", "ข้อมูลไม่ถูกต้อง", 400);
    }

    const task = await taxTaskService.createTask(parsed.data);

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof DueDateRuleError) {
      return apiErrorResponse("tax.tasks.create", error.message, 400);
    }

    if (isForeignKeyViolation(error)) {
      return apiErrorResponse("tax.tasks.create", "ไม่พบข้อมูลลูกค้า งาน หรือประเภทภาษีที่เกี่ยวข้อง", 400);
    }

    return apiErrorResponse("tax.tasks.create", "บันทึกงานภาษีไม่สำเร็จ", 500, error);
  }
}
