import type { Document, Prisma } from "@prisma/client";
import type { DocumentUploadMetadata } from "@/validators/document";

export type DocumentRecord = Document;

export type DocumentWithRelations = Prisma.DocumentGetPayload<{
  include: { customer: true; task: true; uploadedBy: true };
}>;

export type { DocumentUploadMetadata };
export { DocumentCategory } from "@prisma/client";
