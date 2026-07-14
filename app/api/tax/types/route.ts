import { NextResponse, type NextRequest } from "next/server";
import { taxTypeService, TaxTypeError } from "@/services/tax-type.service";
import { taxTypeCreateSchema } from "@/validators/tax";
import { apiErrorResponse } from "@/lib/api-error";

export async function GET() {
  try {
    const taxTypes = await taxTypeService.getAllTaxTypes();
    return NextResponse.json(taxTypes);
  } catch (error) {
    return apiErrorResponse("tax.types.getAll", "โหลดข้อมูลประเภทภาษีไม่สำเร็จ", 500, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = taxTypeCreateSchema.safeParse(body);

    if (!parsed.success) {
      return apiErrorResponse("tax.types.create", "ข้อมูลไม่ถูกต้อง", 400);
    }

    const taxType = await taxTypeService.createTaxType(parsed.data);

    return NextResponse.json(taxType, { status: 201 });
  } catch (error) {
    if (error instanceof TaxTypeError) {
      return apiErrorResponse("tax.types.create", error.message, 409);
    }

    return apiErrorResponse("tax.types.create", "บันทึกประเภทภาษีไม่สำเร็จ", 500, error);
  }
}
