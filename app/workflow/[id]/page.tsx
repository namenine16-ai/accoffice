import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkflowTaskDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const monthNames = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

function formatMonth(month: number) {
  return monthNames[month - 1] ?? String(month);
}

function formatDate(value: Date | null) {
  return value ? new Date(value).toLocaleDateString("th-TH") : "-";
}

function getStatusVariant(status: string) {
  if (status === "pending") {
    return "secondary";
  }

  if (status === "completed") {
    return "outline";
  }

  return "default";
}

export default async function WorkflowTaskDetailPage({ params }: WorkflowTaskDetailPageProps) {
  const { id } = await params;

  const task = await prisma.customerTask.findUnique({
    where: { id: Number(id) },
    include: {
      customer: true,
      employee: true,
    },
  });

  if (!task) {
    return (
      <main className="p-8">
        <Card className="border border-destructive/20 bg-destructive/10 text-destructive">
          <CardContent>ไม่พบงานที่ร้องขอ</CardContent>
        </Card>
      </main>
    );
  }

  const isOverdue =
    task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.status !== "completed";

  return (
    <main className="space-y-6 p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">รายละเอียดงาน {formatMonth(task.month)} {task.year}</h1>
          <p className="text-sm text-muted-foreground mt-1">ดูสถานะและความคืบหน้าของงานประจำเดือน</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/workflow">
            <Button variant="outline">กลับไปยังงาน</Button>
          </Link>
          <Link href={`/customers/${task.customer.id}`}>
            <Button>รายละเอียดลูกค้า</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>สรุปงาน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              <span className="font-medium">สถานะ:</span>{" "}
              <Badge variant={getStatusVariant(task.status)}>{task.status}</Badge>
            </p>
            <p>
              <span className="font-medium">ความคืบหน้า:</span> {task.progress}%
            </p>
            <p>
              <span className="font-medium">ความสำคัญ:</span> {task.priority}
            </p>
            <p>
              <span className="font-medium">กำหนดส่ง:</span> {formatDate(task.deadline)}
            </p>
            <p>
              <span className="font-medium">สถานะล่าช้า:</span>{" "}
              <Badge variant={isOverdue ? "destructive" : "outline"}>
                {isOverdue ? "กำหนดส่งแล้ว" : "ยังไม่ล่าช้า"}
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ลูกค้า</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{task.customer.companyName}</p>
            <p>
              <span className="font-medium">รหัสลูกค้า:</span> {task.customer.id}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ผู้รับผิดชอบ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {task.employee ? (
              <>
                <p className="font-medium">{task.employee.firstName} {task.employee.lastName}</p>
                <p>{task.employee.position ?? "ตำแหน่งไม่ระบุ"}</p>
              </>
            ) : (
              <p>ยังไม่ได้มอบหมายพนักงาน</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดเพิ่มเติม</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p>
              <span className="font-medium">หมายเหตุ:</span>
            </p>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{task.remarks ?? "ไม่มีหมายเหตุ"}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">เอกสารรับ</p>
              <p>{task.receiveDoc ? "ใช่" : "ไม่"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ภาษีมูลค่าเพิ่ม</p>
              <p>{task.vat ? "ใช่" : "ไม่"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ภงด.1</p>
              <p>{task.pnd1 ? "ใช่" : "ไม่"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ภงด.3</p>
              <p>{task.pnd3 ? "ใช่" : "ไม่"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ภงด.53</p>
              <p>{task.pnd53 ? "ใช่" : "ไม่"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ประกันสังคม</p>
              <p>{task.sso ? "ใช่" : "ไม่"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ปิดงบ</p>
              <p>{task.closing ? "ใช่" : "ไม่"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
