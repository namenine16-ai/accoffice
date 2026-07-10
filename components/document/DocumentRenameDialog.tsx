"use client";

import { useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import type { DocumentWithRelations } from "@/types/document";

interface DocumentRenameDialogProps {
  document: DocumentWithRelations | null;
  onOpenChange: (open: boolean) => void;
  onRenamed: () => void;
}

function baseName(fileName: string, extension: string): string {
  const suffix = `.${extension}`;
  return fileName.toLowerCase().endsWith(suffix.toLowerCase()) ? fileName.slice(0, -suffix.length) : fileName;
}

export function DocumentRenameDialog({ document, onOpenChange, onRenamed }: DocumentRenameDialogProps) {
  return (
    <Dialog open={Boolean(document)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        {document ? (
          <RenameForm
            key={document.id}
            document={document}
            onCancel={() => onOpenChange(false)}
            onRenamed={() => {
              onRenamed();
              onOpenChange(false);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

interface RenameFormProps {
  document: DocumentWithRelations;
  onCancel: () => void;
  onRenamed: () => void;
}

function RenameForm({ document, onCancel, onRenamed }: RenameFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState(() => baseName(document.fileName, document.extension));
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast({ title: "กรุณาระบุชื่อไฟล์", variant: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const fileName = `${trimmed}.${document.extension}`;
      const response = await fetch(`/api/documents/${document.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "เปลี่ยนชื่อเอกสารไม่สำเร็จ");
      }

      toast({ title: "เปลี่ยนชื่อเอกสารสำเร็จ", variant: "success" });
      onRenamed();
    } catch (err) {
      toast({ title: "เปลี่ยนชื่อเอกสารไม่สำเร็จ", description: (err as Error).message, variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>เปลี่ยนชื่อเอกสาร</DialogTitle>
        <DialogDescription>ระบุชื่อไฟล์ใหม่ (นามสกุลไฟล์จะยังคงเดิม)</DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <Label htmlFor="rename-input">ชื่อไฟล์</Label>
        <div className="flex items-center gap-1.5">
          <Input
            id="rename-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSubmit();
            }}
          />
          <span className="shrink-0 text-xs text-muted-foreground">.{document.extension}</span>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          ยกเลิก
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </DialogFooter>
    </>
  );
}
