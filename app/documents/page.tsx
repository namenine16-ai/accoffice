"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import DocumentTable from "@/components/document/DocumentTable";
import {
  DocumentFilters,
  DEFAULT_DOCUMENT_FILTERS,
  type DocumentFiltersState,
} from "@/components/document/DocumentFilters";
import { DocumentUploadDialog } from "@/components/document/DocumentUploadDialog";
import type { DocumentWithRelations } from "@/types/document";
import type { CustomerRow } from "@/types/customer";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentWithRelations[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DocumentFiltersState>(DEFAULT_DOCUMENT_FILTERS);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        const [documentsRes, customersRes] = await Promise.all([fetch("/api/documents"), fetch("/api/customers")]);

        if (!documentsRes.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลเอกสารได้");
        }
        if (!customersRes.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลลูกค้าได้");
        }

        const [documentsData, customersData] = await Promise.all([documentsRes.json(), customersRes.json()]);
        setDocuments(documentsData);
        setCustomers(customersData);
      } catch (err) {
        const message = (err as Error).message;
        setError(message);
        toast({ title: "โหลดข้อมูลไม่สำเร็จ", description: message, variant: "error" });
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, [toast]);

  async function refreshDocuments() {
    const res = await fetch("/api/documents");
    if (res.ok) {
      const data = await res.json();
      setDocuments(data);
    }
  }

  const filteredDocuments = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return documents.filter((document) => {
      if (filters.category !== "all" && document.category !== filters.category) return false;
      if (filters.customerId !== "all" && String(document.customerId) !== filters.customerId) return false;
      if (query) {
        const haystack = [
          document.fileName,
          document.note ?? "",
          document.subCategory ?? "",
          document.customer.companyName,
          document.uploadedBy?.name ?? "",
          document.uploadedBy?.email ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [documents, filters]);

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const result = await res.json().catch(() => null);
        throw new Error(result?.message || "ไม่สามารถลบเอกสารได้");
      }

      toast({ title: "ลบเอกสารสำเร็จ", variant: "success" });
      void refreshDocuments();
    } catch (err) {
      const message = (err as Error).message;
      toast({ title: "ลบเอกสารไม่สำเร็จ", description: message, variant: "error" });
    }
  }

  return (
    <main className="p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">📁 เอกสาร</h1>
          <p className="text-sm text-muted-foreground mt-1">จัดการเอกสารของลูกค้าทั้งหมดจากที่นี่</p>
        </div>
        <DocumentUploadDialog customers={customers} onUploaded={refreshDocuments} />
      </div>

      {error ? (
        <ErrorState title="เกิดข้อผิดพลาด" description={error} />
      ) : isLoading ? (
        <Card>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <DocumentFilters
            filters={filters}
            customers={customers}
            onFiltersChange={setFilters}
            onReset={() => setFilters(DEFAULT_DOCUMENT_FILTERS)}
          />

          {documents.length === 0 ? (
            <EmptyState title="ยังไม่มีเอกสาร" description="อัปโหลดเอกสารใหม่เพื่อเริ่มต้นการจัดการ" />
          ) : filteredDocuments.length === 0 ? (
            <EmptyState title="ไม่พบเอกสาร" description="ลองปรับตัวกรองใหม่อีกครั้ง" />
          ) : (
            <DocumentTable
              documents={filteredDocuments}
              onDeleteDocument={handleDelete}
              onDocumentChanged={refreshDocuments}
            />
          )}
        </div>
      )}
    </main>
  );
}
