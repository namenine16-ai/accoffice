import { NextResponse } from "next/server";
import { workflowService } from "@/services/workflow.service";
import { apiErrorResponse } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const monthParam = url.searchParams.get("month");
    const yearParam = url.searchParams.get("year");
    const status = url.searchParams.get("status") ?? undefined;
    const customerIdParam = url.searchParams.get("customerId");
    const employeeIdParam = url.searchParams.get("employeeId");
    const query = url.searchParams.get("query") ?? undefined;

    const month = monthParam ? Number(monthParam) : undefined;
    const year = yearParam ? Number(yearParam) : undefined;
    const customerId = customerIdParam ? Number(customerIdParam) : undefined;
    const employeeId = employeeIdParam ? Number(employeeIdParam) : undefined;

    const filters = {
      month: Number.isNaN(month) ? undefined : month,
      year: Number.isNaN(year) ? undefined : year,
      status: status === "all" ? undefined : status,
      customerId: Number.isNaN(customerId) ? undefined : customerId,
      employeeId: Number.isNaN(employeeId) ? undefined : employeeId,
      query: query?.trim() ? query.trim() : undefined,
    };

    const overview = await workflowService.getWorkflowOverview(filters);

    return NextResponse.json(overview);
  } catch (error) {
    return apiErrorResponse("workflow.getOverview", "โหลดข้อมูลงานไม่สำเร็จ", 500, error);
  }
}
