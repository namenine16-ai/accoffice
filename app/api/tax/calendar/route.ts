import { NextResponse, type NextRequest } from "next/server";
import { taxCalendarService } from "@/services/tax-calendar.service";
import { apiErrorResponse } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");
    const customerIdParam = searchParams.get("customerId");
    const employeeIdParam = searchParams.get("assignedEmployeeId");
    const windowDaysParam = searchParams.get("windowDays");

    const month = monthParam ? Number(monthParam) : undefined;
    const year = yearParam ? Number(yearParam) : undefined;
    const customerId = customerIdParam ? Number(customerIdParam) : undefined;
    const assignedEmployeeId = employeeIdParam ? Number(employeeIdParam) : undefined;
    const windowDays = windowDaysParam ? Number(windowDaysParam) : undefined;

    const numericValues = [month, year, customerId, assignedEmployeeId, windowDays];
    if (numericValues.some((value) => value !== undefined && Number.isNaN(value))) {
      return apiErrorResponse("tax.calendar.get", "พารามิเตอร์ไม่ถูกต้อง", 400);
    }

    const summary = await taxCalendarService.getDashboardSummary(
      { month, year, customerId, assignedEmployeeId },
      windowDays
    );

    return NextResponse.json(summary);
  } catch (error) {
    return apiErrorResponse("tax.calendar.get", "โหลดปฏิทินภาษีไม่สำเร็จ", 500, error);
  }
}
