"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { taxTaskCreateSchema, taxTaskUpdateSchema } from "@/validators/tax";
import { TAX_TASK_PRIORITY_LABELS } from "@/components/tax/taxTaskMeta";
import type { CustomerRow } from "@/types/customer";
import type { TaxTaskRow, TaxTypeRow } from "@/types/tax";
import type { EmployeeRecord } from "@/types/employee";
import type { Priority } from "@prisma/client";

type TaxTaskFormValues = z.infer<typeof taxTaskCreateSchema>;

const UNASSIGNED = "none";

const monthOptions = [
  { value: "1", label: "ม.ค." },
  { value: "2", label: "ก.พ." },
  { value: "3", label: "มี.ค." },
  { value: "4", label: "เม.ย." },
  { value: "5", label: "พ.ค." },
  { value: "6", label: "มิ.ย." },
  { value: "7", label: "ก.ค." },
  { value: "8", label: "ส.ค." },
  { value: "9", label: "ก.ย." },
  { value: "10", label: "ต.ค." },
  { value: "11", label: "พ.ย." },
  { value: "12", label: "ธ.ค." },
];

function emptyValues(): TaxTaskFormValues {
  const now = new Date();
  return {
    customerId: 0,
    customerTaskId: 0,
    taxTypeId: 0,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    assignedEmployeeId: undefined,
    priority: "NORMAL",
    remarks: "",
  };
}

function toFormValues(task: TaxTaskRow): TaxTaskFormValues {
  return {
    customerId: task.customerId,
    customerTaskId: task.customerTaskId,
    taxTypeId: task.taxTypeId,
    month: task.month,
    year: task.year,
    assignedEmployeeId: task.assignedEmployeeId ?? undefined,
    priority: task.priority,
    remarks: task.remarks ?? "",
  };
}

