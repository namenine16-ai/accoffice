import { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { customerService, CustomerServiceError } from "@/services/customer.service";
import { apiErrorResponse } from "@/lib/api-error";
import { requirePermission } from "@/lib/api-auth";
import { customerUpdateSchema } from "@/validators/customer";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

function isRecordNotFound(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

function parseCustomerId(id: string): number | null {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(
  request: NextRequest,
  { params }: Context
) {
  try {
    const auth = await requirePermission(request, "customers:view");
    if (auth) return auth;

    const { id } = await params;
    const customerId = parseCustomerId(id);
    if (customerId === null) {
      return apiErrorResponse("customers.getById", "รหัสลูกค้าไม่ถูกต้อง", 400);
    }

    const customer = await customerService.getCustomerById(customerId);

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
    const customerId = parseCustomerId(id);
    if (customerId === null) {
      return apiErrorResponse("customers.update", "รหัสลูกค้าไม่ถูกต้อง", 400);
    }

    const body = await request.json();

    const parsed = customerUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiErrorResponse("customers.update", "ข้อมูลไม่ถูกต้อง", 400);
    }

    const customer = await customerService.updateCustomer(customerId, body);

    return NextResponse.json(customer);
  } catch (error) {
    if (error instanceof CustomerServiceError) {
      return apiErrorResponse("customers.update", error.message, 409);
    }

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
    const customerId = parseCustomerId(id);
    if (customerId === null) {
      return apiErrorResponse("customers.delete", "รหัสลูกค้าไม่ถูกต้อง", 400);
    }

    await customerService.deleteCustomer(customerId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    if (error instanceof CustomerServiceError) {
      return apiErrorResponse("customers.delete", error.message, 409);
    }

    if (isRecordNotFound(error)) {
      return apiErrorResponse("customers.delete", "ไม่พบข้อมูลลูกค้า", 404);
    }

    return apiErrorResponse("customers.delete", "ลบข้อมูลไม่สำเร็จ", 500, error);
  }
}