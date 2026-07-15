import { NextResponse, type NextRequest } from "next/server";
import { DocumentCategory } from "@prisma/client";
import { documentService, DocumentUploadError } from "@/services/document.service";
import { authService } from "@/services/auth.service";
import { sessionCookieOptions } from "@/lib/auth";
import { documentUploadMetadataSchema } from "@/validators/document";
import { apiErrorResponse } from "@/lib/api-error";
import { requirePermission } from "@/lib/api-auth";

function parseCategory(value: string | null): DocumentCategory | undefined {
  if (!value) return undefined;
  return (Object.values(DocumentCategory) as string[]).includes(value) ? (value as DocumentCategory) : undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const customerId = searchParams.get("customerId");
    const taskId = searchParams.get("taskId");

    const documents = await documentService.getAllDocuments({
      customerId: customerId ? Number(customerId) : undefined,
      taskId: taskId ? Number(taskId) : undefined,
      category: parseCategory(searchParams.get("category")),
    });

    return NextResponse.json(documents);
  } catch (error) {
    return apiErrorResponse("documents.getAll", "โหลดข้อมูลเอกสารไม่สำเร็จ", 500, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission(request, "documents:upload");
    if (auth) return auth;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return apiErrorResponse("documents.create", "กรุณาแนบไฟล์", 400);
    }

    const parsed = documentUploadMetadataSchema.safeParse({
      customerId: formData.get("customerId"),
      taskId: formData.get("taskId") ?? undefined,
      category: formData.get("category"),
      subCategory: formData.get("subCategory") ?? undefined,
      note: formData.get("note") ?? undefined,
    });

    if (!parsed.success) {
      return apiErrorResponse("documents.create", "ข้อมูลไม่ถูกต้อง", 400);
    }

    const token = request.cookies.get(sessionCookieOptions.name)?.value;
    const currentUser = await authService.getCurrentUser(token);

    const buffer = Buffer.from(await file.arrayBuffer());

    const document = await documentService.uploadDocument({
      ...parsed.data,
      buffer,
      fileName: file.name,
      mimeType: file.type,
      uploadedById: currentUser?.id,
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    if (error instanceof DocumentUploadError) {
      return apiErrorResponse("documents.create", error.message, 400);
    }

    return apiErrorResponse("documents.create", "อัปโหลดเอกสารไม่สำเร็จ", 500, error);
  }
}