interface TaxTaskFormDialogProps {
  open: boolean;
  task: TaxTaskRow | null;
  customers: CustomerRow[];
  taxTypes: TaxTypeRow[];
  employees: EmployeeRecord[];
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function TaxTaskFormDialog({
  open,
  task,
  customers,
  taxTypes,
  employees,
  onOpenChange,
  onSaved,
}: TaxTaskFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open ? (
          <TaxTaskForm
            key={task?.id ?? "create"}
            task={task}
            customers={customers}
            taxTypes={taxTypes}
            employees={employees}
            onCancel={() => onOpenChange(false)}
            onSaved={() => {
              onSaved();
              onOpenChange(false);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

interface TaxTaskFormProps {
  task: TaxTaskRow | null;
  customers: CustomerRow[];
  taxTypes: TaxTypeRow[];
  employees: EmployeeRecord[];
  onCancel: () => void;
  onSaved: () => void;
}

function TaxTaskForm({ task, customers, taxTypes, employees, onCancel, onSaved }: TaxTaskFormProps) {
  const { toast } = useToast();
  const isEditing = Boolean(task);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const [isResolvingCustomerTask, setIsResolvingCustomerTask] = useState(false);
  const [customerTaskLookupError, setCustomerTaskLookupError] = useState<string | null>(null);
  const lookupAbortRef = useRef<AbortController | null>(null);

  const resolver = (isEditing
    ? zodResolver(taxTaskUpdateSchema)
    : zodResolver(taxTaskCreateSchema)) as Resolver<TaxTaskFormValues>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaxTaskFormValues>({
    resolver,
    defaultValues: task ? toFormValues(task) : emptyValues(),
  });

  useEffect(() => {
    register("customerId");
    register("customerTaskId");
    register("taxTypeId");
    register("assignedEmployeeId");
    register("priority");
  }, [register]);

  const customerId = watch("customerId");
  const month = watch("month");
  const year = watch("year");
  const taxTypeId = watch("taxTypeId");
  const assignedEmployeeId = watch("assignedEmployeeId");
  const priority = watch("priority");
  const customerTaskId = watch("customerTaskId");

  useEffect(() => {
    if (isEditing) return;

    setValue("customerTaskId", 0);

    if (!customerId || !month || !year) {
      setCustomerTaskLookupError(null);
      return;
    }

    lookupAbortRef.current?.abort();
    const controller = new AbortController();
    lookupAbortRef.current = controller;
    setIsResolvingCustomerTask(true);
    setCustomerTaskLookupError(null);

    (async () => {
      try {
        const url = new URL("/api/workflow", window.location.origin);
        url.searchParams.set("customerId", String(customerId));
        url.searchParams.set("year", String(year));
        url.searchParams.set("month", String(month));

        const response = await fetch(url.toString(), { signal: controller.signal });
        if (!response.ok) {
          throw new Error("ไม่สามารถตรวจสอบงานประจำเดือนได้");
        }

        const data = await response.json();
        const matchingTask = data.tasks?.[0];

        if (matchingTask) {
          setValue("customerTaskId", matchingTask.id);
        } else {
          setValue("customerTaskId", 0);
          setCustomerTaskLookupError("ไม่พบงานประจำเดือนของลูกค้ารายนี้ในงวดที่เลือก");
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setValue("customerTaskId", 0);
        setCustomerTaskLookupError((err as Error).message);
      } finally {
        if (lookupAbortRef.current === controller) {
          setIsResolvingCustomerTask(false);
        }
      }
    })();

    return () => lookupAbortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, customerId, month, year]);

  async function onSubmit(values: TaxTaskFormValues) {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const body = isEditing
        ? {
            assignedEmployeeId: values.assignedEmployeeId ?? null,
            priority: values.priority,
            remarks: values.remarks,
          }
        : values;

      const response = await fetch(isEditing ? `/api/tax/tasks/${task!.id}` : "/api/tax/tasks", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "บันทึกงานภาษีไม่สำเร็จ");
      }

      toast({ title: isEditing ? "แก้ไขงานภาษีสำเร็จ" : "เพิ่มงานภาษีสำเร็จ", variant: "success" });
      onSaved();
    } catch (err) {
      toast({ title: "บันทึกงานภาษีไม่สำเร็จ", description: (err as Error).message, variant: "error" });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  const canSubmitCreate = isEditing || (customerTaskId > 0 && !isResolvingCustomerTask);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{isEditing ? "แก้ไขงานภาษี" : "เพิ่มงานภาษี"}</DialogTitle>
        <DialogDescription>
          {isEditing ? "แก้ไขการมอบหมาย ความสำคัญ และหมายเหตุของงานภาษีนี้" : "ระบุข้อมูลงานภาษีใหม่"}
        </DialogDescription>
      </DialogHeader>

      {isEditing ? (
        <div className="space-y-1 rounded-md border p-3 text-sm">
          <p className="font-medium">{task!.customer.companyName}</p>
          <p className="text-muted-foreground">
            {task!.taxType.code} — {task!.taxType.name} · งวด {task!.month}/{task!.year}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="tax-task-customer">ลูกค้า</Label>
            <Select
              value={customerId ? String(customerId) : undefined}
              onValueChange={(value) => setValue("customerId", value ? Number(value) : 0)}
            >
              <SelectTrigger id="tax-task-customer" className="w-full" disabled={isSubmitting}>
                <SelectValue placeholder="เลือกลูกค้า" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={String(customer.id)}>
                    {customer.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customerId ? <p className="text-xs text-destructive">{errors.customerId.message}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax-task-month">เดือน</Label>
              <Select
                value={month ? String(month) : undefined}
                onValueChange={(value) => setValue("month", value ? Number(value) : 0)}
              >
                <SelectTrigger id="tax-task-month" className="w-full" disabled={isSubmitting}>
                  <SelectValue placeholder="เลือกเดือน" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-task-year">ปี</Label>
              <Input
                id="tax-task-year"
                type="number"
                {...register("year", { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.year ? <p className="text-xs text-destructive">{errors.year.message}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax-task-type">ประเภทภาษี</Label>
            <Select
              value={taxTypeId ? String(taxTypeId) : undefined}
              onValueChange={(value) => setValue("taxTypeId", value ? Number(value) : 0)}
            >
              <SelectTrigger id="tax-task-type" className="w-full" disabled={isSubmitting}>
                <SelectValue placeholder="เลือกประเภทภาษี" />
              </SelectTrigger>
              <SelectContent>
                {taxTypes.map((taxType) => (
                  <SelectItem key={taxType.id} value={String(taxType.id)}>
                    {taxType.code} — {taxType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.taxTypeId ? <p className="text-xs text-destructive">{errors.taxTypeId.message}</p> : null}
          </div>

          <div className="text-xs">
            {isResolvingCustomerTask ? (
              <p className="text-muted-foreground">กำลังตรวจสอบงานประจำเดือน...</p>
            ) : customerTaskLookupError ? (
              <p className="text-destructive">{customerTaskLookupError}</p>
            ) : customerTaskId > 0 ? (
              <p className="text-emerald-600">พบงานประจำเดือนที่เกี่ยวข้องแล้ว</p>
            ) : null}
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="tax-task-employee">พนักงานที่รับผิดชอบ</Label>
        <Select
          value={assignedEmployeeId ? String(assignedEmployeeId) : UNASSIGNED}
          onValueChange={(value) =>
            setValue("assignedEmployeeId", value === UNASSIGNED ? undefined : Number(value))
          }
        >
          <SelectTrigger id="tax-task-employee" className="w-full" disabled={isSubmitting}>
            <SelectValue placeholder="เลือกพนักงาน" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNASSIGNED}>ไม่ระบุ</SelectItem>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={String(employee.id)}>
                {employee.firstName} {employee.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tax-task-priority">ความสำคัญ</Label>
        <Select
          value={priority}
          onValueChange={(value) => setValue("priority", value as Priority)}
        >
          <SelectTrigger id="tax-task-priority" className="w-full" disabled={isSubmitting}>
            <SelectValue placeholder="เลือกความสำคัญ" />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(TAX_TASK_PRIORITY_LABELS) as Array<[Priority, string]>).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tax-task-remarks">หมายเหตุ</Label>
        <Textarea id="tax-task-remarks" {...register("remarks")} disabled={isSubmitting} />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          ยกเลิก
        </Button>
        <Button type="submit" disabled={isSubmitting || !canSubmitCreate}>
          {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </DialogFooter>
    </form>
  );
}
