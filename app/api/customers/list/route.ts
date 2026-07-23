import { NextResponse, type NextRequest } from "next/server";
import { customerService } from "@/services/customer.service";
import { apiErrorResponse } from "@/lib/api-error";
import { requirePermission } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission(request, "customers:view");
    if (auth) return auth;

    const customers = await customerService.getCustomerList();

    return NextResponse.json(customers);
  } catch (error) {
    return apiErrorResponse("customers.getList", "โหลดข้อมูลไม่สำเร็จ", 500, error);
  }
}
