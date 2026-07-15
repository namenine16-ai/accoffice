import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { dueDateRuleService } from "@/services/due-date-rule.service";
import { dueDateRuleUpdateSchema } from "@/validators/tax";
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

export async function GET(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const rule = await dueDateRuleService.getRuleById(Number(id));

    if (!rule) {
      return apiErrorResponse("tax.dueDateRules.getById", "ไม่พบกฎวันครบกำหนด", 404);
    }

    return NextResponse.json(rule);
  } catch (error) {
    return apiErrorResponse("tax.dueDateRules.getById", "โหลดข้อมูลไม่สำเร็จ", 500, error);
  }
}

export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    const auth = await requirePermission(request, "tax:edit");
    if (auth) return auth;

    const { id } = await params;
    const body = await request.json();
    const parsed = dueDateRuleUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return apiErrorResponse("tax.dueDateRules.update", "ข้อมูลไม่ถูกต้อง", 400);
    }

    const rule = await dueDateRuleService.updateRule(Number(id), parsed.data);
    return NextResponse.json(rule);
  } catch (error) {
    if (isRecordNotFound(error)) {
      return apiErrorResponse("tax.dueDateRules.update", "ไม่พบกฎวันครบกำหนด", 404);
    }

    return apiErrorResponse("tax.dueDateRules.update", "บันทึกข้อมูลไม่สำเร็จ", 500, error);
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const auth = await requirePermission(request, "tax:delete");
    if (auth) return auth;

    const { id } = await params;
    await dueDateRuleService.deleteRule(Number(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isRecordNotFound(error)) {
      return apiErrorResponse("tax.dueDateRules.delete", "ไม่พบกฎวันครบกำหนด", 404);
    }

    return apiErrorResponse("tax.dueDateRules.delete", "ลบกฎวันครบกำหนดไม่สำเร็จ", 500, error);
  }
}
