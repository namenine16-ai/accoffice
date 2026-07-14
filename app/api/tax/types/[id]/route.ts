import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { taxTypeService, TaxTypeError } from "@/services/tax-type.service";
import { taxTypeUpdateSchema } from "@/validators/tax";
import { apiErrorResponse } from "@/lib/api-error";

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
    const taxType = await taxTypeService.getTaxTypeById(Number(id));

    if (!taxType) {
      return apiErrorResponse("tax.types.getById", "ไม่พบประเภทภาษี", 404);
    }

    return NextResponse.json(taxType);
  } catch (error) {
    return apiErrorResponse("tax.types.getById", "โหลดข้อมูลไม่สำเร็จ", 500, error);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = taxTypeUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return apiErrorResponse("tax.types.update", "ข้อมูลไม่ถูกต้อง", 400);
    }

    const taxType = await taxTypeService.updateTaxType(Number(id), parsed.data);
    return NextResponse.json(taxType);
  } catch (error) {
    if (isRecordNotFound(error)) {
      return apiErrorResponse("tax.types.update", "ไม่พบประเภทภาษี", 404);
    }

    return apiErrorResponse("tax.types.update", "บันทึกข้อมูลไม่สำเร็จ", 500, error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    await taxTypeService.deleteTaxType(Number(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof TaxTypeError) {
      return apiErrorResponse("tax.types.delete", error.message, 409);
    }

    if (isRecordNotFound(error)) {
      return apiErrorResponse("tax.types.delete", "ไม่พบประเภทภาษี", 404);
    }

    return apiErrorResponse("tax.types.delete", "ลบประเภทภาษีไม่สำเร็จ", 500, error);
  }
}
