import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { taxTaskService, TaxTaskError } from "@/services/tax-task.service";
import { taxTaskUpdateSchema, taxTaskStatusUpdateSchema } from "@/validators/tax";
import { apiErrorResponse } from "@/lib/api-error";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

function isRecordNotFound(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

function taxTaskErrorStatus(error: TaxTaskError) {
  return error.notFound ? 404 : 400;
}

export async function GET(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const task = await taxTaskService.getTaskById(Number(id));

    if (!task) {
      return apiErrorResponse("tax.tasks.getById", "ไม่พบงานภาษี", 404);
    }

    return NextResponse.json(task);
  } catch (error) {
    return apiErrorResponse("tax.tasks.getById", "โหลดข้อมูลไม่สำเร็จ", 500, error);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (typeof body?.status === "string") {
      const parsed = taxTaskStatusUpdateSchema.safeParse(body);

      if (!parsed.success) {
        return apiErrorResponse("tax.tasks.updateStatus", "ข้อมูลไม่ถูกต้อง", 400);
      }

      const task = await taxTaskService.updateStatus(Number(id), parsed.data.status);
      return NextResponse.json(task);
    }

    const parsed = taxTaskUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return apiErrorResponse("tax.tasks.update", "ข้อมูลไม่ถูกต้อง", 400);
    }

    const task = await taxTaskService.updateTask(Number(id), parsed.data);
    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof TaxTaskError) {
      return apiErrorResponse("tax.tasks.update", error.message, taxTaskErrorStatus(error));
    }

    if (isRecordNotFound(error)) {
      return apiErrorResponse("tax.tasks.update", "ไม่พบงานภาษี", 404);
    }

    return apiErrorResponse("tax.tasks.update", "บันทึกข้อมูลไม่สำเร็จ", 500, error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    await taxTaskService.deleteTask(Number(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isRecordNotFound(error)) {
      return apiErrorResponse("tax.tasks.delete", "ไม่พบงานภาษี", 404);
    }

    return apiErrorResponse("tax.tasks.delete", "ลบงานภาษีไม่สำเร็จ", 500, error);
  }
}
