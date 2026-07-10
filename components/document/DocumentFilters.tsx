"use client";

import { DocumentCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomerRow } from "@/types/customer";

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  ACCOUNTING: "บัญชี",
  TAX: "ภาษี",
  VAT: "ภาษีมูลค่าเพิ่ม (VAT)",
  PAYROLL: "เงินเดือน",
  SOCIAL_SECURITY: "ประกันสังคม",
  FINANCIAL: "งบการเงิน",
  CONTRACT: "สัญญา",
  LICENSE: "ใบอนุญาต",
  RECEIPT: "ใบเสร็จรับเงิน",
  INVOICE: "ใบแจ้งหนี้ / ใบกำกับภาษี",
  BANK: "เอกสารธนาคาร",
  ASSET: "สินทรัพย์",
  LEGAL: "กฎหมาย",
  HR: "บุคคล / HR",
  OTHER: "อื่นๆ",
  ARCHIVE: "เอกสารจัดเก็บ",
};

export const DOCUMENT_CATEGORY_OPTIONS = Object.values(DocumentCategory).map((value) => ({
  value,
  label: DOCUMENT_CATEGORY_LABELS[value],
}));

export interface DocumentFiltersState {
  query: string;
  category: string;
  customerId: string;
}

export const DEFAULT_DOCUMENT_FILTERS: DocumentFiltersState = {
  query: "",
  category: "all",
  customerId: "all",
};

interface DocumentFiltersProps {
  filters: DocumentFiltersState;
  customers: CustomerRow[];
  onFiltersChange: (nextFilters: DocumentFiltersState) => void;
  onReset: () => void;
}

export function DocumentFilters({ filters, customers, onFiltersChange, onReset }: DocumentFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ตัวกรองเอกสาร</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">ค้นหา</label>
            <Input
              placeholder="ค้นหาชื่อไฟล์, ลูกค้า, ผู้อัปโหลด, หมายเหตุ"
              value={filters.query}
              onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">หมวดหมู่</label>
            <Select
              value={filters.category}
              onValueChange={(value) => onFiltersChange({ ...filters, category: value ?? "all" })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                {DOCUMENT_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">ลูกค้า</label>
            <Select
              value={filters.customerId}
              onValueChange={(value) => onFiltersChange({ ...filters, customerId: value ?? "all" })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกลูกค้า" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ลูกค้าทั้งหมด</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={String(customer.id)}>
                    {customer.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onReset}>
            ล้างตัวกรอง
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
