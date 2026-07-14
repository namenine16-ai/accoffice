"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { TaxCalendarFilters, type TaxCalendarFiltersState } from "@/components/tax/TaxCalendarFilters";
import { TaxCalendarSummaryCards, type TaxCalendarCounts } from "@/components/tax/TaxCalendarSummaryCards";
import { TaxCalendarTaskList } from "@/components/tax/TaxCalendarTaskList";
import type { CustomerRow } from "@/types/customer";
import type { TaxTaskRow } from "@/types/tax";
import type { EmployeeRecord } from "@/types/employee";

interface TaxCalendarSummary {
  overdue: TaxTaskRow[];
  dueToday: TaxTaskRow[];
  upcoming: TaxTaskRow[];
  completed: TaxTaskRow[];
  counts: TaxCalendarCounts;
}

const emptySummary: TaxCalendarSummary = {
  overdue: [],
  dueToday: [],
  upcoming: [],
  completed: [],
  counts: { upcoming: 0, dueToday: 0, overdue: 0, completed: 0, total: 0 },
};

const initialFilters: TaxCalendarFiltersState = {
  customerId: "all",
  assignedEmployeeId: "all",
  month: "all",
  year: "all",
  windowDays: "",
};

function buildCalendarUrl(filters: TaxCalendarFiltersState) {
  const url = new URL("/api/tax/calendar", window.location.origin);

  if (filters.customerId !== "all") url.searchParams.set("customerId", filters.customerId);
  if (filters.assignedEmployeeId !== "all") {
    url.searchParams.set("assignedEmployeeId", filters.assignedEmployeeId);
  }
  if (filters.month !== "all") url.searchParams.set("month", filters.month);
  if (filters.year !== "all") url.searchParams.set("year", filters.year);

  const parsedWindowDays = Number(filters.windowDays.trim());
  if (Number.isFinite(parsedWindowDays) && parsedWindowDays > 0) {
    url.searchParams.set("windowDays", String(parsedWindowDays));
  }

  return url;
}

export default function TaxCalendarPage() {
  const [summary, setSummary] = useState<TaxCalendarSummary>(emptySummary);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [filters, setFilters] = useState<TaxCalendarFiltersState>(initialFilters);
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
        const [summaryRes, customersRes, employeesRes] = await Promise.all([
          fetch(buildCalendarUrl(initialFilters), { signal: controller.signal }),
          fetch("/api/customers", { signal: controller.signal }),
          fetch("/api/employees", { signal: controller.signal }),
        ]);

        if (!summaryRes.ok) throw new Error("ไม่สามารถโหลดข้อมูลปฏิทินภาษีได้");
        if (!customersRes.ok) throw new Error("ไม่สามารถโหลดข้อมูลลูกค้าได้");
        if (!employeesRes.ok) throw new Error("ไม่สามารถโหลดข้อมูลพนักงานได้");

        const [summaryData, customersData, employeesData] = await Promise.all([
          summaryRes.json(),
          customersRes.json(),
          employeesRes.json(),
        ]);

        setSummary(summaryData);
        setCustomers(customersData);
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

  async function loadCalendar(activeFilters: TaxCalendarFiltersState) {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(buildCalendarUrl(activeFilters), { signal: controller.signal });

      if (!response.ok) {
        throw new Error("ไม่สามารถโหลดข้อมูลปฏิทินภาษีได้");
      }

      const data = await response.json();
      setSummary(data);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;

      const message = (err as Error).message;
      setError(message);
      toast({ title: "โหลดข้อมูลไม่สำเร็จ", description: message, variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🗓️ ปฏิทินภาษี</h1>
        <p className="text-sm text-muted-foreground mt-1">
          ภาพรวมงานภาษีที่ใกล้ครบกำหนด ครบกำหนดวันนี้ เกินกำหนด และเสร็จสิ้นแล้ว
        </p>
      </div>

      <TaxCalendarFilters
        filters={filters}
        customers={customers}
        employees={employees}
        onFiltersChange={setFilters}
        onSearch={() => void loadCalendar(filters)}
        onReset={() => {
          setFilters(initialFilters);
          void loadCalendar(initialFilters);
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
      ) : summary.overdue.length + summary.dueToday.length + summary.upcoming.length + summary.completed.length ===
        0 ? (
        <EmptyState title="ไม่มีงานภาษี" description="ไม่พบงานภาษีสำหรับตัวกรองที่เลือก" />
      ) : (
        <div className="space-y-6">
          <TaxCalendarSummaryCards counts={summary.counts} />
          <TaxCalendarTaskList
            overdue={summary.overdue}
            dueToday={summary.dueToday}
            upcoming={summary.upcoming}
            completed={summary.completed}
          />
        </div>
      )}
    </main>
  );
}
