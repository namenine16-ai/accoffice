"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { DueDateRuleTable } from "@/components/tax/DueDateRuleTable";
import type { DueDateRuleRow, TaxTypeRow } from "@/types/tax";

export default function DueDateRulesPage() {
  const [rules, setRules] = useState<DueDateRuleRow[]>([]);
  const [taxTypes, setTaxTypes] = useState<TaxTypeRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    async function loadData() {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const [rulesRes, taxTypesRes] = await Promise.all([
          fetch("/api/tax/due-date-rules", { signal: controller.signal }),
          fetch("/api/tax/types", { signal: controller.signal }),
        ]);

        if (!rulesRes.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลกฎวันครบกำหนดได้");
        }
        if (!taxTypesRes.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลประเภทภาษีได้");
        }

        const [rulesData, taxTypesData] = await Promise.all([rulesRes.json(), taxTypesRes.json()]);
        setRules(rulesData);
        setTaxTypes(taxTypesData);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;

        const message = (err as Error).message;
        setError(message);
        toast({ title: "โหลดข้อมูลไม่สำเร็จ", description: message, variant: "error" });
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();

    return () => abortControllerRef.current?.abort();
  }, [toast]);

  async function refreshRules() {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/tax/due-date-rules", { signal: controller.signal });
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
    }
  }

  async function handleDelete(id: number) {
    try {
      const response = await fetch(`/api/tax/due-date-rules/${id}`, { method: "DELETE" });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "ไม่สามารถลบกฎวันครบกำหนดได้");
      }

      toast({ title: "ลบกฎวันครบกำหนดสำเร็จ", variant: "success" });
      void refreshRules();
    } catch (err) {
      const message = (err as Error).message;
      toast({ title: "ลบกฎวันครบกำหนดไม่สำเร็จ", description: message, variant: "error" });
    }
  }

  return (
    <main className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">📅 กฎวันครบกำหนด</h1>
        <p className="text-sm text-muted-foreground mt-1">กำหนดวันครบกำหนดยื่นแบบสำหรับแต่ละประเภทภาษี</p>
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
        <DueDateRuleTable
          rules={rules}
          taxTypes={taxTypes}
          onDeleteRule={handleDelete}
          onRuleChanged={refreshRules}
        />
      )}
    </main>
  );
}
