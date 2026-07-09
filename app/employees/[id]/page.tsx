import Link from "next/link";
import { employeeService } from "@/services/employee.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmployeeAccountPanel } from "@/components/employee/EmployeeAccountPanel";
import { EmployeeWorkloadSummary } from "@/components/employee/EmployeeWorkloadSummary";

interface EmployeeDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EmployeeDetailPage({ params }: EmployeeDetailProps) {
  const { id } = await params;
  const employee = await employeeService.getEmployeeById(Number(id));

  if (!employee) {
    return (
      <main className="p-8">
        <Card className="border border-destructive/20 bg-destructive/10 text-destructive">
          <CardContent>ไม่พบข้อมูลพนักงานที่ร้องขอ</CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            👨‍💼 {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">รายละเอียดพนักงานและข้อมูลตำแหน่ง</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/employees/edit/${employee.id}`}>
            <Button>แก้ไข</Button>
          </Link>
          <Link href="/employees">
            <Button variant="outline">กลับไป</Button>
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">ภาระงาน</h2>
        <EmployeeWorkloadSummary employeeId={employee.id} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลติดต่อ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">Email:</span> {employee.email}</p>
            <p><span className="font-medium">โทรศัพท์:</span> {employee.phone ?? "-"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลตำแหน่ง</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">ตำแหน่ง:</span> {employee.position ?? "-"}</p>
            <p><span className="font-medium">แผนก:</span> {employee.department ?? "-"}</p>
            <p>
              <span className="font-medium">สถานะ:</span>{" "}
              <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                {employee.status}
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>บัญชีผู้ใช้</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeAccountPanel employee={employee} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>การเข้างาน</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">ยังไม่เปิดใช้งานระบบบันทึกเวลาเข้า-ออกงาน</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>การลา</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">ยังไม่เปิดใช้งานระบบขอลางาน</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
