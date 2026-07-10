"use client";

import { useId, useState } from "react";
import { DocumentCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { DOCUMENT_CATEGORY_OPTIONS } from "@/components/document/DocumentFilters";
import { ALLOWED_MIME_TYPES, TAX_SUBCATEGORY_SUGGESTIONS } from "@/lib/document-config";

interface DocumentUploadDialogProps {
  customers: Array<{ id: number; companyName: string }>;
  defaultCustomerId?: number;
  onUploaded: () => void;
  triggerLabel?: string;
}

const ACCEPT_ATTRIBUTE = Object.keys(ALLOWED_MIME_TYPES).join(",");

export function DocumentUploadDialog({
  customers,
  defaultCustomerId,
  onUploaded,
  triggerLabel = "อัปโหลดเอกสาร",
}: DocumentUploadDialogProps) {
  const subCategoryListId = useId();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState<string>(defaultCustomerId ? String(defaultCustomerId) : "");
  const [category, setCategory] = useState<string>("");
  const [subCategory, setSubCategory] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setCustomerId(defaultCustomerId ? String(defaultCustomerId) : "");
    setCategory("");
    setSubCategory("");
    setNote("");
    setFile(null);
  }

  async function handleSubmit() {
    if (!file || !customerId || !category) {
      toast({ title: "กรอกข้อมูลไม่ครบ", description: "กรุณาเลือกลูกค้า หมวดหมู่ และไฟล์", variant: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("customerId", customerId);
      formData.append("category", category);
      if (subCategory.trim()) formData.append("subCategory", subCategory.trim());
      if (note.trim()) formData.append("note", note.trim());

      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "อัปโหลดเอกสารไม่สำเร็จ");
      }

      toast({ title: "อัปโหลดเอกสารสำเร็จ", variant: "success" });
      resetForm();
      setOpen(false);
      onUploaded();
    } catch (err) {
      toast({ title: "อัปโหลดเอกสารไม่สำเร็จ", description: (err as Error).message, variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const showSubCategorySuggestions = category === DocumentCategory.TAX || category === DocumentCategory.VAT;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <DialogTrigger>
        <Button>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>อัปโหลดเอกสาร</DialogTitle>
          <DialogDescription>แนบไฟล์เอกสารและระบุข้อมูลที่เกี่ยวข้อง</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="upload-customer">ลูกค้า</Label>
            <Select
              value={customerId}
              onValueChange={(value) => setCustomerId(value ?? "")}
              disabled={Boolean(defaultCustomerId)}
            >
              <SelectTrigger id="upload-customer" className="w-full">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload-category">หมวดหมู่</Label>
            <Select value={category} onValueChange={(value) => setCategory(value ?? "")}>
              <SelectTrigger id="upload-category" className="w-full">
                <SelectValue placeholder="เลือกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload-subcategory">หมวดหมู่ย่อย (ถ้ามี)</Label>
            <Input
              id="upload-subcategory"
              value={subCategory}
              onChange={(event) => setSubCategory(event.target.value)}
              placeholder="เช่น ภพ30, ภงด1"
              list={showSubCategorySuggestions ? subCategoryListId : undefined}
            />
            {showSubCategorySuggestions ? (
              <datalist id={subCategoryListId}>
                {TAX_SUBCATEGORY_SUGGESTIONS.map((suggestion) => (
                  <option key={suggestion} value={suggestion} />
                ))}
              </datalist>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload-note">หมายเหตุ (ถ้ามี)</Label>
            <Textarea
              id="upload-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="หมายเหตุเพิ่มเติม"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload-file">ไฟล์เอกสาร</Label>
            <Input
              id="upload-file"
              type="file"
              accept={ACCEPT_ATTRIBUTE}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">รองรับ PDF, JPG, PNG, Word, Excel ขนาดไม่เกิน 20MB</p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose>
            <Button variant="outline" disabled={isSubmitting}>
              ยกเลิก
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "กำลังอัปโหลด..." : "อัปโหลด"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
