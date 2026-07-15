import { NextResponse, type NextRequest } from "next/server";
import { Prisma, TaxSubmissionStatus } from "@prisma/client";
import { taxSubmissionService, TaxSubmissionError } from "@/services/tax-submission.service";
import { TaxTaskError } from "@/services/tax-task.service";
import { DueDateRuleError } from "@/services/due-date-rule.service";
import { taxSubmissionCreateSchema } from "@/validators/tax";
import { apiErrorResponse } from "@/lib/api-error";
import { requirePermission } from "@/lib/api-auth";

function parseStatus(value: string | null): TaxSubmissionStatus | undefined {
  if (!value) return undefined;
  return (Object.values(TaxSubmissionStatus) as string[]).includes(value) ? (value as TaxSubmissionStatus) : undefined;
}

function isForeignKeyViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003";
}

function domainErrorStatus(error: TaxSubmissionError | TaxTaskError | DueDateRuleError) {
  return error.notFound ? 404 : 400;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const taxTaskId = searchParams.get("taxTaskId");

    const filters = {
      taxTaskId: taxTaskId ? Number(taxTaskId) : undefined,
      status: parseStatus(searchParams.get("status")),
    };

    const submissions = await taxSubmissionService.getSubmissions(filters);
    return NextResponse.json(submissions);
  } catch (error) {
    return apiErrorResponse("tax.submissions.getAll", "โหลดข้อมูลการยื่นแบบไม่สำเร็จ", 500, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission(request, "tax:create");
    if (auth) return auth;

    const body = await request.json();
    const parsed = taxSubmissionCreateSchema.safeParse(body);

    if (!parsed.success) {
      return apiErrorResponse("tax.submissions.create", "ข้อมูลไม่ถูกต้อง", 400);
    }

    const { taxTaskId, ...input } = parsed.data;
    const submission = await taxSubmissionService.createSubmission(taxTaskId, input);

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    if (
      error instanceof TaxSubmissionError ||
      error instanceof TaxTaskError ||
      error instanceof DueDateRuleError
    ) {
      return apiErrorResponse("tax.submissions.create", error.message, domainErrorStatus(error));
    }

    if (isForeignKeyViolation(error)) {
      return apiErrorResponse("tax.submissions.create", "ไม่พบงานภาษีที่เกี่ยวข้อง", 404);
    }

    return apiErrorResponse("tax.submissions.create", "บันทึกการยื่นแบบไม่สำเร็จ", 500, error);
  }
}
