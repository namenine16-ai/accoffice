"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import EmployeeTable from "@/components/employee/EmployeeTable";
import type { EmployeeRecord } from "@/types/employee";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadEmployees() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/employees");
        if (!res.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลพนักงานได้");
        }

        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        const message = (err as Error).message;
        setError(message);
        toast({ title: "โหลดพนักงานไม่สำเร็จ", description: message, variant: "error" });
      } finally {
        setIsLoading(false);
      }
    }

    void loadEmployees();
  }, [toast]);

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`/api/employees/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const result = await res.json().catch(() => null);
          throw new Error(result?.message || "ไม่สามารถลบพนักงานได้");
        }

        toast({ title: "ลบพนักงานสำเร็จ", variant: "success" });
        void (async () => {
          const refresh = await fetch("/api/employees");
          if (refresh.ok) {
            const data = await refresh.json();
            setEmployees(data);
          }
        })();
      } catch (err) {
        const message = (err as Error).message;
        toast({ title: "ลบพนักงานไม่สำเร็จ", description: message, variant: "error" });
      }
    },
    [toast]
  );

  return (
    <main className="p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">👨‍💼 พนักงาน</h1>
          <p className="text-sm text-muted-foreground mt-1">จัดการข้อมูลพนักงานทั้งหมดจากที่นี่</p>
        </div>
        <Link href="/employees/new">
          <Button>➕ เพิ่มพนักงาน</Button>
        </Link>
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
      ) : employees.length === 0 ? (
        <EmptyState title="ยังไม่มีพนักงาน" description="เพิ่มพนักงานใหม่เพื่อเริ่มต้นการจัดการ" />
      ) : (
        <EmployeeTable employees={employees} onDeleteEmployee={handleDelete} />
      )}
    </main>
  );
}
