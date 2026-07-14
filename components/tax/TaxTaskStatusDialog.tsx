"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  TAX_TASK_ALLOWED_TRANSITIONS,
  TAX_TASK_STATUS_BADGE_VARIANT,
  TAX_TASK_STATUS_LABELS,
} from "@/components/tax/taxTaskMeta";
import type { TaxTaskRow } from "@/types/tax";
import type { TaxTaskStatus } from "@prisma/client";

interface TaxTaskStatusDialogProps {
  task: TaxTaskRow | null;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function TaxTaskStatusDialog({ task, onOpenChange, onUpdated }: TaxTaskStatusDialogProps) {
  return (
    <Dialog open={Boolean(task)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        {task ? (
          <StatusForm
            key={task.id}
            task={task}
            onCancel={() => onOpenChange(false)}
            onUpdated={() => {
              onUpdated();
              onOpenChange(false);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

interface StatusFormProps {
  task: TaxTaskRow;
  onCancel: () => void;
  onUpdated: () => void;
}

function StatusForm({ task, onCancel, onUpdated }: StatusFormProps) {
  const { toast } = useToast();
  const allowedStatuses = TAX_TASK_ALLOWED_TRANSITIONS[task.status];
  const [selectedStatus, setSelectedStatus] = useState<TaxTaskStatus | undefined>(allowedStatuses[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    isSubmittingRef.current = false;
  }, [task.id]);

  async function handleSave() {
    if (!selectedStatus || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/tax/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "เปลี่ยนสถานะไม่สำเร็จ");
      }

      toast({ title: "เปลี่ยนสถานะสำเร็จ", variant: "success" });
      onUpdated();
    } catch (err) {
      toast({ title: "เปลี่ยนสถานะไม่สำเร็จ", description: (err as Error).message, variant: "error" });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>เปลี่ยนสถานะงานภาษี</DialogTitle>
        <DialogDescription>
          {task.customer.companyName} — {task.taxType.code} ({task.month}/{task.year})
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <Label>สถานะปัจจุบัน</Label>
        <div>
          <Badge variant={TAX_TASK_STATUS_BADGE_VARIANT[task.status]}>
            {TAX_TASK_STATUS_LABELS[task.status]}
          </Badge>
        </div>
      </div>

      {allowedStatuses.length === 0 ? (
        <p className="text-sm text-muted-foreground">สถานะนี้เป็นสถานะสุดท้าย ไม่สามารถเปลี่ยนแปลงได้</p>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="tax-task-status-select">เปลี่ยนเป็น</Label>
          <Select
            value={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value as TaxTaskStatus)}
          >
            <SelectTrigger id="tax-task-status-select" className="w-full" disabled={isSubmitting}>
              <SelectValue placeholder="เลือกสถานะใหม่" />
            </SelectTrigger>
            <SelectContent>
              {allowedStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {TAX_TASK_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          ยกเลิก
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSubmitting || allowedStatuses.length === 0 || !selectedStatus}
        >
          {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </DialogFooter>
    </>
  );
}
