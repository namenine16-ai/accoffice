"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  employeeCreateSchema,
  employeeUpdateSchema,
} from "@/validators/employee";
import type { z } from "zod";

type EmployeeFormValues = z.infer<typeof employeeCreateSchema>;

interface EmployeeFormProps {
  initialValues?: Partial<EmployeeFormValues>;
  employeeId?: number;
}

const defaultValues: EmployeeFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  position: "",
  department: "",
  status: "active",
};

export default function EmployeeForm({ initialValues, employeeId }: EmployeeFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const resolver = (employeeId
    ? zodResolver(employeeUpdateSchema)
    : zodResolver(employeeCreateSchema)) as Resolver<EmployeeFormValues>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver,
    defaultValues: {
      ...defaultValues,
      ...initialValues,
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        ...defaultValues,
        ...initialValues,
      });
    }
  }, [initialValues, reset]);

  async function onSubmit(data: EmployeeFormValues) {
    const apiUrl = employeeId ? `/api/employees/${employeeId}` : "/api/employees";
    const method = employeeId ? "PUT" : "POST";

    const response = await fetch(apiUrl, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => null);
      const message = result?.message || "เกิดข้อผิดพลาดในการบันทึก";
      toast({ title: "บันทึกไม่สำเร็จ", description: message, variant: "error" });
      return;
    }

    toast({ title: "บันทึกสำเร็จ", variant: "success" });
    router.push("/employees");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{employeeId ? "แก้ไขพนักงาน" : "เพิ่มพนักงาน"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">ชื่อ</Label>
              <Input id="firstName" {...register("firstName")} />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">นามสกุล</Label>
              <Input id="lastName" {...register("lastName")} />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">โทรศัพท์</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">ตำแหน่ง</Label>
              <Input id="position" {...register("position")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">แผนก</Label>
              <Input id="department" {...register("department")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">สถานะ</Label>
              <Input id="status" {...register("status")} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              บันทึก
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
