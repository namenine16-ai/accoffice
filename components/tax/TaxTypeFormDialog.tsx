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
import { useToast } from "@/components/ui/use-toast";
import { taxTypeCreateSchema, taxTypeUpdateSchema } from "@/validators/tax";
import type { TaxTypeRow } from "@/types/tax";

type TaxTypeFormValues = z.infer<typeof taxTypeCreateSchema>;

const emptyValues: TaxTypeFormValues = {
  code: "",
  name: "",
  description: "",
  isActive: true,
};

function toFormValues(taxType: TaxTypeRow): TaxTypeFormValues {
  return {
    code: taxType.code,
    name: taxType.name,
    description: taxType.description ?? "",
    isActive: taxType.isActive,
  };
}

interface TaxTypeFormDialogProps {
  open: boolean;
  taxType: TaxTypeRow | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function TaxTypeFormDialog({ open, taxType, onOpenChange, onSaved }: TaxTypeFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open ? (
          <TaxTypeForm
            key={taxType?.id ?? "create"}
            taxType={taxType}
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

interface TaxTypeFormProps {
  taxType: TaxTypeRow | null;
  onCancel: () => void;
  onSaved: () => void;
}

function TaxTypeForm({ taxType, onCancel, onSaved }: TaxTypeFormProps) {
  const { toast } = useToast();
  const isEditing = Boolean(taxType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const resolver = (isEditing
    ? zodResolver(taxTypeUpdateSchema)
    : zodResolver(taxTypeCreateSchema)) as Resolver<TaxTypeFormValues>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaxTypeFormValues>({
    resolver,
    defaultValues: taxType ? toFormValues(taxType) : emptyValues,
  });

  useEffect(() => {
    register("isActive");
  }, [register]);

  const isActive = watch("isActive");

  async function onSubmit(values: TaxTypeFormValues) {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const response = await fetch(isEditing ? `/api/tax/types/${taxType!.id}` : "/api/tax/types", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "บันทึกประเภทภาษีไม่สำเร็จ");
      }

      toast({ title: isEditing ? "แก้ไขประเภทภาษีสำเร็จ" : "เพิ่มประเภทภาษีสำเร็จ", variant: "success" });
      onSaved();
    } catch (err) {
      toast({ title: "บันทึกประเภทภาษีไม่สำเร็จ", description: (err as Error).message, variant: "error" });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{isEditing ? "แก้ไขประเภทภาษี" : "เพิ่มประเภทภาษี"}</DialogTitle>
        <DialogDescription>
          {isEditing ? "แก้ไขข้อมูลประเภทภาษีนี้" : "ระบุข้อมูลประเภทภาษีใหม่"}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <Label htmlFor="tax-type-code">รหัสประเภทภาษี</Label>
        <Input id="tax-type-code" placeholder="เช่น VAT, PND1" {...register("code")} disabled={isSubmitting} />
        {errors.code ? <p className="text-xs text-destructive">{errors.code.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tax-type-name">ชื่อประเภทภาษี</Label>
        <Input id="tax-type-name" placeholder="เช่น ภาษีมูลค่าเพิ่ม" {...register("name")} disabled={isSubmitting} />
        {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tax-type-description">คำอธิบาย</Label>
        <Textarea id="tax-type-description" {...register("description")} disabled={isSubmitting} />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="tax-type-active"
          checked={isActive}
          disabled={isSubmitting}
          onCheckedChange={(checked) => setValue("isActive", checked === true)}
        />
        <Label htmlFor="tax-type-active">เปิดใช้งาน</Label>
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
