"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import CustomerForm from "@/components/customer/CustomerForm";
import type { CustomerCreateInput } from "@/validators/customer";

export default function EditCustomerPage() {
  const params = useParams();
  const customerId = params?.id ? Number(params.id) : undefined;
  const [customerData, setCustomerData] = useState<Partial<CustomerCreateInput> | null>(null);
  const [isLoading, setIsLoading] = useState(customerId !== undefined);
  const [error, setError] = useState<string | null>(
    customerId === undefined ? "ไม่พบรหัสลูกค้า" : null
  );

  useEffect(() => {
    if (customerId === undefined) {
      return;
    }

    const loadCustomer = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/customers/${customerId}`);
        if (!res.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลลูกค้าได้");
        }

        const data = await res.json();
        setCustomerData(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCustomer();
  }, [customerId]);

  return (
    <main className="max-w-3xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">✏️ แก้ไขลูกค้า</h1>
        <p className="text-sm text-muted-foreground mt-1">
          แก้ไขข้อมูลลูกค้าโดยใช้ฟอร์มเดียวกับการสร้างลูกค้า
        </p>
      </div>

      {error ? (
        <ErrorState title="ไม่สามารถโหลดลูกค้า" description={error} />
      ) : isLoading ? (
        <Card>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </CardContent>
        </Card>
      ) : customerData ? (
        <CustomerForm initialValues={customerData} customerId={customerId} />
      ) : (
        <ErrorState
          title="ไม่พบข้อมูลลูกค้า"
          description="ลูกค้าที่เลือกไม่มีอยู่ในระบบ"
        />
      )}
    </main>
  );
}
