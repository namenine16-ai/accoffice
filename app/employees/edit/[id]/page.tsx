"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import EmployeeForm from "@/components/employee/EmployeeForm";
import type { EmployeeCreateInput } from "@/validators/employee";

export default function EditEmployeePage() {
  const params = useParams();
  const employeeId = params?.id ? Number(params.id) : undefined;
  const [employeeData, setEmployeeData] = useState<Partial<EmployeeCreateInput> | null>(null);
  const [isLoading, setIsLoading] = useState(employeeId !== undefined);
  const [error, setError] = useState<string | null>(
    employeeId === undefined ? "ไม่พบรหัสพนักงาน" : null
  );

  useEffect(() => {
    if (employeeId === undefined) {
      return;
    }

    const loadEmployee = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/employees/${employeeId}`);
        if (!res.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลพนักงานได้");
        }

        const data = await res.json();
        setEmployeeData(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadEmployee();
  }, [employeeId]);

  return (
    <main className="max-w-3xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">✏️ แก้ไขพนักงาน</h1>
        <p className="text-sm text-muted-foreground mt-1">
          แก้ไขข้อมูลพนักงานโดยใช้ฟอร์มเดียวกับการสร้างพนักงาน
        </p>
      </div>

      {error ? (
        <ErrorState title="ไม่สามารถโหลดพนักงาน" description={error} />
      ) : isLoading ? (
        <Card>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </CardContent>
        </Card>
      ) : employeeData ? (
        <EmployeeForm initialValues={employeeData} employeeId={employeeId} />
      ) : (
        <ErrorState
          title="ไม่พบข้อมูลพนักงาน"
          description="พนักงานที่เลือกไม่มีอยู่ในระบบ"
        />
      )}
    </main>
  );
}
