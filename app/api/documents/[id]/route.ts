import { NextResponse } from "next/server";
import { documentService, DocumentUploadError } from "@/services/document.service";
import { apiErrorResponse } from "@/lib/api-error";

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

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
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
