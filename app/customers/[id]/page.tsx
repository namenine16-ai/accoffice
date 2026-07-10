import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomerRecentDocuments } from "@/components/document/CustomerRecentDocuments";
import type { CustomerDetail } from "@/types/customer";

interface CustomerDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailProps) {
  const { id } = await params;

  const customer = (await prisma.customer.findUnique({
    where: { id: Number(id) },
  })) as CustomerDetail | null;

  if (!customer) {
    return (
      <main className="p-8">
        <Card className="border border-destructive/20 bg-destructive/10 text-destructive">
          <CardContent>ไม่พบข้อมูลลูกค้าที่ร้องขอ</CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">📋 {customer.companyName}</h1>
          <p className="text-sm text-muted-foreground mt-1">รายละเอียดลูกค้าและข้อมูลบริการ</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/customers/edit/${customer.id}`}>
            <Button>แก้ไข</Button>
          </Link>
          <Link href="/customers">
            <Button variant="outline">กลับไป</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลบริษัท</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">รหัส:</span> {customer.code}</p>
            <p><span className="font-medium">เลขผู้เสียภาษี:</span> {customer.taxId}</p>
            <p><span className="font-medium">โทรศัพท์:</span> {customer.phone ?? "-"}</p>
            <p><span className="font-medium">Email:</span> {customer.email ?? "-"}</p>
            <p><span className="font-medium">ผู้ติดต่อ:</span> {customer.contactName ?? "-"}</p>
            <p><span className="font-medium">ที่อยู่:</span> {customer.address ?? "-"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลบริการ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">ค่าบริการ:</span> {customer.serviceFee?.toLocaleString() ?? 0} บาท</p>
            <p><span className="font-medium">วันที่เริ่ม:</span> {customer.startDate ? new Date(customer.startDate).toLocaleDateString() : "-"}</p>
            <p>
              <span className="font-medium">สถานะ:</span>{" "}
              <Badge variant={customer.status === "ใช้งาน" ? "default" : "secondary"}>
                {customer.status}
              </Badge>
            </p>
            <p><span className="font-medium">ประเภทบริการ:</span> {customer.serviceType ?? "-"}</p>
            <p><span className="font-medium">หมายเหตุ:</span> {customer.note ?? "-"}</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>เอกสารล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerRecentDocuments customerId={customer.id} customerName={customer.companyName} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
