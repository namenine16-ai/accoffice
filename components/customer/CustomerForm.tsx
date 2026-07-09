"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  customerCreateSchema,
  customerUpdateSchema,
} from "@/validators/customer";
import type { z } from "zod";

type CustomerFormValues = z.infer<typeof customerCreateSchema>;

interface CustomerFormProps {
  initialValues?: Partial<CustomerFormValues>;
  customerId?: number;
}

const defaultValues: CustomerFormValues = {
  code: "",
  companyName: "",
  taxId: "",
  businessType: "",
  companyRegisterNo: "",
  vatRegistered: false,
  vatNumber: "",
  address: "",
  province: "",
  postcode: "",
  contactName: "",
  phone: "",
  email: "",
  lineId: "",
  accountant: "",
  serviceType: "",
  accountingPeriod: "",
  serviceFee: 0,
  startDate: "",
  status: "ใช้งาน",
  note: "",
  googleDriveFolder: "",
};

export default function CustomerForm({ initialValues, customerId }: CustomerFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const resolver = (customerId
    ? zodResolver(customerUpdateSchema)
    : zodResolver(customerCreateSchema)) as Resolver<CustomerFormValues>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
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

  async function onSubmit(data: CustomerFormValues) {
    const apiUrl = customerId ? `/api/customers/${customerId}` : "/api/customers";
    const method = customerId ? "PUT" : "POST";

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
    router.push("/customers");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{customerId ? "แก้ไขลูกค้า" : "เพิ่มลูกค้า"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">รหัส</Label>
              <Input id="code" {...register("code")} />
              {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">ชื่อบริษัท</Label>
              <Input id="companyName" {...register("companyName")} />
              {errors.companyName && <p className="text-xs text-destructive">{errors.companyName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">เลขผู้เสียภาษี</Label>
              <Input id="taxId" {...register("taxId")} />
              {errors.taxId && <p className="text-xs text-destructive">{errors.taxId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">โทรศัพท์</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">สถานะ</Label>
              <Input id="status" {...register("status")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceFee">ค่าบริการ</Label>
              <Input id="serviceFee" type="number" step="0.01" {...register("serviceFee", { valueAsNumber: true })} />
              {errors.serviceFee && <p className="text-xs text-destructive">{errors.serviceFee.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">วันที่เริ่ม</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">ประเภทธุรกิจ</Label>
              <Input id="businessType" {...register("businessType")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyRegisterNo">เลขทะเบียนบริษัท</Label>
              <Input id="companyRegisterNo" {...register("companyRegisterNo")} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactName">ผู้ติดต่อ</Label>
              <Input id="contactName" {...register("contactName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountant">ผู้ดูแล</Label>
              <Input id="accountant" {...register("accountant")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceType">บริการ</Label>
              <Input id="serviceType" {...register("serviceType")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountingPeriod">รอบบัญชี</Label>
              <Input id="accountingPeriod" {...register("accountingPeriod")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">ที่อยู่</Label>
            <Textarea id="address" {...register("address")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">หมายเหตุ</Label>
            <Textarea id="note" {...register("note")} />
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
