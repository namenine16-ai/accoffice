import { documentRepository, type DocumentFilters } from "@/repositories/document.repository";
import { storageProvider } from "@/lib/storage";
import { activityService } from "@/services/activity.service";
import { customerService } from "@/services/customer.service";
import { workflowService } from "@/services/workflow.service";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/document-config";
import type { DocumentUploadMetadata } from "@/validators/document";

export class DocumentUploadError extends Error {}

interface UploadDocumentInput extends DocumentUploadMetadata {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  uploadedById?: number;
}

export const documentService = {
  getAllDocuments(filters: DocumentFilters = {}) {
    return documentRepository.findAll(filters);
  },

  getDocumentById(id: number) {
    return documentRepository.findById(id);
  },

  async uploadDocument(input: UploadDocumentInput) {
    const { buffer, fileName, mimeType, customerId, taskId, category, subCategory, note, uploadedById } = input;

    if (buffer.byteLength === 0) {
      throw new DocumentUploadError("ไฟล์ว่างเปล่า");
    }

    if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
      throw new DocumentUploadError("ขนาดไฟล์เกินกำหนด (สูงสุด 20MB)");
    }

    if (!(mimeType in ALLOWED_MIME_TYPES)) {
      throw new DocumentUploadError("ประเภทไฟล์นี้ไม่ได้รับอนุญาต");
    }

    const customer = await customerService.getCustomerById(customerId);
    if (!customer) {
      throw new DocumentUploadError("ไม่พบข้อมูลลูกค้า");
    }

    let year = new Date().getFullYear();
    if (taskId !== undefined) {
      const task = await workflowService.getTaskById(taskId);
      if (!task) {
        throw new DocumentUploadError("ไม่พบงานที่เชื่อมโยง");
      }
      year = task.year;
    }

    const extension = ALLOWED_MIME_TYPES[mimeType];
    const { storedName, filePath, checksum } = await storageProvider.save({
      buffer,
      customerId,
      year,
      category,
      fileName,
    });

    const document = await documentRepository.create({
      customer: { connect: { id: customerId } },
      ...(taskId !== undefined ? { task: { connect: { id: taskId } } } : {}),
      ...(uploadedById !== undefined ? { uploadedBy: { connect: { id: uploadedById } } } : {}),
      fileName,
      storedName,
      filePath,
      extension,
      mimeType,
      fileSize: buffer.byteLength,
      checksum,
      category,
      subCategory,
      note,
    });

    await activityService.logActivity({
      action: "document.uploaded",
      details: `อัปโหลดเอกสาร: ${fileName} (${customer.companyName})`,
    });

    return document;
  },

  async getDocumentFile(id: number) {
    const document = await documentRepository.findById(id);
    if (!document) {
      return null;
    }

    const buffer = await storageProvider.read(document.filePath);
    return { document, buffer };
  },

  async deleteDocument(id: number) {
    const document = await documentRepository.findById(id);
    if (!document) {
      throw new DocumentUploadError("ไม่พบเอกสาร");
    }

    const deleted = await documentRepository.softDelete(id);

    await activityService.logActivity({
      action: "document.deleted",
      details: `ลบเอกสาร: ${document.fileName}`,
    });

    return deleted;
  },
};
