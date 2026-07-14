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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { DueDateRuleFormDialog } from "@/components/tax/DueDateRuleFormDialog";
import type { DueDateRuleRow, TaxTypeRow } from "@/types/tax";

type FormDialogState = { mode: "create" } | { mode: "edit"; rule: DueDateRuleRow } | null;

interface DueDateRuleTableProps {
  rules: DueDateRuleRow[];
  taxTypes: TaxTypeRow[];
  onDeleteRule: (id: number) => Promise<void>;
  onRuleChanged: () => void;
}

const PAGE_SIZE = 10;

export function DueDateRuleTable({ rules, taxTypes, onDeleteRule, onRuleChanged }: DueDateRuleTableProps) {
  const [query, setQuery] = useState("");
  const [taxTypeFilter, setTaxTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [formDialog, setFormDialog] = useState<FormDialogState>(null);
  const [deletingRule, setDeletingRule] = useState<DueDateRuleRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredRules = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rules
      .filter((rule) => taxTypeFilter === "all" || String(rule.taxTypeId) === taxTypeFilter)
      .filter((rule) => {
        if (!normalizedQuery) return true;
        return [rule.taxType.code, rule.taxType.name, rule.notes ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      });
  }, [rules, query, taxTypeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRules.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleRules = filteredRules.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>รายการกฎวันครบกำหนด</CardTitle>
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <Input
            placeholder="ค้นหารหัส, ชื่อประเภทภาษี, หมายเหตุ"
            className="max-w-xs"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
          <Select
            value={taxTypeFilter}
            onValueChange={(value) => {
              setTaxTypeFilter(value ?? "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="ประเภทภาษี" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกประเภทภาษี</SelectItem>
              {taxTypes.map((taxType) => (
                <SelectItem key={taxType.id} value={String(taxType.id)}>
                  {taxType.code} — {taxType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setFormDialog({ mode: "create" })}>เพิ่มกฎวันครบกำหนด</Button>
        </div>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <EmptyState title="ยังไม่มีกฎวันครบกำหนด" description="เพิ่มกฎวันครบกำหนดใหม่เพื่อเริ่มต้นการจัดการ" />
        ) : filteredRules.length === 0 ? (
          <EmptyState title="ไม่พบกฎวันครบกำหนด" description="ลองปรับตัวกรองหรือค้นหาด้วยคำอื่น" />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="p-3">ประเภทภาษี</TableHead>
                  <TableHead className="p-3">วันที่ครบกำหนด</TableHead>
                  <TableHead className="p-3">เดือนถัดจากงวด</TableHead>
                  <TableHead className="p-3">วันหยุดสุดสัปดาห์</TableHead>
                  <TableHead className="p-3">วันหยุดนักขัตฤกษ์</TableHead>
                  <TableHead className="p-3">หมายเหตุ</TableHead>
                  <TableHead className="p-3">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="p-3 font-medium">
                      {rule.taxType.code} — {rule.taxType.name}
                    </TableCell>
                    <TableCell className="p-3">วันที่ {rule.dayOfMonth}</TableCell>
                    <TableCell className="p-3">
                      {rule.monthOffset === 0 ? "เดือนเดียวกัน" : `+${rule.monthOffset} เดือน`}
                    </TableCell>
                    <TableCell className="p-3">
                      <Badge variant={rule.allowWeekendAdjustment ? "success" : "secondary"}>
                        {rule.allowWeekendAdjustment ? "เปิด" : "ปิด"}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-3">
                      <Badge variant={rule.allowHolidayAdjustment ? "success" : "secondary"}>
                        {rule.allowHolidayAdjustment ? "เปิด" : "ปิด"}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-3 text-muted-foreground">{rule.notes ?? "-"}</TableCell>
                    <TableCell className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="outline" size="icon-sm">
                            <DotsThreeOutlineVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setFormDialog({ mode: "edit", rule })}>
                            แก้ไข
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog
                            open={deletingRule?.id === rule.id}
                            onOpenChange={(isOpen) => !isOpen && setDeletingRule(null)}
                          >
                            <AlertDialogTrigger>
                              <DropdownMenuItem onClick={() => setDeletingRule(rule)}>ลบ</DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                                <AlertDialogDescription>
                                  คุณแน่ใจหรือไม่ว่าจะลบกฎวันครบกำหนดของ {rule.taxType.name}?
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
                                      await onDeleteRule(rule.id);
                                      setDeletingRule(null);
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
                แสดง {visibleRules.length} จาก {filteredRules.length} รายการ
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

      <DueDateRuleFormDialog
        open={formDialog !== null}
        rule={formDialog?.mode === "edit" ? formDialog.rule : null}
        taxTypes={taxTypes}
        onOpenChange={(isOpen) => !isOpen && setFormDialog(null)}
        onSaved={onRuleChanged}
      />
    </Card>
  );
}
