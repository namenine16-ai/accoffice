import { documentService } from "@/services/document.service";
import { apiErrorResponse } from "@/lib/api-error";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await documentService.getDocumentFile(Number(id));

    if (!result) {
      return apiErrorResponse("documents.download", "ไม่พบเอกสาร", 404);
    }

    const { document, buffer } = result;
    const encodedFileName = encodeURIComponent(document.fileName);

    return new Response(new Blob([Uint8Array.from(buffer)]), {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": `attachment; filename="${document.storedName}"; filename*=UTF-8''${encodedFileName}`,
        "Content-Length": String(document.fileSize),
      },
    });
  } catch (error) {
    return apiErrorResponse("documents.download", "ดาวน์โหลดเอกสารไม่สำเร็จ", 500, error);
  }
}
