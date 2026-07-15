import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { taxSubmissionService, TaxSubmissionError } from "@/services/tax-submission.service";
import { TaxTaskError } from "@/services/tax-task.service";
import { taxSubmissionUpdateSchema, taxSubmissionStatusUpdateSchema } from "@/validators/tax";
import { apiErrorResponse } from "@/lib/api-error";
import { requirePermission } from "@/lib/api-auth";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

function isRecordNotFound(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

function domainErrorStatus(error: TaxSubmissionError | TaxTaskError) {
  return error.notFound ? 404 : 400;
}

export async function GET(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const submission = await taxSubmissionService.getSubmissionById(Number(id));

    if (!submission) {
      return apiErrorResponse("tax.submissions.getById", "ไม่พบข้อมูลการยื่นแบบ", 404);
    }

    return NextResponse.json(submission);
  } catch (error) {
    return apiErrorResponse("tax.submissions.getById", "โหลดข้อมูลไม่สำเร็จ", 500, error);
  }
}

export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    const auth = await requirePermission(request, "tax:edit");
    if (auth) return auth;

    const { id } = await params;
    const body = await request.json();

    if (typeof body?.status === "string") {
      const parsed = taxSubmissionStatusUpdateSchema.safeParse(body);

      if (!parsed.success) {
        return apiErrorResponse("tax.submissions.updateStatus", "ข้อมูลไม่ถูกต้อง", 400);
      }

      const submission = await taxSubmissionService.updateSubmissionStatus(
        Number(id),
        parsed.data.status,
        parsed.data.rejectedReason
      );
      return NextResponse.json(submission);
    }

    const parsed = taxSubmissionUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return apiErrorResponse("tax.submissions.update", "ข้อมูลไม่ถูกต้อง", 400);
    }

    const submission = await taxSubmissionService.updateSubmission(Number(id), parsed.data);
    return NextResponse.json(submission);
  } catch (error) {
    if (error instanceof TaxSubmissionError || error instanceof TaxTaskError) {
      return apiErrorResponse("tax.submissions.update", error.message, domainErrorStatus(error));
    }

    if (isRecordNotFound(error)) {
      return apiErrorResponse("tax.submissions.update", "ไม่พบข้อมูลการยื่นแบบ", 404);
    }

    return apiErrorResponse("tax.submissions.update", "บันทึกข้อมูลไม่สำเร็จ", 500, error);
  }
}
