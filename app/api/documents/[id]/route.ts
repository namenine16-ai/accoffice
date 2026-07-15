import { NextResponse, type NextRequest } from "next/server";
import { documentService, DocumentUploadError } from "@/services/document.service";
import { apiErrorResponse } from "@/lib/api-error";
import { documentRenameSchema } from "@/validators/document";
import { requirePermission } from "@/lib/api-auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const document = await documentService.getDocumentById(Number(id));

    if (!document) {
      return apiErrorResponse("documents.getById", "ไม่พบเอกสาร", 404);
    }

    return NextResponse.json(document);
  } catch (error) {
    return apiErrorResponse("documents.getById", "โหลดข้อมูลเอกสารไม่สำเร็จ", 500, error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requirePermission(request, "documents:edit");
    if (auth) return auth;

    const { id } = await params;
    const body = await request.json();
    const parsed = documentRenameSchema.safeParse(body);

    if (!parsed.success) {
      return apiErrorResponse("documents.rename", "ข้อมูลไม่ถูกต้อง", 400);
    }

    const document = await documentService.renameDocument(Number(id), parsed.data.fileName);

    return NextResponse.json(document);
  } catch (error) {
    if (error instanceof DocumentUploadError) {
      return apiErrorResponse("documents.rename", error.message, 404);
    }

    return apiErrorResponse("documents.rename", "เปลี่ยนชื่อเอกสารไม่สำเร็จ", 500, error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requirePermission(request, "documents:delete");
    if (auth) return auth;

    const { id } = await params;
    await documentService.deleteDocument(Number(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof DocumentUploadError) {
      return apiErrorResponse("documents.delete", error.message, 404);
    }

    return apiErrorResponse("documents.delete", "ลบเอกสารไม่สำเร็จ", 500, error);
  }
}
