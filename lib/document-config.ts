export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

export const ALLOWED_MIME_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
};

export const TAX_SUBCATEGORY_SUGGESTIONS = ["ภพ30", "ภงด1", "ภงด3", "ภงด53", "ภงด1ก", "ภงด90/91"];

export const PREVIEWABLE_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
