import { NextResponse, type NextRequest } from "next/server";
import { dueDateRuleService, DueDateRuleError } from "@/services/due-date-rule.service";
import { dueDateRuleCreateSchema } from "@/validators/tax";
import { apiErrorResponse } from "@/lib/api-error";

export async function GET() {
  try {
    const rules = await dueDateRuleService.getAllRules();
    return NextResponse.json(rules);
  } catch (error) {
    return apiErrorResponse("tax.dueDateRules.getAll", "โหลดข้อมูลกฎวันครบกำหนดไม่สำเร็จ", 500, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = dueDateRuleCreateSchema.safeParse(body);

    if (!parsed.success) {
      return apiErrorResponse("tax.dueDateRules.create", "ข้อมูลไม่ถูกต้อง", 400);
    }

    const { taxTypeId, ...rest } = parsed.data;

    const rule = await dueDateRuleService.createRule({
      taxType: { connect: { id: taxTypeId } },
      ...rest,
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    if (error instanceof DueDateRuleError) {
      return apiErrorResponse("tax.dueDateRules.create", error.message, 409);
    }

    return apiErrorResponse("tax.dueDateRules.create", "บันทึกกฎวันครบกำหนดไม่สำเร็จ", 500, error);
  }
}
