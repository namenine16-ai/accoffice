import { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { customerService } from "@/services/customer.service";
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

export async function GET(
  _request: Request,
  { params }: Context
) {
  try {
    const { id } = await params;
    const customer = await customerService.getCustomerById(Number(id));

    if (!customer) {
      return apiErrorResponse("customers.getById", "ไม่พบข้อมูลลูกค้า", 404);
    }

    return NextResponse.json(customer);
  } catch (error) {
    return apiErrorResponse("customers.getById", "โหลดข้อมูลไม่สำเร็จ", 500, error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: Context
) {
  try {
    const auth = await requirePermission(request, "customers:edit");
    if (auth) return auth;

    const { id } = await params;
    const body = await request.json();

    const customer = await customerService.updateCustomer(Number(id), body);

    return NextResponse.json(customer);
  } catch (error) {
    if (isRecordNotFound(error)) {
      return apiErrorResponse("customers.update", "ไม่พบข้อมูลลูกค้า", 404);
    }

    return apiErrorResponse("customers.update", "บันทึกข้อมูลไม่สำเร็จ", 500, error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Context
) {
  try {
    const auth = await requirePermission(request, "customers:delete");
    if (auth) return auth;

    const { id } = await params;

    await customerService.deleteCustomer(Number(id));

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    if (isRecordNotFound(error)) {
      return apiErrorResponse("customers.delete", "ไม่พบข้อมูลลูกค้า", 404);
    }

    return apiErrorResponse("customers.delete", "ลบข้อมูลไม่สำเร็จ", 500, error);
  }
}