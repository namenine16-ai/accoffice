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
import { TaxTaskFormDialog } from "@/components/tax/TaxTaskFormDialog";
import { TaxTaskStatusDialog } from "@/components/tax/TaxTaskStatusDialog";
import {
  TAX_TASK_PRIORITY_BADGE_VARIANT,
  TAX_TASK_PRIORITY_LABELS,
  TAX_TASK_STATUS_BADGE_VARIANT,
  TAX_TASK_STATUS_LABELS,
} from "@/components/tax/taxTaskMeta";
import type { CustomerRow } from "@/types/customer";
import type { TaxTaskRow, TaxTypeRow } from "@/types/tax";
import type { EmployeeRecord } from "@/types/employee";

type FormDialogState = { mode: "create" } | { mode: "edit"; task: TaxTaskRow } | null;

interface TaxTaskTableProps {
  tasks: TaxTaskRow[];
  customers: CustomerRow[];
  taxTypes: TaxTypeRow[];
  employees: EmployeeRecord[];
  onDeleteTask: (id: number) => Promise<void>;
  onTaskChanged: () => void;
}

const PAGE_SIZE = 10;

export function TaxTaskTable({
  tasks,
  customers,
  taxTypes,
  employees,
  onDeleteTask,
  onTaskChanged,
}: TaxTaskTableProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [formDialog, setFormDialog] = useState<FormDialogState>(null);
  const [statusDialogTask, setStatusDialogTask] = useState<TaxTaskRow | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaxTaskRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return tasks;

    return tasks.filter((task) =>
      [
        task.customer.companyName,
        task.taxType.code,
        task.taxType.name,
        task.remarks ?? "",
        task.employee ? `${task.employee.firstName} ${task.employee.lastName}` : "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [tasks, query]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleTasks = filteredTasks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>รายการงานภาษี</CardTitle>
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <Input
            placeholder="ค้นหาลูกค้า, ประเภทภาษี, พนักงาน, หมายเหตุ"
            className="max-w-xs"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
          <Button onClick={() => setFormDialog({ mode: "create" })}>เพิ่มงานภาษี</Button>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <EmptyState title="ยังไม่มีงานภาษี" description="เพิ่มงานภาษีใหม่ หรือลองปรับตัวกรองด้านบน" />
        ) : filteredTasks.length === 0 ? (
          <EmptyState title="ไม่พบงานภาษี" description="ลองค้นหาด้วยคำอื่น" />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="p-3">ลูกค้า</TableHead>
                  <TableHead className="p-3">ประเภทภาษี</TableHead>
                  <TableHead className="p-3">งวด</TableHead>
                  <TableHead className="p-3">วันครบกำหนด</TableHead>
                  <TableHead className="p-3">พนักงาน</TableHead>
                  <TableHead className="p-3">ความสำคัญ</TableHead>
                  <TableHead className="p-3">สถานะ</TableHead>
                  <TableHead className="p-3">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="p-3 font-medium">{task.customer.companyName}</TableCell>
                    <TableCell className="p-3">
                      {task.taxType.code} — {task.taxType.name}
                    </TableCell>
                    <TableCell className="p-3">
                      {task.month}/{task.year}
                    </TableCell>
                    <TableCell className="p-3">{new Date(task.dueDate).toLocaleDateString("th-TH")}</TableCell>
                    <TableCell className="p-3">
                      {task.employee ? `${task.employee.firstName} ${task.employee.lastName}` : "-"}
                    </TableCell>
                    <TableCell className="p-3">
                      <Badge variant={TAX_TASK_PRIORITY_BADGE_VARIANT[task.priority]}>
                        {TAX_TASK_PRIORITY_LABELS[task.priority]}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-3">
                      <Badge variant={TAX_TASK_STATUS_BADGE_VARIANT[task.status]}>
                        {TAX_TASK_STATUS_LABELS[task.status]}
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
                          <DropdownMenuItem onClick={() => setFormDialog({ mode: "edit", task })}>
                            แก้ไข
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatusDialogTask(task)}>
                            เปลี่ยนสถานะ
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog
                            open={deletingTask?.id === task.id}
                            onOpenChange={(isOpen) => !isOpen && setDeletingTask(null)}
                          >
                            <AlertDialogTrigger>
                              <DropdownMenuItem onClick={() => setDeletingTask(task)}>ลบ</DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                                <AlertDialogDescription>
                                  คุณแน่ใจหรือไม่ว่าจะลบงานภาษีของ {task.customer.companyName} (
                                  {task.taxType.code} {task.month}/{task.year})?
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
                                      await onDeleteTask(task.id);
                                      setDeletingTask(null);
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
                แสดง {visibleTasks.length} จาก {filteredTasks.length} รายการ
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

      <TaxTaskFormDialog
        open={formDialog !== null}
        task={formDialog?.mode === "edit" ? formDialog.task : null}
        customers={customers}
        taxTypes={taxTypes}
        employees={employees}
        onOpenChange={(isOpen) => !isOpen && setFormDialog(null)}
        onSaved={onTaskChanged}
      />

      <TaxTaskStatusDialog
        task={statusDialogTask}
        onOpenChange={(isOpen) => !isOpen && setStatusDialogTask(null)}
        onUpdated={onTaskChanged}
      />
    </Card>
  );
}
