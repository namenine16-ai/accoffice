import * as z from "zod";
import { DocumentCategory } from "@prisma/client";

export const documentUploadMetadataSchema = z.object({
  customerId: z.coerce.number().int().positive("กรุณาระบุลูกค้า"),
  taskId: z.coerce.number().int().positive().optional(),
  category: z.enum(DocumentCategory, { message: "หมวดหมู่เอกสารไม่ถูกต้อง" }),
  subCategory: z.string().trim().min(1).optional(),
  note: z.string().trim().min(1).optional(),
});

export type DocumentUploadMetadata = z.infer<typeof documentUploadMetadataSchema>;
