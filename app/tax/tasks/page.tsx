"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { TaxTaskTable } from "@/components/tax/TaxTaskTable";
import { TaxTaskFilters, type TaxTaskFiltersState } from "@/components/tax/TaxTaskFilters";
import type { CustomerRow } from "@/types/customer";
import type { TaxTaskRow, TaxTypeRow } from "@/types/tax";
import type { EmployeeRecord } from "@/types/employee";

const initialFilters: TaxTaskFiltersState = {
  customerId: "all",
  taxTypeId: "all",
  assignedEmployeeId: "all",
  status: "all",
  month: "all",
  year: "all",
};

function buildTasksUrl(filters: TaxTaskFiltersState) {
  const url = new URL("/api/tax/tasks", window.location.origin);

  if (filters.customerId !== "all") url.searchParams.set("customerId", filters.customerId);
  if (filters.taxTypeId !== "all") url.searchParams.set("taxTypeId", filters.taxTypeId);
  if (filters.assignedEmployeeId !== "all") {
    url.searchParams.set("assignedEmployeeId", filters.assignedEmployeeId);
  }
  if (filters.status !== "all") url.searchParams.set("status", filters.status);
  if (filters.month !== "all") url.searchParams.set("month", filters.month);
  if (filters.year !== "all") url.searchParams.set("year", filters.year);

  return url;
}

export default function TaxTasksPage() {
  const [tasks, setTasks] = useState<TaxTaskRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [taxTypes, setTaxTypes] = useState<TaxTypeRow[]>([]);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [filters, setFilters] = useState<TaxTaskFiltersState>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const [tasksRes, customersRes, taxTypesRes, employeesRes] = await Promise.all([
          fetch(buildTasksUrl(initialFilters), { signal: controller.signal }),
          fetch("/api/customers", { signal: controller.signal }),
          fetch("/api/tax/types", { signal: controller.signal }),
          fetch("/api/employees", { signal: controller.signal }),
        ]);

        if (!tasksRes.ok) throw new Error("ไม่สามารถโหลดข้อมูลงานภาษีได้");
        if (!customersRes.ok) throw new Error("ไม่สามารถโหลดข้อมูลลูกค้าได้");
        if (!taxTypesRes.ok) throw new Error("ไม่สามารถโหลดข้อมูลประเภทภาษีได้");
        if (!employeesRes.ok) throw new Error("ไม่สามารถโหลดข้อมูลพนักงานได้");

        const [tasksData, customersData, taxTypesData, employeesData] = await Promise.all([
          tasksRes.json(),
          customersRes.json(),
          taxTypesRes.json(),
          employeesRes.json(),
        ]);

        setTasks(tasksData);
        setCustomers(customersData);
        setTaxTypes(taxTypesData);
        setEmployees(employeesData);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;

        const message = (err as Error).message;
        setError(message);
        toast({ title: "โหลดข้อมูลไม่สำเร็จ", description: message, variant: "error" });
      } finally {
        setIsLoading(false);
      }
    }

    void loadInitialData();

    return () => abortControllerRef.current?.abort();
  }, [toast]);

  const loadTasks = useCallback(
    async (activeFilters: TaxTaskFiltersState) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(buildTasksUrl(activeFilters), { signal: controller.signal });

        if (!response.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลงานภาษีได้");
        }

        const data = await response.json();
        setTasks(data);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;

        const message = (err as Error).message;
        setError(message);
        toast({ title: "โหลดข้อมูลไม่สำเร็จ", description: message, variant: "error" });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  async function refreshTasks() {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(buildTasksUrl(filters), { signal: controller.signal });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
    }
  }

  async function handleDelete(id: number) {
    try {
      const response = await fetch(`/api/tax/tasks/${id}`, { method: "DELETE" });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "ไม่สามารถลบงานภาษีได้");
      }

      toast({ title: "ลบงานภาษีสำเร็จ", variant: "success" });
      void refreshTasks();
    } catch (err) {
      const message = (err as Error).message;
      toast({ title: "ลบงานภาษีไม่สำเร็จ", description: message, variant: "error" });
    }
  }

  return (
    <main className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🗂️ งานภาษี</h1>
        <p className="text-sm text-muted-foreground mt-1">ติดตามและจัดการงานภาษีรายเดือนของลูกค้าแต่ละราย</p>
      </div>

      <TaxTaskFilters
        filters={filters}
        customers={customers}
        taxTypes={taxTypes}
        employees={employees}
        onFiltersChange={setFilters}
        onSearch={() => void loadTasks(filters)}
        onReset={() => {
          setFilters(initialFilters);
          void loadTasks(initialFilters);
        }}
      />

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
        <TaxTaskTable
          tasks={tasks}
          customers={customers}
          taxTypes={taxTypes}
          employees={employees}
          onDeleteTask={handleDelete}
          onTaskChanged={refreshTasks}
        />
      )}
    </main>
  );
}
