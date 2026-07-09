import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { workflowService, WorkflowTaskError } from "@/services/workflow.service";
import { workflowTaskUpdateSchema } from "@/validators/workflow";
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
    const task = await workflowService.getTaskById(Number(id));

    if (!task) {
      return apiErrorResponse("workflow.getById", "ไม่พบงานที่ร้องขอ", 404);
    }

    return NextResponse.json(task);
  } catch (error) {
    return apiErrorResponse("workflow.getById", "โหลดข้อมูลไม่สำเร็จ", 500, error);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = workflowTaskUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return apiErrorResponse("workflow.updateTask", "ข้อมูลไม่ถูกต้อง", 400);
    }

    const task = await workflowService.updateTask(Number(id), parsed.data);
    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof WorkflowTaskError) {
      return apiErrorResponse("workflow.updateTask", error.message, 404);
    }

    if (isRecordNotFound(error)) {
      return apiErrorResponse("workflow.updateTask", "ไม่พบงานที่ร้องขอ", 404);
    }

    return apiErrorResponse("workflow.updateTask", "บันทึกข้อมูลไม่สำเร็จ", 500, error);
  }
}
