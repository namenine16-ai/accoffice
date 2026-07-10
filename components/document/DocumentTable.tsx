"use client";

import { useMemo, useState } from "react";
import { DotsThreeOutlineVertical, DownloadSimple } from "@phosphor-icons/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
import { DOCUMENT_CATEGORY_LABELS } from "@/components/document/DocumentFilters";
import type { DocumentRecord } from "@/types/document";

interface DocumentTableProps {
  documents: DocumentRecord[];
  customerNames: Record<number, string>;
  onDeleteDocument: (id: number) => Promise<void>;
}

const PAGE_SIZE = 10;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentTable({ documents, customerNames, onDeleteDocument }: DocumentTableProps) {
  const [page, setPage] = useState(1);
  const [deletingDocument, setDeletingDocument] = useState<DocumentRecord | null>(null);

  const totalPages = Math.max(1, Math.ceil(documents.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleDocuments = useMemo(
    () => documents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [documents, currentPage]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>รายการเอกสาร</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-3">ไฟล์</TableHead>
              <TableHead className="p-3">ลูกค้า</TableHead>
              <TableHead className="p-3">หมวดหมู่</TableHead>
              <TableHead className="p-3">ขนาดไฟล์</TableHead>
              <TableHead className="p-3">วันที่อัปโหลด</TableHead>
              <TableHead className="p-3">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleDocuments.map((document) => (
              <TableRow key={document.id}>
                <TableCell className="p-3">
                  <div className="font-medium">{document.fileName}</div>
                  {document.note ? (
                    <div className="text-xs text-muted-foreground">{document.note}</div>
                  ) : null}
                </TableCell>
                <TableCell className="p-3">{customerNames[document.customerId] ?? "-"}</TableCell>
                <TableCell className="p-3">
                  <Badge variant="outline">{DOCUMENT_CATEGORY_LABELS[document.category]}</Badge>
                  {document.subCategory ? (
                    <div className="mt-1 text-xs text-muted-foreground">{document.subCategory}</div>
                  ) : null}
                </TableCell>
                <TableCell className="p-3">{formatFileSize(document.fileSize)}</TableCell>
                <TableCell className="p-3">
                  {new Date(document.createdAt).toLocaleDateString("th-TH")}
                </TableCell>
                <TableCell className="p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="outline" size="icon-sm">
                        <DotsThreeOutlineVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <a
                          href={`/api/documents/${document.id}/download`}
                          className="flex items-center gap-1.5"
                        >
                          <DownloadSimple /> ดาวน์โหลด
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog
                        open={deletingDocument?.id === document.id}
                        onOpenChange={(isOpen) => !isOpen && setDeletingDocument(null)}
                      >
                        <AlertDialogTrigger>
                          <DropdownMenuItem onClick={() => setDeletingDocument(document)}>
                            ลบ
                          </DropdownMenuItem>
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
                            <AlertDialogAction
                              onClick={async () => {
                                await onDeleteDocument(document.id);
                                setDeletingDocument(null);
                              }}
                            >
                              ลบ
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            แสดง {visibleDocuments.length} จาก {documents.length} รายการ
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
              ก่อนหน้า
            </Button>
            <span className="text-xs text-muted-foreground">
              หน้า {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              ถัดไป
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
