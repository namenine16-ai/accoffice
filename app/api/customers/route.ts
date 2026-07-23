import type { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { customerService, CustomerServiceError } from "@/services/customer.service";
import { apiErrorResponse } from "@/lib/api-error";
import { requirePermission } from "@/lib/api-auth";
import { customerCreateSchema } from "@/validators/customer";
import { CUSTOMER_STATUSES } from "@/types/customer";

interface CustomerCreateBody {
  code: string;
  companyName: string;
  taxId: string;
  businessType?: string | null;
  companyRegisterNo?: string | null;
  vatRegistered?: boolean;
  vatNumber?: string | null;
  address?: string | null;
  province?: string | null;
  postcode?: string | null;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  lineId?: string | null;
  accountant?: string | null;
  serviceType?: string | null;
  accountingPeriod?: string | null;
  serviceFee?: number;
  startDate?: string | null;
  status?: string;
  note?: string | null;
  googleDriveFolder?: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission(request, "customers:view");
    if (auth) return auth;

    const customers = await customerService.getAllCustomers();

    return NextResponse.json(customers);
  } catch (error) {
    return apiErrorResponse("customers.getAll", "โหลดข้อมูลไม่สำเร็จ", 500, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission(request, "customers:create");
    if (auth) return auth;

    const body = (await request.json()) as CustomerCreateBody;

    const parsed = customerCreateSchema.safeParse(body);
    if (!parsed.success) {
      return apiErrorResponse("customers.create", "ข้อมูลไม่ถูกต้อง", 400);
    }

    const customerData: Prisma.CustomerCreateInput = {
      code: body.code,
      companyName: body.companyName,
      taxId: body.taxId,
      businessType: body.businessType || null,
      companyRegisterNo: body.companyRegisterNo || null,
      vatRegistered: body.vatRegistered ?? false,
      vatNumber: body.vatNumber || null,
      address: body.address || null,
      province: body.province || null,
      postcode: body.postcode || null,
      contactName: body.contactName || null,
      phone: body.phone || null,
      email: body.email || null,
      lineId: body.lineId || null,
      accountant: body.accountant || null,
      serviceType: body.serviceType || null,
      accountingPeriod: body.accountingPeriod || null,
      serviceFee: body.serviceFee ?? 0,
      startDate: body.startDate ? new Date(body.startDate) : null,
      status: body.status || CUSTOMER_STATUSES[0],
      note: body.note || null,
      googleDriveFolder: body.googleDriveFolder || null,
    };

    const customer = await customerService.createCustomer(customerData);

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    if (error instanceof CustomerServiceError) {
      return apiErrorResponse("customers.create", error.message, 409);
    }

    return apiErrorResponse("customers.create", "บันทึกลูกค้าไม่สำเร็จ", 500, error);
  }
}