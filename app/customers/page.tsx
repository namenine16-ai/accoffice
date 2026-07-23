"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import CustomerTable from "@/components/customer/CustomerTable";
import { Can } from "@/components/auth/Can";
import type { CustomerRow } from "@/types/customer";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadCustomers() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/customers/list");
        if (!res.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลลูกค้าได้");
        }

        const data = await res.json();
        setCustomers(data);
      } catch (err) {
        const message = (err as Error).message;
        setError(message);
        toast({ title: "โหลดลูกค้าไม่สำเร็จ", description: message, variant: "error" });
      } finally {
        setIsLoading(false);
      }
    }

    void loadCustomers();
  }, [toast]);

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`/api/customers/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const result = await res.json().catch(() => null);
          throw new Error(result?.message || "ไม่สามารถลบลูกค้าได้");
        }

        toast({ title: "ลบลูกค้าสำเร็จ", variant: "success" });
        void (async () => {
          const refresh = await fetch("/api/customers/list");
          if (refresh.ok) {
            const data = await refresh.json();
            setCustomers(data);
          }
        })();
      } catch (err) {
        const message = (err as Error).message;
        toast({ title: "ลบลูกค้าไม่สำเร็จ", description: message, variant: "error" });
      }
    },
    [toast]
  );

  return (
    <main className="p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">👥 รายชื่อลูกค้า</h1>
          <p className="text-sm text-muted-foreground mt-1">จัดการข้อมูลลูกค้าทั้งหมดจากที่นี่</p>
        </div>
        <Can permission="customers:create">
          <Link href="/customers/new">
            <Button>➕ เพิ่มลูกค้า</Button>
          </Link>
        </Can>
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
      ) : customers.length === 0 ? (
        <EmptyState title="ยังไม่มีลูกค้า" description="เพิ่มลูกค้าใหม่เพื่อเริ่มต้นการจัดการ" />
      ) : (
        <CustomerTable customers={customers} onDeleteCustomer={handleDelete} />
      )}
    </main>
  );
}
