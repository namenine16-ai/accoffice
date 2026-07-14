"use client";

import { useMemo, useState } from "react";
import { DotsThreeOutlineVertical } from "@phosphor-icons/react";
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
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
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
import { TaxTypeFormDialog } from "@/components/tax/TaxTypeFormDialog";
import type { TaxTypeRow } from "@/types/tax";

type FormDialogState = { mode: "create" } | { mode: "edit"; taxType: TaxTypeRow } | null;

interface TaxTypeTableProps {
  taxTypes: TaxTypeRow[];
  onDeleteTaxType: (id: number) => Promise<void>;
  onTaxTypeChanged: () => void;
}

const PAGE_SIZE = 10;

export function TaxTypeTable({ taxTypes, onDeleteTaxType, onTaxTypeChanged }: TaxTypeTableProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [formDialog, setFormDialog] = useState<FormDialogState>(null);
  const [deletingTaxType, setDeletingTaxType] = useState<TaxTypeRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredTaxTypes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return taxTypes;

    return taxTypes.filter((taxType) =>
      [taxType.code, taxType.name, taxType.description ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [taxTypes, query]);

  const totalPages = Math.max(1, Math.ceil(filteredTaxTypes.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleTaxTypes = filteredTaxTypes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>รายการประเภทภาษี</CardTitle>
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <Input
            placeholder="ค้นหารหัส, ชื่อ, คำอธิบาย"
            className="max-w-xs"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
          <Button onClick={() => setFormDialog({ mode: "create" })}>เพิ่มประเภทภาษี</Button>
        </div>
      </CardHeader>
      <CardContent>
        {taxTypes.length === 0 ? (
          <EmptyState title="ยังไม่มีประเภทภาษี" description="เพิ่มประเภทภาษีใหม่เพื่อเริ่มต้นการจัดการ" />
        ) : filteredTaxTypes.length === 0 ? (
          <EmptyState title="ไม่พบประเภทภาษี" description="ลองค้นหาด้วยคำอื่น" />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="p-3">รหัส</TableHead>
                  <TableHead className="p-3">ชื่อประเภทภาษี</TableHead>
                  <TableHead className="p-3">คำอธิบาย</TableHead>
                  <TableHead className="p-3">สถานะ</TableHead>
                  <TableHead className="p-3">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleTaxTypes.map((taxType) => (
                  <TableRow key={taxType.id}>
                    <TableCell className="p-3 font-medium">{taxType.code}</TableCell>
                    <TableCell className="p-3">{taxType.name}</TableCell>
                    <TableCell className="p-3 text-muted-foreground">{taxType.description ?? "-"}</TableCell>
                    <TableCell className="p-3">
                      <Badge variant={taxType.isActive ? "success" : "secondary"}>
                        {taxType.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="outline" size="icon-sm">
                            <DotsThreeOutlineVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setFormDialog({ mode: "edit", taxType })}>
                            แก้ไข
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog
                            open={deletingTaxType?.id === taxType.id}
                            onOpenChange={(isOpen) => !isOpen && setDeletingTaxType(null)}
                          >
                            <AlertDialogTrigger>
                              <DropdownMenuItem onClick={() => setDeletingTaxType(taxType)}>
                                ลบ
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                                <AlertDialogDescription>
                                  คุณแน่ใจหรือไม่ว่าจะลบประเภทภาษี {taxType.name}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>ยกเลิก</AlertDialogCancel>
                                <AlertDialogAction
                                  disabled={isDeleting}
                                  onClick={async () => {
                                    if (isDeleting) return;
                                    setIsDeleting(true);

                                    try {
                                      await onDeleteTaxType(taxType.id);
                                      setDeletingTaxType(null);
                                    } finally {
                                      setIsDeleting(false);
                                    }
                                  }}
                                >
                                  {isDeleting ? "กำลังลบ..." : "ลบ"}
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
                แสดง {visibleTaxTypes.length} จาก {filteredTaxTypes.length} รายการ
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                >
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
          </>
        )}
      </CardContent>

      <TaxTypeFormDialog
        open={formDialog !== null}
        taxType={formDialog?.mode === "edit" ? formDialog.taxType : null}
        onOpenChange={(isOpen) => !isOpen && setFormDialog(null)}
        onSaved={onTaxTypeChanged}
      />
    </Card>
  );
}
