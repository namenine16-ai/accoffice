"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DownloadSimple, Trash } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DocumentUploadDialog } from "@/components/document/DocumentUploadDialog";
import { DOCUMENT_CATEGORY_LABELS } from "@/components/document/DocumentFilters";
import { DocumentTypeIcon } from "@/components/document/DocumentTypeIcon";
import { DocumentPreviewDialog } from "@/components/document/DocumentPreviewDialog";
import type { DocumentWithRelations } from "@/types/document";

interface CustomerRecentDocumentsProps {
  customerId: number;
  customerName: string;
}

const RECENT_LIMIT = 5;

export function CustomerRecentDocuments({ customerId, customerName }: CustomerRecentDocumentsProps) {
  const [documents, setDocuments] = useState<DocumentWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<DocumentWithRelations | null>(null);
  const [previewingDocument, setPreviewingDocument] = useState<DocumentWithRelations | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadDocuments() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/documents?customerId=${customerId}`);
        if (!res.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลเอกสารได้");
        }

        const data = await res.json();
        setDocuments(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadDocuments();
  }, [customerId]);

  async function refreshDocuments() {
    const res = await fetch(`/api/documents?customerId=${customerId}`);
    if (res.ok) {
      const data = await res.json();
      setDocuments(data);
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const result = await res.json().catch(() => null);
        throw new Error(result?.message || "ไม่สามารถลบเอกสารได้");
      }

      toast({ title: "ลบเอกสารสำเร็จ", variant: "success" });
      setDeletingDocument(null);
      void refreshDocuments();
    } catch (err) {
      toast({ title: "ลบเอกสารไม่สำเร็จ", description: (err as Error).message, variant: "error" });
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="โหลดเอกสารไม่สำเร็จ" description={error} />;
  }

  const recentDocuments = documents.slice(0, RECENT_LIMIT);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">ทั้งหมด {documents.length} รายการ</p>
        <div className="flex items-center gap-2">
          <Link href="/documents" className="text-xs text-blue-600 hover:underline">
            ดูเอกสารทั้งหมด
          </Link>
          <DocumentUploadDialog
            customers={[{ id: customerId, companyName: customerName }]}
            defaultCustomerId={customerId}
            onUploaded={refreshDocuments}
          />
        </div>
      </div>

      {recentDocuments.length === 0 ? (
        <p className="text-sm text-muted-foreground">ยังไม่มีเอกสารของลูกค้ารายนี้</p>
      ) : (
        <ul className="divide-y divide-border">
          {recentDocuments.map((document) => (
            <li key={document.id} className="flex items-center justify-between gap-3 py-3">
              <button
                type="button"
                className="flex min-w-0 items-start gap-2 text-left hover:underline"
                onClick={() => setPreviewingDocument(document)}
              >
                <DocumentTypeIcon extension={document.extension} className="mt-0.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{document.fileName}</span>
                  <span className="mt-1 flex items-center gap-2">
                    <Badge variant="outline">{DOCUMENT_CATEGORY_LABELS[document.category]}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(document.createdAt).toLocaleDateString("th-TH")}
                    </span>
                  </span>
                </span>
              </button>
              <div className="flex shrink-0 items-center gap-1">
                <a href={`/api/documents/${document.id}/download`}>
                  <Button variant="outline" size="icon-sm" aria-label="ดาวน์โหลด">
                    <DownloadSimple />
                  </Button>
                </a>
                <AlertDialog
                  open={deletingDocument?.id === document.id}
                  onOpenChange={(isOpen) => !isOpen && setDeletingDocument(null)}
                >
                  <AlertDialogTrigger>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label="ลบ"
                      onClick={() => setDeletingDocument(document)}
                    >
                      <Trash />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                      <AlertDialogDescription>
                        คุณแน่ใจหรือไม่ว่าจะลบเอกสาร {document.fileName}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(document.id)}>ลบ</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}

      <DocumentPreviewDialog
        document={previewingDocument}
        onOpenChange={(isOpen) => !isOpen && setPreviewingDocument(null)}
      />
    </div>
  );
}
