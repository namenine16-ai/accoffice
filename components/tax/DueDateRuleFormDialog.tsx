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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { dueDateRuleCreateSchema, dueDateRuleUpdateSchema } from "@/validators/tax";
import type { DueDateRuleRow, TaxTypeRow } from "@/types/tax";

type DueDateRuleFormValues = z.infer<typeof dueDateRuleCreateSchema>;

const emptyValues: DueDateRuleFormValues = {
  taxTypeId: 0,
  dayOfMonth: 1,
  monthOffset: 1,
  allowWeekendAdjustment: true,
  allowHolidayAdjustment: true,
  notes: "",
};

function toFormValues(rule: DueDateRuleRow): DueDateRuleFormValues {
  return {
    taxTypeId: rule.taxTypeId,
    dayOfMonth: rule.dayOfMonth,
    monthOffset: rule.monthOffset,
    allowWeekendAdjustment: rule.allowWeekendAdjustment,
    allowHolidayAdjustment: rule.allowHolidayAdjustment,
    notes: rule.notes ?? "",
  };
}

interface DueDateRuleFormDialogProps {
  open: boolean;
  rule: DueDateRuleRow | null;
  taxTypes: TaxTypeRow[];
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function DueDateRuleFormDialog({
  open,
  rule,
  taxTypes,
  onOpenChange,
  onSaved,
}: DueDateRuleFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open ? (
          <DueDateRuleForm
            key={rule?.id ?? "create"}
            rule={rule}
            taxTypes={taxTypes}
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

interface DueDateRuleFormProps {
  rule: DueDateRuleRow | null;
  taxTypes: TaxTypeRow[];
  onCancel: () => void;
  onSaved: () => void;
}

function DueDateRuleForm({ rule, taxTypes, onCancel, onSaved }: DueDateRuleFormProps) {
  const { toast } = useToast();
  const isEditing = Boolean(rule);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const resolver = (isEditing
    ? zodResolver(dueDateRuleUpdateSchema)
    : zodResolver(dueDateRuleCreateSchema)) as Resolver<DueDateRuleFormValues>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DueDateRuleFormValues>({
    resolver,
    defaultValues: rule ? toFormValues(rule) : emptyValues,
  });

  useEffect(() => {
    register("taxTypeId");
    register("allowWeekendAdjustment");
    register("allowHolidayAdjustment");
  }, [register]);

  const taxTypeId = watch("taxTypeId");
  const allowWeekendAdjustment = watch("allowWeekendAdjustment");
  const allowHolidayAdjustment = watch("allowHolidayAdjustment");

  async function onSubmit(values: DueDateRuleFormValues) {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const body = isEditing
        ? {
            dayOfMonth: values.dayOfMonth,
            monthOffset: values.monthOffset,
            allowWeekendAdjustment: values.allowWeekendAdjustment,
            allowHolidayAdjustment: values.allowHolidayAdjustment,
            notes: values.notes,
          }
        : values;

      const response = await fetch(
        isEditing ? `/api/tax/due-date-rules/${rule!.id}` : "/api/tax/due-date-rules",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "บันทึกกฎวันครบกำหนดไม่สำเร็จ");
      }

      toast({ title: isEditing ? "แก้ไขกฎวันครบกำหนดสำเร็จ" : "เพิ่มกฎวันครบกำหนดสำเร็จ", variant: "success" });
      onSaved();
    } catch (err) {
      toast({ title: "บันทึกกฎวันครบกำหนดไม่สำเร็จ", description: (err as Error).message, variant: "error" });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{isEditing ? "แก้ไขกฎวันครบกำหนด" : "เพิ่มกฎวันครบกำหนด"}</DialogTitle>
        <DialogDescription>
          {isEditing ? "แก้ไขกฎวันครบกำหนดของประเภทภาษีนี้" : "ระบุกฎวันครบกำหนดสำหรับประเภทภาษี"}
        </DialogDescription>
      </DialogHeader>

      {isEditing ? (
        <div className="space-y-2">
          <Label>ประเภทภาษี</Label>
          <p className="text-sm">
            {rule!.taxType.code} — {rule!.taxType.name}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="due-date-rule-tax-type">ประเภทภาษี</Label>
          <Select
            value={taxTypeId ? String(taxTypeId) : undefined}
            onValueChange={(value) => setValue("taxTypeId", value ? Number(value) : 0)}
          >
            <SelectTrigger id="due-date-rule-tax-type" className="w-full" disabled={isSubmitting}>
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
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="due-date-rule-day">วันที่ครบกำหนด</Label>
          <Input
            id="due-date-rule-day"
            type="number"
            min={1}
            max={31}
            {...register("dayOfMonth", { valueAsNumber: true })}
            disabled={isSubmitting}
          />
          {errors.dayOfMonth ? <p className="text-xs text-destructive">{errors.dayOfMonth.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="due-date-rule-offset">เดือนถัดจากงวด</Label>
          <Input
            id="due-date-rule-offset"
            type="number"
            min={0}
            {...register("monthOffset", { valueAsNumber: true })}
            disabled={isSubmitting}
          />
          {errors.monthOffset ? <p className="text-xs text-destructive">{errors.monthOffset.message}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="due-date-rule-weekend"
            checked={allowWeekendAdjustment}
            disabled={isSubmitting}
            onCheckedChange={(checked) => setValue("allowWeekendAdjustment", checked === true)}
          />
          <Label htmlFor="due-date-rule-weekend">เลื่อนวันครบกำหนดหากตรงกับวันหยุดสุดสัปดาห์</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="due-date-rule-holiday"
            checked={allowHolidayAdjustment}
            disabled={isSubmitting}
            onCheckedChange={(checked) => setValue("allowHolidayAdjustment", checked === true)}
          />
          <Label htmlFor="due-date-rule-holiday">เลื่อนวันครบกำหนดหากตรงกับวันหยุดนักขัตฤกษ์</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="due-date-rule-notes">หมายเหตุ</Label>
        <Textarea id="due-date-rule-notes" {...register("notes")} disabled={isSubmitting} />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          ยกเลิก
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </DialogFooter>
    </form>
  );
}
