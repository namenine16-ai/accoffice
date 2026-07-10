"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocumentTypeIcon } from "@/components/document/DocumentTypeIcon";
import { DOCUMENT_CATEGORY_LABELS } from "@/components/document/DocumentFilters";
import { PREVIEWABLE_MIME_TYPES, formatFileSize } from "@/lib/document-config";
import type { DocumentWithRelations } from "@/types/document";

interface DocumentPreviewDialogProps {
  document: DocumentWithRelations | null;
  onOpenChange: (open: boolean) => void;
}

export function DocumentPreviewDialog({ document, onOpenChange }: DocumentPreviewDialogProps) {
  const isPreviewable = document ? PREVIEWABLE_MIME_TYPES.has(document.mimeType) : false;
  const isPdf = document?.mimeType === "application/pdf";

  return (
    <Dialog open={Boolean(document)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {document ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 truncate">
                <DocumentTypeIcon extension={document.extension} className="shrink-0" />
                <span className="truncate">{document.fileName}</span>
              </DialogTitle>
              <DialogDescription>
                {document.customer.companyName} · {DOCUMENT_CATEGORY_LABELS[document.category]}
                {document.subCategory ? ` · ${document.subCategory}` : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="flex max-h-[60vh] min-h-[200px] items-center justify-center overflow-auto border border-border bg-muted/30">
              {isPreviewable && isPdf ? (
                <iframe
                  src={`/api/documents/${document.id}/preview`}
                  title={document.fileName}
                  className="h-[60vh] w-full"
                />
              ) : isPreviewable ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/documents/${document.id}/preview`}
                  alt={document.fileName}
                  className="max-h-[60vh] max-w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
                  <DocumentTypeIcon extension={document.extension} className="size-10" />
                  ไม่รองรับการแสดงตัวอย่างไฟล์ประเภทนี้ กรุณาดาวน์โหลดเพื่อเปิดดู
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <p>ขนาดไฟล์: {formatFileSize(document.fileSize)}</p>
              <p>ชนิดไฟล์: {document.extension.toUpperCase()}</p>
              <p>อัปโหลดโดย: {document.uploadedBy?.name ?? document.uploadedBy?.email ?? "-"}</p>
              <p>วันที่อัปโหลด: {new Date(document.createdAt).toLocaleString("th-TH")}</p>
              {document.note ? <p className="col-span-2">หมายเหตุ: {document.note}</p> : null}
            </div>

            <DialogFooter>
              <a href={`/api/documents/${document.id}/download`}>
                <Button variant="outline">ดาวน์โหลด</Button>
              </a>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
