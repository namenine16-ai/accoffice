import { NextResponse, type NextRequest } from "next/server";
import { workflowService } from "@/services/workflow.service";
import { workflowGenerateSchema } from "@/validators/workflow";
import { apiErrorResponse } from "@/lib/api-error";
import { requirePermission } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission(request, "workflow:create");
    if (auth) return auth;

    const body = await request.json();
    const parsed = workflowGenerateSchema.safeParse(body);

    if (!parsed.success) {
      return apiErrorResponse("workflow.generate", "ข้อมูลไม่ถูกต้อง", 400);
    }

    const result = await workflowService.generateMonthlyTasks(parsed.data.month, parsed.data.year);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return apiErrorResponse("workflow.generate", "สร้างงานประจำเดือนไม่สำเร็จ", 500, error);
  }
}
