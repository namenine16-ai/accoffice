"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { TaxTypeTable } from "@/components/tax/TaxTypeTable";
import type { TaxTypeRow } from "@/types/tax";

export default function TaxTypesPage() {
  const [taxTypes, setTaxTypes] = useState<TaxTypeRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    async function loadTaxTypes() {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/tax/types", { signal: controller.signal });

        if (!response.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลประเภทภาษีได้");
        }

        const data = await response.json();
        setTaxTypes(data);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;

        const message = (err as Error).message;
        setError(message);
        toast({ title: "โหลดข้อมูลไม่สำเร็จ", description: message, variant: "error" });
      } finally {
        setIsLoading(false);
      }
    }

    void loadTaxTypes();

    return () => abortControllerRef.current?.abort();
  }, [toast]);

  async function refreshTaxTypes() {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/tax/types", { signal: controller.signal });
      if (response.ok) {
        const data = await response.json();
        setTaxTypes(data);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
    }
  }

  async function handleDelete(id: number) {
    try {
      const response = await fetch(`/api/tax/types/${id}`, { method: "DELETE" });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "ไม่สามารถลบประเภทภาษีได้");
      }

      toast({ title: "ลบประเภทภาษีสำเร็จ", variant: "success" });
      void refreshTaxTypes();
    } catch (err) {
      const message = (err as Error).message;
      toast({ title: "ลบประเภทภาษีไม่สำเร็จ", description: message, variant: "error" });
    }
  }

  return (
    <main className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🧾 ประเภทภาษี</h1>
        <p className="text-sm text-muted-foreground mt-1">จัดการประเภทภาษีและข้อมูลหลักด้านภาษีทั้งหมด</p>
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
        <TaxTypeTable taxTypes={taxTypes} onDeleteTaxType={handleDelete} onTaxTypeChanged={refreshTaxTypes} />
      )}
    </main>
  );
}
